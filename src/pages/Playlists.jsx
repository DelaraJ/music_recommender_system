import React, { useState } from "react";
import { useData } from "../contexts/DataContext.jsx";
import CreatePlaylistModal from "../components/CreatePlaylistModal.jsx";
import PlaylistCard from "../components/PlaylistCard.jsx";

export default function Playlists() {
  const { playlists } = useData();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Playlists</h1>
        <button className="btn" onClick={() => setShowCreate(true)}>Create Playlist</button>
      </div>

      <div style={{ marginTop: 12 }} className="grid">
        {playlists.length ? playlists.map((p) => <PlaylistCard key={p.id} playlist={p} />) : <div className="muted card">No playlists yet</div>}
      </div>

      {showCreate && <CreatePlaylistModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}