import React, { useState } from "react";
import { useData } from "../contexts/DataContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { usePlayer } from "../contexts/PlayerContext.jsx";
import SongCard from "../components/SongCard.jsx";

export default function Songs() {
  const { songs, loading } = useData();
  const { user } = useAuth();
  const { playSong } = usePlayer();
  const [filter, setFilter] = useState("all");

  function playAll() {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  }

  function playLiked() {
    if (!user?.liked?.length) return;
    const likedSongs = songs.filter(s => user.liked.includes(s.id));
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    }
  }

  const displaySongs = filter === "liked" && user 
    ? songs.filter(s => user.liked?.includes(s.id))
    : songs;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Songs</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {user && (
            <div className="filter-buttons">
              <button 
                className={`btn ${filter === "all" ? "" : "secondary"}`} 
                onClick={() => setFilter("all")}
              >
                All Songs
              </button>
              <button 
                className={`btn ${filter === "liked" ? "" : "secondary"}`} 
                onClick={() => setFilter("liked")}
              >
                Liked ({user.liked?.length || 0})
              </button>
            </div>
          )}
          <button className="btn" onClick={filter === "liked" ? playLiked : playAll}>
            ▶ Play {filter === "liked" ? "Liked" : "All"}
          </button>
        </div>
      </div>
      
      {loading && <div className="muted">Loading...</div>}
      
      {!loading && displaySongs.length === 0 && filter === "liked" && (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <div className="muted">No liked songs yet. Start liking songs to see them here!</div>
        </div>
      )}
      
      <div className="grid" style={{ marginTop: 12 }}>
        {displaySongs.map((s) => (
          <SongCard key={s.id} song={s} liked={user?.liked || []} allSongs={displaySongs} />
        ))}
      </div>
    </div>
  );
}