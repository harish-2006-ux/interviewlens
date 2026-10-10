-- InterviewLens analytical schema.
-- Run after Spark writes curated CSV/Parquet data to the warehouse location.

CREATE DATABASE IF NOT EXISTS interviewlens_analytics;
USE interviewlens_analytics;

CREATE EXTERNAL TABLE IF NOT EXISTS session_analytics (
  session_id STRING,
  target_role STRING,
  difficulty STRING,
  response_count INT,
  avg_response_time_sec DOUBLE,
  avg_word_count DOUBLE,
  avg_technical_score DOUBLE,
  avg_communication_score DOUBLE,
  avg_filler_word_ratio DOUBLE,
  star_response_rate DOUBLE,
  overall_score DOUBLE
)
STORED AS PARQUET
LOCATION '${hiveconf:warehouse_root}/session_analytics';

CREATE EXTERNAL TABLE IF NOT EXISTS role_analytics (
  target_role STRING,
  session_count BIGINT,
  avg_overall_score DOUBLE,
  avg_technical_score DOUBLE,
  avg_communication_score DOUBLE,
  avg_filler_word_ratio DOUBLE
)
STORED AS PARQUET
LOCATION '${hiveconf:warehouse_root}/role_analytics';

-- Example queries used by the progress dashboard or a report.
SELECT target_role, session_count, avg_overall_score,
       avg_technical_score, avg_communication_score
FROM role_analytics
ORDER BY avg_overall_score DESC;

SELECT difficulty, COUNT(*) AS sessions,
       ROUND(AVG(overall_score), 2) AS mean_overall_score
FROM session_analytics
GROUP BY difficulty
ORDER BY difficulty;

SELECT target_role, ROUND(AVG(avg_filler_word_ratio), 4) AS mean_filler_ratio
FROM session_analytics
GROUP BY target_role
ORDER BY mean_filler_ratio DESC;
