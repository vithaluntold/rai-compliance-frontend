"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function CustomThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always start with light theme to ensure SSR/client consistency
  const [theme, setTheme] = useState<Theme>("light");
  const [isHydrated, setIsHydrated] = useState(false);

  // Only run on client after hydration is complete
  useEffect(() => {
    // Mark as hydrated first to prevent render differences
    setIsHydrated(true);
    
    // Then load theme preferences
    try {
      const savedTheme = localStorage.getItem("rai-theme") as Theme;
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setTheme(savedTheme);
      } else {
        // Check system preference only after hydration
        if (typeof window !== "undefined" && window.matchMedia) {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          setTheme(prefersDark ? "dark" : "light");
        }
      }
    } catch {
      // Keep default light theme on any error
      setTheme("light");
    }
  }, []);

  // Update localStorage and document class when theme changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem("rai-theme", theme);
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
      } catch {
        // Ignore localStorage errors silently
      }
    }
  }, [theme, isHydrated]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Always provide consistent context value (no conditional rendering)
  const contextValue = {
    theme,
    setTheme: handleSetTheme,
    toggleTheme,
  };

  return (
    <div suppressHydrationWarning>
      <ThemeContext.Provider value={contextValue}>
        {children}
      </ThemeContext.Provider>
    </div>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a CustomThemeProvider");
  }
  return context;
}
