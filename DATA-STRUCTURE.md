# 📊 InterviewLens - Data Structure & Types

## Overview

InterviewLens uses **MongoDB** (NoSQL document database) to store all interview-related data. Here's a complete breakdown of the data types and structure.

---

## 🗄️ Database Collections

### 1. **Users Collection**

Stores candidate profile information.

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  name: String,                     // Full name (e.g., "John Developer")
  email: String,                    // Email (optional)
  target_role: String,              // Desired position (e.g., "Full Stack Developer")
  resume_text: String,              // Resume/background text
  created_at: Date,                 // Account creation timestamp
  sessions: [ObjectId]              // Array of session IDs (references)
}
```

**Example Data:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "target_role": "Frontend Developer",
  "resume_text": "5 years experience with React, TypeScript, and Node.js...",
  "created_at": "2026-08-04T10:30:00Z",
  "sessions": ["507f191e810c19729de860ea", "507f191e810c19729de860eb"]
}
```

---

### 2. **Sessions Collection**

Stores interview session metadata.

```javascript
{
  _id: ObjectId,                    // Session ID
  user_id: ObjectId,                // Reference to User
  role_title: String,               // Interview role
  difficulty: String,               // "junior", "mid", "senior"
  started_at: Date,                 // Session start time
  completed: Boolean,               // true/false
  completed_at: Date,               // Completion timestamp (if completed)
  questions: [ObjectId],            // Array of question IDs
  responses: [ObjectId],            // Array of response IDs
  summary_id: ObjectId              // Reference to SessionSummary
}
```

**Example Data:**
```json
{
  "_id": "507f191e810c19729de860ea",
  "user_id": "507f1f77bcf86cd799439011",
  "role_title": "Backend Engineer",
  "difficulty": "mid",
  "started_at": "2026-08-04T14:00:00Z",
  "completed": true,
  "completed_at": "2026-08-04T14:45:00Z",
  "questions": ["60d5ec49f1b2c8b1f8c1a1a1", "60d5ec49f1b2c8b1f8c1a1a2"],
  "responses": ["60d5ec49f1b2c8b1f8c1b1b1", "60d5ec49f1b2c8b1f8c1b1b2"],
  "summary_id": "60d5ec49f1b2c8b1f8c1c1c1"
}
```

---

### 3. **Questions Collection**

Stores interview questions (AI-generated or pre-defined).

```javascript
{
  _id: ObjectId,                    // Question ID
  session_id: ObjectId,             // Reference to Session
  text: String,                     // Question text
  type: String,                     // "technical", "behavioral", "fit"
  sequence_no: Number,              // Order in interview (1, 2, 3...)
  is_followup: Boolean,             // true if follow-up question
  parent_question_id: ObjectId,     // If follow-up, reference to original
  generated_by: String,             // "ai" or "predefined"
  created_at: Date                  // Creation timestamp
}
```

**Example Data:**
```json
{
  "_id": "60d5ec49f1b2c8b1f8c1a1a1",
  "session_id": "507f191e810c19729de860ea",
  "text": "Explain the difference between REST and GraphQL APIs.",
  "type": "technical",
  "sequence_no": 1,
  "is_followup": false,
  "parent_question_id": null,
  "generated_by": "ai",
  "created_at": "2026-08-04T14:01:00Z"
}
```

---

### 4. **Responses Collection**

Stores candidate answers with metadata.

```javascript
{
  _id: ObjectId,                    // Response ID
  session_id: ObjectId,             // Reference to Session
  question_id: ObjectId,            // Reference to Question
  answer_text: String,              // Candidate's answer
  input_mode: String,               // "text" or "voice"
  response_time_sec: Number,        // Time taken to answer (seconds)
  word_count: Number,               // Number of words in answer
  answered_at: Date,                // Timestamp
  score_id: ObjectId                // Reference to Score
}
```

**Example Data:**
```json
{
  "_id": "60d5ec49f1b2c8b1f8c1b1b1",
  "session_id": "507f191e810c19729de860ea",
  "question_id": "60d5ec49f1b2c8b1f8c1a1a1",
  "answer_text": "REST uses HTTP methods and resources with URLs, while GraphQL uses a single endpoint with queries...",
  "input_mode": "text",
  "response_time_sec": 120,
  "word_count": 87,
  "answered_at": "2026-08-04T14:03:00Z",
  "score_id": "60d5ec49f1b2c8b1f8c1d1d1"
}
```

---

### 5. **Scores Collection**

Stores AI-generated scoring and analysis.

```javascript
{
  _id: ObjectId,                    // Score ID
  response_id: ObjectId,            // Reference to Response
  technical_score: Number,          // 0-100 (null for behavioral)
  communication_score: Number,      // 0-100
  confidence_level: Number,         // 0-100
  filler_words_found: [             // Array of filler words detected
    {
      word: String,                 // e.g., "um", "like"
      position: Number,             // Character position in text
      count: Number                 // Occurrences
    }
  ],
  hedge_phrases_found: [            // Array of hedge phrases
    {
      phrase: String,               // e.g., "I think", "probably"
      position: Number,
      count: Number
    }
  ],
  filler_word_ratio: Number,        // Percentage (0.0 - 1.0)
  star_detected: Boolean,           // STAR method structure detected
  missing_concepts: [String],       // AI-identified gaps
  feedback: String,                 // AI-generated feedback
  scored_at: Date                   // Scoring timestamp
}
```

**Example Data:**
```json
{
  "_id": "60d5ec49f1b2c8b1f8c1d1d1",
  "response_id": "60d5ec49f1b2c8b1f8c1b1b1",
  "technical_score": 85,
  "communication_score": 72,
  "confidence_level": 78,
  "filler_words_found": [
    { "word": "um", "position": 47, "count": 2 },
    { "word": "like", "position": 134, "count": 1 }
  ],
  "hedge_phrases_found": [
    { "phrase": "I think", "position": 89, "count": 1 }
  ],
  "filler_word_ratio": 0.034,
  "star_detected": false,
  "missing_concepts": ["Rate limiting", "Caching strategies"],
  "feedback": "Good technical understanding. Consider being more specific about GraphQL advantages.",
  "scored_at": "2026-08-04T14:03:15Z"
}
```

---

### 6. **SessionSummaries Collection**

Stores overall session analysis and recommendations.

```javascript
{
  _id: ObjectId,                    // Summary ID
  session_id: ObjectId,             // Reference to Session
  overall_score: Number,            // 0-100 (weighted average)
  avg_technical: Number,            // Average technical score
  avg_communication: Number,        // Average communication score
  total_questions: Number,          // Number of questions asked
  total_time_sec: Number,           // Total session time
  strengths: [String],              // Array of identified strengths
  improvements: [String],           // Array of improvement areas
  detailed_scores: [                // Per-question breakdown
    {
      question_id: ObjectId,
      question: String,
      answer: String,
      type: String,
      technical_score: Number,
      communication_score: Number,
      feedback: String
    }
  ],
  generated_at: Date                // Summary creation timestamp
}
```

**Example Data:**
```json
{
  "_id": "60d5ec49f1b2c8b1f8c1c1c1",
  "session_id": "507f191e810c19729de860ea",
  "overall_score": 76,
  "avg_technical": 82,
  "avg_communication": 70,
  "total_questions": 7,
  "total_time_sec": 2700,
  "strengths": [
    "Strong technical knowledge of REST and GraphQL",
    "Good use of specific examples",
    "Clear explanation of complex concepts"
  ],
  "improvements": [
    "Reduce filler words like 'um' and 'like'",
    "Use more confident language",
    "Structure behavioral answers with STAR method"
  ],
  "detailed_scores": [
    {
      "question_id": "60d5ec49f1b2c8b1f8c1a1a1",
      "question": "Explain the difference between REST and GraphQL APIs.",
      "answer": "REST uses HTTP methods...",
      "type": "technical",
      "technical_score": 85,
      "communication_score": 72,
      "feedback": "Good technical understanding..."
    }
  ],
  "generated_at": "2026-08-04T14:45:30Z"
}
```

---

## 📈 Data Flow

### Interview Session Flow:

```
1. USER CREATION
   ↓
   User document created with profile info

2. SESSION START
   ↓
   Session document created
   ↓
   AI generates Questions (stored in Questions collection)

3. ANSWER SUBMISSION
   ↓
   Response document created with answer text
   ↓
   AI analyzes answer → Score document created
   ↓
   Optional: Follow-up Question generated if needed

4. SESSION COMPLETION
   ↓
   SessionSummary document created
   ↓
   Overall analysis with strengths/improvements

5. DASHBOARD VIEW
   ↓
   Aggregate data from multiple sessions
   ↓
   Display progress trends over time
```

---

## 🔢 Data Types Summary

### **MongoDB Data Types Used:**

| Type | Usage | Examples |
|------|-------|----------|
| `ObjectId` | Unique identifiers | `507f1f77bcf86cd799439011` |
| `String` | Text data | Names, questions, answers, feedback |
| `Number` | Scores, counts, time | `85`, `120`, `0.034` |
| `Boolean` | True/false flags | `completed: true`, `star_detected: false` |
| `Date` | Timestamps | `2026-08-04T14:00:00Z` |
| `Array` | Lists of items | Questions, responses, filler words |
| `Object` | Nested structures | Filler words with position/count |

### **Relationships:**

```
User (1) ──→ (Many) Sessions
Session (1) ──→ (Many) Questions
Session (1) ──→ (Many) Responses
Session (1) ──→ (1) SessionSummary
Question (1) ──→ (1) Response
Response (1) ──→ (1) Score
```

---

## 💾 Storage Estimates

### **Average Data Sizes:**

- **User**: ~500 bytes
- **Session**: ~300 bytes (+ references)
- **Question**: ~200 bytes
- **Response**: ~1-5 KB (depending on answer length)
- **Score**: ~500 bytes
- **SessionSummary**: ~2-3 KB

### **Storage per Session:**

```
1 Session = 
  1 User (500B) +
  1 Session doc (300B) +
  7 Questions (1.4KB) +
  7 Responses (7-35KB) +
  7 Scores (3.5KB) +
  1 Summary (3KB)
  
= ~15-43 KB per interview session
```

### **MongoDB Free Tier (512 MB):**
- Can store: **~10,000 - 30,000 interview sessions**
- More than enough for MVP and initial growth!

---

## 🔐 Data Privacy & Security

### **Personal Data Stored:**
- ✅ Name
- ✅ Email (optional)
- ✅ Resume text
- ✅ Interview answers
- ✅ Performance scores

### **Not Stored:**
- ❌ Video recordings
- ❌ Audio recordings
- ❌ Payment information
- ❌ Social security numbers
- ❌ Sensitive personal identifiers

### **Security Measures:**
- ✅ MongoDB connection encrypted (TLS/SSL)
- ✅ Environment variables for credentials
- ✅ No sensitive data in logs
- ✅ CORS protection on API
- ✅ Input validation on all endpoints

---

## 📊 Analytics Data

### **Metrics We Track:**

1. **User Progress**
   - Total sessions completed
   - Average scores over time
   - Improvement trends

2. **Performance Metrics**
   - Technical depth scores
   - Communication scores
   - Response times
   - Filler word ratios

3. **Question Analysis**
   - Question types distribution
   - Difficulty levels
   - Success rates per question type

4. **Session Metadata**
   - Session duration
   - Question count
   - Completion rates

---

## 🔄 Data Access Patterns

### **Common Queries:**

```javascript
// Get user dashboard
db.users.aggregate([
  { $match: { _id: userId } },
  { $lookup: { from: 'sessions', localField: 'sessions', foreignField: '_id' } },
  { $unwind: '$sessions' },
  { $lookup: { from: 'session_summaries', localField: 'sessions.summary_id', foreignField: '_id' } }
])

// Get session details
db.sessions.findOne({ _id: sessionId })
  .populate('questions')
  .populate('responses')
  .populate('summary_id')

// Track progress over time
db.session_summaries.find({ 
  session_id: { $in: userSessionIds } 
})
  .sort({ generated_at: 1 })
  .select('overall_score avg_technical avg_communication generated_at')
```

---

## 🎯 Data Validation

### **Mongoose Schema Validation:**

```javascript
// Example: Score validation
{
  technical_score: { 
    type: Number, 
    min: 0, 
    max: 100,
    validate: {
      validator: Number.isInteger,
      message: 'Score must be an integer'
    }
  },
  communication_score: { 
    type: Number, 
    required: true,
    min: 0, 
    max: 100 
  },
  filler_word_ratio: {
    type: Number,
    min: 0.0,
    max: 1.0
  }
}
```

---

## 📋 Summary

**InterviewLens uses:**
- **6 MongoDB Collections**: Users, Sessions, Questions, Responses, Scores, SessionSummaries
- **Primary Data Types**: ObjectId, String, Number, Boolean, Date, Arrays, Objects
- **Relationships**: One-to-Many and One-to-One using references
- **Storage**: ~15-43 KB per interview session
- **Capacity**: 10,000+ sessions on free tier
- **Security**: Encrypted connections, env variables, CORS protection

**All data is structured to support:**
- Real-time interview analysis
- Progress tracking over time
- Detailed performance feedback
- Dashboard analytics
- AI-powered question generation and scoring

---

Need to see the actual MongoDB schema code? Check:
- `server/models/User.js`
- `server/models/Session.js`
- `server/models/Question.js`
- `server/models/Response.js`
- `server/models/Score.js`
