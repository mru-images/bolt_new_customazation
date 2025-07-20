import { useTheme } from '@/components/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { Song } from '@/types';
import { Music, Plus, TrendingUp } from 'lucide-react';
import React from 'react';
import SongCard from './SongCard';
import TrendingSong from './TrendingSong';


interface HomePageProps {
  songs: Song[];
  onSongPlay: (song: Song) => void;
  formatNumber: (num: number) => string;
  onAddToPlaylist: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  imageUrls: Record<string, string>;  // NEW
  onLoadMore: () => void;             // NEW
  hasMoreSongs: boolean;              // NEW
  recentlyPlayedSongs: Song[];        // NEW
}


const HomePage: React.FC<HomePageProps> = ({ songs, onSongPlay, formatNumber, onAddToPlaylist, onAddToQueue, imageUrls,onLoadMore,hasMoreSongs, recentlyPlayedSongs }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  
  // Show loading state if no songs are loaded yet
  if (songs.length === 0) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-900/95' : 'bg-gray-50/95'} backdrop-blur-md z-10 px-4 py-4`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Good evening</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>What do you want to listen to?</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Music size={20} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {/* Trending Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <TrendingUp className="mr-2 text-purple-400" size={20} />
              Trending Now
            </h2>
            <button className="text-purple-400 text-sm font-medium">See all</button>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {songs.slice(0, 10).map((song) => (
              <TrendingSong 
                key={song.id}
                song={{ ...song, image: imageUrls[song.id] || '' }}
                onPlay={onSongPlay}
                formatNumber={formatNumber}
                cachedImageUrl={imageUrls[song.id]}
              />
            ))}
          </div>
        </div>

{recentlyPlayedSongs.length > 0 && (
  <div className="mb-8">
    <h2 className="text-xl font-bold mb-4 px-2">Recently Played</h2>
    <div className="overflow-x-auto">
      <div className="flex gap-6 px-2 py-4">
        {Array.from({ length: Math.ceil(recentlyPlayedSongs.length / 3) }).map((_, columnIndex) => {
          const start = columnIndex * 3;
          const end = start + 3;
          const group = recentlyPlayedSongs.slice(start, end);

          return (
            <div key={columnIndex} className="min-w-[260px] flex flex-col gap-5">
              {group.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-all group cursor-pointer"
                  onClick={() => onSongPlay({ ...song, image: imageUrls[song.id] || '' })}
                >
                  <img
                    src={imageUrls[song.id] || '/placeholder.jpg'}
                    alt={song.name}
                    className="w-16 h-16 rounded-lg object-cover shadow-md"
                  />
                  <div className="flex flex-col ml-4">
                    <div className="text-base font-semibold text-white">{song.name}</div>
                    <div className="text-sm text-neutral-300">{song.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  </div>
)}


        {/* Recommendations Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Made for you</h2>
            <button className="text-purple-400 text-sm font-medium">See all</button>
          </div>
          <div className="space-y-3">
            {songs.map((song) => (
      </div>
    </div>
  );
};

export default HomePage;