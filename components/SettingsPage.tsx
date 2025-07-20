import React from 'react';
import { User, Heart, List, LogOut, ChevronRight, Moon, Sun, Bell, Download } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

interface SettingsPageProps {
  onPlaylistsClick: () => void;
  onLikedClick: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onPlaylistsClick, onLikedClick }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-900/95' : 'bg-gray-50/95'} backdrop-blur-md z-10 px-4 py-4`}>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        {/* Profile Section */}
        <div className="mb-8">
          <div className={`flex items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg`}>
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-16 h-16 rounded-full mr-4"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                <User size={24} />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {user?.email}
              </p>
            </div>
            <ChevronRight className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-6">
          {/* Music Library */}
          <div>
            <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Music Library</h2>
            <div className="space-y-2">
              <button 
                onClick={onPlaylistsClick}
                className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-lg transition-colors`}
              >
                <div className="flex items-center">
                  <List className="mr-3 text-purple-400" size={20} />
                  <span>Playlists</span>
                </div>
                <ChevronRight className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={16} />
              </button>
              
              <button 
                onClick={onLikedClick}
                className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-lg transition-colors`}
              >
                <div className="flex items-center">
                  <Heart className="mr-3 text-red-400" size={20} />
                  <span>Liked Songs</span>
                </div>
                <ChevronRight className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={16} />
              </button>

              <button className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-lg transition-colors`}>
                <div className="flex items-center">
                  <Download className="mr-3 text-green-400" size={20} />
                  <span>Downloaded</span>
                </div>
                <ChevronRight className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={16} />
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Preferences</h2>
            <div className="space-y-2">
              <button 
                onClick={toggleTheme}
                className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-lg transition-colors`}
              >
                <div className="flex items-center">
                  {isDarkMode ? (
                    <Moon className="mr-3 text-blue-400" size={20} />
                  ) : (
                    <Sun className="mr-3 text-yellow-500" size={20} />
                  )}
                  <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                <div className={`w-12 h-6 ${isDarkMode ? 'bg-purple-500' : 'bg-gray-300'} rounded-full relative transition-colors`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'right-1' : 'left-1'}`}></div>
                </div>
              </button>
              
              <button className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-lg transition-colors`}>
                <div className="flex items-center">
                  <Bell className="mr-3 text-yellow-400" size={20} />
                  <span>Notifications</span>
                </div>
                <ChevronRight className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={16} />
              </button>
            </div>
          </div>

          {/* Account */}
          <div>
            <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Account</h2>
            <div className="space-y-2">
              <button 
                onClick={signOut}
                className="w-full flex items-center justify-between p-4 bg-red-900/20 border border-red-800 rounded-lg hover:bg-red-900/30 transition-colors"
              >
                <div className="flex items-center">
                  <LogOut className="mr-3 text-red-400" size={20} />
                  <span className="text-red-400">Logout</span>
                </div>
                <ChevronRight className="text-red-400" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;