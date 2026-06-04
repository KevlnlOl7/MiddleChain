"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ dark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nexdocs_theme");
    setDark(saved !== "light");
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("nexdocs_theme", next ? "dark" : "light");
  }

  // 避免 SSR hydration mismatch，mounted 前不渲染
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
