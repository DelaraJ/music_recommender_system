import React, { useState, useEffect, useRef } from "react";
import { useData } from "../contexts/DataContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { usePlayer } from "../contexts/PlayerContext.jsx";

export default function SongCard({ song, allSongs = [] }) {
  const { toggleLike, toggleDislike, playlists, addSongToPlaylist } = useData();
  const { user } = useAuth();
  const { playSong, currentSong, isPlaying, togglePlayPause } = usePlayer();
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const songState = song.state || 'none'; // 'liked', 'disliked', or 'none'
  const isCurrentSong = currentSong?.id === song.id;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPlaylistMenu(false);
      }
    }

    if (showPlaylistMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPlaylistMenu]);

  // Calculate dropdown position
  useEffect(() => {
    if (showPlaylistMenu && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const dropdownHeight = 300; // max-height from CSS

      if (spaceBelow < dropdownHeight && buttonRect.top > dropdownHeight) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [showPlaylistMenu]);

  async function handleToggleLike(e) {
    e.stopPropagation();
    if (!user) return alert("Please login to like songs");
    
    try {
      await toggleLike(song.id, songState);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  }

  async function handleToggleDislike(e) {
    e.stopPropagation();
    if (!user) return alert("Please login to dislike songs");
    
    try {
      await toggleDislike(song.id, songState);
    } catch (error) {
      console.error("Failed to toggle dislike:", error);
    }
  }

  function handlePlay(e) {
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlayPause();
    } else {
      playSong(song, allSongs);
    }
  }

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function togglePlaylistMenu(e) {
    e.stopPropagation();
    if (!user) return alert("Please login to add songs to playlists");
    setShowPlaylistMenu(!showPlaylistMenu);
  }

  async function addToPlaylist(playlistId, e) {
    e.stopPropagation();
    try {
      await addSongToPlaylist(playlistId, song.id);
      setShowPlaylistMenu(false);
      alert("Song added to playlist!");
    } catch (err) {
      alert("Failed to add song to playlist");
    }
  }

  return (
    <div className={`song card ${showPlaylistMenu ? "song-dropdown-active" : ""}`} onClick={handlePlay} style={{ cursor: "pointer" }}>
      <div className="song-cover-container">
        <img src={song.cover} alt={song.title} />
        <button className="song-play-overlay" onClick={handlePlay}>
          {isCurrentSong && isPlaying ? "⏸" : "▶"}
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: isCurrentSong ? "var(--accent)" : "inherit" }}>
              {song.title}
            </div>
            <div className="muted small">{song.artist} • {song.album}</div>
            <div className="muted small" style={{ marginTop: 4 }}>{formatDuration(song.duration)}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {user && (
              <>
                <button 
                  className="btn-icon" 
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
                  className="btn-icon" 
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
                <div style={{ position: "relative" }} ref={dropdownRef}>
                  <button 
                    ref={buttonRef}
                    className="btn-icon" 
                    onClick={togglePlaylistMenu}
                    title="Add to playlist"
                  >
                    ➕
                  </button>
                  {showPlaylistMenu && (
                    <div 
                      className={`playlist-dropdown ${dropdownPosition === "top" ? "playlist-dropdown-top" : ""}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: "0.85rem" }}>
                        Add to playlist
                      </div>
                      {playlists.length > 0 ? (
                        playlists.map((playlist) => (
                          <button
                            key={playlist.id}
                            className="playlist-dropdown-item"
                            onClick={(e) => addToPlaylist(playlist.id, e)}
                            disabled={playlist.songs?.includes(song.id)}
                          >
                            {playlist.name}
                            {playlist.songs?.includes(song.id) && " ✓"}
                          </button>
                        ))
                      ) : (
                        <div className="muted small">No playlists yet</div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}