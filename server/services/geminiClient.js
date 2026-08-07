const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiClient {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateQuestions(roleTitle, resumeText = '', difficulty = 'mid') {
    const prompt = `System: You are a technical interviewer for the role "${roleTitle}".
Candidate background (may be empty): ${resumeText}
Difficulty: ${difficulty}

Generate 7 interview questions as JSON only, no prose:
- 3 behavioral (STAR-answerable)
- 3 technical (specific to the role, referencing resume skills if present)
- 1 role-fit/motivation question

Return strictly:
{"questions":[{"id":1,"type":"behavioral|technical|fit","text":"..."}]}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // Retry with more explicit instruction
        const retryPrompt = prompt + "\n\nIMPORTANT: Return ONLY valid JSON, no additional text or formatting.";
        const retryResult = await this.model.generateContent(retryPrompt);
        const retryResponse = await retryResult.response;
        const retryText = retryResponse.text();
        
        return JSON.parse(retryText);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback questions
      return {
        questions: [
          { id: 1, type: "behavioral", text: "Tell me about a challenging project you worked on and how you handled it." },
          { id: 2, type: "behavioral", text: "Describe a time when you had to work with a difficult team member." },
          { id: 3, type: "behavioral", text: "Give me an example of when you had to learn a new technology quickly." },
          { id: 4, type: "technical", text: "Explain the difference between synchronous and asynchronous programming." },
          { id: 5, type: "technical", text: "How would you optimize a slow database query?" },
          { id: 6, type: "technical", text: "Walk me through how you would design a RESTful API." },
          { id: 7, type: "fit", text: "Why are you interested in this particular role and company?" }
        ]
      };
    }
  }

  async generateFollowUp(originalQuestion, answer, missingConcepts = []) {
    const prompt = `The candidate was asked: "${originalQuestion}"
They answered: "${answer}"
Their answer was vague or incomplete on: ${missingConcepts.join(', ')}

Generate ONE short, specific follow-up question that probes the gap.
Return: {"followup":"..."}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        return { followup: "Can you provide more specific details about your approach?" };
      }
    } catch (error) {
      console.error('Error generating follow-up:', error);
      return { followup: "Can you elaborate on that?" };
    }
  }

  async scoreTechnical(question, answer, roleTitle) {
    const prompt = `Question: "${question}"
Role: "${roleTitle}"
Candidate answer: "${answer}"

Score technical depth 0-100 based on: correctness, specificity, use of
relevant terminology, depth of reasoning. Be strict — generic answers
score low even if confidently worded.

Return strictly JSON:
{"technical_score": 0-100, "missing_concepts": ["..."], "feedback": "one sentence, specific"}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsed = JSON.parse(text);
        return {
          technical_score: Math.max(0, Math.min(100, parsed.technical_score || 50)),
          missing_concepts: parsed.missing_concepts || [],
          feedback: parsed.feedback || "Consider providing more technical details."
        };
      } catch (parseError) {
        return {
          technical_score: 50,
          missing_concepts: [],
          feedback: "Unable to assess technical depth automatically."
        };
      }
    } catch (error) {
      console.error('Error scoring technical response:', error);
      return {
        technical_score: 50,
        missing_concepts: [],
        feedback: "Technical scoring unavailable."
      };
    }
  }

  async generateSessionSummary(questionsAndAnswers, scores) {
    const dataJson = JSON.stringify({ questionsAndAnswers, scores }, null, 2);
    
    const prompt = `Here are all Q&A pairs with scores from this interview session: ${dataJson}

Summarize in strict JSON:
{"overall_score": 0-100, "strengths": ["...","..."], "improvements": ["...","..."]}
Be specific — reference actual answers, not generic advice.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsed = JSON.parse(text);
        return {
          overall_score: Math.max(0, Math.min(100, parsed.overall_score || 50)),
          strengths: parsed.strengths || ["Attempted all questions"],
          improvements: parsed.improvements || ["Practice more specific examples"]
        };
      } catch (parseError) {
        return {
          overall_score: 50,
          strengths: ["Completed the interview session"],
          improvements: ["Focus on providing more detailed responses"]
        };
      }
    } catch (error) {
      console.error('Error generating session summary:', error);
      return {
        overall_score: 50,
        strengths: ["Participated in interview practice"],
        improvements: ["Continue practicing interview skills"]
      };
    }
  }
}

module.exports = new GeminiClient();