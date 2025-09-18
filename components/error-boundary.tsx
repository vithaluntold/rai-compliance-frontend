"use client";

import React from "react";
import { Info } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error("ErrorBoundary caught an error:", error);
    console.error("Error info:", errorInfo);
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    
    // Handle specific error types
    if (error.message.includes("map is not a function")) {
      console.error("ARRAY ERROR: Detected .map() called on non-array:", error);
      console.error("Component stack:", errorInfo.componentStack);
    }
    
    // Handle chunk loading errors specifically
    if (error.message.includes("Loading chunk") || error.message.includes("ChunkLoadError")) {
      // Attempt to reload the page to recover from chunk loading errors
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <div className="text-left bg-red-50 p-4 rounded mb-4 max-w-md">
              <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
              <p className="text-red-700 text-sm mb-2">
                <strong>Message:</strong> {this.state.error?.message}
              </p>
              <p className="text-red-700 text-sm">
                <strong>Stack:</strong> 
                <pre className="whitespace-pre-wrap text-xs mt-1">
                  {this.state.error?.stack?.substring(0, 500)}...
                </pre>
              </p>
            </div>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message.includes("Loading chunk") 
                ? "Loading application components... Please wait, the page will refresh automatically."
                : "An unexpected error occurred. Please try refreshing the page."
              }
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;