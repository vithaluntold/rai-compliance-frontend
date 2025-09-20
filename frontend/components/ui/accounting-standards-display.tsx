import React from 'react';
import {Badge} from "@/components/ui/badge";
import {Brain, User, CheckCircle} from "lucide-react";
import { Card } from "@/components/ui/card";

interface AccountingStandardsDisplayProps {
  selectedFramework?: string | null;
  aiSuggestedStandards?: string[];
  userSelectedStandards?: string[];
  frameworks?: Array<{
    id: string;
    name: string;
    standards: Array<{
      id: string;
      name: string;
    }>;
  }>;
  showTitle?: boolean;
  compact?: boolean;
  // Optional props for demo/legacy compatibility
  standards?: AccountingStandard[];
  title?: string;
  description?: string;
  onStandardSelect?: (standardId: string) => void;
  selectable?: boolean;
}

export const AccountingStandardsDisplay: React.FC<AccountingStandardsDisplayProps> = ({
  selectedFramework = null,
  aiSuggestedStandards = [],
  userSelectedStandards = [],
  frameworks = [],
  showTitle = true,
  compact = false,
  // Legacy/demo props
  standards = [],
  title = "Accounting Standards Selection",
  description,
  onStandardSelect,
  // selectable = false,
}) => {
  // Handle legacy/demo mode when standards prop is provided
  if (standards && standards.length > 0) {
    return (
      <Card className="w-full">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">{title}</span>
          </div>
          {description && <p className="text-sm text-gray-600 mb-3">{description}</p>}
          <div className="flex flex-wrap gap-2">
            {standards.map((standard) => (
              <Badge 
                key={standard.id} 
                className="bg-secondary text-xs cursor-pointer hover:bg-blue-100"
                onClick={() => onStandardSelect?.(standard.id)}
              >
                {standard.title || standard.name || standard.id}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Get framework details
  const framework = frameworks.find(f => f.id === selectedFramework);
  const frameworkName = framework?.name || selectedFramework || 'Unknown Framework';

  // Categorize standards
  const aiOnlyStandards = aiSuggestedStandards.filter(std => !userSelectedStandards.includes(std));
  const userOnlyStandards = userSelectedStandards.filter(std => !aiSuggestedStandards.includes(std));
  const bothStandards = userSelectedStandards.filter(std => aiSuggestedStandards.includes(std));

  // Get standard names
  const getStandardName = (standardId: string) => {
    const standard = framework?.standards?.find(s => s.id === standardId);
    return standard?.name || standardId;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {showTitle && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Framework & Standards</span>
          </div>
        )}
        
        <div className="text-sm">
          <p className="font-medium text-gray-900">{frameworkName}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            <Badge className="bg-secondary text-xs">
              {userSelectedStandards.length} standards selected
            </Badge>
            {aiSuggestedStandards.length > 0 && (
              <Badge className="border text-xs">
                {aiSuggestedStandards.length} AI suggested
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4">
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          Accounting Framework & Standards
        </h3>
      )}

      {/* Framework Information */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Framework</h4>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="font-medium text-blue-900">{frameworkName}</p>
        </div>
      </div>

      {/* Standards Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Standards Selection Summary</h4>
          <div className="flex space-x-2">
            <Badge className="bg-secondary">
              {userSelectedStandards.length} Total Selected
            </Badge>
          </div>
        </div>

        {/* AI + User Agreed Standards */}
        {bothStandards.length > 0 && (
          <div className="border rounded-lg p-3 bg-green-50 border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-green-600" />
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                AI Recommended & User Confirmed ({bothStandards.length})
              </span>
            </div>
            <div className="space-y-1">
              {bothStandards.map((standardId) => (
                <div key={standardId} className="text-sm text-green-700 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                  {getStandardName(standardId)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User-Only Standards */}
        {userOnlyStandards.length > 0 && (
          <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                User Added Standards ({userOnlyStandards.length})
              </span>
            </div>
            <div className="space-y-1">
              {userOnlyStandards.map((standardId) => (
                <div key={standardId} className="text-sm text-blue-700 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-2 text-blue-500" />
                  {getStandardName(standardId)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI-Only Standards (not selected by user) */}
        {aiOnlyStandards.length > 0 && (
          <div className="border rounded-lg p-3 bg-gray-50 border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                AI Suggested but Not Selected ({aiOnlyStandards.length})
              </span>
            </div>
            <div className="space-y-1">
              {aiOnlyStandards.map((standardId) => (
                <div key={standardId} className="text-sm text-gray-600 flex items-center">
                  <div className="w-3 h-3 mr-2 rounded-full border border-gray-400" />
                  {getStandardName(standardId)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <h5 className="text-sm font-medium text-slate-700 mb-2">Selection Statistics</h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-600">AI Suggestions:</span>
              <span className="font-medium ml-1">{aiSuggestedStandards.length}</span>
            </div>
            <div>
              <span className="text-slate-600">User Final Selection:</span>
              <span className="font-medium ml-1">{userSelectedStandards.length}</span>
            </div>
            <div>
              <span className="text-slate-600">AI Acceptance Rate:</span>
              <span className="font-medium ml-1">
                {aiSuggestedStandards.length > 0 
                  ? Math.round((bothStandards.length / aiSuggestedStandards.length) * 100)
                  : 0}%
              </span>
            </div>
            <div>
              <span className="text-slate-600">User Additions:</span>
              <span className="font-medium ml-1">{userOnlyStandards.length}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Type exports
export type { AccountingStandardsDisplayProps };

// Export interface for AccountingStandard if needed by other components
export interface AccountingStandard {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  category?: string;
  isSelected?: boolean;
}

// Default export
export default AccountingStandardsDisplay;