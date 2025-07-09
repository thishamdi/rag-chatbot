'use client'

import { useState, useEffect } from 'react'
import FileUpload from './FileUpload'
import ChatArea from './ChatArea'
import UploadStatus from './UploadStatus'

export interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

export interface UploadedFile {
  name: string
  size: number
  chunks: number
  uploadedAt: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const addMessage = (text: string, sender: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleFileUpload = async (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file])
    addMessage(`📁 Uploaded: ${file.name} (${file.chunks} chunks processed with LangChain)`, 'assistant')
  }

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return
    
    // Add user message
    addMessage(messageText, 'user')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: messageText })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const sourceInfo = '\n\n🦜 **Powered by LangChain RAG** | Groq LLaMA 3.1 70B + Qdrant Vector Store'
      
      addMessage(data.answer + sourceInfo, 'assistant')
    } catch (error) {
      console.error('Error sending message:', error)
      addMessage('❌ Sorry, I encountered an error. Please make sure the backend server is running on http://localhost:3001\n\n🦜 **LangChain RAG Service**', 'assistant')
    } finally {
      setIsLoading(false)
    }
  }

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (showMobileSidebar) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showMobileSidebar])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Full Width Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🦜</span>
                </div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">LangChain RAG Assistant</h1>
              </div>
              <div className="md:hidden">
                <h1 className="text-lg font-semibold text-gray-900">RAG Assistant</h1>
              </div>
            </div>
            
            {/* Status Pills */}
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="hidden lg:inline">Groq LLaMA 3.1</span>
                  <span className="lg:hidden">Online</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="hidden lg:inline">Qdrant Vector DB</span>
                  <span className="lg:hidden">Ready</span>
                </div>
              </div>
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setShowMobileSidebar(true)}
                className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
                aria-label="Open document upload menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className={`flex-1 p-4 space-y-3 ${uploadedFiles.length > 3 ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scroll-smooth' : ''}`}>
              <FileUpload onFileUpload={handleFileUpload} />
              <UploadStatus uploadedFiles={uploadedFiles} />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
              className={`fixed inset-0 bg-black transition-opacity duration-300 ${showMobileSidebar ? 'bg-opacity-50' : 'bg-opacity-0'}`}
              onClick={() => setShowMobileSidebar(false)}
            ></div>
            
            {/* Fullscreen Sidebar */}
            <div className={`fixed inset-0 bg-white transform transition-transform duration-300 ease-in-out ${
              showMobileSidebar ? 'translate-x-0' : 'translate-x-full'
            }`}>
              {/* Mobile Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🦜</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Upload Documents</h2>
                </div>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Mobile Sidebar Content */}
              <div className={`flex-1 p-4 space-y-3 ${uploadedFiles.length > 3 ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scroll-smooth' : ''}`}>
                <FileUpload onFileUpload={handleFileUpload} />
                <UploadStatus uploadedFiles={uploadedFiles} />
              </div>
            </div>
          </div>
        )}

        {/* Chat Area - Full width on mobile */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatArea 
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            showMobileSidebar={showMobileSidebar}
            setShowMobileSidebar={setShowMobileSidebar}
          />
        </div>
      </div>
    </div>
  )
}
