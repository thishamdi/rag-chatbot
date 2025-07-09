'use client'

import { DocumentTextIcon, ClockIcon, FolderIcon, CheckBadgeIcon, ChartBarIcon } from '@heroicons/react/24/outline'
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
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getTotalStats = () => {
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0)
    const totalChunks = uploadedFiles.reduce((sum, file) => sum + file.chunks, 0)
    return { totalSize, totalChunks }
  }

  const { totalSize, totalChunks } = getTotalStats()

  if (uploadedFiles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FolderIcon className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Knowledge Base</h3>
              <p className="text-xs text-gray-600">Your uploaded documents</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <DocumentTextIcon className="w-5 h-5 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">No documents yet</h4>
          <p className="text-xs text-gray-600">Upload your first PDF to start</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Stats */}
      <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckBadgeIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Knowledge Base</h3>
              <p className="text-xs text-gray-600">{uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-green-600">{totalChunks}</p>
            <p className="text-xs text-gray-600">chunks</p>
          </div>
        </div>
      </div>

      {/* Compact Stats - only show when there are files */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{uploadedFiles.length} files</span>
            <span>{formatFileSize(totalSize)}</span>
            <span>{totalChunks} chunks</span>
          </div>
        </div>
      )}

      {/* File List - with conditional scrolling */}
      <div className={`${uploadedFiles.length > 4 ? 'max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent' : ''}`}>
        <div className="divide-y divide-gray-100">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="px-4 py-2 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                  <DocumentTextIcon className="w-3 h-3 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {file.chunks} chunks
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {formatTime(file.uploadedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
