import express from 'express';
import multer from 'multer';
import { processAndStorePDF } from '../services/langchainRAGService.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// POST /langchain/upload - Upload and process PDF with LangChain
router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log(`📤 LangChain PDF upload: ${req.file.originalname} (${req.file.size} bytes)`);

    // Process the PDF with LangChain and store in vector database
    const result = await processAndStorePDF(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      message: 'PDF uploaded and processed successfully with LangChain',
      data: result
    });

  } catch (error) {
    console.error('❌ LangChain upload error:', error);
    
    if (error.message.includes('Only PDF files are allowed')) {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    
    res.status(500).json({ 
      error: 'Failed to process PDF with LangChain',
      details: error.message 
    });
  }
});

// GET /langchain/upload/status - Check LangChain upload status
router.get('/status', (req, res) => {
  res.json({
    message: 'LangChain upload service is running',
    supported_formats: ['PDF'],
    max_file_size: '10MB',
    processing_method: 'LangChain PDFLoader + RecursiveCharacterTextSplitter',
    vector_store: 'Qdrant',
    embeddings: 'HuggingFace MiniLM-L6-v2'
  });
});

export default router;
