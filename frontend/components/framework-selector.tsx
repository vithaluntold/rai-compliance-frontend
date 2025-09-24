"use client";

import React, {useState, useEffect, useCallback} from "react";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Loader2, ArrowRight, X} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area";


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

interface FrameworkSelectorProps {
  onSelectionComplete: () => void;
  onError: (_error: Error | unknown) => void;
}

export default function FrameworkSelector({
  onSelectionComplete,
  onError,
}: FrameworkSelectorProps) {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>("");
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [availableStandards, setAvailableStandards] = useState<Standard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"framework" | "standards">("framework");
  // const [standardsLoaded, setStandardsLoaded] = useState<boolean>(false); // Unused variable removed

  useEffect(() => {
    if (selectedFramework) {
      const framework = frameworks.find((f) => f.id === selectedFramework);
      if (framework && framework.standards) {
        const filteredStandards = framework.standards.filter(
          (s) => s.available,
        );
        setAvailableStandards(filteredStandards);
        // setStandardsLoaded(true); // Removed unused state setter
        // Reset selected standards when framework changes
        setSelectedStandards([]);

        // Log for debugging
        
        // filteredStandards.forEach((std) =>
        //   // Removed console.log for production
} else {
        setAvailableStandards([]);
        setSelectedStandards([]);
        // setStandardsLoaded(false); // Removed unused state setter
      }
    } else {
      setAvailableStandards([]);
      setSelectedStandards([]);
      // setStandardsLoaded(false); // Removed unused state setter
    }
  }, [selectedFramework, frameworks]);

  const handleStandardToggle = (standardId: string) => {
    setSelectedStandards((current) => {
      const isSelected = current.includes(standardId);
      if (isSelected) {
        return current.filter((id) => id !== standardId);
      } else {
        return [...current, standardId];
      }
    });
  };

  const fetchFrameworks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch frameworks from the API endpoint
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL'] || 'https://rai-compliance-backend.onrender.com'}/api/v1/frameworks`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (
        data &&
        data.frameworks &&
        Array.isArray(data.frameworks)
      ) {
        if (data.frameworks.length === 0) {
          
          setError("No frameworks available");
        } else {
          setFrameworks(data.frameworks);
          
          data.frameworks.forEach((fw: Framework) => {
            // // Removed console.log for production
if (fw.standards && fw.standards.length > 0) {
              // // Removed console.log for production
}
          });
        }
      } else {
        setError("Failed to load frameworks: Invalid response format");
        onError("Failed to load frameworks");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to load frameworks: ${errorMessage}`);
      onError(`Failed to load frameworks: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  const handleSubmit = async () => {
    if (!selectedFramework) {
      setError("Please select a framework");
      return;
    }

    if (step === "framework") {
      // Move to standards selection
      setStep("standards");
      return;
    }

    // For standards step
    if (selectedStandards.length === 0) {
      setError("Please select at least one standard");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // // Removed console.log for production
// Check that the standards are available before submitting
      const framework = frameworks.find((f) => f.id === selectedFramework);
      if (!framework) {
        throw new Error("Selected framework not found");
      }

      const selectedStandardsInfo = selectedStandards.map((id) =>
        framework.standards.find((s) => s.id === id),
      );
      const unavailableStandards = selectedStandardsInfo.filter(
        (s) => !s || !s.available,
      );
      if (unavailableStandards.length > 0) {
        throw new Error(
          `The selected standards are not available: ${unavailableStandards.map((s) => s?.id).join(", ")}`,
        );
      }

      // Use the api.analysis.selectFramework method directly

      setTimeout(() => {
        onSelectionComplete();
      }, 500);
    } catch (err: unknown) {
      // Try to extract error message from the response
      let errorMessage = "Failed to select framework";

      if (err instanceof Error) {
        // Check if it's an HTTP error with response data
        const httpError = err as Error & {
          response?: {
            data?: {
              detail?: string;
              message?: string;
            };
          };
        };
        if (httpError.response && httpError.response.data) {
          errorMessage += `: ${httpError.response.data.detail || httpError.response.data.message || "Unknown error"}`;
        } else {
          errorMessage += `: ${err.message}`;
        }
      } else {
        errorMessage += ": Unknown error";
      }

      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFrameworkSelection = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h4 className="text-lg font-semibold mb-4">
        Select Financial Reporting Framework
      </h4>
      <p className="text-sm text-gray-600 mb-6">
        Choose the financial reporting framework applicable to the document
      </p>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="max-h-[400px] overflow-y-auto pr-2 mb-4">
        <RadioGroup
          value={selectedFramework}
          onValueChange={setSelectedFramework}
        >
          {frameworks.map((framework) => (
            <div
              key={framework.id}
              className="flex items-center space-x-2 py-2 border-b border-gray-100 last:border-0"
            >
              <RadioGroupItem
                value={framework.id}
                id={`framework-${framework.id}`}
              />
              <Label htmlFor={`framework-${framework.id}`} className="flex-1">
                <div className="flex flex-col">
                  <span className="font-medium">{framework.name}</span>
                  {framework.description && (
                    <span className="text-xs text-gray-500 mt-1">
                      {framework.description}
                      {framework.standards && (
                        <span className="ml-1 text-xs text-gray-400">
                          (
                          {
                            framework.standards.filter((s) => s.available)
                              .length
                          }{" "}
                          standards available)
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={handleSubmit}
          disabled={!selectedFramework || isSubmitting}
          className="bg-[hsl(var(--deep-blue))] hover:bg-[hsl(var(--electric-teal))] text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderStandardsSelection = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h4 className="text-lg font-semibold mb-4">
        Automated Compliance Checklist
      </h4>
      <p className="text-sm text-gray-600 mb-6">
        Select one or more standards to check compliance with
      </p>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {availableStandards.map((standard) => (
            <div
              key={standard.id}
              className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-0"
            >
              <Checkbox
                id={`standard-${standard.id}`}
                checked={selectedStandards.includes(standard.id)}
                onCheckedChange={() => handleStandardToggle(standard.id)}
              />
              <Label
                htmlFor={`standard-${standard.id}`}
                className="flex-1 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{standard.name}</span>
                  {standard.description && (
                    <span className="text-xs text-gray-500 mt-1">
                      {standard.description}
                    </span>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex justify-between mt-8">
        <Button
          onClick={() => setStep("framework")}
          className="border text-gray-600"
        >
          <X className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedStandards.length === 0 || isSubmitting}
          className="bg-[hsl(var(--deep-blue))] hover:bg-[hsl(var(--electric-teal))] text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Start Compliance Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading frameworks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {step === "framework" && renderFrameworkSelection()}
      {step === "standards" && renderStandardsSelection()}
    </div>
  );
}
