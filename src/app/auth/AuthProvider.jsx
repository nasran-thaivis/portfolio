"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// AuthProvider: simple client-side auth demo. In a real application this
// would integrate with a server API and proper session handling. Here we
// persist a minimal `authUser` object in localStorage so the site can
// show a login state across page reloads.
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On mount, attempt to read persisted user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to read authUser from localStorage", e);
    }
  }, []);

  // Demo login function — replace with real API calls in production
  const login = (username, password) => {
    // Updated demo credentials: Nasran2002 / Nasran2002
    if (username === "Nasran2002" && password === "Nasran2002") {
      const u = { name: username };
      setUser(u);
      try {
        localStorage.setItem("authUser", JSON.stringify(u));
      } catch (e) {
        console.error("Failed to persist authUser", e);
      }
      return { ok: true };
    }
    return { ok: false, message: "Invalid credentials (try Nasran2002/Nasran2002)" };
  };

  // Logout helper — clears state and localStorage
  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("authUser");
    } catch (e) {
      console.error("Failed to remove authUser", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
