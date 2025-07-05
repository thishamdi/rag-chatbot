// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chatRoutes from './routes/chat.js';
import uploadRoutes from './routes/upload.js';

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
    message: '🧠 Smart RAG Chatbot API',
    version: '2.0.0',
    features: [
      'PDF Upload & Processing',
      'Smart Query Enhancement', 
      'Conversation Memory',
      'Context-Aware Responses',
      'Source Citation',
      'Query Classification'
    ],
    endpoints: {
      'POST /upload': 'Upload PDF files (max 10MB)',
      'GET /upload/status': 'Check upload service status',
      'POST /chat': 'Chat with uploaded documents (enhanced)'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Upload PDFs: POST http://localhost:${PORT}/upload`);
  console.log(`💬 Chat: POST http://localhost:${PORT}/chat`);
});

export default app;