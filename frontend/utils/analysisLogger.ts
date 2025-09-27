/**
 * Comprehensive Analysis Pipeline Logger
 * Tracks every step from file upload to analysis initiation
 * Designed to identify bottlenecks and failures in production (Render)
 */

export interface PipelineStep {
  step: string;
  status: 'started' | 'completed' | 'failed' | 'skipped';
  timestamp: string;
  duration?: number;
  data?: Record<string, unknown>;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface AnalysisPipelineLog {
  sessionId: string;
  documentId?: string;
  fileName?: string;
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  currentStep: string;
  overallStatus: 'in_progress' | 'completed' | 'failed' | 'stalled';
  steps: PipelineStep[];
  criticalErrors: string[];
  warnings: string[];
  metadata: {
    userAgent?: string;
    environment: 'development' | 'production';
    renderInstance?: string;
    apiEndpoint?: string;
  };
}

class AnalysisPipelineLogger {
  private log: AnalysisPipelineLog;
  private stepStartTimes: Map<string, number> = new Map();

  constructor(sessionId: string) {
    this.log = {
      sessionId,
      startTime: new Date().toISOString(),
      currentStep: 'initialization',
      overallStatus: 'in_progress',
      steps: [],
      criticalErrors: [],
      warnings: [],
      metadata: {
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        renderInstance: process.env['RENDER_INSTANCE_ID'] || 'local',
        apiEndpoint: process.env['NEXT_PUBLIC_API_URL'] || 'localhost'
      }
    };
  }

  // STEP 1: File Upload Pipeline
  startFileUpload(fileName: string, fileSize: number) {
    this.logStep('file_upload_start', 'started', {
      fileName,
      fileSize,
      fileSizeMB: (fileSize / 1024 / 1024).toFixed(2)
    });
  }

  fileUploadProgress(progress: number) {
    this.updateCurrentStep('file_upload_progress', {
      progress: `${progress}%`,
      timestamp: new Date().toISOString()
    });
  }

  fileUploadCompleted(uploadResponse: Record<string, unknown> | null) {
    this.logStep('file_upload_completed', 'completed', {
      hasResponse: !!uploadResponse,
      responseType: typeof uploadResponse,
      documentId: uploadResponse?.['document_id'] || 'missing',
      responseStatus: uploadResponse?.['status'] || 'unknown',
      responseKeys: uploadResponse ? Object.keys(uploadResponse) : []
    });
    
    if (uploadResponse?.['document_id']) {
      this.log.documentId = String(uploadResponse['document_id']);
    } else {
      this.addCriticalError('No document_id received from upload response');
    }
  }

  fileUploadFailed(error: Error | Record<string, unknown> | null) {
    this.logStep('file_upload_failed', 'failed', {
      error: error instanceof Error ? error.message : 'Unknown upload error',
      errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
      statusCode: (error as Record<string, unknown>)?.['response'],
      errorDetails: (error as Record<string, unknown>)?.['response']
    });
    this.addCriticalError(`File upload failed: ${error?.message || 'Unknown error'}`);
  }

  // STEP 2: Metadata Extraction Pipeline
  startMetadataExtraction(documentId: string) {
    this.logStep('metadata_extraction_start', 'started', {
      documentId,
      extractionType: 'enhanced_ai'
    });
    this.log.currentStep = 'metadata_extraction';
  }

  metadataPollingAttempt(attempt: number, response: Record<string, unknown> | null) {
    this.updateCurrentStep('metadata_polling', {
      attempt,
      hasMetadata: !!(response as Record<string, unknown>)?.['metadata'],
      metadataKeys: (response as Record<string, unknown>)?.['metadata'] ? Object.keys((response as Record<string, unknown>)['metadata'] as Record<string, unknown>) : [],
      extractionStatus: response?.['metadata_extraction'] || 'unknown',
      overallStatus: response?.['status'] || 'unknown',
      companyName: ((response as Record<string, unknown>)?.['metadata'] as Record<string, unknown>)?.['company_name'] || 'not_found'
    });
  }

  metadataExtractionCompleted(metadata: Record<string, unknown> | null) {
    this.logStep('metadata_extraction_completed', 'completed', {
      hasCompanyName: !!(metadata as Record<string, unknown>)?.['company_name'],
      hasBusinessNature: !!(metadata as Record<string, unknown>)?.['nature_of_business'],
      hasDemographics: !!(metadata as Record<string, unknown>)?.['operational_demographics'],
      hasFinancialType: !!(metadata as Record<string, unknown>)?.['financial_statements_type'],
      extractedFields: metadata ? Object.keys(metadata).filter(key => (metadata as Record<string, unknown>)[key]) : []
    });
  }

  metadataExtractionTimeout(attempts: number) {
    this.logStep('metadata_extraction_timeout', 'failed', {
      totalAttempts: attempts,
      timeoutAfterSeconds: attempts * 2
    });
    this.addCriticalError(`Metadata extraction timeout after ${attempts} attempts`);
  }

  metadataExtractionFailed(error: Error | Record<string, unknown> | null) {
    this.logStep('metadata_extraction_failed', 'failed', {
      error: error instanceof Error ? error.message : 'Unknown metadata error',
      errorType: error instanceof Error ? error.constructor.name : 'UnknownError'
    });
    this.addCriticalError(`Metadata extraction failed: ${error?.message || 'Unknown error'}`);
  }

  // STEP 3: Framework Selection Pipeline
  startFrameworkLoading() {
    this.logStep('framework_loading_start', 'started');
    this.log.currentStep = 'framework_selection';
  }

  frameworksLoaded(frameworks: Record<string, unknown>[]) {
    this.logStep('frameworks_loaded', 'completed', {
      frameworkCount: frameworks?.length || 0,
      availableFrameworks: frameworks?.map(f => (f as Record<string, unknown>)['id'] || (f as Record<string, unknown>)['name']) || []
    });
  }

  frameworkSelected(frameworkId: string) {
    this.logStep('framework_selected', 'completed', {
      selectedFramework: frameworkId
    });
  }

  aiSuggestionsStarted(frameworkId: string, metadata: Record<string, unknown> | null) {
    this.logStep('ai_suggestions_start', 'started', {
      framework: frameworkId,
      hasMetadata: !!metadata,
      companyName: (metadata as Record<string, unknown>)?.['company_name'] || 'unknown'
    });
  }

  aiSuggestionsCompleted(suggestions: Record<string, unknown>[]) {
    this.logStep('ai_suggestions_completed', 'completed', {
      suggestionCount: suggestions?.length || 0,
      suggestedStandards: suggestions?.map(s => (s as Record<string, unknown>)['standard_id']) || []
    });
  }

  aiSuggestionsFailed(error: Error | Record<string, unknown> | null) {
    this.logStep('ai_suggestions_failed', 'failed', {
      error: error instanceof Error ? error.message : 'AI suggestions failed',
      errorType: error instanceof Error ? error.constructor.name : 'UnknownError'
    });
    this.addWarning(`AI suggestions failed: ${error?.message || 'Unknown error'}`);
  }

  standardsSelected(standards: string[]) {
    this.logStep('standards_selected', 'completed', {
      standardCount: standards?.length || 0,
      selectedStandards: standards || []
    });
  }

  // STEP 4: Custom Instructions Pipeline
  customInstructionsStep() {
    this.logStep('custom_instructions_step', 'started');
    this.log.currentStep = 'custom_instructions';
  }

  customInstructionsSubmitted(instructions: string) {
    this.logStep('custom_instructions_submitted', 'completed', {
      hasInstructions: !!instructions.trim(),
      instructionLength: instructions.length,
      instructionPreview: instructions.substring(0, 100)
    });
  }

  // STEP 5: Analysis Initiation Pipeline (CRITICAL STEP)
  analysisInitiationStarted(documentId: string, framework: string, standards: string[]) {
    this.logStep('analysis_initiation_start', 'started', {
      documentId,
      framework,
      standardCount: standards?.length || 0,
      standards: standards || []
    });
    this.log.currentStep = 'analysis_initiation';
  }

  analysisParameterValidation(validation: {
    hasDocumentId: boolean;
    hasFramework: boolean;
    hasStandards: boolean;
    documentId?: string;
    framework?: string;
    standardCount: number;
  }) {
    this.logStep('analysis_parameter_validation', 
      validation.hasDocumentId && validation.hasFramework && validation.hasStandards ? 'completed' : 'failed',
      validation
    );

    if (!validation.hasDocumentId) {
      this.addCriticalError('Missing document ID for analysis initiation');
    }
    if (!validation.hasFramework) {
      this.addCriticalError('Missing framework selection for analysis initiation');
    }
    if (!validation.hasStandards) {
      this.addCriticalError('Missing standards selection for analysis initiation');
    }
  }

  analysisApiCallStarted(requestData: Record<string, unknown> | null) {
    this.logStep('analysis_api_call_start', 'started', {
      apiEndpoint: '/api/analysis/select-framework',
      requestData: {
        framework: (requestData as Record<string, unknown>)?.['framework'] || 'missing',
        standardCount: ((requestData as Record<string, unknown>)?.['standards'] as unknown[])?.length || 0,
        hasInstructions: !!(requestData as Record<string, unknown>)?.['specialInstructions'],
        processingMode: (requestData as Record<string, unknown>)?.['processingMode'] || 'unknown'
      }
    });
  }

  analysisApiCallCompleted(response: Record<string, unknown> | null) {
    this.logStep('analysis_api_call_completed', 'completed', {
      hasResponse: !!response,
      responseType: typeof response,
      responseKeys: response ? Object.keys(response) : []
    });
  }

  analysisApiCallFailed(error: Error | Record<string, unknown> | null) {
    this.logStep('analysis_api_call_failed', 'failed', {
      error: error instanceof Error ? error.message : 'Analysis API call failed',
      errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
      statusCode: (error as Record<string, unknown>)?.['response'],
      errorDetails: (error as Record<string, unknown>)?.['response'],
      apiEndpoint: (error as Record<string, unknown>)?.['config'] || 'unknown'
    });
    this.addCriticalError(`Analysis API call failed: ${error?.message || 'Unknown error'}`);
  }

  // STEP 6: Analysis Progress Pipeline
  analysisProgressPollingStarted() {
    this.logStep('analysis_progress_polling_start', 'started');
    this.log.currentStep = 'analysis_progress';
  }

  analysisProgressUpdate(progressData: Record<string, unknown> | null) {
    this.updateCurrentStep('analysis_progress_update', {
      status: (progressData as Record<string, unknown>)?.['status'] || 'unknown',
      percentage: (progressData as Record<string, unknown>)?.['percentage'] || 0,
      currentStandard: (progressData as Record<string, unknown>)?.['current_standard'] || 'unknown',
      timestamp: new Date().toISOString()
    });
  }

  analysisCompleted() {
    this.logStep('analysis_completed', 'completed');
    this.log.currentStep = 'completed';
    this.log.overallStatus = 'completed';
    this.log.endTime = new Date().toISOString();
    this.calculateTotalDuration();
  }

  analysisFailed(error: Error | Record<string, unknown> | null) {
    this.logStep('analysis_failed', 'failed', {
      error: error instanceof Error ? error.message : 'Analysis failed',
      errorType: error instanceof Error ? error.constructor.name : 'UnknownError'
    });
    this.addCriticalError(`Analysis failed: ${error?.message || 'Unknown error'}`);
    this.log.overallStatus = 'failed';
  }

  // Utility Methods
  private logStep(stepName: string, status: PipelineStep['status'], data?: Record<string, unknown>) {
    const now = Date.now();
    const step: PipelineStep = {
      step: stepName,
      status,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
      metadata: {
        memoryUsage: this.getMemoryUsage(),
        activeTimers: this.getActiveTimers()
      }
    };

    // Calculate duration if step was started
    if (status === 'completed' || status === 'failed') {
      const startTime = this.stepStartTimes.get(stepName);
      if (startTime) {
        step.duration = now - startTime;
        this.stepStartTimes.delete(stepName);
      }
    } else if (status === 'started') {
      this.stepStartTimes.set(stepName, now);
    }

    this.log.steps.push(step);
    this.log.currentStep = stepName;

    // Auto-send critical logs in production
    if (status === 'failed' || this.log.criticalErrors.length > 0) {
      this.sendLogToRender();
    }
  }

  private updateCurrentStep(stepName: string, data: Record<string, unknown>) {
    // Update the last step if it's the same step, otherwise create new
    const lastStep = this.log.steps[this.log.steps.length - 1];
    if (lastStep && lastStep.step === stepName) {
      lastStep.data = { ...lastStep.data, ...data };
      lastStep.timestamp = new Date().toISOString();
    } else {
      this.logStep(stepName, 'started', data);
    }
  }

  private addCriticalError(error: string) {
    this.log.criticalErrors.push(`[${new Date().toISOString()}] ${error}`);
    // Log critical error for debugging
    if (typeof window !== 'undefined' && window.console) {
      window.console.error(`🚨 CRITICAL: ${error}`);
    }
  }

  private addWarning(warning: string) {
    this.log.warnings.push(`[${new Date().toISOString()}] ${warning}`);
    // Log warning for debugging
    if (typeof window !== 'undefined' && window.console) {
      window.console.warn(`⚠️ WARNING: ${warning}`);
    }
  }

  private calculateTotalDuration() {
    if (this.log.startTime && this.log.endTime) {
      const start = new Date(this.log.startTime).getTime();
      const end = new Date(this.log.endTime).getTime();
      this.log.totalDuration = end - start;
    }
  }

  private getMemoryUsage() {
    try {
      if (typeof window !== 'undefined' && 'memory' in performance) {
        const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  private getActiveTimers() {
    try {
      // This is a rough estimate - in production you might want more sophisticated tracking
      return typeof window !== 'undefined' ? 'client' : 'server';
    } catch {
      return 'unknown';
    }
  }

  // Export/Send Methods
  getFullLog(): AnalysisPipelineLog {
    return { ...this.log };
  }

  getLogSummary() {
    return {
      sessionId: this.log.sessionId,
      documentId: this.log.documentId,
      currentStep: this.log.currentStep,
      overallStatus: this.log.overallStatus,
      criticalErrors: this.log.criticalErrors,
      warnings: this.log.warnings,
      totalSteps: this.log.steps.length,
      completedSteps: this.log.steps.filter(s => s.status === 'completed').length,
      failedSteps: this.log.steps.filter(s => s.status === 'failed').length,
      duration: this.log.totalDuration
    };
  }

  // Send logs to Render/production logging system
  private async sendLogToRender() {
    try {
      // Only send in production and if there are critical errors
      if (this.log.metadata.environment === 'production' && this.log.criticalErrors.length > 0) {
        const logData = {
          ...this.getLogSummary(),
          renderInstance: this.log.metadata.renderInstance,
          timestamp: new Date().toISOString(),
          logLevel: 'CRITICAL'
        };

        // Send to your logging service (replace with actual endpoint)
        await fetch('/api/logs/analysis-pipeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });

        // Log sent successfully to Render
        if (typeof window !== 'undefined' && window.console) {
          window.console.error('🚨 RENDER LOG SENT:', logData);
        }
      }
    } catch (error) {
      // Failed to send log to Render
      if (typeof window !== 'undefined' && window.console) {
        window.console.error('Failed to send log to Render:', error);
      }
    }
  }

  // Manual log export for debugging
  exportLogForDebugging() {
    const logString = JSON.stringify(this.getFullLog(), null, 2);
    // Export full log for debugging
    if (typeof window !== 'undefined' && window.console) {
      window.console.group('📊 ANALYSIS PIPELINE LOG - FULL EXPORT');
      window.console.log(logString);
      window.console.groupEnd();
    }
    
    // Also create downloadable file in browser
    if (typeof window !== 'undefined') {
      const blob = new Blob([logString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-pipeline-${this.log.sessionId}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // Diagnostic methods for common issues
  diagnoseIssues(): string[] {
    const issues: string[] = [];

    // Check for missing document ID
    if (!this.log.documentId) {
      issues.push('CRITICAL: No document ID found - upload may have failed');
    }

    // Check for stalled metadata extraction
    const metadataSteps = this.log.steps.filter(s => s.step.includes('metadata'));
    const hasMetadataTimeout = metadataSteps.some(s => s.step === 'metadata_extraction_timeout');
    if (hasMetadataTimeout) {
      issues.push('CRITICAL: Metadata extraction timed out - backend processing stuck');
    }

    // Check for missing framework selection
    const hasFrameworkSelection = this.log.steps.some(s => s.step === 'framework_selected');
    if (!hasFrameworkSelection) {
      issues.push('WARNING: No framework selected - user may be stuck on framework step');
    }

    // Check for analysis API failures
    const analysisApiFailure = this.log.steps.find(s => s.step === 'analysis_api_call_failed');
    if (analysisApiFailure) {
      issues.push(`CRITICAL: Analysis API failed - ${(analysisApiFailure.data as Record<string, unknown>)?.['error'] || 'Unknown error'}`);
    }

    // Check for long duration without progress
    if (this.log.totalDuration && this.log.totalDuration > 300000) { // 5 minutes
      issues.push('WARNING: Process taking longer than expected - possible performance issue');
    }

    return issues;
  }
}

export default AnalysisPipelineLogger;