#!/usr/bin/env python3
"""InterviewLens analytics job.

Spark mode: spark-submit analytics/spark/session_analytics.py --input analytics/output --output analytics/output/curated
Local mode: python3 analytics/spark/session_analytics.py --local --input analytics/fixtures --output /tmp/interviewlens-curated
"""
import argparse
import csv
import json
import os
import statistics
from collections import defaultdict
from pathlib import Path


def read_jsonl(path):
    with open(path, encoding='utf-8') as handle:
        return [json.loads(line) for line in handle if line.strip()]


def avg(values):
    values = [float(v) for v in values if v is not None]
    return round(sum(values) / len(values), 2) if values else None


def local_run(input_dir, output_dir):
    input_dir, output_dir = Path(input_dir), Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    sessions = read_jsonl(input_dir / 'session_facts.jsonl')
    responses = read_jsonl(input_dir / 'response_facts.jsonl')
    by_session = defaultdict(list)
    for row in responses:
        if row.get('session_id'):
            by_session[row['session_id']].append(row)

    session_rows = []
    for session in sessions:
        rows = by_session.get(session['session_id'], [])
        technical = [r.get('technical_score') for r in rows]
        communication = [r.get('communication_score') for r in rows]
        session_rows.append({
            'session_id': session['session_id'],
            'target_role': session.get('target_role'),
            'difficulty': session.get('difficulty'),
            'response_count': len(rows),
            'avg_response_time_sec': avg([r.get('response_time_sec') for r in rows]),
            'avg_word_count': avg([r.get('word_count') for r in rows]),
            'avg_technical_score': avg(technical),
            'avg_communication_score': avg(communication),
            'avg_filler_word_ratio': avg([r.get('filler_word_ratio') for r in rows]),
            'star_response_rate': round(sum(bool(r.get('star_detected')) for r in rows) / len(rows), 4) if rows else None,
            'overall_score': session.get('overall_score')
        })

    role_groups = defaultdict(list)
    for row in session_rows:
        if row.get('target_role'):
            role_groups[row['target_role']].append(row)
    role_rows = [{
        'target_role': role,
        'session_count': len(rows),
        'avg_overall_score': avg([r.get('overall_score') for r in rows]),
        'avg_technical_score': avg([r.get('avg_technical_score') for r in rows]),
        'avg_communication_score': avg([r.get('avg_communication_score') for r in rows]),
        'avg_filler_word_ratio': avg([r.get('avg_filler_word_ratio') for r in rows])
    } for role, rows in sorted(role_groups.items())]

    def write_csv(name, rows):
        path = output_dir / name
        if not rows:
            path.write_text('', encoding='utf-8'); return
        with open(path, 'w', newline='', encoding='utf-8') as handle:
            writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
            writer.writeheader(); writer.writerows(rows)

    write_csv('session_analytics.csv', session_rows)
    write_csv('role_analytics.csv', role_rows)
    write_csv('response_clean.csv', responses)
    (output_dir / '_SUCCESS').write_text('local fallback completed\n', encoding='utf-8')
    print(f'Local analytics wrote {len(session_rows)} session rows and {len(role_rows)} role rows to {output_dir}')


def spark_run(input_dir, output_dir):
    from pyspark.sql import SparkSession, functions as F
    spark = SparkSession.builder.appName('InterviewLensSessionAnalytics').getOrCreate()
    base = str(Path(input_dir))
    responses = spark.read.json(str(Path(base) / 'response_facts.jsonl'))
    sessions = spark.read.json(str(Path(base) / 'session_facts.jsonl'))
    response_clean = responses.withColumn('response_time_sec', F.col('response_time_sec').cast('double')) \
        .withColumn('word_count', F.col('word_count').cast('long')) \
        .withColumn('technical_score', F.col('technical_score').cast('double')) \
        .withColumn('communication_score', F.col('communication_score').cast('double'))
    response_clean.write.mode('overwrite').parquet(str(Path(output_dir) / 'response_clean'))
    aggregates = response_clean.groupBy('session_id').agg(
        F.count('*').alias('response_count'), F.avg('response_time_sec').alias('avg_response_time_sec'),
        F.avg('word_count').alias('avg_word_count'), F.avg('technical_score').alias('avg_technical_score'),
        F.avg('communication_score').alias('avg_communication_score'), F.avg('filler_word_ratio').alias('avg_filler_word_ratio'),
        F.avg(F.col('star_detected').cast('double')).alias('star_response_rate'))
    session_analytics = sessions.join(aggregates, 'session_id', 'left').select(
        'session_id', 'target_role', 'difficulty', 'response_count', 'avg_response_time_sec',
        'avg_word_count', 'avg_technical_score', 'avg_communication_score',
        'avg_filler_word_ratio', 'star_response_rate', 'overall_score')
    session_analytics.write.mode('overwrite').parquet(str(Path(output_dir) / 'session_analytics'))
    role_analytics = session_analytics.groupBy('target_role').agg(
        F.count('*').alias('session_count'), F.avg('overall_score').alias('avg_overall_score'),
        F.avg('avg_technical_score').alias('avg_technical_score'),
        F.avg('avg_communication_score').alias('avg_communication_score'),
        F.avg('avg_filler_word_ratio').alias('avg_filler_word_ratio'))
    role_analytics.write.mode('overwrite').parquet(str(Path(output_dir) / 'role_analytics'))
    role_analytics.orderBy('target_role').show(truncate=False)
    spark.stop()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--local', action='store_true')
    args = parser.parse_args()
    if args.local:
        local_run(args.input, args.output)
    else:
        spark_run(args.input, args.output)

if __name__ == '__main__':
    main()
