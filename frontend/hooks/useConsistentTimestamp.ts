import { useEffect, useRef } from 'react';

/**
 * Hook that provides consistent timestamps during SSR/hydration
 * Returns a function that gives the same timestamp until client-side hydration completes
 */
export function useConsistentTimestamp() {
  const baseTimestamp = useRef<Date | null>(null);
  const isHydratedRef = useRef(false);

  useEffect(() => {
    // Mark as hydrated on client side
    isHydratedRef.current = true;
  }, []);

  const getTimestamp = (): Date => {
    // During SSR and initial render, use a consistent base timestamp
    if (!isHydratedRef.current) {
      if (!baseTimestamp.current) {
        // Use a fixed timestamp for SSR consistency
        baseTimestamp.current = new Date('2024-01-01T00:00:00.000Z');
      }
      return baseTimestamp.current;
    }
    
    // After hydration, use real timestamps
    return new Date();
  };

  return getTimestamp;
}