import { DatabaseSong, supabase } from '@/lib/supabase'
import { Playlist, Song } from '@/types'
import { User } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'

export function useSupabaseData(user: User | null) {
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set())
  const [lastPlayedSong, setLastPlayedSong] = useState<Song | null>(null)
  const [recentlyPlayedSongs, setRecentlyPlayedSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSongStartTime, setCurrentSongStartTime] = useState<Date | null>(null)
  const currentSongRef = useRef<string | null>(null)

  // Get personalized songs based on user's actual listening preferences
  const getSmartPersonalizedSongs = async (
    userId: string, 
    listenedSongsInBatch: Song[], 
    excludeSongs: Set<string>
  ): Promise<Song[]> => {
    try {
      console.log('🧠 Fetching smart personalized songs based on listening behavior');
      console.log('🎵 Songs user actually listened to:', listenedSongsInBatch.map(s => s.name));
      
      if (listenedSongsInBatch.length === 0) {
        console.log('⚠️ No listened songs in batch, falling back to regular personalization');
        return [];
      }

      // Extract tags and artists from listened songs
      const preferredTags = new Set<string>();
      const preferredArtists = new Set<string>();
      
      listenedSongsInBatch.forEach(song => {
        song.tags?.forEach(tag => preferredTags.add(tag.toLowerCase()));
        preferredArtists.add(song.artist.toLowerCase());
      });

      console.log('🏷️ Preferred tags:', Array.from(preferredTags));
      console.log('🎤 Preferred artists:', Array.from(preferredArtists));

      // Fetch all songs from database
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*');
      
      if (songsError) {
        console.error('❌ Error fetching songs for smart personalization:', songsError);
        return [];
      }
      
      if (!songsData || songsData.length === 0) {
        console.warn('⚠️ No songs found in database');
        return [];
      }

      // Get user's liked songs
      const { data: likedData } = await supabase
        .from('liked_songs')
        .select('song_id')
        .eq('user_id', userId);
      
      const userLikedSongs = new Set<number>();
      if (likedData) {
        likedData.forEach(item => userLikedSongs.add(item.song_id));
      }

      // Filter and score songs based on listening preferences
      const availableSongs = songsData.filter((song) => {
        return !excludeSongs.has(song.file_id.toString());
      });

      console.log(`🎵 Available songs for smart recommendations: ${availableSongs.length}`);

      if (availableSongs.length === 0) {
        console.warn('⚠️ No available songs after filtering');
        return [];
      }

      // Score songs based on user's listening preferences
      const scoredSongs = availableSongs.map((song) => {
        let score = 0;

        // High priority: Tag matching with listened songs
        const songTags = song.tags?.map((tag: string) => tag.toLowerCase()) || [];
        const matchingTags = songTags.filter((tag: string) => preferredTags.has(tag));
        score += matchingTags.length * 25; // Higher weight for tag matching

        // High priority: Artist matching with listened songs
        if (preferredArtists.has(song.artist.toLowerCase())) {
          score += 30; // Higher weight for artist matching
        }

        // Medium priority: Same language as listened songs
        const listenedLanguages = listenedSongsInBatch.map(s => s.language);
        if (listenedLanguages.includes(song.language)) {
          score += 15;
        }

        // Lower priority: General popularity
        score += Math.log(1 + (song.likes || 0)) * 2;
        score += Math.log(1 + (song.views || 0)) * 1;

        // Bonus for liked songs
        if (userLikedSongs.has(song.file_id)) {
          score += 10;
        }

        // Add small randomness to avoid repetition
        score += Math.random() * 2;

        return { 
          song: convertDatabaseSong(song, userLikedSongs.has(song.file_id)), 
          score 
        };
      });

      // Sort by score and return top recommendations
      const recommendations = scoredSongs
        .sort((a, b) => b.score - a.score)
        .slice(0, 15) // Get more songs for variety
        .map(entry => entry.song);

      console.log('🧠 Smart recommendations based on listening behavior:', 
        recommendations.slice(0, 5).map(s => `${s.name} by ${s.artist}`));
      
      return recommendations;
      
    } catch (error) {
      console.error('❌ Error in getSmartPersonalizedSongs:', error);
      return [];
    }
  };

  // Convert database song to UI song format
  const convertDatabaseSong = (dbSong: DatabaseSong, isLiked: boolean = false): Song => ({
    file_id: dbSong.file_id,
    img_id: dbSong.img_id,
    name: dbSong.name,
    artist: dbSong.artist,
    language: dbSong.language,
    tags: dbSong.tags,
    views: dbSong.views,
    likes: dbSong.likes,
    id: dbSong.file_id.toString(),
    image: `https://images.pexels.com/photos/${dbSong.img_id}/pexels-photo-${dbSong.img_id}.jpeg?auto=compress&cs=tinysrgb&w=300`,
    isLiked
  })

  // Fetch all songs
  const fetchSongs = async () => {
    if (!user) {
      setSongs([])
      return
    }
    
    try {
      const { data: songsData, error } = await supabase
        .from('songs')
        .select('*')
        .order('views', { ascending: false })

      if (error) throw error

      let userLikedSongs = new Set<number>()
      
      const { data: likedData } = await supabase
        .from('liked_songs')
        .select('song_id')
        .eq('user_id', user.id)
      
      if (likedData) {
        userLikedSongs = new Set(likedData.map(item => item.song_id))
        setLikedSongs(userLikedSongs)
      }

      const convertedSongs = songsData?.map(song => 
        convertDatabaseSong(song, userLikedSongs.has(song.file_id))
      ) || []

      const sortedSongs = [...convertedSongs].sort((a, b) => {
        const aScore = a.views + a.likes;
        const bScore = b.views + b.likes;
        return bScore - aScore;
      });

      setSongs(sortedSongs);

      const { data: userData } = await supabase
        .from('users')
        .select('last_song_file_id')
        .eq('id', user.id)
        .single()

      if (userData?.last_song_file_id) {
        const lastSong = convertedSongs.find(song => song.file_id === userData.last_song_file_id)
        if (lastSong) {
          setLastPlayedSong(lastSong)
        }
      }
    } catch (error) {
      console.error('Error fetching songs:', error)
      setSongs([]) // Set empty array on error
    }
  }

  // Get personalized songs with proper error handling and filtering
  const getPersonalizedSongs = async (userId: string, currentSong: Song, listenedSongs?: Set<string>): Promise<Song[]> => {
    try {
      console.log('🎵 Fetching personalized songs for:', currentSong.name);
      console.log('🎵 Listened songs count:', listenedSongs?.size || 0);
      
      // 1. Fetch all songs from database
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*');
      
      if (songsError) {
        console.error('❌ Error fetching songs for personalization:', songsError);
        return [];
      }
      
      if (!songsData || songsData.length === 0) {
        console.warn('⚠️ No songs found in database');
        return [];
      }

      // 2. Fetch user's listening history
      const { data: historyData, error: historyError } = await supabase
        .from('history')
        .select('song_id, minutes_listened')
        .eq('user_id', userId);
      
      if (historyError) {
        console.error('❌ Error fetching history:', historyError);
      }
      
      const historyMap = new Map<number, number>();
      if (historyData) {
        historyData.forEach(h => historyMap.set(h.song_id, h.minutes_listened || 0));
      }

      // 3. Get user's liked songs
      const { data: likedData } = await supabase
        .from('liked_songs')
        .select('song_id')
        .eq('user_id', userId);
      
      const userLikedSongs = new Set<number>();
      if (likedData) {
        likedData.forEach(item => userLikedSongs.add(item.song_id));
      }

      // 4. Filter and score songs
      const availableSongs = songsData.filter((song) => {
        // Exclude current song
        if (song.file_id === currentSong.file_id) {
          return false;
        }
        
        // Exclude listened songs if provided
        if (listenedSongs && listenedSongs.has(song.file_id.toString())) {
          console.log(`🚫 Excluding listened song: ${song.name} by ${song.artist}`);
          return false;
        }
        
        return true;
      });

      console.log(`🎵 Available songs after filtering: ${availableSongs.length}`);

      if (availableSongs.length === 0) {
        console.warn('⚠️ No available songs after filtering');
        return [];
      }

      // 5. Score and sort songs
      const scoredSongs = availableSongs.map((song) => {
        let score = 0;

        // Tag matching (highest priority)
        const matchingTags = song.tags?.filter((tag: string) =>
          currentSong.tags?.includes(tag)
        ) || [];
        score += matchingTags.length * 15;

        // Artist matching
        if (song.artist === currentSong.artist) {
          score += 25;
        }

        // Language matching
        if (song.language === currentSong.language) {
          score += 10;
        }

        // Listening history boost
        const listenedMinutes = historyMap.get(song.file_id) || 0;
        score += Math.min(listenedMinutes * 2, 20); // Cap at 20 points

        // Popularity boost (likes and views)
        score += Math.log(1 + (song.likes || 0)) * 2;
        score += Math.log(1 + (song.views || 0)) * 1;

        // Liked songs boost
        if (userLikedSongs.has(song.file_id)) {
          score += 8;
        }

        // Add controlled randomness to avoid repetition
        score += Math.random() * 3;

        return {
          song: convertDatabaseSong(song, userLikedSongs.has(song.file_id)),
          score
        };
      });

      // 6. Sort by score and return top recommendations
      const recommendations = scoredSongs
        .sort((a, b) => b.score - a.score)
        .slice(0, 10) // Get more songs to have a buffer
        .map(entry => entry.song);

      console.log('🎵 Personalized recommendations:', recommendations.slice(0, 5).map(s => `${s.name} by ${s.artist}`));
      console.log('🎵 Total available songs:', availableSongs.length);
      
      return recommendations;
      
    } catch (error) {
      console.error('❌ Error in getPersonalizedSongs:', error);
      return [];
    }
  };

  // Fetch recently played songs based on listening history
  const fetchRecentlyPlayed = async () => {
    if (!user) {
      setRecentlyPlayedSongs([])
      return
    }

    try {
      // Get user's listening history sorted by minutes listened
      const { data: historyData, error: historyError } = await supabase
        .from('history')
        .select(`
          song_id,
          minutes_listened,
          songs (*)
        `)
        .eq('user_id', user.id)
        .order('minutes_listened', { ascending: false })
        .limit(9)

      if (historyError) {
        console.error('Error fetching recently played:', historyError)
        return
      }

      if (!historyData || historyData.length === 0) {
        setRecentlyPlayedSongs([])
        return
      }

      // Get user's liked songs for proper conversion
      const { data: likedData } = await supabase
        .from('liked_songs')
        .select('song_id')
        .eq('user_id', user.id)
      
      const userLikedSongs = new Set<number>()
      if (likedData) {
        likedData.forEach(item => userLikedSongs.add(item.song_id))
      }

      // Convert to Song format
      const recentSongs = historyData
        .filter(item => item.songs) // Ensure song data exists
        .map(item => convertDatabaseSong(item.songs, userLikedSongs.has(item.song_id)))

      setRecentlyPlayedSongs(recentSongs)
    } catch (error) {
      console.error('Error fetching recently played songs:', error)
      setRecentlyPlayedSongs([])
    }
  }

  // Fetch user playlists
  const fetchPlaylists = async () => {
    if (!user) {
      setPlaylists([])
      return
    }

    try {
      const { data: playlistsData, error } = await supabase
        .from('playlists')
        .select(`
          id,
          name,
          playlist_songs (
            songs (*)
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      const convertedPlaylists: Playlist[] = playlistsData?.map(playlist => {
        const playlistSongs = playlist.playlist_songs?.map((ps: any) => 
          convertDatabaseSong(ps.songs, likedSongs.has(ps.songs.file_id))
        ) || []

        return {
          id: playlist.id.toString(),
          name: playlist.name,
          songCount: playlistSongs.length,
          image: playlistSongs[0]?.image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300',
          songs: playlistSongs
        }
      }) || []

      setPlaylists(convertedPlaylists)
    } catch (error) {
      console.error('Error fetching playlists:', error)
    }
  }

  // Toggle like song
  const toggleLike = async (songId: string) => {
  if (!user) return;

  const songFileId = parseInt(songId);
  const isCurrentlyLiked = likedSongs.has(songFileId);

  try {
    if (isCurrentlyLiked) {
      // Remove from liked_songs
      const { error } = await supabase
        .from('liked_songs')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', songFileId);

      if (error) throw error;

      // Decrement likes
      await supabase.rpc('decrement_song_likes', { song_file_id: songFileId });

      setLikedSongs(prev => {
        const newSet = new Set(prev);
        newSet.delete(songFileId);
        return newSet;
      });
    } else {
      // Add to liked_songs
      const { error } = await supabase
        .from('liked_songs')
        .insert({
          user_id: user.id,
          song_id: songFileId,
        });

      if (error) throw error;

      // Increment likes
      await supabase.rpc('increment_song_likes', { song_file_id: songFileId });

      setLikedSongs(prev => new Set(prev).add(songFileId));
    }

    // Update songs state
    // Update songs state
setSongs(prevSongs =>
  prevSongs.map(song =>
    song.id === songId
      ? {
          ...song,
          isLiked: !isCurrentlyLiked,
          likes: song.likes + (isCurrentlyLiked ? -1 : 1),
        }
      : song
  )
);


    // Update playlists state
    setPlaylists(prevPlaylists =>
      prevPlaylists.map(playlist => ({
        ...playlist,
        songs: playlist.songs.map(song =>
          song.id === songId
            ? {
                ...song,
                isLiked: !isCurrentlyLiked,
                likes: song.likes + (isCurrentlyLiked ? -1 : 1),
              }
            : song
        ),
      }))
    );
  } catch (error) {
    console.error('Error toggling like:', error);
  }
};


  // Create playlist
  const createPlaylist = async (name: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          user_id: user.id,
          name
        })
        .select()
        .single()

      if (error) throw error

      const newPlaylist: Playlist = {
        id: data.id.toString(),
        name: data.name,
        songCount: 0,
        image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300',
        songs: []
      }

      setPlaylists(prev => [...prev, newPlaylist])
    } catch (error) {
      console.error('Error creating playlist:', error)
    }
  }

  // Delete playlist
  const deletePlaylist = async (playlistId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', parseInt(playlistId))
        .eq('user_id', user.id)

      if (error) throw error

      setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId))
    } catch (error) {
      console.error('Error deleting playlist:', error)
    }
  }

  // Rename playlist
  const renamePlaylist = async (playlistId: string, newName: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('playlists')
        .update({ name: newName })
        .eq('id', parseInt(playlistId))
        .eq('user_id', user.id)

      if (error) throw error

      setPlaylists(prev => 
        prev.map(playlist => 
          playlist.id === playlistId 
            ? { ...playlist, name: newName }
            : playlist
        )
      )
    } catch (error) {
      console.error('Error renaming playlist:', error)
    }
  }

  // Add song to playlist
  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: parseInt(playlistId),
          song_id: song.file_id
        })

      if (error) throw error

      setPlaylists(prev => 
        prev.map(playlist => {
          if (playlist.id === playlistId) {
            const songExists = playlist.songs.some(s => s.id === song.id)
            if (!songExists) {
              const updatedSongs = [...playlist.songs, song]
              return {
                ...playlist,
                songs: updatedSongs,
                songCount: updatedSongs.length,
                image: updatedSongs[0]?.image || playlist.image
              }
            }
          }
          return playlist
        })
      )
    } catch (error) {
      console.error('Error adding song to playlist:', error)
    }
  }

  // Remove song from playlist
  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', parseInt(playlistId))
        .eq('song_id', parseInt(songId))

      if (error) throw error

      setPlaylists(prev => 
        prev.map(playlist => {
          if (playlist.id === playlistId) {
            const updatedSongs = playlist.songs.filter(song => song.id !== songId)
            return {
              ...playlist,
              songs: updatedSongs,
              songCount: updatedSongs.length,
              image: updatedSongs[0]?.image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300'
            }
          }
          return playlist
        })
      )
    } catch (error) {
      console.error('Error removing song from playlist:', error)
    }
  }

  // Update last song in user profile
  const updateLastSong = async (songId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ last_song_file_id: parseInt(songId) })
        .eq('id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating last song:', error)
    }
  }

  // Record listening history with proper time tracking
  const recordListeningHistory = async (songId: string) => {
    if (!user) return

    // If there's a previous song playing, record its listening time
      if (currentSongRef.current && currentSongStartTime) {
    const endTime = new Date();
    const minutesListened = (endTime.getTime() - currentSongStartTime.getTime()) / (1000 * 60);

    if (minutesListened > 0.1) {
      try {
        const minutes = Math.round(minutesListened * 100) / 100;
        const { error } = await supabase.rpc('upsert_history_minutes', {
          user_uuid: user.id,
          song_file_id: parseInt(currentSongRef.current),
          minutes: minutes,
        });

        if (error) {
          console.error('❌ Error recording song history:', error);
        } else {
          console.log(`✅ History updated: +${minutes} mins for song ${currentSongRef.current}`);
        }
      } catch (error) {
        console.error('Error recording previous song history:', error);
      }
    }
  }


    // Set new song as current
    currentSongRef.current = songId
    setCurrentSongStartTime(new Date())
    
    // Update last song in user profile
    await updateLastSong(songId)
try {
  await supabase.rpc('increment_song_views', { song_file_id: parseInt(songId) });
} catch (error) {
  console.error('Error incrementing song views:', error);
}

  }

  // Stop current song tracking (when player is closed)
  const stopCurrentSongTracking = async () => {
    if (currentSongRef.current && currentSongStartTime && user) {
      const endTime = new Date()
      const minutesListened = (endTime.getTime() - currentSongStartTime.getTime()) / (1000 * 60)
      
      if (minutesListened > 0.1) {
  try {
    const minutes = Math.round(minutesListened * 100) / 100;
    const { error } = await supabase.rpc('upsert_history_minutes', {
      user_uuid: user.id,
      song_file_id: parseInt(currentSongRef.current),
      minutes: minutes,
    });

    if (error) {
      console.error('❌ Error recording song history on stop:', error);
    } else {
      console.log(`🛑 History updated on stop: +${minutes} mins for song ${currentSongRef.current}`);
    }
  } catch (error) {
    console.error('Error recording final song history:', error);
  }
}

    }

    currentSongRef.current = null
    setCurrentSongStartTime(null)
  }

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        // Reset data when user logs out
        setSongs([])
        setPlaylists([])
        setLikedSongs(new Set())
        setLastPlayedSong(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        await Promise.all([fetchSongs(), fetchPlaylists(), fetchRecentlyPlayed()])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  return {
    songs,
    playlists,
    likedSongs: songs.filter(song => song.isLiked),
    recentlyPlayedSongs,
    lastPlayedSong,
    loading,
    toggleLike,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    recordListeningHistory,
    stopCurrentSongTracking,
    refreshData: () => {
      fetchSongs()
      fetchPlaylists()
      fetchRecentlyPlayed()
    },
    getPersonalizedSongs,
    getSmartPersonalizedSongs
  }
}