"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/components/ui/use-toast";
import {api} from "@/lib/api-client";
import {enhancedApi, setLoadingManager} from "@/lib/enhanced-api-client";
import {useLoading} from "@/contexts/loading-context";
import {ArrowLeft, Download, Loader2, Activity, Clock, CheckCircle, AlertCircle} from "lucide-react";
import {cn} from "@/lib/utils";


// Define status types as an enum
enum ComplianceStatus {
  YES = "YES",
  NO = "NO",
  NA = "N/A",
}

interface Evidence {
  reference: string;
  requirement: string;
  description: string;
  pageNumber: string;
  extract: string;
  contentAnalysis: string;
}

interface ChecklistItem {
  id: string;
  question: string;
  reference: string;
  status: ComplianceStatus;
  confidence?: number;
  explanation?: string;
  evidence?: string[];
  comments?: string;
  suggestion?: string;
}

interface Section {
  section: string;
  title: string;
  items: ChecklistItem[];
}

interface ComplianceData {
  sections: Section[];
  standards?: string[];
  metadata?: {
    company_name: string;
    nature_of_business: string;
    operational_demographics: string;
    financial_statements_type?: string;
  };
}

interface StandardTab {
  id: string;
  title: string;
}

function parseEvidence(evidence: string[] | undefined): Evidence[] {
  if (!evidence || evidence.length === 0) return [];
  return evidence.map((item) => {
    const [
      reference,
      requirement,
      description,
      pageNumber,
      extract,
      contentAnalysis,
    ] = item.split("|");
    return {
      reference: reference || "",
      requirement: requirement || "",
      description: description || "",
      pageNumber: pageNumber || "",
      extract: extract || "",
      contentAnalysis: contentAnalysis || "",
    };
  });
}

function ComplianceItem({
  item,
  onStatusChange,
}: {
  item: ChecklistItem;
  onStatusChange: (
    id: string,
    status: ComplianceStatus,
    comments?: string,
  ) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const evidenceData = parseEvidence(item.evidence);

  return (
    <div className="border-b border-gray-200 py-6 last:border-b-0">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm text-gray-900">{item.question}</p>
            <p className="text-xs text-gray-500 mt-1">
              Reference: {item.reference}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`yes-${item.id}`}
                  name={`status-${item.id}`}
                  value={ComplianceStatus.YES}
                  checked={item.status === ComplianceStatus.YES}
                  onChange={() =>
                    isEditing && onStatusChange(item.id, ComplianceStatus.YES)
                  }
                  disabled={!isEditing}
                  className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor={`yes-${item.id}`}
                  className="text-sm text-gray-700"
                >
                  Yes
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`no-${item.id}`}
                  name={`status-${item.id}`}
                  value={ComplianceStatus.NO}
                  checked={item.status === ComplianceStatus.NO}
                  onChange={() =>
                    isEditing && onStatusChange(item.id, ComplianceStatus.NO)
                  }
                  disabled={!isEditing}
                  className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor={`no-${item.id}`}
                  className="text-sm text-gray-700"
                >
                  No
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`na-${item.id}`}
                  name={`status-${item.id}`}
                  value={ComplianceStatus.NA}
                  checked={item.status === ComplianceStatus.NA}
                  onChange={() =>
                    isEditing && onStatusChange(item.id, ComplianceStatus.NA)
                  }
                  disabled={!isEditing}
                  className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor={`na-${item.id}`}
                  className="text-sm text-gray-700"
                >
                  N/A
                </label>
              </div>
            </div>
            <Button
              className="border h-8 px-2 ml-4"
              onClick={() => setIsEditing(!isEditing)}
            >
            
              {isEditing ? "Done" : "Edit"}
            </Button>
          </div>
        </div>

        {item.confidence && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">
              Confidence: {Math.round(item.confidence * 100)}%
            </div>
            <Progress value={item.confidence * 100} className="h-1" />
          </div>
        )}

        {item.explanation && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Explanation</h4>
            <p className="text-sm text-gray-600">{item.explanation}</p>
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Evidence</h4>
          {evidenceData.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Reference
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Requirement
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Page Number
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Extract
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Content Analysis
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {evidenceData.map((evidence, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {evidence.reference}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {evidence.requirement}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {evidence.description}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {evidence.pageNumber}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {evidence.extract}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {evidence.contentAnalysis}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              No evidence available
            </div>
          )}
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Suggested Disclosure</h4>
          <div className="bg-[hsl(var(--rai-primary))/10] border border-[hsl(var(--rai-primary))/20] rounded-md p-4 text-sm text-[hsl(var(--rai-primary))]">
            {item.suggestion || "No suggested disclosure available"}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Your Comments</h4>
          {isEditing ? (
            <Textarea
              placeholder="Add your comments here..."
              className="min-h-[100px]"
              defaultValue={item.comments}
              onChange={(e) =>
                onStatusChange(item.id, item.status, e.target.value)
              }
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 min-h-[100px]">
              {item.comments || "No comments added yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompliancePage() {
  const params = useParams();
  const { toast } = useToast();
  const { startOperation, updateProgress, completeOperation, failOperation, loadingState } = useLoading();
  const documentId = params.documentId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ComplianceData | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<string>("");
  const [standards, setStandards] = useState<StandardTab[]>([]);
  const [apiCallCount, setApiCallCount] = useState(0);
  const [lastApiCall, setLastApiCall] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string>("Initializing");

  // Set up the loading manager for the enhanced API
  useEffect(() => {
    setLoadingManager({
      startOperation,
      updateProgress,
      completeOperation,
      failOperation,
    });
  }, [startOperation, updateProgress, completeOperation, failOperation]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchChecklist = async () => {
      try {
        setApiCallCount(prev => prev + 1);
        setLastApiCall(new Date().toLocaleTimeString());
        setProcessingStage("Loading compliance checklist");
        
        const result = await enhancedApi.compliance.getChecklist(documentId);

        // Check for a final status
        if (result.status === "COMPLETED" || result.status === "FAILED") {
          setData(result as any); // Type casting to resolve compatibility issue
          if (result.sections) {
            const fetchedStandards = result.sections.map((section: any) => ({
              id: section.section
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              title: section.title,
            }));
            setStandards(fetchedStandards);
            if (fetchedStandards.length > 0) {
              setSelectedStandard(fetchedStandards[0].id);
            }
          }
          setProcessingStage("Completed");
          setLoading(false);
          if (intervalId) clearInterval(intervalId);
        } else {
          // Keep polling if still processing
          setProcessingStage(`Processing: ${result.status}`);
          setLoading(true);
        }

        if (result.status === "FAILED") {
          setError("Analysis failed. Please try again.");
        }
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to fetch checklist");
        setLoading(false);
        if (intervalId) clearInterval(intervalId);
      }
    };

    if (documentId) {
      fetchChecklist(); // Initial fetch
      intervalId = setInterval(fetchChecklist, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [documentId]);

  const handleStatusChange = (
    itemId: string,
    status: ComplianceStatus,
    comments?: string,
  ) => {
    setData((prevData) => {
      if (!prevData) return null;

      const updatedSections = prevData.sections.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id === itemId) {
            const updatedItem = { ...item };
            if (status) updatedItem.status = status;
            if (comments !== undefined) updatedItem.comments = comments;
            return updatedItem;
          }
          return item;
        }),
      }));

      return { ...prevData, sections: updatedSections };
    });
  };

  const handleDownload = () => {
    if (!data) {
      toast({
        title: "Error",
        description: "No data available to download.",
        variant: "destructive",
      });
      return;
    }

    let reportHtml = `
      <html>
        <head>
          <title>Compliance Report - ${documentId}</title>
          <style>
            body { font-family: sans-serif; margin: 2em; }
            h1, h2, h3 { color: #333; }
            h1 { font-size: 2em; }
            h2 { font-size: 1.5em; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 2em; }
            .section { margin-bottom: 2em; }
            .item { border: 1px solid #ddd; border-radius: 5px; padding: 1em; margin-bottom: 1em; }
            .item p { margin: 0.5em 0; }
            .item .label { font-weight: bold; }
            .status-YES { color: green; }
            .status-NO { color: red; }
            .status-NA { color: grey; }
            .suggestion { background-color: #e6f7ff; border: 1px solid #91d5ff; padding: 1em; border-radius: 5px; }
            .comments { background-color: #f6f6f6; border: 1px solid #ddd; padding: 1em; border-radius: 5px; }
            ul { margin: 0.5em 0 0.5em 1.5em; }
          </style>
        </head>
        <body>
          <h1>Compliance Report</h1>
          <p><strong>Document ID:</strong> ${documentId}</p>
    `;

    if (data.metadata) {
      reportHtml += `
        <div class="section">
          <h2>Metadata</h2>
          <div class="item">
            <p><span class="label">Company Name:</span> ${data.metadata.company_name}</p>
            <p><span class="label">Nature of Business:</span> ${data.metadata.nature_of_business}</p>
            <p><span class="label">Operational Demographics:</span> ${data.metadata.operational_demographics}</p>
            ${
              standards && standards.length > 0
                ? `
              <p><span class="label">Selected Standards:</span></p>
              <ul>${standards.map((std) => `<li>${std.title}</li>`).join("")}</ul>
            `
                : ""
            }
          </div>
        </div>
      `;
    }

    // Print all standards' questions (all sections and their checklist items)
    data.sections.forEach((section) => {
      reportHtml += `
        <div class="section">
          <h2>${section.title}</h2>
      `;
      section.items.forEach((item) => {
        reportHtml += `
          <div class="item">
            <p><span class="label">Question:</span> ${item.question}</p>
            <p><span class="label">Reference:</span> ${item.reference}</p>
            <p><span class="label">Status:</span> <span class="status-${item.status}">${item.status}</span></p>
            <p><span class="label">Confidence:</span> ${item.confidence ? (item.confidence * 100).toFixed(0) + "%" : "N/A"}</p>
            <p><span class="label">Explanation:</span> ${item.explanation || ""}</p>
            <div class="suggestion">
              <p><span class="label">Suggested Disclosure:</span></p>
              <p>${item.suggestion || "No suggestion available"}</p>
            </div>
            <div class="comments">
              <p><span class="label">Your Comments:</span></p>
              <p>${item.comments || "No comments added yet"}</p>
            </div>
          </div>
        `;
      });
      reportHtml += `</div>`;
    });

    reportHtml += `</body></html>`;

    const blob = new Blob([reportHtml], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `compliance-report-${documentId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedSection = data?.sections.find(
    (section) =>
      section.section
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^a-z0-9-]/g, "") === selectedStandard,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-[hsl(var(--rai-primary))/10] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--rai-primary))]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Loading Compliance Analysis
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {processingStage}
            </p>
            
            {/* API Activity Panel */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700 font-medium">API Activity</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-600 text-xs font-medium">Live</span>
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">API Calls Made:</span>
                  <span className="font-semibold text-gray-900">{apiCallCount}</span>
                </div>
                {lastApiCall && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Call:</span>
                    <span className="font-semibold text-gray-900">{lastApiCall}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Stage:</span>
                  <span className="font-semibold text-gray-900">{processingStage}</span>
                </div>
                {loadingState.isLoading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-800 font-medium">{loadingState.currentOperation}</span>
                    </div>
                    {loadingState.progress > 0 && (
                      <div className="mt-2">
                        <Progress value={loadingState.progress} className="h-1" />
                        <p className="text-xs text-blue-600 mt-1">{loadingState.progress}% complete</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Progress value={75} className="w-full h-2" />
              <p className="text-xs text-gray-500">
                This may take a few minutes depending on document complexity
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No data available
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href={`/documents/${documentId}`} passHref>
          <Button className="bg-transparent gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Document
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Compliance Checklist</h1>
            <p className="text-gray-600">Document ID: {documentId}</p>
          </div>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {standards.map((standard) => (
              <button
                key={standard.id}
                onClick={() => setSelectedStandard(standard.id)}
                className={cn(
                  "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                  selectedStandard === standard.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                )}
              >
                {standard.title}
              </button>
            ))}
          </nav>
        </div>

        {selectedSection ? (
          <div className="space-y-4">
            {selectedSection.items.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm">
                <ComplianceItem
                  item={item}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Select a standard to see the details.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
