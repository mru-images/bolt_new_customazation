import React from 'react'
import { Music } from 'lucide-react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Music size={32} className="text-white" />
        </div>
        <p className="text-white text-lg">Loading your music...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner