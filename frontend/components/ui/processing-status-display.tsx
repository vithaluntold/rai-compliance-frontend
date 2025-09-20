"use client";

import React from 'react';
import { useProcessingStatus } from '@/hooks/use-processing-status';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingStatusDisplayProps {
  isActive: boolean;
  onProcessingComplete?: () => void;
  customStages?: Array<{
    id: string;
    name: string;
    description: string;
    estimatedDuration: number;
    progress: number;
  }>;
}

export function ProcessingStatusDisplay({ 
  isActive, 
  onProcessingComplete,
  customStages 
}: ProcessingStatusDisplayProps) {
  const {
    status,
    elapsedTime,
    estimatedTimeRemaining,
    currentStage,
    formatTime,
  } = useProcessingStatus(customStages);

  // Call completion callback when processing is done
  React.useEffect(() => {
    if (status.overallProgress >= 100 && onProcessingComplete) {
      onProcessingComplete();
    }
  }, [status.overallProgress, onProcessingComplete]);

  if (!isActive) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Processing Status</h3>
            <p className="text-sm text-gray-600">Real-time analysis progress</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(status.overallProgress)}%
          </div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Overall Progress</span>
          <span className="text-gray-900 font-medium">
            {Math.round(status.overallProgress)}%
          </span>
        </div>
        <Progress value={status.overallProgress} className="h-3" />
      </div>

      {/* Time Information */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
            <Clock className="h-3 w-3" />
            <span className="text-xs font-medium">Elapsed</span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatTime(elapsedTime)}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
            <Clock className="h-3 w-3" />
            <span className="text-xs font-medium">Remaining</span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {estimatedTimeRemaining > 0 ? formatTime(estimatedTimeRemaining) : 'Finalizing...'}
          </div>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Processing Stages</h4>
        <div className="space-y-2">
          {status.stages.map((stage) => {
            const isCurrent = stage.id === status.currentStageId;
            const isCompleted = stage.progress >= 100;
            const isPending = !isCurrent && !isCompleted;

            return (
              <div
                key={stage.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-all",
                  isCurrent && "bg-blue-50 border border-blue-200",
                  isCompleted && "bg-green-50 border border-green-200",
                  isPending && "bg-gray-50 border border-gray-200"
                )}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : isCurrent ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-blue-900",
                      isCompleted && "text-green-900",
                      isPending && "text-gray-700"
                    )}>
                      {stage.name}
                    </p>
                    <span className={cn(
                      "text-xs",
                      isCurrent && "text-blue-600",
                      isCompleted && "text-green-600",
                      isPending && "text-gray-500"
                    )}>
                      {Math.round(stage.progress)}%
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs mt-1",
                    isCurrent && "text-blue-700",
                    isCompleted && "text-green-700",
                    isPending && "text-gray-500"
                  )}>
                    {stage.description}
                  </p>
                  
                  {isCurrent && stage.progress > 0 && (
                    <div className="mt-2">
                      <Progress value={stage.progress} className="h-1" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Activity */}
      {currentStage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Currently processing: {currentStage.name}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {currentStage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}