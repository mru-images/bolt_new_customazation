import { useTheme } from '@/components/ThemeContext';
import { Song } from '@/types';
import { ArrowLeft, Heart, Play } from 'lucide-react';
import React from 'react';
import SongCard from './SongCard';

interface LikedSongsPageProps {
  songs: Song[];
  onBack: () => void;
  onSongPlay: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  imageUrls: Record<string, string>;
  clearQueue: () => void;
}

const LikedSongsPage: React.FC<LikedSongsPageProps> = ({ songs, onBack, onSongPlay, onAddToQueue, imageUrls,clearQueue }) => {
  const { isDarkMode } = useTheme();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handlePlayAll = () => {
    clearQueue();
    
  if (songs.length > 0) {
    onSongPlay(songs[0]); // Start playing the first song
    songs.slice(1).forEach((song) => {
      onAddToQueue(song); // Add the rest to queue
    });
  }
};


  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-900/95' : 'bg-gray-50/95'} backdrop-blur-md z-10 px-4 py-4`}>
        <div className="flex items-center mb-4">
          <button 
            onClick={onBack}
            className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full transition-colors mr-3`}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Liked Songs</h1>
        </div>
      </div>

      {/* Liked Songs Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
            <Heart size={48} className="text-white" fill="white" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Liked Songs</h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              {songs.length} songs
            </p>
            {songs.length > 0 && (
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full flex items-center transition-colors"
              onClick={handlePlayAll}
              >
                <Play size={16} className="mr-2" fill="white" />
                Play All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Songs */}
      <div className="px-4 pb-4">
        {songs.length > 0 ? (
          <div className="space-y-3">
            {songs.map((song) => (
              <SongCard 
                key={song.id} 
                song={{ ...song, image: imageUrls[song.id] || '/placeholder.png' }} 
                onPlay={onSongPlay} 
                formatNumber={formatNumber}
                onAddToQueue={onAddToQueue}
                cachedImageUrl={imageUrls[song.id] || '/placeholder.png'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart size={64} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className="text-xl font-semibold mb-2">No liked songs yet</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Songs you like will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongsPage;
