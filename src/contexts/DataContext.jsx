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
    try {
      const s = await api.getSongs();
      setSongs(s);
    } catch (error) {
      console.error("Failed to load songs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPlaylists() {
    if (!user) return setPlaylists([]);
    setLoading(true);
    try {
      const p = await api.getPlaylistsByUser();
      setPlaylists(p);
    } catch (error) {
      console.error("Failed to load playlists:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [user]);

  async function createPlaylist(name, description) {
    const p = await api.createPlaylist({ name, description });
    setPlaylists((prev) => [p, ...prev]);
    return p;
  }

  async function addSongToPlaylist(playlistId, songId) {
    const updated = await api.addSongToPlaylist({ playlistId, songId });
    setPlaylists((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  // Toggle like: if currently liked, unlike it; otherwise like it
  async function toggleLike(songId, currentState) {
    if (!user) return;
    
    try {
      const interactionType = currentState === 'liked' ? 'unlike' : 'like';
      await api.sendInteraction(songId, interactionType);
      
      // Update songs state
      setSongs(prevSongs => 
        prevSongs.map(song => 
          song.id === songId 
            ? { ...song, state: currentState === 'liked' ? 'none' : 'liked' }
            : song
        )
      );
      
      return currentState === 'liked' ? 'none' : 'liked';
    } catch (error) {
      console.error("Failed to toggle like:", error);
      throw error;
    }
  }

  // Toggle dislike: if currently disliked, undislike it; otherwise dislike it
  async function toggleDislike(songId, currentState) {
    if (!user) return;
    
    try {
      const interactionType = currentState === 'disliked' ? 'undislike' : 'dislike';
      await api.sendInteraction(songId, interactionType);
      
      // Update songs state
      setSongs(prevSongs => 
        prevSongs.map(song => 
          song.id === songId 
            ? { ...song, state: currentState === 'disliked' ? 'none' : 'disliked' }
            : song
        )
      );
      
      return currentState === 'disliked' ? 'none' : 'disliked';
    } catch (error) {
      console.error("Failed to toggle dislike:", error);
      throw error;
    }
  }

  return (
    <DataContext.Provider value={{ 
      songs, 
      playlists, 
      createPlaylist, 
      addSongToPlaylist, 
      toggleLike, 
      toggleDislike,
      loading, 
      reload: { loadSongs, loadPlaylists } 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}