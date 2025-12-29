import React, { useState } from "react";
import { useData } from "../contexts/DataContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function PlaylistCard({ playlist }) {
  const { songs, addSongToPlaylist } = useData();
  const [selectedSong, setSelectedSong] = useState(null);
  const { user } = useAuth();

  const playlistSongs = playlist.songs.map((id) => songs.find((s) => s.id === id)).filter(Boolean);

  async function addSelected() {
    if (!user) return alert("Please login");
    if (!selectedSong) return alert("Choose a song");
    await addSongToPlaylist(playlist.id, selectedSong);
    setSelectedSong(null);
  }

  return (
    <div className="playlist-item card">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontWeight:700}}>{playlist.name}</div>
          <div className="muted small">{playlist.description}</div>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <div className="muted small">Songs</div>
        {playlistSongs.length ? (
          <ul style={{margin:8}}>
            {playlistSongs.map((s) => (<li key={s.id} className="small">{s.title} — <span className="muted">{s.artist}</span></li>))}
          </ul>
        ) : <div className="muted small">No songs yet</div>}
      </div>

      <div style={{marginTop:12,display:"flex",gap:8,alignItems:"center"}}>
        <select value={selectedSong || ""} onChange={(e) => setSelectedSong(e.target.value)} className="input" style={{padding:8}}>
          <option value="">Select song to add</option>
          {songs.map((s) => <option key={s.id} value={s.id}>{s.title} — {s.artist}</option>)}
        </select>
        <button className="btn" onClick={addSelected}>Add</button>
      </div>
    </div>
  );
}