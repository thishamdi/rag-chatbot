// services/pdfService.js
import fs from 'fs';
import pdf from 'pdf-parse';
import { embedText } from './embeddingService.js';
import { insertDocuments } from './vectorStoreService.js';

// Function to chunk text into smaller pieces
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length < chunkSize) {
      currentChunk += sentence.trim() + '. ';
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      
      // Add overlap from previous chunk
      if (chunks.length > 0 && overlap > 0) {
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 10)); // Approximate overlap
        currentChunk = overlapWords.join(' ') + ' ' + sentence.trim() + '. ';
      } else {
        currentChunk = sentence.trim() + '. ';
      }
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Filter out very short chunks
}

// Extract text from PDF buffer using pdf-parse
export async function extractTextFromPDF(pdfBuffer) {
  try {
    console.log('📄 Starting PDF text extraction with pdf-parse...');
    
    const options = {
      // Customize page rendering if needed
      pagerender: undefined, // Use default page rendering
      max: 0, // Process all pages
      version: 'default'
    };
    
    const data = await pdf(pdfBuffer, options);
    
    console.log(`✅ Successfully extracted text from PDF:`);
    console.log(`   📑 Pages: ${data.numpages}`);
    console.log(`   📝 Characters: ${data.text.length}`);
    console.log(`   ℹ️ PDF Info:`, data.info);
    
    if (data.text.length < 50) {
      throw new Error('PDF appears to be empty, scanned, or contains very little extractable text');
    }
    
    return data.text;
    
  } catch (error) {
    console.error('❌ PDF extraction error:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file format. Please ensure the file is a valid PDF.');
    } else if (error.message.includes('Encrypted')) {
      throw new Error('PDF is password protected. Please provide an unprotected PDF.');
    } else if (error.message.includes('empty')) {
      throw new Error('PDF appears to be empty or contains only images. Text extraction requires text-based PDFs.');
    } else {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
}

// Process uploaded PDF and store in vector database
export async function processPDFAndStore(pdfBuffer, filename) {
  try {
    console.log(`📄 Processing PDF: ${filename}`);
    
    // Step 1: Extract text from PDF
    const fullText = await extractTextFromPDF(pdfBuffer);
    console.log(`📝 Extracted ${fullText.length} characters from PDF`);
    
    if (fullText.length < 100) {
      throw new Error('PDF appears to be empty or contains very little text');
    }
    
    // Step 2: Chunk the text
    const chunks = chunkText(fullText);
    console.log(`🔪 Split into ${chunks.length} chunks`);
    
    if (chunks.length === 0) {
      throw new Error('No text chunks could be created from the PDF');
    }
    
    // Step 3: Generate embeddings and prepare points for Qdrant
    const points = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`🧠 Generating embedding for chunk ${i + 1}/${chunks.length}`);
      
      const embedding = await embedText(chunk);
      
      points.push({
        id: Date.now() + i, // Simple ID generation
        vector: embedding,
        payload: {
          text: chunk,
          source: filename,
          chunk_index: i,
          created_at: new Date().toISOString()
        }
      });
    }
    
    // Step 4: Store in Qdrant
    console.log(`💾 Storing ${points.length} chunks in vector database...`);
    await insertDocuments(points);
    
    console.log(`✅ Successfully processed and stored PDF: ${filename}`);
    
    return {
      filename,
      chunks_count: chunks.length,
      total_characters: fullText.length,
      message: 'PDF processed and stored successfully'
    };
    
  } catch (error) {
    console.error(`❌ Error processing PDF ${filename}:`, error);
    throw error;
  }
}
