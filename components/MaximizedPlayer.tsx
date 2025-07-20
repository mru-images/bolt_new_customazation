import { useTheme } from '@/components/ThemeContext';
import { QueueItem } from '@/hooks/useQueue';
import { Song } from '@/types';
import { ChevronDown, Eye, Heart, Moon, MoreHorizontal, Pause, Play, Plus, Repeat, Share2, Shuffle, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import React, { useState } from 'react';
import QueueSection from './QueueSection';

interface MaximizedPlayerProps {
  song: Song;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onMinimize: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleLike: () => void;
  formatNumber: (num: number) => string;
  onAddToPlaylist: () => void;
  imageUrl?: string;
  currentTime: number;
  duration: number;
  setCurrentTime: (time: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isSeeking: boolean;
  setIsSeeking: (value: boolean) => void;
  queue: QueueItem[];
  onRemoveFromQueue: (itemId: string) => void;
  onSongPlay: (song: Song) => void;
  imageUrls: Record<string, string>;
  isShuffleEnabled: boolean;
  setIsShuffleEnabled: (enabled: boolean) => void;
  repeatMode: 'off' | 'once' | 'infinite';
  setRepeatMode: (mode: 'off' | 'once' | 'infinite') => void;
  sleepTimer?: number | 'after-song' | null;
  remainingTime?: number | null;
  onOpenSleepTimer?: () => void;
}

const MaximizedPlayer: React.FC<MaximizedPlayerProps> = ({
  song,
  isPlaying,
  onTogglePlay,
  onMinimize,
  onPrevious,
  onNext,
  onToggleLike,
  formatNumber,
  onAddToPlaylist,
  imageUrl,
  currentTime,
  duration,
  setCurrentTime,
  volume,
  setVolume,
  setIsSeeking,
  isSeeking,
  queue,
  onRemoveFromQueue,
  onSongPlay,
  imageUrls,
  isShuffleEnabled,
  setIsShuffleEnabled,
  repeatMode,
  setRepeatMode,
  sleepTimer,
  remainingTime,
  onOpenSleepTimer
}) => {
  const { isDarkMode } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [localSeekTime, setLocalSeekTime] = useState<number | null>(null);

  const formatTime = (seconds: number) => {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};


  const progressPercentage = (currentTime / duration) * 100;

  const handleLike = () => {
    onToggleLike();
  };

  const handleShuffleToggle = () => {
    const newShuffleState = !isShuffleEnabled;
    setIsShuffleEnabled(newShuffleState);
    
    // If enabling shuffle, disable repeat
    if (newShuffleState) {
      setRepeatMode('off');
    }
  };

  const handleRepeatToggle = () => {
    // Cycle through repeat modes: off -> once -> infinite -> off
    let nextMode: 'off' | 'once' | 'infinite';
    
    switch (repeatMode) {
      case 'off':
        nextMode = 'once';
        break;
      case 'once':
        nextMode = 'infinite';
        break;
      case 'infinite':
        nextMode = 'off';
        break;
      default:
        nextMode = 'off';
    }
    
    setRepeatMode(nextMode);
    
    // If enabling repeat, disable shuffle
    if (nextMode !== 'off') {
      setIsShuffleEnabled(false);
    }else{
      setIsShuffleEnabled(true);
    }
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'once':
        return (
          <div className="relative">
            <Repeat size={24} className="text-purple-400" />
            <span className="absolute -top-1 -right-1 text-xs bg-purple-400 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
              1
            </span>
          </div>
        );
      case 'infinite':
        return <Repeat size={24} className="text-purple-400" />;
      default:
        return <Repeat size={24} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />;
    }
  };

  return (
    <div className={`fixed inset-0 ${isDarkMode ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-black' : 'bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200'} z-50 flex flex-col`}>
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 pt-12 flex-shrink-0">
        <button 
          onClick={onMinimize} 
          className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full transition-colors`}
        >
          <ChevronDown size={24} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
        </button>
        <div className="text-center flex-1">
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Playing from</p>
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>Trending Now</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full transition-colors`}
          >
            <MoreHorizontal size={24} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className={`absolute right-0 top-12 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-2 w-48 z-10`}>
              <button 
                onClick={() => {
                  if (onOpenSleepTimer) {
                    onOpenSleepTimer();
                  }
                  setShowMenu(false);
                }}
                className={`w-full text-left px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'} flex items-center transition-colors`}
              >
                <Moon size={16} className="mr-3 text-purple-400" />
                Sleep Timer
              </button>
              <button 
                onClick={() => {
                  onAddToPlaylist();
                  setShowMenu(false);
                }}
                className={`w-full text-left px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'} flex items-center transition-colors`}
              >
                <Plus size={16} className="mr-3" />
                Add to Playlist
              </button>
              <button className={`w-full text-left px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'} flex items-center transition-colors`}>
                <Share2 size={16} className="mr-3" />
                Share
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Area - Properly contained */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-h-full">
          {/* Album Art - Smaller and centered */}
          <div className="flex justify-center py-6">
            <div className="relative w-56 h-56">
              <img
                src={imageUrl || song.image}
                alt={song.name}
                className="w-full h-full rounded-2xl object-cover shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>

          {/* Song Info */}
          <div className="text-center mb-6">
            {/* Sleep Timer Display */}
            {sleepTimer && (
              <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>
                <div className="flex items-center justify-center space-x-2">
                  <Moon size={16} className="text-purple-400" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Sleep Timer: {
                      typeof sleepTimer === 'number' && remainingTime 
                        ? `${remainingTime} minute${remainingTime !== 1 ? 's' : ''} remaining`
                        : 'After current song'
                    }
                  </span>
                </div>
              </div>
            )}
            
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{song.name}</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>{song.artist}</p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <span className={`${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} text-sm px-3 py-1 rounded-full`}>
                {song.language}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-1">
                <Eye size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{formatNumber(song.views)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart size={16} className={`${song.isLiked ? 'text-red-500 fill-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{formatNumber(song.likes)}</span>
              </div>
            </div>
          </div>

                      {/* Progress Bar with Time */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm font-mono mb-2">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {formatTime(currentTime)}
              </span>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {formatTime(duration)}
              </span>
            </div>

           <input
  type="range"
  min={0}
  max={duration}
  step={0.1}
  value={isSeeking && localSeekTime !== null ? localSeekTime : currentTime}
  onChange={(e) => {
    const newTime = Number(e.target.value);
    setIsSeeking(true);
    setLocalSeekTime(newTime); // ✅ Set directly
  }}
  onMouseUp={() => {
    if (localSeekTime !== null) {
      setIsSeeking(false);
      setCurrentTime(localSeekTime); // ✅ Triggers audioRef seek in parent
      setLocalSeekTime(null);
    } else {
      console.warn('[MouseUp] localSeekTime was null');
    }
  }}
  onTouchEnd={() => {
    if (localSeekTime !== null) {
      setIsSeeking(false);
      setCurrentTime(localSeekTime); // ✅ Triggers audioRef seek in parent
      setLocalSeekTime(null);
    } else {
      console.warn('[TouchEnd] localSeekTime was null');
    }
  }}
  className="w-full h-2 appearance-none bg-gray-300 rounded-full cursor-pointer"
  style={{ accentColor: '#a855f7' }}
/>

          </div>


          {/* Main Controls */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-6">
              <button 
                onClick={handleShuffleToggle}
                className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full transition-colors`}
              >
                <Shuffle size={24} className={isShuffleEnabled ? 'text-purple-400' : isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
              
              <button 
                onClick={onPrevious}
                className={`p-3 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full transition-colors`}
              >
                <SkipBack size={28} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
              </button>
              
              <button
                onClick={onTogglePlay}
                className="p-4 bg-purple-500 hover:bg-purple-600 rounded-full transition-colors shadow-lg"
              >
                {isPlaying ? (
                  <Pause size={32} className="text-white" />
                ) : (
                  <Play size={32} className="text-white" fill="white" />
                )}
              </button>
              
              <button 
                onClick={onNext}
                className={`p-3 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full transition-colors`}
              >
                <SkipForward size={28} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
              </button>
              
              <button 
                onClick={handleRepeatToggle}
                className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full transition-colors`}
              >
                {getRepeatIcon()}
              </button>
            </div>
          </div>

          {/* Bottom Section with Like Button and Volume - Final section */}
          <div className="pb-8">
            <div className="flex items-center justify-between">
              {/* Like Button - Bottom Left */}
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 ${song.isLiked ? 'bg-red-500 hover:bg-red-600' : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-full transition-colors`}
              >
                <Heart size={18} className={`${song.isLiked ? 'text-white fill-white' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                <span className={`text-sm font-medium ${song.isLiked ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {song.isLiked ? 'Liked' : 'Like'}
                </span>
              </button>
              
              {/* Volume Control */}
              {/* Volume Control */}
              <div className="flex items-center space-x-3 flex-1 max-w-32 ml-6">
                <Volume2 size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: '#a855f7' }}
                />
              </div>

            </div>
          </div>
          
          {/* Queue Section */}
          <QueueSection
            queue={queue}
            onRemoveFromQueue={onRemoveFromQueue}
            onSongPlay={onSongPlay}
            imageUrls={imageUrls}
          />
        </div>
      </div>
    </div>
  );
};

export default MaximizedPlayer; 

