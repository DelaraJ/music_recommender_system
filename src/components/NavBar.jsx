import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function NavBar() {
  const { user, logout, username } = useAuth();
  const navigate = useNavigate();

  function doLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="nav">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div className="brand">SpotMock</div>
        <Link to="/songs" className="muted">Songs</Link>
        <Link to="/playlists" className="muted">Playlists</Link>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
        {user ? (
          <>
            <div className="muted small">Signed in as <strong style={{color:"var(--accent)"}}>{username}</strong></div>
            <button className="btn secondary" onClick={doLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="muted">Login</Link>
            <Link to="/register" className="muted">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}