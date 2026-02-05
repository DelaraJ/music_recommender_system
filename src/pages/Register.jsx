import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Register() {
  const [username, setUsername] = useAuth();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register({ username, password });
      await login({ username, password });
      navigate("/songs");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="form card">
      <h2>Create account</h2>
      <form onSubmit={handleSubmit}>
        <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="actions">
          <button className="btn" type="submit">Register</button>
        </div>
        {err && <div style={{ color: "salmon", marginTop: 8 }}>{err}</div>}
      </form>
    </div>
  );
}