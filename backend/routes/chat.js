// routes/chat.js
import express from 'express';
import { getAnswerWithRAG } from '../services/groqClient.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('📨 Received request:', req.body);
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    console.log('🤔 Processing question:', question);
    const answer = await getAnswerWithRAG(question);
    console.log('✅ Generated answer:', answer);
    
    res.json({ answer });
  } catch (error) {
    console.error('❌ Chat error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;