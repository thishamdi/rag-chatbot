'use client'

import { DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline'
import { UploadedFile } from './ChatInterface'

interface UploadStatusProps {
  uploadedFiles: UploadedFile[]
}

export default function UploadStatus({ uploadedFiles }: UploadStatusProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatTime = (date: Date) => {
    return date.toLocaleString()
  }

  if (uploadedFiles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Document Status
        </h3>
        <div className="text-center text-gray-500 py-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-sm">No documents uploaded yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Uploaded Documents ({uploadedFiles.length})
      </h3>
      
      <div className="space-y-3">
        {uploadedFiles.map((file, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <DocumentTextIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>{file.chunks} chunks</span>
              </div>
              <div className="mt-1 flex items-center space-x-1 text-xs text-gray-400">
                <ClockIcon className="h-3 w-3" />
                <span>{formatTime(file.uploadedAt)}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Processed
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 <strong>Tip:</strong> You can now ask questions about any of these documents!
        </p>
      </div>
    </div>
  )
}
