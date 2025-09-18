import React, { useState, useCallback } from "react";
import {useDropzone} from "react-dropzone";

// Mock types and functions for test file
interface DocumentStatus {
  status: string;
}

const uploadDocument = async (file: File) => {
  return { document_id: 'mock-id' };
};

const getDocumentStatus = async (id: string): Promise<DocumentStatus> => {
  return { status: 'completed' };
};

interface DocumentUploadProps {
  onUploadComplete: (documentId: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);
      setError(null);

      try {
        const response = await uploadDocument(file);
        onUploadComplete(response.document_id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to upload document",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '4px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          borderColor: isDragActive ? '#2196f3' : (isUploading ? '#4caf50' : '#ccc'),
          backgroundColor: isDragActive ? 'rgba(33, 150, 243, 0.1)' : (isUploading ? 'rgba(76, 175, 80, 0.1)' : 'transparent')
        }}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p>Uploading document...</p>
          </div>
        ) : (
          <div>
            <p>Drag and drop a PDF file here, or click to select</p>
            <p style={{ color: '#666', fontSize: '0.9em', marginTop: '5px' }}>Supported format: PDF</p>
          </div>
        )}
      </div>
      {error && <div style={{ color: '#f44336', marginTop: '10px', textAlign: 'center' }}>{error}</div>}
    </div>
  );
};

export default DocumentUpload;
