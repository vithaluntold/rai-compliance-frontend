"use client";

import {useEffect, useState} from "react";
import {Search, Eye, Sparkles} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
interface KeywordExtractionDisplayProps {
  keywords: string[];
  currentKeyword: string | null;
  step: string;
  isExtracting?: boolean;
}

export function KeywordExtractionDisplay({
  keywords,
  currentKeyword,
  step,
  isExtracting = false,
}: KeywordExtractionDisplayProps) {
  const [animatedKeywords, setAnimatedKeywords] = useState<string[]>([]);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Animate keywords appearing one by one
  useEffect(() => {
    if (keywords.length > animatedKeywords.length) {
      const timer = setTimeout(() => {
        setAnimatedKeywords((prev) => {
          const nextKeyword = keywords[prev.length];
          return nextKeyword ? [...prev, nextKeyword] : prev;
        });
        setPulseAnimation(true);
        setTimeout(() => setPulseAnimation(false), 500);
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [keywords.length, animatedKeywords.length]); // Only watch lengths, not the arrays themselves

  // Reset when keywords change
  useEffect(() => {
    if (keywords.length === 0) {
      setAnimatedKeywords([]);
    }
  }, [keywords]);

  if (!isExtracting && keywords.length === 0) {
    return null;
  }

  return (
    <Card className="p-3 mt-2 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-[#0087d9]">
      <div className="flex items-center gap-2 mb-2">
        <div className="relative">
          <Search
            className={`
              w-4 h-4 text-[#0087d9]
              ${isExtracting ? "animate-spin" : ""}
            `}
          />
          {isExtracting && (
            <div className="absolute -inset-1 bg-[#0087d9]/20 rounded-full animate-ping" />
          )}
        </div>
        <span className="text-sm font-medium text-[#0087d9]">{step}</span>
        {isExtracting && (
          <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
        )}
      </div>

      {/* Current keyword being processed */}
      {currentKeyword && isExtracting && (
        <div className="mb-2 p-2 bg-white/70 rounded-md border border-[#0087d9]/20">
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3 text-[#0087d9] animate-pulse" />
            <span className="text-xs text-gray-600">Analyzing:</span>
            <Badge
              className="border text-[#0087d9] border-[#0087d9] bg-white/50 animate-pulse"
            >
              {currentKeyword}
            </Badge>
          </div>
        </div>
      )}

      {/* Discovered keywords */}
      {animatedKeywords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600">Discovered Keywords:</span>
            <Badge
              className={`
                text-xs bg-green-100 text-green-700 border-green-300
                ${pulseAnimation ? "animate-pulse" : ""}
              `}
            >
              {animatedKeywords.length}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1">
            {animatedKeywords.map((keyword, index) => (
              <Badge
                key={`${keyword}-${index}`}
                className={`
                  text-xs transition-all duration-500 ease-out border
                  bg-white/70 border-[#0087d9]/30 text-[#0087d9]
                  hover:bg-[#0087d9]/10 hover:border-[#0087d9]/50
                  transform ${index === animatedKeywords.length - 1 ? "scale-110" : "scale-100"}
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation:
                    index === animatedKeywords.length - 1
                      ? "fadeInScale 0.5s ease-out"
                      : undefined,
                }}
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Progress indicator */}
      {isExtracting && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Extracting intelligent keywords...</span>
            <span>{animatedKeywords.length} found</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-[#0087d9] to-cyan-500 h-1.5 rounded-full transition-all duration-1000 animate-pulse confidence-bar"
              ref={(el) => {
                if (el) {
                  el.style.setProperty('--confidence-width', `${Math.min(animatedKeywords.length * 20, 100)}%`);
                }
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

// CSS Animation keyframes (add to global styles)
const keywordAnimations = `
@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
`;

export { keywordAnimations };
