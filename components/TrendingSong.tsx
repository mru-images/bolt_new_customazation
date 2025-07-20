import React from 'react';
import { Play, Heart, Eye } from 'lucide-react';
import { Song } from '@/types';
import { useTheme } from '@/components/ThemeContext';

interface TrendingSongProps {
  song: Song;
  onPlay: (song: Song) => void;
  formatNumber: (num: number) => string;
  cachedImageUrl: string;
}

const TrendingSong: React.FC<TrendingSongProps> = ({ song, onPlay, formatNumber,cachedImageUrl }) => {
  const { isDarkMode } = useTheme();

  const handleClick = () => {
    onPlay(song);
  };

  return (
    <div className="flex-shrink-0 w-40 group cursor-pointer" onClick={handleClick}>
      <div className="relative mb-2">
        <img
         src={cachedImageUrl}
          alt={song.name}
          className="w-full h-40 rounded-lg object-cover"
        />
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="text-white" size={24} fill="white" />
        </div>
        <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
          <Heart size={16} className={`${song.isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
        </div>
      </div>
      
      <div>
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate text-sm`}>{song.name}</h3>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs truncate`}>{song.artist}</p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center space-x-1">
            <Eye size={10} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
            <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-xs`}>{formatNumber(song.views)}</span>
          </div>
          <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-xs`}>{song.language}</span>
        </div>
      </div>
    </div>
  );
};

export default TrendingSong;