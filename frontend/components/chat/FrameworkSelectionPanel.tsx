"use client";

import {Loader2, ArrowRight, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Checkbox} from "@/components/ui/checkbox";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {ScrollArea} from "@/components/ui/scroll-area";

import { motion } from "framer-motion";
import {
  Framework,
  updateAvailableStandards,
} from "@/lib/framework-selection-utils";

interface FrameworkSelectionPanelProps {
  frameworks: Framework[];
  selectedFramework: string;
  selectedStandards: string[];
  aiSuggestedStandards?: string[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  step: "framework" | "standards";
  disabled?: boolean;
  hideAnalysisButton?: boolean;
  onFrameworkSelect: (frameworkId: string) => void;
  onStandardToggle: (standardId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function FrameworkSelectionPanel({
  frameworks,
  selectedFramework,
  selectedStandards,
  aiSuggestedStandards = [],
  isLoading = false,
  isSubmitting = false,
  error = null,
  step,
  disabled = false,
  hideAnalysisButton = false,
  onFrameworkSelect,
  onStandardToggle,
  onSelectAll,
  onClearAll,
  onContinue,
  onBack,
}: FrameworkSelectionPanelProps) {
  // Calculate available standards based on selected framework
  const { availableStandards } = updateAvailableStandards(
    selectedFramework,
    frameworks,
  );

  // Validation helpers
  const canContinue = step === "framework" ? !!selectedFramework : selectedStandards.length > 0;

  const renderFrameworkSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-4 relative ${disabled ? 'opacity-60' : ''}`}
    >
      {disabled && (
        <div className="absolute top-0 left-0 right-0 bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-700">Analysis in Progress - Framework Locked</span>
          </div>
        </div>
      )}
      <div className={disabled ? 'mt-14' : ''}>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          Select Financial Reporting Framework
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Choose the financial reporting framework applicable to your document
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ScrollArea className="h-[300px] pr-4">
        <RadioGroup 
          value={selectedFramework} 
          onValueChange={disabled ? () => {} : onFrameworkSelect}
          disabled={disabled}
        >
          {frameworks.map((framework) => (
            <div
              key={framework.id}
              className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0"
            >
              <RadioGroupItem
                value={framework.id}
                id={`framework-${framework.id}`}
                className="mt-1"
                disabled={disabled}
              />
              <Label
                htmlFor={`framework-${framework.id}`}
                className="flex-1 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {framework.name}
                  </span>
                  {framework.description && (
                    <span className="text-sm text-gray-500 mt-1">
                      {framework.description}
                    </span>
                  )}
                  {framework.standards && (
                    <span className="text-xs text-gray-400 mt-1">
                      {framework.standards.filter((s) => s.available).length}{" "}
                      standards available
                    </span>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </ScrollArea>

      {/* No Continue button - framework selection automatically triggers standards step */}
    </motion.div>
  );

  const renderStandardsSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-4 relative ${disabled ? 'opacity-60' : ''}`}
    >
      {disabled && (
        <div className="absolute top-0 left-0 right-0 bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-700">Analysis in Progress - Standards Locked</span>
          </div>
        </div>
      )}
      <div className={disabled ? 'mt-14' : ''}>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          Select Standards to Analyze
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Choose one or more standards to check compliance with
        </p>
      </div>

      {/* AI Suggested Standards */}
      {aiSuggestedStandards.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">
            🤖 AI Recommended Standards
          </h5>
          <p className="text-xs text-blue-700 mb-2">
            Based on your company profile, these standards are recommended:
          </p>
          <div className="flex flex-wrap gap-1">
            {aiSuggestedStandards.map((standardId) => {
              const standard = availableStandards.find(s => s.id === standardId);
              return standard ? (
                <span
                  key={standardId}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {standard.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Selection Controls */}
      <div className="flex justify-between items-center py-2 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          {selectedStandards.length} of {availableStandards.length} selected
        </span>
        <div className="flex space-x-2">
          <Button
            className="border h-8 px-2"
            onClick={onSelectAll}
            disabled={selectedStandards.length === availableStandards.length || disabled}
          >
            Select All
          </Button>
          <Button
            className="border h-8 px-2"
            onClick={onClearAll}
            disabled={selectedStandards.length === 0 || disabled}
          >
            Clear All
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {availableStandards.map((standard) => (
            <div
              key={standard.id}
              className="flex items-start space-x-3 py-2 border-b border-gray-50 last:border-0"
            >
              <Checkbox
                id={`standard-${standard.id}`}
                checked={selectedStandards.includes(standard.id)}
                onCheckedChange={disabled ? () => {} : () => onStandardToggle(standard.id)}
                disabled={disabled}
                className="mt-1"
              />
              <Label
                htmlFor={`standard-${standard.id}`}
                className="flex-1 cursor-pointer"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {standard.name}
                    </span>
                    {aiSuggestedStandards.includes(standard.id) && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        AI Suggested
                      </span>
                    )}
                  </div>
                  {standard.description && (
                    <span className="text-sm text-gray-500 mt-1">
                      {standard.description}
                    </span>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>



      <div className="flex justify-between pt-4">
        <Button onClick={onBack} className="border text-gray-600" disabled={disabled}>
          <X className="mr-2 h-4 w-4" />
          Back
        </Button>
        {!hideAnalysisButton && (
          <Button
            onClick={onContinue}
            disabled={!canContinue || isSubmitting || disabled}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Start Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading frameworks...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {step === "framework" && renderFrameworkSelection()}
      {step === "standards" && renderStandardsSelection()}
    </div>
  );
}
