"use client";

import {Button} from "@/components/ui/button";
import {LightningIcon} from "@/components/ui/professional-icons";
import { Card } from "@/components/ui/card";
interface SuggestionMessageProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export function SuggestionMessage({
  suggestions,
  onSuggestionClick,
}: SuggestionMessageProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 mb-4">
        <LightningIcon className="h-4 w-4" />
        <span className="text-sm font-medium text-gray-700">
          Suggestions for Enhanced Analysis
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {suggestions.map((suggestion, index) => (
          <Card
            key={index}
            className="p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors border border-gray-200"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{suggestion}</span>
              <Button
                className="bg-transparent h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onSuggestionClick(suggestion);
                }}
              >
                +
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-3 mt-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Click any suggestion to add it to your
          special instructions, or type your own specific requirements in the
          message box below.
        </p>
      </div>
    </div>
  );
}
