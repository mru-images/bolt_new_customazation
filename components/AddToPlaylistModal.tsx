import React from 'react';
import { X, Plus, Music } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';
import { Song, Playlist } from '@/types';
import { getFileLink } from '@/lib/pcloud'; // adjust path if needed
import { useEffect } from 'react';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, song: Song) => void;
  onCreatePlaylist: () => void;
  imageUrls: Record<string, string>;
  setImageUrls: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ 
  isOpen, 
  onClose, 
  song,
  playlists,
  onAddToPlaylist,
  onCreatePlaylist,
  imageUrls,
  setImageUrls
}) => {
  const { isDarkMode } = useTheme();

  if (!isOpen || !song) return null;

  const handleAddToPlaylist = (playlistId: string) => {
    onAddToPlaylist(playlistId, song);
    onClose();
  };

  const handleCreateNew = () => {
    onCreatePlaylist();
  };

useEffect(() => {
  const preloadFirstSongImages = async () => {
    const updates: Record<string, string> = {};

    for (const playlist of playlists) {
      const firstSong = playlist.songs?.[0];
      if (firstSong && !imageUrls[firstSong.id]) {
        try {
          const link = await getFileLink(firstSong.img_id);
          updates[firstSong.id] = link;
        } catch (error) {
          console.error('Failed to fetch image link:', error);
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      setImageUrls(prev => ({ ...prev, ...updates }));
    }
  };

  preloadFirstSongImages();
}, [playlists, imageUrls, setImageUrls]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add to Playlist</h2>
          <button
            onClick={onClose}
            className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Song Info */}
        <div className={`flex items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg mb-4`}>
          <img
            src={imageUrls[song.id] || '/placeholder.png'}
            alt={song.name}
            className="w-12 h-12 rounded-lg object-cover mr-3"
          />
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>{song.name}</h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm truncate`}>{song.artist}</p>
          </div>
        </div>

        {/* Create New Playlist Button */}
        <button
          onClick={handleCreateNew}
          className={`w-full flex items-center p-4 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors mb-4`}
        >
          <div className={`w-12 h-12 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-lg flex items-center justify-center mr-3`}>
            <Plus size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
          </div>
          <span className="font-medium">Create New Playlist</span>
        </button>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto">
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
            Your Playlists
          </h3>
          <div className="space-y-2">
            {playlists.map((playlist) => {
                const songExists = playlist.songs.some(s => s.id === song.id);
                const firstSongId = playlist.songs?.[0]?.id;
                const image = firstSongId && imageUrls[firstSongId]
                  ? imageUrls[firstSongId]
                  : '/placeholder.png';

                return (
                  <button
                    key={playlist.id}
                    onClick={() => !songExists && handleAddToPlaylist(playlist.id)}
                    disabled={songExists}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      songExists 
                        ? `${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'} cursor-not-allowed opacity-50`
                        : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`
                    }`}
                  >
                    <img
                      src={image}
                      alt={playlist.name}
                      className="w-12 h-12 rounded-lg object-cover mr-3"
                    />
                    <div className="flex-1 text-left">
                      <h4 className="font-medium">{playlist.name}</h4>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        {playlist.songCount} songs
                      </p>
                    </div>
                    {songExists && (
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Already added
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;