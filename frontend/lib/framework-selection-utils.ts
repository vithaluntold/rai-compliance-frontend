/**
 * Framework Selection Utility Functions
 * Extracted from framework-selector.tsx for reuse in chat interface
 */

// ===== DATA STRUCTURES =====

export interface Framework {
  id: string;
  name: string;
  description: string;
  standards: Standard[];
}

export interface Standard {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

interface FrameworksApiResponse {
  frameworks: Framework[];
}

interface ApiError {
  response?: {
    data?: {
      detail?: string;
      message?: string;
    };
  };
  message?: string;
}

export interface FrameworkSelectionState {
  frameworks: Framework[];
  selectedFramework: string;
  selectedStandards: string[];
  availableStandards: Standard[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  step: "framework" | "standards";
  standardsLoaded: boolean;
}

export interface FrameworkSelectionRequest {
  framework: string;
  standards: string[];
}

// ===== STATE MANAGEMENT HELPERS =====

export const createInitialFrameworkState = (): FrameworkSelectionState => ({
  frameworks: [],
  selectedFramework: "",
  selectedStandards: [],
  availableStandards: [],
  isLoading: true,
  isSubmitting: false,
  error: null,
  step: "framework",
  standardsLoaded: false,
});

// ===== SELECTION LOGIC =====

/**
 * Updates available standards when framework changes
 */
export const updateAvailableStandards = (
  selectedFramework: string,
  frameworks: Framework[],
): { availableStandards: Standard[]; standardsLoaded: boolean } => {
  if (!selectedFramework) {
    return {
      availableStandards: [],
      standardsLoaded: false,
    };
  }

  const framework = frameworks.find((f) => f.id === selectedFramework);
  if (framework && framework.standards) {
    const filteredStandards = framework.standards.filter((s) => s.available);

    // Log for debugging
    // Removed console.log for production
    
    return {
      availableStandards: filteredStandards,
      standardsLoaded: true,
    };
  }

  return {
    availableStandards: [],
    standardsLoaded: false,
  };
};

/**
 * Toggles standard selection
 */
export const toggleStandardSelection = (
  standardId: string,
  currentSelectedStandards: string[],
): string[] => {
  const isSelected = currentSelectedStandards.includes(standardId);
  if (isSelected) {
    return currentSelectedStandards.filter((id) => id !== standardId);
  } else {
    return [...currentSelectedStandards, standardId];
  }
};

/**
 * Selects all available standards
 */
export const selectAllStandards = (
  availableStandards: Standard[],
): string[] => {
  return availableStandards.map((standard) => standard.id);
};

/**
 * Clears all selected standards
 */
export const clearAllStandards = (): string[] => {
  return [];
};

// ===== VALIDATION LOGIC =====

/**
 * Validates framework selection
 */
export const validateFrameworkSelection = (
  selectedFramework: string,
): string | null => {
  if (!selectedFramework) {
    return "Please select a framework";
  }
  return null;
};

/**
 * Validates standards selection
 */
export const validateStandardsSelection = (
  selectedStandards: string[],
): string | null => {
  if (selectedStandards.length === 0) {
    return "Please select at least one standard";
  }
  return null;
};

/**
 * Validates that selected standards are available
 */
export const validateStandardsAvailability = (
  selectedStandards: string[],
  frameworks: Framework[],
  selectedFramework: string,
): string | null => {
  const framework = frameworks.find((f) => f.id === selectedFramework);
  if (!framework) {
    return "Selected framework not found";
  }

  const selectedStandardsInfo = selectedStandards.map((id) =>
    framework.standards.find((s) => s.id === id),
  );

  const unavailableStandards = selectedStandardsInfo.filter(
    (s) => !s || !s.available,
  );
  if (unavailableStandards.length > 0) {
    return `The selected standards are not available: ${unavailableStandards.map((s) => s?.id).join(", ")}`;
  }

  return null;
};

/**
 * Complete validation for framework selection submission
 */
export const validateFrameworkSubmission = (
  step: "framework" | "standards",
  selectedFramework: string,
  selectedStandards: string[],
  frameworks: Framework[],
): string | null => {
  // Framework step validation
  const frameworkError = validateFrameworkSelection(selectedFramework);
  if (frameworkError) return frameworkError;

  // Standards step validation
  if (step === "standards") {
    const standardsError = validateStandardsSelection(selectedStandards);
    if (standardsError) return standardsError;

    const availabilityError = validateStandardsAvailability(
      selectedStandards,
      frameworks,
      selectedFramework,
    );
    if (availabilityError) return availabilityError;
  }

  return null;
};

// ===== API RESPONSE HELPERS =====

/**
 * Processes frameworks API response
 */
export const processFrameworksResponse = (
  response: unknown,
): { frameworks: Framework[]; error: string | null } => {
  // Type guard to check if response has the expected structure
  const typedResponse = response as FrameworksApiResponse | null | undefined;
  
  if (
    !typedResponse ||
    !typedResponse.frameworks ||
    !Array.isArray(typedResponse.frameworks)
  ) {
    return {
      frameworks: [],
      error: "Failed to load frameworks: Invalid response format",
    };
  }

  if (typedResponse.frameworks.length === 0) {
    
    return {
      frameworks: [],
      error: "No frameworks available",
    };
  }

  // Log each framework and its standards for debugging
  typedResponse.frameworks.forEach((fw: Framework) => {
    // Removed console.log for production
    if (fw.standards && fw.standards.length > 0) {
      // Removed console.log for production
    }
  });

  return {
    frameworks: typedResponse.frameworks,
    error: null,
  };
};

/**
 * Extracts error message from API error response
 */
export const extractApiErrorMessage = (
  err: unknown,
  defaultMessage: string = "Unknown error",
): string => {
  let errorMessage = defaultMessage;

  // Type guard to safely access error properties
  const typedError = err as ApiError;

  if (typedError.response && typedError.response.data) {
    const detail = typedError.response.data.detail || typedError.response.data.message;
    if (detail) {
      errorMessage += `: ${detail}`;
    }
  } else if (typedError.message) {
    errorMessage += `: ${typedError.message}`;
  }

  return errorMessage;
};

// ===== LOGGING HELPERS =====

/**
 * Logs framework selection for debugging
 */
export const logFrameworkSelection = (): void => {
  // Removed console.log for production
};
