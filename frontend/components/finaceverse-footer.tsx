"use client";

import React from "react";
import Image from "next/image";


const FinACEverseFooter = () => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2.5">
        <span className="text-sm font-medium text-finaceverse-powered-by">
          Powered by
        </span>
        <div className="flex items-center gap-2">
          {/* FinACEverse logo */}
          <div className="w-5 h-5 relative">
            <Image
              src="/finaceverse-logo.png"
              alt="FinACEverse Logo"
              width={20}
              height={20}
              className="rounded-sm object-contain"
            />
          </div>
          <span className="text-sm font-semibold tracking-wide text-finaceverse-brand">
            FinACEverse
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinACEverseFooter;
