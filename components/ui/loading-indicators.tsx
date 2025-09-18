"use client";

import { useLoading } from '@/contexts/loading-context';
import { Progress } from '@/components/ui/progress';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlobalLoadingIndicator() {
  const { loadingState } = useLoading();

  if (!loadingState.isLoading) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white shadow-lg border border-gray-200 rounded-xl p-4 max-w-sm">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--rai-primary))]" />
          <div className="absolute -top-1 -right-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {loadingState.currentOperation || 'Processing...'}
          </p>
          {loadingState.progress > 0 && (
            <div className="mt-2 space-y-1">
              <Progress 
                value={loadingState.progress} 
                className="w-full h-1.5" 
              />
              <p className="text-xs text-gray-500">
                {Math.round(loadingState.progress)}% complete
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NetworkStatusIndicator() {
  const { loadingState } = useLoading();

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300",
          loadingState.isLoading
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-gray-100 text-gray-600 border border-gray-200"
        )}
      >
        {loadingState.isLoading ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Active</span>
          </>
        ) : (
          <>
            <div className="h-3 w-3 bg-gray-400 rounded-full" />
            <span>Idle</span>
          </>
        )}
      </div>
    </div>
  );
}