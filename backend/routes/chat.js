import express from 'express';
import { getAnswerWithLangChain } from '../services/langchainRAGService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('📨 LangChain chat request:', req.body);
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    console.log('🦜 Processing with LangChain:', question);
    const result = await getAnswerWithLangChain(question);
    console.log('✅ LangChain answer generated:', result);
    
    // Return in the format expected by frontend
    res.json({ answer: result.answer });
  } catch (error) {
    console.error('❌ LangChain chat error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
});

export default router;
