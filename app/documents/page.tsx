"use client";

import { useRouter } from "next/navigation";
import FileUpload from "@/components/file-upload";

export default function DocumentsPage() {
  const router = useRouter();

  const handleUploadComplete = (documentId: string) => {
    // Navigate to extraction page after successful upload
    router.push(`/extraction/${documentId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Upload Document</h1>
        <FileUpload onUploadComplete={handleUploadComplete} />
      </div>
    </div>
  );
}
