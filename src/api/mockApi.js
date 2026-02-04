// Mock "backend" using localStorage. This simulates network delay.
// Replace this entire module with real API calls to connect API later.

import { v4 as uuidv4 } from "uuid";

const STORAGE_KEYS = {
  USERS: "smf_users_v1",
  SONGS: "smf_songs_v1",
  PLAYLISTS: "smf_playlists_v1",
};

// initial mock songs with local audio files
// Place your audio files in /public/audio/ folder
const initialSongs = [
  {
    id: "s1",
    title: "Neon Nights",
    artist: "Aurora Sky",
    album: "Midnight Drive",
    cover: "https://picsum.photos/seed/s1/200/200",
    duration: 210,
    audioUrl: "/audio/song1.mp3" // Add your audio files here
  },
  {
    id: "s2",
    title: "Ocean Eyes",
    artist: "Blue Harbor",
    album: "Shoreline",
    cover: "https://picsum.photos/seed/s2/200/200",
    duration: 185,
    audioUrl: "/audio/song2.mp3"
  },
  {
    id: "s3",
    title: "Sunrise Echo",
    artist: "Holo Tone",
    album: "Dawn",
    cover: "https://picsum.photos/seed/s3/200/200",
    duration: 240,
    audioUrl: "/audio/song3.mp3"
  },
  {
    id: "s4",
    title: "City Lights",
    artist: "Nightwalker",
    album: "Uptown",
    cover: "https://picsum.photos/seed/s4/200/200",
    duration: 200,
    audioUrl: "/audio/song4.mp3"
  },
  {
    id: "s5",
    title: "Moonlight Dance",
    artist: "Luna Rose",
    album: "Stellar",
    cover: "https://picsum.photos/seed/s5/200/200",
    duration: 195,
    audioUrl: "/audio/song5.mp3"
  },
  {
    id: "s6",
    title: "Electric Dreams",
    artist: "Synth Wave",
    album: "Retro Future",
    cover: "https://picsum.photos/seed/s6/200/200",
    duration: 220,
    audioUrl: "/audio/song6.mp3"
  }
  
];

function read(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}
function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function ensureInitialData() {
  if (!read(STORAGE_KEYS.SONGS)) write(STORAGE_KEYS.SONGS, initialSongs);
  if (!read(STORAGE_KEYS.USERS)) write(STORAGE_KEYS.USERS, []);
  if (!read(STORAGE_KEYS.PLAYLISTS)) write(STORAGE_KEYS.PLAYLISTS, []);
}
ensureInitialData();

function delay(ms = 300) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function register({ username, password }) {
  await delay();
  const users = read(STORAGE_KEYS.USERS) || [];
  if (users.find((u) => u.username === username)) {
    throw new Error("Username already exists");
  }
  const user = { id: uuidv4(), username, password, liked: [] };
  users.push(user);
  write(STORAGE_KEYS.USERS, users);
  return { id: user.id, username: user.username };
}

export async function login({ username, password }) {
  await delay();
  const users = read(STORAGE_KEYS.USERS) || [];
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) throw new Error("Invalid credentials");
  // return stripped user
  return { id: user.id, username: user.username, liked: user.liked || [] };
}

export async function getSongs() {
  await delay();
  return (read(STORAGE_KEYS.SONGS) || []);
}

export async function getPlaylistsByUser(userId) {
  await delay();
  const all = read(STORAGE_KEYS.PLAYLISTS) || [];
  return all.filter((p) => p.ownerId === userId);
}

export async function createPlaylist({ ownerId, name, description = "" }) {
  await delay();
  const all = read(STORAGE_KEYS.PLAYLISTS) || [];
  const playlist = {
    id: uuidv4(),
    ownerId,
    name,
    description,
    songs: []
  };
  all.push(playlist);
  write(STORAGE_KEYS.PLAYLISTS, all);
  return playlist;
}

export async function addSongToPlaylist({ playlistId, songId }) {
  await delay();
  const all = read(STORAGE_KEYS.PLAYLISTS) || [];
  const p = all.find((x) => x.id === playlistId);
  if (!p) throw new Error("Playlist not found");
  if (!p.songs.includes(songId)) p.songs.push(songId);
  write(STORAGE_KEYS.PLAYLISTS, all);
  return p;
}

export async function toggleLikeSong({ userId, songId }) {
  await delay();
  const users = read(STORAGE_KEYS.USERS) || [];
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  user.liked = user.liked || [];
  if (user.liked.includes(songId)) {
    user.liked = user.liked.filter((s) => s !== songId);
  } else {
    user.liked.push(songId);
  }
  write(STORAGE_KEYS.USERS, users);
  return { liked: user.liked };
}

export async function removeSongFromPlaylist({ playlistId, songId }) {
  await delay();
  const all = read(STORAGE_KEYS.PLAYLISTS) || [];
  const p = all.find((x) => x.id === playlistId);
  if (!p) throw new Error("Playlist not found");
  p.songs = p.songs.filter((s) => s !== songId);
  write(STORAGE_KEYS.PLAYLISTS, all);
  return p;
}

export async function deletePlaylist({ playlistId }) {
  await delay();
  const all = read(STORAGE_KEYS.PLAYLISTS) || [];
  const filtered = all.filter((p) => p.id !== playlistId);
  write(STORAGE_KEYS.PLAYLISTS, filtered);
  return true;
}
