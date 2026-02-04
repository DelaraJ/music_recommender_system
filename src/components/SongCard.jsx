import React, { useState } from "react";
import { usePlayer } from "../contexts/PlayerContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useData } from "../contexts/DataContext.jsx";

export default function PlayerBar() {
  const { currentSong, isPlaying, currentTime, duration, volume, repeat, togglePlayPause, seek, changeVolume, playNext, playPrevious, toggleRepeat, handleLikeInteraction } = usePlayer();
  const { user } = useAuth();
  const { toggleLike } = useData();
  const [showVolume, setShowVolume] = useState(false);

  if (!currentSong) return null;

  const isLiked = user?.liked?.includes(currentSong.id);

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
    const newLiked = await toggleLike(currentSong.id);
    
    // Send like/unlike interaction to API
    handleLikeInteraction(currentSong.id, !isLiked);
    
    // Update user in localStorage
    const stored = JSON.parse(localStorage.getItem("smf_auth_v1") || "null");
    if (stored) {
      stored.liked = newLiked;
      localStorage.setItem("smf_auth_v1", JSON.stringify(stored));
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
            <button 
              className={`player-like-btn ${isLiked ? "liked" : ""}`}
              onClick={handleToggleLike}
              title={isLiked ? "Unlike" : "Like"}
            >
              {isLiked ? "❤" : "🤍"}
            </button>
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
            <button 
              className={`player-control-btn ${repeat ? "active" : ""}`} 
              onClick={toggleRepeat} 
              title={repeat ? "Repeat: On" : "Repeat: Off"}
            >
              🔁
            </button>
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