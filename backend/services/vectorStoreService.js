// services/vectorStoreService.js
import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🔧 Qdrant Config:');
console.log('URL:', process.env.QDRANT_API_URL);
console.log('API Key:', process.env.QDRANT_API_KEY ? '***hidden***' : 'NOT FOUND');

const client = new QdrantClient({
  url: process.env.QDRANT_API_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export async function getSimilarChunks(queryEmbedding, topK = 3) {
  const results = await client.search('documents', {
    vector: queryEmbedding,
    limit: topK,
    with_payload: true,
  });
  return results;
}

export async function insertDocuments(points) {
  await client.upsert('documents', { points });
}

export async function createCollection() {
  await client.createCollection('documents', {
    vectors: { size: 384, distance: 'Cosine' },
  });
}