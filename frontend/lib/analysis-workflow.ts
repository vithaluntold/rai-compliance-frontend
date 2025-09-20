import {safeApiCall} from "@/lib/error-handling";
import {toast} from "@/hooks/use-toast";
import {api} from "@/lib/api";

export interface AnalysisWorkflowError {
  step: string;
  type: "network" | "api" | "validation" | "timeout" | "unknown";
  message: string;
  recoverable: boolean;
  retryAction?: (() => void | Promise<unknown>) | undefined;
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
    file: unknown,
    onProgress?: (progress: number) => void,
    onSuccess?: (documentId: string) => void,
    onError?: (error: Error | unknown) => void,
  ): Promise<string | void> {
    try {
      onProgress?.(10);

      const response = await safeApiCall(
        () => api.analysis.uploadDocument(file as File),
        "upload",
        {
          timeout: 30000,
          retryConfig: { maxRetries: 2 },
        },
      );

      onProgress?.(100);

      if (response && typeof response === 'object' && 'document_id' in response) {
        onSuccess?.(response.document_id as string);
        return response.document_id as string;
      } else {
        throw new Error("Upload completed but no document ID returned");
      }
    } catch (error: unknown) {
      const workflowError: AnalysisWorkflowError = {
        step: "Document Upload",
        type: error && typeof error === 'object' && 'code' in error && error.code === "NETWORK_ERROR" ? "network" : "api",
        message: error && typeof error === 'object' && 'message' in error ? String(error.message) : "Failed to upload document",
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
    onError?: (error: Error | unknown) => void,
    maxAttempts: number = 30,
  ) {
    let attempts = 0;

    const poll = async (): Promise<unknown> => {
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
      } catch (error: unknown) {
        const workflowError: AnalysisWorkflowError = {
          step: "Metadata Extraction",
          type: attempts >= maxAttempts ? "timeout" : "api",
          message:
            attempts >= maxAttempts
              ? "Metadata extraction is taking longer than expected. You can proceed manually."
              : error && typeof error === 'object' && 'message' in error ? String(error.message) : "Failed to extract metadata",
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
    onError?: (error: Error | unknown) => void,
  ) {
    try {
      const response = await safeApiCall(
        () => api.analysis.getFrameworks(),
        "frameworks",
        {
          timeout: 10000,
          retryConfig: { maxRetries: 2 },
        },
      );

      if (response && typeof response === 'object' && 'frameworks' in response && Array.isArray(response.frameworks)) {
        onFrameworksLoaded?.(response.frameworks);
        return response.frameworks;
      } else {
        throw new Error("Invalid frameworks response");
      }
    } catch (error: unknown) {
      const workflowError: AnalysisWorkflowError = {
        step: "Framework Loading",
        type: "api",
        message: "Failed to load accounting frameworks",
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
    onError?: (error: Error | unknown) => void,
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
    } catch (error: unknown) {
      const workflowError: AnalysisWorkflowError = {
        step: "Compliance Analysis",
        type: "api",
        message: "Analysis failed to complete",
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
    onError?: (error: Error | unknown) => void,
    maxAttempts: number = 60, // 5 minutes with 5-second intervals
  ) {
    let attempts = 0;

    const poll = async (): Promise<unknown> => {
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
      } catch (error: unknown) {
        const workflowError: AnalysisWorkflowError = {
          step: "Analysis Results",
          type: attempts >= maxAttempts ? "timeout" : "api",
          message:
            attempts >= maxAttempts
              ? "Analysis is taking longer than expected. You can check back later or contact support."
              : "Failed to retrieve analysis results",
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
    onError?: (error: Error | unknown) => void,
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
    } catch (error: unknown) {
      const workflowError: AnalysisWorkflowError = {
        step: "Results Export",
        type: "api",
        message: "Failed to export results",
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
    onError?: (error: Error | unknown) => void,
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
      const sessionState: {
        documentId: string;
        status: unknown;
        metadata: unknown;
        results?: unknown;
      } = {
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
        } catch {
          
        }
      }

      onRecovered?.(sessionState);
      return sessionState;
    } catch (error: unknown) {
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
