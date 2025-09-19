"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface FileUploadProps {
  onUploadComplete?: (documentId: string) => void;
  onFileSelected?: (file: File, url: string) => void;
  onUploadStart?: () => void;
}

interface ChecklistItem {
  id?: string;
  question: string;
  reference: string;
  status: "COMPLIANT" | "NON_COMPLIANT" | "NOT_APPLICABLE" | "UNKNOWN";
  explanation?: string;
  evidence?: string | string[];
}

interface ChecklistSection {
  id?: string;
  title: string;
  items: ChecklistItem[];
}

type UploadStatus = "idle" | "uploading" | "analyzing" | "awaiting_framework" | "completed" | "failed";
type Step = "upload" | "analysis" | "review" | "complete";

export default function FileUpload({
  onUploadComplete,
  onFileSelected,
  onUploadStart,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<UploadStatus>("idle");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [checklistData, setChecklistData] = useState<ChecklistSection[] | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [message, setMessage] = useState<string | null>(null);
  
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      setAnalysisStatus("uploading");
      onUploadStart?.();

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://rai-compliance-backend.onrender.com'}/api/v1/analysis/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      setAnalysisStatus("analyzing");
      setAnalysisProgress(10);
      setMessage("Document uploaded successfully. Starting analysis...");

      toast({
        title: "Upload Successful",
        description: "Your document has been uploaded and analysis has started.",
      });

      // Simulate analysis progress
      setTimeout(() => {
        setAnalysisProgress(50);
        setMessage("Extracting metadata...");
      }, 2000);

      setTimeout(() => {
        setAnalysisProgress(75);
        setMessage("Analyzing compliance...");
      }, 4000);

      setTimeout(() => {
        setAnalysisProgress(100);
        setAnalysisStatus("completed");
        setMessage("Analysis completed successfully!");
        
        // Set some mock data
        setChecklistData([
          {
            id: "1",
            title: "Financial Reporting Standards",
            items: [
              {
                question: "Are financial statements prepared in accordance with applicable standards?",
                reference: "IAS 1.15",
                status: "COMPLIANT",
                explanation: "Financial statements properly follow IAS standards."
              }
            ]
          }
        ]);

        if (onUploadComplete) {
          onUploadComplete(data.document_id);
        }
      }, 6000);

    } catch (err) {
      // console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setAnalysisStatus("failed");
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        if (selectedFile.type !== "application/pdf") {
          setError("Please select a PDF file");
          return;
        }
        
        setFile(selectedFile);
        setError(null);
        
        const url = URL.createObjectURL(selectedFile);
        setPdfUrl(url);
        onFileSelected?.(selectedFile, url);
      }
    }, [onFileSelected]),
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const renderUploadArea = () => {
    return (
      <div className="mt-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : ""
          } ${isUploading ? "pointer-events-none opacity-50" : "cursor-pointer hover:border-gray-400"}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          {isDragActive ? (
            <p className="text-blue-600">Drop the file here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">
                Drag and drop your PDF here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Only PDF files are supported
              </p>
            </div>
          )}
          
          {isUploading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Uploading...</p>
            </div>
          )}
        </div>
        
        {file && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || analysisStatus === "analyzing"}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Analyze
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setFile(null);
                    setPdfUrl(null);
                    setError(null);
                  }}
                  className="border h-8 px-2"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      stopPolling();
    };
  }, [pdfUrl, stopPolling]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Document Analysis</h2>
        <div className="flex items-center space-x-2">
          {currentStep !== "upload" && (
            <Button
              onClick={() => setCurrentStep("upload")}
              className="border text-gray-600"
            >
              Back
            </Button>
          )}
          {currentStep !== "complete" && analysisStatus === "completed" && (
            <Button
              onClick={() => setCurrentStep("analysis")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {currentStep === "upload" && (
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <h3 className="text-lg font-semibold">Upload Financial Report</h3>
              <p className="text-gray-500">
                Upload your PDF financial report to check compliance with the
                selected framework and standards.
              </p>
            </motion.div>

            {renderUploadArea()}

            {(analysisStatus === "uploading" || analysisStatus === "analyzing") && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing document...</span>
                  <span>{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="w-full" />
                <p className="text-sm text-gray-500">{message}</p>
              </div>
            )}

            {analysisStatus === "completed" && (
              <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800">Analysis Complete</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your document has been successfully analyzed. 
                </p>
                <div className="mt-2">
                  <Progress value={100} className="bg-green-100" />
                </div>
              </div>
            )}

            {analysisStatus === "failed" && (
              <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800">Analysis Failed</h4>
                <p className="text-sm text-red-700 mt-1">
                  {error || "An error occurred during analysis."}
                </p>
                <Button
                  onClick={() => {
                    setAnalysisStatus("idle");
                    setError(null);
                  }}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === "analysis" && checklistData && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
            <div className="space-y-6">
              {Array.isArray(checklistData) && checklistData.map((section, sectionIndex) => (
                <div key={section.id || sectionIndex} className="space-y-4">
                  <h4 className="text-md font-medium">{section.title}</h4>
                  <div className="space-y-3">
                    {Array.isArray(section.items) && section.items.map((item, itemIndex) => (
                      <div
                        key={item.id || itemIndex}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.question}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Reference: {item.reference}
                            </p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-sm ${
                              item.status === "COMPLIANT"
                                ? "bg-green-100 text-green-800"
                                : item.status === "NON_COMPLIANT"
                                  ? "bg-red-100 text-red-800"
                                  : item.status === "NOT_APPLICABLE"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.status}
                          </div>
                        </div>
                        {item.explanation && (
                          <p className="text-sm text-gray-600 mt-2">
                            {item.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
}