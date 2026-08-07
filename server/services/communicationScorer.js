const FILLER_WORDS = [
  "um", "uh", "like", "basically", "actually", "you know", 
  "literally", "so yeah", "kind of like", "sort of", "i mean"
];

const HEDGE_PHRASES = [
  "i think", "maybe", "sort of", "kind of", "i guess", 
  "probably", "i'm not sure but", "possibly", "perhaps",
  "it might be", "i believe", "i suppose"
];

const STAR_SIGNALS = {
  situation: ["situation", "context", "when i was", "at my previous", "during", "working on"],
  task: ["task", "goal", "needed to", "responsible for", "my job was", "had to"],
  action: ["i did", "i implemented", "i decided", "so i", "my approach", "i used"],
  result: ["result", "outcome", "impact", "led to", "improved", "reduced", "increased", "achieved"]
};

function findWordPositions(text, words) {
  const found = [];
  const lowerText = text.toLowerCase();
  
  words.forEach(word => {
    let pos = 0;
    while ((pos = lowerText.indexOf(word, pos)) !== -1) {
      found.push({ word, position: pos });
      pos += word.length;
    }
  });
  
  return found.sort((a, b) => a.position - b.position);
}

function scoreCommunication(text) {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      fillerCount: 0,
      hedgeCount: 0,
      starDetected: false,
      fillerWordsFound: [],
      hedgePhrasesFound: [],
      fillerWordRatio: 0
    };
  }

  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Find filler words and their positions
  const fillerWordsFound = findWordPositions(text, FILLER_WORDS);
  const hedgePhrasesFound = findWordPositions(text, HEDGE_PHRASES);

  const fillerCount = fillerWordsFound.length;
  const hedgeCount = hedgePhrasesFound.length;
  const fillerWordRatio = wordCount > 0 ? fillerCount / wordCount : 0;

  // Check for STAR structure
  const starHits = Object.entries(STAR_SIGNALS).filter(([category, keywords]) => 
    keywords.some(keyword => text.toLowerCase().includes(keyword))
  );
  const starDetected = starHits.length >= 3;

  // Calculate score
  let score = 100;
  
  // Penalize filler words (cap at 30 points)
  score -= Math.min(fillerWordRatio * 400, 30);
  
  // Penalize hedge phrases
  score -= hedgeCount * 5;
  
  // Bonus for STAR structure
  if (starDetected) {
    score += 10;
  }
  
  // Penalize very short answers
  if (wordCount < 20) {
    score -= 15;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    fillerCount,
    hedgeCount,
    starDetected,
    fillerWordsFound,
    hedgePhrasesFound,
    fillerWordRatio: Math.round(fillerWordRatio * 1000) / 1000
  };
}

module.exports = { scoreCommunication };