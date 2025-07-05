// services/conversationService.js
// Simple conversation memory and context management

let conversationHistory = [];
const MAX_HISTORY = 10; // Keep last 10 exchanges

export function addToHistory(question, answer, sources = []) {
  conversationHistory.push({
    question,
    answer,
    sources,
    timestamp: new Date().toISOString()
  });
  
  // Keep only recent history
  if (conversationHistory.length > MAX_HISTORY) {
    conversationHistory = conversationHistory.slice(-MAX_HISTORY);
  }
}

export function getRecentContext(currentQuestion) {
  if (conversationHistory.length === 0) return '';
  
  // Get last 3 exchanges for context
  const recentHistory = conversationHistory.slice(-3);
  
  let context = '\nRECENT CONVERSATION:\n';
  recentHistory.forEach((exchange, index) => {
    context += `Q${index + 1}: ${exchange.question}\n`;
    context += `A${index + 1}: ${exchange.answer.substring(0, 200)}...\n\n`;
  });
  
  return context;
}

export function findRelatedQuestions(currentQuestion) {
  const currentWords = currentQuestion.toLowerCase().split(' ');
  
  return conversationHistory
    .filter(exchange => {
      const questionWords = exchange.question.toLowerCase().split(' ');
      const commonWords = currentWords.filter(word => 
        questionWords.includes(word) && word.length > 3
      );
      return commonWords.length >= 2;
    })
    .slice(-2) // Get last 2 related questions
    .map(exchange => ({
      question: exchange.question,
      answer: exchange.answer.substring(0, 150) + '...'
    }));
}
