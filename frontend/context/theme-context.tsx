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
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("rai-theme") as Theme;
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setTheme(savedTheme);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setTheme(prefersDark ? "dark" : "light");
      }
    } catch {
      // Fallback if localStorage is not available
      
      setTheme("light");
    }
    setMounted(true);
  }, []);

  // Update localStorage and document class when theme changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("rai-theme", theme);
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Provide default context during hydration to prevent errors
  const contextValue = {
    theme: mounted ? theme : "light",
    setTheme,
    toggleTheme,
  };

  // Prevent hydration mismatch by not rendering children until mounted
  if (!mounted) {
    return (
      <div suppressHydrationWarning className="hidden-loader">
        <ThemeContext.Provider value={contextValue}>
          {children}
        </ThemeContext.Provider>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a CustomThemeProvider");
  }
  return context;
}
