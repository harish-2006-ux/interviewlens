-- InterviewLens legacy batch ETL example.
-- Input is the CSV export produced from response_facts.jsonl.
-- This script is optional when Spark is the preferred processor.

responses = LOAD '$INPUT' USING PigStorage(',') AS (
  response_id:chararray, session_id:chararray, user_id:chararray,
  target_role:chararray, role_title:chararray, difficulty:chararray,
  question_type:chararray, input_mode:chararray, response_time_sec:double,
  word_count:long, technical_score:double, communication_score:double,
  filler_word_ratio:double, filler_words_count:int, hedge_phrases_count:int,
  star_detected:boolean, answered_at:chararray
);

clean = FILTER responses BY session_id IS NOT NULL AND session_id != '';
projected = FOREACH clean GENERATE session_id, target_role, difficulty,
  technical_score, communication_score, filler_word_ratio, word_count,
  response_time_sec, star_detected;
grouped = GROUP projected BY (target_role, difficulty);
role_metrics = FOREACH grouped GENERATE
  FLATTEN(group) AS (target_role, difficulty),
  COUNT(projected) AS response_count,
  AVG(projected.technical_score) AS avg_technical_score,
  AVG(projected.communication_score) AS avg_communication_score,
  AVG(projected.filler_word_ratio) AS avg_filler_word_ratio,
  AVG(projected.word_count) AS avg_word_count;

STORE role_metrics INTO '$OUTPUT' USING PigStorage(',');
