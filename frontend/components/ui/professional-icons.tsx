import React from 'react';

interface IconProps {
  className?: string;
}

export const CheckIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="check-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0087d9" />
        <stop offset="100%" stopColor="#005a9f" />
      </linearGradient>
    </defs>
    <path 
      d="M20 6L9 17L4 12" 
      stroke="url(#check-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const XMarkIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="x-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
    </defs>
    <path 
      d="M18 6L6 18M6 6L18 18" 
      stroke="url(#x-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const LightningIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0087d9" />
        <stop offset="100%" stopColor="#005a9f" />
      </linearGradient>
    </defs>
    <path 
      d="M13 2L3 14H12L11 22L21 10H12L13 2Z" 
      fill="url(#lightning-gradient)"
    />
  </svg>
);

export const RobotIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="robot-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0087d9" />
        <stop offset="100%" stopColor="#005a9f" />
      </linearGradient>
    </defs>
    <rect 
      x="6" y="6" width="12" height="10" rx="2" 
      stroke="url(#robot-gradient)" 
      strokeWidth="2" 
      fill="none"
    />
    <circle cx="9" cy="10" r="1" fill="url(#robot-gradient)" />
    <circle cx="15" cy="10" r="1" fill="url(#robot-gradient)" />
    <path 
      d="M9 14H15" 
      stroke="url(#robot-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path 
      d="M12 6V4M12 4H10M12 4H14" 
      stroke="url(#robot-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);

export const ChartIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0087d9" />
        <stop offset="100%" stopColor="#005a9f" />
      </linearGradient>
    </defs>
    <path 
      d="M3 3V21H21" 
      stroke="url(#chart-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M9 9L12 6L16 10L21 5" 
      stroke="url(#chart-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="search-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0087d9" />
        <stop offset="100%" stopColor="#005a9f" />
      </linearGradient>
    </defs>
    <circle 
      cx="11" cy="11" r="8" 
      stroke="url(#search-gradient)" 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M21 21L16.65 16.65" 
      stroke="url(#search-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const WarningIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="warning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <path 
      d="M10.29 3.86L1.82 18A2 2 0 0 0 3.54 21H20.46A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" 
      stroke="url(#warning-gradient)" 
      strokeWidth="2" 
      fill="none"
    />
    <line 
      x1="12" y1="9" x2="12" y2="13" 
      stroke="url(#warning-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <circle cx="12" cy="17" r="1" fill="url(#warning-gradient)" />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0087d9" />
        <stop offset="100%" stopColor="#005a9f" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
      fill="url(#star-gradient)"
    />
  </svg>
);

export const DocumentIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="document-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0087d9" />
        <stop offset="100%" stopColor="#005a9f" />
      </linearGradient>
    </defs>
    <path 
      d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" 
      stroke="url(#document-gradient)" 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M14 2V8H20" 
      stroke="url(#document-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <line 
      x1="16" y1="13" x2="8" y2="13" 
      stroke="url(#document-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <line 
      x1="16" y1="17" x2="8" y2="17" 
      stroke="url(#document-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <line 
      x1="10" y1="9" x2="8" y2="9" 
      stroke="url(#document-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);