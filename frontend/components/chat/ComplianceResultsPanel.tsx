"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DownloadIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  MinusCircleIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ComplianceItem {
  id: string;
  question: string;
  reference: string;
  status: "YES" | "NO" | "PARTIAL" | "N/A";
  confidence: number;
  explanation: string;
  evidence: string[];
  suggestion?: string;
  content_analysis?: string;
  disclosure_recommendations?: string;
  geography_of_operations?: string;
}

interface ComplianceSection {
  section: string;
  title: string;
  standard: string;
  items: ComplianceItem[];
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

interface ComplianceResultsPanelProps {
  results: ComplianceResults;
  onExport?: (format: "pdf" | "excel") => void;
}

export function ComplianceResultsPanel({
  results,
  onExport,
}: ComplianceResultsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Calculate overall statistics
  const totalItems = results.sections.reduce(
    (total, section) => total + section.items.length,
    0,
  );
  const compliantItems = results.sections.reduce(
    (total, section) =>
      total + (Array.isArray(section.items) ? section.items.filter((item) => item.status === "YES").length : 0),
    0,
  );
  const nonCompliantItems = results.sections.reduce(
    (total, section) =>
      total + (Array.isArray(section.items) ? section.items.filter((item) => item.status === "NO").length : 0),
    0,
  );
  const partialItems = results.sections.reduce(
    (total, section) =>
      total + (Array.isArray(section.items) ? section.items.filter((item) => item.status === "PARTIAL").length : 0),
    0,
  );
  const naItems = results.sections.reduce(
    (total, section) =>
      total + (Array.isArray(section.items) ? section.items.filter((item) => item.status === "N/A").length : 0),
    0,
  );

  const compliancePercentage = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "YES":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "NO":
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case "PARTIAL":
        return <AlertCircleIcon className="h-4 w-4 text-yellow-500" />;
      case "N/A":
        return <MinusCircleIcon className="h-4 w-4 text-gray-400" />;
      default:
        return <MinusCircleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      YES: "bg-green-100 text-green-800 border-green-200",
      NO: "bg-red-100 text-red-800 border-red-200",
      PARTIAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "N/A": "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 border-gray-200 dark:border-gray-600",
    };

    const validStatuses = ["YES", "NO", "PARTIAL", "N/A"];
    if (!validStatuses.includes(status)) {
      // // Removed console.error for production
return (
        <Badge className="bg-red-100 text-red-800 border-red-200 border">
          <XCircleIcon className="h-4 w-4" />
          <span className="ml-1">ERROR</span>
        </Badge>
      );
    }

    return (
      <Badge
        className={`border ${variants[status as keyof typeof variants]}`}
      >
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  // Group sections by standard with strict error handling
  const sectionsByStandard = (Array.isArray(results.sections) ? results.sections : []).reduce(
    (acc, section) => {
      if (!section.standard) {
        // // Removed console.error for production
return acc; // Skip sections without standard
      }
      const standard = section.standard;
      if (!acc[standard]) {
        acc[standard] = [];
      }
      acc[standard].push(section);
      return acc;
    },
    {} as Record<string, ComplianceSection[]>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-[#0087d9]">
                Compliance Analysis Results
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {results.metadata.company_name || (
                  <span className="text-red-600 font-medium">Company name not available</span>
                )} •{" "}
                {results.framework?.toUpperCase() || (
                  <span className="text-red-600 font-medium">Framework not specified</span>
                )} Framework
              </p>
            </div>
            <div className="flex space-x-2">
              {onExport && (
                <>
                  <Button
                    className="border h-8 px-2"
                    onClick={() => onExport("pdf")}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    PDF Report
                  </Button>
                  <Button
                    className="border h-8 px-2"
                    onClick={() => onExport("excel")}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Excel Export
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Overall Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-gray-800 rounded-lg border dark:border-white">
              <div className="text-2xl font-bold text-blue-600 dark:text-white">
                {compliancePercentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Overall Compliance</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-gray-800 rounded-lg border dark:border-green-400">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {compliantItems}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Yes</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-gray-800 rounded-lg border dark:border-red-400">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {nonCompliantItems}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">No</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-gray-800 rounded-lg border dark:border-yellow-400">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {partialItems}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Partial</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-white">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{naItems}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Not Applicable</div>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Standards Analyzed:</strong>{" "}
              {results.standards.join(", ")}
            </div>
            <div>
              <strong>Analysis Completed:</strong>{" "}
              {results.completed_at
                ? new Date(results.completed_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : "N/A"}
            </div>
            {results.specialInstructions && (
              <div className="md:col-span-2">
                <strong>Special Instructions:</strong>{" "}
                {results.specialInstructions}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results by Standard */}
      {Object.entries(sectionsByStandard).map(([standard, sections]) => (
        <Card key={standard}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              {standard}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {sections.reduce(
                (total, section) => total + section.items.length,
                0,
              )}{" "}
              requirements checked
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {Array.isArray(sections) && sections.map((section) => (
              <div key={section.section} className="border rounded-lg">
                <Collapsible
                  open={expandedSections.has(section.section)}
                  onOpenChange={() => toggleSection(section.section)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      className="bg-transparent w-full justify-between p-4 h-auto"
                    >
                      <div className="text-left">
                        <div className="font-medium">{section.title}</div>
                        <div className="text-sm text-gray-500">
                          {section.items.length} items •{" "}
                          {
                            section.items.filter(
                              (item) => item.status === "YES",
                            ).length
                          }{" "}
                          compliant
                        </div>
                      </div>
                      {expandedSections.has(section.section) ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t"
                      >
                        <div className="p-4 space-y-3">
                          {Array.isArray(section.items) && section.items.map((item) => (
                            <div key={item.id} className="border rounded-lg">
                              <Collapsible
                                open={expandedItems.has(item.id)}
                                onOpenChange={() => toggleItem(item.id)}
                              >
                                <CollapsibleTrigger asChild>
                                  <Button
                                    className="bg-transparent w-full justify-between p-3 h-auto text-left"
                                  >
                                    <div className="flex items-start space-x-3 flex-1">
                                      {getStatusIcon(item.status)}
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-900">
                                          {item.question}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {item.reference}
                                        </div>
                                      </div>
                                      <div className="flex-shrink-0">
                                        {getStatusBadge(item.status)}
                                      </div>
                                    </div>
                                    {expandedItems.has(item.id) ? (
                                      <ChevronDownIcon className="h-4 w-4 ml-2" />
                                    ) : (
                                      <ChevronRightIcon className="h-4 w-4 ml-2" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                  <div className="p-3 border-t dark:border-white bg-gray-50 dark:bg-gray-800 space-y-3">
                                    {/* Explanation */}
                                    <div>
                                      <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                                        Explanation
                                      </h4>
                                      <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {item.explanation}
                                      </p>
                                    </div>

                                    {/* Evidence */}
                                    {item.evidence && Array.isArray(item.evidence) && item.evidence.length > 0 ? (
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                                          Evidence
                                        </h4>
                                        <div className="space-y-1">
                                          {item.evidence.map(
                                            (evidence, index) => (
                                              <p
                                                key={index}
                                                className="text-sm text-gray-600 dark:text-gray-400 italic bg-white dark:bg-gray-700 p-2 rounded border dark:border-white"
                                              >
                                                &quot;{evidence}&quot;
                                              </p>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                                          Evidence
                                        </h4>
                                        <p className="text-sm text-gray-500 italic p-2">
                                          No evidence available for this item
                                        </p>
                                      </div>
                                    )}

                                    {/* Suggestion */}
                                    {item.suggestion ? (
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                                          Recommendation
                                        </h4>
                                        <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded border">
                                          {item.suggestion}
                                        </p>
                                      </div>
                                    ) : (
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                                          Recommendation
                                        </h4>
                                        <p className="text-sm text-gray-500 italic p-2">
                                          No recommendation available
                                        </p>
                                      </div>
                                    )}

                                    {/* Content Analysis */}
                                    {item.content_analysis ? (
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                                          Content Analysis
                                        </h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-white">
                                          {item.content_analysis}
                                        </p>
                                      </div>
                                    ) : (
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                                          Content Analysis
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic p-2">
                                          Content analysis not available
                                        </p>
                                      </div>
                                    )}

                                    {/* Disclosure Recommendations */}
                                    {item.disclosure_recommendations ? (
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                                          Disclosure Recommendations
                                        </h4>
                                        <p className="text-sm text-purple-700 bg-purple-50 p-2 rounded border">
                                          {item.disclosure_recommendations}
                                        </p>
                                      </div>
                                    ) : (
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                                          Disclosure Recommendations
                                        </h4>
                                        <p className="text-sm text-gray-500 italic p-2">
                                          Disclosure recommendations not available
                                        </p>
                                      </div>
                                    )}

                                    {/* Geography of Operations */}
                                    {item.geography_of_operations ? (
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                                          Geography of Operations
                                        </h4>
                                        <p className="text-sm text-green-700 bg-green-50 p-2 rounded border">
                                          {item.geography_of_operations}
                                        </p>
                                      </div>
                                    ) : (
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                                          Geography of Operations
                                        </h4>
                                        <p className="text-sm text-gray-500 italic p-2">
                                          Geography information not available
                                        </p>
                                      </div>
                                    )}

                                    {/* Confidence */}
                                    <div>
                                      <h4 className="font-medium text-sm text-gray-900 mb-1">
                                        Confidence Score
                                      </h4>
                                      <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                          <div
                                            className="bg-blue-500 h-2 rounded-full confidence-bar"
                                            ref={(el) => {
                                              if (el) {
                                                el.style.setProperty('--confidence-width', `${item.confidence * 100}%`);
                                              }
                                            }}
                                          />
                                        </div>
                                        <span className="text-sm text-gray-600">
                                          {Math.round(item.confidence * 100)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
