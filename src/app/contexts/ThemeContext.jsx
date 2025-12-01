"use client";

import { createContext, useContext, useState, useEffect } from "react";

// === Storage Key ===
const STORAGE_KEY = "site_theme";

// === ธีมเริ่มต้น ===
const DEFAULT_THEME = {
  primary: "#10b981", // emerald
  secondary: "#3b82f6", // blue
  background: "#ffffff", // white
  text: "#1f2937", // gray-800
  accent: "#ef4444", // red
  cardBg: "#f9fafb", // gray-50
  border: "#e5e7eb", // gray-200
  borderRadius: "12", // px
  shadow: "lg", // none, sm, md, lg, xl
};

// === สร้าง Context ===
const ThemeContext = createContext();

// === Custom Hook สำหรับใช้งาน ThemeContext ===
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// === ThemeProvider Component ===
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // === Effect: โหลดธีมจาก localStorage และ Apply CSS Variables ===
  useEffect(() => {
    setMounted(true);
    try {
      // โหลดธีมจาก localStorage
      const storedTheme = localStorage.getItem(STORAGE_KEY);
      if (storedTheme) {
        const parsedTheme = JSON.parse(storedTheme);
        setTheme(parsedTheme);
        applyThemeToDOM(parsedTheme);
      } else {
        // ใช้ธีมเริ่มต้น
        applyThemeToDOM(DEFAULT_THEME);
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
      applyThemeToDOM(DEFAULT_THEME);
    }
  }, []);

  // Apply default theme on server-side to prevent hydration mismatch
  useEffect(() => {
    if (!mounted) {
      applyThemeToDOM(DEFAULT_THEME);
    }
  }, [mounted]);

  // === ฟังก์ชัน: Apply Theme to DOM (CSS Variables) ===
  const applyThemeToDOM = (themeColors) => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", themeColors.primary);
    root.style.setProperty("--color-secondary", themeColors.secondary);
    root.style.setProperty("--color-bg", themeColors.background);
    root.style.setProperty("--color-text", themeColors.text);
    root.style.setProperty("--color-accent", themeColors.accent);
    root.style.setProperty("--color-card-bg", themeColors.cardBg);
    root.style.setProperty("--color-border", themeColors.border);
    root.style.setProperty("--border-radius", `${themeColors.borderRadius}px`);
    
    // Apply shadow class to body
    document.body.setAttribute("data-shadow", themeColors.shadow || "lg");
  };

  // === ฟังก์ชัน: Update Theme ===
  const updateTheme = (newTheme) => {
    try {
      const updatedTheme = { ...theme, ...newTheme };
      setTheme(updatedTheme);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTheme));
      applyThemeToDOM(updatedTheme);
      return { success: true, message: "Theme updated successfully" };
    } catch (error) {
      console.error("Failed to update theme:", error);
      return { success: false, message: "Failed to update theme" };
    }
  };

  // === ฟังก์ชัน: Reset Theme to Default ===
  const resetTheme = () => {
    try {
      setTheme(DEFAULT_THEME);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_THEME));
      applyThemeToDOM(DEFAULT_THEME);
      return { success: true, message: "Theme reset to default" };
    } catch (error) {
      console.error("Failed to reset theme:", error);
      return { success: false, message: "Failed to reset theme" };
    }
  };

  // === Value ที่จะส่งไปให้ Context ===
  const value = {
    theme,
    updateTheme,
    resetTheme,
    defaultTheme: DEFAULT_THEME,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

