import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chatRoutes from './routes/chat.js';
import uploadRoutes from './routes/upload.js';
import { initializeLangChainRAG } from './services/langchainRAGService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/chat', chatRoutes);
app.use('/upload', uploadRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🧠 Smart RAG Chatbot API - LangChain Edition',
    version: '3.0.0',
    features: [
      'PDF Upload & Processing with LangChain',
      'Vector Search with Qdrant', 
      'LLM-powered Q&A with Groq',
      'Context-Aware Responses',
      'Source Citation',
      'HuggingFace Embeddings'
    ],
    endpoints: {
      'POST /upload': 'Upload PDF files (max 10MB)',
      'POST /chat': 'Chat with uploaded documents'
    }
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Upload PDFs: POST http://localhost:${PORT}/upload`);
  console.log(`💬 Chat: POST http://localhost:${PORT}/chat`);
  
  // Initialize LangChain RAG system
  try {
    console.log('\n🔄 Initializing LangChain RAG system...');
    await initializeLangChainRAG();
    console.log('✅ LangChain RAG system ready!\n');
  } catch (error) {
    console.error('❌ Failed to initialize LangChain RAG:', error);
  }
});

export default app;