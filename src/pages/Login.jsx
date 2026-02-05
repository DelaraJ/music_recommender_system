import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Login() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { login } = useAuth();
  const { username, setUsername } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login({ username, password });
      navigate("/songs");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="form card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="actions">
          <button className="btn" type="submit">Login</button>
          <Link to="/register" className="muted" style={{ alignSelf: "center" }}>Register</Link>
        </div>
        {err && <div style={{ color: "salmon", marginTop: 8 }}>{err}</div>}
      </form>
    </div>
  );
}