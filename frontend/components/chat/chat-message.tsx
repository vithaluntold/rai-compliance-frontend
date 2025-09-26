"use client";

import {
  Loader2,
  CheckCircle,
  Info,
  ExternalLink,
} from "lucide-react";
import {DocumentIcon} from "@/components/ui/professional-icons";
import {Button} from "@/components/ui/button";
import {ComplianceResultsPanel} from "./ComplianceResultsPanel";
import {ComplianceSummary} from "./ComplianceSummary";
import {exportComplianceResults} from "@/lib/export-utils";
import {AnalysisModeSelection} from "../ui/analysis-mode-selection";
import {SuggestionMessage} from "./suggestion-message";
import type { Message, ChatState } from "./chat-interface";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

// Utility function to truncate filename while preserving extension
const truncateFileName = (fileName: string, maxLength: number = 30): string => {
  if (fileName.length <= maxLength) return fileName;
  
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // No extension found
    return fileName.substring(0, maxLength - 3) + '...';
  }
  
  const extension = fileName.substring(lastDotIndex);
  const nameWithoutExt = fileName.substring(0, lastDotIndex);
  const maxNameLength = maxLength - extension.length - 3; // 3 for "..."
  
  if (maxNameLength <= 0) {
    return '...' + extension;
  }
  
  return nameWithoutExt.substring(0, maxNameLength) + '...' + extension;
};

// Utility function to parse markdown text with inline bold formatting
const parseMarkdownText = (text: string, isUserMessage: boolean = false): React.ReactNode => {
  const textColor = isUserMessage ? "text-white" : "";
  
  // Split text by ** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    // Check if this part is bold text
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className={`font-semibold ${textColor}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Regular text
    return <span key={index} className={textColor}>{part}</span>;
  });
};

// Local type definitions based on the message metadata structure
interface AnalysisResults {
  compliance_summary?: {
    overall_score?: number;
    issues_found?: number;
    standards_checked?: number;
  };
  detailed_findings?: unknown[];
  [key: string]: unknown;
}

// Type guards to check if the analysis results have the expected structure
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

// Removed unused isComplianceResults function

// Type guard to check if results have compliance structure
function hasComplianceSections(results: unknown): results is ComplianceResults {
  return (
    typeof results === "object" &&
    results !== null &&
    "sections" in results &&
    Array.isArray((results as Record<string, unknown>)["sections"])
  );
}

interface ChatMessageProps {
  message: Message;
  chatState: ChatState;
  onAnalysisModeSelect?: (mode: "zap" | "comprehensive") => void;
  onSuggestionClick?: (suggestion: string) => void;
  onGoToResults?: (documentId: string) => void;
}

export function ChatMessage({
  message,
  chatState,
  onAnalysisModeSelect,
  onSuggestionClick,
  onGoToResults,
}: ChatMessageProps): ReactNode {
  const renderSystemIcon = () => {
    switch (message.type) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin text-[#0087d9]" />;
      case "system":
      case "component":
        return <CheckCircle className="h-4 w-4 text-[#0087d9]" />;
      case "user":
        return <DocumentIcon className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderComponent = () => {
    if (message.type !== "component") return null;

    switch (message.component) {
      case "analysis-mode-selection":
        
        return (
          <AnalysisModeSelection
            onModeSelect={onAnalysisModeSelect!}
            disabled={chatState.isProcessing}
          />
        );
      case "suggestions":
        const suggestions = [
          "Focus on revenue recognition compliance",
          "Pay special attention to related party transactions",
          "Emphasize environmental liability disclosures",
          "Check for proper segment reporting",
          "Verify fair value measurement disclosures",
          "Review going concern assessments",
        ];
        return (
          <SuggestionMessage
            suggestions={suggestions}
            onSuggestionClick={onSuggestionClick || (() => {})}
          />
        );
      default:
        return null;
    }
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

  const renderMetadata = (): ReactNode => {
    if (!message.metadata) return null;

    const analysisResults = message.metadata.analysisResults;
    const fileId = message.metadata.fileId;
    const fileName = message.metadata.fileName;
    const documentMetadata = message.metadata.documentMetadata;

    return (
      <div className="mt-4 space-y-3">{/* Improved spacing */}
        {/* File Upload Metadata */}
        {(fileId && fileName && (
          <div className="flex items-center space-x-2 text-sm text-white">
            <DocumentIcon className="h-4 w-4" />
            <span>File: {truncateFileName(fileName)}</span>
          </div>
        )) as ReactNode}

        {/* Document Metadata */}
        {(documentMetadata && 
         typeof documentMetadata === 'object' && 
         documentMetadata !== null && (
          <Card className="p-3 bg-white/10 border-white/20">
            <h4 className="font-semibold text-sm mb-2 text-white">
              Extracted Information
            </h4>
            <div className="space-y-1 text-sm text-white">
              <div>
                <strong>Company:</strong>{" "}
                {getMetadataValue((documentMetadata as Record<string, unknown>)?.["company_name"])}
              </div>
              <div>
                <strong>Business:</strong>{" "}
                {getMetadataValue((documentMetadata as Record<string, unknown>)?.["nature_of_business"]) || "Not found"}
              </div>
              <div>
                <strong>Demographics:</strong>{" "}
                {getMetadataValue((documentMetadata as Record<string, unknown>)?.["operational_demographics"]) || "Not found"}
              </div>
            </div>
          </Card>
        )) as ReactNode}

        {/* Analysis Results */}
        {(analysisResults && hasComplianceSections(analysisResults) && (
          <div className="space-y-4 mt-4">
            {/* Compact Summary for Chat */}
            <ComplianceSummary
              sections={(analysisResults as ComplianceResults).sections}
              metadata={(analysisResults as ComplianceResults).metadata}
              framework={(analysisResults as ComplianceResults).framework}
              standards={(analysisResults as ComplianceResults).standards}
              completedAt={(analysisResults as ComplianceResults).completed_at || ""}
              onExport={(format) =>
                exportComplianceResults(analysisResults as ComplianceResults, format)
              }
            />

            {/* Detailed Results Panel */}
            <ComplianceResultsPanel
              results={analysisResults as ComplianceResults}
              onExport={(format) =>
                exportComplianceResults(analysisResults as ComplianceResults, format)
              }
            />
          </div>
        )) as ReactNode}

        {/* Fallback for non-compliance analysis results */}
        {(analysisResults && !hasComplianceSections(analysisResults) && (
          <Card className="p-3 bg-white/10 border-white/20">
            <h4 className="font-semibold text-sm mb-2 text-white">
              Analysis Results
            </h4>
            <div className="space-y-1 text-sm text-white">
              {(analysisResults as AnalysisResults).compliance_summary && (
                <div>
                  <strong>Overall Score:</strong>{" "}
                  {(analysisResults as AnalysisResults).compliance_summary?.overall_score || "N/A"}
                </div>
              )}
              {(analysisResults as AnalysisResults).compliance_summary && (
                <div>
                  <strong>Issues Found:</strong>{" "}
                  {(analysisResults as AnalysisResults).compliance_summary?.issues_found || "N/A"}
                </div>
              )}
              {(analysisResults as AnalysisResults).compliance_summary && (
                <div>
                  <strong>Standards Checked:</strong>{" "}
                  {(analysisResults as AnalysisResults).compliance_summary?.standards_checked ||
                    "N/A"}
                </div>
              )}
            </div>
          </Card>
        )) as ReactNode}
      </div>
    );
  };

  return (
    <div
      suppressHydrationWarning
      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}
      >
        <Card
          className={`p-4 ${
            message.type === "user"
              ? "bg-[#0087d9] text-white"
              : message.type === "loading"
                ? "bg-gray-50 dark:bg-black border-gray-200 dark:border-gray-700 dark:text-white"
                : "bg-white dark:bg-black border-gray-200 dark:border-gray-700 dark:text-white"
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">{renderSystemIcon()}</div>
            <div className="flex-1 space-y-3">{/* Add consistent spacing */}
              {message.type === "component" ? (
                <div className="mt-2">{renderComponent()}</div>
              ) : (
                <div className={`prose prose-sm max-w-none ${
                  message.type === "user" ? "prose-invert" : ""
                }`}>
                  {/* Check if content is React element or string */}
                  {typeof message.content === 'string' ? (
                    /* Handle string content with table/formatting logic */
                    message.content.includes('<table') ? (
                      <>
                        {/* Render text content before the table */}
                        {message.content.split('<table')[0]?.split("\n").map((line, index) => {
                          if (line.trim() === "") return <br key={index} />;
                          if (line.startsWith("**") && line.endsWith("**")) {
                            return (
                              <h4 key={index} className={`font-semibold mb-1 mt-2 ${
                                message.type === "user" ? "text-white" : ""
                              }`}>
                                {line.slice(2, -2)}
                              </h4>
                            );
                          }
                          return (
                            <p key={index} className={`mb-1 ${
                              message.type === "user" ? "text-white" : ""
                            }`}>
                              {line}
                            </p>
                          );
                        })}
                        
                        {/* Render the table */}
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: '<table' + (message.content.split('<table')[1]?.split('</table>')[0] || '') + '</table>'
                          }} 
                        />
                        
                        {/* Render text content after the table */}
                        {message.content.split('</table>')[1] && 
                          message.content.split('</table>')[1]?.split("\n").map((line, index) => {
                            if (line.trim() === "") return <br key={index} />;
                            return (
                              <p key={index} className={`mb-1 ${
                                message.type === "user" ? "text-white" : ""
                              }`}>
                                {line}
                              </p>
                            );
                          })
                        }
                      </>
                    ) : (
                      /* Enhanced text processing with markdown support */
                      message.content.split("\n").map((line, index) => {
                        // Handle empty lines
                        if (line.trim() === "") {
                          return <br key={index} />;
                        }
                        
                        // Handle full-line headers (lines that start and end with **)
                        if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
                          return (
                            <h4 key={index} className={`font-semibold mb-1 mt-2 ${
                              message.type === "user" ? "text-white" : ""
                            }`}>
                              {line.slice(2, -2)}
                            </h4>
                          );
                        }
                        
                        // Handle bullet points
                        if (line.startsWith("- ") || line.startsWith("● ")) {
                          return (
                            <div key={index} className={`ml-4 mb-1 ${
                              message.type === "user" ? "text-white" : ""
                            }`}>
                              {parseMarkdownText(line, message.type === "user")}
                            </div>
                          );
                        }
                        
                        // Handle regular text with inline formatting
                        return (
                          <p key={index} className={`mb-1 ${
                            message.type === "user" ? "text-white" : ""
                          }`}>
                            {parseMarkdownText(line, message.type === "user")}
                          </p>
                        );
                      })
                    )
                  ) : (
                    /* Render React element content directly */
                    message.content
                  )}
                </div>
              )}

              {/* Results Button for completed analysis */}
              {message.documentId && onGoToResults && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Validate documentId before navigation
                        if (!message.documentId || typeof message.documentId !== 'string' || message.documentId.trim() === '') {
                          return;
                        }
                        
                        if (onGoToResults) {
                          onGoToResults(message.documentId);
                        }
                      }}
                      className="bg-[#0087d9] hover:bg-blue-700 text-white h-8 px-4"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Detailed Results
                    </Button>
                  </div>
                )}

              {renderMetadata()}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
