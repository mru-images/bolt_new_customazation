import React from 'react'
import { Music } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const LoginPage: React.FC = () => {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-3">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm text-center border border-gray-800/50 shadow-2xl relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black/80 to-gray-900/50 rounded-2xl"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Music size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Music Player
            </h1>
            <p className="text-gray-400 text-sm">Discover your favorite music</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              className="w-full bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-gray-700/50 active:scale-[0.98]"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
            
            <p className="text-gray-500 text-xs leading-relaxed px-2">
              Sign in to access playlists and personalized music
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800/50">
            <p className="text-gray-600 text-xs">
              By signing in, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute top-2 left-2 w-12 h-12 bg-purple-600/5 rounded-full blur-lg"></div>
        <div className="absolute bottom-2 right-2 w-10 h-10 bg-pink-600/5 rounded-full blur-lg"></div>
      </div>
    </div>
  )
}

export default LoginPage