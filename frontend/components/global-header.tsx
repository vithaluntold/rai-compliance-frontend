"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/theme-context";

export default function GlobalHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={toggleTheme}
        size="sm"
        variant="outline"
        className={`h-8 px-2 ${
          theme === "dark"
            ? "bg-gray-900 border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white"
            : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900"
        }`}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 mr-1" />
        ) : (
          <Moon className="h-4 w-4 mr-1" />
        )}
        {theme === "dark" ? "Light" : "Dark"}
      </Button>
    </div>
  );
}