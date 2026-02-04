import React, { useState } from "react";
import { useData } from "../contexts/DataContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { usePlayer } from "../contexts/PlayerContext.jsx";
import { api } from "../services/api.js";

export default function PlaylistCard({ playlist, onDelete }) {
  const { songs, addSongToPlaylist } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { playSong } = usePlayer();
  const [playlists, setPlaylists] = useState([playlist]);

  const playlistSongs = playlist.songs.map((id) => songs.find((s) => s.id === id)).filter(Boolean);

  // Filter songs based on search query
  const availableSongs = songs
    .filter(s => !playlist.songs.includes(s.id))
    .filter(s => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query) ||
        s.album.toLowerCase().includes(query)
      );
    });

  async function addSongById(songId) {
    if (!user) return;
    try {
      await addSongToPlaylist(playlist.id, songId);
      setSearchQuery("");
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
      playlist.songs = playlist.songs.filter(id => id !== songId);
      setPlaylists([playlist]);
    } catch (err) {
      console.error("Failed to remove song:", err);
    }
  }

  function playPlaylist(e) {
    e.stopPropagation();
    if (playlistSongs.length > 0) {
      playSong(playlistSongs[0], playlistSongs);
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
            {playlistSongs.length} {playlistSongs.length === 1 ? "song" : "songs"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* {playlistSongs.length > 0 && (
            <button className="btn" onClick={playPlaylist} title="Play playlist">
              ▶ Play
            </button>
          )} */}
          <button className="btn secondary" onClick={handleDelete} title="Delete playlist">
            🗑
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="muted small" style={{ marginBottom: 8, fontWeight: 600 }}>Songs in playlist</div>
        {playlistSongs.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {playlistSongs.map((s, idx) => (
              <div 
                key={s.id} 
                className="playlist-song-item"
                onClick={() => playSong(s, playlistSongs)}
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
            placeholder="Search by song name, artist, or album..."
            style={{ padding: 10 }}
          />
          {searchQuery.trim() && (
            <div className="song-search-results">
              {availableSongs.length > 0 ? (
                availableSongs.slice(0, 5).map((song) => (
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
              {availableSongs.length > 5 && (
                <div className="muted small" style={{ padding: 8, textAlign: "center" }}>
                  Showing 5 of {availableSongs.length} results
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}