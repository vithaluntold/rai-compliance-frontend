// Enhanced API client with loading indicators
// API configuration
const DEFAULT_API_URL = "https://rai-compliance-backend.onrender.com";

export const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || DEFAULT_API_URL;

// Global loading state management
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

// Enhanced fetch function with loading indicators
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

    // DEBUG: Log API response data
    // eslint-disable-next-line no-console
    console.log('🔍 API Response:', {
      endpoint: endpoint,
      fullUrl: fullUrl,
      method: options.method,
      status: response.status,
      data: data
    });

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

// Enhanced API methods with loading indicators
export const enhancedApi = {
  analysis: {
    async getStatus(documentId: string) {
      // Removed console.log for production
// Removed console.log for production
return fetchWithLoading(
        `/analysis/documents/${documentId}`,
        { method: "GET" },
        "Checking document status",
        true
      );
    },

    async upload(file: File, sessionId?: string) {
      const formData = new FormData();
      formData.append("file", file);
      if (sessionId) {
        formData.append("session_id", sessionId);
      }

      return fetchWithLoading(
        "/analysis/upload",
        { method: "POST", body: formData },
        "Uploading document",
        true
      );
    },

    async startCompliance(documentId: string, standards: string[]) {
      return fetchWithLoading(
        `/analysis/compliance/${documentId}`,
        {
          method: "POST",
          body: JSON.stringify({ standards }),
        },
        "Starting compliance analysis",
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
  },

  compliance: {
    async getChecklist(documentId: string, standard?: string) {
      const url = standard 
        ? `/compliance/checklist/${documentId}?standard=${standard}`
        : `/compliance/checklist/${documentId}`;
      
      return fetchWithLoading(
        url,
        { method: "GET" },
        "Loading compliance checklist",
        true
      );
    },

    async updateItem(documentId: string, itemId: string, data: unknown) {
      return fetchWithLoading(
        `/compliance/checklist/${documentId}/items/${itemId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
        "Updating compliance item",
        false // Don't show progress for quick updates
      );
    },

    async generateReport(documentId: string, standard?: string) {
      const url = standard
        ? `/compliance/report/${documentId}?standard=${standard}`
        : `/compliance/report/${documentId}`;
        
      return fetchWithLoading(
        url,
        { method: "GET" },
        "Generating compliance report",
        true
      );
    },
  },
};