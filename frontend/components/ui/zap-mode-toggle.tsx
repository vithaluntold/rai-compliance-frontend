"use client";

import {useState} from "react";
import {Zap} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ZapModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function ZapModeToggle({
  enabled,
  onToggle,
  disabled = false,
}: ZapModeToggleProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = () => {
    if (!disabled) {
      onToggle(!enabled);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleToggle}
            disabled={disabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
              h-8 px-2 relative overflow-hidden transition-all duration-300 
              ${
                enabled
                  ? "bg-[#0884dc] hover:bg-[#0670ba] text-white border-[#0884dc]"
                  : "border-[#0884dc] text-[#0884dc] hover:bg-[#0884dc]/10"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              ${isHovered && !disabled ? "scale-105" : ""}
            `}
          >
            <Zap
              className={`
                w-4 h-4 mr-2 transition-all duration-300
                ${enabled ? "text-white" : "text-[#0884dc]"}
                ${isHovered && !disabled ? "animate-pulse" : ""}
              `}
              fill={enabled ? "currentColor" : "none"}
            />
            <span className="font-medium">
              {enabled ? "Normal Mode" : "ZAP Mode"}
            </span>

            {/* Subtle animation effect */}
            {enabled && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="text-sm">
            <div className="font-semibold mb-1">
              {enabled ? "📋 Normal Analysis Active" : "⚡ ZAP Analysis Active"}
            </div>
            <div className="text-xs text-muted-foreground">
              {enabled
                ? "Comprehensive AI analysis (12-20s) • 95% accuracy • Multi-section sampling • Click to switch to ZAP"
                : "Lightning-fast AI analysis (5-8s) • 85% accuracy • Smart keyword targeting • Click to switch to Normal"}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Add the shimmer animation to global CSS or include it here
const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

// Export for use in global styles if needed
export { shimmerKeyframes };
