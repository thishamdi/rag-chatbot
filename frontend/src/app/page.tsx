import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Chat with Your Course Notes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your PDF documents and ask questions about them using AI. 
            Perfect for studying lecture notes, research papers, and textbooks.
          </p>
        </div>
        <ChatInterface />
      </div>
    </div>
  )
}

