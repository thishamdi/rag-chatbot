
// Enhance user queries for better search results
export function enhanceQuery(originalQuery) {
  // Remove filler words and normalize
  const fillerWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can'];
  
  let enhanced = originalQuery.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(' ')
    .filter(word => word.length > 2 && !fillerWords.includes(word))
    .join(' ');

  // Add query expansion for better context
  const expansions = {
    'nodejs': 'node.js javascript runtime server',
    'ai': 'artificial intelligence machine learning',
    'rag': 'retrieval augmented generation vector search',
    'pdf': 'document file text content',
    'database': 'data storage vector qdrant',
    'api': 'endpoint service interface',
    'frontend': 'ui user interface client',
    'backend': 'server api service'
  };

  for (const [key, expansion] of Object.entries(expansions)) {
    if (enhanced.includes(key)) {
      enhanced += ' ' + expansion;
    }
  }

  return enhanced || originalQuery; // Fallback to original if enhancement fails
}

// Classify query type for better response handling
export function classifyQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('what is') || lowerQuery.includes('define') || lowerQuery.includes('explain')) {
    return 'definition';
  }
  if (lowerQuery.includes('how to') || lowerQuery.includes('how do') || lowerQuery.includes('steps')) {
    return 'howto';
  }
  if (lowerQuery.includes('why') || lowerQuery.includes('reason') || lowerQuery.includes('because')) {
    return 'explanation';
  }
  if (lowerQuery.includes('list') || lowerQuery.includes('examples') || lowerQuery.includes('types')) {
    return 'list';
  }
  if (lowerQuery.includes('compare') || lowerQuery.includes('difference') || lowerQuery.includes('vs')) {
    return 'comparison';
  }
  if (lowerQuery.includes('summarize') || lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
    return 'summary';
  }
  
  return 'general';
}

// Generate query variations for better search coverage
export function generateQueryVariations(query) {
  const variations = [query];
  
  // Add question variations
  if (!query.includes('?')) {
    variations.push(query + '?');
  }
  
  // Add different phrasings
  const rephrases = {
    'what is': ['define', 'explain', 'describe'],
    'how to': ['how do I', 'steps to', 'way to'],
    'why': ['reason for', 'cause of', 'explanation for']
  };
  
  for (const [original, alternatives] of Object.entries(rephrases)) {
    if (query.toLowerCase().includes(original)) {
      alternatives.forEach(alt => {
        variations.push(query.toLowerCase().replace(original, alt));
      });
    }
  }
  
  return variations.slice(0, 3); // Limit to 3 variations
}
