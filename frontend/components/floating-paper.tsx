"use client";

import {FileText} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function FloatingPaper({ count = 5 }) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client side to prevent hydration mismatches
    setIsClient(true);
    
    // Update dimensions only on client side
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create deterministic positions based on index to prevent hydration mismatches
  const getPosition = (index: number, type: 'x' | 'y') => {
    if (!isClient) return 0; // Return fixed position during SSR
    
    // Use index-based positioning instead of random for consistency
    const seed = index * 42 + (type === 'x' ? 17 : 23);
    const pseudo = Math.sin(seed) * 10000;
    const normalized = (pseudo - Math.floor(pseudo));
    return Math.abs(normalized) * (type === 'x' ? dimensions.width : dimensions.height);
  };

  return (
    <div className="relative w-full h-full">
      {isClient && Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: getPosition(i, 'x'),
            y: getPosition(i, 'y'),
          }}
          animate={{
            x: [
              getPosition(i, 'x'),
              getPosition(i + 1, 'x'),
              getPosition(i + 2, 'x'),
            ],
            y: [
              getPosition(i, 'y'),
              getPosition(i + 1, 'y'),
              getPosition(i + 2, 'y'),
            ],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20 + (i * 2), // Use index-based duration instead of random
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <div className="relative w-16 h-20 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-center transform hover:scale-110 transition-transform">
            <FileText className="w-8 h-8 text-purple-400/50" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
