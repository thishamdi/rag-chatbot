// services/embeddingService.js
import { pipeline } from '@xenova/transformers';

let embedder = null;

// Initialize the embedding model (MiniLM - 384 dimensions)
async function initEmbedder() {
  if (!embedder) {
    console.log('Loading embedding model...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model loaded successfully!');
  }
  return embedder;
}

// Convert text to 384-dimensional vector
export async function embedText(text) {
  try {
    const model = await initEmbedder();
    
    // Get embeddings (returns nested arrays)
    const output = await model(text, { pooling: 'mean', normalize: true });
    
    // Convert to regular array and get 384-dimensional vector
    const embedding = Array.from(output.data);
    
    console.log(`Generated embedding for text: "${text.substring(0, 50)}..." (${embedding.length} dimensions)`);
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}