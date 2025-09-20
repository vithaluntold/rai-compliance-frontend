"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface LoadingState {
  isLoading: boolean;
  currentOperation: string | null;
  progress: number;
  operationId: string | null;
}

interface LoadingContextType {
  loadingState: LoadingState;
  startOperation: (operation: string, showToast?: boolean) => string;
  updateProgress: (operationId: string, progress: number, message?: string) => void;
  completeOperation: (operationId: string, successMessage?: string) => void;
  failOperation: (operationId: string, errorMessage?: string) => void;
  isOperationActive: (operationId: string) => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    currentOperation: null,
    progress: 0,
    operationId: null,
  });
  
  const { toast } = useToast();

  const startOperation = useCallback((operation: string, showToast = true): string => {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setLoadingState({
      isLoading: true,
      currentOperation: operation,
      progress: 0,
      operationId,
    });

    if (showToast) {
      toast({
        title: "Processing",
        description: operation,
        duration: 2000,
      });
    }

    return operationId;
  }, [toast]);

  const updateProgress = useCallback((operationId: string, progress: number, message?: string) => {
    setLoadingState(prev => {
      if (prev.operationId === operationId) {
        return {
          ...prev,
          progress: Math.min(100, Math.max(0, progress)),
          currentOperation: message || prev.currentOperation,
        };
      }
      return prev;
    });
  }, []);

  const completeOperation = useCallback((operationId: string, successMessage?: string) => {
    setLoadingState(prev => {
      if (prev.operationId === operationId) {
        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage,
            variant: "default",
          });
        }
        
        return {
          isLoading: false,
          currentOperation: null,
          progress: 100,
          operationId: null,
        };
      }
      return prev;
    });
  }, [toast]);

  const failOperation = useCallback((operationId: string, errorMessage?: string) => {
    setLoadingState(prev => {
      if (prev.operationId === operationId) {
        if (errorMessage) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
        
        return {
          isLoading: false,
          currentOperation: null,
          progress: 0,
          operationId: null,
        };
      }
      return prev;
    });
  }, [toast]);

  const isOperationActive = useCallback((operationId: string): boolean => {
    return loadingState.operationId === operationId && loadingState.isLoading;
  }, [loadingState]);

  return (
    <LoadingContext.Provider
      value={{
        loadingState,
        startOperation,
        updateProgress,
        completeOperation,
        failOperation,
        isOperationActive,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}