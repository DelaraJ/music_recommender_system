import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";

const DataContext = createContext();

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadSongs() {
    setLoading(true);
    const s = await api.getSongs();
    setSongs(s);
    setLoading(false);
  }
  async function loadPlaylists() {
    if (!user) return setPlaylists([]);
    setLoading(true);
    const p = await api.getPlaylistsByUser(user.id);
    setPlaylists(p);
    setLoading(false);
  }

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [user]);

  async function createPlaylist(name, description) {
    const p = await api.createPlaylist({ ownerId: user.id, name, description });
    setPlaylists((prev) => [p, ...prev]);
    return p;
  }

  async function addSongToPlaylist(playlistId, songId) {
    const updated = await api.addSongToPlaylist({ playlistId, songId });
    setPlaylists((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function toggleLike(songId) {
    const updated = await api.toggleLikeSong({ userId: user.id, songId });
    // update user liked in local auth storage (we rely on backend to return new liked array)
    const stored = JSON.parse(localStorage.getItem("smf_auth_v1") || "null");
    if (stored) {
      stored.liked = updated.liked;
      localStorage.setItem("smf_auth_v1", JSON.stringify(stored));
    }
    // no need to update songs list (stateless) — UI will consult user.liked
    return updated.liked;
  }

  return (
    <DataContext.Provider value={{ songs, playlists, createPlaylist, addSongToPlaylist, toggleLike, loading, reload: { loadSongs, loadPlaylists } }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}