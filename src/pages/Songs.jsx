import React from "react";
import { useData } from "../contexts/DataContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import SongCard from "../components/SongCard.jsx";

export default function Songs() {
  const { songs, loading } = useData();
  const { user } = useAuth();

  return (
    <div>
      <h1>Songs</h1>
      {loading && <div className="muted">Loading...</div>}
      <div className="grid" style={{ marginTop: 12 }}>
        {songs.map((s) => (
          <SongCard key={s.id} song={s} liked={user?.liked || []} />
        ))}
      </div>
    </div>
  );
}