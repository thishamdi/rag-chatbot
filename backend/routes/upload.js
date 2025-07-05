// routes/upload.js
import express from 'express';
import multer from 'multer';
import { processPDFAndStore } from '../services/pdfService.js';

const router = express.Router();

// Configure multer for memory storage (don't save to disk)
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

// POST /upload - Upload and process PDF
router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log(`📤 Received PDF upload: ${req.file.originalname} (${req.file.size} bytes)`);

    // Process the PDF and store in vector database
    const result = await processPDFAndStore(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      message: 'PDF uploaded and processed successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    if (error.message.includes('Only PDF files are allowed')) {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    
    res.status(500).json({ 
      error: 'Failed to process PDF',
      details: error.message 
    });
  }
});

// GET /upload/status - Check upload status
router.get('/status', (req, res) => {
  res.json({
    message: 'Upload service is running',
    supported_formats: ['PDF'],
    max_file_size: '10MB'
  });
});

export default router;
