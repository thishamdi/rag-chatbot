'use client'

import { useState } from 'react'
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
    addMessage(`📁 Uploaded: ${file.name} (${file.chunks} chunks processed)`, 'assistant')
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
      addMessage(data.answer, 'assistant')
    } catch (error) {
      console.error('Error sending message:', error)
      addMessage('❌ Sorry, I encountered an error. Please make sure the backend server is running on http://localhost:3001', 'assistant')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - File Upload */}
        <div className="lg:col-span-1">
          <FileUpload onFileUpload={handleFileUpload} />
          <UploadStatus uploadedFiles={uploadedFiles} />
        </div>

        {/* Right side - Chat */}
        <div className="lg:col-span-2">
          <ChatArea 
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
