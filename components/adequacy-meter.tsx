"use client";

import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdequacyMeterProps {
  level: "high" | "medium" | "low" | "unknown";
  size?: "sm" | "md";
}

export function AdequacyMeter({ level, size = "sm" }: AdequacyMeterProps) {
  const getColor = () => {
    switch (level) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getLabel = () => {
    switch (level) {
      case "high":
        return "High adequacy - Disclosure meets all requirements";
      case "medium":
        return "Medium adequacy - Disclosure meets basic requirements but could be improved";
      case "low":
        return "Low adequacy - Disclosure is insufficient or missing key elements";
      default:
        return "Adequacy unknown";
    }
  };

  const sizeClass = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <div
              className={`w-full bg-gray-200 rounded-full ${sizeClass} flex overflow-hidden`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "33.3%" }}
                className={`${sizeClass} ${level === "low" || level === "medium" || level === "high" ? getColor() : "bg-gray-300"}`}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "33.3%" }}
                transition={{ delay: 0.2 }}
                className={`${sizeClass} ${level === "medium" || level === "high" ? getColor() : "bg-gray-300"}`}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "33.3%" }}
                transition={{ delay: 0.4 }}
                className={`${sizeClass} ${level === "high" ? getColor() : "bg-gray-300"}`}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getLabel()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
