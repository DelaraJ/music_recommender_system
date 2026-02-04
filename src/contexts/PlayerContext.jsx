import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const PlayerContext = createContext();

// API endpoint for tracking interactions
const INTERACT_API = "http://194.147.142.26:8081";

async function sendInteraction(songId, type) {
  try {
    await fetch(`${INTERACT_API}/${songId}/interact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type })
    });
  } catch (error) {
    console.error('Failed to send interaction:', error);
  }
}

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [repeat, setRepeat] = useState(false);
  const intervalRef = useRef(null);

  // Fake playback - update time every 100ms
  useEffect(() => {
    if (isPlaying && currentSong) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + 0.1;
          if (newTime >= duration) {
            // Song ended
            handleSongEnd();
            return duration;
          }
          return newTime;
        });
      }, 100);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isPlaying, currentSong, duration]);

  // Update duration when song changes
  useEffect(() => {
    if (currentSong) {
      setDuration(currentSong.duration || 0);
      setCurrentTime(0);
      
      // Send play interaction
      sendInteraction(currentSong.id, 'play');
    }
  }, [currentSong]);

  function handleSongEnd() {
    // Send completed interaction
    if (currentSong) {
      sendInteraction(currentSong.id, 'completed');
    }

    if (repeat) {
      // Restart current song
      setCurrentTime(0);
      setIsPlaying(true);
      sendInteraction(currentSong.id, 'repeat');
    } else {
      setIsPlaying(false);
      playNext();
    }
  }

  function playSong(song, newQueue = null) {
    setCurrentSong(song);
    setIsPlaying(true);
    if (newQueue) {
      setQueue(newQueue);
      setQueueIndex(newQueue.findIndex(s => s.id === song.id));
    }
  }

  function togglePlayPause() {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    
    // Send pause or resume interaction
    if (currentSong) {
      sendInteraction(currentSong.id, newIsPlaying ? 'resume' : 'pause');
    }
  }

  function seek(time) {
    setCurrentTime(time);
    
    // Send seek interaction
    if (currentSong) {
      sendInteraction(currentSong.id, 'seek');
    }
  }

  function changeVolume(newVolume) {
    setVolume(newVolume);
  }

  function playNext() {
    if (queue.length > 0 && queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      setCurrentSong(queue[nextIndex]);
      setIsPlaying(true);
      
      // Send skip interaction for previous song
      if (currentSong) {
        sendInteraction(currentSong.id, 'skip');
      }
    }
  }

  function playPrevious() {
    if (queue.length > 0 && queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      setCurrentSong(queue[prevIndex]);
      setIsPlaying(true);
      
      // Send previous interaction
      if (currentSong) {
        sendInteraction(currentSong.id, 'previous');
      }
    } else if (currentTime > 3) {
      // Restart current song if more than 3 seconds in
      seek(0);
    }
  }

  function toggleRepeat() {
    setRepeat(!repeat);
  }

  function addToQueue(song) {
    setQueue(prev => [...prev, song]);
  }

  function clearQueue() {
    setQueue([]);
    setQueueIndex(-1);
  }

  // Send like/unlike interaction (called from outside)
  function handleLikeInteraction(songId, isLiked) {
    sendInteraction(songId, isLiked ? 'like' : 'unlike');
  }

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        repeat,
        playSong,
        togglePlayPause,
        seek,
        changeVolume,
        playNext,
        playPrevious,
        toggleRepeat,
        addToQueue,
        clearQueue,
        handleLikeInteraction
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}