/**
 * Array safety utilities to prevent .map() errors
 */

export function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

export function safeMap<T, R>(
  array: T[] | unknown,
  callback: (item: T, index: number, array: T[]) => R,
  fallback: R[] = []
): R[] {
  try {
    if (!Array.isArray(array)) {
      // Removed console.warn for production
return fallback;
    }
    return (array as T[]).map(callback);
  } catch {
    // Removed console.error for production
return fallback;
  }
}

export function safeReduce<T, R>(
  array: unknown,
  callback: (accumulator: R, currentValue: T, currentIndex: number, array: T[]) => R,
  initialValue: R
): R {
  try {
    if (!Array.isArray(array)) {
      // Removed console.warn for production
return initialValue;
    }
    return array.reduce(callback, initialValue);
  } catch {
    // Removed console.error for production
return initialValue;
  }
}

export function safeFilter<T>(
  array: unknown,
  callback: (item: T, index: number, array: T[]) => boolean
): T[] {
  try {
    if (!Array.isArray(array)) {
      // Removed console.warn for production
return [];
    }
    return array.filter(callback);
  } catch {
    // Removed console.error for production
return [];
  }
}

/**
 * Recursively ensures all nested arrays in an object are safe
 */
export function sanitizeArrays(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeArrays);
  }
  
  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeArrays(value);
    }
    return sanitized;
  }
  
  return obj;
}