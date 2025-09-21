import React from 'react';

// Professional blue icons to replace emoji icons
export const LightningIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" 
      fill="url(#lightning-gradient)" 
      stroke="#1E88E5" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64B5F6" />
        <stop offset="100%" stopColor="#1976D2" />
      </linearGradient>
    </defs>
  </svg>
);

export const XMarkIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M18 6L6 18M6 6l12 12" 
      stroke="#E53E3E" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const WrenchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" 
      fill="url(#wrench-gradient)" 
      stroke="#1E88E5"
      strokeWidth="1"
    />
    <defs>
      <linearGradient id="wrench-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64B5F6" />
        <stop offset="100%" stopColor="#1976D2" />
      </linearGradient>
    </defs>
  </svg>
);

export const LoadingIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${className} animate-spin`}>
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="url(#loading-gradient)" 
      strokeWidth="3" 
      strokeDasharray="60" 
      strokeDashoffset="20"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64B5F6" />
        <stop offset="100%" stopColor="#1976D2" />
      </linearGradient>
    </defs>
  </svg>
);

export const AlertIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" 
      fill="url(#alert-gradient)" 
      stroke="#1976D2" 
      strokeWidth="1"
    />
    <path d="M12 9v4M12 17h.01" stroke="#1976D2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="alert-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E3F2FD" />
        <stop offset="100%" stopColor="#BBDEFB" />
      </linearGradient>
    </defs>
  </svg>
);

export const StarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
      fill="url(#star-gradient)" 
      stroke="#1976D2" 
      strokeWidth="1"
    />
    <defs>
      <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64B5F6" />
        <stop offset="100%" stopColor="#1976D2" />
      </linearGradient>
    </defs>
  </svg>
);

export const ClipboardIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" 
      fill="url(#clipboard-gradient)" 
      stroke="#1976D2" 
      strokeWidth="2"
    />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="#1976D2"/>
    <path d="M16 12h-4M16 16h-6" stroke="#1976D2" strokeWidth="2" strokeLinecap="round"/>
    <defs>
      <linearGradient id="clipboard-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E3F2FD" />
        <stop offset="100%" stopColor="#BBDEFB" />
      </linearGradient>
    </defs>
  </svg>
);

export const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M20 6L9 17l-5-5" 
      stroke="#1976D2" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);