import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("smf_auth_v1");
    return raw ? JSON.parse(raw) : null;
  });
  useEffect(() => {
    if (user) localStorage.setItem("smf_auth_v1", JSON.stringify(user));
    else localStorage.removeItem("smf_auth_v1");
  }, [user]);

  async function login({ username, password }) {
    const u = await api.login({ username, password });
    setUser(u);
    return u;
  }
  async function register({ username, password }) {
    const u = await api.register({ username, password });
    // automatically login after register
    const logged = await api.login({ username, password });
    setUser(logged);
    return logged;
  }
  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}