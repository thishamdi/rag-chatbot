'use client'

import { useState } from 'react'
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { UploadedFile } from './ChatInterface'

interface FileUploadProps {
  onFileUpload: (file: UploadedFile) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload only PDF files')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const result = await response.json()
      
      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        chunks: result.data.chunks_count,
        uploadedAt: new Date()
      }

      onFileUpload(uploadedFile)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please make sure the backend server is running.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📄 Upload Document
      </h3>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading and processing...</p>
          </div>
        ) : (
          <>
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop a PDF file here, or
            </p>
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
              <span>Choose File</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileSelect}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              PDF files only, max 10MB
            </p>
          </>
        )}
      </div>
    </div>
  )
}
