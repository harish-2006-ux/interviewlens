# InterviewLens analytics pipeline

This pipeline keeps **MongoDB/Mongoose** as the operational store and creates an analytics path for historical interview data:

```text
MongoDB -> exportAnalytics.js -> JSONL snapshot -> Spark/PySpark -> curated Parquet
                                                    |              |
                                                    +-> Hive tables + reports
                                                    +-> Pig legacy batch ETL
```

## 1. Export from MongoDB

Set `MONGODB_URI` in `server/.env` or the shell, then run:

```bash
npm run analytics:export
```

The exporter joins users, sessions, questions, responses, scores, and session summaries into:

- `analytics/output/session_facts.jsonl`
- `analytics/output/response_facts.jsonl`
- `analytics/output/export_manifest.json`

Use `mongosh` only for administration and verification, not from the public API:

```bash
mongosh "$MONGODB_URI" --eval 'db.runCommand({ ping: 1 })'
```

## 2. Run Spark/PySpark

With Spark installed:

```bash
spark-submit analytics/spark/session_analytics.py \
  --input analytics/output \
  --output analytics/output/curated
```

The job writes `response_clean`, `session_analytics`, and `role_analytics` as Parquet datasets.

For local validation without Spark:

```bash
python3 analytics/spark/session_analytics.py --local \
  --input analytics/fixtures \
  --output analytics/output/local-curated
```

## 3. Create/query Hive tables

After Spark writes Parquet, substitute the warehouse path and run:

```bash
hive --hiveconf warehouse_root=/path/to/analytics/output/curated \
  -f analytics/hive/interviewlens_analytics.sql
```

## 4. Optional Pig ETL

Pig is included as a legacy batch-ETL alternative. Convert `response_facts.jsonl` to a CSV with the same column order as the schema in `analytics/pig/session_metrics.pig`, then run:

```bash
pig -param INPUT=/path/response_facts.csv \
    -param OUTPUT=/path/pig-role-metrics \
    analytics/pig/session_metrics.pig
```

Spark is the preferred processor for new work; Pig is retained for compatibility and coursework demonstrations.

## Data and safety notes

- Do not commit `.env`, passwords, Atlas URIs, or API keys.
- Exports may contain personal and interview information; store them with restricted permissions.
- The MongoDB exporter reads data only; it does not mutate operational collections.
- Hive, Spark, and Pig results must be labelled as analytics outputs and traced to an export manifest.
