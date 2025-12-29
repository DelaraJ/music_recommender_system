```markdown
# Spotify-like Mock Frontend (React JSX)

This is a starter frontend app built with React (JSX) and Vite. It contains mock implementations for:

- Login / Register
- Songs page
- Playlists page
- Create playlist
- Like songs
- Add songs to playlists

Mock data is persisted in `localStorage`. The `src/services/api.js` file wraps `src/api/mockApi.js`. Replace the mock API implementation with your backend (connect API) by updating `src/services/api.js`.

Run:
1. npm install
2. npm run start
3. Open http://localhost:5173

Project structure highlights:
- src/api/mockApi.js — mock backend functions (swap out for real API)
- src/services/api.js — the API wrapper used by the app
- src/contexts — Auth and Data providers
- src/pages — Login, Register, Songs, Playlists
- src/components — small UI components

Notes:
- Auth state is stored locally for the mock. Replace with real auth flow (JWT/session) when connecting to backend.
- The project is intentionally small and modular so you can switch to real endpoints in `src/services/api.js`.

License: MIT
```"# music_recommender_system" 
