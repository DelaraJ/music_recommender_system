import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [username, setUserName] = useState(() => {});
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("smf_auth_v1");
    return raw ? JSON.parse(raw) : null;
  });
  useEffect(() => {
    if (user) localStorage.setItem("smf_auth_v1", JSON.stringify(user));
    else localStorage.removeItem("smf_auth_v1");
  }, [user]);

  async function login({ username, password }) {
    const userData = await api.login({ username, password });
    setUser(userData.token);
    return userData;
  }
  async function register({ username, password }) {
    const userData = await api.register({ username, password });
    setUser(userData.token);
    return userData;
  }
  function logout() {
    setUser(null);
    setUserName(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, username }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}