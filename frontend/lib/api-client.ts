// API configuration
const DEFAULT_API_URL = "https://rai-compliance-backend.onrender.com";
const API_VERSION = "v1";

export const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || DEFAULT_API_URL;
const UPLOAD_PATH = `${API_BASE_URL}/api/${API_VERSION}/upload`;

// Enhanced loading management (from enhanced-api-client.ts)
interface LoadingManager {
  startOperation: (operation: string) => string;
  updateProgress: (operationId: string, progress: number, message?: string) => void;
  completeOperation: (operationId: string, successMessage?: string) => void;
  failOperation: (operationId: string, errorMessage?: string) => void;
}

let globalLoadingManager: LoadingManager | null = null;

export function setLoadingManager(manager: LoadingManager) {
  globalLoadingManager = manager;
}

export interface CompanyMetadata {
  company_name?: string;
  nature_of_business?: string;
  operational_demographics?: string;
  _overall_status?:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "PARTIAL"
    | "NOT_FOUND";
}

// Common fetch options for all API calls
const commonFetchOptions: RequestInit = {
  headers: {
    Accept: "application/json",
  },
};

export interface DocumentMetadata {
  company_name: string;
  nature_of_business?: string;
  operational_demographics?: string;
  financial_statements_type?: string;
  status?: "COMPLETED" | "FAILED" | "PARTIAL" | "NOT_FOUND";
  _overall_status?: "PENDING" | "COMPLETED" | "FAILED" | "PARTIAL" | "NOT_FOUND";
}

export interface Document {
  id: string;
  filename: string;
  upload_date: string;
  analysis_status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  metadata?: DocumentMetadata;
}

export interface Session {
  session_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  document_count: number;
  last_document_id?: string;
  status: "active" | "completed" | "archived";
}

export interface SessionDetail extends Session {
  chat_state?: Record<string, unknown>;
  messages?: Array<Record<string, unknown>>;
  documents?: Document[];
}

export interface UploadResponse {
  document_id: string;
  id?: string;
  filename?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  message: string;
}

export interface ChecklistItem {
  id: string;
  question: string;
  reference: string;
  status: string;
  confidence: number;
  explanation: string;
  evidence: string | string[];
  comments?: string;
  requirement?: string;
  suggestion?: string;
  suggestions?: string;
  ai_suggestion?: string;
  content_analysis?: string;
  disclosure_recommendations?: string | string[];
  geography_of_operations?: string;
  pageNumber?: number;
}

export interface ChecklistData {
  items: ChecklistItem[];
  metadata: {
    total_items: number;
    completed_items: number;
    compliance_score: number;
  };
}

export interface ChecklistSection {
  id: string;
  section: string;
  title: string;
  items: ChecklistItem[];
  standard?: string;
}

export interface AnalysisResults {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  document_id: string;
  timestamp: string;
  metadata: {
    company_name: MetadataField;
    nature_of_business: MetadataField;
    operational_demographics: MetadataField;
    _overall_status:
      | "PENDING"
      | "COMPLETED"
      | "FAILED"
      | "PARTIAL"
      | "NOT_FOUND";
  };
  sections: ChecklistSection[];
  standard?: string;
  standards?: string[];
  metadata_extraction:
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "PARTIAL"
    | "NOT_FOUND";
  compliance_analysis: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  message: string;
}

export interface MetadataField {
  value: string;
  confidence: number;
  evidence: Array<Record<string, unknown>>;
  status: "COMPLETED" | "NOT_FOUND" | "FAILED";
  error: string | null;
}

export interface MetadataResponse {
  company_name: MetadataField;
  nature_of_business: MetadataField;
  operational_demographics: MetadataField;
  _overall_status: "COMPLETED" | "FAILED" | "PARTIAL" | "NOT_FOUND";
}

export interface AnalysisStatus {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  document_id: string;
  metadata_extraction:
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "PARTIAL"
    | "NOT_FOUND";
  compliance_analysis: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  metadata?: Record<string, unknown>; // Keep flexible to handle backend format directly
  sections?: ChecklistSection[];
  message?: string;
}

export type ComplianceReport = Record<string, unknown>;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  try {
    // Use the base path from Next.js rewrite rules
    const apiPath = endpoint.startsWith("/api/v1")
      ? endpoint
      : `/api/v1${endpoint}`;
    const fullUrl = `${API_BASE_URL}${apiPath}`;

    const response = await fetch(fullUrl, {
      ...commonFetchOptions,
      ...options,
      headers: {
        ...commonFetchOptions.headers,
        ...(options.body && !options.body.toString().includes("FormData")
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = "API request failed";
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.detail ||
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: unknown) {
    // Re-throw the original error if it's already our custom error
    if (error instanceof Error && error.message && !error.message.includes("fetch")) {
      throw error;
    }

    throw new Error("Network error: Unable to connect to server");
  }
}

// Enhanced fetch function with loading indicators (from enhanced-api-client.ts)
export async function fetchWithLoading(
  endpoint: string, 
  options: RequestInit = {},
  operationName?: string,
  showProgress = true
) {
  let operationId: string | null = null;
  
  try {
    // Start loading indicator
    if (globalLoadingManager && operationName) {
      operationId = globalLoadingManager.startOperation(operationName);
      if (showProgress) {
        globalLoadingManager.updateProgress(operationId, 10, `Starting ${operationName.toLowerCase()}...`);
      }
    }

    // Use the base path from Next.js rewrite rules
    const apiPath = endpoint.startsWith("/api/v1")
      ? endpoint
      : `/api/v1${endpoint}`;
    const fullUrl = `${API_BASE_URL}${apiPath}`;

    if (operationId && showProgress) {
      globalLoadingManager?.updateProgress(operationId, 30, "Sending request...");
    }

    const response = await fetch(fullUrl, {
      headers: {
        Accept: "application/json",
        ...(options.body && !options.body.toString().includes("FormData")
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
      ...options,
    });

    if (operationId && showProgress) {
      globalLoadingManager?.updateProgress(operationId, 60, "Processing response...");
    }

    if (!response.ok) {
      let errorMessage = "API request failed";
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.detail ||
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      if (operationId) {
        globalLoadingManager?.failOperation(operationId, errorMessage);
      }
      
      throw new Error(errorMessage);
    }

    if (operationId && showProgress) {
      globalLoadingManager?.updateProgress(operationId, 90, "Parsing data...");
    }

    const data = await response.json();

    if (operationId) {
      globalLoadingManager?.completeOperation(
        operationId, 
        operationName ? `${operationName} completed successfully` : undefined
      );
    }

    return data;
  } catch (error) {
    if (operationId) {
      globalLoadingManager?.failOperation(
        operationId, 
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
    throw error;
  }
}

export const api = {
  documents: {
    upload: async (
      file: File,
      analysisMode: "zap" | "smart" | "comparison" | "enhanced" = "smart",
    ): Promise<UploadResponse> => {
      try {

        const formData = new FormData();
        formData.append("file", file);
        formData.append("processing_mode", analysisMode);

        const response = await fetch(UPLOAD_PATH, {
          ...commonFetchOptions,
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          
          let errorMessage = "Upload failed";
          try {
            const errorData = await response.json();
            
            errorMessage =
              errorData.detail ||
              errorData.message ||
              `Upload failed: ${response.status} ${response.statusText}`;
          } catch {
            errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
          }

          throw new Error(errorMessage);
        }

        const result = await response.json();
        
        return result;
      } catch (error: unknown) {
        // Check if it's a network connectivity issue
        if (error instanceof TypeError && error.message.includes("fetch")) {
          throw new Error(
            `Network error: Cannot connect to backend server at ${API_BASE_URL}. Please check your internet connection.`,
          );
        }

        if (error instanceof Error && error.message && !error.message.includes("fetch")) {
          throw error;
        }

        throw new Error("Network error: Unable to upload file");
      }
    },
    get: async (documentId: string): Promise<Document> => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/documents/${documentId}`,
        commonFetchOptions,
      );
      if (!response.ok) {
        throw new Error("Failed to get document");
      }
      const data = await response.json();

      // Helper function to extract value from metadata field (handles both string and object formats)
      const extractMetadataValue = (field: Record<string, unknown> | string | undefined): string => {
        if (!field) return "";
        if (typeof field === "string") return field;
        if (typeof field === "object" && field['value'] && typeof field['value'] === "string") return field['value'];
        return "";
      };

      // Transform the metadata to match the expected structure
      return {
        ...data,
        metadata: {
          company_name: extractMetadataValue(data.metadata?.company_name),
          nature_of_business: extractMetadataValue(data.metadata?.nature_of_business),
          operational_demographics: extractMetadataValue(data.metadata?.operational_demographics),
          _overall_status: data.metadata?._overall_status || "PENDING",
        },
      };
    },
    getAll: async (): Promise<Document[]> => {
      const response = await fetch(
        "/api/v1/documents",
        commonFetchOptions,
      );
      if (!response.ok) {
        throw new Error("Failed to get documents");
      }
      return response.json();
    },
    getStatus: async (documentId: string): Promise<AnalysisStatus> => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/documents/${documentId}`,
        commonFetchOptions,
      );
      if (!response.ok) {
        throw new Error("Failed to get document status");
      }
      const data = await response.json();

      return {
        status: data.status || "PROCESSING",
        metadata_extraction: data.metadata_extraction || "PENDING",
        compliance_analysis: data.compliance_analysis || "PENDING",
        document_id: documentId,
        metadata: data.metadata || {}, // Return the backend metadata format directly
        sections: data.sections || [],
        message: data.message || "Document processing in progress",
      };
    },
    getKeywordExtractionStatus: async (
      documentId: string,
    ): Promise<{
      keywords_discovered: string[];
      current_step: string;
      progress_percentage: number;
      current_keyword?: string;
    }> => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/documents/${documentId}/keywords`,
        commonFetchOptions,
      );
      if (!response.ok) {
        throw new Error("Failed to get keyword extraction status");
      }
      return response.json();
    },
  },
  analysis: {
    analyze: async (documentId: string) => {
      try {
        // ✅ Step 1: Basic text extraction (working)
        // Step 1: Basic text extraction (logged internally)
        const extractResponse = await fetchApi(`/documents/${documentId}/results`, {
          method: "GET",
        });
        // Text extraction completed

        // ✅ Step 2: Get main analysis status (backend auto-processes on upload)
        // Step 2: Checking analysis status - backend should auto-process
        try {
          const analysisResponse = await fetchApi(`/documents/${documentId}`, {
            method: "GET",
          });
          // Analysis status checked
          
          // Check if this response has actual AI metadata
          if (analysisResponse.metadata && Object.keys(analysisResponse.metadata).length > 0) {
            // AI metadata found
            return analysisResponse;
          } else {
            // Analysis status structure logged internally
            
            // The analysis should auto-complete after a few seconds
            // Backend auto-processing - polling for completion
            return analysisResponse;
          }
        } catch {
          // Analysis status check failed - logged internally
        }

        // Try to trigger AI processing by calling the status endpoint multiple times
        // Sometimes AI processing starts after the status is checked
        // Step 3: Checking status to potentially trigger AI processing
        for (let i = 0; i < 3; i++) {
          try {
            const statusResponse = await fetchApi(`/documents/${documentId}`, {
              method: "GET",
            });
            // Status check logged internally
            
            // Check if metadata appeared after status checks
            if (statusResponse.metadata && statusResponse.metadata_extraction === "COMPLETED") {
              // AI processing completed - metadata found
              return statusResponse;
            }
            
            // Wait 1 second between checks
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch {
            // Status check failed - logged internally
          }
        }

        // If everything fails, return the basic extraction result
        // All AI attempts failed, returning basic extraction result
        return extractResponse;
        
      } catch (error) {
        // All extraction attempts failed - logged internally
        throw error;
      }
    },
    analyzeCompliance: async (documentId: string) => {
      try {
        const response = await fetchApi(`/documents/${documentId}`);
        return response;
      } catch (error) {
        throw error;
      }
    },
    getResults: async (documentId: string): Promise<AnalysisResults> => {
      try {
        const response = await fetchApi(`/documents/${documentId}`);
        
        if (response.sections && Array.isArray(response.sections)) {
          response.sections = response.sections.map((section: Record<string, unknown>) => {
            if (section['items'] && Array.isArray(section['items'])) {
              section['items'] = section['items'].map((item: Record<string, unknown>) => {
                // Log the original item for debugging
                
                return {
                  ...item,
                  suggestion: item['suggestion'] || item['suggestions'] || "",
                  ai_suggestion:
                    item['ai_suggestion'] ||
                    item['suggestion'] ||
                    item['suggestions'] ||
                    "",
                };
              });
            }
            return section;
          });
        }

        // Transform the response to match the expected structure
        return {
          status: response.status,
          document_id: documentId,
          timestamp: response.timestamp || new Date().toISOString(),
          metadata: response.metadata || {},
          sections: response.sections || [],
          standard: response.standard,
          standards: response.standards,
          metadata_extraction: response.metadata_extraction || "PENDING",
          compliance_analysis: response.compliance_analysis || "PENDING",
          message: response.message || "Document processing in progress",
        };
      } catch (error) {
        throw error;
      }
    },
    getStatus: async (documentId: string): Promise<AnalysisStatus> => {
      try {
        const response = await fetchApi(`/documents/${documentId}`);
        // Transform the response to match the expected structure
        return {
          status: response.status || "PROCESSING",
          metadata_extraction: response.metadata_extraction || "PENDING",
          compliance_analysis: response.compliance_analysis || "PENDING",
          document_id: documentId,
          metadata: response.metadata || {},
          sections: response.sections || [],
          message: response.message || "Document processing in progress",
        };
      } catch (error) {
        // Error getting analysis status logged internally
        throw error;
      }
    },
    getComplianceReport: async (
      documentId: string,
    ): Promise<ComplianceReport> => {
      const response = await fetchApi(
        `/documents/${documentId}/results`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );
      return response;
    },
    updateComplianceItem: async (
      documentId: string,
      itemId: string,
      data: { status?: string; comments?: string },
    ) => {
      return fetchApi(`/documents/${documentId}/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    getChecklist: async (): Promise<Record<string, unknown>> => {
      try {
        return await fetchApi("/checklist");
      } catch (error) {
        // Internal logging: Error getting checklist
        throw error;
      }
    },
    getMetadataFields: async (): Promise<Record<string, unknown>> => {
      try {
        return await fetchApi("/metadata/fields");
      } catch (error) {
        // Internal logging: Error getting metadata fields
        throw error;
      }
    },
    getFrameworkChecklist: async (framework: string, standard: string): Promise<Record<string, unknown>> => {
      try {
        return await fetchApi(`/checklist/${framework}/${standard}`);
      } catch (error) {
        // Internal logging: Error getting framework checklist
        throw error;
      }
    },
    getRateLimitStatus: async (): Promise<Record<string, unknown>> => {
      try {
        return await fetchApi("/rate-limit-status");
      } catch (error) {
        // Internal logging: Error getting rate limit status
        throw error;
      }
    },
    suggestAccountingStandards: async (metadata: {
      framework: string;
      company_name: string;
      nature_of_business: string;
      operational_demographics: string;
      financial_statements_type: string;
    }): Promise<Record<string, unknown>> => {
      try {
        return await fetchApi("/suggest-standards", {
          method: "POST",
          body: JSON.stringify(metadata),
        });
      } catch (error) {
        // Internal logging: Error getting accounting standards suggestions
        throw error;
      }
    },
    getAnalysisProgress: async (documentId: string): Promise<Record<string, unknown>> => {
      try {
        return await fetchApi(`/progress/${documentId}`);
      } catch (error) {
        // Internal logging: Error getting analysis progress
        throw error;
      }
    },
    selectProcessingMode: async (
      documentId: string,
      data: {
        processing_mode: "zap" | "smart" | "comparison" | "enhanced";
        comparison_settings?: {
          priority_mode?: "smart_first" | "zap_first";
          detailed_metrics?: boolean;
          token_tracking?: boolean;
        };
        user_preferences?: {
          speed_priority?: number;
          cost_priority?: number;
          accuracy_priority?: number;
        };
      },
    ) => {
      
      return await fetchApi(
        `/documents/${documentId}/select-processing-mode`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
    },
    selectFramework: async (
      documentId: string,
      data: {
        framework: string;
        standards: string[];
        specialInstructions?: string;
        extensiveSearch?: boolean;
      },
    ) => {
      return await fetchApi(
        `/documents/${documentId}/select-framework`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
    },
    getProgress: async (documentId: string) => {
      return await fetchApi(`/progress/${documentId}`);
    },
    startCompliance: async (
      documentId: string,
      options: {
        mode: "zap" | "smart" | "comparison" | "enhanced";
        special_instructions?: string;
        comparison_config?: {
          priority_mode?: "smart_first" | "zap_first";
          detailed_metrics?: boolean;
        };
      },
    ) => {
      
      return await fetchApi(
        `/documents/${documentId}/start-compliance`,
        {
          method: "POST",
          body: JSON.stringify(options),
        },
      );
    },
    startChecklistProcessing: async (documentId: string) => {
      return await fetchApi(
        `/documents/${documentId}/start-checklist-processing`,
        {
          method: "POST",
        },
      );
    },
    getFrameworks: async (): Promise<Record<string, unknown>> => {
      try {
        return await fetchApi("/frameworks");
      } catch (error) {
        // Internal logging: Error getting frameworks
        throw error;
      }
    },
  },
  checklist: {
    get: async ({
      documentId,
    }: {
      documentId: string;
    }): Promise<AnalysisResults> => {
      return fetchApi(`/documents/${documentId}`);
    },
  },
  report: {
    get: async (documentId: string): Promise<Record<string, unknown>> => {
      return fetchApi(`/documents/${documentId}/report`);
    },
  },
  sessions: {
    create: async (data: { 
      title?: string; 
      description?: string; 
      last_document_id?: string; 
    }): Promise<Session> => {
      return fetchApi("/sessions/create", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    list: async (limit: number = 50, offset: number = 0): Promise<Session[]> => {
      return fetchApi(`/sessions/list?limit=${limit}&offset=${offset}`);
    },
    get: async (sessionId: string): Promise<SessionDetail> => {
      return fetchApi(`/sessions/${sessionId}`);
    },
    update: async (sessionId: string, data: {
      title?: string;
      description?: string;
      chat_state?: Record<string, unknown>;
      messages?: Record<string, unknown>[];
      last_document_id?: string;
    }): Promise<Session> => {
      return fetchApi(`/sessions/${sessionId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete: async (sessionId: string): Promise<void> => {
      return fetchApi(`/sessions/${sessionId}`, {
        method: "DELETE",
      });
    },
    archive: async (sessionId: string): Promise<void> => {
      return fetchApi(`/sessions/${sessionId}/archive`, {
        method: "POST",
      });
    },
  },
};

// Enhanced API with loading indicators (consolidated from enhanced-api-client.ts)
// Use this for better UX with loading states and progress tracking
export const enhancedApi = {
  analysis: {
    async getStatus(documentId: string) {
      return fetchWithLoading(
        `/documents/${documentId}`,
        { method: "GET" },
        "Checking document status",
        true
      );
    },

    async upload(file: File, sessionId?: string, processingMode: "zap" | "smart" | "comparison" | "enhanced" = "smart") {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("processing_mode", processingMode);
      if (sessionId) {
        formData.append("session_id", sessionId);
      }

      return fetchWithLoading(
        "/upload",
        { method: "POST", body: formData },
        "Uploading document",
        true
      );
    },

    async startCompliance(documentId: string, options: {
      framework: string;
      standards: string[];
      specialInstructions?: string;
      extensiveSearch?: boolean;
    }) {
      return fetchWithLoading(
        `/documents/${documentId}/select-framework`,
        {
          method: "POST",
          body: JSON.stringify(options),
        },
        "Starting compliance analysis",
        true
      );
    },

    async getResults(documentId: string) {
      return fetchWithLoading(
        `/documents/${documentId}`,
        { method: "GET" },
        "Loading analysis results",
        true
      );
    },

    async getProgress(documentId: string) {
      return fetchWithLoading(
        `/progress/${documentId}`,
        { method: "GET" },
        "Checking analysis progress",
        false // Don't show progress for polling
      );
    },

    async getFrameworks() {
      return fetchWithLoading(
        "/frameworks",
        { method: "GET" },
        "Loading frameworks",
        true
      );
    },

    async getFrameworkChecklist(framework: string, standard: string) {
      return fetchWithLoading(
        `/checklist/${framework}/${standard}`,
        { method: "GET" },
        "Loading framework checklist",
        true
      );
    },

    async getRateLimitStatus() {
      return fetchWithLoading(
        "/rate-limit-status",
        { method: "GET" },
        "Checking rate limits",
        false
      );
    },

    async suggestStandards(metadata: {
      framework: string;
      company_name: string;
      nature_of_business: string;
      operational_demographics: string;
      financial_statements_type: string;
    }) {
      return fetchWithLoading(
        "/suggest-standards",
        {
          method: "POST",
          body: JSON.stringify(metadata),
        },
        "Getting standards suggestions",
        true
      );
    },

    async startChecklistProcessing(documentId: string) {
      return fetchWithLoading(
        `/documents/${documentId}/start-checklist-processing`,
        { method: "POST" },
        "Starting checklist processing",
        true
      );
    },
  },

  documents: {
    async get(documentId: string) {
      return fetchWithLoading(
        `/documents/${documentId}`,
        { method: "GET" },
        "Loading document details",
        true
      );
    },

    async list() {
      return fetchWithLoading(
        "/documents",
        { method: "GET" },
        "Loading documents",
        true
      );
    },

    async upload(file: File, processingMode: "zap" | "smart" | "comparison" | "enhanced" = "smart") {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("processing_mode", processingMode);

      return fetchWithLoading(
        "/upload",
        { method: "POST", body: formData },
        "Uploading document",
        true
      );
    },
  },

  checklist: {
    async get(documentId: string) {
      return fetchWithLoading(
        `/documents/${documentId}`,
        { method: "GET" },
        "Loading compliance checklist",
        true
      );
    },

    async updateItem(documentId: string, itemId: string, data: {
      status?: string;
      comments?: string;
    }) {
      return fetchWithLoading(
        `/documents/${documentId}/items/${itemId}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
        "Updating compliance item",
        false // Don't show progress for quick updates
      );
    },

    async autoFill(documentId: string, sectionId?: string) {
      return fetchWithLoading(
        `/documents/${documentId}/checklist/auto-fill`,
        {
          method: "POST",
          body: JSON.stringify({ section_id: sectionId }),
        },
        "Auto-filling checklist",
        true
      );
    },
  },

  sessions: {
    async create(data: { 
      title?: string; 
      description?: string; 
      last_document_id?: string; 
    }) {
      return fetchWithLoading(
        "/sessions/create",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        "Creating session",
        true
      );
    },

    async list(limit = 50, offset = 0) {
      return fetchWithLoading(
        `/sessions/list?limit=${limit}&offset=${offset}`,
        { method: "GET" },
        "Loading sessions",
        true
      );
    },

    async get(sessionId: string) {
      return fetchWithLoading(
        `/sessions/${sessionId}`,
        { method: "GET" },
        "Loading session",
        true
      );
    },

    async update(sessionId: string, data: {
      title?: string;
      description?: string;
      chat_state?: Record<string, unknown>;
      messages?: Record<string, unknown>[];
      last_document_id?: string;
    }) {
      return fetchWithLoading(
        `/sessions/${sessionId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
        "Updating session",
        false
      );
    },

    async delete(sessionId: string) {
      return fetchWithLoading(
        `/sessions/${sessionId}`,
        { method: "DELETE" },
        "Deleting session",
        true
      );
    },

    async archive(sessionId: string) {
      return fetchWithLoading(
        `/sessions/${sessionId}/archive`,
        { method: "POST" },
        "Archiving session",
        true
      );
    },
  },

  health: {
    async check() {
      return fetchWithLoading(
        "/health",
        { method: "GET" },
        "Checking system health",
        false
      );
    },

    async detailed() {
      return fetchWithLoading(
        "/health/detailed",
        { method: "GET" },
        "Getting detailed health status",
        true
      );
    },
  },
};
