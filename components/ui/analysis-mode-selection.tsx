"use client";

import React, { useState } from "react";
import {Button} from "@/components/ui/button";
import {Zap, Clock} from "lucide-react";


interface AnalysisModeSelectionProps {
  onModeSelect: (mode: "zap" | "comprehensive") => void;
  disabled?: boolean;
}

export function AnalysisModeSelection({
  onModeSelect,
  disabled = false,
}: AnalysisModeSelectionProps) {
  const [selectedMode, setSelectedMode] = useState<
    "zap" | "comprehensive" | null
  >(null);

  const handleModeSelect = (mode: "zap" | "comprehensive") => {
    if (disabled) return;
    
    setSelectedMode(mode);
    onModeSelect(mode);
  };

  return (
    <div className="space-y-4 p-4">
      {/* Message Box */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
          Choose the Analysis Mode
        </p>
      </div>

      {/* Buttons Container */}
      <div className="flex gap-3 relative z-10">
        {/* ZAP Mode Button */}
        <Button
          onClick={() => {
            
            handleModeSelect("zap");
          }}
          disabled={disabled}
          className={`flex items-center gap-2 h-10 px-4 cursor-pointer pointer-events-auto ${
            selectedMode === "zap"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "hover:bg-blue-50 dark:hover:bg-blue-950/30"
          } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          title="ZAP Mode: Lightning-fast analysis (5-8 seconds, 85% accuracy)"
        >
          <Zap
            className={`w-4 h-4 ${
              selectedMode === "zap"
                ? "animate-zap text-yellow-300"
                : "text-blue-600 dark:text-blue-400"
            }`}
            fill={selectedMode === "zap" ? "currentColor" : "none"}
          />
          ZAP Mode
        </Button>

        {/* Default Mode Button */}
        <Button
          onClick={() => {
            
            handleModeSelect("comprehensive");
          }}
          disabled={disabled}
          className={`flex items-center gap-2 h-10 px-4 cursor-pointer pointer-events-auto ${
            selectedMode === "comprehensive"
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "hover:bg-purple-50 dark:hover:bg-purple-950/30"
          } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          title="Default Mode: Comprehensive analysis (12-20 seconds, 95% accuracy)"
        >
          <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Default Mode
        </Button>
      </div>
    </div>
  );
}
