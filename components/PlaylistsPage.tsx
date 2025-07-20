import { useTheme } from '@/components/ThemeContext';
import { Playlist, Song } from '@/types';
import { ArrowLeft, Edit2, MoreHorizontal, Music, Play, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import SongCard from './SongCard';

interface PlaylistsPageProps {
  playlists: Playlist[];
  onBack: () => void;
  onSongPlay: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  onCreatePlaylist: () => void;
  onDeletePlaylist: (playlistId: string) => void;
  onRenamePlaylist: (playlistId: string, newName: string) => void;
  onRemoveSongFromPlaylist: (playlistId: string, songId: string) => void;
  imageUrls: Record<string, string>;
  clearQueue: () => void; // <-- Add this line
}


const PlaylistsPage: React.FC<PlaylistsPageProps> = ({
  playlists, 
  onBack, 
  onSongPlay,
  onAddToQueue,
  onCreatePlaylist,
  onDeletePlaylist,
  onRenamePlaylist,
  onRemoveSongFromPlaylist,
  imageUrls,
  clearQueue
}) => {
  const { isDarkMode } = useTheme();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
const handlePlayAll = (songs: Song[]) => {
  if (songs.length === 0) return;

  clearQueue(); // 🧹 Clear existing queue
  onSongPlay(songs[0]); // ▶️ Play first song

  songs.slice(1).forEach((song) => {
    onAddToQueue(song); // ➕ Add the rest to the queue
  });
};

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleRename = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      setEditName(playlist.name);
      setEditingPlaylist(playlistId);
      setShowPlaylistMenu(null);
    }
  };

  const handleSaveRename = () => {
    if (editingPlaylist && editName.trim()) {
      onRenamePlaylist(editingPlaylist, editName.trim());
      setEditingPlaylist(null);
      setEditName('');
    }
  };

  const handleCancelRename = () => {
    setEditingPlaylist(null);
    setEditName('');
  };

  const handleDelete = (playlistId: string) => {
    onDeletePlaylist(playlistId);
    setShowPlaylistMenu(null);
    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(null);
    }
  };

  const handleRemoveSong = (songId: string) => {
    if (selectedPlaylist) {
      onRemoveSongFromPlaylist(selectedPlaylist.id, songId);
      // Update the selected playlist to reflect the change
      const updatedPlaylist = {
        ...selectedPlaylist,
        songs: selectedPlaylist.songs.filter(song => song.id !== songId),
        songCount: selectedPlaylist.songs.filter(song => song.id !== songId).length
      };
      setSelectedPlaylist(updatedPlaylist);
    }
  };

  if (selectedPlaylist) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Header */}
        <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-900/95' : 'bg-gray-50/95'} backdrop-blur-md z-10 px-4 py-4`}>
          <div className="flex items-center mb-4">
            <button 
              onClick={() => setSelectedPlaylist(null)}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full transition-colors mr-3`}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">{selectedPlaylist.name}</h1>
          </div>
        </div>

        {/* Playlist Header */}
        <div className="px-4 mb-6">
          <div className="flex items-center mb-4">
            <img
              src={
                selectedPlaylist.songs.length > 0
                  ? imageUrls[selectedPlaylist.songs[0].id] || '/placeholder.png'
                  : '/placeholder.png'
              }
              alt={selectedPlaylist.name}
              className="w-32 h-32 rounded-lg object-cover mr-4"
            />

            <div>
              <h2 className="text-xl font-bold mb-2">{selectedPlaylist.name}</h2>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                {selectedPlaylist.songCount} songs
              </p>
              {selectedPlaylist.songs.length > 0 && (
                <button
                 onClick={() => handlePlayAll(selectedPlaylist.songs)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full flex items-center transition-colors">
                  <Play size={16} className="mr-2" fill="white" />
                  Play All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Songs */}
        <div className="px-4 pb-4">
          {selectedPlaylist.songs.length > 0 ? (
            <div className="space-y-3">
              {selectedPlaylist.songs.map((song) => (
                <div key={song.id} className="relative group">
                  <SongCard 
                    song={{ ...song, image: imageUrls[song.id] || '/placeholder.png' }} 
                    onPlay={onSongPlay} 
                    formatNumber={formatNumber}
                   onAddToQueue={onAddToQueue}
                    showRemoveButton={true}
                    onRemove={() => handleRemoveSong(song.id)}
                    cachedImageUrl={imageUrls[song.id] || '/placeholder.png'}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music size={64} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className="text-xl font-semibold mb-2">No songs in this playlist</h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Add songs to get started
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-900/95' : 'bg-gray-50/95'} backdrop-blur-md z-10 px-4 py-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full transition-colors mr-3`}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Your Playlists</h1>
          </div>
          <button
            onClick={onCreatePlaylist}
            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {playlists.length > 0 ? (
          <div className="grid gap-4">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="relative">
                {editingPlaylist === playlist.id ? (
                  <div className={`flex items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg`}>
                    <img
                        src={
                          playlist.songs.length > 0
                            ? imageUrls[playlist.songs[0].id] || '/placeholder.png'
                            : '/placeholder.png'
                        }
                        alt={playlist.name}
                        className="w-16 h-16 rounded-lg object-cover mr-4"
                      />

                    <div className="flex-1 flex items-center space-x-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveRename()}
                      />
                      <button
                        onClick={handleSaveRename}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} px-4 py-2 rounded-lg transition-colors`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedPlaylist(playlist)}
                    className={`w-full flex items-center p-4 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-lg transition-colors text-left`}
                  >
                    <img
                      src={
                        playlist.songs.length > 0
                          ? imageUrls[playlist.songs[0].id] || '/placeholder.png'
                          : '/placeholder.png'
                      }
                      alt={playlist.name}
                      className="w-16 h-16 rounded-lg object-cover mr-4"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{playlist.name}</h3>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        {playlist.songCount} songs
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPlaylistMenu(showPlaylistMenu === playlist.id ? null : playlist.id);
                        }}
                        className={`p-2 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded-full transition-colors`}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      
                      {showPlaylistMenu === playlist.id && (
                        <div className={`absolute right-0 top-12 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-2 w-48 z-20`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRename(playlist.id);
                            }}
                            className={`w-full text-left px-4 py-2 ${isDarkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-900'} flex items-center transition-colors`}
                          >
                            <Edit2 size={16} className="mr-3" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(playlist.id);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-red-600 text-red-400 hover:text-white flex items-center transition-colors"
                          >
                            <Trash2 size={16} className="mr-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music size={64} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Create your first playlist to organize your music
            </p>
            <button
              onClick={onCreatePlaylist}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full flex items-center mx-auto transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Create Playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistsPage;
