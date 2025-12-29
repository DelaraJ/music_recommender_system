import React from "react";
import { useData } from "../contexts/DataContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function SongCard({ song, liked = [] }) {
  const { toggleLike } = useData();
  const { user } = useAuth();

  const isLiked = liked.includes(song.id);

  async function onToggleLike() {
    if (!user) return alert("Please login to like songs");
    await toggleLike(song.id);
    // force reload auth user from localStorage so UI updates (simple approach)
    const stored = JSON.parse(localStorage.getItem("smf_auth_v1") || "null");
    if (stored) {
      // update visible auth object in place for other components
      window.location.reload(); // simple approach for demo; replace with better state refresh for production
    }
  }

  return (
    <div className="song card">
      <img src={song.cover} alt={song.title} />
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:700}}>{song.title}</div>
            <div className="muted small">{song.artist} • {song.album}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
            <button className="btn" onClick={onToggleLike}>{isLiked ? "Liked ♥" : "Like"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}