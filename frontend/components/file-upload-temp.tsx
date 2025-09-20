"use client";

import type React from "react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onUploadComplete?: (documentId: string) => void;
  onFileSelected?: (_file: unknown) => void;
  onUploadStart?: () => void;
}

export default function FileUpload({
  onUploadComplete,
}: FileUploadProps) {
  return (
    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
      <h3 className="text-lg font-semibold mb-4">File Upload Component</h3>
      <p className="text-gray-500 mb-4">This component is being updated for deployment.</p>
      <Button 
        onClick={() => {
          if (onUploadComplete) {
            onUploadComplete("temp-doc-id");
          }
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Temporary Upload Button
      </Button>
    </div>
  );
}