import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Songs from "./pages/Songs.jsx";
import Playlists from "./pages/Playlists.jsx";
import NavBar from "./components/NavBar.jsx";
import PlayerBar from "./components/PlayerBar.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app">
      <NavBar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to={user ? "/songs" : "/login"} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/songs"
            element={user ? <Songs /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/playlists"
            element={user ? <Playlists /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<div style={{ padding: 20 }}>Not found</div>} />
        </Routes>
      </main>
      <PlayerBar />
    </div>
  );
}
