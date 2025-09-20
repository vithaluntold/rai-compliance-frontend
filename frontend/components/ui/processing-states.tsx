import React from 'react';
import {cn} from "@/lib/utils";

interface ProcessingStepProps {
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  icon?: React.ReactNode;
  estimatedTime?: string;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  title,
  description,
  isActive,
  isCompleted,
  icon,
  estimatedTime,
}) => {
  return (
    <div className={cn(
      "flex items-start space-x-4 p-4 rounded-lg border transition-all duration-300",
      isActive && "border-blue-500 bg-blue-50 shadow-md",
      isCompleted && "border-green-500 bg-green-50",
      !isActive && !isCompleted && "border-gray-200 bg-gray-50 opacity-60"
    )}>
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
        isActive && "bg-blue-500 animate-pulse",
        isCompleted && "bg-green-500",
        !isActive && !isCompleted && "bg-gray-300"
      )}>
        {isCompleted ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : isActive ? (
          <div className="w-3 h-3 bg-white rounded-full animate-ping" />
        ) : (
          icon || <div className="w-3 h-3 bg-white rounded-full" />
        )}
      </div>
      
      <div className="flex-1">
        <h3 className={cn(
          "font-medium transition-colors duration-300",
          isActive && "text-blue-700",
          isCompleted && "text-green-700",
          !isActive && !isCompleted && "text-gray-500"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-sm mt-1 transition-colors duration-300",
          isActive && "text-blue-600",
          isCompleted && "text-green-600",
          !isActive && !isCompleted && "text-gray-400"
        )}>
          {description}
        </p>
        {isActive && estimatedTime && (
          <p className="text-xs text-blue-500 mt-1 font-medium">
            ⏱️ {estimatedTime}
          </p>
        )}
      </div>
    </div>
  );
};

interface ProcessingOverlayProps {
  title: string;
  currentStep: string;
  progress: number;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    icon?: React.ReactNode;
    estimatedTime?: string;
  }>;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  title,
  currentStep,
  progress,
  steps,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}% Complete</p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => (
            <ProcessingStep
              key={step.id}
              title={step.title}
              description={step.description}
              isActive={step.id === currentStep}
              isCompleted={steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id)}
              icon={step.icon}
              estimatedTime={step.estimatedTime}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Please keep this window open while processing...
          </p>
        </div>
      </div>
    </div>
  );
};

interface AnalysisProgressProps {
  currentStandard: string;
  completedStandards: number;
  totalStandards: number;
  progressPercent: number;
  estimatedTimeRemaining: number;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentStandard,
  completedStandards,
  totalStandards,
  progressPercent,
  estimatedTimeRemaining,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Compliance Analysis in Progress</h3>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-blue-600">{progressPercent}%</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Currently Analyzing:</p>
          <p className="font-medium text-gray-900">{currentStandard}</p>
        </div>
        <div>
          <p className="text-gray-600">Standards Progress:</p>
          <p className="font-medium text-gray-900">{completedStandards} / {totalStandards}</p>
        </div>
        <div>
          <p className="text-gray-600">Estimated Time Left:</p>
          <p className="font-medium text-gray-900">{estimatedTimeRemaining} minutes</p>
        </div>
        <div>
          <p className="text-gray-600">Status:</p>
          <p className="font-medium text-green-600 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Processing...
          </p>
        </div>
      </div>
    </div>
  );
};

interface MetadataProcessingProps {
  stage: 'extracting' | 'validating' | 'completed';
}

export const MetadataProcessing: React.FC<MetadataProcessingProps> = ({ stage }) => {
  const stages = [
    { id: 'extracting', title: 'Extracting Information', description: 'Reading document content...' },
    { id: 'validating', title: 'Validating Data', description: 'Checking information accuracy...' },
    { id: 'completed', title: 'Ready for Review', description: 'Metadata extraction complete' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Company Metadata Processing</h3>
      </div>

      <div className="space-y-3">
        {stages.map((stageItem, index) => (
          <div key={stageItem.id} className="flex items-center space-x-3">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
              stage === stageItem.id && "bg-blue-500 animate-pulse",
              stages.findIndex(s => s.id === stage) > index && "bg-green-500",
              stages.findIndex(s => s.id === stage) < index && "bg-gray-300"
            )}>
              {stages.findIndex(s => s.id === stage) > index ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : stage === stageItem.id ? (
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              ) : (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <div>
              <p className={cn(
                "font-medium transition-colors duration-300",
                stage === stageItem.id && "text-blue-700",
                stages.findIndex(s => s.id === stage) > index && "text-green-700",
                stages.findIndex(s => s.id === stage) < index && "text-gray-500"
              )}>
                {stageItem.title}
              </p>
              <p className={cn(
                "text-sm transition-colors duration-300",
                stage === stageItem.id && "text-blue-600",
                stages.findIndex(s => s.id === stage) > index && "text-green-600",
                stages.findIndex(s => s.id === stage) < index && "text-gray-400"
              )}>
                {stageItem.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};