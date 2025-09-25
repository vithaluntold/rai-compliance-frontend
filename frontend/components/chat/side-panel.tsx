"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Progress} from "@/components/ui/progress";
import {Textarea} from "@/components/ui/textarea";
import {Collapsible, CollapsibleContent} from "@/components/ui/collapsible";
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
  ChevronRight,
  ChevronDown,
  Activity,
  Cpu,
  Database,
  Monitor,
  Target,
  Shield,
  AlertTriangle,
  Clock,
} from "lucide-react";
import type { ChatState, ChatStep } from "./chat-interface";
import FrameworkSelectionPanel from "./FrameworkSelectionPanel";
import {KeywordExtractionDisplay} from "@/components/ui/keyword-extraction-display";
import {AccountingStandardsDisplay} from "@/components/ui/accounting-standards-display";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTheme } from "@/context/theme-context";

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
  circuit_breaker?: {
    status: 'closed' | 'open' | 'half-open';
    failure_count: number;
    last_failure_time?: string;
    retry_after_seconds?: number;
  };
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
  onCustomInstructionsChange?: (instructions: string) => void;
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
  onCustomInstructionsChange,
}: SidePanelProps) {
  // Connect to global theme context (theme automatically applied to document)
  useTheme();
  
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

  // Circuit panel collapsible state management
  const [collapsedSections, setCollapsedSections] = useState({
    progress: false,    // Progress steps - always visible
    document: false,    // Document info - always visible
    metadata: false,    // Company metadata - always visible
    framework: true,    // Framework selection - collapsed by default
    analysis: false,    // Analysis progress - always visible
    results: false,     // Results summary - always visible
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  // Circuit Board Style Components
  const CircuitCard = ({ 
    title, 
    icon: Icon, 
    children, 
    collapsible = false, 
    sectionKey, 
    className = "",
    variant = "default" 
  }: { 
    title: string; 
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    children: React.ReactNode; 
    collapsible?: boolean; 
    sectionKey?: keyof typeof collapsedSections;
    className?: string;
    variant?: "default" | "active" | "completed" | "processing";
  }) => {
    const isCollapsed = sectionKey ? collapsedSections[sectionKey] : false;
    
    const variantStyles = {
      default: "bg-white dark:bg-black border-blue-200 dark:border-blue-700",
      active: "bg-white dark:bg-black border-blue-200 dark:border-blue-700 shadow-lg shadow-blue-500/10",
      completed: "bg-white dark:bg-black border-blue-200 dark:border-blue-700 shadow-lg shadow-blue-500/10",
      processing: "bg-white dark:bg-black border-blue-200 dark:border-blue-700 shadow-lg shadow-blue-500/10"
    };

    const CardContent = () => (
      <div className={`relative ${variantStyles[variant]} border rounded-lg overflow-hidden ${className}`}>
        {/* Circuit board traces */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id={`circuit-${title}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 5 10 L 5 5 L 15 5 L 15 15 L 10 15 L 10 20" stroke="#0087d9" strokeWidth="0.5" fill="none" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#circuit-${title})`} />
          </svg>
        </div>

        {/* Header */}
        <div className={`relative z-10 ${collapsible ? 'cursor-pointer' : ''}`} onClick={collapsible && sectionKey ? () => toggleSection(sectionKey) : undefined}>
          <div className="flex items-center justify-between p-3 border-b border-blue-200 dark:border-blue-700 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded-md bg-[#0087d9]/10 border border-[#0087d9]/20">
                <Icon className="w-4 h-4 text-[#0087d9]" />
              </div>
              <span className="font-semibold text-[#0087d9] dark:text-blue-400">{title}</span>
              {variant === "processing" && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                </div>
              )}
            </div>
            
            {collapsible && (
              <Button variant="ghost" size="sm" className="p-1 h-auto hover:bg-[#0087d9]/10">
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-[#0087d9]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#0087d9]" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {collapsible && sectionKey ? (
          <Collapsible open={!isCollapsed}>
            <CollapsibleContent>
              <div className="relative z-10 p-3 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                {children}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="relative z-10 p-3 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            {children}
          </div>
        )}
      </div>
    );

    return <CardContent />;
  };

  const CircuitButton = ({ 
    children, 
    onClick, 
    variant = "default", 
    size = "default",
    className = "",
    disabled = false 
  }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    variant?: "default" | "primary" | "success" | "warning" | "danger";
    size?: "sm" | "default" | "lg";
    className?: string;
    disabled?: boolean;
  }) => {
    const variantStyles = {
      default: "bg-white hover:bg-blue-50 dark:bg-black dark:hover:bg-blue-900/20 text-[#0087d9] dark:text-blue-400 border-blue-200 dark:border-blue-700",
      primary: "bg-[#0087d9] hover:bg-blue-700 text-white border-[#0087d9] shadow-lg shadow-blue-500/25",
      success: "bg-[#0087d9] hover:bg-blue-700 text-white border-[#0087d9] shadow-lg shadow-blue-500/25",
      warning: "bg-[#0087d9] hover:bg-blue-700 text-white border-[#0087d9] shadow-lg shadow-blue-500/25",
      danger: "bg-white hover:bg-blue-50 dark:bg-black dark:hover:bg-blue-900/20 text-[#0087d9] dark:text-blue-400 border-blue-200 dark:border-blue-700"
    };

    const sizeStyles = {
      sm: "px-2 py-1 text-xs h-7",
      default: "px-3 py-2 text-sm h-9",
      lg: "px-4 py-3 text-base h-11"
    };

    return (
      <Button
        onClick={onClick}
        disabled={disabled}
        className={`relative overflow-hidden border transition-all duration-200 hover:scale-105 hover:shadow-lg ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none' : ''}`}
      >
        {children}
      </Button>
    );
  };

  // Step indicator component (moved from chat header)
  const renderStepIndicator = () => {
    if (!chatState.currentStep || !chatSteps.length) return null;

    const currentStepIndex = chatSteps.findIndex(
      (s) => s.id === chatState.currentStep?.id,
    );

    return (
      <Card className="p-4 mb-4 bg-white dark:bg-black border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#0087d9] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-[#0087d9] dark:text-blue-400">
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
      { id: "upload", name: "Upload", icon: FileText, detail: "Document Processing" },
      { id: "metadata", name: "Metadata", icon: Building, detail: "Company Info" },
      { id: "framework-selection", name: "Framework", icon: Settings, detail: "Standards Selection" },
      { id: "processing-mode", name: "Mode", icon: Zap, detail: "Analysis Type" },
      { id: "analysis", name: "Analysis", icon: BarChart3, detail: "Compliance Check" },
      { id: "results", name: "Results", icon: CheckCircle, detail: "Review Report" },
    ];

    const currentStepIndex = steps.findIndex(
      (step) => step.id === chatState.currentStep?.id,
    );

    return (
      <CircuitCard 
        title="Analysis Progress" 
        icon={Activity} 
        sectionKey="progress"
        collapsible={true}
        variant="active"
        className="mb-3"
      >
        <div className="grid grid-cols-2 gap-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                className={`relative p-2 rounded-lg border transition-all duration-300 ${
                  isCompleted
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 shadow-sm"
                    : isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 shadow-md shadow-blue-500/20"
                      : "bg-white dark:bg-black border-blue-200 dark:border-blue-700"
                }`}
                animate={
                  isActive && !isCompleted
                    ? {
                        borderColor: ["#0087d9", "#60a5fa", "#0087d9"],
                        boxShadow: [
                          "0 0 0 0 rgba(0, 135, 217, 0.3)",
                          "0 0 0 4px rgba(0, 135, 217, 0)",
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Circuit connection lines */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-[#0087d9]/30"></div>
                )}
                
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-[#0087d9] text-white"
                        : isActive
                          ? "bg-[#0087d9] text-white"
                          : "bg-blue-100 dark:bg-blue-900/50 text-[#0087d9] dark:text-blue-400 border border-blue-200 dark:border-blue-700"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : isActive && step.id === "upload" && isUploading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Icon className="w-3 h-3" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-medium truncate ${
                      isCompleted
                        ? "text-[#0087d9] dark:text-blue-400"
                        : isActive
                          ? "text-[#0087d9] dark:text-blue-400"
                          : "text-[#0087d9] dark:text-blue-400"
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-[#0087d9]/70 dark:text-blue-400/70 truncate">
                      {step.detail}
                    </div>
                  </div>
                </div>

                {/* Upload Progress Display */}
                {step.id === "upload" && isActive && isUploading && (
                  <div className="mt-2">
                    <div className="text-xs text-[#0087d9] dark:text-blue-400 mb-1">
                      {uploadProgress}%
                    </div>
                    <Progress value={uploadProgress} className="h-1" />
                  </div>
                )}

                {/* Keyword Extraction Display */}
                {step.id === "upload" &&
                  isActive &&
                  (isUploading ||
                    chatState.keywordExtractionStatus.isExtracting) && (
                    <div className="mt-2">
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
                    </div>
                  )}

                {/* Upload Error Display */}
                {step.id === "upload" && uploadError && (
                  <div className="mt-1 text-xs text-[#0087d9] dark:text-blue-400 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span className="truncate">{uploadError}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CircuitCard>
    );
  };

  const renderDocumentInfo = () => {
    if (!chatState.documentId) return null;

    return (
      <CircuitCard 
        title="Document Info" 
        icon={Database} 
        sectionKey="document"
        collapsible={true}
        variant="active"
        className="mb-3"
      >
        <div className="space-y-3">
          {/* File Information Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#0087d9] dark:text-blue-400">Status</span>
                <div className="w-2 h-2 bg-[#0087d9] rounded-full animate-pulse"></div>
              </div>
              <div className="text-xs text-[#0087d9] dark:text-blue-400 font-semibold">Active</div>
            </div>
            
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
              <div className="text-xs font-medium text-[#0087d9] dark:text-blue-400 mb-1">ID</div>
              <div className="text-xs text-[#0087d9] dark:text-blue-400 font-mono bg-white dark:bg-black px-2 py-1 rounded border border-blue-200 dark:border-blue-700 break-all">
                {chatState.documentId}
              </div>
            </div>
          </div>

          {/* Filename Display */}
          <div className="p-2 bg-white dark:bg-black border border-blue-200 dark:border-blue-700 rounded">
            <div className="text-xs font-medium text-[#0087d9] dark:text-blue-400 mb-1">Filename</div>
            <div className="text-xs text-[#0087d9] dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded break-all">
              {chatState.fileName}
            </div>
          </div>

          {/* Processing Metrics */}
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
              <Monitor className="w-3 h-3 text-[#0087d9] mx-auto mb-1" />
              <div className="text-xs text-[#0087d9] dark:text-blue-400 font-semibold">PDF</div>
            </div>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
              <CheckCircle className="w-3 h-3 text-[#0087d9] mx-auto mb-1" />
              <div className="text-xs text-[#0087d9] dark:text-blue-400 font-semibold">Parsed</div>
            </div>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
              <Cpu className="w-3 h-3 text-[#0087d9] mx-auto mb-1" />
              <div className="text-xs text-[#0087d9] dark:text-blue-400 font-semibold">Ready</div>
            </div>
          </div>

          {/* System Status - Show circuit breaker status if available */}
          {chatState.currentProgress && (chatState.currentProgress as ProgressData)?.circuit_breaker && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#0087d9] dark:text-blue-400">AI Service</span>
                <div className={`w-2 h-2 rounded-full ${
                  (chatState.currentProgress as ProgressData).circuit_breaker?.status === 'closed' 
                    ? 'bg-[#0087d9] animate-pulse' 
                    : 'bg-[#0087d9]/50'
                }`}></div>
              </div>
              <div className="text-xs text-[#0087d9] dark:text-blue-400 font-semibold">
                {(chatState.currentProgress as ProgressData).circuit_breaker?.status === 'closed' 
                  ? 'Operational' 
                  : (chatState.currentProgress as ProgressData).circuit_breaker?.status === 'open'
                    ? 'Protected'
                    : 'Recovering'
                }
              </div>
            </div>
          )}
        </div>
      </CircuitCard>
    );
  };

  const renderMetadataSection = () => {
    // Always show metadata section if we're on metadata step or have metadata
    const shouldShowMetadata = chatState.currentStep?.id === "metadata" || 
                               chatState.documentMetadata || 
                               isEditingMetadata;
    
    if (!shouldShowMetadata) return null;

    return (
      <CircuitCard 
        title="Company Info" 
        icon={Building} 
        sectionKey="metadata"
        collapsible={true}
        variant={chatState.currentStep?.id === "metadata" ? "processing" : "default"}
        className="mb-3"
      >
        <div className="space-y-3">
          {/* Header with edit button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#0087d9] dark:text-blue-400">
              {isEditingMetadata ? "Editing Metadata" : "Company Details"}
            </span>
            {!isEditingMetadata && (
              <CircuitButton
                onClick={() => setIsEditingMetadata(true)}
                variant="primary"
                size="sm"
                className="h-6 px-2"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Edit
              </CircuitButton>
            )}
          </div>

          {isEditingMetadata ? (
            <div className="space-y-2">
              <div>
                <Label htmlFor="company_name" className="text-xs font-medium">
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
                  className="mt-1 h-8 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="nature_of_business" className="text-xs font-medium">
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
                  className="mt-1 text-xs"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="operational_demographics" className="text-xs font-medium">
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
                  className="mt-1 text-xs"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="financial_statements_type" className="text-xs font-medium">
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
                  className="mt-1 h-8 text-xs"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <CircuitButton
                  onClick={handleSaveMetadata}
                  variant="success"
                  size="sm"
                  className="flex-1"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </CircuitButton>
                <CircuitButton 
                  onClick={handleCancelEdit} 
                  variant="default" 
                  size="sm"
                  className="flex-1"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </CircuitButton>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {!chatState.documentMetadata || Object.values(chatState.documentMetadata).every(val => !getMetadataValue(val)) ? (
                <div className="text-center py-3 text-[#0087d9] dark:text-blue-400">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No company information available yet.</p>
                  <p className="text-xs mt-1 opacity-75">Click &ldquo;Edit&rdquo; above to add company details manually.</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                    <div className="text-xs font-medium text-[#0087d9] dark:text-blue-400">Company</div>
                    <div className="text-xs text-[#0087d9] dark:text-blue-400 mt-1 truncate font-medium">
                      {getMetadataValue(chatState.documentMetadata?.company_name)}
                    </div>
                  </div>

                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                    <div className="text-xs font-medium text-[#0087d9] dark:text-blue-400">Business</div>
                    <div className="text-xs text-[#0087d9] dark:text-blue-400 mt-1 line-clamp-2 font-medium">
                      {getMetadataValue(chatState.documentMetadata?.nature_of_business)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                      <div className="text-xs font-medium text-[#0087d9] dark:text-blue-400">Geography</div>
                      <div className="text-xs text-[#0087d9] dark:text-blue-400 mt-1 truncate font-medium">
                        {getMetadataValue(chatState.documentMetadata?.operational_demographics)}
                      </div>
                    </div>

                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                      <div className="text-xs font-medium text-[#0087d9] dark:text-blue-400">Statement</div>
                      <div className="text-xs text-[#0087d9] dark:text-blue-400 mt-1 truncate font-medium">
                        {getMetadataValue(chatState.documentMetadata?.financial_statements_type)}
                      </div>
                    </div>
                  </div>

                  {/* Confirm button for metadata step */}
                  {chatState.currentStep?.id === "metadata" && onConfirmStep && (
                    <div className="pt-2">
                      <CircuitButton
                        onClick={() => onConfirmStep("metadata")}
                        variant="primary"
                        size="default"
                        className="w-full"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Confirm & Proceed
                      </CircuitButton>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CircuitCard>
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
            customInstructions={chatState.customInstructions || ""}
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
            onCustomInstructionsChange={onCustomInstructionsChange || (() => {})}
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
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 shadow-lg">
        <h3 className="font-semibold mb-4 text-[#0087d9] flex items-center space-x-2">
          <BarChart3 className="w-4 h-4" />
          <span>Analysis Progress</span>
          <motion.div
            className="w-2 h-2 bg-[#0087d9] rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </h3>

        {/* Circuit Breaker Status Indicator */}
        {progressData?.circuit_breaker && progressData.circuit_breaker.status !== 'closed' && (
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Shield className="w-4 h-4 text-[#0087d9]" />
              </motion.div>
              <span className="text-sm font-semibold text-[#0087d9]">AI Service Protection Active</span>
            </div>
            <div className="text-xs text-[#0087d9] dark:text-blue-400">
              {progressData.circuit_breaker.status === 'open' && (
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>
                    Circuit breaker open. Retrying in {progressData.circuit_breaker.retry_after_seconds || 300} seconds.
                  </span>
                </div>
              )}
              {progressData.circuit_breaker.status === 'half-open' && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Testing AI service recovery...</span>
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-[#0087d9]/70 dark:text-blue-400/70">
              The system automatically protects against service overload. Analysis will continue once service recovers.
            </div>
          </div>
        )}

        {progressData && (
          <div className="mb-4 p-4 bg-white dark:bg-black rounded-xl shadow-sm border border-blue-200 dark:border-blue-700">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-[#0087d9] dark:text-blue-400">Overall Progress</span>
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <span className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                  {progressData.overall_progress?.elapsed_time_formatted || "0s"}
                </span>
              </div>
            </div>
            <Progress
              value={
                progressData.overall_progress?.percentage ||
                progressData.percentage ||
                0
              }
              className="h-3 mb-3"
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#0087d9] dark:text-blue-400">
                {progressData.questions?.completed || 0} / {progressData.questions?.total || 0} questions answered
              </span>
              <span className="text-[#0087d9] dark:text-blue-400 font-semibold">
                {Math.round(progressData.overall_progress?.percentage || progressData.percentage || 0)}%
              </span>
            </div>
            {(progressData.overall_progress?.current_standard ||
              progressData.currentStandard) && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Currently processing:
                </div>
                <div className="text-sm text-blue-900 dark:text-blue-100 font-semibold truncate">
                  {progressData.overall_progress?.current_standard ||
                    progressData.currentStandard}
                </div>
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
                      <span className="text-xs text-[#0087d9] dark:text-blue-400">
                        {standardProgress.elapsed_time_formatted}
                      </span>
                    )}
                    <motion.span
                      className={`text-xs px-2 py-1 rounded ${
                        isCompleted
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          : isProcessing
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-blue-50 text-[#0087d9] dark:bg-blue-900/10 dark:text-blue-400"
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
                <div className="text-xs text-[#0087d9] dark:text-blue-400">
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

        <div className="mt-3 text-xs text-[#0087d9] dark:text-blue-400">
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
      <Card className="p-4 mb-4 bg-white dark:bg-black border-blue-200 dark:border-blue-700">
        <h3 className="font-semibold mb-3 text-[#0087d9]">Results Summary</h3>

        <div className="space-y-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#0087d9] mb-1">
              {compliancePercentage}%
            </div>
            <div className="text-sm text-[#0087d9] dark:text-blue-400">
              Overall Compliance
            </div>
          </div>

          <Progress value={compliancePercentage} className="h-3" />

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-semibold text-[#0087d9]">
                {compliantItems}
              </div>
              <div className="text-xs text-[#0087d9] dark:text-blue-400">Yes</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-[#0087d9]">
                {nonCompliantItems}
              </div>
              <div className="text-xs text-[#0087d9] dark:text-blue-400">No</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-[#0087d9] dark:text-blue-400">
                {totalItems}
              </div>
              <div className="text-xs text-[#0087d9] dark:text-blue-400">Total</div>
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
      className="fixed right-0 top-0 h-full w-[26rem] code-panel bg-white dark:bg-black border-l border-blue-200 dark:border-blue-700 overflow-y-auto z-50"
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
