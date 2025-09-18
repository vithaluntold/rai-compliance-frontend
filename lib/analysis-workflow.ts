import {toast} from "@/components/ui/use-toast";
import {safeApiCall} from "@/lib/error-handling";

export interface AnalysisWorkflowError {
  step: string;
  type: "network" | "api" | "validation" | "timeout" | "unknown";
  message: string;
  recoverable: boolean;
  retryAction?: () => void;
}

export class AnalysisWorkflowManager {
  private static showWorkflowError(error: AnalysisWorkflowError) {
    toast({
      title: '${error.step} Error',
      description: error.message,
      variant: "destructive",
      duration: error.recoverable ? 8000 : 6000,
    });
  }

  // Enhanced file upload with progress tracking
  static async uploadDocument(
    file: File,
    onProgress?: (progress: number) => void,
    onSuccess?: (documentId: string) => void,
    onError?: (error: AnalysisWorkflowError) => void,
  ) {
    try {
      onProgress?.(10);

      onProgress?.(100);

      if (response.document_id) {
        onSuccess?.(response.document_id);
        return response.document_id;
      } else {
        throw new Error("Upload completed but no document ID returned");
      }
    } catch (__error) {
      const workflowError: AnalysisWorkflowError = {
        step: "Document Upload",
        type: error.code === "NETWORK_ERROR" ? "network" : "api",
        message: error.message || "Failed to upload document",
        recoverable: true,
        retryAction: () =>
          this.uploadDocument(file, onProgress, onSuccess, onError),
      };

      onError?.(workflowError);
      this.showWorkflowError(workflowError);
      throw error;
    }
  }

  // Enhanced metadata extraction with polling
  static async extractMetadata(
    documentId: string,
    onMetadataReceived?: (metadata: unknown) => void,
    onError?: (error: AnalysisWorkflowError) => void,
    maxAttempts: number = 30,
  ) {
    let attempts = 0;

    const poll = async (): Promise<any> => {
      try {
        attempts++;

        const status = await safeApiCall(
          () => api.analysis.getStatus(documentId),
          "metadata",
          {
            timeout: 10000,
            retryConfig: { maxRetries: 2 },
          },
        );

        if (status.metadata && status.metadata.company_name) {
          onMetadataReceived?.(status.metadata);
          return status.metadata;
        }

        if (attempts >= maxAttempts) {
          throw new Error("Metadata extraction timed out");
        }

        // Continue polling with exponential backoff
        const delay = Math.min(2000 * Math.pow(1.5, attempts - 1), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return poll();
      } catch (__error) {
        const workflowError: AnalysisWorkflowError = {
          step: "Metadata Extraction",
          type: attempts >= maxAttempts ? "timeout" : "api",
          message:
            attempts >= maxAttempts
              ? "Metadata extraction is taking longer than expected. You can proceed manually."
              : error.message || "Failed to extract metadata",
          recoverable: true,
          retryAction: () =>
            this.extractMetadata(
              documentId,
              onMetadataReceived,
              onError,
              maxAttempts,
            ),
        };

        onError?.(workflowError);
        this.showWorkflowError(workflowError);
        throw error;
      }
    };

    return poll();
  }

  // Enhanced framework loading
  static async loadFrameworks(
    onFrameworksLoaded?: (frameworks: unknown[]) => void,
    onError?: (error: AnalysisWorkflowError) => void,
  ) {
    try {

      if (response.frameworks && Array.isArray(response.frameworks)) {
        onFrameworksLoaded?.(response.frameworks);
        return response.frameworks;
      } else {
        throw new Error("Invalid frameworks response");
      }
    } catch (__error) {
      const workflowError: AnalysisWorkflowError = {
        step: "Framework Loading",
        type: error.code === "NETWORK_ERROR" ? "network" : "api",
        message: error.message || "Failed to load accounting frameworks",
        recoverable: true,
        retryAction: () => this.loadFrameworks(onFrameworksLoaded, onError),
      };

      onError?.(workflowError);
      this.showWorkflowError(workflowError);
      throw error;
    }
  }

  // Enhanced analysis execution
  static async executeAnalysis(
    documentId: string,
    framework: string,
    standards: string[],
    specialInstructions?: string,
    onProgress?: (progress: number) => void,
    onComplete?: (results: unknown) => void,
    onError?: (error: AnalysisWorkflowError) => void,
  ) {
    try {
      onProgress?.(10);

      // Start analysis using the correct API method

      onProgress?.(30);

      // Poll for completion
      const results = await this.pollAnalysisResults(
        documentId,
        (progress) => onProgress?.(30 + progress * 0.7), // Scale progress from 30-100%
        onError,
      );

      onProgress?.(100);
      onComplete?.(results);
      return results;
    } catch (__error) {
      const workflowError: AnalysisWorkflowError = {
        step: "Compliance Analysis",
        type: error.code === "TIMEOUT" ? "timeout" : "api",
        message: error.message || "Analysis failed to complete",
        recoverable: true,
        retryAction: () =>
          this.executeAnalysis(
            documentId,
            framework,
            standards,
            specialInstructions,
            onProgress,
            onComplete,
            onError,
          ),
      };

      onError?.(workflowError);
      this.showWorkflowError(workflowError);
      throw error;
    }
  }

  // Poll analysis results with enhanced error handling
  private static async pollAnalysisResults(
    documentId: string,
    onProgress?: (progress: number) => void,
    onError?: (error: AnalysisWorkflowError) => void,
    maxAttempts: number = 60, // 5 minutes with 5-second intervals
  ) {
    let attempts = 0;

    const poll = async (): Promise<any> => {
      try {
        attempts++;
        onProgress?.((attempts / maxAttempts) * 100);

        const status = await safeApiCall(
          () => api.analysis.getStatus(documentId),
          "analysis",
          {
            timeout: 10000,
            retryConfig: { maxRetries: 2 },
          },
        );

        if (status.status === "COMPLETED") {
          // Get the final results
          const results = await api.analysis.getResults(documentId);
          return results;
        }

        if (status.status === "FAILED") {
          throw new Error(status.message || "Analysis failed");
        }

        if (attempts >= maxAttempts) {
          throw new Error("Analysis is taking longer than expected");
        }

        // Continue polling
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return poll();
      } catch (__error) {
        const workflowError: AnalysisWorkflowError = {
          step: "Analysis Results",
          type: attempts >= maxAttempts ? "timeout" : "api",
          message:
            attempts >= maxAttempts
              ? "Analysis is taking longer than expected. You can check back later or contact support."
              : error.message || "Failed to retrieve analysis results",
          recoverable: attempts < maxAttempts,
          retryAction:
            attempts < maxAttempts
              ? () =>
                  this.pollAnalysisResults(
                    documentId,
                    onProgress,
                    onError,
                    maxAttempts,
                  )
              : undefined,
        };

        onError?.(workflowError);
        this.showWorkflowError(workflowError);
        throw error;
      }
    };

    return poll();
  }

  // Export results with error handling
  static async exportResults(
    documentId: string,
    format: "pdf" | "excel" | "json" = "pdf",
    onComplete?: (blob: Blob) => void,
    onError?: (error: AnalysisWorkflowError) => void,
  ) {
    try {
      // For now, use getResults and create a simple export
      const results = await safeApiCall(
        () => api.analysis.getResults(documentId),
        "download",
        {
          timeout: 30000,
          retryConfig: { maxRetries: 2 },
        },
      );

      // Create a simple JSON export
      const exportData = JSON.stringify(results, null, 2);
      const blob = new Blob([exportData], { type: "application/json" });

      onComplete?.(blob);
      return blob;
    } catch (__error) {
      const workflowError: AnalysisWorkflowError = {
        step: "Results Export",
        type: "api",
        message: error.message || "Failed to export results",
        recoverable: true,
        retryAction: () =>
          this.exportResults(documentId, format, onComplete, onError),
      };

      onError?.(workflowError);
      this.showWorkflowError(workflowError);
      throw error;
    }
  }

  // Session recovery for browser refresh scenarios
  static async recoverSession(
    documentId: string,
    onRecovered?: (state: unknown) => void,
    onError?: (error: AnalysisWorkflowError) => void,
  ) {
    try {
      const status = await safeApiCall(
        () => api.analysis.getStatus(documentId),
        "recovery",
        {
          timeout: 10000,
          retryConfig: { maxRetries: 2 },
        },
      );

      // Reconstruct session state with available data
      const sessionState: unknown = {
        documentId,
        status: status.status,
        metadata: status.metadata,
        // Note: framework and standards info would need to be stored separately
        // or retrieved from a different endpoint if available
      };

      // If analysis is completed, get the results
      if (status.status === "COMPLETED") {
        try {
          const results = await api.analysis.getResults(documentId);
          sessionState.results = results;
        } catch (_resultError) {
          
        }
      }

      onRecovered?.(sessionState);
      return sessionState;
    } catch (__error) {
      const workflowError: AnalysisWorkflowError = {
        step: "Session Recovery",
        type: "api",
        message: "Unable to recover your session. You may need to start over.",
        recoverable: false,
      };

      onError?.(workflowError);
      this.showWorkflowError(workflowError);
      throw error;
    }
  }
}
