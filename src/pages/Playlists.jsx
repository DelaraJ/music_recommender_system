import React, { useState } from "react";
import { useData } from "../contexts/DataContext.jsx";
import CreatePlaylistModal from "../components/CreatePlaylistModal.jsx";
import PlaylistCard from "../components/PlaylistCard.jsx";

export default function Playlists() {
  const { playlists } = useData();
  const [showCreate, setShowCreate] = useState(false);
  const [localPlaylists, setLocalPlaylists] = useState(playlists);

  // Update local playlists when context playlists change
  React.useEffect(() => {
    setLocalPlaylists(playlists);
  }, [playlists]);

  function handleDelete(playlistId) {
    setLocalPlaylists(prev => prev.filter(p => p.id !== playlistId));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>My Playlists</h1>
        <button className="btn" onClick={() => setShowCreate(true)}>
          + Create Playlist
        </button>
      </div>

      <div style={{ marginTop: 20 }} className="grid">
        {localPlaylists.length ? (
          localPlaylists.map((p) => (
            <PlaylistCard key={p.id} playlist={p} onDelete={handleDelete} />
          ))
        ) : (
          <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: 32 }}>
            <div className="muted">No playlists yet. Create your first playlist to get started!</div>
          </div>
        )}
      </div>

      {showCreate && <CreatePlaylistModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}