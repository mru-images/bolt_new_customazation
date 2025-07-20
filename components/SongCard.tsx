import React from 'react';
import { Play, Heart, Eye, MoreHorizontal, Plus, X, Clock } from 'lucide-react';
import { Song } from '@/types';
import { useTheme } from '@/components/ThemeContext';

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  formatNumber: (num: number) => string;
  onAddToPlaylist?: (song: Song) => void;
  onAddToQueue?: (song: Song) => void;
  showRemoveButton?: boolean;
  onRemove?: () => void;
  cachedImageUrl: string;
}

const SongCard: React.FC<SongCardProps> = ({ 
  song, 
  onPlay, 
  formatNumber, 
  onAddToPlaylist,
  onAddToQueue,
  showRemoveButton = false,
  onRemove,
  cachedImageUrl
}) => {
  const { isDarkMode } = useTheme();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleContainerClick = () => {
    onPlay(song);
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };
  return (
    <div 
      onClick={handleContainerClick}
      className={`flex items-center p-3 ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white/50 hover:bg-white border border-gray-200'} rounded-lg transition-all group cursor-pointer`}
    >
      <div className="relative mr-3">
        <img
          src={cachedImageUrl}
          alt={song.name}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="text-white" size={16} fill="white" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>{song.name}</h3>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm truncate`}>{song.artist}</p>
        <div className="flex items-center space-x-4 mt-1">
          <div className="flex items-center space-x-1">
            <Eye size={12} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
            <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-xs`}>{formatNumber(song.views)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart size={12} className={`${song.isLiked ? 'text-red-500 fill-red-500' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-xs`}>{formatNumber(song.likes)}</span>
          </div>
          <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-xs`}>{song.language}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-3">
        {showRemoveButton && onRemove && (
          <button 
            onClick={(e) => handleButtonClick(e, onRemove)}
            className={`p-1 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded-full transition-colors text-red-400 hover:text-red-300`}
          >
            <X size={16} />
          </button>
        )}
        {onAddToPlaylist && (
          <button 
            onClick={(e) => handleButtonClick(e, () => onAddToPlaylist(song))}
            className={`p-1 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded-full transition-colors`}
          >
            <Plus size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        )}
        <div className="relative">
          <button 
            onClick={handleMenuClick}
            className={`p-1 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded-full transition-colors`}
          >
            <MoreHorizontal size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
          
          {showMenu && (
            <div className={`absolute right-0 top-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-2 w-48 z-20`}>
              {onAddToQueue && (
                <button
                  onClick={(e) => {
                    handleButtonClick(e, () => {
                      onAddToQueue(song);
                      setShowMenu(false);
                    });
                  }}
                  className={`w-full text-left px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'} flex items-center transition-colors`}
                >
                  <Clock size={16} className="mr-3" />
                  Add to Queue
                </button>
              )}
              {onAddToPlaylist && (
                <button
                  onClick={(e) => {
                    handleButtonClick(e, () => {
                      onAddToPlaylist(song);
                      setShowMenu(false);
                    });
                  }}
                  className={`w-full text-left px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'} flex items-center transition-colors`}
                >
                  <Plus size={16} className="mr-3" />
                  Add to Playlist
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongCard;