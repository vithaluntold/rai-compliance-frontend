"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Document } from "@/lib/api-client";
import { api } from "@/lib/api-client";
import Image from "next/image";
export default function ExtractionPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await api.documents.getAll();
        setDocuments(docs);
      } catch {
        // Error is ignored as we don't need to handle it
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[hsl(var(--rai-primary))] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image src="/logo.png" alt="RAi Logo" width={32} height={32} />
              <span className="ml-2 text-xl font-semibold text-white">
                RAi Compliance Engine
              </span>
            </div>
            <div className="text-sm text-blue-200">Document Management</div>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-12 space-y-8">
        {/* Modern page header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Document Management
            </h1>
            <p className="text-gray-600">
              Manage and track your compliance analysis documents
            </p>
          </div>
          <Button
            onClick={() => router.push("/upload")}
            className="bg-[hsl(var(--rai-primary))] hover:bg-[hsl(var(--rai-primary))/90] text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload New Document
          </Button>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No documents yet
            </h3>
            <p className="text-gray-600 mb-6">
              Upload your first financial document to get started with
              compliance analysis
            </p>
            <Button
              onClick={() => router.push("/upload")}
              className="bg-[hsl(var(--rai-primary))] hover:bg-[hsl(var(--rai-primary))/90] text-white px-6 py-3 rounded-xl"
            >
              Upload Document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                onClick={() => router.push('/extraction/${doc.id}')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-[hsl(var(--rai-primary))/10] rounded-xl flex items-center justify-center mr-3">
                        <svg
                          className="w-5 h-5 text-[hsl(var(--rai-primary))]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 truncate text-lg">
                          {doc.filename}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Uploaded{" "}
                      {new Date(doc.upload_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                      doc.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : doc.status === "FAILED"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : doc.status === "PROCESSING"
                            ? "bg-[hsl(var(--rai-primary))/10] text-[hsl(var(--rai-primary))] border border-[hsl(var(--rai-primary))/20]"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Status: {doc.analysis_status || "Pending"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
