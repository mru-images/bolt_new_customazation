import { useTheme } from '@/components/ThemeContext';
import { Song } from '@/types';
import { Music, Plus, Search } from 'lucide-react';
import React, { useState } from 'react';
import SongCard from './SongCard';

interface SearchPageProps {
  songs: Song[];
  onSongPlay: (song: Song) => void;
  formatNumber: (num: number) => string;
  onAddToPlaylist: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  imageUrls: Record<string, string>;
  setImageUrls: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}


const SearchPage: React.FC<SearchPageProps> = ({ songs, onSongPlay, formatNumber, onAddToPlaylist, onAddToQueue, imageUrls,setImageUrls }) => {
  const { isDarkMode } = useTheme();
  const [pendingSearch, setPendingSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);
  const [liveSuggestions, setLiveSuggestions] = useState<Song[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  
  const filteredSongs = songs.filter(song =>
    song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayedSongs = filteredSongs.slice(0, displayCount);
  const hasMoreSongs = displayCount < filteredSongs.length;
  const handleSearchSubmit = async () => {
  setSearchQuery(pendingSearch);
  setSearchSubmitted(true);
  setDisplayCount(10);
  setIsLoadingImages(true);

  const filtered = songs.filter(song =>
    song.name.toLowerCase().includes(pendingSearch.toLowerCase()) ||
    song.artist.toLowerCase().includes(pendingSearch.toLowerCase()) ||
    song.tags.some(tag => tag.toLowerCase().includes(pendingSearch.toLowerCase()))
  );

  const missingUrls: Record<string, string> = {};
  for (const song of filtered) {
    if (!imageUrls[song.img_id]) {
      missingUrls[song.img_id] = `/api/image-proxy?fileid=${song.img_id}`;
    }
  }

  if (Object.keys(missingUrls).length > 0) {
    setImageUrls(prev => ({ ...prev, ...missingUrls }));
  }

  setIsLoadingImages(false);
};

  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-900/95' : 'bg-gray-50/95'} backdrop-blur-md z-10 px-4 py-4`}>
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
         <input
  type="text"
  placeholder="What do you want to listen to?"
  value={pendingSearch}
  onChange={(e) => {
    setPendingSearch(e.target.value);
    setSearchSubmitted(false);

    // Update suggestions live
    const input = e.target.value.trim().toLowerCase();
    if (input) {
      const suggestions = songs.filter(song =>
        song.name.toLowerCase().includes(input) ||
        song.artist.toLowerCase().includes(input) ||
        song.tags.some(tag => tag.toLowerCase().includes(input))
      ).slice(0, 8); // limit to 8
      setLiveSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setLiveSuggestions([]);
      setShowSuggestions(false);
    }
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
      setShowSuggestions(false);
    }
  }}
  className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-full py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
/>
{showSuggestions && !searchSubmitted && liveSuggestions.length > 0 && (
  <div className={`absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto border rounded-lg shadow-md z-50 
    ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
    {liveSuggestions.map(song => (
      <div
        key={song.id}
        className={`px-4 py-2 cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        onClick={() => {
          setPendingSearch(song.name);
          handleSearchSubmit();
          setShowSuggestions(false);
        }}
      >
        {song.name}
      </div>
    ))}
  </div>
)}


        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
                {searchQuery === '' ? (
          <>
            {/* Keep tag categories exactly as-is */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Browse all</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Pop', color: 'from-pink-500 to-purple-500' },
                  { name: 'Rock', color: 'from-red-500 to-orange-500' },
                  { name: 'Hip-Hop', color: 'from-yellow-500 to-green-500' },
                  { name: 'Electronic', color: 'from-blue-500 to-indigo-500' },
                  { name: 'Jazz', color: 'from-purple-500 to-pink-500' },
                  { name: 'Classical', color: 'from-gray-500 to-gray-700' }
                ].map((category, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setPendingSearch(category.name);
                      handleSearchSubmit();
                    }}
                    className={`relative p-4 rounded-lg bg-gradient-to-br ${category.color} h-24 overflow-hidden transition-transform hover:scale-105`}
                  >
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <Music className="absolute bottom-2 right-2 text-white/50" size={32} />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {filteredSongs.length > 0 ? `Found ${filteredSongs.length} results` : 'No results found'}
            </h2>

{isLoadingImages ? (
  <div className="flex items-center justify-center py-10">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
  </div>
) : (
  <div className="space-y-3">
    {displayedSongs.map(song => (
      <SongCard
        key={song.id}
        song={song}
        onPlay={onSongPlay}
        formatNumber={formatNumber}
        onAddToPlaylist={onAddToPlaylist}
        onAddToQueue={onAddToQueue}
        cachedImageUrl={imageUrls[song.img_id]}
      />
    ))}
  </div>
)}


            {hasMoreSongs && searchSubmitted && !isLoadingImages && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setDisplayCount(prev => prev + 10)}
                  className={`flex items-center space-x-2 px-6 py-3 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border rounded-full transition-colors`}
                >
                  <Plus size={18} className="text-purple-400" />
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Load More</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
