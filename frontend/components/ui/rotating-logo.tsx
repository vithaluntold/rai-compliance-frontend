"use client";

import React, { useState, useEffect } from "react";
// import Image from "next/image";

interface RotatingLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const logoVariants = [
  {
    id: "tax",
    src: "/assets/logos/rai-tax.svg",
    alt: "RAi Tax Compliance",
    fallback: "RAi TAX",
  },
  {
    id: "audit",
    src: "/assets/logos/rai-audit.svg",
    alt: "RAi Audit Compliance",
    fallback: "RAi AUDIT",
  },
  {
    id: "digital",
    src: "/assets/logos/rai-digital.svg",
    alt: "RAi Digital Compliance",
    fallback: "RAi DIGITAL",
  },
];

const sizeClasses = {
  sm: "h-8 w-auto",
  md: "h-12 w-auto",
  lg: "h-16 w-auto",
  xl: "h-20 w-auto",
};

const RotatingLogo: React.FC<RotatingLogoProps> = ({
  className = "",
  size = "lg",
}) => {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentLogoIndex((prev) => (prev + 1) % logoVariants.length);
        setIsVisible(true);
      }, 300); // Half of transition duration
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const currentLogo = logoVariants[currentLogoIndex];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div
        className={`
          transition-all duration-500 ease-in-out transform
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          ${sizeClasses[size]}
        `}
      >
        {/* Fallback text logo with professional styling */}
        <div className="flex items-center space-x-1">
          <span className="text-blue-600 font-bold text-2xl tracking-tight">
            RAi
          </span>
          <span className="text-blue-500 font-medium text-lg uppercase tracking-wider">
            {currentLogo.fallback.split(" ")[1] || "COMPLIANCE"}
          </span>
        </div>

        {/* Progress indicators */}
        <div className="flex space-x-1 mt-2 justify-center">
          {logoVariants.map((_, index) => (
            <div
              key={index}
              className={`
                h-1 w-6 rounded-full transition-all duration-300
                ${index === currentLogoIndex ? "bg-blue-600" : "bg-blue-200"}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RotatingLogo;
