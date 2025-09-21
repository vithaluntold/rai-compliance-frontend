"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import {DocumentIcon} from "@/components/ui/professional-icons";
import { useToast } from "@/components/ui/use-toast";
import { validateFile } from "@/lib/file-validation";
import { safeApiCall, NetworkMonitor } from "@/lib/error-handling";
import { api } from "@/lib/api-client";
import type { ChatState } from "./chat-interface";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/theme-context";

interface ChatInputProps {
  onFileUpload: (file: unknown, response?: unknown) => void;
  onFrameworkSelection: (framework: string, standards: string[]) => void;
  chatState: ChatState;
  disabled?: boolean;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadError?: (_error: Error | unknown) => void;
  onUploadComplete?: () => void;
  isUploading?: boolean;
}

interface Framework {
  id: string;
  name: string;
  description: string;
  standards: Array<{
    id: string;
    name: string;
    description?: string;
    available: boolean;
  }>;
}

export function ChatInput({
  onFileUpload,
  onFrameworkSelection,
  chatState,
  disabled = false,
  onUploadStart,
  onUploadProgress,
  onUploadError,
  onUploadComplete,
  isUploading = false,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [showFrameworkSelector, setShowFrameworkSelector] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<string>("");
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loadingFrameworks, setLoadingFrameworks] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Connect to global theme context (theme automatically applied to document)
  useTheme();

  // Monitor network status
  useEffect(() => {
    NetworkMonitor.initialize();
    setIsOnline(NetworkMonitor.getStatus());

    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online);
      if (online) {
        onUploadError?.("");
      }
    };

    NetworkMonitor.addListener(handleNetworkChange);

    return () => {
      NetworkMonitor.removeListener(handleNetworkChange);
      NetworkMonitor.cleanup();
    };
  }, [onUploadError]);

  // Load frameworks from API with error handling
  useEffect(() => {
    const loadFrameworks = async () => {
      if (
        chatState.currentStep?.id === "framework-selection" &&
        frameworks.length === 0
      ) {
        setLoadingFrameworks(true);
        try {
          const response = await safeApiCall(
            () => api.analysis.getFrameworks(),
            "framework",
            {
              timeout: 15000,
              retryConfig: { maxRetries: 2 },
              showLoading: true,
            },
          );

          if (response['frameworks'] && Array.isArray(response['frameworks'])) {
            setFrameworks(response['frameworks']);
            toast({
              title: "Frameworks Loaded",
              description: `${response['frameworks'].length} frameworks available for selection.`,
              duration: 3000,
            });
          } else {
            // ✅ CRITICAL FIX: Ensure frameworks is always an array
            setFrameworks([]);
            // // Removed console.warn for production
}
        } catch {
          // // Removed console.error for production
// Error already shown by safeApiCall
        } finally {
          setLoadingFrameworks(false);
        }
      }
    };

    loadFrameworks();
  }, [chatState.currentStep, frameworks.length, toast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    onUploadError?.("");

    // Check network connectivity first
    if (!isOnline) {
      const errorMsg = "No internet connection. Please check your network and try again.";
      onUploadError?.(errorMsg);
      toast({
        title: "Upload Failed",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    try {
      const validationResult = await validateFile(file);
      
      if (!validationResult.isValid) {
        const errorMsg = validationResult.error || "File validation failed";
        onUploadError?.(errorMsg);
        toast({
          title: "File Validation Failed",
          description: validationResult.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "File Validated",
        description: `${file.name} passed all validation checks.`,
        duration: 2000,
      });

      await uploadFileWithProgress(file);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Failed to process file";
      onUploadError?.(errorMsg);
      toast({
        title: "File Processing Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const uploadFileWithProgress = async (file: File) => {
    onUploadStart?.();
    onUploadProgress?.(10);

    let currentProgress = 10;
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (currentProgress < 70) {
          currentProgress += 10;
          onUploadProgress?.(currentProgress);
        }
      }, 500);

      const response = await safeApiCall(
        () => api.documents.upload(file, "enhanced"),
        "upload",
        {
          timeout: 60000, // Longer timeout for file uploads
          retryConfig: {
            maxRetries: 2,
            baseDelay: 2000,
          },
        },
      );

      clearInterval(progressInterval);
      onUploadProgress?.(100);

      // Success handling - PASS THE RESPONSE OBJECT TO CHAT-INTERFACE
      setTimeout(() => {
        // Debug: chat-input calling onFileUpload
        onFileUpload(file, response);
        onUploadComplete?.();
      }, 500);

      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded and is being processed.`,
        duration: 4000,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Upload failed";
      onUploadError?.(errorMsg);
      throw error;
    }
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return;

    // Handle different types of input based on current step
    if (
      chatState.currentStep?.id === "framework-selection" &&
      !showFrameworkSelector
    ) {
      setShowFrameworkSelector(true);
      setInputValue("");
    } else {
      // For now, just clear the input
      setInputValue("");
    }
  };

  const handleFrameworkSubmit = () => {
    if (!selectedFramework || selectedStandards.length === 0) {
      toast({
        title: "Incomplete Selection",
        description: "Please select a framework and at least one standard.",
        variant: "destructive",
      });
      return;
    }

    onFrameworkSelection(selectedFramework, selectedStandards);
    setShowFrameworkSelector(false);
    setSelectedFramework("");
    setSelectedStandards([]);
  };

  const toggleStandardSelection = (standardId: string) => {
    setSelectedStandards((prev) =>
      prev.includes(standardId)
        ? prev.filter((id) => id !== standardId)
        : [...prev, standardId],
    );
  };

  const getCurrentInputPlaceholder = () => {
    if (disabled) return "Processing...";
    if (!isOnline) return "No internet connection...";

    switch (chatState.currentStep?.id) {
      case "upload":
        return "Upload a document or type a message...";
      case "metadata":
        return "Confirm metadata in the side panel...";
      case "framework-selection":
        return "Select accounting standards to analyze...";
      case "analysis":
        return "Analysis in progress...";
      case "results":
        return "Ask questions about your results...";
      default:
        return "Type a message...";
    }
  };

  const shouldShowUploadArea = () => {
    return !chatState.documentId && chatState.currentStep?.id === "upload";
  };

  const shouldShowFrameworkSelector = () => {
    return (
      chatState.documentId &&
      chatState.documentMetadata &&
      chatState.currentStep?.id === "framework-selection" &&
      showFrameworkSelector
    );
  };

  const shouldShowInput = () => {
    return !shouldShowUploadArea() && !shouldShowFrameworkSelector();
  };

  return (
    <div className="border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-black">
      <div className="p-4 relative">
        {/* Network Status Indicator */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl flex items-center shadow-sm"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <WifiOff className="h-5 w-5 text-red-500 mr-2" />
            </motion.div>
            <span className="text-red-700 text-sm font-medium">
              No internet connection. Please check your network.
            </span>
          </motion.div>
        )}

        {/* Upload Progress Indicator - REMOVED: Now handled by side panel */}
        {/* Upload Error Display - REMOVED: Now handled by side panel */}

        <AnimatePresence mode="wait">
          {/* Compact File Upload Area - Bottom of Chat */}
          {shouldShowUploadArea() && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3"
            >
              <div
                className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                } ${!isOnline || isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => !isUploading && isOnline && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {isUploading ? "Uploading..." : "Upload financial document (PDF, DOCX)"}
                  </span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                aria-label="Upload financial document"
                title="Select a PDF or DOCX file to upload"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                disabled={!isOnline || isUploading}
              />
            </motion.div>
          )}

          {/* Framework Selector */}
          {shouldShowFrameworkSelector() && (
            <motion.div
              key="framework"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card className="p-6 bg-white dark:bg-black border border-slate-200 dark:border-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xl font-bold text-slate-700 dark:text-white"
                    >
                      Select Accounting Standards
                    </motion.h3>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        className="bg-transparent h-8 px-2 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                        onClick={() => setShowFrameworkSelector(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>

                  {/* Framework Selection */}
                  <div className="mb-6">
                    <motion.label
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="block text-sm font-semibold mb-3 text-slate-700"
                    >
                      Framework
                    </motion.label>
                    {loadingFrameworks ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center py-12 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "linear",
                          }}
                        >
                          <Loader2 className="h-8 w-8 text-blue-600" />
                        </motion.div>
                        <span className="ml-3 text-slate-600 font-medium">
                          Loading frameworks...
                        </span>
                      </motion.div>
                    ) : frameworks.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 text-slate-500 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200"
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 3 }}
                        >
                          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-orange-500" />
                        </motion.div>
                        <div className="font-medium mb-2">
                          No frameworks available
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            className="border h-8 px-2 mt-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => window.location.reload()}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                          </Button>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        {/* ✅ CRITICAL FIX: Protect frameworks.map() against non-array values */}
                        {(Array.isArray(frameworks) ? frameworks : []).map((framework, index) => (
                          <motion.div
                            key={framework.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              className={`p-4 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                                selectedFramework === framework.id
                                  ? "border-blue-500 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 shadow-md"
                                  : "hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 hover:shadow-sm hover:border-blue-300"
                              }`}
                              onClick={() => setSelectedFramework(framework.id)}
                            >
                              {/* Selection glow effect */}
                              {selectedFramework === framework.id && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10"
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                />
                              )}

                              <div className="flex items-center space-x-4 relative z-10">
                                <motion.div
                                  className={`w-5 h-5 border-2 rounded-lg flex items-center justify-center ${
                                    selectedFramework === framework.id
                                      ? "bg-blue-500 border-blue-500"
                                      : "border-slate-300 group-hover:border-blue-400"
                                  }`}
                                  animate={
                                    selectedFramework === framework.id
                                      ? { scale: [1, 1.1, 1] }
                                      : {}
                                  }
                                  transition={{ duration: 0.3 }}
                                >
                                  {selectedFramework === framework.id && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.1 }}
                                    >
                                      <CheckCircle className="h-3 w-3 text-white" />
                                    </motion.div>
                                  )}
                                </motion.div>
                                <div className="flex-1">
                                  <div className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                                    {framework.name}
                                  </div>
                                  <div className="text-sm text-slate-600 mt-1">
                                    {framework.description}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Standards Selection */}
                  {selectedFramework && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mb-6"
                    >
                      <motion.label
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="block text-sm font-semibold mb-3 text-slate-700"
                      >
                        <span className="flex items-center space-x-2">
                          <span>Standards</span>
                          <motion.div
                            key={selectedStandards.length}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                          >
                            {selectedStandards.length} selected
                          </motion.div>
                        </span>
                      </motion.label>
                      <div className="max-h-64 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-50/50 to-white p-3 rounded-xl border border-slate-200/50">
                        {/* ✅ CRITICAL FIX: Safe standards mapping with array protection */}
                        {Array.isArray(frameworks) && 
                          frameworks.find((f) => f.id === selectedFramework)?.standards &&
                          Array.isArray(frameworks.find((f) => f.id === selectedFramework)?.standards) ? 
                          frameworks.find((f) => f.id === selectedFramework)?.standards.map((standard, index) => (
                            <motion.div
                              key={standard.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{
                                scale: standard.available ? 1.02 : 1,
                              }}
                              whileTap={{
                                scale: standard.available ? 0.98 : 1,
                              }}
                            >
                              <Card
                                className={`p-4 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                                  !standard.available
                                    ? "opacity-60 cursor-not-allowed bg-gray-50"
                                    : selectedStandards.includes(standard.id)
                                      ? "border-blue-500 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 shadow-md"
                                      : "hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 hover:shadow-sm hover:border-blue-300"
                                }`}
                                onClick={() =>
                                  standard.available &&
                                  toggleStandardSelection(standard.id)
                                }
                              >
                                {/* Selection pulse effect */}
                                {selectedStandards.includes(standard.id) && (
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10"
                                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 2,
                                    }}
                                  />
                                )}

                                <div className="flex items-center space-x-4 relative z-10">
                                  <motion.div
                                    className={`w-5 h-5 border-2 rounded-lg flex items-center justify-center ${
                                      selectedStandards.includes(standard.id)
                                        ? "bg-blue-500 border-blue-500"
                                        : "border-slate-300 group-hover:border-blue-400"
                                    }`}
                                    animate={
                                      selectedStandards.includes(standard.id)
                                        ? {
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 360, 0],
                                          }
                                        : {}
                                    }
                                    transition={{ duration: 0.5 }}
                                  >
                                    {selectedStandards.includes(
                                      standard.id,
                                    ) && (
                                      <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.1 }}
                                      >
                                        <CheckCircle className="h-3 w-3 text-white" />
                                      </motion.div>
                                    )}
                                  </motion.div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-slate-800">
                                      {standard.name}
                                    </div>
                                    {standard.description && (
                                      <div className="text-sm text-slate-600 mt-1">
                                        {standard.description}
                                      </div>
                                    )}
                                    {!standard.available && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                      >
                                        <Badge
                                          className="bg-secondary text-xs mt-2 bg-orange-100 text-orange-700 border-orange-200"
                                        >
                                          Coming Soon
                                        </Badge>
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          )) : 
                          <div className="text-center py-4 text-gray-500">No standards available</div>
                        }
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleFrameworkSubmit}
                      disabled={
                        !selectedFramework ||
                        selectedStandards.length === 0 ||
                        !isOnline
                      }
                      className={`w-full py-3 relative overflow-hidden group transition-all duration-300 ${
                        !selectedFramework ||
                        selectedStandards.length === 0 ||
                        !isOnline
                          ? "bg-gray-400 hover:bg-gray-400"
                          : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                      }`}
                    >
                      {/* Button glow effect */}
                      {selectedFramework &&
                        selectedStandards.length > 0 &&
                        isOnline && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-400/50 via-indigo-400/50 to-blue-400/50"
                            animate={{ opacity: [0, 0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          />
                        )}

                      <span className="relative z-10 flex items-center justify-center font-semibold">
                        {!isOnline ? (
                          <>
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              <WifiOff className="h-5 w-5 mr-2" />
                            </motion.div>
                            No Connection
                          </>
                        ) : (
                          <>
                            <motion.div
                              animate={
                                selectedFramework &&
                                selectedStandards.length > 0
                                  ? {
                                      rotate: [0, 10, -10, 0],
                                      scale: [1, 1.1, 1],
                                    }
                                  : {}
                              }
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              <Send className="h-5 w-5 mr-2" />
                            </motion.div>
                            Start Analysis
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Regular Input */}
          {shouldShowInput() && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex space-x-3 relative"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 via-blue-100/30 to-indigo-100/30 rounded-xl -z-10" />

              <div className="flex-1 relative group">
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={getCurrentInputPlaceholder()}
                    disabled={disabled || !isOnline}
                    onKeyPress={(e) => e.key === "Enter" && handleInputSubmit()}
                    className="pr-12 py-3 bg-white/70 backdrop-blur-sm border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder:text-slate-400"
                  />

                  {/* Input decorative elements */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {!isOnline && (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                      >
                        <WifiOff className="h-4 w-4 text-gray-400" />
                      </motion.div>
                    )}
                    {inputValue.trim() && isOnline && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-2 h-2 bg-green-500 rounded-full"
                      />
                    )}
                  </div>

                  {/* Focus glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"
                    animate={{
                      background: [
                        "linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.2) 50%, rgba(59,130,246,0.2) 100%)",
                        "linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(59,130,246,0.2) 50%, rgba(99,102,241,0.2) 100%)",
                      ],
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleInputSubmit}
                  disabled={disabled || !inputValue.trim() || !isOnline}
                  className={`h-12 w-12 transition-all duration-300 ${
                    inputValue.trim() && isOnline
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                      : "bg-gray-400 hover:bg-gray-400"
                  }`}
                >
                  <motion.div
                    animate={
                      inputValue.trim() && isOnline
                        ? {
                            rotate: [0, 15, -15, 0],
                            scale: [1, 1.1, 1],
                          }
                        : {}
                    }
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Indicator */}
        {chatState.fileName && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center space-x-3 text-sm bg-gradient-to-r from-slate-50/50 to-blue-50/50 p-3 rounded-xl border border-slate-200/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <DocumentIcon className="h-4 w-4" />
            </motion.div>
            <span className="text-slate-700 font-medium">Document: </span>
            <span className="text-blue-600 font-semibold">
              {chatState.fileName}
            </span>
            {chatState.isProcessing && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center"
              >
                <Badge
                  className="bg-secondary ml-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                    }}
                    className="mr-1"
                  >
                    <Loader2 className="h-3 w-3" />
                  </motion.div>
                  Processing
                </Badge>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
