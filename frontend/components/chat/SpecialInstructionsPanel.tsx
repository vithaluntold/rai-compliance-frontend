"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
interface SpecialInstructionsPanelProps {
  specialInstructions: string;
  isSubmitting?: boolean;
  error?: string | null;
  onInstructionsChange: (instructions: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export default function SpecialInstructionsPanel({
  specialInstructions,
  isSubmitting = false,
  error = null,
  onInstructionsChange,
  onContinue,
  onSkip,
}: SpecialInstructionsPanelProps) {
  const suggestionPrompts = [
    "Focus on revenue recognition compliance",
    "Pay special attention to related party transactions",
    "Emphasize environmental liability disclosures",
    "Check for proper segment reporting",
    "Verify fair value measurement disclosures",
    "Review going concern assessments",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    const newText = specialInstructions
      ? `${specialInstructions}\n${suggestion}`
      : suggestion;
    onInstructionsChange(newText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 p-6 space-y-6"
    >
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-900">
            Special Instructions (Optional)
          </h4>
        </div>
        <p className="text-sm text-gray-600">
          Provide any specific areas you&apos;d like me to focus on during the
          compliance analysis. This helps me tailor the analysis to your
          particular needs.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Instructions Input */}
      <div className="space-y-3">
        <Label
          htmlFor="special-instructions"
          className="text-sm font-medium text-gray-700"
        >
          Additional Focus Areas or Requirements
        </Label>
        <Textarea
          id="special-instructions"
          value={specialInstructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          placeholder="e.g., 'Please pay special attention to revenue recognition and related party disclosures. Also verify compliance with new leasing standards.'"
          className="min-h-[120px] resize-none"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500">
          {specialInstructions.length}/500 characters
        </p>
      </div>

      {/* Quick Suggestions */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-4 w-4 text-yellow-600" />
          <Label className="text-sm font-medium text-gray-700">
            Quick Suggestions
          </Label>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {suggestionPrompts.map((suggestion, index) => (
            <Card
              key={index}
              className="p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{suggestion}</span>
                <Button
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuggestionClick(suggestion);
                  }}
                >
                  +
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onSkip}
          className="border text-gray-600"
          disabled={isSubmitting}
        >
          Skip & Start Analysis
        </Button>
        <Button
          onClick={onContinue}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Starting Analysis...
            </>
          ) : (
            <>
              Continue with Instructions
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Be specific about areas of concern or
          regulatory requirements that are particularly important to your
          organization. This helps me provide more targeted and relevant
          compliance insights.
        </p>
      </div>
    </motion.div>
  );
}
