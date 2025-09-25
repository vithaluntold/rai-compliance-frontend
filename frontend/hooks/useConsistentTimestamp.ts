import { useRef } from 'react';

/**
 * Hook that provides consistent timestamps during SSR/hydration
 * Always returns the same timestamp to prevent hydration mismatches
 */
export function useConsistentTimestamp() {
  const baseTimestamp = useRef<Date | null>(null);

  const getTimestamp = (): Date => {
    // Always use the same base timestamp to prevent any hydration mismatches
    if (!baseTimestamp.current) {
      // Use a fixed timestamp for SSR consistency
      baseTimestamp.current = new Date('2024-01-01T00:00:00.000Z');
    }
    
    // Always return the same timestamp to ensure server/client consistency
    return baseTimestamp.current;
  };

  return getTimestamp;
}