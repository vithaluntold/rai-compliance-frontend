"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {Textarea} from "@/components/ui/textarea";
import "../../styles/progress-glow.css";
import {
  Building,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit3,
  Save,
  X,
  Settings,
  BarChart3,
  Loader2,
  Zap,
} from "lucide-react";
import type { ChatState, ChatStep } from "./chat-interface";
import FrameworkSelectionPanel from "./FrameworkSelectionPanel";
import {KeywordExtractionDisplay} from "@/components/ui/keyword-extraction-display";
import {AccountingStandardsDisplay} from "@/components/ui/accounting-standards-display";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

// Type definitions for progress data
interface ProgressData {
  percentage?: number;
  currentStandard?: string;
  overall_progress?: {
    percentage?: number;
    current_standard?: string;
    elapsed_time_formatted?: string;
  };
  questions?: {
    completed?: number;
    total?: number;
  };
  standards_detail?: Array<{
    standard_id: string;
    status: 'completed' | 'processing' | 'pending';
    progress_percentage: number;
    completed_questions: number;
    total_questions: number;
    elapsed_time_formatted?: string;
    current_question?: string;
  }>;
}

// Type definitions for analysis results
interface ComplianceSection {
  section: string;
  title: string;
  standard: string;
  items: Array<{
    id: string;
    question: string;
    reference: string;
    status: "YES" | "NO" | "PARTIAL" | "N/A";
    confidence: number;
    explanation: string;
    evidence: string[];
    suggestion?: string;
  }>;
}

interface ComplianceResults {
  status: string;
  document_id: string;
  timestamp: string;
  completed_at?: string;
  metadata: {
    company_name: string;
    nature_of_business: string;
    operational_demographics: string;
    financial_statements_type?: string;
  };
  sections: ComplianceSection[];
  framework: string;
  standards: string[];
  specialInstructions?: string;
  extensiveSearch?: boolean;
  message: string;
}

// Type guard to check if results have compliance structure
function hasComplianceSections(results: unknown): results is ComplianceResults {
  return (
    typeof results === "object" &&
    results !== null &&
    "sections" in results &&
    Array.isArray((results as Record<string, unknown>)['sections'])
  );
}

interface Framework {
  id: string;
  name: string;
  description: string;
  standards: Standard[];
}

interface Standard {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

interface SidePanelProps {
  chatState: ChatState;
  chatSteps?: ChatStep[];
  onMetadataUpdate: (metadata: unknown) => void;
  onFrameworkSelection: (framework: string, standards: string[]) => void;
  onConfirmStep?: (stepId: string) => void;
  // Upload progress props
  uploadProgress?: number;
  isUploading?: boolean;
  uploadError?: string | null;
  // Framework selection props
  frameworks?: Framework[];
  selectedFramework?: string;
  selectedStandards?: string[];
  frameworkStep?: "framework" | "standards";
  isFrameworkLoading?: boolean;
  isFrameworkSubmitting?: boolean;
  frameworkError?: string | null;
  onFrameworkSelect?: (frameworkId: string) => void;
  onStandardToggle?: (standardId: string) => void;
  onSelectAllStandards?: () => void;
  onClearAllStandards?: () => void;
  onFrameworkContinue?: () => void;
  onFrameworkBack?: () => void;
  // Analysis mode props
  onAnalysisModeToggle?: (mode: "zap" | "comprehensive") => void;
}

export function SidePanel({
  chatState,
  chatSteps = [],
  onMetadataUpdate,
  onConfirmStep,
  // Upload progress props
  uploadProgress = 0,
  isUploading = false,
  uploadError = null,
  // Framework selection props
  frameworks = [],
  selectedFramework = "",
  selectedStandards, // Remove default fallback - require explicit standards
  frameworkStep = "framework",
  isFrameworkLoading = false,
  isFrameworkSubmitting = false,
  frameworkError = null,
  onFrameworkSelect,
  onStandardToggle,
  onSelectAllStandards,
  onClearAllStandards,
  onFrameworkContinue,
  onFrameworkBack,
}: SidePanelProps) {
  // Helper function to safely extract metadata values
  const getMetadataValue = (field: unknown): string => {
    if (!field) return "";
    if (typeof field === "string") {
      // Handle structured format: "CONFIDENCE|VALUE|SOURCE|PAGES"
      if (field.includes("|")) {
        const parts = field.split("|");
        // Return just the value part (second element)
        const extractedValue = parts[1] || parts[0] || "";
        return extractedValue.trim();
      }
      return field;
    }
    if (typeof field === "object" && field !== null && 'value' in field) {
      const value = (field as { value: unknown }).value;
      if (typeof value === "string" && value.includes("|")) {
        const parts = value.split("|");
        const extractedValue = parts[1] || parts[0] || "";
        return extractedValue.trim();
      }
      return String(value || "");
    }
    return "";
  };

  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState({
    company_name: "",
    nature_of_business: "",
    operational_demographics: "",
    financial_statements_type: "",
  });

  // Update edited metadata when chatState.documentMetadata changes
  useEffect(() => {
    if (chatState.documentMetadata) {
      setEditedMetadata({
        company_name: getMetadataValue(chatState.documentMetadata.company_name),
        nature_of_business: getMetadataValue(
          chatState.documentMetadata.nature_of_business,
        ),
        operational_demographics: getMetadataValue(
          chatState.documentMetadata.operational_demographics,
        ),
        financial_statements_type: getMetadataValue(
          chatState.documentMetadata.financial_statements_type,
        ),
      });
    }
  }, [chatState.documentMetadata]);

  const handleSaveMetadata = () => {
    onMetadataUpdate(editedMetadata);
    setIsEditingMetadata(false);
    // Also proceed to next step if we're on metadata step
    if (chatState.currentStep?.id === "metadata" && onConfirmStep) {
      onConfirmStep("metadata");
    }
  };

  const handleCancelEdit = () => {
    if (chatState.documentMetadata) {
      setEditedMetadata({
        company_name: getMetadataValue(chatState.documentMetadata.company_name),
        nature_of_business: getMetadataValue(
          chatState.documentMetadata.nature_of_business,
        ),
        operational_demographics: getMetadataValue(
          chatState.documentMetadata.operational_demographics,
        ),
        financial_statements_type: getMetadataValue(
          chatState.documentMetadata.financial_statements_type,
        ),
      });
    }
    setIsEditingMetadata(false);
  };

  // Step indicator component (moved from chat header)
  const renderStepIndicator = () => {
    if (!chatState.currentStep || !chatSteps.length) return null;

    const currentStepIndex = chatSteps.findIndex(
      (s) => s.id === chatState.currentStep?.id,
    );

    return (
      <Card className="p-4 mb-4 dark-card-no-bg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#0087d9] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Step {currentStepIndex + 1} of {chatSteps.length}
              </span>
            </div>
            <div className="px-3 py-1 bg-[#0087d9]/10 text-[#0087d9] text-sm font-medium rounded-full border border-[#0087d9]/20">
              {chatState.currentStep.name}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderProgressSteps = () => {
    const steps = [
      { id: "upload", name: "Document Upload", icon: FileText },
      { id: "metadata", name: "Metadata Confirmation", icon: Building },
      {
        id: "framework-selection",
        name: "Framework Selection",
        icon: Settings,
      },
      { id: "processing-mode", name: "Processing Mode", icon: Zap },
      { id: "analysis", name: "Compliance Analysis", icon: BarChart3 },
      { id: "results", name: "Results Review", icon: CheckCircle },
    ];

    const currentStepIndex = steps.findIndex(
      (step) => step.id === chatState.currentStep?.id,
    );

    return (
      <Card className="p-4 mb-4 bg-white dark:bg-black border-gray-200 dark:border-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#0087d9]">Analysis Progress</h3>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center space-x-3">
                <motion.div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative progress-step-transition ${
                    isCompleted
                      ? "bg-green-500 text-white completed-step"
                      : isActive
                        ? "bg-[#0087d9] text-white step-icon-glow"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 pending-step"
                  }`}
                  animate={
                    isActive && !isCompleted
                      ? {
                          boxShadow: [
                            "0 0 0 0 rgba(0, 135, 217, 0.4)",
                            "0 0 0 8px rgba(0, 135, 217, 0)",
                            "0 0 0 0 rgba(0, 135, 217, 0.4)",
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    filter: isActive && !isCompleted ? "drop-shadow(0 0 8px rgba(0, 135, 217, 0.6))" : "none",
                  }}
                >
                  {/* Additional inner glow for extra effect */}
                  {isActive && !isCompleted && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#0087d9]"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                  <div className="relative z-10">
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : isActive && step.id === "upload" && isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                </motion.div>
                <div className="flex-1">
                  <div
                    className={`text-sm font-medium ${
                      isCompleted
                        ? "text-green-700 dark:text-green-400"
                        : isActive
                          ? "text-[#0087d9] dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.name}
                  </div>
                  {/* Upload Progress Display */}
                  {step.id === "upload" && isActive && isUploading && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-500">
                        Uploading... {uploadProgress}%
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {/* Keyword Extraction Display */}
                  {step.id === "upload" &&
                    isActive &&
                    (isUploading ||
                      chatState.keywordExtractionStatus.isExtracting) && (
                      <KeywordExtractionDisplay
                        keywords={
                          chatState.keywordExtractionStatus.discoveredKeywords
                        }
                        currentKeyword={
                          chatState.keywordExtractionStatus.currentKeyword
                        }
                        step={chatState.keywordExtractionStatus.extractionStep}
                        isExtracting={
                          chatState.keywordExtractionStatus.isExtracting
                        }
                      />
                    )}

                  {/* Upload Error Display */}
                  {step.id === "upload" && uploadError && (
                    <div className="mt-1 text-xs text-red-500 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                  {/* General Progress Indicator */}
                  {isActive &&
                    chatState.isProcessing &&
                    step.id !== "upload" && (
                      <div className="text-xs text-gray-500 mt-1">
                        In Progress...
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  const renderDocumentInfo = () => {
    if (!chatState.documentId) return null;

    return (
      <Card className="p-4 mb-4 bg-white dark:bg-black border-gray-200 dark:border-white">
        <h3 className="font-semibold mb-3 text-[#0087d9]">
          Document Information
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">File:</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {chatState.fileName}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="border text-xs break-all">
              ID: {chatState.documentId}
            </Badge>
          </div>
        </div>
      </Card>
    );
  };

  const renderMetadataSection = () => {
    // Always show metadata section if we're on metadata step or have metadata
    const shouldShowMetadata = chatState.currentStep?.id === "metadata" || 
                               chatState.documentMetadata || 
                               isEditingMetadata;
    
    if (!shouldShowMetadata) return null;

    return (
      <Card className="p-4 mb-4 bg-white dark:bg-black border-gray-200 dark:border-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#0087d9]">Company Information</h3>
          {!isEditingMetadata && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsEditingMetadata(true)}
              title="Edit company information"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>

        {isEditingMetadata ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="company_name" className="text-sm font-medium">
                Company Name
              </Label>
              <Input
                id="company_name"
                value={editedMetadata.company_name}
                onChange={(e) =>
                  setEditedMetadata((prev) => ({
                    ...prev,
                    company_name: e.target.value,
                  }))
                }
                placeholder="Enter company name"
                className="mt-1"
              />
            </div>

            <div>
              <Label
                htmlFor="nature_of_business"
                className="text-sm font-medium"
              >
                Nature of Business
              </Label>
              <Textarea
                id="nature_of_business"
                value={editedMetadata.nature_of_business}
                onChange={(e) =>
                  setEditedMetadata((prev) => ({
                    ...prev,
                    nature_of_business: e.target.value,
                  }))
                }
                placeholder="Describe the nature of business"
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label
                htmlFor="operational_demographics"
                className="text-sm font-medium"
              >
                Geography of Operations
              </Label>
              <Textarea
                id="operational_demographics"
                value={editedMetadata.operational_demographics}
                onChange={(e) =>
                  setEditedMetadata((prev) => ({
                    ...prev,
                    operational_demographics: e.target.value,
                  }))
                }
                placeholder="Describe geographical operations"
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label
                htmlFor="financial_statements_type"
                className="text-sm font-medium"
              >
                Nature of Statement
              </Label>
              <Input
                id="financial_statements_type"
                value={editedMetadata.financial_statements_type}
                onChange={(e) =>
                  setEditedMetadata((prev) => ({
                    ...prev,
                    financial_statements_type: e.target.value,
                  }))
                }
                placeholder="Type of financial statement"
                className="mt-1"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <Button
                onClick={handleSaveMetadata}
                className="h-8 px-2 bg-[#0087d9] hover:bg-blue-700"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button onClick={handleCancelEdit} className="border h-8 px-2">
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {!chatState.documentMetadata || Object.values(chatState.documentMetadata).every(val => !getMetadataValue(val)) ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No company information available yet.</p>
                <p className="text-xs mt-1">Click &ldquo;Edit&rdquo; above to add company details manually.</p>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Name:
                  </span>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {getMetadataValue(chatState.documentMetadata?.company_name) ||
                      "Not available"}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nature of Business:
                  </span>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {getMetadataValue(
                      chatState.documentMetadata?.nature_of_business,
                    ) || "Not available"}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Geography of Operations:
                  </span>
                  <div className="text-sm text-gray-600 mt-1">
                    {getMetadataValue(
                      chatState.documentMetadata?.operational_demographics,
                    ) || "Not specified"}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Nature of Statement:
                  </span>
                  <div className="text-sm text-gray-600 mt-1">
                    {getMetadataValue(
                      chatState.documentMetadata?.financial_statements_type,
                    ) || "Not specified"}
                  </div>
                </div>

                {/* Confirm button for metadata step */}
                {chatState.currentStep?.id === "metadata" && onConfirmStep && (
                  <div className="pt-3">
                    <Button
                      onClick={() => onConfirmStep("metadata")}
                      className="h-8 px-2 bg-[#0087d9] hover:bg-blue-700 w-full"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirm & Proceed to Next Step
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Card>
    );
  };

  const renderFrameworkSelection = () => {
    // Show framework selection panel when on framework-selection step OR analysis step
    // This keeps the framework visible during processing
    if (chatState.currentStep?.id === "framework-selection" || 
        chatState.currentStep?.id === "processing-mode" ||
        chatState.currentStep?.id === "analysis") {
      return (
        <div className="mb-4">
          <FrameworkSelectionPanel
            frameworks={frameworks || []}
            selectedFramework={selectedFramework || ""}
            selectedStandards={selectedStandards || []}
            isLoading={isFrameworkLoading || false}
            isSubmitting={isFrameworkSubmitting || false}
            error={frameworkError || null}
            step={frameworkStep || "framework"}
            onFrameworkSelect={onFrameworkSelect || (() => {})}
            onStandardToggle={onStandardToggle || (() => {})}
            onSelectAll={onSelectAllStandards || (() => {})}
            onClearAll={onClearAllStandards || (() => {})}
            onContinue={onFrameworkContinue || (() => {})}
            onBack={onFrameworkBack || (() => {})}
            // Disable editing during analysis
            disabled={chatState.currentStep?.id === "analysis"}
          />
        </div>
      );
    }

    return null;
  };

  const renderAccountingStandardsInfo = () => {
    // Show accounting standards information when framework is selected
    if (chatState.selectedFramework && chatState.selectedStandards.length > 0) {
      return (
        <div className="mb-4">
          <AccountingStandardsDisplay
            selectedFramework={chatState.selectedFramework}
            aiSuggestedStandards={chatState.aiSuggestedStandards || []}
            userSelectedStandards={chatState.selectedStandards}
            frameworks={frameworks}
            compact={true}
          />
        </div>
      );
    }
    return null;
  };

  const renderSpecialInstructions = () => {
    // Special instructions are now handled in the main chat interface
    // No need for separate sidebar panel
    return null;
  };

  const renderAnalysisProgress = () => {
    if (!chatState.isProcessing || !chatState.selectedStandards.length)
      return null;

    // Get progress data from chat state if available
    const progressData = chatState.currentProgress as ProgressData | undefined;

    return (
      <Card className="p-4 mb-4 bg-white dark:bg-black border-gray-200 dark:border-white">
        <h3 className="font-semibold mb-3 text-[#0087d9]">Analysis Progress</h3>

        {progressData && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {progressData.overall_progress?.elapsed_time_formatted || "0s"}
              </span>
            </div>
            <Progress
              value={
                progressData.overall_progress?.percentage ||
                progressData.percentage ||
                0
              }
              className="h-2 mb-2"
            />
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {progressData.questions?.completed || 0} /{" "}
              {progressData.questions?.total || 0} questions answered
            </div>
            {(progressData.overall_progress?.current_standard ||
              progressData.currentStandard) && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Currently processing:{" "}
                {progressData.overall_progress?.current_standard ||
                  progressData.currentStandard}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {chatState.selectedStandards.map((standard) => {
            // Find detailed progress for this standard
            const standardProgress = progressData?.standards_detail?.find(
              (s) => s.standard_id === standard
            );

            const isCompleted = standardProgress?.status === "completed";
            const isProcessing = standardProgress?.status === "processing";
            const progressPercentage = standardProgress?.progress_percentage || 0;
            const questionInfo = standardProgress
              ? `${standardProgress.completed_questions}/${standardProgress.total_questions}`
              : "Preparing...";

            return (
              <motion.div 
                key={standard}
                className={`${isProcessing ? 'p-3 rounded-lg standard-processing-glow' : ''}`}
                animate={
                  isProcessing
                    ? {
                        backgroundColor: [
                          "rgba(0, 135, 217, 0.05)",
                          "rgba(0, 135, 217, 0.1)",
                          "rgba(0, 135, 217, 0.05)",
                        ],
                        boxShadow: [
                          "0 0 0 0 rgba(0, 135, 217, 0.2)",
                          "0 0 8px 2px rgba(0, 135, 217, 0.1)",
                          "0 0 0 0 rgba(0, 135, 217, 0.2)",
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{standard}</span>
                  <div className="flex items-center space-x-2">
                    {standardProgress?.elapsed_time_formatted && (
                      <span className="text-xs text-gray-500">
                        {standardProgress.elapsed_time_formatted}
                      </span>
                    )}
                    <motion.span
                      className={`text-xs px-2 py-1 rounded ${
                        isCompleted
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : isProcessing
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                      animate={
                        isProcessing
                          ? {
                              scale: [1, 1.05, 1],
                            }
                          : {}
                      }
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {isCompleted
                        ? "Completed"
                        : isProcessing
                          ? `${progressPercentage.toFixed(0)}%`
                          : "Pending"}
                    </motion.span>
                  </div>
                </div>
                <Progress value={progressPercentage} className="h-2 mb-1" />
                <div className="text-xs text-gray-500">
                  {questionInfo} questions
                  {standardProgress?.current_question && isProcessing && (
                    <motion.div 
                      className="mt-1 text-blue-600 dark:text-blue-400 truncate current-question-pulse"
                      animate={{
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {standardProgress.current_question}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-gray-500">
          This may take a few minutes depending on document complexity.
        </div>
      </Card>
    );
  };

  const renderResultsSummary = () => {
    if (!chatState.analysisResults) return null;

    // Type guard and assertion
    if (!hasComplianceSections(chatState.analysisResults)) return null;
    
    const results = chatState.analysisResults as ComplianceResults;
    const totalItems = results.sections?.reduce(
        (total: number, section: ComplianceSection) => total + (section.items?.length || 0),
        0,
      ) || 0;

    const compliantItems = results.sections?.reduce(
        (total: number, section: ComplianceSection) =>
          total +
          (section.items?.filter((item) => item.status === "YES").length ||
            0),
        0,
      ) || 0;

    const nonCompliantItems = results.sections?.reduce(
        (total: number, section: ComplianceSection) =>
          total +
          (section.items?.filter((item) => item.status === "NO").length ||
            0),
        0,
      ) || 0;

    const compliancePercentage = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;

    return (
      <Card className="p-4 mb-4 bg-white dark:bg-black border-gray-200 dark:border-white">
        <h3 className="font-semibold mb-3 text-[#0087d9]">Results Summary</h3>

        <div className="space-y-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#0087d9] mb-1">
              {compliancePercentage}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Overall Compliance
            </div>
          </div>

          <Progress value={compliancePercentage} className="h-3" />

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {compliantItems}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Yes</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {nonCompliantItems}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">No</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                {totalItems}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ x: 384, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 384, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed right-0 top-0 h-full w-[26rem] code-panel border-l border-gray-200 dark:border-white overflow-y-auto z-50"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#0087d9] dark:text-white">
            Analysis Panel
          </h2>
        </div>

        {renderStepIndicator()}
        {renderProgressSteps()}
        {renderDocumentInfo()}
        {renderMetadataSection()}
        {renderFrameworkSelection()}
        {renderAccountingStandardsInfo()}
        {renderSpecialInstructions()}
        {renderAnalysisProgress()}
        {renderResultsSummary()}
      </div>
    </motion.div>
  );
}
