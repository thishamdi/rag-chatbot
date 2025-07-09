'use client'

import { useState } from 'react'
import { DocumentArrowUpIcon, CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { UploadedFile } from './ChatInterface'

interface FileUploadProps {
  onFileUpload: (file: UploadedFile) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setUploadStatus('error')
      setTimeout(() => setUploadStatus('idle'), 3000)
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadStatus('error')
      setTimeout(() => setUploadStatus('idle'), 3000)
      return
    }

    setIsUploading(true)
    setUploadStatus('idle')

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
      setUploadStatus('success')
      setTimeout(() => setUploadStatus('idle'), 3000)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setTimeout(() => setUploadStatus('idle'), 3000)
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

  const getStatusIcon = () => {
    if (isUploading) return null
    if (uploadStatus === 'success') return <CheckCircleIcon className="w-6 h-6 text-green-500" />
    if (uploadStatus === 'error') return <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
    return <CloudArrowUpIcon className="w-8 h-8 text-gray-400" />
  }

  const getStatusMessage = () => {
    if (uploadStatus === 'success') return 'Document uploaded successfully!'
    if (uploadStatus === 'error') return 'Upload failed. Please check file type and size.'
    return 'Drag and drop your PDF document here'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <DocumentArrowUpIcon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Upload Document</h3>
            <p className="text-xs text-gray-600">Add PDFs to your knowledge base</p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="p-4">
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : uploadStatus === 'success'
              ? 'border-green-300 bg-green-50'
              : uploadStatus === 'error'
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-600">Processing...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                {getStatusIcon()}
              </div>
              
              <div>
                <p className={`text-sm font-medium ${
                  uploadStatus === 'success' ? 'text-green-700' :
                  uploadStatus === 'error' ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {getStatusMessage()}
                </p>
                
                {uploadStatus === 'idle' && (
                  <p className="text-xs text-gray-500 mt-1">
                    or click to browse files
                  </p>
                )}
              </div>

              {uploadStatus === 'idle' && (
                <label className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 cursor-pointer transition-all duration-200 text-sm font-medium">
                  <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                  <span>Choose PDF File</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileSelect}
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Compact File Requirements */}
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center justify-between">
              <span>PDF format only</span>
              <span>Max 10MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
