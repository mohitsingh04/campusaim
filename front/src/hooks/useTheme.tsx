"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Theme, themes } from "@/common/Themes";

interface ThemeContextProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Load initial theme BEFORE render
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored && themes.includes(stored)) return stored;
    }
    return themes[0];
  });

  // Update HTML attribute & localStorage when theme changes
  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    } catch (err) {
      console.warn("Theme save failed:", err);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
};
