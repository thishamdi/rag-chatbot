// services/responseService.js
// Enhanced response formatting and source management

export function formatResponse(answer, sources, queryType, relatedQuestions = []) {
  let formattedResponse = '';
  
  // Add response based on query type
  switch (queryType) {
    case 'definition':
      formattedResponse = `**Definition:**\n${answer}`;
      break;
    case 'howto':
      formattedResponse = `**How-to Guide:**\n${answer}`;
      break;
    case 'explanation':
      formattedResponse = `**Explanation:**\n${answer}`;
      break;
    case 'list':
      formattedResponse = `**List:**\n${answer}`;
      break;
    case 'comparison':
      formattedResponse = `**Comparison:**\n${answer}`;
      break;
    case 'summary':
      formattedResponse = `**Summary:**\n${answer}`;
      break;
    default:
      formattedResponse = answer;
  }
  
  // Add source information
  if (sources && sources.length > 0) {
    formattedResponse += '\n\n**Sources:**\n';
    const uniqueSources = [...new Set(sources.map(s => s.payload ? s.payload.source : s.source || s))];
    uniqueSources.forEach((source, index) => {
      formattedResponse += `${index + 1}. ${source}\n`;
    });
  }
  
  // Add related questions if available
  if (relatedQuestions && relatedQuestions.length > 0) {
    formattedResponse += '\n\n**Related from our conversation:**\n';
    relatedQuestions.forEach((related, index) => {
      formattedResponse += `• ${related.question}\n`;
    });
  }
  
  return formattedResponse;
}

export function summarizeContext(chunks) {
  if (!chunks || chunks.length === 0) return '';
  
  // Extract key information from chunks
  const allText = chunks.map(chunk => chunk.payload.text).join(' ');
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Get first and most important sentences (simple heuristic)
  const importantSentences = sentences
    .slice(0, 3) // First 3 sentences
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  return importantSentences.join('. ') + '.';
}

export function generateSystemPrompt(queryType, hasHistory = false) {
  let basePrompt = `You are a helpful AI assistant. Answer based ONLY on the provided context. If the context doesn't contain relevant information, say so clearly.

IMPORTANT RULES:
- Only use information from the PROVIDED CONTEXT
- Do not use your general knowledge
- If no relevant context is provided, say "I don't have information about this in the uploaded documents"
- Be concise but thorough
- Use clear, professional language`;

  switch (queryType) {
    case 'definition':
      basePrompt += '\n- Provide a clear, precise definition with examples if available in the context';
      break;
    case 'howto':
      basePrompt += '\n- Structure your answer as clear steps or instructions';
      break;
    case 'explanation':
      basePrompt += '\n- Explain the reasoning and provide detailed explanations';
      break;
    case 'list':
      basePrompt += '\n- Format your answer as a clear list or bullet points';
      break;
    case 'comparison':
      basePrompt += '\n- Highlight similarities and differences clearly';
      break;
    case 'summary':
      basePrompt += '\n- Provide a concise summary of the main points';
      break;
  }
  
  if (hasHistory) {
    basePrompt += '\n- Consider the conversation context but prioritize the current question';
  }
  
  return basePrompt;
}
