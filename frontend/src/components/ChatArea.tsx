'use client'

import { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon, DocumentTextIcon, UserIcon, CpuChipIcon, ClockIcon, CheckCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import { Message, UploadedFile } from './ChatInterface'
import FileUpload from './FileUpload'
import UploadStatus from './UploadStatus'

interface ChatAreaProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading: boolean
  uploadedFiles: UploadedFile[]
  onFileUpload: (file: UploadedFile) => void
  showMobileSidebar: boolean
  setShowMobileSidebar: (show: boolean) => void
}

export default function ChatArea({ messages, onSendMessage, isLoading, uploadedFiles, onFileUpload, showMobileSidebar, setShowMobileSidebar }: ChatAreaProps) {
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage)
      setInputMessage('')
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Mobile Upload Button - Only visible on small screens */}
      <div className="lg:hidden absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          aria-label="Open document upload"
        >
          <DocumentTextIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <CpuChipIcon className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />
            </div>
            <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">
              Welcome to Your AI Study Assistant
            </h4>
            <p className="text-gray-600 text-center max-w-md mb-6 text-sm sm:text-base px-4">
              Upload PDF documents and ask questions. I'll analyze the content and provide comprehensive answers using both your documents and my knowledge.
            </p>
            
            {/* Welcome Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg px-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <DocumentTextIcon className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-gray-800">Document Analysis</p>
                <p className="text-xs text-gray-600">Ask questions about uploaded PDFs</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <CpuChipIcon className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-sm font-medium text-gray-800">AI Knowledge</p>
                <p className="text-xs text-gray-600">Get comprehensive explanations</p>
              </div>
            </div>

            {/* Mobile Upload CTA */}
            <div className="lg:hidden mt-6">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg transform hover:scale-105"
              >
                <DocumentTextIcon className="w-5 h-5" />
                <span>Upload Your First Document</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-full">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-br from-purple-500 to-blue-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <UserIcon className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <CpuChipIcon className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`relative px-3 py-2 sm:px-4 sm:py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 rounded-bl-md shadow-sm'
                  }`}>
                    <div className="prose prose-sm max-w-none">
                      <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        message.sender === 'user' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {message.text}
                      </p>
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`flex items-center mt-1 sm:mt-2 space-x-1 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <ClockIcon className={`w-2 h-2 sm:w-3 sm:h-3 ${
                        message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs ${
                        message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-[85%]">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <CpuChipIcon className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm px-3 py-2 sm:px-4 sm:py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Modern Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message LangChain RAG Assistant..."
                className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 shadow-sm text-sm sm:text-base"
                disabled={isLoading}
                rows={1}
                style={{ minHeight: '44px', maxHeight: '200px' }}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-1 sm:right-2 bottom-1 sm:bottom-2 p-2 sm:p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
              >
                <PaperAirplaneIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
            
            {/* Input Footer */}
            <div className="flex items-center justify-center mt-1 sm:mt-2">
              <p className="text-xs text-gray-500 text-center">
                LangChain RAG can make mistakes. Consider checking important information.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
