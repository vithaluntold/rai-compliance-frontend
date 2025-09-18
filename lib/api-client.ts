// API configuration
const API_VERSION = "v1";
const DEFAULT_API_URL = "https://rai-compliance-backend.onrender.com";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
const UPLOAD_PATH = `${API_BASE_URL}/api/${API_VERSION}/analysis/upload`;

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
  chat_state?: any;
  messages?: any[];
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
  evidence: any[];
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
  metadata?: any; // Keep flexible to handle backend format directly
  sections?: ChecklistSection[];
  message?: string;
}

export interface ComplianceReport {
  // Define the structure of the ComplianceReport
}

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
  } catch (error: any) {
    // Re-throw the original error if it's already our custom error
    if (error.message && !error.message.includes("fetch")) {
      throw error;
    }

    throw new Error("Network error: Unable to connect to server");
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
      } catch (error: any) {
        // Check if it's a network connectivity issue
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          throw new Error(
            `Network error: Cannot connect to backend server at ${API_BASE_URL}. Please check your internet connection.`,
          );
        }

        if (error.message && !error.message.includes("fetch")) {
          throw error;
        }

        throw new Error("Network error: Unable to upload file");
      }
    },
    get: async (documentId: string): Promise<Document> => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/analysis/documents/${documentId}`,
        commonFetchOptions,
      );
      if (!response.ok) {
        throw new Error("Failed to get document");
      }
      const data = await response.json();

      // Helper function to extract value from metadata field (handles both string and object formats)
      const extractMetadataValue = (field: any): string => {
        if (!field) return "Not available";
        if (typeof field === "string") return field;
        if (typeof field === "object" && field.value) return field.value;
        return "Not available";
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
        "/api/v1/analysis/documents",
        commonFetchOptions,
      );
      if (!response.ok) {
        throw new Error("Failed to get documents");
      }
      return response.json();
    },
    getStatus: async (documentId: string): Promise<AnalysisStatus> => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/analysis/documents/${documentId}`,
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
        `${API_BASE_URL}/api/v1/analysis/documents/${documentId}/keywords`,
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
        console.log(`🎯 Step 1: Basic text extraction`);
        const extractResponse = await fetchApi(`/analysis/documents/${documentId}/extract`, {
          method: "GET",
        });
        console.log(`✅ Text extraction completed:`, extractResponse);

        // ✅ Step 2: Get main analysis status (backend auto-processes on upload)
        console.log(`🤖 Step 2: Checking analysis status - backend should auto-process`);
        try {
          const analysisResponse = await fetchApi(`/analysis/documents/${documentId}`, {
            method: "GET",
          });
          console.log(`✅ ANALYSIS STATUS:`, analysisResponse);
          
          // Check if this response has actual AI metadata
          if (analysisResponse.metadata && Object.keys(analysisResponse.metadata).length > 0) {
            console.log(`🎯 FOUND AI METADATA!`, analysisResponse.metadata);
            return analysisResponse;
          } else {
            console.log(`📝 Analysis status structure:`, {
              hasMetadata: !!analysisResponse.metadata,
              metadataKeys: analysisResponse.metadata ? Object.keys(analysisResponse.metadata) : [],
              metadataExtraction: analysisResponse.metadata_extraction,
              status: analysisResponse.status,
              fullResponse: analysisResponse
            });
            
            // The analysis should auto-complete after a few seconds
            console.log(`🔄 BACKEND AUTO-PROCESSING - polling for completion`);
            return analysisResponse;
          }
        } catch (error) {
          console.log(`❌ Analysis status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // ✅ Try to trigger AI processing by calling the status endpoint multiple times
        // Sometimes AI processing starts after the status is checked
        console.log(`🔄 Step 3: Checking status to potentially trigger AI processing`);
        for (let i = 0; i < 3; i++) {
          try {
            const statusResponse = await fetchApi(`/analysis/documents/${documentId}`, {
              method: "GET",
            });
            console.log(`📊 Status check ${i + 1}:`, statusResponse);
            
            // Check if metadata appeared after status checks
            if (statusResponse.metadata && statusResponse.metadata_extraction === "COMPLETED") {
              console.log(`🎯 AI PROCESSING COMPLETED! Metadata found:`, statusResponse.metadata);
              return statusResponse;
            }
            
            // Wait 1 second between checks
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.log(`❌ Status check ${i + 1} failed:`, error);
          }
        }

        // If everything fails, return the basic extraction result
        console.log(`⚠️ All AI attempts failed, returning basic extraction result`);
        return extractResponse;
        
      } catch (error) {
        console.error("❌ All extraction attempts failed:", error);
        throw error;
      }
    },
    analyzeCompliance: async (documentId: string) => {
      try {
        const response = await fetchApi(`/analysis/documents/${documentId}`);
        return response;
      } catch (error) {
        throw error;
      }
    },
    getResults: async (documentId: string): Promise<AnalysisResults> => {
      try {
        const response = await fetchApi(`/analysis/documents/${documentId}`);
        
        if (response.sections && Array.isArray(response.sections)) {
          response.sections = response.sections.map((section: any) => {
            if (section.items && Array.isArray(section.items)) {
              section.items = section.items.map((item: any) => {
                // Log the original item for debugging
                
                return {
                  ...item,
                  suggestion: item.suggestion || item.suggestions || "",
                  ai_suggestion:
                    item.ai_suggestion ||
                    item.suggestion ||
                    item.suggestions ||
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
        const response = await fetchApi(`/analysis/documents/${documentId}`);
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
        console.error("Error getting analysis status:", error);
        throw error;
      }
    },
    getComplianceReport: async (
      documentId: string,
    ): Promise<ComplianceReport> => {
      const response = await fetchApi(
        `/analysis/documents/${documentId}/results`,
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
      return fetchApi(`/analysis/documents/${documentId}/checklist/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    getChecklist: async (): Promise<any> => {
      try {
        return await fetchApi("/analysis/checklist");
      } catch (error) {
        console.error("Error getting checklist:", error);
        throw error;
      }
    },
    getMetadataFields: async (): Promise<any> => {
      try {
        return await fetchApi("/analysis/metadata/fields");
      } catch (error) {
        console.error("Error getting metadata fields:", error);
        throw error;
      }
    },
    getFrameworks: async (): Promise<any> => {
      try {
        return await fetchApi("/analysis/frameworks");
      } catch (error) {
        console.error("Error getting frameworks:", error);
        throw error;
      }
    },
    suggestAccountingStandards: async (metadata: {
      framework: string;
      company_name: string;
      nature_of_business: string;
      operational_demographics: string;
      financial_statements_type: string;
    }): Promise<any> => {
      try {
        return await fetchApi("/analysis/suggest-standards", {
          method: "POST",
          body: JSON.stringify(metadata),
        });
      } catch (error) {
        console.error("Error getting accounting standards suggestions:", error);
        throw error;
      }
    },
    getAnalysisProgress: async (documentId: string): Promise<any> => {
      try {
        return await fetchApi(`/analysis/progress/${documentId}`);
      } catch (error) {
        console.error("Error getting analysis progress:", error);
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
        `/analysis/documents/${documentId}/select-processing-mode`,
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
        `/analysis/documents/${documentId}/select-framework`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
    },
    getProgress: async (documentId: string) => {
      return await fetchApi(`/analysis/progress/${documentId}`);
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
        `/analysis/documents/${documentId}/start-compliance`,
        {
          method: "POST",
          body: JSON.stringify(options),
        },
      );
    },
  },
  checklist: {
    get: async ({
      documentId,
    }: {
      documentId: string;
    }): Promise<AnalysisResults> => {
      return fetchApi(`/analysis/documents/${documentId}`);
    },
  },
  report: {
    get: async (documentId: string): Promise<any> => {
      return fetchApi(`/analysis/documents/${documentId}/report`);
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
      chat_state?: any;
      messages?: any[];
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
