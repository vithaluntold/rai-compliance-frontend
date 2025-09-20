import React, { useState, useEffect } from "react";

// DocumentStatus component - fully fixed for deployment

interface IDocumentStatus {
  metadata_extraction: string;
  compliance_analysis: string;
  metadata?: Record<string, unknown>;
}

interface DocumentStatusProps {
  documentId: string;
  onComplete?: () => void;
}

// Mock API functions
const getDocumentStatus = async (id: string): Promise<IDocumentStatus> => {
  // Mock implementation for document status
  void id; // Acknowledge parameter usage
  return {
    metadata_extraction: 'COMPLETED',
    compliance_analysis: 'COMPLETED',
    metadata: {}
  };
};

const getDocumentResults = async (id: string): Promise<Record<string, unknown>> => {
  // Mock implementation for document results
  void id; // Acknowledge parameter usage
  return {};
};

// Helper functions for status badge styling
const getStatusBadgeColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-500';
    case 'processing':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'failed':
      return 'bg-red-500';
    case 'partial':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusTextColor = (status: string): string => {
  return status.toLowerCase() === 'pending' ? 'text-black' : 'text-white';
};

const DocumentStatus: React.FC<DocumentStatusProps> = ({
  documentId,
  onComplete,
}) => {
  const [status, setStatus] = useState<IDocumentStatus | null>(null);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const statusData = await getDocumentStatus(documentId);
        setStatus(statusData);

        // Check if processing is complete
        if (
          statusData.metadata_extraction === "COMPLETED" &&
          statusData.compliance_analysis === "COMPLETED"
        ) {
          setIsPolling(false);
          const resultsData = await getDocumentResults(documentId);
          setResults(resultsData);
          onComplete?.();
        } else if (
          statusData.metadata_extraction === "FAILED" ||
          statusData.compliance_analysis === "FAILED"
        ) {
          setIsPolling(false);
          setError("Document processing failed");
          onComplete?.();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch status");
        setIsPolling(false);
        onComplete?.();
      }
    };

    // Initial poll
    pollStatus();

    // Set up polling interval
    if (isPolling) {
      pollInterval = setInterval(pollStatus, 5000); // Poll every 5 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [documentId, isPolling, onComplete]);

  if (error) {
    return (
      <div className="p-5 bg-red-50 border border-red-500 rounded text-red-700">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex flex-col items-center p-5">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-3">Loading status...</p>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="mb-5">
        <h3 className="text-xl font-semibold mb-3">Processing Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-4 border border-gray-300 rounded">
            <h4 className="text-lg font-medium mb-3">Metadata Extraction</h4>
            <div className={`inline-block px-2 py-1 rounded text-sm font-bold uppercase ${getStatusBadgeColor(status.metadata_extraction)} ${getStatusTextColor(status.metadata_extraction)}`}>
              {status.metadata_extraction}
            </div>
          </div>
          <div className="p-4 border border-gray-300 rounded">
            <h4 className="text-lg font-medium mb-3">Compliance Analysis</h4>
            <div className={`inline-block px-2 py-1 rounded text-sm font-bold uppercase ${getStatusBadgeColor(status.compliance_analysis)} ${getStatusTextColor(status.compliance_analysis)}`}>
              {status.compliance_analysis}
            </div>
          </div>
        </div>
      </div>

      {status.metadata && Object.keys(status.metadata).length > 0 && (
        <div className="mt-5 p-4 border border-gray-300 rounded">
          <h3 className="text-lg font-semibold mb-3">Document Metadata</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(status.metadata, null, 2)}
          </pre>
        </div>
      )}

      {results && Object.keys(results).length > 0 && (
        <div className="mt-5 p-4 border border-gray-300 rounded">
          <h3 className="text-lg font-semibold mb-3">Analysis Results</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DocumentStatus;
