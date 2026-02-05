// Real API implementation
const API_BASE_URL = "http://194.147.142.26:8081";

// Helper function to get token from localStorage
function getToken() {
  const auth = localStorage.getItem("smf_auth_v1");
  if (auth) {
    const parsed = JSON.parse(auth);
    return parsed;
  }
  return null;
}

// Helper function to make authenticated requests
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}`;
    
    try {
      // Try to parse as JSON
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      // If not JSON, use text or default message
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  // Check if response has content
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // For empty responses (like 204 No Content) or non-JSON responses
    if (response.status === 204 || response.statusText === 'No Content') {
      return {}; // Return empty object for successful empty responses
    }
    
    // Try to get text for non-JSON responses
    const text = await response.text();
    return text || {};
  }

  return response.json();
}

// Transform track data from API to app format
function transformTrack(track) {
  return {
    id: track.track_id,
    title: track.track_name,
    artist: track.artists,
    album: track.album_name,
    cover: track.cover_url || `/image.jpeg`,
    duration: Math.floor(track.duration_ms / 1000), // Convert ms to seconds
    popularity: track.popularity,
    explicit: track.explicit,
    genre: track.track_genre,
    state: track.interaction_state || 'none', // 'liked', 'disliked', or 'none'
    // Keep original data for reference
    raw: track
  };
}

export async function register({ username, password }) {
  const data = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  
  return {
    id: data.user?.id || data.id,
    username: data.user?.username || username,
    recomm_playlist_id: data.recomm_playlist_id,
    created_at: data.created_at,
    token: data.token
  };
}

export async function login({ username, password }) {
  const data = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  return {
    token: data.token,
    username: username
  };
}

export async function getSongs() {
  const data = await apiRequest('/tracks');
  const tracks = data || [];
  
  // Remove duplicates using a Set
  const seen = new Set();
  const uniqueTracks = tracks.filter(track => {
    const isDuplicate = seen.has(track.track_id);
    seen.add(track.track_id);
    return !isDuplicate;
  });
    
  return uniqueTracks.map(transformTrack);
}

export async function getSongById(id) {
  const data = await apiRequest(`/tracks/${id}`);
  const track = data.track || data;
  return transformTrack(track);
}

export async function searchTracks({ query, limit = 10, offset = 0, field = 'track_name' }) {
  const params = new URLSearchParams({
    q: query,
    field: field,
    limit: limit.toString(),
    offset: offset.toString()
  });
  
  const data = await apiRequest(`/tracks/search?${params}`);
  const tracks = data.tracks || data.results || data || [];
  return tracks.map(transformTrack);
}

export async function getPlaylistsByUser() {
  const data = await apiRequest('/playlists');
  return data.playlists || data || [];
}

// export async function getPlaylistById(playlistId) {
//   const data = await apiRequest(`/playlists/${playlistId}`);
//   return data.playlist || data;
// }

export async function getPlaylistTracks(playlistId) {
  const data = await apiRequest(`/playlists/${playlistId}/tracks`);
  const tracks = data.tracks || data || [];
  return tracks.map(transformTrack);
}

export async function createPlaylist({ name, description = "" }) {
  const data = await apiRequest('/playlists', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
  
  return data.playlist || data;
}

export async function addSongToPlaylist({ playlistId, songId }) {
  await apiRequest(`/playlists/${playlistId}/tracks/${songId}`, {
    method: 'POST',
  });
  
  // Send interaction
  await sendInteraction(songId, 'add_to_playlist');
  
  // Fetch updated playlist
  return await getPlaylistTracks(playlistId);
}

export async function removeSongFromPlaylist({ playlistId, songId }) {
  await apiRequest(`/playlists/${playlistId}/tracks/${songId}`, {
    method: 'DELETE',
  });
  
  // Send interaction
  await sendInteraction(songId, 'remove_from_playlist');
  
  // Fetch updated playlist
  return await getPlaylistTracks(playlistId);
}

export async function deletePlaylist({ playlistId }) {
  await apiRequest(`/playlists/${playlistId}`, {
    method: 'DELETE',
  });
  
  return true;
}

// Send interaction to backend
// Valid types: "like", "unlike", "dislike", "undislike", "skip", "play", "add_to_playlist", "remove_from_playlist"
export async function sendInteraction(songId, type) {
  try {
    const data = await apiRequest(`/tracks/${songId}/interact`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
    return data;
  } catch (error) {
    console.error('Failed to send interaction:', error);
    throw error;
  }
}