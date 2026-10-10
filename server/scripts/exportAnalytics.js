#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const Question = require('../models/Question');
const Response = require('../models/Response');
const Score = require('../models/Score');
const SessionSummary = require('../models/SessionSummary');

function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const outputDir = path.resolve(arg('--out', path.join(__dirname, '../../analytics/output')));
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI is required. Put it in server/.env or export it in the shell.');
  process.exit(1);
}

function id(value) {
  return value == null ? null : String(value);
}

function iso(value) {
  return value ? new Date(value).toISOString() : null;
}

function writeJsonl(filename, rows) {
  fs.writeFileSync(path.join(outputDir, filename), rows.map(row => JSON.stringify(row)).join('\n') + (rows.length ? '\n' : ''));
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  const [users, sessions, questions, responses, scores, summaries] = await Promise.all([
    User.find().lean(), Session.find().lean(), Question.find().lean(),
    Response.find().lean(), Score.find().lean(), SessionSummary.find().lean()
  ]);

  const userById = new Map(users.map(row => [id(row._id), row]));
  const questionById = new Map(questions.map(row => [id(row._id), row]));
  const responseById = new Map(responses.map(row => [id(row._id), row]));
  const scoreByResponseId = new Map(scores.map(row => [id(row.response_id), row]));
  const summaryBySessionId = new Map(summaries.map(row => [id(row.session_id), row]));

  const sessionFacts = sessions.map(session => {
    const user = userById.get(id(session.user_id)) || {};
    const summary = summaryBySessionId.get(id(session._id)) || {};
    return {
      session_id: id(session._id), user_id: id(session.user_id),
      target_role: user.target_role || null, difficulty: session.difficulty || null,
      started_at: iso(session.started_at), ended_at: iso(session.ended_at),
      overall_score: summary.overall_score ?? null,
      avg_technical: summary.avg_technical ?? null,
      avg_communication: summary.avg_communication ?? null,
      strengths_count: Array.isArray(summary.strengths) ? summary.strengths.length : 0,
      improvements_count: Array.isArray(summary.improvements) ? summary.improvements.length : 0,
      summary_created_at: iso(summary.created_at)
    };
  });

  const responseFacts = responses.map(response => {
    const question = questionById.get(id(response.question_id)) || {};
    const session = sessions.find(row => id(row._id) === id(question.session_id)) || {};
    const user = userById.get(id(session.user_id)) || {};
    const score = scoreByResponseId.get(id(response._id)) || {};
    const answerText = response.answer_text || '';
    return {
      response_id: id(response._id), session_id: id(session._id), user_id: id(session.user_id),
      target_role: user.target_role || null, role_title: session.role_title || null,
      difficulty: session.difficulty || null, question_type: question.question_type || null,
      input_mode: response.input_mode || null, response_time_sec: response.response_time_sec ?? null,
      word_count: answerText.trim() ? answerText.trim().split(/\s+/).length : 0,
      technical_score: score.technical_score ?? null, communication_score: score.communication_score ?? null,
      filler_word_ratio: score.filler_word_ratio ?? null,
      filler_words_count: Array.isArray(score.filler_words_found) ? score.filler_words_found.length : 0,
      hedge_phrases_count: Array.isArray(score.hedge_phrases_found) ? score.hedge_phrases_found.length : 0,
      star_detected: Boolean(score.star_detected), answered_at: iso(response.created_at)
    };
  });

  writeJsonl('session_facts.jsonl', sessionFacts);
  writeJsonl('response_facts.jsonl', responseFacts);
  fs.writeFileSync(path.join(outputDir, 'export_manifest.json'), JSON.stringify({
    exported_at: new Date().toISOString(), source: 'InterviewLens MongoDB',
    records: { users: users.length, sessions: sessions.length, questions: questions.length,
      responses: responses.length, scores: scores.length, summaries: summaries.length },
    files: ['session_facts.jsonl', 'response_facts.jsonl']
  }, null, 2) + '\n');
  console.log(`Exported ${sessionFacts.length} session facts and ${responseFacts.length} response facts to ${outputDir}`);
}

main().catch(error => { console.error('Analytics export failed:', error.message); process.exitCode = 1; })
  .finally(async () => { if (mongoose.connection.readyState) await mongoose.disconnect(); });
