"use client";

import { useState, useEffect, useCallback } from 'react';

interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // in seconds
  progress: number; // 0-100
}

interface ProcessingStatus {
  currentStageId: string;
  stages: ProcessingStage[];
  startTime: number;
  estimatedEndTime: number | null;
  overallProgress: number;
}

const DEFAULT_STAGES: ProcessingStage[] = [
  {
    id: 'upload',
    name: 'Upload',
    description: 'Uploading document to server',
    estimatedDuration: 10,
    progress: 0,
  },
  {
    id: 'processing',
    name: 'Processing',
    description: 'Analyzing document structure',
    estimatedDuration: 30,
    progress: 0,
  },
  {
    id: 'extraction',
    name: 'Metadata Extraction',
    description: 'Extracting key information',
    estimatedDuration: 45,
    progress: 0,
  },
  {
    id: 'compliance',
    name: 'Compliance Analysis',
    description: 'Running compliance checks',
    estimatedDuration: 60,
    progress: 0,
  },
  {
    id: 'finalization',
    name: 'Finalization',
    description: 'Preparing results',
    estimatedDuration: 15,
    progress: 0,
  },
];

export function useProcessingStatus(customStages?: ProcessingStage[]) {
  const [status, setStatus] = useState<ProcessingStatus>({
    currentStageId: '',
    stages: customStages || DEFAULT_STAGES,
    startTime: 0,
    estimatedEndTime: null,
    overallProgress: 0,
  });

  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second
  useEffect(() => {
    if (status.startTime === 0) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - status.startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [status.startTime]);

  const startProcessing = useCallback((stageId?: string) => {
    const firstStage = stageId || status.stages[0]?.id || '';
    const totalDuration = status.stages.reduce((sum, stage) => sum + stage.estimatedDuration, 0);
    
    setStatus(prev => ({
      ...prev,
      currentStageId: firstStage,
      startTime: Date.now(),
      estimatedEndTime: Date.now() + (totalDuration * 1000),
      overallProgress: 0,
    }));
  }, [status.stages]);

  const updateStageProgress = useCallback((stageId: string, progress: number) => {
    setStatus(prev => {
      const updatedStages = prev.stages.map(stage =>
        stage.id === stageId ? { ...stage, progress: Math.min(100, Math.max(0, progress)) } : stage
      );

      // Calculate overall progress
      const totalWeight = updatedStages.reduce((sum, stage) => sum + stage.estimatedDuration, 0);
      const weightedProgress = updatedStages.reduce(
        (sum, stage) => sum + (stage.progress * stage.estimatedDuration) / 100,
        0
      );
      const overallProgress = (weightedProgress / totalWeight) * 100;

      return {
        ...prev,
        stages: updatedStages,
        overallProgress,
      };
    });
  }, []);

  const advanceToNextStage = useCallback((currentStageId: string) => {
    setStatus(prev => {
      const currentIndex = prev.stages.findIndex(stage => stage.id === currentStageId);
      const nextStage = prev.stages[currentIndex + 1];
      
      if (!nextStage) return prev;

      // Mark current stage as complete
      const updatedStages = prev.stages.map(stage =>
        stage.id === currentStageId ? { ...stage, progress: 100 } : stage
      );

      return {
        ...prev,
        currentStageId: nextStage.id,
        stages: updatedStages,
      };
    });
  }, []);

  const completeProcessing = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      stages: prev.stages.map(stage => ({ ...stage, progress: 100 })),
      overallProgress: 100,
    }));
  }, []);

  const getCurrentStage = useCallback(() => {
    return status.stages.find(stage => stage.id === status.currentStageId);
  }, [status.stages, status.currentStageId]);

  const getEstimatedTimeRemaining = useCallback(() => {
    if (!status.estimatedEndTime || status.overallProgress >= 100) return 0;
    
    const remaining = Math.max(0, status.estimatedEndTime - Date.now());
    return Math.ceil(remaining / 1000); // Convert to seconds
  }, [status.estimatedEndTime, status.overallProgress]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }, []);

  return {
    status,
    elapsedTime: Math.floor(elapsedTime / 1000),
    estimatedTimeRemaining: getEstimatedTimeRemaining(),
    currentStage: getCurrentStage(),
    startProcessing,
    updateStageProgress,
    advanceToNextStage,
    completeProcessing,
    formatTime,
  };
}