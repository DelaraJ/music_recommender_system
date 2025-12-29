import React, { useState } from "react";
import { useData } from "../contexts/DataContext.jsx";

export default function CreatePlaylistModal({ onClose }) {
  const { createPlaylist } = useData();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return setErr("Give it a name");
    await createPlaylist(name.trim(), description.trim());
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Create playlist</h3>
        <form onSubmit={handleCreate}>
          <input className="input" placeholder="Playlist name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn">Create</button>
          </div>
          {err && <div style={{color:"salmon",marginTop:8}}>{err}</div>}
        </form>
      </div>
    </div>
  );
}