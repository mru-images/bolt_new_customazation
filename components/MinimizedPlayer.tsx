import React from 'react';
import { Play, Pause, SkipForward, SkipBack, X, Heart, MoreHorizontal, Moon } from 'lucide-react';
import { Song } from '@/types';
import { useTheme } from '@/components/ThemeContext';

interface MinimizedPlayerProps {
  song: Song;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onMaximize: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  onToggleLike: () => void;
  formatNumber: (num: number) => string;
  imageUrl?: string;
  currentTime: number;
  duration: number;
  sleepTimer?: number | 'after-song' | null;
  remainingTime?: number | null;
  onOpenSleepTimer?: () => void;
}

const MinimizedPlayer: React.FC<MinimizedPlayerProps> = ({
  song,
  isPlaying,
  onTogglePlay,
  onMaximize,
  onPrevious,
  onNext,
  onClose,
  onToggleLike,
  formatNumber,
  imageUrl,
  currentTime,
  duration,
  sleepTimer,
  remainingTime,
  onOpenSleepTimer
}) => {
  const { isDarkMode } = useTheme();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleSleepTimerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenSleepTimer) {
      onOpenSleepTimer();
    }
    setShowMenu(false);
  };
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`fixed bottom-20 left-0 right-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t z-40 shadow-lg`}>
      {/* Progress Bar */}
      <div className={`w-full h-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
      <div
        className="h-full bg-purple-500 transition-all duration-300"
        style={{ width: `${progressPercent}%` }}
      />
    </div>

      
      <div className="flex items-center justify-between p-3">
        {/* Song Info - Clickable to maximize */}
        <div className="flex items-center flex-1 min-w-0 cursor-pointer" onClick={onMaximize}>
          {/* Sleep Timer Indicator */}
          {sleepTimer && (
            <div className={`mr-2 px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
              {typeof sleepTimer === 'number' && remainingTime ? `${remainingTime}m` : '♪'}
            </div>
          )}
          
          <img
            src={imageUrl || song.image}
            alt={song.name}
            className="w-12 h-12 rounded-lg object-cover mr-3 flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate text-sm`}>{song.name}</h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs truncate`}>{song.artist}</p>
          </div>
        </div>
        
        {/* Like Button */}
        <button 
          onClick={handleLike}
          className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors mr-2`}
        >
          <Heart 
            size={16} 
            className={`transition-colors ${song.isLiked ? 'text-red-500 fill-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} 
          />
        </button>
        
        {/* Controls */}
        <div className="flex items-center space-x-1">
          {/* Menu Button */}
          <div className="relative">
            <button 
              onClick={handleMenuClick}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
            >
              <MoreHorizontal size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
            
            {showMenu && (
              <div className={`absolute bottom-12 right-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-2 w-48 z-50`}>
                <button
                  onClick={handleSleepTimerClick}
                  className={`w-full text-left px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'} flex items-center transition-colors`}
                >
                  <Moon size={16} className="mr-3 text-purple-400" />
                  Sleep Timer
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
          >
            <SkipBack size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
          >
            {isPlaying ? (
              <Pause size={20} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
            ) : (
              <Play size={20} className={isDarkMode ? 'text-white' : 'text-gray-900'} fill={isDarkMode ? 'white' : '#111827'} />
            )}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
          >
            <SkipForward size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
          </button>
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors ml-1`}
          >
            <X size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinimizedPlayer;