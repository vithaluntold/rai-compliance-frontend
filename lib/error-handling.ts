import {toast} from "@/components/ui/use-toast";

export interface ApiError {
  message: string;
  code?: string | number;
  details?: string;
  retryable?: boolean;
  statusCode?: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
};

// Enhanced error handling for API calls
export class ApiErrorHandler {
  private static retryConfig = DEFAULT_RETRY_CONFIG;

  static setRetryConfig(config: Partial<RetryConfig>) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  // Parse and categorize API errors
  static parseError(error: unknown): ApiError {
    // Network errors
    if (error instanceof Error && error.name === "TypeError" && error.message === "Failed to fetch") {
      return {
        message:
          "Unable to connect to the server. Please check your internet connection.",
        code: "NETWORK_ERROR",
        retryable: true,
        statusCode: 0,
      };
    }

    // Timeout errors
    if (error instanceof Error && (error.name === "AbortError" || (error as any).code === "TIMEOUT")) {
      return {
        message: "Request timed out. The server may be experiencing high load.",
        code: "TIMEOUT",
        retryable: true,
        statusCode: 408,
      };
    }

    // HTTP errors
    if (error && typeof error === "object" && "response" in error) {
      const httpError = error as any;
      const status = httpError.response?.status;
      const data = httpError.response?.data;

      switch (status) {
        case 400:
          return {
            message:
              data?.detail ||
              "Invalid request. Please check your input and try again.",
            code: "BAD_REQUEST",
            details: data?.details,
            retryable: false,
            statusCode: 400,
          };

        case 401:
          return {
            message:
              "Authentication required. Please refresh the page and try again.",
            code: "UNAUTHORIZED",
            retryable: false,
            statusCode: 401,
          };

        case 403:
          return {
            message:
              "Access denied. You don't have permission to perform this action.",
            code: "FORBIDDEN",
            retryable: false,
            statusCode: 403,
          };

        case 404:
          return {
            message:
              "Resource not found. The requested item may have been deleted.",
            code: "NOT_FOUND",
            retryable: false,
            statusCode: 404,
          };

        case 413:
          return {
            message: "File too large. Please upload a smaller file.",
            code: "PAYLOAD_TOO_LARGE",
            retryable: false,
            statusCode: 413,
          };

        case 429:
          return {
            message: "Too many requests. Please wait a moment and try again.",
            code: "RATE_LIMITED",
            retryable: true,
            statusCode: 429,
          };

        case 500:
          return {
            message:
              "Server error. Our team has been notified. Please try again later.",
            code: "INTERNAL_SERVER_ERROR",
            retryable: true,
            statusCode: 500,
          };

        case 502:
        case 503:
        case 504:
          return {
            message:
              "Service temporarily unavailable. Please try again in a few moments.",
            code: "SERVICE_UNAVAILABLE",
            retryable: true,
            statusCode: status,
          };

        default:
          return {
            message:
              data?.detail || 'An unexpected error occurred (${status}).',
            code: "UNKNOWN_HTTP_ERROR",
            retryable: status >= 500,
            statusCode: status,
          };
      }
    }

    // Generic JavaScript errors
    return {
      message:
        (error instanceof Error ? error.message : null) || "An unexpected error occurred. Please try again.",
      code: "UNKNOWN_ERROR",
      retryable: false,
    };
  }

  // Display user-friendly error messages
  static showError(error: ApiError, context?: string) {
    const title = this.getErrorTitle(error.code, context);
    const description = error.message;

    toast({
      title,
      description,
      variant: "destructive",
      duration: error.retryable ? 8000 : 6000, // Longer for retryable errors
    });
  }

  // Get appropriate error title based on context
  private static getErrorTitle(
    code?: string | number,
    context?: string,
  ): string {
    const contextMap: Record<string, string> = {
      upload: "Upload Failed",
      analysis: "Analysis Failed",
      download: "Download Failed",
      framework: "Framework Selection Failed",
      metadata: "Metadata Extraction Failed",
    };

    if (context && contextMap[context]) {
      return contextMap[context];
    }

    switch (code) {
      case "NETWORK_ERROR":
        return "Connection Error";
      case "TIMEOUT":
        return "Request Timeout";
      case "BAD_REQUEST":
        return "Invalid Request";
      case "UNAUTHORIZED":
        return "Authentication Required";
      case "FORBIDDEN":
        return "Access Denied";
      case "NOT_FOUND":
        return "Not Found";
      case "PAYLOAD_TOO_LARGE":
        return "File Too Large";
      case "RATE_LIMITED":
        return "Rate Limited";
      case "INTERNAL_SERVER_ERROR":
        return "Server Error";
      case "SERVICE_UNAVAILABLE":
        return "Service Unavailable";
      default:
        return "Error";
    }
  }

  // Exponential backoff delay calculation
  static calculateDelay(retryCount: number): number {
    const { baseDelay, maxDelay, backoffFactor } = this.retryConfig;
    const delay = baseDelay * Math.pow(backoffFactor, retryCount);
    return Math.min(delay, maxDelay);
  }

  // Retry wrapper for API calls
  static async withRetry<T>(
    apiCall: () => Promise<T>,
    context?: string,
    customRetryConfig?: Partial<RetryConfig>,
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customRetryConfig };
    let lastError: unknown;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (_error) {
        lastError = _error;
        const apiError = this.parseError(_error);

        // Don't retry non-retryable errors
        if (!apiError.retryable) {
          this.showError(apiError, context);
          throw _error;
        }

        // Don't retry on last attempt
        if (attempt === config.maxRetries) {
          this.showError(apiError, context);
          throw _error;
        }

        // Show retry notification
        const delay = this.calculateDelay(attempt);
        toast({
          title: "Retrying...",
          description: 'Attempt ${attempt + 1} failed. Retrying in ${Math.round(delay / 1000)} seconds...',
          duration: delay,
        });

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

// Network status monitoring
export class NetworkMonitor {
  private static isOnline = navigator.onLine;
  private static listeners: ((online: boolean) => void)[] = [];

  static initialize() {
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));
  }

  static cleanup() {
    window.removeEventListener("online", this.handleOnline.bind(this));
    window.removeEventListener("offline", this.handleOffline.bind(this));
  }

  private static handleOnline() {
    this.isOnline = true;
    this.notifyListeners(true);

    toast({
      title: "Connection Restored",
      description: "You're back online. Pending operations will resume.",
      duration: 3000,
    });
  }

  private static handleOffline() {
    this.isOnline = false;
    this.notifyListeners(false);

    toast({
      title: "Connection Lost",
      description: "You're offline. Please check your internet connection.",
      variant: "destructive",
      duration: 5000,
    });
  }

  static getStatus(): boolean {
    return this.isOnline;
  }

  static addListener(callback: (online: boolean) => void) {
    this.listeners.push(callback);
  }

  static removeListener(callback: (online: boolean) => void) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  private static notifyListeners(online: boolean) {
    this.listeners.forEach((listener) => listener(online));
  }
}

// No timeout wrapper - let backend handle timeouts
export function withTimeout<T>(
  promise: Promise<T>,
): Promise<T> {
  // Just return the original promise without any timeout
  return promise;
}

// Usage example for the chat interface
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  context: string,
  options?: {
    timeout?: number;
    retryConfig?: Partial<RetryConfig>;
    showLoading?: boolean;
  },
): Promise<T> {
  const { timeout, retryConfig, showLoading = false } = options || {};

  if (showLoading) {
    toast({
      title: "Processing...",
      description: '${context} in progress...',
      duration: 1000,
    });
  }

  // Check network status
  if (!NetworkMonitor.getStatus()) {
    const error: ApiError = {
      message:
        "No internet connection. Please check your network and try again.",
      code: "NETWORK_ERROR",
      retryable: true,
    };
    ApiErrorHandler.showError(error, context);
    throw new Error(error.message);
  }

  try {
    // Only use timeout if explicitly specified, otherwise let backend handle it
    const apiCallToExecute = timeout
      ? () => withTimeout(apiCall())
      : apiCall;
    return await ApiErrorHandler.withRetry(
      apiCallToExecute,
      context,
      retryConfig,
    );
  } catch (_error) {
    // Error already shown by ApiErrorHandler
    throw _error;
  }
}
