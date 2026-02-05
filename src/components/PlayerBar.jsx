import React, { useState } from "react";
import { usePlayer } from "../contexts/PlayerContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useData } from "../contexts/DataContext.jsx";

export default function PlayerBar() {
  const { currentSong, isPlaying, currentTime, duration, volume, repeat, togglePlayPause, seek, changeVolume, playNext, playPrevious, toggleRepeat } = usePlayer();
  const { user } = useAuth();
  const { toggleLike, toggleDislike, songs } = useData();
  const [showVolume, setShowVolume] = useState(false);

  if (!currentSong) return null;

  // Find the current song in the songs array to get its state
  const songInList = songs.find(s => s.id === currentSong.id);
  const songState = songInList?.state || currentSong.state || 'none';

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  }

  async function handleToggleLike() {
    if (!user) return;
    try {
      await toggleLike(currentSong.id, songState);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  }

  async function handleToggleDislike() {
    if (!user) return;
    try {
      await toggleDislike(currentSong.id, songState);
    } catch (error) {
      console.error("Failed to toggle dislike:", error);
    }
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player-bar">
      <div className="player-content">
        {/* Song Info */}
        <div className="player-song-info">
          <img src={currentSong.cover} alt={currentSong.title} />
          <div>
            <div className="player-title">{currentSong.title}</div>
            <div className="player-artist">{currentSong.artist}</div>
          </div>
          {user && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="player-like-btn"
                onClick={handleToggleLike}
                title={songState === 'liked' ? "Unlike" : "Like"}
                style={{ padding: 0, width: 24, height: 24 }}
              >
                <img 
                  src={songState === 'liked' ? "/like_filled.svg" : "/like_initial.svg"} 
                  alt="Like" 
                  style={{ width: '100%', height: '100%', filter: songState === 'liked' ? 'none' : 'brightness(0) saturate(100%) invert(71%) sepia(0%) saturate(0%) hue-rotate(212deg) brightness(94%) contrast(89%)' }}
                />
              </button>
              <button 
                className="player-like-btn"
                onClick={handleToggleDislike}
                title={songState === 'disliked' ? "Remove dislike" : "Dislike"}
                style={{ padding: 0, width: 24, height: 24 }}
              >
                <img 
                  src={songState === 'disliked' ? "/dislike_filled.svg" : "/dislike_initial.svg"} 
                  alt="Dislike" 
                  style={{ width: '100%', height: '100%', filter: songState === 'disliked' ? 'none' : 'brightness(0) saturate(100%) invert(71%) sepia(0%) saturate(0%) hue-rotate(212deg) brightness(94%) contrast(89%)' }}
                />
              </button>
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="player-controls">
          <div className="player-buttons">
            <button className="player-control-btn" onClick={playPrevious} title="Previous">
              ⏮
            </button>
            <button className="player-play-btn" onClick={togglePlayPause} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button className="player-control-btn" onClick={playNext} title="Next">
              ⏭
            </button>
            {/* <button 
              className={`player-control-btn ${repeat ? "active" : ""}`} 
              onClick={toggleRepeat} 
              title={repeat ? "Repeat: On" : "Repeat: Off"}
            >
              🔁
            </button> */}
          </div>
          
          <div className="player-progress-container">
            <span className="player-time">{formatTime(currentTime)}</span>
            <div className="player-progress-bar" onClick={handleSeek}>
              <div className="player-progress-fill" style={{ width: `${progress}%` }}>
                <div className="player-progress-thumb"></div>
              </div>
            </div>
            <span className="player-time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="player-volume" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
          <button className="player-volume-btn">
            {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
          </button>
          {showVolume && (
            <div className="player-volume-slider-container">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="player-volume-slider"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}