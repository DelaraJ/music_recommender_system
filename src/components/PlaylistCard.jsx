import React, { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { usePlayer } from "../contexts/PlayerContext.jsx";
import { api } from "../services/api.js";

export default function PlaylistCard({ playlist, onDelete }) {
  const { songs, addSongToPlaylist } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const { user } = useAuth();
  const { playSong } = usePlayer();

  // Load playlist tracks
  useEffect(() => {
    async function loadPlaylistTracks() {
      if (!playlist.id) return;
      
      setLoadingTracks(true);
      try {
        const tracks = await api.getPlaylistTracks(playlist.id);
        setPlaylistTracks(tracks);
      } catch (error) {
        console.error('Failed to load playlist tracks:', error);
        setPlaylistTracks([]);
      } finally {
        setLoadingTracks(false);
      }
    }

    loadPlaylistTracks();
  }, [playlist.id]);

  // Search tracks when query changes
  useEffect(() => {
    const searchTracks = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await api.searchTracks({
          query: searchQuery,
          limit: 10,
          offset: 0,
          field: 'track_name'
        });
        
        // Filter out songs already in playlist
        const playlistTrackIds = playlistTracks.map(t => t.id);
        const filteredResults = results.filter(s => !playlistTrackIds.includes(s.id));
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchTracks, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, playlistTracks]);

  async function addSongById(songId) {
    if (!user) return;
    console.log("playlist: ", playlist);
    try {
      await addSongToPlaylist(playlist.id, songId);
      
      // Reload playlist tracks
      const tracks = await api.getPlaylistTracks(playlist.id);
      setPlaylistTracks(tracks);
      
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      console.error("Failed to add song:", err);
    }
  }

  async function removeSong(songId, e) {
    e.stopPropagation();
    if (!user) return;
    try {
      await api.removeSongFromPlaylist({ playlistId: playlist.id, songId });
      
      // Update local state
      setPlaylistTracks(prev => prev.filter(track => track.id !== songId));
    } catch (err) {
      console.error("Failed to remove song:", err);
    }
  }

  function playPlaylist(e) {
    e.stopPropagation();
    if (playlistTracks.length > 0) {
      playSong(playlistTracks[0], playlistTracks);
    }
  }

  async function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
      try {
        await api.deletePlaylist({ playlistId: playlist.id });
        if (onDelete) onDelete(playlist.id);
      } catch (err) {
        console.error("Failed to delete playlist:", err);
      }
    }
  }

  return (
    <div className="playlist-item card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{playlist.name}</div>
          <div className="muted small">{playlist.description}</div>
          <div className="muted small" style={{ marginTop: 4 }}>
            {loadingTracks ? "Loading..." : `${playlistTracks.length} ${playlistTracks.length === 1 ? "song" : "songs"}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {playlistTracks.length > 0 && (
            <button className="btn" onClick={playPlaylist} title="Play playlist">
              ▶ Play
            </button>
          )}
          <button className="btn secondary" onClick={handleDelete} title="Delete playlist">
            🗑
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="muted small" style={{ marginBottom: 8, fontWeight: 600 }}>Songs in playlist</div>
        {loadingTracks ? (
          <div className="muted small" style={{ padding: 12, textAlign: "center" }}>
            Loading tracks...
          </div>
        ) : playlistTracks.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {playlistTracks.map((s, idx) => (
              <div 
                key={s.id} 
                className="playlist-song-item"
                onClick={() => playSong(s, playlistTracks)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                  <span className="muted small" style={{ width: 20 }}>{idx + 1}</span>
                  <img src={s.cover} alt={s.title} style={{ width: 40, height: 40, borderRadius: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>{s.title}</div>
                    <div className="muted small">{s.artist}</div>
                  </div>
                  <button 
                    className="btn-icon-small" 
                    onClick={(e) => removeSong(s.id, e)}
                    title="Remove from playlist"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="muted small" style={{ padding: 12, textAlign: "center", background: "#0f0f0f", borderRadius: 6 }}>
            No songs yet. Search and add songs below!
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #2a2a2a" }}>
        <div className="muted small" style={{ marginBottom: 8 }}>Search and add songs</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input 
            type="text"
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="input" 
            placeholder="Search by song name..."
            style={{ padding: 10 }}
          />
          {isSearching && (
            <div className="muted small" style={{ padding: 12, textAlign: "center" }}>
              Searching...
            </div>
          )}
          {searchQuery.trim() && !isSearching && (
            <div className="song-search-results">
              {searchResults.length > 0 ? (
                searchResults.map((song) => (
                  <div 
                    key={song.id} 
                    className="song-search-item"
                    onClick={() => addSongById(song.id)}
                  >
                    <img src={song.cover} alt={song.title} style={{ width: 40, height: 40, borderRadius: 4 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>{song.title}</div>
                      <div className="muted small">{song.artist}</div>
                    </div>
                    <button className="btn-icon-small" title="Add to playlist">
                      ➕
                    </button>
                  </div>
                ))
              ) : (
                <div className="muted small" style={{ padding: 12, textAlign: "center" }}>
                  No songs found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}