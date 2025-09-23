"use client";

import {useEffect, useState, useCallback} from "react";
import {useParams, useRouter} from "next/navigation";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {enhancedApi, setLoadingManager} from "@/lib/enhanced-api-client";
import {useToast} from "@/components/ui/use-toast";
import {useLoading} from "@/contexts/loading-context";
import {ProcessingLogs, useProcessingLogs} from "@/components/ui/processing-logs";
import FrameworkSelector from "@/components/framework-selector";
import Link from "next/link";
import {ArrowLeft, Loader2, AlertCircle, Activity, Clock} from "lucide-react";


// Local interface for the extraction page with required fields
interface DocumentMetadata {
  company_name: string;
  nature_of_business: string;
  operational_demographics: string;
  financial_statements_type?: string;
  _overall_status: string;
}

const fieldLabels: Record<string, string> = {
  company_name: "Company Name",
  nature_of_business: "Nature of Business",
  operational_demographics: "Operational Demographics",
  financial_statements_type: "Type of Financial Statements",
  // Add more mappings as needed
};

function renderMetadataValue(_key: string, value: unknown) {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside">
        {value.map((item, idx) => (
          <li key={idx}>{String(item)}</li>
        ))}
      </ul>
    );
  }
  return <span>{String(value || '')}</span>;
}

export default function DocumentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { startOperation, updateProgress, completeOperation, failOperation, loadingState } = useLoading();
  const { logs, addLog } = useProcessingLogs();
  const documentId = params['documentId'] as string;
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);
  const [showFrameworkSelector, setShowFrameworkSelector] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(
    "Checking document status...",
  );
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [apiCallCount, setApiCallCount] = useState(0);
  const [lastApiCall, setLastApiCall] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(true); // Show logs by default for debugging

  // Set up the loading manager for the enhanced API
  useEffect(() => {
    setLoadingManager({
      startOperation,
      updateProgress,
      completeOperation,
      failOperation,
    });
  }, [startOperation, updateProgress, completeOperation, failOperation]);

  // Test backend connectivity on component mount
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        const backendUrl = process.env['NEXT_PUBLIC_API_URL'] || 'https://rai-compliance-backend.onrender.com';
        addLog('info', 'System', `Testing backend connectivity to: ${backendUrl}`);
        
        const response = await fetch(`${backendUrl}/api/v1/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const healthData = await response.json();
          addLog('success', 'System', 'Backend connection successful', { 
            backendUrl, 
            status: response.status,
            health: healthData 
          });
        } else {
          addLog('warning', 'System', `Backend responded with status ${response.status}`, { 
            backendUrl, 
            status: response.status 
          });
        }
      } catch (error) {
        addLog('error', 'System', 'Failed to connect to backend', { 
          error: (error as Error).message,
          backendUrl: process.env['NEXT_PUBLIC_API_URL'] || 'https://rai-compliance-backend.onrender.com'
        });
      }
    };

    testBackendConnection();
  }, [addLog]);

  useEffect(() => {
    let mounted = true;
    let pollingInterval: NodeJS.Timeout | null = null;

    const checkStatus = async () => {
      try {
        setApiCallCount(prev => prev + 1);
        setLastApiCall(new Date().toLocaleTimeString());
        addLog('info', 'API', `Checking document status (call #${apiCallCount + 1})`, { 
          documentId, 
          apiUrl: process.env['NEXT_PUBLIC_API_URL'] || 'https://rai-compliance-backend.onrender.com' 
        });
        
        const startTime = Date.now();
        const status = await enhancedApi.analysis.getStatus(documentId);
        const duration = Date.now() - startTime;
        
        addLog('success', 'API', 'Status check completed', { 
          status: status.status, 
          metadata_extraction: status.metadata_extraction,
          fullResponse: status 
        }, duration);
        
        // Add alert for debugging
        if (typeof window !== "undefined") {
          // Removed console.warn for production
// Log the complete response structure
          // Removed console.warn for production
// Set debug info for display
          setDebugInfo(`Status: ${status.status}, MetadataExtraction: ${status.metadata_extraction}, Raw: ${JSON.stringify(status).substring(0, 200)}...`);
        }
        
        if (!mounted) return;

        const metadataStatus = status.metadata_extraction;        
        const isMetadataComplete = metadataStatus === "COMPLETED" || metadataStatus === "PARTIAL";
        const isAwaitingFramework = (status.status as string) === "awaiting_framework_selection";
        
        if (isMetadataComplete || isAwaitingFramework) {
          // Metadata extraction is complete, safe to load document
          addLog('success', 'Processing', 'Metadata extraction completed', { metadataStatus, overallStatus: status.status });
          
          // Update status to show we're transitioning
          setProcessingStatus("Loading extracted metadata...");
          
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }

          // Use metadata directly from status response instead of separate fetch
          if (status.metadata) {
            const extractValue = (field: unknown) => {
              // Handle both simple string values and complex objects
              if (typeof field === 'string') return field;
              if (field && typeof field === 'object' && 'value' in field && field.value) {
                return (field as { value: string }).value;
              }
              // If it's any other type, convert to string safely
              if (field !== null && field !== undefined) {
                return String(field);
              }
              return "";
            };
            
            const cleanExtractedText = (text: string) => {
              if (!text || text === "") return text;
              let cleaned = text.replace(/^(CERTAIN|PROBABLE|POSSIBLE)\|/i, '');
              const parts = cleaned.split('|');
              cleaned = parts[0]?.trim() || cleaned;
              cleaned = cleaned.replace(/\n\nOperational Demographics Certainty Scoring:[\s\S]*$/i, '');
              cleaned = cleaned.trim();
              if (cleaned && !cleaned.match(/[.!?]$/)) {
                cleaned += '.';
              }
              return cleaned;
            };

            setMetadata({
              company_name: cleanExtractedText(extractValue(status.metadata.company_name)),
              nature_of_business: cleanExtractedText(extractValue(status.metadata.nature_of_business)),
              operational_demographics: (() => {
                const value = cleanExtractedText(extractValue(status.metadata.operational_demographics));
                return value === "Not found" ? "" : value;
              })(),
              financial_statements_type: cleanExtractedText(extractValue(status.metadata.financial_statements_type)),
              _overall_status: status.metadata._overall_status || "COMPLETED",
            });
            
            addLog('success', 'Processing', 'Metadata loaded from status response', { 
              metadata: status.metadata,
              extractedCompanyName: cleanExtractedText(extractValue(status.metadata.company_name)),
              extractedBusinessNature: cleanExtractedText(extractValue(status.metadata.nature_of_business)),
              rawMetadataDebug: JSON.stringify(status.metadata),
              finalSetMetadata: {
                company_name: cleanExtractedText(extractValue(status.metadata.company_name)),
                nature_of_business: cleanExtractedText(extractValue(status.metadata.nature_of_business)),
                operational_demographics: (() => {
                  const value = cleanExtractedText(extractValue(status.metadata.operational_demographics));
                  return value === "Not found" ? "" : value;
                })(),
                financial_statements_type: cleanExtractedText(extractValue(status.metadata.financial_statements_type)),
              }
            });
            setProcessingStatus(null);
            setLoading(false);
          } else {
            // Fallback to separate fetch if no metadata in status
            setTimeout(() => {
              setProcessingStatus(null);
              fetchMetadata();
            }, 500);
          }
        } else if (metadataStatus === "PROCESSING") {
          addLog('info', 'Processing', 'Metadata extraction in progress');
          setProcessingStatus("Extracting metadata from document...");
        } else if (metadataStatus === "FAILED" || status.status === "FAILED") {
          addLog('error', 'Processing', 'Document processing failed', { metadataStatus, overallStatus: status.status, message: status.message });
          
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }

          setProcessingStatus(null);
          setProcessingError(status.message || "Failed to process document");
          setLoading(false);
        } else {
          addLog('info', 'Processing', 'Document processing in progress', { metadataStatus, overallStatus: status.status });
          setProcessingStatus("Document processing in progress...");
        }
      } catch (error: unknown) {
        // Removed console.error for production
addLog('error', 'API', 'Failed to check document status', { error: (error as Error)?.message });

        if (!mounted) return;

        setProcessingStatus(null);
        setProcessingError((error as Error)?.message || "Failed to check document status");
        setLoading(false);
      }
    };

    // Immediately check status
    addLog('info', 'System', 'Starting document status monitoring');
    checkStatus();

    // Start polling if not immediately ready
    pollingInterval = setInterval(checkStatus, 2000);

    return () => {
      mounted = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [documentId, addLog, apiCallCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMetadata = useCallback(async () => {
    try {      
      setApiCallCount(prev => prev + 1);
      setLastApiCall(new Date().toLocaleTimeString());
      
      const response = await enhancedApi.documents.get(documentId);      
      if (response.metadata) {        
        // Helper function to extract value from metadata field
        const extractValue = (field: unknown) => {
          if (typeof field === 'string') return field;
          if (field && typeof field === 'object' && 'value' in field && field.value) {
            return (field as { value: string }).value;
          }
          return "";
        };
        
        // Helper function to clean extracted text while preserving operational detail
        const cleanExtractedText = (text: string) => {
          if (!text || text === "") return text;
          
          // Remove confidence indicators like "CERTAIN|" but preserve the content
          let cleaned = text.replace(/^(CERTAIN|PROBABLE|POSSIBLE)\|/i, '');
          
          // For business nature, preserve operational details but clean up technical references
          if (text.toLowerCase().includes('management') || text.toLowerCase().includes('development') || text.toLowerCase().includes('business')) {
            // Split by | and intelligently combine meaningful parts
            const parts = cleaned.split('|');
            const meaningfulParts = [];
            for (let part of parts) {
              part = part.trim();
              // Skip page references, but keep operational descriptions
              if (!part.match(/^p\.\d+/i) && 
                  !part.match(/^\d+,?\s*\d*$/i) && 
                  part.length > 3 &&
                  !part.toLowerCase().includes('headers')) {
                meaningfulParts.push(part);
              }
            }
            
            // Combine meaningful parts with proper punctuation
            cleaned = meaningfulParts.slice(0, 2).join('. ');
          } else {
            // For other fields, take the main content
            const parts = cleaned.split('|');
            cleaned = parts[0]?.trim() || cleaned;
          }
          
          // Remove specific technical scoring sections but preserve operational context
          cleaned = cleaned.replace(/\n\nOperational Demographics Certainty Scoring:[\s\S]*$/i, '');
          
          // Clean up extra whitespace
          cleaned = cleaned.trim();
          
          // Ensure proper sentence structure
          if (cleaned && !cleaned.match(/[.!?]$/)) {
            cleaned += '.';
          }
          
          return cleaned;
        };
        
        setMetadata({
          company_name: cleanExtractedText(extractValue(response.metadata.company_name)),
          nature_of_business: cleanExtractedText(extractValue(response.metadata.nature_of_business)),
          operational_demographics: (() => {
            const value = cleanExtractedText(extractValue(response.metadata.operational_demographics));
            return value === "Not found" ? "" : value;
          })(),
          _overall_status: response.metadata._overall_status || "PENDING",
        });
      } else {
        // Removed console.log for production
      }
    } catch {
      // Removed console.error for production
      toast({
        title: "Error",
        description: "Failed to load document metadata",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [documentId, toast]);

  const handleContinue = () => {
    setShowFrameworkSelector(true);
  };

  const handleFrameworkSelectionComplete = () => {
    // Navigate to compliance page after framework selection
    router.push(
      `/compliance/multi/ifrs/${documentId}?from=framework_selection`,
    );

    // Show a success toast to indicate the analysis is continuing
    toast({
      title: "Framework selected",
      description:
        "Compliance analysis has started and will continue in the background",
      variant: "default",
    });
  };

  const handleFrameworkSelectionError = (error: Error | unknown) => {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        {/* VERY OBVIOUS VISUAL INDICATOR */}
        <div className="bg-red-600 text-white p-6 text-center font-bold text-2xl border-b-4 border-red-800">
          🚨 ENHANCED VISUAL FEEDBACK SYSTEM IS ACTIVE 🚨
          <div className="text-lg mt-2">You should see detailed API monitoring below!</div>
        </div>
        
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full">
            {processingStatus ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--rai-primary))/10] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--rai-primary))]" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Processing Document
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {processingStatus}
                </p>
                
              {/* API Activity Panel - VERY VISIBLE */}
              <div className="bg-yellow-300 border-4 border-orange-500 rounded-xl p-6 mb-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between text-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-6 w-6 text-red-600 animate-pulse" />
                    <span className="text-black font-bold text-xl">🔥 LIVE API MONITORING 🔥</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full animate-bounce" />
                    <span className="text-green-800 text-lg font-black">ACTIVE</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-lg bg-white p-4 rounded-lg border-2 border-black">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-bold">API Calls Made:</span>
                    <span className="font-black text-red-600 text-2xl bg-yellow-200 px-3 py-1 rounded">{apiCallCount}</span>
                  </div>
                  {lastApiCall && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-bold">Last Call:</span>
                      <span className="font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">{lastApiCall}</span>
                    </div>
                  )}
                  {loadingState.isLoading && (
                    <div className="bg-green-100 border-3 border-green-500 rounded-lg p-4 mt-3">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-green-600 animate-spin" />
                        <span className="text-green-800 font-bold text-lg">⚡ {loadingState.currentOperation}</span>
                      </div>
                      {loadingState.progress > 0 && (
                        <div className="mt-3">
                          <Progress value={loadingState.progress} className="h-4 bg-gray-300" />
                          <p className="text-sm text-green-700 mt-2 font-bold text-center">{loadingState.progress}% COMPLETE</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>                {/* Processing Logs */}
                <div className="mt-6">
                  <ProcessingLogs
                    logs={logs}
                    isVisible={showLogs}
                    onToggle={() => setShowLogs(!showLogs)}
                    maxHeight="200px"
                  />
                </div>

                {/* Connection Status */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Backend URL:</span>
                      <span className="font-mono text-blue-900 text-right break-all">
                        {process.env['NEXT_PUBLIC_API_URL'] || 'https://rai-compliance-backend.onrender.com'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Document ID:</span>
                      <span className="font-mono text-blue-900">{documentId}</span>
                    </div>
                  </div>
                </div>

                {debugInfo && (
                  <div className="bg-gray-100 p-3 rounded-lg mb-4">
                    <p className="text-xs text-gray-700 font-mono">{debugInfo}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Progress value={60} className="w-full h-2" />
                  <p className="text-xs text-gray-500">
                    This may take a few minutes
                  </p>
                </div>
              </div>
            ) : processingError ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Processing Error
                </h2>
                <p className="text-red-600 mb-6 leading-relaxed">
                  {processingError}
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className="border w-full rounded-xl"
                >
                  Return to Upload
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--rai-primary))/10] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--rai-primary))]" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Loading document details...
                </h2>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-[hsl(var(--rai-primary))] text-white shadow-xl border-b border-[hsl(var(--rai-primary))/20]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Image src="/logo.png" alt="RAi" className="h-6 w-6" width={24} height={24} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  RAi Compliance Engine
                </h1>
                <p className="text-blue-100 text-sm">
                  Document Analysis & Extraction
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100 font-medium">
                Document Analysis
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href="/documents"
            className="inline-flex items-center text-sm text-gray-600 hover:text-[hsl(var(--rai-primary))] transition-colors duration-200 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 hover:border-[hsl(var(--rai-primary))/30] hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[hsl(var(--rai-primary))/5] to-[hsl(var(--rai-primary))/10] px-8 py-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">
              Document Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Review extracted metadata and proceed with compliance analysis
            </p>
          </div>

          <div className="p-8">
            {showFrameworkSelector ? (
              <div className="space-y-6">
                <div className="bg-[hsl(var(--rai-primary))/5] border border-[hsl(var(--rai-primary))/20] p-6 rounded-2xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[hsl(var(--rai-primary))/10] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-[hsl(var(--rai-primary))]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[hsl(var(--rai-primary))] mb-2">
                        Select Reporting Framework
                      </h3>
                      <p className="text-[hsl(var(--rai-primary))/80] leading-relaxed">
                        Please select a financial reporting framework and one or
                        more standards to check compliance with.
                      </p>
                      <p className="text-[hsl(var(--rai-primary))/70] text-sm mt-3">
                        The system supports various accounting frameworks
                        including IFRS, IAS, IFRS for SMEs, SIC and IPSAS.
                      </p>
                    </div>
                  </div>
                </div>

                <FrameworkSelector
                  onSelectionComplete={handleFrameworkSelectionComplete}
                  onError={handleFrameworkSelectionError}
                />
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-[hsl(var(--rai-primary))/10] rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-[hsl(var(--rai-primary))]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Company Information
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {metadata &&
                      Object.entries(metadata)
                        .filter(
                          ([key]) =>
                            key !== "_overall_status" &&
                            key !== "overall_status",
                        )
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200 p-6 rounded-xl border border-gray-200"
                          >
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <div className="w-2 h-2 bg-[hsl(var(--rai-primary))] rounded-full mr-3"></div>
                              {fieldLabels[key] || key.replace(/_/g, " ")}
                            </h3>
                            {renderMetadataValue(key, value) &&
                              (typeof value === "string" ||
                              typeof value === "number" ? (
                                <p className="text-gray-700 leading-relaxed">
                                  {renderMetadataValue(key, value)}
                                </p>
                              ) : (
                                <div className="text-gray-700 leading-relaxed">
                                  {renderMetadataValue(key, value)}
                                </div>
                              ))}
                          </div>
                        ))}
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <Button
                    onClick={handleContinue}
                    className="bg-[hsl(var(--rai-primary))] hover:bg-[hsl(var(--rai-primary))/90] text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    Continue to Compliance Check
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
