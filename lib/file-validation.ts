import {toast} from "@/components/ui/use-toast";
import {Check, X} from "lucide-react";

// File validation configuration
export const FILE_VALIDATION_CONFIG = {
  allowedTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword", // Legacy .doc files
  ],
  allowedExtensions: [".pdf", ".docx", ".doc"],
  maxSize: 50 * 1024 * 1024, // 50MB
  minSize: 1024, // 1KB minimum
};

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  errorType?: "type" | "size" | "corrupted" | "empty";
  file?: File;
}

// Enhanced file validation with detailed error handling
export async function validateFile(file: File): Promise<FileValidationResult> {
  try {
    // Check if file exists
    if (!file) {
      return {
        isValid: false,
        error: "No file selected",
        errorType: "empty",
      };
    }

    // Check file size - minimum
    if (file.size < FILE_VALIDATION_CONFIG.minSize) {
      return {
        isValid: false,
        error: 'File is too small (${formatFileSize(file.size)}). Minimum size is ${formatFileSize(FILE_VALIDATION_CONFIG.minSize)}.',
        errorType: "size",
      };
    }

    // Check file size - maximum
    if (file.size > FILE_VALIDATION_CONFIG.maxSize) {
      return {
        isValid: false,
        error: 'File is too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(FILE_VALIDATION_CONFIG.maxSize)}.',
        errorType: "size",
      };
    }

    // Check file extension - this is the primary validation
    const fileExtension = getFileExtension(file.name);
    if (
      !FILE_VALIDATION_CONFIG.allowedExtensions.includes(
        fileExtension.toLowerCase(),
      )
    ) {
      return {
        isValid: false,
        error: 'Invalid file type "${fileExtension}". Please upload a PDF or Word document (.pdf, .docx, .doc).',
        errorType: "type",
      };
    }

    // Skip MIME type validation as browsers can be inconsistent with this

    // Basic file type validation only - removed overly strict integrity check
    // Just ensure it's not completely empty
    if (file.size === 0) {
      return {
        isValid: false,
        error: "File appears to be empty. Please select a valid document.",
        errorType: "empty",
      };
    }

    // File passed all validations
    return {
      isValid: true,
      file,
    };
  } catch (__error) {
    return {
      isValid: false,
      error: "An error occurred while validating the file. Please try again.",
      errorType: "corrupted",
    };
  }
}

// Check basic file integrity
async function checkFileIntegrity(file: File): Promise<boolean> {
  try {
    const extension = getFileExtension(file.name).toLowerCase();

    // Read the first few bytes to check file signatures
    const buffer = await readFileHeader(file, 1024);
    const bytes = new Uint8Array(buffer);

    if (extension === ".pdf") {
      // PDF files should start with %PDF
      const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF
      return arrayStartsWith(bytes, pdfSignature);
    } else if (extension === ".docx") {
      // DOCX files are ZIP archives starting with PK
      const zipSignature = [0x50, 0x4b]; // PK
      return arrayStartsWith(bytes, zipSignature);
    } else if (extension === ".doc") {
      // DOC files have a specific signature
      const docSignature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
      return arrayStartsWith(bytes, docSignature);
    }

    return true; // Unknown format, assume valid
  } catch {
    return false; // Error reading file, assume corrupted
  }
}

// Read file header bytes
function readFileHeader(file: File, bytes: number): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file.slice(0, bytes));
  });
}

// Check if array starts with signature
function arrayStartsWith(array: Uint8Array, signature: number[]): boolean {
  if (array.length < signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (array[i] !== signature[i]) return false;
  }
  return true;
}

// Get file extension
function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf("."));
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Handle file validation with user feedback
export async function handleFileValidation(file: File): Promise<boolean> {
  const validation = await validateFile(file);

  if (!validation.isValid) {
    let title = "File Validation Error";
    const description = validation.error || "Unknown validation error";

    switch (validation.errorType) {
      case "type":
        title = "Invalid File Type";
        break;
      case "size":
        title = "File Size Issue";
        break;
      case "corrupted":
        title = "File Corrupted";
        break;
      case "empty":
        title = "No File Selected";
        break;
    }

    toast({
      title,
      description,
      variant: "destructive",
      duration: 6000, // Longer duration for error messages
    });

    return false;
  }

  return true;
}

// Enhanced drag and drop validation
export function validateDraggedFiles(
  dataTransfer: DataTransfer,
): FileValidationResult {
  if (!dataTransfer.files || dataTransfer.files.length === 0) {
    return {
      isValid: false,
      error: "No files were dropped",
      errorType: "empty",
    };
  }

  if (dataTransfer.files.length > 1) {
    return {
      isValid: false,
      error: "Please drop only one file at a time",
      errorType: "type",
    };
  }

  return {
    isValid: true,
    file: dataTransfer.files[0],
  };
}
