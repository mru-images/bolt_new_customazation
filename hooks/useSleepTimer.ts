import { useState, useEffect, useRef, useCallback } from 'react';

export function useSleepTimer() {
  const [sleepTimer, setSleepTimer] = useState<number | 'after-song' | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimerEndRef = useRef<(() => void) | null>(null);

  const startTimer = useCallback((minutes: number | 'after-song', onTimerEnd: () => void) => {
    // Clear any existing timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setSleepTimer(minutes);
    onTimerEndRef.current = onTimerEnd;

    if (typeof minutes === 'number') {
      setRemainingTime(minutes);
      
      intervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev === null || prev <= 1) {
            // Timer finished
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setSleepTimer(null);
            setRemainingTime(null);
            
            // Call the timer end callback
            if (onTimerEndRef.current) {
              onTimerEndRef.current();
            }
            
            return null;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute
    } else {
      // 'after-song' mode
      setRemainingTime(null);
    }
  }, []);

  const cancelTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSleepTimer(null);
    setRemainingTime(null);
    onTimerEndRef.current = null;
  }, []);

  const triggerAfterSongTimer = useCallback(() => {
    if (sleepTimer === 'after-song' && onTimerEndRef.current) {
      setSleepTimer(null);
      setRemainingTime(null);
      onTimerEndRef.current();
      onTimerEndRef.current = null;
    }
  }, [sleepTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    sleepTimer,
    remainingTime,
    startTimer,
    cancelTimer,
    triggerAfterSongTimer,
    isActive: sleepTimer !== null
  };
}