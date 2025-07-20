'use client'

import AddToPlaylistModal from '@/components/AddToPlaylistModal';
import AuthWrapper from '@/components/AuthWrapper';
import CreatePlaylistModal from '@/components/CreatePlaylistModal';
import HomePage from '@/components/HomePage';
import LikedSongsPage from '@/components/LikedSongsPage';
import MaximizedPlayer from '@/components/MaximizedPlayer';
import MinimizedPlayer from '@/components/MinimizedPlayer';
import PlaylistsPage from '@/components/PlaylistsPage';
import SearchPage from '@/components/SearchPage';
import SettingsPage from '@/components/SettingsPage';
import SleepTimerModal from '@/components/SleepTimerModal';
import { useTheme } from '@/components/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useQueue } from '@/hooks/useQueue';
import { useSleepTimer } from '@/hooks/useSleepTimer';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Song } from '@/types';
import { Home as HomeIcon, Search, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';


function MusicPlayerContent() {
  const { user } = useAuth();
  const {
    songs,
    personalizedSongs,
    playlists,
    likedSongs,
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
    getPersonalizedSongs,
    getSmartPersonalizedSongs
  } = useSupabaseData(user);

  const {
    queue,
    addToQueue,
    removeFromQueue,
    getNextSongFromQueue,
    clearQueue,
    hasQueue
  } = useQueue();

  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'settings'>('home');
  const [currentPage, setCurrentPage] = useState<'main' | 'playlists' | 'liked'>('main');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerMaximized, setIsPlayerMaximized] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<Song | null>(null);
  const [hasSetLastPlayedSong, setHasSetLastPlayedSong] = useState(false);
  const [lastPlayedSongDismissed, setLastPlayedSongDismissed] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [displayCount, setDisplayCount] = useState(15);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); // default 75%
  const [isSeeking, setIsSeeking] = useState(false);
  const [pendingSeekTime, setPendingSeekTime] = useState<number | null>(null);
  const [isExternallySeeking, setIsExternallySeeking] = useState(false);
  const [recommendedQueue, setRecommendedQueue] = useState<Song[]>([])
  const [playedSongs, setPlayedSongs] = useState<Set<string>>(new Set())  
  const [personalizedList, setPersonalizedList] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [listenedSongs, setListenedSongs] = useState<Set<string>>(new Set());
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Smart recommendation system state
  const [currentBatchListenedSongs, setCurrentBatchListenedSongs] = useState<Song[]>([]);
  const [songStartTime, setSongStartTime] = useState<Date | null>(null);
  const [batchStartIndex, setBatchStartIndex] = useState(0);

  // Shuffle and repeat state
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(true); // Shuffle on by default
  const [repeatMode, setRepeatMode] = useState<'off' | 'once' | 'infinite'>('off');

  // Sleep timer
  const {
    sleepTimer,
    remainingTime,
    startTimer,
    cancelTimer,
    triggerAfterSongTimer,
    isActive: isSleepTimerActive
  } = useSleepTimer();

const loadMoreSongs = () => {
  setDisplayCount(prev => prev + 15);
};

const displayedSongs = songs.slice(0, displayCount);
useEffect(() => {
  const loadAudio = async () => {
    if (currentSong?.file_id) {
      const url = `/api/audio-proxy?fileid=${currentSong.file_id}`;
      setAudioUrl(url);

      setDuration(0);
      setCurrentTime(0);
      setPendingSeekTime(null);
    }
  };

  loadAudio();
}, [currentSong?.file_id]);

useEffect(() => {
  if (audioRef.current) {
    audioRef.current.volume = volume;
  }
}, [volume]);

useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  if (!isNaN(audio.duration) && isPlaying) {
    // Duration is valid, safe to play
    audio.play().catch((e) => {
      console.error('Playback error:', e);
    });
  } else if (!isPlaying) {
    audio.pause();
  }
}, [isPlaying]);




// Load images for currently displayed songs
useEffect(() => {
  const fetchImages = async () => {
    const newUrls: Record<string, string> = {};

    // Songs from the main feed
    const songsToLoad = songs.slice(0, displayCount);
    for (const song of songsToLoad) {
      if (!imageUrls[song.id]) {
        newUrls[song.id] = `/api/image-proxy?fileid=${song.img_id}`;
      }
    }

    // Songs from playlists
    for (const playlist of playlists) {
      for (const song of playlist.songs) {
        if (!imageUrls[song.id]) {
          newUrls[song.id] = `/api/image-proxy?fileid=${song.img_id}`;
        }
      }
    }

    // Liked songs
    for (const song of likedSongs) {
      if (!imageUrls[song.id]) {
        newUrls[song.id] = `/api/image-proxy?fileid=${song.img_id}`;
      }
    }

    // Recently played songs
    for (const song of recentlyPlayedSongs) {
      if (!imageUrls[song.id]) {
        newUrls[song.id] = `/api/image-proxy?fileid=${song.img_id}`;
      }
    }

    // Apply if new URLs found
    if (Object.keys(newUrls).length > 0) {
      setImageUrls(prev => ({ ...prev, ...newUrls }));
    }
  };

  fetchImages();
}, [displayCount, songs, playlists, likedSongs, recentlyPlayedSongs]);


useEffect(() => {
  console.log('🎵 personalizedList updated:', personalizedList);
}, [personalizedList]);

  // Set last played song as current song when data loads (only once and if not dismissed)
useEffect(() => {
  const loadLastPlayedImage = async () => {
    if (user && lastPlayedSong && !hasSetLastPlayedSong && !lastPlayedSongDismissed) {
      try {
        console.log('🎵 Loading initial personalized songs for last played song');
        const initialRecs = await getPersonalizedSongs(user.id, lastPlayedSong, listenedSongs);
        const filtered = initialRecs.filter(song => !playedSongs.has(song.file_id.toString()));
        const newPersonalizedList = [lastPlayedSong, ...filtered.slice(0, 4)];
        setPersonalizedList(newPersonalizedList);
        console.log('✅ Initial personalized list set:', newPersonalizedList.length, 'songs');
      } catch (error) {
        console.error('❌ Error loading initial personalized songs:', error);
        setPersonalizedList([lastPlayedSong]);
      }
      
      setCurrentSong(lastPlayedSong);
      setHasSetLastPlayedSong(true);

      // Add to listened songs and log
      setListenedSongs(prev => {
        const newSet = new Set(prev);
        newSet.add(lastPlayedSong.file_id.toString());
        console.log('🎵 Listened Songs List:', Array.from(newSet));
        return newSet;
      });

      if (!imageUrls[lastPlayedSong.img_id]) {
        const url = `/api/image-proxy?fileid=${lastPlayedSong.img_id}`;
        setImageUrls((prev) => ({
          ...prev,
          [lastPlayedSong.img_id]: url
        }));
      }
    }
  };

  loadLastPlayedImage();
}, [lastPlayedSong, hasSetLastPlayedSong, lastPlayedSongDismissed, user, getPersonalizedSongs]);


const handleSongPlay = async (song: Song) => {
  // Record if previous song was listened to (>20 seconds)
  if (currentSong && songStartTime) {
    const listenDuration = (new Date().getTime() - songStartTime.getTime()) / 1000;
    if (listenDuration > 20) {
      console.log(`✅ User listened to "${currentSong.name}" for ${listenDuration.toFixed(1)} seconds`);
      setCurrentBatchListenedSongs(prev => {
        const exists = prev.some(s => s.file_id === currentSong.file_id);
        if (!exists) {
          const updated = [...prev, currentSong];
          console.log('🎵 Current batch listened songs:', updated.map(s => s.name));
          return updated;
        }
        return prev;
      });
    } else {
      console.log(`⏭️ User skipped "${currentSong.name}" after ${listenDuration.toFixed(1)} seconds`);
    }
  }

  setCurrentSong(song);
  setIsPlaying(true);
  setLastPlayedSongDismissed(false);
  recordListeningHistory(song.id);
  setSongStartTime(new Date()); // Track when this song started

  // Add to listened songs and log
  setListenedSongs(prev => {
    const newSet = new Set(prev);
    newSet.add(song.file_id.toString());
    console.log('🎵 Listened Songs List:', Array.from(newSet));
    return newSet;
  });

  setPlayedSongs((prev) => {
    const updated = new Set(prev);
    updated.add(song.file_id.toString());
    return updated;
  });

  if (user) {
    try {
      console.log('🎵 Fetching personalized songs for:', song.name);
      const recs = await getPersonalizedSongs(user.id, song, listenedSongs);
      const filtered = recs.filter(s => !playedSongs.has(s.file_id.toString()));
      const newPersonalizedList = [song, ...filtered.slice(0, 4)];
      setPersonalizedList(newPersonalizedList);
      setCurrentSongIndex(0);
      setBatchStartIndex(0);
      setCurrentBatchListenedSongs([]); // Reset batch for new song selection
      console.log('✅ New personalized list set:', newPersonalizedList.length, 'songs');
    } catch (error) {
      console.error('❌ Error fetching personalized songs:', error);
      setPersonalizedList([song]);
      setCurrentSongIndex(0);
      setBatchStartIndex(0);
      setCurrentBatchListenedSongs([]);
    }
  }
};


  const handleAddToQueue = (song: Song) => {
  addToQueue(song);
  toast.success(`Added "${song.name}" to queue`);
};

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const togglePlayerSize = () => {
    setIsPlayerMaximized(!isPlayerMaximized);
  };

  const closePlayer = async () => {
    // Stop tracking current song before closing
    await stopCurrentSongTracking();
    setCurrentSong(null);
    setIsPlaying(false);
    setIsPlayerMaximized(false);
    
    // Mark last played song as dismissed so it won't auto-load again
    setLastPlayedSongDismissed(true);
  };

  const handleToggleLike = (songId: string) => {
    toggleLike(songId);
    
    // Update current song state if it's the one being liked/unliked
    if (currentSong && currentSong.id === songId) {
      setCurrentSong(prev => prev ? { ...prev, isLiked: !prev.isLiked } : null);
    }
  };

const handlePrevious = () => {
  // Record if current song was listened to before going to previous
  if (currentSong && songStartTime) {
    const listenDuration = (new Date().getTime() - songStartTime.getTime()) / 1000;
    if (listenDuration > 20) {
      console.log(`✅ User listened to "${currentSong.name}" for ${listenDuration.toFixed(1)} seconds`);
      setCurrentBatchListenedSongs(prev => {
        const exists = prev.some(s => s.file_id === currentSong.file_id);
        if (!exists) {
          const updated = [...prev, currentSong];
          console.log('🎵 Current batch listened songs:', updated.map(s => s.name));
          return updated;
        }
        return prev;
      });
    }
  }

  if (!currentSong) return;

  // Check if there's a previous song in the personalized list
  if (currentSongIndex > 0) {
    const prevIndex = currentSongIndex - 1;
    const prevSong = personalizedList[prevIndex];
    
    if (prevSong) {
      setCurrentSong(prevSong);
      setCurrentSongIndex(prevIndex);
      setIsPlaying(true);
      setLastPlayedSongDismissed(false);
      recordListeningHistory(prevSong.id);
      setSongStartTime(new Date());

      // Add to listened songs and log
      setListenedSongs(prev => {
        const newSet = new Set(prev);
        newSet.add(prevSong.file_id.toString());
        console.log('🎵 Listened Songs List:', Array.from(newSet));
        return newSet;
      });

      setPlayedSongs((prev) => {
        const updated = new Set(prev);
        updated.add(prevSong.file_id.toString());
        return updated;
      });

      // Preload image
      if (!imageUrls[prevSong.img_id]) {
        const newUrl = `/api/image-proxy?fileid=${prevSong.img_id}`;
        setImageUrls(prev => ({ ...prev, [prevSong.img_id]: newUrl }));
      }
    }
  } else {
    // If at the beginning, just restart current song
    setCurrentTime(0);
    setIsPlaying(true);
  }
};

useEffect(() => {
  if (!currentSong) return;

  const currentIndex = songs.findIndex(song => song.id === currentSong.id);
  const nextIndex = currentIndex < songs.length - 1 ? currentIndex + 1 : 0;
  const nextSong = songs[nextIndex];

  // Preload next song image if not in cache
  if (nextSong && !imageUrls[nextSong.img_id]) {
    const newUrl = `/api/image-proxy?fileid=${nextSong.img_id}`;
    setImageUrls(prev => ({ ...prev, [nextSong.img_id]: newUrl }));
  }
}, [currentSong, songs]);

const handleLoadedMetadata = async () => {
  const audio = audioRef.current;
  if (!audio) return;

  const loadedDuration = audio.duration;

  if (!isNaN(loadedDuration) && isFinite(loadedDuration)) {
    setDuration(loadedDuration);

    if (pendingSeekTime !== null) {
      audio.currentTime = pendingSeekTime;
      setCurrentTime(pendingSeekTime);
      setPendingSeekTime(null);
    } else {
      setCurrentTime(audio.currentTime);
    }

    try {
      if (isPlaying) {
        await audio.play();
      }
    } catch (err) {
      console.error('Auto-play error after metadata load:', err);
    }

  } else {
    // Retry metadata read
    setTimeout(handleLoadedMetadata, 100);
  }
};



const handleNext = async () => {
  // Record if current song was listened to before going to next
  if (currentSong && songStartTime) {
    const listenDuration = (new Date().getTime() - songStartTime.getTime()) / 1000;
    if (listenDuration > 20) {
      console.log(`✅ User listened to "${currentSong.name}" for ${listenDuration.toFixed(1)} seconds`);
      setCurrentBatchListenedSongs(prev => {
        const exists = prev.some(s => s.file_id === currentSong.file_id);
        if (!exists) {
          const updated = [...prev, currentSong];
          console.log('🎵 Current batch listened songs:', updated.map(s => s.name));
          return updated;
        }
        return prev;
      });
    } else {
      console.log(`⏭️ User skipped "${currentSong.name}" after ${listenDuration.toFixed(1)} seconds`);
    }
  }

  if (!currentSong) return;

  // Check if there's a song in the queue first
  const nextQueueSong = getNextSongFromQueue();
  if (nextQueueSong) {
    setCurrentSong(nextQueueSong);
    setIsPlaying(true);
    setLastPlayedSongDismissed(false);
    recordListeningHistory(nextQueueSong.id);
    setSongStartTime(new Date());
    
    // Add to listened songs and log
    setListenedSongs(prev => {
      const newSet = new Set(prev);
      newSet.add(nextQueueSong.file_id.toString());
      console.log('🎵 Listened Songs List:', Array.from(newSet));
      return newSet;
    });
    
    // Update personalized list with the queue song
    if (user) {
      const recs = await getPersonalizedSongs(user.id, nextQueueSong, listenedSongs);
      const filtered = recs.filter(s => !playedSongs.has(String(s.file_id)));
      const newPersonalizedList = [nextQueueSong, ...filtered.slice(0, 4)];
      setPersonalizedList(newPersonalizedList);
      setCurrentSongIndex(0);
    }
    
    // Preload image
    if (!imageUrls[nextQueueSong.img_id]) {
      const newUrl = `/api/image-proxy?fileid=${nextQueueSong.img_id}`;
      setImageUrls(prev => ({ ...prev, [nextQueueSong.img_id]: newUrl }));
    }
    return;
  }

  // Check if we're at the second-to-last song and need to fetch smart recommendations
  if (currentSongIndex === personalizedList.length - 2 && !isFetchingMore && user && currentSong) {
    console.log('🧠 At second-to-last song, checking for smart recommendations...');
    setIsFetchingMore(true);
    
    try {
      let newRecs: Song[] = [];
      
      // If we have songs that user actually listened to in current batch, use smart recommendations
      if (currentBatchListenedSongs.length > 0) {
        console.log('🧠 Using smart recommendations based on listened songs');
        newRecs = await getSmartPersonalizedSongs(
          user.id, 
          currentBatchListenedSongs, 
          new Set([...Array.from(listenedSongs), ...personalizedList.map(s => s.file_id.toString())])
        );
      } else {
        console.log('🎵 No listened songs in batch, using regular recommendations');
        newRecs = await getPersonalizedSongs(user.id, currentSong, listenedSongs);
      }
      
      const filtered = newRecs.filter(song => 
        !playedSongs.has(song.file_id.toString()) &&
        !listenedSongs.has(song.file_id.toString()) &&
        !personalizedList.some(existing => existing.file_id === song.file_id)
      );
      
      if (filtered.length > 0) {
        setPersonalizedList(prev => [...prev, ...filtered.slice(0, 5)]);
        console.log('✅ Added', filtered.slice(0, 5).length, 'smart recommendations to personalized list');
      }
    } catch (error) {
      console.error('❌ Error fetching smart recommendations:', error);
    } finally {
      setIsFetchingMore(false);
    }
  }

  // If no queue, proceed with personalized list
  const nextIndex = currentSongIndex + 1;

  if (nextIndex < personalizedList.length) {
    const nextSong = personalizedList[nextIndex];
    setCurrentSong(nextSong);
    setCurrentSongIndex(nextIndex);
    setIsPlaying(true);
    setLastPlayedSongDismissed(false);
    recordListeningHistory(nextSong.id);
    setSongStartTime(new Date());

    // Add to listened songs and log
    setListenedSongs(prev => {
      const newSet = new Set(prev);
      newSet.add(nextSong.file_id.toString());
      console.log('🎵 Listened Songs List:', Array.from(newSet));
      return newSet;
    });

    setPlayedSongs((prev) => {
      const updated = new Set(prev);
      updated.add(String(nextSong.file_id));
      return updated;
    });

    // Preload image
    if (!imageUrls[nextSong.img_id]) {
      const newUrl = `/api/image-proxy?fileid=${nextSong.img_id}`;
      setImageUrls(prev => ({ ...prev, [nextSong.img_id]: newUrl }));
    }

  } else {
    // If we've reached the end of personalized list, get new smart recommendations
    if (user && currentSong) {
      try {
        console.log('🧠 Reached end of list, fetching new smart recommendations');
        
        let newRecs: Song[] = [];
        
        // Use smart recommendations if we have listened songs in current batch
        if (currentBatchListenedSongs.length > 0) {
          console.log('🧠 Using smart recommendations for new batch');
          newRecs = await getSmartPersonalizedSongs(
            user.id, 
            currentBatchListenedSongs, 
            listenedSongs
          );
        } else {
          console.log('🎵 Using regular recommendations for new batch');
          newRecs = await getPersonalizedSongs(user.id, currentSong, listenedSongs);
        }
        
        const filtered = newRecs.filter(song => 
          !playedSongs.has(song.file_id.toString()) &&
          !listenedSongs.has(song.file_id.toString())
        );
        
        if (filtered.length > 0) {
          const nextSong = filtered[0];
          setCurrentSong(nextSong);
          setIsPlaying(true);
          setLastPlayedSongDismissed(false);
          recordListeningHistory(nextSong.id);
          setSongStartTime(new Date());
          
          // Add to listened songs and log
          setListenedSongs(prev => {
            const newSet = new Set(prev);
            newSet.add(nextSong.file_id.toString());
            console.log('🎵 Listened Songs List:', Array.from(newSet));
            return newSet;
          });
          
          // Create new personalized list starting with this song
          const newPersonalizedList = [nextSong, ...filtered.slice(1, 5)];
          setPersonalizedList(newPersonalizedList);
          setCurrentSongIndex(0);
          setBatchStartIndex(0);
          setCurrentBatchListenedSongs([]); // Reset batch for new recommendations
          
          setPlayedSongs((prev) => {
            const updated = new Set(prev);
            updated.add(nextSong.file_id.toString());
            return updated;
          });
          
          // Preload image
          if (!imageUrls[nextSong.img_id]) {
            const newUrl = `/api/image-proxy?fileid=${nextSong.img_id}`;
            setImageUrls(prev => ({ ...prev, [nextSong.img_id]: newUrl }));
          }
          
          console.log('✅ New smart recommendations loaded:', newPersonalizedList.length, 'songs');
        } else {
          console.warn('⚠️ No more smart recommendations available');
        }
      } catch (error) {
        console.error('❌ Error fetching new smart recommendations:', error);
      }
    }
  }
};




  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleAddToPlaylist = (song: Song) => {
    setSelectedSongForPlaylist(song);
    setShowAddToPlaylistModal(true);
  };

  const handleSongEnd = async () => {
    // Check if sleep timer is set to "after-song" and trigger it
    if (sleepTimer === 'after-song') {
      triggerAfterSongTimer();
      return;
    }
    
    // Record if song was listened to completely (assume >20 seconds if it ended naturally)
    if (currentSong && songStartTime) {
      const listenDuration = (new Date().getTime() - songStartTime.getTime()) / 1000;
      console.log(`🎵 Song "${currentSong.name}" ended after ${listenDuration.toFixed(1)} seconds`);
      
      if (listenDuration > 20) {
        setCurrentBatchListenedSongs(prev => {
          const exists = prev.some(s => s.file_id === currentSong.file_id);
          if (!exists) {
            const updated = [...prev, currentSong];
            console.log('🎵 Current batch listened songs:', updated.map(s => s.name));
            return updated;
          }
          return prev;
        });
      }
    }
    
    // Handle repeat modes
    if (repeatMode === 'once' || repeatMode === 'infinite') {
      // Restart the current song
      setCurrentTime(0);
      setIsPlaying(true);
      setSongStartTime(new Date());
      
      // If repeat once, turn off repeat after playing once
      if (repeatMode === 'once') {
        setRepeatMode('off');
      }
      return;
    }
    
    // When a song ends, automatically play the next one
    await handleNext();
};

  const handleSleepTimerSet = (minutes: number | 'after-song' | null) => {
    if (minutes === null) {
      cancelTimer();
    } else {
      startTimer(minutes, () => {
        setIsPlaying(false);
        toast.success('Sleep timer ended - music stopped');
      });
      
      if (typeof minutes === 'number') {
        toast.success(`Sleep timer set for ${minutes} minutes`);
      } else {
        toast.success('Sleep timer set to stop after current song');
      }
    }
  };

  const renderContent = () => {
    if (currentPage === 'playlists') {
      return (
        <PlaylistsPage 
          playlists={playlists} 
          onBack={() => setCurrentPage('main')} 
          onSongPlay={handleSongPlay}
          onAddToQueue={handleAddToQueue}
          onCreatePlaylist={() => setShowCreatePlaylistModal(true)}
          onDeletePlaylist={deletePlaylist}
          onRenamePlaylist={renamePlaylist}
          onRemoveSongFromPlaylist={removeSongFromPlaylist}
          imageUrls={imageUrls}
          clearQueue={clearQueue}
        />
      );
    }
    
    if (currentPage === 'liked') {
      return <LikedSongsPage songs={likedSongs} onBack={() => setCurrentPage('main')} onSongPlay={handleSongPlay} onAddToQueue={handleAddToQueue} imageUrls={imageUrls} clearQueue={clearQueue}/>;
    }

    switch (activeTab) {
      case 'home':
        return <HomePage
                songs={displayedSongs}
                personalizedSongs={personalizedSongs}
                recentlyPlayedSongs={recentlyPlayedSongs}
                onSongPlay={handleSongPlay}
                formatNumber={formatNumber}
                onAddToPlaylist={handleAddToPlaylist}
                onAddToQueue={handleAddToQueue}
                imageUrls={imageUrls}
                onLoadMore={loadMoreSongs}
                hasMoreSongs={displayCount < songs.length}
              />;
      case 'search':
        return <SearchPage
              songs={songs}
              onSongPlay={handleSongPlay}
              formatNumber={formatNumber}
              onAddToPlaylist={handleAddToPlaylist}
              onAddToQueue={handleAddToQueue}
              imageUrls={imageUrls}
              setImageUrls={setImageUrls}
            />;
      case 'settings':
        return <SettingsPage onPlaylistsClick={() => setCurrentPage('playlists')} onLikedClick={() => setCurrentPage('liked')} />;
      default:
        return <HomePage
              songs={displayedSongs}
              personalizedSongs={personalizedSongs}
              recentlyPlayedSongs={recentlyPlayedSongs}
              onSongPlay={handleSongPlay}
              formatNumber={formatNumber}
              onAddToPlaylist={handleAddToPlaylist}
              onAddToQueue={handleAddToQueue}
              imageUrls={imageUrls}
              onLoadMore={loadMoreSongs}
              hasMoreSongs={displayCount < songs.length}
            />;
    }
  };

  const themeClasses = isDarkMode 
    ? 'bg-gray-900 text-white' 
    : 'bg-gray-50 text-gray-900';
const setCurrentTimeState = setCurrentTime;

  return (
    
      <div className={`min-h-screen ${themeClasses} relative overflow-hidden`}>
        {/* Main Content */}
        <div className={`transition-all duration-300 ${currentSong ? 'pb-36' : 'pb-20'}`}>
          {renderContent()}
        </div>

        {/* Bottom Navigation */}
        {currentPage === 'main' && (
          <div className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t z-30`}>
            <div className="flex items-center justify-around py-3">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
                  activeTab === 'home' ? 'text-purple-400' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <HomeIcon size={24} />
                <span className="text-xs">Home</span>
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
                  activeTab === 'search' ? 'text-purple-400' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Search size={24} />
                <span className="text-xs">Search</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
                  activeTab === 'settings' ? 'text-purple-400' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Settings size={24} />
                <span className="text-xs">Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Music Player - Only show if currentSong exists */}
        {currentSong && (
          <>
            {!isPlayerMaximized ? (
              <MinimizedPlayer
                song={currentSong}
                isPlaying={isPlaying}
                imageUrl={imageUrls[currentSong.img_id]}
                onTogglePlay={togglePlay}
                onMaximize={togglePlayerSize}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onClose={closePlayer}
                onToggleLike={() => handleToggleLike(currentSong.id)}
                formatNumber={formatNumber}
                currentTime={currentTime}
                duration={duration}
              />
            ) : (
              <MaximizedPlayer
                song={currentSong}
                isPlaying={isPlaying}
                imageUrl={imageUrls[currentSong.img_id]}
                onTogglePlay={togglePlay}
                onMinimize={togglePlayerSize}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onToggleLike={() => handleToggleLike(currentSong.id)}
                formatNumber={formatNumber}
                onAddToPlaylist={() => handleAddToPlaylist(currentSong)}
                currentTime={currentTime}
                duration={duration}

              setCurrentTime={(seekTime) => {
  if (audioRef.current && !isNaN(audioRef.current.duration)) {
    setIsExternallySeeking(true);
    audioRef.current.currentTime = seekTime;
    setCurrentTimeState(seekTime);
    setTimeout(() => setIsExternallySeeking(false), 200);
  } else {
    setPendingSeekTime(seekTime); // Will apply onLoadedMetadata
  }
}}



                volume={volume}
                setVolume={setVolume}
                isSeeking={isSeeking}
                setIsSeeking={setIsSeeking}
                queue={queue}
                onRemoveFromQueue={removeFromQueue}
                onSongPlay={handleSongPlay}
                imageUrls={imageUrls}
                isShuffleEnabled={isShuffleEnabled}
                setIsShuffleEnabled={setIsShuffleEnabled}
                repeatMode={repeatMode}
                setRepeatMode={setRepeatMode}
                sleepTimer={sleepTimer}
                remainingTime={remainingTime}
                onOpenSleepTimer={() => setShowSleepTimerModal(true)}
              />
            )}
          </>
        )}

        {/* Modals */}
        <CreatePlaylistModal
          isOpen={showCreatePlaylistModal}
          onClose={() => setShowCreatePlaylistModal(false)}
          onCreatePlaylist={createPlaylist}
        />

        <AddToPlaylistModal
          isOpen={showAddToPlaylistModal}
          onClose={() => {
            setShowAddToPlaylistModal(false);
            setSelectedSongForPlaylist(null);
          }}
          song={selectedSongForPlaylist}
          playlists={playlists}
          onAddToPlaylist={addSongToPlaylist}
          onCreatePlaylist={() => {
            setShowAddToPlaylistModal(false);
            setShowCreatePlaylistModal(true);
          }}
          imageUrls={imageUrls}
          setImageUrls={setImageUrls}
        />

        <SleepTimerModal
          isOpen={showSleepTimerModal}
          onClose={() => setShowSleepTimerModal(false)}
          onSetTimer={handleSleepTimerSet}
          currentTimer={sleepTimer}
        />
        <audio
          ref={audioRef}
          src={audioUrl ?? undefined}
          onEnded={handleSongEnd}
          onTimeUpdate={() => {
          if (audioRef.current && !isSeeking && !isExternallySeeking) {
            const current = audioRef.current.currentTime;
            // Only update state if the difference is significant
            if (Math.abs(currentTime - current) > 0.25) {
              setCurrentTime(current);
            }
          }
        }}


          onLoadedMetadata={handleLoadedMetadata}
          onVolumeChange={() => {
            if (audioRef.current) {
              setVolume(audioRef.current.volume);
            }
          }}
          style={{ display: 'none' }}
        />

      </div>
  );
}

export default function MusicPlayerApp() {
  return (
    <AuthWrapper>
      <Toaster position="bottom-center" />
      <MusicPlayerContent />
    </AuthWrapper>
  );
}