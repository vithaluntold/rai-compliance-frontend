import React, { createContext, useContext, useState } from 'react';

interface ProgressContextType {
  progress: number;
  status: string;
  message: string | null;
  error: string | null;
  isConnected: boolean;
  currentStep: number;
  totalSteps: number;
  details: unknown;
}

const defaultContext: ProgressContextType = {
  progress: 0,
  status: "idle",
  message: null,
  error: null,
  isConnected: false,
  currentStep: 0,
  totalSteps: 0,
  details: null,
};

const ProgressContext = createContext<ProgressContextType>(defaultContext);

export const useProgress = () => useContext(ProgressContext);

interface ProgressProviderProps {
  children: React.ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({
  children,
}) => {
  const [progress] = useState(0);
  const [status] = useState("idle");
  const [message] = useState<string | null>(null);
  const [currentStep] = useState(0);
  const [totalSteps] = useState(0);
  const [details] = useState<unknown>(null);

  // Temporary fallback values until WebSocket is implemented
  const isConnected = false;
  const error = null;

  const value: ProgressContextType = {
    progress,
    status,
    message,
    error,
    isConnected,
    currentStep,
    totalSteps,
    details,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
