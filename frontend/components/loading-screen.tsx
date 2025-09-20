import {AlertCircle, Loader2} from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export function LoadingScreen({
  message = "Loading...",
  isError = false,
  errorMessage = "An error occurred",
  onRetry,
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        {isError ? (
          <>
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analysis Failed
            </h3>
            <p className="text-gray-500 text-sm max-w-md text-center mb-4">
              {errorMessage}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry Analysis
              </button>
            )}
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {message}
            </h3>
            <p className="text-gray-500 text-sm max-w-md text-center">
              This may take a few moments. Please wait while we process your
              request.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
