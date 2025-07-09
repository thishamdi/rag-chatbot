import { ChatGroq } from "@langchain/groq";
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "@langchain/core/prompts";
import { QdrantClient } from "@qdrant/js-client-rest";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize LangChain components
let vectorStore = null;
let llm = null;
let embeddings = null;
let retriever = null;
let ragChain = null;

console.log('🦜 LangChain RAG Service Initializing...');

// Initialize embeddings model
async function initializeEmbeddings() {
  if (!embeddings) {
    console.log('📊 Initializing HuggingFace embeddings...');
    embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: "Xenova/all-MiniLM-L6-v2",
    });
    console.log('✅ Embeddings initialized');
  }
  return embeddings;
}

// Initialize Groq LLM
async function initializeLLM() {
  if (!llm) {
    console.log('🤖 Initializing Groq LLM...');
    llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama3-70b-8192",
      temperature: 0.3,
      maxTokens: 1000,
    });
    console.log('✅ Groq LLM initialized');
  }
  return llm;
}

// Initialize Qdrant vector store
async function initializeVectorStore() {
  if (!vectorStore) {
    console.log('🔍 Initializing Qdrant vector store...');
    const embeddings = await initializeEmbeddings();
    
    const client = new QdrantClient({
      url: process.env.QDRANT_API_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });

    vectorStore = new QdrantVectorStore(embeddings, {
      client,
      collectionName: "documents",
    });
    console.log('✅ Vector store initialized');
  }
  return vectorStore;
}

// Initialize retriever
async function initializeRetriever() {
  if (!retriever) {
    console.log('🔄 Initializing retriever...');
    const vectorStore = await initializeVectorStore();
    retriever = vectorStore.asRetriever({
      k: 5, // Return top 5 most similar chunks
    });
    console.log('✅ Retriever initialized');
  }
  return retriever;
}

// Create custom prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful AI assistant that answers questions using both the provided context from uploaded documents AND your general knowledge.

IMPORTANT RULES:
- FIRST, check if the PROVIDED CONTEXT below contains relevant information
- If context is relevant, use it as your PRIMARY source and cite it
- You can SUPPLEMENT with your general knowledge to provide a complete, helpful response
- If the context doesn't contain relevant information, use your general knowledge but mention this clearly
- Be comprehensive, educational, and helpful
- Always cite sources when using the provided context

PROVIDED CONTEXT FROM UPLOADED DOCUMENTS:
{context}

QUESTION: {question}

COMPREHENSIVE ANSWER:`);

// Initialize RAG chain
async function initializeRAGChain() {
  if (!ragChain) {
    console.log('⛓️ Initializing RAG chain...');
    
    const retriever = await initializeRetriever();
    const llm = await initializeLLM();
    
    // Create the RAG chain using LangChain's new syntax
    ragChain = RunnableSequence.from([
      {
        context: async (input) => {
          const docs = await retriever.getRelevantDocuments(input.question);
          return docs.map(doc => `[Source: ${doc.metadata.source}] ${doc.pageContent}`).join("\\n\\n");
        },
        question: (input) => input.question,
      },
      promptTemplate,
      llm,
      new StringOutputParser(),
    ]);
    
    console.log('✅ RAG chain initialized');
  }
  return ragChain;
}

// Process PDF and add to vector store
export async function processAndStorePDF(pdfBuffer, filename) {
  try {
    console.log(`📄 Processing PDF with LangChain: ${filename}`);
    
    // Save buffer to temporary file
    const tempPath = path.join(__dirname, '..', 'temp', filename);
    await fs.promises.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.promises.writeFile(tempPath, pdfBuffer);
    
    // Load PDF using LangChain PDFLoader
    const loader = new PDFLoader(tempPath);
    const docs = await loader.load();
    
    console.log(`📚 Loaded ${docs.length} pages from PDF`);
    
    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`🔪 Split into ${splitDocs.length} chunks`);
    
    // Add metadata
    splitDocs.forEach((doc, index) => {
      doc.metadata = {
        ...doc.metadata,
        source: filename,
        chunk_index: index,
        created_at: new Date().toISOString(),
      };
    });
    
    // Add to vector store
    const vectorStore = await initializeVectorStore();
    await vectorStore.addDocuments(splitDocs);
    
    // Clean up temp file
    await fs.promises.unlink(tempPath);
    
    console.log(`✅ Successfully processed and stored PDF: ${filename}`);
    
    return {
      filename,
      chunks_count: splitDocs.length,
      total_characters: splitDocs.reduce((acc, doc) => acc + doc.pageContent.length, 0),
      message: 'PDF processed and stored successfully with LangChain'
    };
    
  } catch (error) {
    console.error(`❌ Error processing PDF ${filename}:`, error);
    throw error;
  }
}

// Answer questions using LangChain RAG
export async function getAnswerWithLangChain(question) {
  try {
    console.log(`🤔 Processing question with LangChain: "${question}"`);
    
    // Initialize RAG chain
    const chain = await initializeRAGChain();
    
    // Get answer
    const answer = await chain.invoke({ question });
    
    console.log('✅ Generated LangChain answer');
    
    return {
      answer,
      source: 'LangChain RAG Pipeline',
      model: 'Groq LLaMA 3.1 70B',
      retrieval_method: 'Qdrant Vector Search',
      embeddings: 'HuggingFace MiniLM-L6-v2'
    };
    
  } catch (error) {
    console.error('❌ Error in LangChain RAG:', error);
    throw error;
  }
}

// Initialize all components
export async function initializeLangChainRAG() {
  try {
    console.log('🚀 Initializing complete LangChain RAG system...');
    
    await initializeEmbeddings();
    await initializeLLM();
    await initializeVectorStore();
    await initializeRetriever();
    await initializeRAGChain();
    
    console.log('✅ LangChain RAG system fully initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize LangChain RAG:', error);
    throw error;
  }
}
