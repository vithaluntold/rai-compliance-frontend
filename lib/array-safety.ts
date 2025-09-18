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
      console.warn('safeMap: Expected array but got:', typeof array, array);
      return fallback;
    }
    return (array as T[]).map(callback);
  } catch (error) {
    console.error('safeMap: Error during mapping:', error);
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
      console.warn('safeReduce: Expected array but got:', typeof array, array);
      return initialValue;
    }
    return array.reduce(callback, initialValue);
  } catch (error) {
    console.error('safeReduce: Error during reduction:', error);
    return initialValue;
  }
}

export function safeFilter<T>(
  array: unknown,
  callback: (item: T, index: number, array: T[]) => boolean
): T[] {
  try {
    if (!Array.isArray(array)) {
      console.warn('safeFilter: Expected array but got:', typeof array, array);
      return [];
    }
    return array.filter(callback);
  } catch (error) {
    console.error('safeFilter: Error during filtering:', error);
    return [];
  }
}

/**
 * Recursively ensures all nested arrays in an object are safe
 */
export function sanitizeArrays(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeArrays);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeArrays(value);
    }
    return sanitized;
  }
  
  return obj;
}