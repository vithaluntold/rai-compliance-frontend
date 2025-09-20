"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
interface DocumentDetails {
  id: string;
  filename: string;
  status: string;
  uploaded_at: string;
}

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const documentId = params['documentId'] as string;

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const doc = await api.documents.get(documentId);
        // Map the Document type to DocumentDetails
        setDocument({
          id: doc.id,
          filename: doc.filename,
          status: doc.status || doc.analysis_status,
          uploaded_at: doc.upload_date,
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to load document details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, toast]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image src="/logo.png" alt="RAi" className="h-8 w-8" />
              <span className="ml-2 text-xl font-semibold text-white">
                RAi Compliance Engine
              </span>
            </div>
            <div className="text-sm text-blue-200">
              Document ID: {documentId}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Modern card with subtle shadow and better spacing */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header section with better typography */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Document Analysis
            </h1>
            <p className="text-gray-600">
              Review document details and proceed to compliance checking
            </p>
          </div>

          <div className="p-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Document Information Card */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-[hsl(var(--rai-primary))] rounded-full mr-3"></div>
                    Document Information
                  </h2>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Filename
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {document?.filename || "Loading..."}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Status
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                          document?.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            document?.status === "COMPLETED"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        ></div>
                        {document?.status || "PENDING"}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Uploaded At
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {document?.uploaded_at
                          ? new Date(document.uploaded_at).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "Not available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Card */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      Next Steps
                    </h2>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-[hsl(var(--rai-primary))] rounded-xl flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Ready for Analysis
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Your document has been processed and is ready for
                            compliance analysis. Click below to proceed with the
                            automated compliance checking.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-between pt-8 border-t border-gray-100">
              <Button
                onClick={() => router.back()}
                className="flex items-center px-6 py-3 text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>

              <Link
                href={'/extraction/${documentId}'}
                className="flex items-center px-8 py-3 bg-[hsl(var(--rai-primary))] text-white font-medium rounded-xl hover:bg-[hsl(var(--rai-primary))/90] transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <span className="mr-2">Continue Analysis</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
