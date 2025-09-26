"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { SidePanel } from "./side-panel";
import { SessionsSidebar } from "./sessions-sidebar";
import { useToast } from "@/components/ui/use-toast";
import { api, SessionDetail } from "@/lib/api-client";
import { useProcessingLogs } from "@/components/ui/processing-logs";
import { useTheme } from "@/context/theme-context";
import {
  Framework,
  updateAvailableStandards,
  toggleStandardSelection,
  selectAllStandards,
  clearAllStandards,
  validateFrameworkSubmission,
  logFrameworkSelection,
} from "@/lib/framework-selection-utils";
import { Loader2 } from "lucide-react";
import { 
  XMarkIcon, 
  LightningIcon, 
  RobotIcon, 
  ChartIcon, 
  SearchIcon
} from "@/components/ui/professional-icons";

// Unique ID generator to prevent React key collisions
let messageIdCounter = 0;
const generateUniqueId = () => {
  // Use a consistent counter to avoid hydration mismatches
  return `msg_${++messageIdCounter}`;
};

// Utility functions
const safeApiCall = async <T,>(
  apiCall: () => Promise<T>
): Promise<T | null> => {
  try {
    return await apiCall();
  } catch {
    // Silent error handling - logging handled by caller if needed
    return null;
  }
};

const safeMap = <T, R>(
  array: T[] | undefined | null,
  mapFn: (item: T, index: number) => R
): R[] => {
  if (!Array.isArray(array)) return [];
  return array.map(mapFn);
};

// AnalysisProgress component
interface AnalysisProgressProps {
  currentStandard: string;
  completedStandards: number;
  totalStandards: number;
  progressPercent: number;
  estimatedTimeRemaining: number;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentStandard,
  completedStandards,
  totalStandards,
  progressPercent,
  estimatedTimeRemaining,
}) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Analysis Progress</h3>
      <span className="text-xs text-gray-500 dark:text-gray-400">{progressPercent.toFixed(1)}%</span>
    </div>
    <Progress value={progressPercent} className="w-full h-2 mb-2" />
    <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
      Current: {currentStandard}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      {completedStandards}/{totalStandards} standards • ~{estimatedTimeRemaining}min remaining
    </p>
  </div>
);

// Declare global setLoadingManager function - unused but kept for potential future use
// const setLoadingManager: ((manager: {
//   startOperation: (_id: string) => void;
//   updateProgress: (_id: string) => void;
//   completeOperation: (_id: string) => void;
//   failOperation: (_id: string) => void;
// }) => void) | null = null;

// Type definitions
interface DocumentMetadata {
  company_name?: string;
  nature_of_business?: string;
  operational_demographics?: string;
  financial_statements_type?: string;
  [key: string]: unknown;
}

interface SuggestedStandard {
  standard_id: string;
  standard_title: string;
  reasoning: string;
  relevance_score: number;
}

interface AnalysisStatusResponse {
  status?: string;
  progress?: number;
  metadata_extraction?: string;
  metadata?: DocumentMetadata;
  framework?: string;
  standards?: string[];
  [key: string]: unknown;
}

export interface Message {
  id: string;
  type: "user" | "system" | "loading" | "component";
  content: string | React.ReactNode;
  component?:
    | "analysis-mode-selection"
    | "suggestions";
  showResultsButton?: boolean;
  documentId?: string | null;
  metadata?: {
    fileId?: string;
    fileName?: string;
    progress?: number;
    documentMetadata?: DocumentMetadata;
    frameworks?: Framework[];
    analysisResults?: unknown;
    component?:
      | "analysis-mode-selection"
      | "suggestions";
    [key: string]: unknown;
  } | undefined;
}

export interface ChatStep {
  id: string;
  name: string;
  completed: boolean;
  active: boolean;
}

export interface ChatState {
  documentId: string | null;
  fileName: string | null;
  currentStep: ChatStep | null;
  documentMetadata: DocumentMetadata | null;
  selectedFramework: string | null;
  selectedStandards: string[];
  aiSuggestedStandards: string[]; // Track AI suggestions separately
  specialInstructions?: string;
  customInstructions?: string; // User-provided custom analysis instructions
  analysisResults: unknown | null;
  isProcessing: boolean;
  // Enhanced geographical processing mode
  processingMode: "enhanced" | null;
  pendingFile: File | null;
  keywordExtractionStatus: {
    discoveredKeywords: string[];
    currentKeyword: string | null;
    extractionStep: string;
    isExtracting: boolean;
  };
  processingStartTime: number | null;
  estimatedProcessingTime: number | null;
  currentProgress?: {
    percentage: number;
    currentStandard: string;
    completedStandards: number;
    totalStandards: number;
    processing_mode?: string; // Add processing mode field
    standards_detail?: Array<{
      standard_id: string;
      standard_name: string;
      status: string;
      progress_percentage: number;
      completed_questions: number;
      total_questions: number;
      current_question: string;
      elapsed_time_seconds: number;
      elapsed_time_formatted: string;
      questions_progress: Array<{
        id: string;
        section: string;
        question: string;
        status: string;
        completed_at: string | null;
        tick_mark: string;
      }>;
    }>;
  };
}

export function ChatInterface(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { addLog } = useProcessingLogs();
  
  // Session management state
  const [currentSession, setCurrentSession] = useState<SessionDetail | null>(null);
  const [showSessionsSidebar, setShowSessionsSidebar] = useState(true);
  
  // API tracking helper
  const trackApiCall = (apiName: string) => {
    addLog(
      'info',
      'API',
      `API call: ${apiName}`
    );
  };
  
  // Helper function to ensure arrays are safe for .map() operations
  const ensureArray = (value: unknown): unknown[] => {
    return Array.isArray(value) ? value : [];
  };
  
  // Helper function to safely extract metadata values
  const getMetadataValue = (field: unknown): string => {
    if (!field) return "";
    if (typeof field === "string") {
      // Handle structured format: "CONFIDENCE|VALUE|SOURCE|PAGES"
      if (field.includes("|")) {
        const parts = field.split("|");
        // Return just the value part (second element)
        const extractedValue = parts[1] || parts[0] || "";
        return extractedValue;
      }
      return field;
    }
    if (typeof field === "object" && field !== null && 'value' in field) {
      // Handle object format, apply same parsing to the value
      const value = (field as { value: unknown }).value;
      if (typeof value === "string" && value.includes("|")) {
        const parts = value.split("|");
        const extractedValue = parts[1] || parts[0] || "";
        return extractedValue;
      }
      return String(value || "");
    }
    return "";
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [pollingTimer, setPollingTimer] = useState<NodeJS.Timeout | null>(null);
  const [chatState, setChatState] = useState<ChatState>({
    documentId: null,
    fileName: null,
    currentStep: null,
    documentMetadata: null,
    selectedFramework: null,
    selectedStandards: [],
    aiSuggestedStandards: [], // Initialize AI suggestions
    specialInstructions: "",
    analysisResults: null,
    isProcessing: false,
    // Enhanced geographical processing mode
    processingMode: "enhanced",
    pendingFile: null,
    keywordExtractionStatus: {
      discoveredKeywords: [],
      currentKeyword: null,
      extractionStep: "Ready",
      isExtracting: false,
    },
    processingStartTime: null,
    estimatedProcessingTime: null,
  });
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Upload progress tracking
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Chat steps workflow - defined before useEffect to avoid reference errors
  const chatSteps: ChatStep[] = useMemo(
    () => [
      { id: "upload", name: "Document Upload", completed: false, active: true },
      {
        id: "metadata",
        name: "Metadata Confirmation",
        completed: false,
        active: false,
      },
      {
        id: "framework-selection",
        name: "Framework Selection",
        completed: false,
        active: false,
      },
      {
        id: "analysis",
        name: "Compliance Analysis",
        completed: false,
        active: false,
      },
      {
        id: "results",
        name: "Results Review",
        completed: false,
        active: false,
      },
    ],
    [],
  );

  // Helper function to create completion messages with proper documentId
  const addCompletionMessage = useCallback((content: string | React.ReactNode, documentId?: string | null, metadata?: Record<string, unknown>) => {
    // 🔧 FIX: Ensure consistent documentId - validate and log for debugging
    const resolvedDocumentId = documentId || chatState.documentId;
    
    // Validate documentId exists and is valid
    if (!resolvedDocumentId || typeof resolvedDocumentId !== 'string' || resolvedDocumentId.trim() === '') {
      // Don't add navigation button for invalid documentIds
      addLog('warning', 'Navigation', `Invalid documentId in completion message: ${documentId || 'null'}`);
      // Don't add navigation button for invalid documentIds
      const completionMessage: Message = {
        id: generateUniqueId(),
        type: "system",
        content,
        // No documentId = no navigation button
        metadata: { ...metadata },
      };
      setMessages((prev) => [...prev, completionMessage]);
      return completionMessage.id;
    }

    // Valid documentId - create message with navigation capability
    const completionMessage: Message = {
      id: generateUniqueId(),
      type: "system",
      content,
      documentId: resolvedDocumentId.trim(), // Always trim for consistency
      showResultsButton: true, // Explicitly enable the results button
      metadata: { 
        ...metadata,
        documentId: resolvedDocumentId.trim(),
        analysisResults: chatState.analysisResults // Include current results for consistency check
      },
    };
    setMessages((prev) => [...prev, completionMessage]);
    return completionMessage.id;
  }, [chatState.documentId, chatState.analysisResults, addLog]);

  // INITIALIZATION LOGIC - Always start fresh unless explicitly loading a session or document
  useEffect(() => {
    const resetParameter = searchParams.get('reset');
    const sessionId = searchParams.get('session');
    const documentId = searchParams.get('documentId');
    const isExplicitNavigation = resetParameter === 'true' || resetParameter === '1';
    
    const handlePageLoad = async () => {
      // Force reset if user explicitly navigated with reset parameter
      if (isExplicitNavigation) {
        performFullReset();
        return;
      }
      
      // Load document metadata directly if document ID is provided
      if (documentId) {
        await loadDocumentMetadata(documentId);
        return;
      }
      
      // Load specific session if requested
      if (sessionId) {
        await loadSession(sessionId);
        return;
      }
      
      // Default: Always start fresh for new sessions
      performFullReset();
    };

    const loadSession = async (sessionId: string) => {
      try {
        const session = await api.sessions.get(sessionId);
        setCurrentSession(session);
        
        // Restore chat state from session
        if (session.chat_state) {
          // Extract filename from session title if missing from chat state
          const chatStateData = session.chat_state as unknown as ChatState;
          let fileName = chatStateData.fileName;
          if (!fileName && session.title && session.title.startsWith('Analysis - ')) {
            fileName = session.title.replace('Analysis - ', '');
          }
          
          const restoredState: ChatState = {
            documentId: chatStateData.documentId || null,
            fileName: fileName,
            currentStep: chatStateData.currentStep || null,
            documentMetadata: chatStateData.documentMetadata || null,
            selectedFramework: chatStateData.selectedFramework || null,
            selectedStandards: chatStateData.selectedStandards || [],
            aiSuggestedStandards: chatStateData.aiSuggestedStandards || [],
            specialInstructions: chatStateData.specialInstructions || "",
            analysisResults: chatStateData.analysisResults || null,
            isProcessing: false,
            processingMode: chatStateData.processingMode || null,
            pendingFile: null,
            keywordExtractionStatus: chatStateData.keywordExtractionStatus || {
              discoveredKeywords: [],
              currentKeyword: null,
              extractionStep: "",
              isExtracting: false,
            },
            processingStartTime: null,
            estimatedProcessingTime: null,
            currentProgress: chatStateData.currentProgress || {
              percentage: 0,
              currentStandard: "",
              completedStandards: 0,
              totalStandards: 0,
            },
          };
          setChatState(restoredState);
          
          // If there's metadata in the restored state, log it for debugging
          if (restoredState.documentMetadata) {
          }
          
          // Log restored filename
          if (fileName) {
          }
        } else {
          // Default state if no chat state in session - try to extract filename from session title
          let extractedFileName = null;
          if (session.title && session.title.startsWith('Analysis - ')) {
            extractedFileName = session.title.replace('Analysis - ', '');
          } else {
          }
          
          setChatState({
            documentId: session.last_document_id || null,
            fileName: extractedFileName,
            currentStep: chatSteps[0] || null,
            documentMetadata: null,
            selectedFramework: null,
            selectedStandards: [],
            aiSuggestedStandards: [],
            specialInstructions: "",
            analysisResults: null,
            isProcessing: false,
            processingMode: "enhanced",
            pendingFile: null,
            keywordExtractionStatus: {
              discoveredKeywords: [],
              currentKeyword: null,
              extractionStep: "Ready",
              isExtracting: false,
            },
            processingStartTime: null,
            estimatedProcessingTime: null,
          });
        }

        // Restore messages from session
        if (session.messages && Array.isArray(session.messages) && session.messages.length > 0) {
          const typedMessages: Message[] = session.messages.map((msg: Record<string, unknown>) => ({
            id: String(msg['id'] || ''),
            type: (msg['type'] as "user" | "system" | "loading" | "component") || "system",
            content: String(msg['content'] || ''),
            component: (msg['component'] as "analysis-mode-selection" | "suggestions") || undefined,
            showResultsButton: Boolean(msg['showResultsButton']),
            documentId: msg['documentId'] ? String(msg['documentId']) : null,
            metadata: msg['metadata'] ? (msg['metadata'] as Message['metadata']) : {},
          }));
          setMessages(typedMessages);
        } else {
          setMessages([
            {
              id: generateUniqueId(),
              content: `Welcome back! Loaded session: ${session.title}`,
              type: "system",
            },
          ]);
        }

        // If session has a document but no metadata in chat_state, fetch it
        const chatStateData = session.chat_state as unknown as ChatState;
        const sessionDocumentId = (chatStateData?.documentId) || session.last_document_id;
        if (sessionDocumentId && typeof sessionDocumentId === 'string' && (!session.chat_state?.['documentMetadata'] || !chatStateData?.['documentMetadata']?.['company_name'])) {
          try {
            const status = await api.analysis.getStatus(sessionDocumentId);
            if (status.metadata && status.metadata['company_name']) {
              // Use the helper to extract values from the object structure
              const simpleMetadata = {
                company_name: getMetadataValue(status.metadata['company_name']),
                nature_of_business: getMetadataValue(status.metadata['nature_of_business']),
                operational_demographics: getMetadataValue(status.metadata['operational_demographics']),
              };

              setChatState((prev) => ({
                ...prev,
                documentId: sessionDocumentId as string, // Make sure document ID is set
                documentMetadata: simpleMetadata,
                currentStep: prev.currentStep?.id === 'upload' ? chatSteps.find(s => s.id === 'metadata') || prev.currentStep : prev.currentStep,
              }));

              // Add a message about loaded metadata
              setMessages(prev => [...prev, {
                id: generateUniqueId(),
                content: `Document metadata loaded: ${simpleMetadata.company_name}`,
                type: "system",
              }]);
            } else {
              // Set document ID even if no metadata yet
              setChatState((prev) => ({
                ...prev,
                documentId: sessionDocumentId as string,
              }));
            }
          } catch {
            // // Removed console.warn for production
// Still set document ID even if metadata fetch fails
            setChatState((prev) => ({
              ...prev,
              documentId: sessionDocumentId as string,
            }));
          }
        }

        // ✅ FIX: Check if the document has completed analysis and load results
        if (sessionDocumentId) {
          try {
            const status = await api.analysis.getStatus(sessionDocumentId);
            
            // If analysis is completed, load the full results
            if (status.status === "COMPLETED") {
              try {
                const analysisResults = await api.analysis.getResults(sessionDocumentId);
                
                setChatState((prev) => ({
                  ...prev,
                  analysisResults: analysisResults,
                  currentStep: chatSteps.find(s => s.id === 'results') || prev.currentStep,
                }));

                // Add enhanced smart categorization results message
                const getSmartCategorizationSummary = (results: unknown) => {
                  interface CategorizationSummary {
                    total_content_pieces?: number;
                    avg_confidence?: number;
                    category_distribution?: Record<string, number>;
                  }
                  interface ResultsWithCategorization {
                    categorization_summary?: CategorizationSummary;
                  }
                  
                  if (results && typeof results === 'object' && 'categorization_summary' in results) {
                    const typedResults = results as ResultsWithCategorization;
                    const catSum = typedResults.categorization_summary;
                    const catDist = catSum?.category_distribution || {};
                    const categories = Object.keys(catDist);
                    const totalPieces = catSum?.total_content_pieces || 0;
                    const avgConfidence = catSum?.avg_confidence || 0;
                    
                    let distText = "";
                    if (categories.length > 0) {
                      const topCategories = categories
                        .map(cat => `${cat}: ${catDist[cat]} pieces`)
                        .slice(0, 3)
                        .join(", ");
                      distText = `\n● **Category Distribution:** ${topCategories}${categories.length > 3 ? ` (and ${categories.length - 3} more)` : ""}`;
                    }
                    
                    return `\n\n**🧠 Smart Categorization Summary:**\n● **Total Content Pieces:** ${totalPieces}\n● **AI Confidence:** ${(avgConfidence * 100).toFixed(1)}%${distText}`;
                  }
                  return "";
                };

                addCompletionMessage(
                  `📊 **Smart Categorization Analysis Complete!**\n\nYour document has been successfully processed using advanced AI categorization technology. You can review the detailed compliance report or download the comprehensive findings.${getSmartCategorizationSummary(analysisResults)}`,
                  sessionDocumentId,
                  { analysisResults: analysisResults }
                );
                
                // // Removed console.log for production
} catch {
                // // Removed console.warn for production
// Still show that document is completed even if results fail
                setMessages(prev => [...prev, {
                  id: generateUniqueId(),
                  content: `⚠ Smart categorization analysis was completed, but results could not be loaded. You may need to re-run the analysis.`,
                  type: "system",
                }]);
              }
            } else if (status.status === "PROCESSING") {
              // If still processing, show status and start polling
              setMessages(prev => [...prev, {
                id: generateUniqueId(),
                content: `🔄 Smart categorization analysis is still in progress. Continuing from where we left off...`,
                type: "system",
              }]);
              
              setChatState((prev) => ({
                ...prev,
                isProcessing: true,
                currentStep: chatSteps.find(s => s.id === 'analysis') || prev.currentStep,
              }));
            } else if (status.status === "FAILED") {
              // If failed, show error message
              setMessages(prev => [...prev, {
                id: generateUniqueId(),
                content: <>
                  <XMarkIcon className="inline mr-2 h-4 w-4" />
                  Previous analysis failed. You can try uploading the document again.
                </>,
                type: "system",
              }]);
            }
          } catch {
            // // Removed console.warn for production
}
        }

        toast({
          title: "Session Loaded",
          description: `Loaded session: ${session.title}`,
        });
      } catch {
        // // Removed console.error for production
        // Clear the invalid session parameter from URL (client-side only)
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('session');
          window.history.replaceState({}, '', url.toString());
        }
        
        toast({
          title: "Session Not Found",
          description: "The requested session could not be found. Starting fresh.",
          variant: "destructive",
        });
        performFullReset();
      }
    };

    const loadDocumentMetadata = async (documentId: string) => {
      try {
        const analysisData = await api.analysis.getStatus(documentId);
        
        if (analysisData && analysisData.metadata) {
          // Use the helper to extract values from the object structure
          const simpleMetadata = {
            company_name: getMetadataValue(analysisData.metadata['company_name']),
            nature_of_business: getMetadataValue(analysisData.metadata['nature_of_business']),
            operational_demographics: getMetadataValue(analysisData.metadata['operational_demographics']),
          };

          // Set the chat state with the document metadata
          setChatState({
            documentId: documentId,
            fileName: documentId, // Use document ID as filename for now
            currentStep: chatSteps.find(s => s.id === 'metadata') || chatSteps[0] || null,
            documentMetadata: simpleMetadata,
            selectedFramework: null,
            selectedStandards: [],
            aiSuggestedStandards: [],
            specialInstructions: "",
            analysisResults: analysisData,
            isProcessing: false,
            processingMode: "enhanced",
            pendingFile: null,
            keywordExtractionStatus: {
              discoveredKeywords: [],
              currentKeyword: null,
              extractionStep: "Ready",
              isExtracting: false,
            },
            processingStartTime: null,
            estimatedProcessingTime: null,
          });

          // Add a welcome message with metadata
          setMessages([
            {
              id: generateUniqueId(),
              content: `Document loaded! Found metadata for: ${simpleMetadata.company_name}`,
              type: "system",
              metadata: {
                documentMetadata: simpleMetadata,
                fileId: documentId,
                fileName: documentId,
              }
            },
          ]);

        } else {
          // // Removed console.warn for production
performFullReset();
        }
      } catch {
        // // Removed console.error for production
toast({
          title: "Document Not Found",
          description: "The requested document could not be found. Starting fresh.",
          variant: "destructive",
        });
        performFullReset(); // Fallback to fresh state
      }
    };

    const performFullReset = () => {
      setChatState({
        documentId: null,
        fileName: null,
        currentStep: chatSteps[0] || null, // Set to upload step
        documentMetadata: null,
        selectedFramework: null,
        selectedStandards: [],
        aiSuggestedStandards: [],
        specialInstructions: "",
        analysisResults: null,
        isProcessing: false,
        processingMode: "enhanced",
        pendingFile: null,
        keywordExtractionStatus: {
          discoveredKeywords: [],
          currentKeyword: null,
          extractionStep: "Ready",
          isExtracting: false,
        },
        processingStartTime: null,
        estimatedProcessingTime: null,
      });

      // Set fresh welcome message
      setMessages([
        {
          id: generateUniqueId(),
          content: "Welcome to RAi Compliance Engine! I'll help you analyze your financial statements using our advanced smart categorization technology for precise compliance analysis. Let's start by uploading your document for intelligent processing.",
          type: "system",
        },
      ]);
    };

    // Run initialization logic
    handlePageLoad();
  }, [searchParams, toast, chatSteps, addCompletionMessage]);

  // Cleanup all polling on unmount AND on page load
  useEffect(() => {
    // NUCLEAR OPTION: Clear ALL timeouts and intervals on page load
    const highestTimeoutId = setTimeout(() => {}) as unknown as number;
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }
    clearTimeout(highestTimeoutId);

    // Clear any existing polling timers on component mount (page refresh)
    if (pollingTimer) {
      clearTimeout(pollingTimer);
      setPollingTimer(null);
    }

    return () => {
      // Clear polling on unmount
      if (pollingTimer) {
        clearTimeout(pollingTimer);
      }
    };
  }, [pollingTimer]);

  // Framework selection state
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>("");
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [frameworkStep, setFrameworkStep] = useState<"framework" | "standards">(
    "framework",
  );
  const [isFrameworkLoading, setIsFrameworkLoading] = useState<boolean>(false);
  const [isFrameworkSubmitting, setIsFrameworkSubmitting] =
    useState<boolean>(false);
  const [frameworkError, setFrameworkError] = useState<string | null>(null);

  // Special instructions state
  const [specialInstructions] = useState<string>("");
  // Removed isInstructionsSubmitting and instructionsError - no longer needed
  // Removed isSendButtonActive - no longer needed since special instructions are part of regular chat

  // Visual processing states
  const [showProcessingOverlay, setShowProcessingOverlay] = useState(false);
  const [processingStep, setProcessingStep] = useState<'metadata' | 'framework' | 'analysis' | null>(null);
  const [showAnalysisProgress, setShowAnalysisProgress] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-save disabled to prevent infinite loops - sessions save on explicit actions only
  // useEffect(() => {
  //   if (currentSession && (chatState.documentId || messages.length > 1)) {
  //     const saveTimeout = setTimeout(() => {
  //       saveCurrentSession();
  //     }, 2000);
  //     return () => clearTimeout(saveTimeout);
  //   }
  //   return undefined;
  // }, [chatState.documentId, chatState.currentStep?.id, messages.length, currentSession?.session_id]);

  // Load frameworks when reaching framework step
  useEffect(() => {
    const loadFrameworks = async () => {
      if (
        chatState.currentStep?.id === "framework-selection" &&
        frameworks.length === 0
      ) {
        setIsFrameworkLoading(true);
        setFrameworkError(null);

        try {
          trackApiCall('analysis.getFrameworks');
          const response = await api.analysis.getFrameworks();

          if (
            response &&
            response['frameworks'] &&
            Array.isArray(response['frameworks'])
          ) {
            if (response['frameworks'].length === 0) {
              // Fallback: Provide basic IFRS framework when backend returns empty
              setFrameworks([
                {
                  id: "IFRS",
                  name: "IFRS",
                  description: "International Financial Reporting Standards (IFRS), including International Accounting Standards (IAS).",
                  standards: [
                    { id: "IAS 1", name: "IAS 1 - Presentation of Financial Statements", description: "Presentation of Financial Statements", available: true },
                    { id: "IAS 2", name: "IAS 2 - Inventories", description: "Inventories", available: true },
                    { id: "IAS 16", name: "IAS 16 - Property, Plant and Equipment", description: "Property, Plant and Equipment", available: true },
                    { id: "IAS 40", name: "IAS 40 - Investment Property", description: "Investment Property", available: true },
                    { id: "IFRS 15", name: "IFRS 15 - Revenue from Contracts with Customers", description: "Revenue from Contracts with Customers", available: true },
                    { id: "IFRS 16", name: "IFRS 16 - Leases", description: "Leases", available: true }
                  ]
                }
              ]);
              addMessage(
                "Great! Now let's select the accounting standards to analyze. Which framework would you like me to check your document against?",
                "system",
              );
            } else {
              setFrameworks(response['frameworks']);

              // Add chat message about framework loading
              addMessage(
                "Great! Now let's select the accounting standards to analyze. Which framework would you like me to check your document against?",
                "system",
              );
            }
          } else {
            setFrameworkError(
              "Failed to load frameworks: Invalid response format",
            );
            addMessage(
              <>
                <XMarkIcon className="inline mr-2 h-4 w-4" />
                There was an issue loading the frameworks. Please refresh the page or contact support if the problem persists.
              </>,
              "system"
            );
          }
        } catch (error: unknown) {
          const errorMessage = `Failed to load frameworks: ${error instanceof Error ? error.message : "Unknown error"}`;
          setFrameworkError(errorMessage);

          addMessage(
            <>
              <XMarkIcon className="inline mr-2 h-4 w-4" />
              Unable to load accounting frameworks. Please check your internet connection and try again, or contact support if the issue continues.
            </>,
            "system",
          );

          toast({
            title: "Framework Loading Error",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsFrameworkLoading(false);
        }
      }
    };

    loadFrameworks();
  }, [chatState.currentStep, frameworks.length, toast]); // eslint-disable-line react-hooks/exhaustive-deps

  // Progress polling for real-time updates during analysis
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;

    const pollProgress = async () => {
      if (!chatState.documentId || !chatState.isProcessing) {
        return;
      }

      try {
        trackApiCall('analysis.getProgress');
        const progressData = await api.analysis.getProgress(
          chatState.documentId,
        );

        // Update chat state with progress information
        setChatState((prev) => ({
          ...prev,
          currentProgress: progressData,
          isProcessing: progressData.status === "PROCESSING",
        }));

        // Add enhanced step-by-step progress messages for smart categorization workflow
        const addSmartWorkflowMessage = (percentage: number) => {
          let stepMessage = "";
          let stepIcon = "";
          let stepTitle = "";
          
          if (percentage <= 15) {
            stepIcon = "🚀";
            stepTitle = "Step 1: Processing Lock & File Discovery";
            stepMessage = "🔍 Initializing smart processing workflow - Creating processing lock and discovering uploaded files";
          } else if (percentage <= 30) {
            stepIcon = "🔍";
            stepTitle = "Step 2: Document Analysis";
            stepMessage = "📄 Advanced document parsing and content extraction - Preparing for intelligent categorization";
          } else if (percentage <= 50) {
            stepIcon = "🧠";
            stepTitle = "Step 3: Smart Categorization";
            stepMessage = "🎯 AI-powered intelligent categorization in progress - Analyzing content structure and financial statement types";
          } else if (percentage <= 65) {
            stepIcon = "💾";
            stepTitle = "Step 4: Metadata Compilation";
            stepMessage = "📊 Saving categorization metadata and structured analysis results";
          } else if (percentage <= 80) {
            stepIcon = "📋";
            stepTitle = "Step 5: Smart Checklist Analysis";
            stepMessage = "✅ Intelligent compliance framework analysis - Processing categorized content against standards";
          } else if (percentage <= 95) {
            stepIcon = "💾";
            stepTitle = "Step 6: Results Compilation";
            stepMessage = "📈 Compiling comprehensive analysis results and compliance findings";
          } else {
            stepIcon = "🔒";
            stepTitle = "Step 7: Completion & Lock Files";
            stepMessage = "🎉 Finalizing smart categorization workflow - Creating completion locks and preparing results";
          }

          // Only add message if we've moved to a new step (to avoid spam)
          const lastMessage = messages[messages.length - 1];
          if (!lastMessage || typeof lastMessage.content !== 'string' || !lastMessage.content.includes(stepTitle)) {
            addMessage(
              `${stepIcon} **${stepTitle}**\n\n${stepMessage}\n\n*Smart categorization: ${percentage.toFixed(1)}% complete*`,
              "system"
            );
          }
        };

        // Add smart workflow messages based on progress
        if (progressData.percentage !== undefined) {
          addSmartWorkflowMessage(progressData.percentage);
        }

        // If analysis is completed, stop polling and load the full results with sections
        if (progressData.status === "COMPLETED") {
          clearInterval(progressInterval!);
          // Give a small delay to ensure results are saved, then load full results
          setTimeout(async () => {
            if (chatState.documentId) {
              try {
                // Load the complete compliance results with sections data
                const analysisResults = await api.analysis.getResults(chatState.documentId);
                
                // Update chat state with the results
                setChatState((prev) => ({ 
                  ...prev, 
                  isProcessing: false,
                  analysisResults: analysisResults
                }));
                
                // Show completion message with results available
                addCompletionMessage(
                  "🎉 **Smart Categorization Analysis Complete!**\n\nYour compliance analysis has been successfully completed using advanced AI categorization technology. You can now review the detailed results, including compliance scores, identified issues, and intelligent categorization insights.",
                  chatState.documentId
                );
                
                // Also update metadata if available
                if (analysisResults.metadata) {
                  setChatState((prev) => ({ 
                    ...prev, 
                    extractedMetadata: analysisResults.metadata
                  }));
                }
                
                addLog(
                  'success',
                  'Analysis',
                  'Compliance analysis completed successfully',
                  { 
                    documentId: chatState.documentId,
                    sectionsCount: analysisResults.sections?.length || 0,
                    status: analysisResults.status
                  }
                );
              } catch (error) {
                // Fallback to metadata polling if results loading fails
                addLog(
                  'warning', 
                  'Analysis',
                  'Failed to load complete results, falling back to metadata polling',
                  { error: error instanceof Error ? error.message : 'Unknown error' }
                );
                pollForMetadata(chatState.documentId);
              }
            }
          }, 2000);
        } else if (progressData.status === "FAILED") {
          clearInterval(progressInterval!);
          setChatState((prev) => ({ ...prev, isProcessing: false }));
          addMessage(
            "⚠ **Smart Categorization Analysis Failed**\n\n● **Error:** Advanced AI processing encountered a critical error\n● **Status:** Unable to complete smart categorization workflow\n● **Troubleshooting:**\n• Check document format and quality\n• Ensure document contains financial statements\n• Try re-uploading the document\n• Contact support if issue persists\n\n*Please try again with a different document or reach out for assistance.*",
            "system",
          );
        }
      } catch (error: unknown) {
        // If progress not found (404), provide fallback progress or check if completed
        if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
          if (chatState.documentId) {
            pollForMetadata(chatState.documentId);
          }
        } else {
          // For other errors, show fallback progress to keep UI alive
          const fallbackProgress = {
            status: "processing",
            percentage: Math.min(
              85,
              ((Date.now() - (chatState.processingStartTime || Date.now())) /
                1000 /
                60) *
                10,
            ), // Rough time-based progress
            currentStandard: "Analyzing compliance requirements...",
            completedStandards: 0,
            totalStandards: 2,
          };

          setChatState((prev) => ({
            ...prev,
            currentProgress: fallbackProgress,
            isProcessing: true,
          }));
        }
        // Don't stop polling on other network errors, just log and continue
      }
    };

    // Start polling when processing begins - reduced frequency to 5 seconds
    if (chatState.isProcessing && chatState.documentId) {
      progressInterval = setInterval(pollProgress, 5000); // Poll every 5 seconds (reduced from 3)
      // Also poll immediately
      pollProgress();
    }

    // Cleanup function
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [chatState.isProcessing, chatState.documentId, chatState.processingStartTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup polling when component unmounts or document changes
  useEffect(() => {
    return () => {
      // Clear metadata polling timer
      if (pollingTimer) {
        clearTimeout(pollingTimer);
        setPollingTimer(null);
      }
    };
  }, [chatState.documentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const addMessage = (
    content: string | React.ReactNode,
    type: "user" | "system" | "loading" | "component",
    metadata?: Record<string, unknown>,
  ) => {
    const newMessage: Message = {
      id: generateUniqueId(),
      type,
      content,
      metadata: metadata || {},
      component: (metadata?.['component'] as "analysis-mode-selection" | "suggestions") || undefined,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id; // Return the ID so we can reference it later
  };

  const updateLastMessage = (content: string, metadata?: Record<string, unknown>) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        const lastMessage = updated[updated.length - 1];
        if (lastMessage) {
          updated[updated.length - 1] = {
            ...lastMessage,
            id: lastMessage.id || generateUniqueId(),
            type: lastMessage.type,
            content,
            metadata: { ...(lastMessage.metadata || {}), ...(metadata || {}) },
          };
        }
      }
      return updated;
    });
  };

  // Session management functions
  const createNewSession = async (fileName: string, documentId?: string) => {
    try {
      // Use document ID as the primary session name if available
      const sessionTitle = documentId || `Analysis - ${fileName}`;
      
      trackApiCall('sessions.create');
      const session = await api.sessions.create({
        title: sessionTitle,
        description: `Financial statement analysis for ${fileName}`,
        ...(documentId && { last_document_id: documentId }), // Only include if documentId exists
      });
      setCurrentSession(session);
      
      // Save initial state to the session
      setTimeout(() => saveCurrentSession(), 500);
      
      toast({
        title: "Session Created",
        description: `Created new session: ${sessionTitle}`,
      });
      
      return session;
    } catch {
      // Error handling simplified for linting compliance
      toast({
        title: "Warning",
        description: "Failed to create session, but analysis will continue.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSessionWithFileName = async (fileName: string, documentId?: string) => {
    if (!currentSession) return;
    
    // Use document ID as primary identifier, fallback to Analysis - fileName format
    const expectedTitle = documentId || `Analysis - ${fileName}`;
    if (currentSession.title !== expectedTitle) {
      try {
        await api.sessions.update(currentSession.session_id, {
          title: expectedTitle,
          description: `Financial statement analysis for ${fileName}`,
          ...(documentId && { last_document_id: documentId }),
        });
        
        // Update the current session object
        setCurrentSession(prev => prev ? {
          ...prev,
          title: expectedTitle,
          description: `Financial statement analysis for ${fileName}`,
          ...(documentId && { last_document_id: documentId }),
        } : null);
        
      } catch {
        // Session title update failed silently
      }
    }
  };

  const saveCurrentSession = async () => {
    if (!currentSession) return;
    
    try {
      await api.sessions.update(currentSession.session_id, {
        chat_state: chatState as unknown as Record<string, unknown>,
        messages: messages as unknown as Record<string, unknown>[],
      });
    } catch {
      // Session save failed silently
    }
  };

  const handleSessionLoad = (sessionId: string) => {
    // Navigate to load the session
    router.push(`/chat?session=${sessionId}`);
  };

  const handleNewSession = () => {
    // Clear current session and start fresh
    setCurrentSession(null);
    const performFullReset = () => {
      setChatState({
        documentId: null,
        fileName: null,
        currentStep: chatSteps[0] || null, // Set to upload step
        documentMetadata: null,
        selectedFramework: null,
        selectedStandards: [],
        aiSuggestedStandards: [],
        specialInstructions: "",
        analysisResults: null,
        isProcessing: false,
        processingMode: "enhanced",
        pendingFile: null,
        keywordExtractionStatus: {
          discoveredKeywords: [],
          currentKeyword: null,
          extractionStep: "Ready",
          isExtracting: false,
        },
        processingStartTime: null,
        estimatedProcessingTime: null,
      });

      // Set fresh welcome message
      setMessages([
        {
          id: generateUniqueId(),
          content: "Welcome to RAi Compliance Engine! I'll help you analyze your financial statements using our advanced smart categorization technology for precise compliance analysis. Let's start by uploading your document for intelligent processing.",
          type: "system",
        },
      ]);
    };
    performFullReset();
  };

  const handleFileUpload = async (file: File, uploadResponse?: unknown): Promise<void> => {
    const response = uploadResponse as Record<string, unknown> | undefined;
    
    // 🔍 DEBUG: Log what we're receiving
    // Debug: handleFileUpload called
    
    try {
      // Track the file upload API call
      trackApiCall('documents.upload');
      addLog(
        'info',
        'Upload',
        `File upload completed: ${file.name}`,
        { 
          fileName: file.name,
          fileSize: file.size,
          uploadResponse: uploadResponse ? 'Received' : 'No response'
        }
      );

      // ✅ CRITICAL FIX: If we have upload response with document_id, use it directly
      if (response && response['document_id']) {
        addLog(
          'success',
          'Upload',
          `Document ID received: ${response['document_id']}`,
          { documentId: response['document_id'] }
        );

        // Add user message about file selection
        addMessage(`File selected: ${file.name}`, "user", {
          fileName: file.name,
        });

        // Store the file for later processing
        const documentId = String(response['document_id'] || '');
        setChatState((prev) => ({
          ...prev,
          fileName: file.name,
          documentId,
          pendingFile: null, // Clear pending since upload is done
        }));

        // Create session if we don't have one
        if (!currentSession) {
          try {
            await createNewSession(file.name, documentId);
          } catch {
            // Session creation failed, continuing without session
            // Don't block upload flow if session creation fails
          }
        } else {
          // Update existing session title to match new file
          try {
            await updateSessionWithFileName(file.name, documentId);
          } catch {
            // Session update failed, continuing
            // Don't block upload flow if session update fails
          }
        }

        // Add success message
        addMessage(
          `Document uploaded successfully! Document ID: ${documentId}. Starting smart categorization and enhanced metadata extraction...`,
          "system",
          { fileId: documentId, fileName: file.name }
        );

        // Move to metadata step
        moveToNextStep("metadata");

        // Track metadata extraction start
        trackApiCall('metadata.extraction.start');
        addLog(
          'info',
          'SmartProcessing',
          `Starting smart categorization and metadata extraction for document: ${documentId}`,
          { documentId }
        );

        // ✅ FIXED: Upload already triggered processing, now just poll for status
        try {
          addLog(
            'info',
            'SmartProcessing',
            `Document uploaded successfully, now polling for metadata extraction progress`,
            { documentId, endpoint: 'status polling' }
          );
          
          // The upload already started processing, just check status
          const analysisResponse = await api.analysis.getStatus(documentId);
          
          addLog(
            'success',
            'SmartProcessing',
            `Smart categorization and analysis triggered successfully - AI processing started`,
            { 
              documentId, 
              hasMetadata: !!analysisResponse.metadata,
              metadataKeys: analysisResponse.metadata ? Object.keys(analysisResponse.metadata) : [],
              metadataExtraction: analysisResponse.metadata_extraction,
              status: analysisResponse.status,
              processingStarted: true
            }
          );
          
          // Check if we got immediate metadata results
          if (analysisResponse.metadata && Object.keys(analysisResponse.metadata).length > 0) {
            addLog('success', 'Metadata', '🎯 Immediate metadata success - processing now', { metadata: analysisResponse.metadata });
            
            // Process the metadata immediately
            const simpleMetadata = {
              company_name: getMetadataValue(analysisResponse.metadata?.['company_name']),
              nature_of_business: getMetadataValue(analysisResponse.metadata?.['nature_of_business']),
              operational_demographics: getMetadataValue(analysisResponse.metadata?.['operational_demographics']),
              financial_statements_type: getMetadataValue(analysisResponse.metadata?.['financial_statements_type']),
            };

            setChatState((prev) => ({
              ...prev,
              documentMetadata: simpleMetadata,
              isProcessing: false,
            }));

            setIsUploading(false);
            moveToNextStep("metadata");
            
            addMessage(
              `**Company Information Extracted Successfully!**\n\n**Company Name:** ${simpleMetadata.company_name}\n\n**Nature of Business:** ${simpleMetadata.nature_of_business}\n\n**Operational Demographics:** ${simpleMetadata.operational_demographics}\n\n**Type of Financial Statements:** ${simpleMetadata.financial_statements_type}\n\nYou can review and edit these details in the side panel before proceeding to framework selection.`,
              "system",
              { documentMetadata: simpleMetadata },
            );
            
            return; // Don't start polling
          } else {
            // AI processing was triggered but not complete yet - start polling
            addLog(
              'info',
              'Metadata',
              `AI metadata extraction in progress - starting polling`,
              { 
                documentId: response['document_id'],
                status: analysisResponse.status,
                note: 'Backend confirmed processing started'
              }
            );
          }
          
        } catch (error) {
          addLog(
            'error',
            'Metadata',
            `Failed to start metadata extraction: ${error instanceof Error ? error.message : 'Unknown error'}`,
            { 
              documentId: response['document_id'], 
              error: error,
              errorName: error instanceof Error ? error.name : 'UnknownError',
              note: 'Will continue with polling - backend may auto-start extraction'
            }
          );
          // Continue anyway - backend might auto-start extraction or user can enter manually
        }

        // ✅ START POLLING after initiating extraction
        pollForMetadata(documentId);
        return;
      }
      
      // Original logic for when no upload response (fallback)
      // Add user message about file selection
      addMessage(`File selected: ${file.name}`, "user", {
        fileName: file.name,
      });

      // Store the file for later processing
      setChatState((prev) => ({
        ...prev,
        fileName: file.name,
        pendingFile: file,
      }));

      // Create session if we don't have one
      if (!currentSession) {
        try {
          await createNewSession(file.name);
        } catch {
          // Session creation failed, continuing without session
          // Don't block upload flow if session creation fails
        }
      } else {
        // Update existing session title to match new file
        try {
          await updateSessionWithFileName(file.name);
        } catch {
          // Session update failed, continuing
          // Don't block upload flow if session update fails
        }
      }

      // Check if we already have a document ID - if so, don't restart the process
      if (chatState.documentId) {
        addMessage("File updated. Checking current extraction status...", "system");
        pollForMetadata(chatState.documentId);
        return;
      }

      // Directly start processing - no mode selection needed
      addMessage("Starting company details extraction...", "system");
      handleAnalysisStart();
    } catch {
      addMessage(
        "Sorry, there was an error selecting your file. Please try again.",
        "system",
      );
    }
  };

  // Unified processing function - no more dual modes
  const handleAnalysisStart = async () => {
    const { pendingFile, isProcessing, documentId } = chatState;

    // PREVENT DUPLICATE UPLOADS
    if (isProcessing) {
      addMessage("Processing is already in progress. Please wait...", "system");
      return;
    }

    // If document is already uploaded, check the current status instead of restarting metadata extraction
    if (documentId) {
      addMessage("Document already uploaded! Checking current status...", "system");
      
      try {
        // Check the actual status of the document
        const statusResponse = await api.analysis.getProgress(documentId);
        
        if (statusResponse.status === "COMPLETED") {
          // Analysis is already complete, fetch full results and go directly to results
          addMessage("Smart categorization analysis already completed! Loading results...", "system");
          
          try {
            // Fetch the full results instead of using progress data
            const fullResults = await api.analysis.getResults(documentId);
            
            setChatState((prev) => ({
              ...prev,
              isProcessing: false,
              analysisResults: fullResults,
            }));
            
            // Generate and add results summary with full results
            const resultsSummary = generateResultsSummary(fullResults);
            addMessage(resultsSummary, "system");
            
            // 🔧 FIX: Ensure consistent documentId for navigation
            const definiteDocumentId = fullResults.document_id || documentId;
            
            // Add completion message with action button
            addCompletionMessage(
              "**Smart Categorization Analysis Complete!**\n\nYour compliance analysis has been successfully completed using advanced AI categorization technology. You can now review the detailed results, including compliance scores, identified issues, and intelligent categorization insights.",
              definiteDocumentId,
              { analysisResults: fullResults }
            );
            moveToNextStep("results");
            return;
          } catch {
            // // Removed console.error for production
// Fallback to progress data
            setChatState((prev) => ({
              ...prev,
              isProcessing: false,
              analysisResults: statusResponse,
            }));
            
            addMessage("Smart categorization analysis completed! Click the button below to view results.", "system");
            
            addCompletionMessage(
              "🎉 **Smart Categorization Analysis Complete!**\n\nYour compliance analysis has been successfully completed using advanced AI categorization technology. You can now review the detailed results, including compliance scores, identified issues, and intelligent categorization insights.",
              documentId
            );
            moveToNextStep("results");
            return;
          }
        } else if (statusResponse.status === "PROCESSING") {
          // Analysis is in progress, start polling for results
          addMessage("Analysis in progress! Checking progress...", "system");
          moveToNextStep("analysis"); // Move to analysis step to show progress
          pollForResults();
          return;
        } else {
          // Check if metadata extraction is complete but analysis not started
          const metadataStatus = await api.analysis.getStatus(documentId);
          if (metadataStatus.metadata && metadataStatus.metadata['company_name']) {
            // Metadata exists, continue with framework selection workflow
            const simpleMetadata = {
              company_name: getMetadataValue(metadataStatus.metadata['company_name']),
              nature_of_business: getMetadataValue(metadataStatus.metadata['nature_of_business']),
              operational_demographics: getMetadataValue(metadataStatus.metadata['operational_demographics']),
              financial_statements_type: getMetadataValue(metadataStatus.metadata['financial_statements_type']),
            };
            
            setChatState((prev) => ({
              ...prev,
              documentMetadata: simpleMetadata,
              isProcessing: false,
            }));
            
            addMessage("Metadata already extracted! Ready for framework selection.", "system");
            moveToNextStep("metadata");
            return;
          } else {
            // Metadata not complete, start polling for metadata
            moveToNextStep("metadata");
            pollForMetadata(documentId);
            return;
          }
        }
      } catch (error) {
        addLog(
          'warning',
          'Status',
          `Error checking document status: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        // Fallback to metadata polling if status check fails
        addMessage("Checking extraction status...", "system");
        moveToNextStep("metadata");
        pollForMetadata(documentId);
        return;
      }
    }

    if (!pendingFile) {
      // Only show this error if there's truly no file and no document ID
      return; // Don't show error message - just return silently
    }

    try {
      setChatState((prev) => ({
        ...prev,
        isProcessing: true,
      }));

      // Unified processing message
      addMessage(
        `Extracting company details from ${pendingFile.name}...`,
        "system",
      );
      addMessage(
        "Processing document with intelligent metadata extraction and geographical detection...",
        "loading",
      );

      // Upload file with enhanced geographical extraction
      trackApiCall('documents.upload');
      const response = await safeApiCall(
          () => api.documents.upload(pendingFile, "enhanced")
        );

        if (response && response['document_id']) {

        // Update chat state
        setChatState((prev) => ({
          ...prev,
          documentId: response['document_id'],
          isProcessing: false,
          pendingFile: null, // Clear pending file
          keywordExtractionStatus: {
            ...prev.keywordExtractionStatus,
            isExtracting: false,
            extractionStep: "Analysis complete",
          },
        }));

        // Update session title with document ID now that we have it
        if (currentSession) {
          try {
            await updateSessionWithFileName(pendingFile.name, response['document_id']);
          } catch {
            // Session update failed, continuing
            // Don't block upload flow if session update fails
          }
        }

        // Update loading message to success
        updateLastMessage(
          `Document uploaded successfully! Document ID: ${response['document_id']}. Starting smart categorization and enhanced metadata extraction...`,
          { fileId: response['document_id'], fileName: pendingFile.name },
        );

        moveToNextStep("metadata");

        // Start polling for metadata extraction results
        try {
          pollForMetadata(response['document_id']);
        } catch (error) {
          addLog(
            'error',
            'Polling',
            `Error calling pollForMetadata: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      } else {
        addLog('error', 'Upload', 'No document_id in response or response is null');
      }
    } catch {
      // Error handling - logging removed for linting
      setChatState((prev) => ({
        ...prev,
        isProcessing: false,
      }));
      addMessage(
        "Sorry, there was an error starting the analysis. Please try again.",
        "system",
      );
    }
  };

  const pollForMetadata = async (documentId: string, currentAttempt: number = 1) => {
    const maxAttempts = 30; // Maximum 30 attempts (60 seconds at 2-second intervals)
    
    // Check if we've exceeded maximum polling attempts
    if (currentAttempt > maxAttempts) {
      addLog(
        'warning',
        'Metadata',
        'Metadata extraction timeout - stopping polling',
        { documentId: documentId, attempts: currentAttempt }
      );
      
      setChatState((prev) => ({ ...prev, isProcessing: false }));
      setIsUploading(false);
      
      addMessage(
        "Smart categorization and metadata extraction is taking longer than expected. You can manually enter the company details in the side panel.",
        "system",
      );
      
      // Clear timer and reset counter
      if (pollingTimer) {
        clearTimeout(pollingTimer);
        setPollingTimer(null);
      }
      return;
    }
    
    // CRITICAL: Clear any existing polling timer FIRST
    if (pollingTimer) {
      clearTimeout(pollingTimer);
      setPollingTimer(null);
    }

    // PREVENT DUPLICATE POLLING: Check if we're already polling this document
    if (chatState.documentId && chatState.documentId !== documentId) {
      addLog(
        'warning',
        'Metadata',
        'Prevented duplicate polling for different document',
        { currentDocId: chatState.documentId, requestedDocId: documentId }
      );
      return;
    }

    // Track the metadata polling API call
    trackApiCall('analysis.getStatus');
    addLog(
      'info',
      'Metadata',
      `Polling for metadata extraction status`,
      { documentId: documentId }
    );

    // Show visual processing on first call
    if (!showProcessingOverlay && processingStep !== 'metadata') {
      setProcessingStep('metadata');
      // setMetadataProcessingStage('extracting'); // Removed unused state setter
      setShowProcessingOverlay(true);
    }

    try {
      // Get direct API call for debugging
      const directStatus = await api.analysis.getStatus(documentId);
      
      // Convert to AnalysisStatusResponse format
      const statusResponse: AnalysisStatusResponse = {
        status: directStatus?.status || 'unknown',
        metadata_extraction: directStatus?.metadata_extraction || 'unknown',
        ...(directStatus?.metadata && { metadata: directStatus.metadata }),
      };
      
      addLog(
        'info',
        'API',
        'Received metadata status response',
        { 
          documentId: documentId,
          hasMetadata: !!statusResponse.metadata,
          status: statusResponse.status || 'unknown',
          progress: statusResponse.progress || 0,
          metadata_extraction: statusResponse.metadata_extraction || 'unknown',
          metadataKeys: statusResponse.metadata ? Object.keys(statusResponse.metadata) : [],
          companyName: statusResponse.metadata?.company_name || 'not found',
          fullMetadata: statusResponse.metadata,
          attemptNumber: currentAttempt
        }
      );
      
      // ✅ CRITICAL FIX: Check both status fields and progress for completion
      const isMetadataComplete = (
        statusResponse.metadata_extraction === "COMPLETED" ||
        statusResponse.status === "COMPLETED" ||
        (statusResponse.progress && statusResponse.progress >= 100)
      );
      
      const hasValidMetadata = statusResponse.metadata && (
        statusResponse.metadata.company_name || 
        statusResponse.metadata.nature_of_business || 
        statusResponse.metadata.operational_demographics ||
        statusResponse.metadata.financial_statements_type
      );
      
      // Also check if we have valid metadata even if status isn't "COMPLETED" yet
      if (hasValidMetadata) {
        addLog('success', 'Metadata', '🎯 Found valid metadata during polling', { metadata: statusResponse.metadata });
        addLog(
          'success',
          'Metadata',
          'Valid metadata found during polling',
          { 
            documentId: documentId,
            progress: statusResponse.progress,
            status: statusResponse.status,
            attempts: currentAttempt,
            metadataKeys: statusResponse.metadata ? Object.keys(statusResponse.metadata) : []
          }
        );
      }
      
      // Detect if backend is stuck - metadata exists but is empty for too long
      const metadataKeys = statusResponse.metadata ? Object.keys(statusResponse.metadata) : [];
      const isBackendStuck = (
        currentAttempt >= 15 && // After 30 seconds (15 attempts * 2 seconds)
        (
          (statusResponse.metadata && metadataKeys.length === 0) || // Empty metadata object
          (!statusResponse.metadata && statusResponse.status === "PROCESSING") || // No metadata but still processing
          (statusResponse.metadata_extraction === "PROCESSING" && metadataKeys.length === 0) // Processing but no keys
        )
      );
      
      // Stop polling if metadata extraction is complete OR if we have valid metadata OR if backend is stuck
      if (isMetadataComplete || hasValidMetadata || isBackendStuck) {
        const stopReason = isBackendStuck ? 'Backend appears stuck with empty metadata' : 
                          isMetadataComplete ? 'Metadata extraction completed (backend signal)' : 
                          'Valid metadata found in response';
        
        addLog(
          isBackendStuck ? 'warning' : 'success',
          'Metadata',
          stopReason,
          { 
            documentId: documentId,
            companyName: getMetadataValue(statusResponse.metadata?.company_name),
            attempts: currentAttempt,
            metadataExtractionStatus: statusResponse.metadata_extraction,
            hasValidData: hasValidMetadata,
            backendStuck: isBackendStuck,
            metadataKeysCount: metadataKeys.length
          }
        );

        // Clear any existing timer
        if (pollingTimer) {
          clearTimeout(pollingTimer);
          setPollingTimer(null);
        }

        // Use the helper to extract values from the new object structure (with safe access)
        const simpleMetadata = {
          company_name: getMetadataValue(statusResponse.metadata?.company_name),
          nature_of_business: getMetadataValue(
            statusResponse.metadata?.nature_of_business,
          ),
          operational_demographics: getMetadataValue(
            statusResponse.metadata?.operational_demographics,
          ),
          financial_statements_type: getMetadataValue(
            statusResponse.metadata?.financial_statements_type,
          ),
        };

        setChatState((prev) => ({
          ...prev,
          documentMetadata: simpleMetadata,
          isProcessing: false,
        }));

        // Update visual processing state
        // setMetadataProcessingStage('validating'); // Removed unused state setter
        setTimeout(() => {
          // setMetadataProcessingStage('completed'); // Removed unused state setter
          setTimeout(() => {
            setShowProcessingOverlay(false);
            setProcessingStep(null);
          }, 1500);
        }, 1000);

        // Stop upload spinner
        setIsUploading(false);
        setUploadProgress(100);

        // ✅ FIXED: Add detailed metadata message to chat (handle stuck backend case)
        const companyName = simpleMetadata.company_name;
        const businessNature = simpleMetadata.nature_of_business;
        const demographics = simpleMetadata.operational_demographics;
        const financialStatementsType = simpleMetadata.financial_statements_type;

        // Show different message if backend was stuck
        const metadataMessage = isBackendStuck 
          ? `**Metadata Extraction Timeout**

The automatic extraction took longer than expected. Please manually enter the company information in the side panel.

**Current Values:**
- **Company Name:** ${companyName}
- **Nature of Business:** ${businessNature}
- **Operational Demographics:** ${demographics}
- **Type of Financial Statements:** ${financialStatementsType}

You can edit these details in the side panel before proceeding to framework selection.`
          : `**Company Information Extracted Successfully!**

**Company Name:** ${companyName}

**Nature of Business:** ${businessNature}

**Operational Demographics:** ${demographics}

**Type of Financial Statements:** ${financialStatementsType}

You can review and edit these details in the side panel before proceeding to framework selection.`;

        addMessage(
          metadataMessage,
          "system",
          { documentMetadata: simpleMetadata },
        );

        // Check if framework is already selected (framework property exists)
        if (statusResponse.framework && statusResponse.framework !== "") {
          // Strict validation - require standards to be present with framework
          if (!statusResponse.standards || statusResponse.standards.length === 0) {
            throw new Error(`Framework ${statusResponse.framework} selected but no standards found. Analysis cannot proceed without user-selected standards.`);
          }

          // Framework was automatically selected, proceed to analysis
          setChatState((prev) => ({
            ...prev,
            selectedFramework: statusResponse.framework || null,
            selectedStandards: statusResponse.standards || [],
          }));

          addMessage(
            `Framework automatically selected: ${statusResponse.framework.toUpperCase()}. Starting intelligent categorization analysis...`,
            "system",
          );

          // Move directly to analysis step
          moveToNextStep("analysis");

          // Start the compliance analysis
          startComplianceAnalysis(
            documentId,
            statusResponse.framework,
            statusResponse.standards,
          );

          // IMPORTANT: Return here to stop further polling
          return;
        } else {
          // Move to metadata step for manual framework selection
          moveToNextStep("metadata");
          // Return here too to stop polling
          return;
        }
      } else {
        // Continue polling - metadata extraction not complete yet
        addLog(
          'info',
          'Metadata',
          `Metadata extraction not complete yet, continuing polling (attempt ${currentAttempt}/${maxAttempts})`,
          { 
            documentId: documentId, 
            retryIn: '2 seconds', 
            attempt: currentAttempt,
            metadata_extraction: statusResponse.metadata_extraction,
            metadataKeysFound: metadataKeys.length
          }
        );
        
        const timer = setTimeout(() => {
          pollForMetadata(documentId, currentAttempt + 1);
        }, 2000);
        setPollingTimer(timer);
      }
    } catch (error) {
      addLog('error', 'Metadata', 'Metadata polling error', { error: error instanceof Error ? error.message : String(error) });
      
      // Enhanced error logging
      addLog(
        'error',
        'Metadata',
        'Metadata extraction polling failed',
        { 
          documentId: documentId,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: error instanceof Error ? error.name : 'UnknownError',
          attempt: currentAttempt
        }
      );
      
      // Clear timer on error and reset counter
      if (pollingTimer) {
        clearTimeout(pollingTimer);
        setPollingTimer(null);
      }
      setChatState((prev) => ({ ...prev, isProcessing: false }));

      // Stop upload spinner
      setIsUploading(false);

      addMessage(
        "There was an issue extracting metadata. You can manually enter the company details in the side panel.",
        "system",
      );
      // Move to metadata step anyway so user can input manually
      moveToNextStep("metadata");
    }
  };

  // pollForKeywords function removed as unused

  const moveToNextStep = (stepId: string) => {
    const currentStepIndex = chatSteps.findIndex((step) => step.id === stepId);
    if (currentStepIndex !== -1) {
      const updatedSteps = chatSteps.map((step, index) => ({
        ...step,
        completed: index < currentStepIndex,
        active: index === currentStepIndex,
      }));

      setChatState((prev) => {
        return {
          ...prev,
          currentStep: updatedSteps[currentStepIndex] || null,
        };
      });

      // Add transition messages for specific steps
      if (stepId === "framework-selection") {
        // Reset framework state when entering framework selection
        setFrameworkStep("framework");
        setSelectedFramework("");
        setSelectedStandards([]);
        setFrameworkError(null);
      } else if (stepId === "upload") {
        addMessage(
          "Please upload your financial statement document to begin analysis.",
          "system",
        );
      }
    }
  };

  const moveToPreviousStep = (stepId: string) => {
    const steps = [
      "upload",
      "metadata",
      "framework-selection",
      "analysis",
      "results",
    ];
    const currentIndex = steps.findIndex((step) => step === stepId);

    if (currentIndex > 0) {
      const previousStepId = steps[currentIndex - 1];
      if (previousStepId) {
        moveToNextStep(previousStepId);

        // Add back navigation message
        addMessage(
          `Moved back to ${previousStepId.replace("-", " ")} step. You can review and modify your selections.`,
          "system",
        );
      }
    }
  };

  const handleFrameworkSelection = async (
    framework: string,
    standards: string[],
  ) => {
    try {
      addLog('info', 'Framework', '🔍 Framework selection started', { framework, standards });
      
      if (!chatState.documentId) {
        toast({
          title: "Error",
          description: "No document uploaded",
          variant: "destructive",
        });
        return;
      }

      addLog(
        'info',
        'Framework',
        `Selecting framework ${framework} and standards`,
        { 
          framework, 
          standards: Array.isArray(standards) ? standards.join(", ") : "none",
          documentId: chatState.documentId
        }
      );

      // ✅ FIXED: Just save the framework selection, don't start analysis yet
      setChatState((prev) => ({
        ...prev,
        selectedFramework: framework,
        selectedStandards: standards,
        isProcessing: false,
      }));

      // Add success message
      addMessage(
        `Perfect! I'll perform intelligent categorization analysis of your document against ${framework} with ${Array.isArray(standards) ? standards.length : 0} selected standards: ${Array.isArray(standards) ? standards.join(", ") : "none"}. This will check approximately ${Array.isArray(standards) ? standards.length * 50 : 0}+ compliance requirements using advanced smart categorization.`,
        "system",
      );

      // Start smart mode analysis directly
      addMessage(
        "Perfect! Starting intelligent categorization analysis with your selected framework and standards.",
        "system",
      );

      // Start analysis directly with smart mode
      await handleAnalysisStart();
    } catch (error: unknown) {
      addLog('error', 'Framework', 'Framework selection error', { error: error instanceof Error ? error.message : String(error) });
      setChatState((prev) => ({ ...prev, isProcessing: false }));

      // Extract error message
      let errorMessage = "Failed to select framework";
      let isDocumentNotFound = false;

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string; message?: string } } };
        if (axiosError.response?.data) {
          errorMessage += `: ${axiosError.response.data.detail || axiosError.response.data.message || "Unknown error"}`;
        }
      } else if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
        // Check if it's a document not found error
        isDocumentNotFound = error.message
          .toLowerCase()
          .includes("document not found");
      }

      if (isDocumentNotFound) {
        // Special handling for document not found - likely session expired
        addMessage(
          "It looks like your document session has expired or the server was restarted. Please upload your document again to continue.",
          "system",
        );

        // Reset to upload step
        moveToNextStep("upload");
        setChatState((prev) => ({
          ...prev,
          documentId: null,
          documentMetadata: null,
          fileName: null,
        }));

        toast({
          title: "Session Expired",
          description: "Please upload your document again to continue",
          variant: "destructive",
        });
      } else {
        addMessage(
          `Sorry, there was an error selecting the framework: ${errorMessage}. Please try again.`,
          "system",
        );

        toast({
          title: "Framework Selection Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  // pollForAnalysis function removed as unused

  // Framework selection handlers
  const handleFrameworkSelect = async (frameworkId: string) => {
    const framework = frameworks.find((f) => f.id === frameworkId);
    setSelectedFramework(frameworkId);
    setSelectedStandards([]); // Reset standards when framework changes
    setFrameworkError(null);

    // ✅ IMMEDIATELY move to standards step when framework is selected
    setFrameworkStep("standards");

    // Add chat message about framework selection
    if (framework) {
      const availableStandardsCount = framework.standards?.filter((s) => s.available).length || 0;
      addMessage(
        `Excellent choice! You've selected ${framework.name}. Let me analyze your company profile to suggest the most relevant standards...`,
        "system",
      );

      // 🤖 TRIGGER AI SUGGESTIONS IMMEDIATELY WHEN FRAMEWORK IS SELECTED
      if (chatState.documentMetadata) {
        // Add loading message with spinner and more detailed status
        const loadingMessageId = addMessage(
          <>
            <div className="flex items-center mb-3">
              <RobotIcon className="mr-2 h-4 w-4" />
              <span className="font-semibold">AI Analysis in Progress...</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <ChartIcon className="mr-2 h-4 w-4" />
                <span>Analyzing your company profile</span>
              </div>
              <div className="flex items-center">
                <SearchIcon className="mr-2 h-4 w-4" />
                <span>Evaluating business requirements</span>
              </div>
              <div className="flex items-center">
                <LightningIcon className="mr-2 h-4 w-4" />
                <span>Generating personalized accounting standards recommendations</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">This may take a few seconds...</p>
          </>,
          "loading",
        );

        try {
          addLog('info', 'AI', '🔍 Calling AI suggestions API', {
            framework: frameworkId,
            metadata: chatState.documentMetadata
          });

          const suggestedStandards = await api.analysis.suggestAccountingStandards({
            framework: frameworkId,
            company_name: chatState.documentMetadata.company_name || '',
            nature_of_business: chatState.documentMetadata.nature_of_business || '',
            operational_demographics: chatState.documentMetadata.operational_demographics || '',
            financial_statements_type: chatState.documentMetadata.financial_statements_type || 'General',
          });

          // Remove loading message before adding results
          setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));

          addLog('success', 'AI', 'AI Suggestions Response received', { suggestedStandards });

          if (suggestedStandards?.['suggested_standards'] && Array.isArray(suggestedStandards['suggested_standards']) && suggestedStandards['suggested_standards'].length > 0) {
            // Helper function to process bold formatting in text
            const processBoldText = (text: string): string => {
              if (!text) return '';
              return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            };

            // Create HTML table for standards display
            const tableRows = suggestedStandards['suggested_standards'].map((s: SuggestedStandard) => 
              `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${s.standard_id}</td><td style="padding: 8px; border: 1px solid #ddd;">${s.standard_title || s.standard_id}</td><td style="padding: 8px; border: 1px solid #ddd;">${processBoldText(s.reasoning || 'Recommended')}</td></tr>`
            ).join('');
            
            const standardsTable = `<table style="width: 100%; border-collapse: collapse; margin: 10px 0;"><thead><tr style="background-color: #f5f5f5;"><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">STD NO</th><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">STD TITLE</th><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">REASON</th></tr></thead><tbody>${tableRows}</tbody></table>`;
            
            addMessage(
              <>
                <div className="flex items-center mb-3">
                  <LightningIcon className="mr-2 h-4 w-4" />
                  <span className="font-bold">AI Recommendations for {framework.name}:</span>
                </div>
                <div className="mb-4">
                  <p>Based on your company profile ({chatState.documentMetadata.company_name || 'N/A'} - {chatState.documentMetadata.operational_demographics || 'N/A'}), I recommend these accounting standards:</p>
                </div>
                <div className="my-4" dangerouslySetInnerHTML={{ __html: standardsTable }} />
                <div className="mt-4">
                  <p>These recommendations consider your business nature, geographical location, and statement types. The checklist is now ready with these pre-selected standards.</p>
                </div>
              </>,
              "system",
            );

            // Pre-select the suggested standards in the checklist - with additional safety check
            const suggestedStandardIds = Array.isArray(suggestedStandards['suggested_standards'])
              ? suggestedStandards['suggested_standards'].map((s: SuggestedStandard) => s.standard_id)
              : [];
            
            // Store both AI suggestions and set them as selected
            setChatState((prev) => ({
              ...prev,
              aiSuggestedStandards: suggestedStandardIds,
            }));
            setSelectedStandards(suggestedStandardIds);
            
            addMessage(
              `Perfect! I've pre-selected ${suggestedStandardIds.length} recommended standards from ${availableStandardsCount} available standards. You can review, modify, or add more standards from the checklist on the right.`,
              "system",
            );
          } else {
            // Handle case where no suggestions were returned (could be fallback response)
            const fallbackMessage = suggestedStandards?.['business_context'] || 
              "No specific accounting standards recommendations available for your profile at this time. Please manually select relevant standards from the checklist.";
            
            addMessage(
              `ℹ️ ${fallbackMessage}`,
              "system",
            );
            // Standards step already set at the beginning of framework selection
          }
        } catch (suggestionError: unknown) {
          addLog('error', 'AI', 'Standards suggestion error', { 
            error: suggestionError instanceof Error ? suggestionError.message : String(suggestionError)
          });
          
          // Remove loading message before showing error
          setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));
          
          // More specific error message based on the framework
          const frameworkName = framework?.name || frameworkId;
          addMessage(
            `🛑 AI suggestions temporarily unavailable. Please manually select relevant ${frameworkName} standards based on your company profile.`,
            "system",
          );
          // Still move to standards step even if AI fails
          setFrameworkStep("standards");
        }
      } else {
        // No metadata available, just move to standards step
        addMessage(
          `Now please choose from ${availableStandardsCount} available standards to analyze your document against.`,
          "system",
        );
        setFrameworkStep("standards");
      }
    }
  };

  const handleStandardToggle = (standardId: string) => {
    const newSelectedStandards = toggleStandardSelection(
      standardId,
      selectedStandards,
    );
    setSelectedStandards(newSelectedStandards);

    // Add guidance based on selection count
    if (newSelectedStandards.length === 1) {
      addMessage(
        "Great start! You can select additional standards or proceed with your current selection. Each standard will perform comprehensive compliance checks.",
        "system",
      );
    } else if (newSelectedStandards.length >= 5) {
      addMessage(
        `You've selected ${newSelectedStandards.length} standards. This smart categorization analysis will check ${newSelectedStandards.length * 50}+ compliance requirements and may take 10-15 minutes to complete.`,
        "system",
      );
    }
  };

  const handleSelectAllStandards = () => {
    const { availableStandards } = updateAvailableStandards(
      selectedFramework,
      frameworks,
    );
    setSelectedStandards(selectAllStandards(availableStandards));

    addMessage(
      `All ${availableStandards.length} standards selected! This will perform a complete smart categorization analysis covering ${availableStandards.length * 50}+ requirements. This comprehensive intelligent analysis will take approximately 15-20 minutes.`,
      "system",
    );
  };

  const handleClearAllStandards = () => {
    setSelectedStandards(clearAllStandards());

    addMessage(
      "Standards cleared. Please select at least one standard to proceed with the compliance analysis.",
      "system",
    );
  };

  const handleFrameworkContinue = async () => {
    // This function is now only used for the standards step (Start Analysis)
    if (frameworkStep === "standards") {
      // Validate framework submission
      const validationError = validateFrameworkSubmission(
        frameworkStep,
        selectedFramework,
        selectedStandards,
        frameworks,
      );

      if (validationError) {
        setFrameworkError(validationError);
        addMessage(
          `❌ ${validationError}. Please make your selection and try again.`,
          "system",
        );
        return;
      }

      try {
        setIsFrameworkSubmitting(true);
        setFrameworkError(null);

        // Log framework selection for debugging
        logFrameworkSelection();

        // Save the framework selection
        setChatState((prev) => ({
          ...prev,
          selectedFramework: selectedFramework,
          selectedStandards: selectedStandards,
          isProcessing: false,
        }));

        // Add success message
        addMessage(
          `**Framework Configuration Complete!**\n\n● **Selected Framework:** ${selectedFramework}\n● **Active Standards:** ${Array.isArray(selectedStandards) ? selectedStandards.length : 0} standards selected\n● **Compliance Scope:** ${Array.isArray(selectedStandards) ? selectedStandards.join(", ") : "none"}\n● **Analysis Scope:** Approximately ${Array.isArray(selectedStandards) ? selectedStandards.length * 50 : 0}+ compliance requirements\n\n**Ready to proceed with intelligent categorization analysis!**`,
          "system",
        );

        // Start smart mode analysis directly
        addMessage(
          "Perfect! Starting intelligent categorization analysis with your selected framework and standards.",
          "system",
        );

        // Move to analysis step and start compliance analysis directly
        moveToNextStep("analysis");
        await startComplianceAnalysis(chatState.documentId!, selectedFramework, selectedStandards);

        // Reset framework form state on success
        setFrameworkStep("framework");
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Could not submit framework selection";
        addLog(
          'error',
          'Framework',
          `Framework submission error: ${errorMessage}`
        );
        setFrameworkError(
          `⚠️ **Framework Selection Failed**\n\n🚨 **Error:** ${errorMessage}\n📋 **Issue:** Backend could not process your framework choice\n🔄 **Solution:** Please try selecting the framework again\n\n*Framework configuration could not be saved to the system.*`,
        );
      } finally {
        setIsFrameworkSubmitting(false);
      }
    }
  };

  // startEnhancedProcessing function removed as unused

  const handleFrameworkBack = () => {
    if (frameworkStep === "standards") {
      // Go back to framework selection within the same step
      setFrameworkStep("framework");
      setFrameworkError(null);
      addMessage(
        "Going back to framework selection. You can choose a different framework if needed.",
        "system",
      );
    } else {
      // Go back to the previous step (metadata)
      moveToPreviousStep("framework-selection");
    }
  };

  const handleCustomInstructionsChange = (instructions: string) => {
    setChatState((prev) => ({
      ...prev,
      customInstructions: instructions,
    }));
  };

  const handleEditFrameworkSelection = () => {
    // Allow editing of completed framework selection
    moveToNextStep("framework-selection");

    // Restore previous selections to framework state
    if (chatState.selectedFramework) {
      setSelectedFramework(chatState.selectedFramework);
      setFrameworkStep("standards");
    }
    if (chatState.selectedStandards.length > 0) {
      setSelectedStandards(chatState.selectedStandards);
    }

    addMessage(
      "You can now modify your framework and standards selection. Your previous choices have been restored for editing.",
      "system",
    );
  };

  // handleSuggestionClick function removed as currentUserMessage setter is unused
  const handleSuggestionClick = (suggestion: string) => {
    // No-op: suggestion functionality disabled
    addLog('info', 'Suggestion', `Suggestion clicked: ${suggestion}`);
  };

  // Handle navigation to results page
  const handleGoToResults = (documentId: string) => {
    // Validate document ID
    if (!documentId || typeof documentId !== 'string' || documentId.trim() === '') {
      toast({
        title: "Navigation Error",
        description: "Invalid document ID. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const targetUrl = `/results/${documentId.trim()}`;
      router.push(targetUrl);
      
      toast({
        title: "Loading Results",
        description: "Redirecting to detailed compliance report...",
      });
    } catch {
      toast({
        title: "Navigation Failed", 
        description: "Could not navigate to results page. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startComplianceAnalysis = async (
    documentId?: string,
    framework?: string,
    standards?: string[],
  ) => {
    try {
      const docId = documentId || chatState.documentId;
      const selectedFramework = framework || chatState.selectedFramework;
      const selectedStandards = standards || chatState.selectedStandards;

      if (
        !docId ||
        !selectedFramework ||
        !selectedStandards ||
        selectedStandards.length === 0
      ) {
        throw new Error("Missing required analysis parameters");
      }

      setChatState((prev) => ({
        ...prev,
        isProcessing: true,
        // Update state with provided parameters if they exist
        ...(documentId && { documentId }),
        ...(framework && { selectedFramework: framework }),
        ...(standards && { selectedStandards: standards }),
      }));

      addMessage(
        `Starting compliance analysis with ${selectedFramework.toUpperCase()} framework using enhanced geographical processing...`,
        "loading",
      );

      // Enhanced processing message
      const enhancedMessage = `🌍 Using Enhanced Geographical Processing: Comprehensive detection with countries/regions library and 2D certainty scoring`;
      addMessage(enhancedMessage, "system");

      addMessage(
        `🔍 Analyzing ${selectedStandards.length} standards with ${selectedStandards.length * 50}+ compliance requirements using smart categorization.`,
        "system",
      );

      // Submit the final analysis request with all parameters

      const requestData = {
        framework: selectedFramework,
        standards: selectedStandards,
        specialInstructions: chatState.customInstructions || specialInstructions || "",  // Use custom instructions first, fallback to specialInstructions
        extensiveSearch: false, // Can add this as a toggle in the future
        processingMode: chatState.processingMode || "enhanced",
      };

      await api.analysis.selectFramework(docId, requestData);

      // addMessage(
      //   `Analysis started! I'm now checking ${selectedStandards.length} standards with ${selectedStandards.length * 50}+ compliance requirements. This may take 10-15 minutes.`,
      //   'system'
      // )

      // Start polling for results
      pollForResults();
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { detail?: string; message?: string } }; message?: string };
      addLog(
        'error',
        'Analysis',
        `Failed to start analysis: ${errorObj.message || 'Unknown error'}`
      );
      setChatState((prev) => ({ ...prev, isProcessing: false }));

      let errorMessage = "Failed to start compliance analysis";
      if (errorObj.response && errorObj.response.data) {
        errorMessage += `: ${errorObj.response.data.detail || errorObj.response.data.message || "Unknown error"}`;
      } else if (errorObj.message) {
        errorMessage += `: ${errorObj.message}`;
      }

      const detailedErrorMessage = `❌ **Smart Categorization Analysis Failed to Start**\n\n🚨 **Error Details:** ${errorMessage}\n📋 **Backend Status:** Smart categorization service encountered processing error\n🔧 **Troubleshooting:**\n• Document may not be fully processed by smart categorization workflow\n• Framework selection might be invalid\n• AI categorization services may be temporarily unavailable\n🔄 **Next Steps:** Please try again or contact support\n\n*Smart categorization analysis initialization could not be completed successfully.*`;

      addMessage(detailedErrorMessage, "system");

      toast({
        title: "Smart Categorization Analysis Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const pollForResults = () => {
    if (!chatState.documentId) {
      addLog('error', 'Polling', 'No document ID available for polling');
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const progressData = await api.analysis.getProgress(
          chatState.documentId!,
        );
        
        setChatState((prev) => ({
          ...prev,
          isProcessing: progressData.status === "PROCESSING",
        }));

        // Handle different status states
        if (progressData.status === "PROCESSING") {
          // Show visual analysis progress instead of text messages
          if (progressData.progress) {
            const {
              current_standard,
              completed_standards,
              total_standards,
              progress_percent,
            } = progressData.progress;

            // Show analysis progress component
            if (progress_percent && progress_percent > 0) {
              setShowAnalysisProgress(true);
              
              // Update chat state with progress information
              setChatState((prev) => ({
                ...prev,
                currentProgress: {
                  percentage: progress_percent,
                  currentStandard: current_standard,
                  completedStandards: completed_standards,
                  totalStandards: total_standards,
                },
              }));
            }
          } else {
            // Show generic analysis in progress
            setShowAnalysisProgress(true);
            setProcessingStep('analysis');
          }
        } else if (progressData.status === "COMPLETED") {
          // Analysis completed successfully
          clearInterval(pollInterval);

          // Hide visual progress components
          setShowAnalysisProgress(false);
          setShowProcessingOverlay(false);
          setProcessingStep(null);

          // Fetch the full results data instead of using progress data
          try {
            const fullResults = await api.analysis.getResults(chatState.documentId!);
            
            setChatState((prev) => ({
              ...prev,
              isProcessing: false,
              analysisResults: fullResults,
            }));

            // Generate and add results summary using full results
            const resultsSummary = generateResultsSummary(fullResults);
            addMessage(resultsSummary, "system");

            // 🔧 FIX: Use definitive documentId from fullResults - this ensures consistency between stored results and navigation
            const definiteDocumentId = fullResults.document_id || chatState.documentId;
            
            // Add completion message with action button
            addCompletionMessage(
              `✅ **Smart Categorization Analysis Complete!**

• **Analysis Summary:**
• **Standards Processed:** ${fullResults.sections?.length || 'Multiple'} compliance sections
• **Items Evaluated:** ${Array.isArray(fullResults.sections) ? fullResults.sections.reduce((total, section) => total + (Array.isArray(section.items) ? section.items.length : 0), 0) : 'All'} compliance requirements
• **Processing Time:** Smart categorization workflow completed

• **Results Available:**
• Detailed compliance checklist
• Evidence documentation
• AI-generated recommendations
• Risk assessments and findings

**Click below to review your professional compliance report.**`,
              definiteDocumentId, // Use the same documentId as the stored results
              { analysisResults: fullResults } // Pass the results for validation
            );

            // Move to results step
            moveToNextStep("results");

            // TODO: Update session when backend sessions API is implemented
            // if (currentSession?.session_id && chatState.documentId) {
            //   try {
            //     await api.sessions.update(currentSession.session_id, {
            //       messages: [...messages, completionMessage].map(msg => ({
            //         id: msg.id,
            //         type: msg.type,
            //         content: msg.content,
            //         timestamp: msg.timestamp.toISOString(),
            //         documentId: msg.documentId
            //       }))
            //     });
            //   } catch (error) {
            //     addLog('warning', 'Session', `Failed to update session: ${error instanceof Error ? error.message : 'Unknown error'}`);
            //   }
            // }
          } catch (error) {
            addLog(
              'warning',
              'Results',
              `Error fetching full results: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            // Fallback to progress data if results fetch fails
            setChatState((prev) => ({
              ...prev,
              isProcessing: false,
              analysisResults: progressData,
            }));

            addMessage(
              "✅ Smart categorization analysis completed! Click the button below to view detailed results.",
              "system"
            );

            addCompletionMessage(
              "🎉 **Smart Categorization Analysis Complete!**\n\nYour compliance analysis has been successfully completed using advanced AI categorization technology. You can now review the detailed results, including compliance scores, identified issues, and intelligent categorization insights.",
              progressData.document_id || chatState.documentId
            );
            moveToNextStep("results");

            // TODO: Update session when backend sessions API is implemented
            // if (currentSession?.session_id && chatState.documentId) {
            //   try {
            //     await api.sessions.update(currentSession.session_id, {
            //       messages: [...messages, completionMessage].map(msg => ({
            //         id: msg.id,
            //         type: msg.type,
            //         content: msg.content,
            //         timestamp: msg.timestamp.toISOString(),
            //         documentId: msg.documentId
            //       }))
            //     });
            //   } catch (error) {
            //     addLog('warning', 'Session', `Failed to update session: ${error instanceof Error ? error.message : 'Unknown error'}`);
            //   }
            // }
          }
        } else if (progressData.status === "FAILED") {
          // Analysis failed
          clearInterval(pollInterval);
          setChatState((prev) => ({ ...prev, isProcessing: false }));

          const errorMessage = progressData.error || progressData.message || "Analysis failed";
          addMessage(`❌ Analysis failed: ${errorMessage}`, "system");

          toast({
            title: "Analysis Failed",
            description: errorMessage,
            variant: "destructive",
          });

          // TODO: Update session when backend sessions API is implemented
          // if (currentSession?.session_id) {
          //   try {
          //     await api.sessions.update(currentSession.session_id, {
          //       messages: messages.map(msg => ({
          //         id: msg.id,
          //         type: msg.type,
          //         content: msg.content,
          //         timestamp: msg.timestamp.toISOString(),
          //         documentId: msg.documentId
          //       }))
          //     });
          //   } catch (error) {
          //     addLog('warning', 'Session', `Failed to update session: ${error instanceof Error ? error.message : 'Unknown error'}`);
          //   }
          // }
        } else if (progressData.status === "COMPLETED_WITH_ERRORS") {
          // Analysis completed with some errors
          clearInterval(pollInterval);

          // Fetch the full results data for errors case too
          try {
            const fullResults = await api.analysis.getResults(chatState.documentId!);
            
            setChatState((prev) => ({
              ...prev,
              isProcessing: false,
              analysisResults: fullResults,
            }));

            addMessage(
              "⚠️ **Analysis Completed with Warnings**\n\n• **Processing Status:** Backend analysis finished with some non-critical issues\n• **Results Available:** Partial compliance data has been generated\n• **Recommendation:** Review available results and re-run analysis if needed\n\n*Most compliance data should still be accessible for review.*",
              "system",
            );

            const resultsSummary = generateResultsSummary(fullResults);
            addMessage(resultsSummary, "system");

            // Move to results step
            moveToNextStep("results");
          } catch (error) {
            addLog(
              'warning',
              'Results',
              `Error fetching results for completed with errors: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            // Fallback
            setChatState((prev) => ({
              ...prev,
              isProcessing: false,
              analysisResults: progressData,
            }));

            addMessage(
              "⚠️ **Analysis Completed with Issues**\n\n🚨 **Status:** Backend processing encountered some difficulties\n📋 **Available Data:** Partial results may be viewable\n🔄 **Next Steps:** Click below to review available information\n\n*Consider re-uploading the document if results appear incomplete.*",
              "system",
            );

            addCompletionMessage(
              "Analysis completed with some issues. Review available results for more details.",
              progressData.document_id || chatState.documentId
            );
            moveToNextStep("results");
          }
        } else if (progressData.status === "FRAMEWORK_SELECTED") {
          // Framework selected, need to start compliance analysis
          
          clearInterval(pollInterval);

          try {
            // Start compliance analysis with enhanced geographical processing
            const analysisResponse = await api.analysis.startCompliance(
              chatState.documentId!,
              {
                mode: "enhanced",
              },
            );

            if (analysisResponse.success) {
              addMessage(
                "✅ Framework selected successfully! Starting enhanced compliance analysis...",
                "system",
              );

              // Start polling again for the actual analysis
              setChatState((prev) => ({ ...prev, isProcessing: true }));
              setTimeout(() => pollForResults(), 1000);
            } else {
              throw new Error(
                analysisResponse.message ||
                  "Failed to start compliance analysis",
              );
            }
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            addLog(
              'error',
              'Analysis',
              `Failed to start compliance analysis: ${errorMessage}`
            );
            setChatState((prev) => ({ ...prev, isProcessing: false }));
            addMessage(
              `❌ Failed to start compliance analysis: ${errorMessage}`,
              "system",
            );

            toast({
              title: "Analysis Start Failed",
              description: errorMessage,
              variant: "destructive",
            });
          }
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addLog(
          'error',
          'Polling',
          `Error polling for results: ${errorMessage}`
        );

        // Stop polling on repeated errors
        clearInterval(pollInterval);
        setChatState((prev) => ({ ...prev, isProcessing: false }));

        addMessage(
          "❌ Error checking analysis progress. Please refresh and try again.",
          "system",
        );

        toast({
          title: "Polling Error",
          description: "Failed to check analysis progress",
          variant: "destructive",
        });
      }
    }, 3000); // Poll every 3 seconds

    // Clean up polling if component unmounts
    return () => clearInterval(pollInterval);
  };

interface QuestionProgress {
  id: string;
  section: string;
  question: string;
  status: string;
  completed_at: string | null;
  tick_mark: string;
}

interface StandardProgress {
  standard_id: string;
  standard_name: string;
  status: string;
  progress_percentage: number;
  completed_questions: number;
  total_questions: number;
  current_question: string;
  elapsed_time_seconds: number;
  elapsed_time_formatted: string;
  questions_progress: QuestionProgress[];
}

// Results interfaces
interface ComplianceItem {
  status: string;
  [key: string]: unknown;
}

interface ComplianceSection {
  items?: ComplianceItem[];
  [key: string]: unknown;
}

interface ComplianceResults {
  sections?: ComplianceSection[];
  [key: string]: unknown;
}

  const generateResultsSummary = (results: ComplianceResults | unknown): string => {
    const resultData = results as ComplianceResults;
    const totalItems = Array.isArray(resultData.sections)
      ? resultData.sections.reduce(
          (total: number, section: ComplianceSection) => total + (Array.isArray(section.items) ? section.items.length : 0),
          0,
        )
      : 0;

    const compliantItems = Array.isArray(resultData.sections)
      ? resultData.sections.reduce(
          (total: number, section: ComplianceSection) =>
            total +
            (Array.isArray(section.items) ? section.items.filter((item: ComplianceItem) => item.status === "YES").length : 0),
          0,
        )
      : 0;

    const nonCompliantItems = Array.isArray(resultData.sections)
      ? resultData.sections.reduce(
          (total: number, section: ComplianceSection) =>
            total +
            (Array.isArray(section.items) ? section.items.filter((item: ComplianceItem) => item.status === "NO").length : 0),
          0,
        )
      : 0;

    const compliancePercentage = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;

    return `📊 **Compliance Analysis Complete**

**Overall Compliance:** ${compliancePercentage}%
- ✅ **Yes:** ${compliantItems} items
- ❌ **No:** ${nonCompliantItems} items  
- 📋 **Total Checked:** ${totalItems} requirements

You can expand each section below to review detailed findings, evidence, and suggested improvements.`;
  };

  return (
    <div
      className={`flex full-height transition-colors duration-300 ${
        theme === "dark"
          ? "bg-black"
          : "bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50"
      } text-rendering-optimized`}
    >
      {/* Sessions Sidebar with Integrated Processing Logs */}
      <SessionsSidebar
        isOpen={showSessionsSidebar}
        onToggle={() => setShowSessionsSidebar(!showSessionsSidebar)}
        onNewSession={handleNewSession}
        onSessionSelect={(session) => handleSessionLoad(session.session_id)}
        currentSessionId={currentSession?.session_id || ""}
      />

      {/* Main Chat Interface */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidePanelOpen ? "lg:mr-[26rem] mr-0" : "mr-0"
        } ${showSessionsSidebar ? "lg:ml-[26rem] ml-0" : "ml-0"}`}
      >
        {/* Enhanced Chat Header */}
        <div
          className={`backdrop-blur-sm border-b p-4 shadow-sm transition-colors duration-300 ${
            theme === "dark"
              ? "bg-black/95 border-gray-700/60"
              : "bg-white/95 border-gray-200/60"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Left section - space for balance */}
            <div className="flex items-center space-x-3 w-60">
              {/* Empty for balance */}
            </div>
            
            {/* Centered logo and tagline */}
            <div className="flex items-center justify-center flex-1">
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1">
                  <span className="text-blue-600 font-bold text-2xl tracking-tight">RAi</span>
                  <span className="text-blue-500 font-medium text-lg uppercase tracking-wider">COMPLIANCE</span>
                </div>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  AI-Powered Financial Compliance Analysis
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Network Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Online</span>
              </div>

              {/* Panel Toggle Button */}
              <button
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-sm border border-gray-200 dark:border-white"
                title={
                  isSidePanelOpen
                    ? "Hide Analysis Panel"
                    : "Show Analysis Panel"
                }
              >
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isSidePanelOpen ? "rotate-0" : "rotate-180"}`}
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
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {chatState.currentStep && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-[#0087d9] to-[#0ea5e9] h-1.5 rounded-full progress-bar-dynamic"
                  ref={(el) => {
                    if (el) {
                      el.style.setProperty(
                        '--progress-width',
                        `${((chatSteps.findIndex((s) => s.id === chatState.currentStep?.id) + 1) / chatSteps.length) * 100}%`
                      );
                    }
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Messages Container - EXPANDED */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative flex flex-col">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#0087d9_1px,transparent_0)] [background-size:24px_24px]"
            ></div>
          </div>

          {/* Welcome Message Enhancement */}
          {messages.length === 0 && (
            <div
              className="text-center py-12"
            >
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-blue-600 font-bold text-4xl tracking-tight">RAi</span>
                    <span className="text-blue-500 font-medium text-2xl uppercase tracking-wider">COMPLIANCE</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Welcome to Your Compliance Analysis Platform
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Upload your financial documents and let our AI analyze them
                  for compliance with accounting standards. Get comprehensive
                  insights, detailed findings, and actionable recommendations.
                </p>
                <div className="flex justify-center">
                  <div className="px-6 py-3 bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-white rounded-xl border border-blue-200 dark:border-white">
                    <span className="font-medium">
                      Ready to start your compliance analysis
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area - Expandable */}
          <div className="flex-1">
            {safeMap<Message, React.ReactElement>(messages, (message) => (
              <div
                key={message.id}
              >
                <ChatMessage
                  message={message}
                  chatState={chatState}
                  onAnalysisModeSelect={handleAnalysisStart}
                  onSuggestionClick={handleSuggestionClick}
                  onGoToResults={handleGoToResults}
                />
              </div>
            ))}
          </div>

          <div ref={messagesEndRef} />

          {/* Chat Input at BOTTOM of Messages Area */}
          <div
            className={`backdrop-blur-sm border-t p-4 mt-4 transition-colors duration-300 ${
              theme === "dark"
                ? "bg-black/95 border-gray-700/60"
                : "bg-white/95 border-gray-200/60"
            }`}
          >
            <ChatInput
              onFileUpload={(file: unknown, uploadResponse?: unknown) => {
                if (file instanceof File) {
                  handleFileUpload(file, uploadResponse);
                }
              }}
              onFrameworkSelection={handleFrameworkSelection}
              chatState={chatState}
              disabled={chatState.isProcessing}
              onUploadStart={() => {
                setIsUploading(true);
                setUploadProgress(0);
                setUploadError(null);
                // Clear any existing polling timer
                if (pollingTimer) {
                  clearTimeout(pollingTimer);
                  setPollingTimer(null);
                }
              }}
              onUploadProgress={(progress: number) => setUploadProgress(progress)}
              onUploadError={(error: Error | unknown) => {
                setUploadError(error instanceof Error ? error.message : "Upload failed");
                setIsUploading(false);
              }}
              onUploadComplete={() => {
                setIsUploading(false);
                setUploadProgress(100);
              }}
            />
          </div>
        </div>

        {/* Analysis Progress Indicator */}
        {chatState.isProcessing && chatState.currentProgress && (
          <div
            className="mx-6 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="font-semibold text-blue-900">
                  {chatState.currentProgress.processing_mode
                    ? `${chatState.currentProgress.processing_mode.charAt(0).toUpperCase() + chatState.currentProgress.processing_mode.slice(1)} Mode Analysis`
                    : "Analysis"}
                </span>
              </div>
              <Badge
                className="border text-blue-700 border-blue-300"
              >
                {chatState.currentProgress.percentage}% Complete
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-blue-700">
                <span>Standards Progress</span>
                <span>
                  {chatState.currentProgress.completedStandards}/
                  {chatState.currentProgress.totalStandards}
                </span>
              </div>
              <Progress
                value={chatState.currentProgress.percentage}
                className="h-2"
              />
              {chatState.currentProgress.currentStandard && (
                <p className="text-sm text-blue-600 mt-2">
                  🎯 Currently analyzing:{" "}
                  <span className="font-medium">
                    {chatState.currentProgress.currentStandard}
                  </span>
                </p>
              )}

              {/* Question-level progress with tick marks */}
              {chatState.currentProgress?.standards_detail && (
                  <div className="mt-4 space-y-3">
                    {ensureArray(chatState.currentProgress.standards_detail).map(
                      (standard: unknown) => {
                        const typedStandard = standard as StandardProgress;
                        return (
                        <div
                          key={typedStandard.standard_id}
                          className="border border-blue-200 dark:border-white rounded-lg p-3 bg-white/50 dark:bg-gray-800/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-blue-900">
                              {typedStandard.standard_name}
                            </h4>
                            <Badge
                              className={`text-xs ${
                                typedStandard.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {typedStandard.completed_questions}/
                              {typedStandard.total_questions} questions
                            </Badge>
                          </div>

                          {/* Individual questions with tick marks */}
                          {typedStandard.questions_progress && (
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {ensureArray(typedStandard.questions_progress)
                                  .slice(0, 10)
                                  .map((question: unknown) => {
                                    const typedQuestion = question as QuestionProgress;
                                    return (
                                    <div
                                      key={typedQuestion.id}
                                      className="flex items-center gap-2 text-xs"
                                    >
                                      <span className="text-lg">
                                        {typedQuestion.tick_mark}
                                      </span>
                                      <span className="text-gray-600 truncate flex-1">
                                        {typedQuestion.id}:{" "}
                                        {typedQuestion.question.substring(0, 50)}...
                                      </span>
                                    </div>
                                  )})}
                                {ensureArray(typedStandard.questions_progress).length > 10 && (
                                  <div className="text-xs text-gray-500 italic">
                                    ... and{" "}
                                    {ensureArray(typedStandard.questions_progress).length - 10}{" "}
                                    more questions
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      );
                      }
                    )}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Side Panel */}
      <div>
        {isSidePanelOpen && (
          <>
            {/* Mobile Backdrop for SidePanel */}
            <div
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setIsSidePanelOpen(false)}
            />
            
            <SidePanel
            chatState={chatState}
            chatSteps={chatSteps}
            onMetadataUpdate={(metadata: unknown) =>
              setChatState((prev) => ({ ...prev, documentMetadata: metadata as DocumentMetadata }))
            }
            onFrameworkSelection={handleFrameworkSelection}
            onConfirmStep={(stepId: string) => {
              if (stepId === "metadata") {
                addMessage(
                  "Company information confirmed! Now let's proceed to framework and standards selection.",
                  "system",
                );
                moveToNextStep("framework-selection");
              } else if (stepId === "framework-selection") {
                // Allow re-editing of framework selection
                handleEditFrameworkSelection();
              }
            }}
            // Upload progress props
            uploadProgress={uploadProgress}
            isUploading={isUploading}
            uploadError={uploadError}
            // Framework selection props
            frameworks={frameworks}
            selectedFramework={selectedFramework}
            selectedStandards={selectedStandards}
            frameworkStep={frameworkStep}
            isFrameworkLoading={isFrameworkLoading}
            isFrameworkSubmitting={isFrameworkSubmitting}
            frameworkError={frameworkError}
            onFrameworkSelect={handleFrameworkSelect}
            onStandardToggle={handleStandardToggle}
            onSelectAllStandards={handleSelectAllStandards}
            onClearAllStandards={handleClearAllStandards}
            onFrameworkContinue={handleFrameworkContinue}
            onFrameworkBack={handleFrameworkBack}
            onCustomInstructionsChange={handleCustomInstructionsChange}
          />
          </>
        )}
      </div>

      {/* ProcessingOverlay component has been removed */}

      {/* Analysis Progress Component */}
      {showAnalysisProgress && chatState.currentProgress && (
        <div className="fixed bottom-4 right-4 z-40 max-w-md">
          <AnalysisProgress
            currentStandard={chatState.currentProgress.currentStandard || 'Initializing...'}
            completedStandards={chatState.currentProgress.completedStandards || 0}
            totalStandards={chatState.currentProgress.totalStandards || 1}
            progressPercent={chatState.currentProgress.percentage || 0}
            estimatedTimeRemaining={Math.max(1, Math.round((100 - (chatState.currentProgress.percentage || 0)) / 10))}
          />
        </div>
      )}
    </div>
  );
}

