import React, { useState, useEffect } from "react";

// Mock types and functions for test file
interface IDocumentStatus {
  metadata_extraction: string;
  compliance_analysis: string;
  metadata?: unknown;
}

const getDocumentStatus = async (id: string): Promise<IDocumentStatus> => {
  return {
    metadata_extraction: 'COMPLETED',
    compliance_analysis: 'COMPLETED',
    metadata: {}
  };
};

const getDocumentResults = async (id: string) => {
  return {};
};

interface DocumentStatusProps {
  documentId: string;
  onComplete?: () => void;
}

// Helper functions for status badge styling
const getStatusBadgeColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return '#ffd700';
    case 'processing':
      return '#2196f3';
    case 'completed':
      return '#4caf50';
    case 'failed':
      return '#f44336';
    case 'partial':
      return '#ff9800';
    default:
      return '#9e9e9e';
  }
};

const getStatusBadgeTextColor = (status: string): string => {
  return status.toLowerCase() === 'pending' ? '#000' : 'white';
};

const DocumentStatus: React.FC<DocumentStatusProps> = ({
  documentId,
  onComplete,
}) => {
  const [status, setStatus] = useState<IDocumentStatus | null>(null);
  const [results, setResults] = useState<any>(null);
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
      <div style={{
        padding: '20px',
        backgroundColor: '#ffebee',
        border: '1px solid #f44336',
        borderRadius: '4px',
        color: '#f44336'
      }}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading status...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3>Processing Status</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginTop: '10px'
        }}>
          <div style={{
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            <h4>Metadata Extraction</h4>
            <div style={{
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.8em',
              backgroundColor: getStatusBadgeColor(status.metadata_extraction),
              color: getStatusBadgeTextColor(status.metadata_extraction)
            }}>
              {status.metadata_extraction}
            </div>
          </div>
          <div style={{
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            <h4>Compliance Analysis</h4>
            <div style={{
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.8em',
              backgroundColor: getStatusBadgeColor(status.compliance_analysis),
              color: getStatusBadgeTextColor(status.compliance_analysis)
            }}>
              {status.compliance_analysis}
            </div>
          </div>
        </div>
      </div>

      {status.metadata && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}>
          <h3>Document Metadata</h3>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '4px',
            overflowX: 'auto'
          }}>{JSON.stringify(status.metadata, null, 2)}</pre>
        </div>
      )}

      {results && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}>
          <h3>Analysis Results</h3>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '4px',
            overflowX: 'auto'
          }}>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DocumentStatus;
