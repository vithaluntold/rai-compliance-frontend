import React, { useState } from 'react';

interface DiagnosticResult {
  timestamp: string;
  documentId: string;
  environment: string;
  apiBaseUrl: string;
  checks: Array<{
    name: string;
    status: 'PASS' | 'FAIL' | 'ERROR';
    statusCode?: number;
    data?: unknown;
    error?: string;
  }>;
}

interface AnalysisDiagnosticsProps {
  documentId: string | null;
}

export function AnalysisDiagnostics({ documentId }: AnalysisDiagnosticsProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    if (!documentId) {
      setError('No document ID available');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/debug/analysis?documentId=${documentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setDiagnostics(result);
      
      // Also log to console for debugging
      if (typeof window !== 'undefined' && window.console) {
        window.console.log('🔍 Backend Diagnostics Results:', result);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      if (typeof window !== 'undefined' && window.console) {
        window.console.error('🚨 Diagnostics failed:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const testDirectApiCall = async () => {
    if (!documentId) {
      setError('No document ID available');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const requestData = {
        framework: 'IFRS',
        standards: ['IAS 1', 'IAS 7', 'IAS 8'],
        specialInstructions: 'Test call from diagnostics',
        extensiveSearch: false,
        processingMode: 'enhanced'
      };
      
      const response = await fetch('/api/debug/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          requestData
        })
      });
      
      const result = await response.json();
      
      if (typeof window !== 'undefined' && window.console) {
        window.console.log('🔍 Direct API Call Results:', result);
      }
      
      // Show results in UI
      setDiagnostics(prev => ({
        ...prev!,
        timestamp: new Date().toISOString(),
        documentId,
        environment: 'test',
        apiBaseUrl: 'direct-test',
        checks: [
          ...prev?.checks || [],
          {
            name: 'Direct API Test',
            status: result.success ? 'PASS' : 'FAIL',
            statusCode: result.statusCode,
            data: result
          }
        ]
      }));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      if (typeof window !== 'undefined' && window.console) {
        window.console.error('🚨 Direct API test failed:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!documentId) {
    return (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <p className="text-gray-600">No document ID available for diagnostics</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">🔍 Backend Analysis Diagnostics</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Backend Diagnostics'}
        </button>
        
        <button
          onClick={testDirectApiCall}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Direct API Call'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {diagnostics && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <strong>Document ID:</strong> {diagnostics.documentId}<br />
            <strong>Environment:</strong> {diagnostics.environment}<br />
            <strong>API Base URL:</strong> {diagnostics.apiBaseUrl}<br />
            <strong>Timestamp:</strong> {diagnostics.timestamp}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Diagnostic Results:</h4>
            {diagnostics.checks.map((check, index) => (
              <div
                key={index}
                className={`p-2 border rounded text-sm ${
                  check.status === 'PASS'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : check.status === 'FAIL'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="font-medium">
                  {check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '⚠️' : '❌'} {check.name}
                </div>
                {check.statusCode && (
                  <div className="text-xs opacity-75">Status Code: {check.statusCode}</div>
                )}
                {check.error && (
                  <div className="text-xs opacity-75 mt-1">Error: {check.error}</div>
                )}
                {check.data ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs opacity-75">Show Details</summary>
                    <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                      {typeof check.data === 'string' ? check.data : JSON.stringify(check.data, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}