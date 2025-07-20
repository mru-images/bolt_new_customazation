import { useState, useCallback } from 'react';
import { Song } from '@/types';

export interface QueueItem {
  id: string;
  song: Song;
  addedAt: Date;
}

export function useQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const addToQueue = useCallback((song: Song) => {
    const queueItem: QueueItem = {
      id: `${song.id}-${Date.now()}`,
      song,
      addedAt: new Date()
    };
    
    setQueue(prev => [...prev, queueItem]);
  }, []);

  const removeFromQueue = useCallback((itemId: string) => {
    setQueue(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const getNextSongFromQueue = useCallback((): Song | null => {
    if (queue.length === 0) return null;
    
    const nextItem = queue[0];
    setQueue(prev => prev.slice(1)); // Remove the first item
    return nextItem.song;
  }, [queue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const moveQueueItem = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const [movedItem] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedItem);
      return newQueue;
    });
  }, []);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    getNextSongFromQueue,
    clearQueue,
    moveQueueItem,
    hasQueue: queue.length > 0
  };
}