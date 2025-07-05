// services/groqClient.js
import axios from 'axios';
import { getSimilarChunks } from './vectorStoreService.js';
import { embedText } from './embeddingService.js';
import { enhanceQuery, classifyQuery } from './queryEnhancementService.js';
import { addToHistory, getRecentContext, findRelatedQuestions } from './conversationService.js';
import { formatResponse, generateSystemPrompt } from './responseService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🤖 Groq Config:');
console.log('API Key:', process.env.GROQ_API_KEY ? '***hidden***' : 'NOT FOUND');

export async function getAnswerWithRAG(userQuestion) {
  try {
    console.log(`🤔 Processing question: "${userQuestion}"`);
    
    // Step 1: Enhance and classify the query
    const enhancedQuery = enhanceQuery(userQuestion);
    const queryType = classifyQuery(userQuestion);
    
    console.log(`🔍 Enhanced query: "${enhancedQuery}"`);
    console.log(`📋 Query type: ${queryType}`);
    
    // Step 2: Generate embedding for enhanced query
    const queryEmbedding = await embedText(enhancedQuery);
    
    // Step 3: Search for similar chunks (get more for better context)
    const similarChunks = await getSimilarChunks(queryEmbedding, 5);
    
    console.log(`📚 Found ${similarChunks.length} relevant chunks`);
    
    // Step 4: Get conversation context
    const conversationContext = getRecentContext(userQuestion);
    const relatedQuestions = findRelatedQuestions(userQuestion);
    
    // Step 5: Prepare context with source information
    const contextWithSources = similarChunks.map((item, i) => {
      return `[Source: ${item.payload.source}] ${item.payload.text}`;
    }).join('\n\n');
    
    // Step 6: Generate smart system prompt
    const systemPrompt = generateSystemPrompt(queryType, conversationContext.length > 0);
    
    // Step 7: Construct messages for Groq
    const messages = [
      { 
        role: 'system', 
        content: systemPrompt
      },
      { 
        role: 'user', 
        content: `CONTEXT:\n${contextWithSources}\n\n${conversationContext}\n\nCURRENT QUESTION:\n${userQuestion}`
      }
    ];
    
    console.log('🚀 Sending request to Groq...');
    
    // Step 8: Get response from Groq
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages,
        temperature: 0.3, // Lower temperature for more focused answers
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const rawAnswer = response.data.choices[0].message.content;
    
    // Step 9: Format the response with smart features
    const formattedAnswer = formatResponse(
      rawAnswer, 
      similarChunks, 
      queryType, 
      relatedQuestions
    );
    
    // Step 10: Add to conversation history
    const sources = similarChunks.map(chunk => chunk.payload.source);
    addToHistory(userQuestion, rawAnswer, sources);
    
    console.log('✅ Generated enhanced answer');
    
    return formattedAnswer;
    
  } catch (error) {
    console.error('❌ Error in getAnswerWithRAG:', error);
    throw error;
  }
}