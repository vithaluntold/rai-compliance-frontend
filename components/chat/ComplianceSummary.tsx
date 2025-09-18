"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FileTextIcon,
  BarChart3Icon,
  DownloadIcon,
} from "lucide-react";
import {
  ComplianceStatusIndicator,
  ComplianceStatusSummary,
  calculateStatusSummary,
} from "./ComplianceStatusIndicator";
import type { ComplianceStatus } from "./ComplianceStatusIndicator";

interface ComplianceItem {
  id: string;
  status: ComplianceStatus;
  confidence: number;
  question: string;
  reference: string;
}

interface ComplianceSection {
  section: string;
  title: string;
  standard: string;
  items: ComplianceItem[];
}

interface ComplianceSummaryProps {
  sections: ComplianceSection[];
  metadata: {
    company_name: string;
    nature_of_business: string;
    operational_demographics: string;
    financial_statements_type?: string;
  };
  framework: string;
  standards: string[];
  completedAt?: string;
  onExport?: (format: "pdf" | "excel") => void;
  className?: string;
}

export function ComplianceSummary({
  sections,
  metadata,
  framework,
  standards,
  completedAt,
  onExport,
  className,
}: ComplianceSummaryProps) {
  // Calculate overall statistics
  const allItems = sections.flatMap((section) => section.items);
  const totalItems = allItems.length;
  const statusSummary = calculateStatusSummary(allItems);

  const compliantCount = statusSummary.find((s) => s.status === "YES")?.count || 0;
  const nonCompliantCount = statusSummary.find((s) => s.status === "NO")?.count || 0;
  const partialCount = statusSummary.find((s) => s.status === "PARTIAL")?.count || 0;
  const naCount = statusSummary.find((s) => s.status === "N/A")?.count || 0;

  const compliancePercentage = totalItems > 0 ? Math.round((compliantCount / totalItems) * 100) : 0;
  const averageConfidence = totalItems > 0
      ? Math.round(
          (allItems.reduce((sum, item) => sum + item.confidence, 0) /
            totalItems) *
            100,
        )
      : 0;

  // Identify critical issues (high confidence non-compliance)
  const criticalIssues = allItems.filter(
    (item) => item.status === "NO" && item.confidence > 0.8,
  ).length;

  // Group by standard for breakdown
  const standardBreakdown = standards.map((standard) => {
    const standardSections = sections.filter(
      (section) => section.standard === standard,
    );
    const standardItems = standardSections.flatMap((section) => section.items);
    const standardCompliant = standardItems.filter(
      (item) => item.status === "YES",
    ).length;
    const standardTotal = standardItems.length;
    const standardPercentage = standardTotal > 0
        ? Math.round((standardCompliant / standardTotal) * 100)
        : 0;

    return {
      standard,
      compliant: standardCompliant,
      total: standardTotal,
      percentage: standardPercentage,
    };
  });

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getComplianceIcon = (percentage: number) => {
    if (percentage >= 90)
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    if (percentage >= 70)
      return <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />;
    return <XCircleIcon className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-[#0087d9] flex items-center">
                <BarChart3Icon className="h-6 w-6 mr-2" />
                Compliance Summary
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {metadata.company_name} • {framework.toUpperCase()} Framework
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {completedAt && (
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {new Date(completedAt).toLocaleString()}
                  </div>
                </div>
              )}
              {onExport && (
                <div className="flex space-x-2">
                  <Button
                    className="border h-8 px-2"
                    onClick={() => onExport("pdf")}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    className="border h-8 px-2"
                    onClick={() => onExport("excel")}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center border-2 border-blue-100 bg-blue-50">
              <div className="flex items-center justify-center mb-2">
                {getComplianceIcon(compliancePercentage)}
              </div>
              <div
                className={`text-3xl font-bold ${getComplianceColor(compliancePercentage)}`}
              >
                {compliancePercentage}%
              </div>
              <div className="text-sm text-gray-600">Overall Compliance</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {compliantCount}
              </div>
              <div className="text-sm text-gray-600">Yes Items</div>
              <div className="text-xs text-gray-500 mt-1">
                of {totalItems} total
              </div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {criticalIssues}
              </div>
              <div className="text-sm text-gray-600">Critical Issues</div>
              <div className="text-xs text-gray-500 mt-1">High confidence</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {averageConfidence}%
              </div>
              <div className="text-sm text-gray-600">Avg. Confidence</div>
              <div className="text-xs text-gray-500 mt-1">Analysis quality</div>
            </Card>
          </div>

          {/* Status Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Status Breakdown</h3>
            <ComplianceStatusSummary
              statuses={statusSummary}
              total={totalItems}
              className="mb-4"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-lg font-bold text-green-600">
                  {compliantCount}
                </div>
                <div className="text-sm text-green-700">Compliant</div>
                <ComplianceStatusIndicator
                  status="YES"
                  showText={false}
                  className="h-8 px-2 mt-1 justify-center"
                />
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-lg font-bold text-red-600">
                  {nonCompliantCount}
                </div>
                <div className="text-sm text-red-700">Non-Compliant</div>
                <ComplianceStatusIndicator
                  status="NO"
                  showText={false}
                  className="h-8 px-2 mt-1 justify-center"
                />
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-lg font-bold text-yellow-600">
                  {partialCount}
                </div>
                <div className="text-sm text-yellow-700">Partial</div>
                <ComplianceStatusIndicator
                  status="PARTIAL"
                  showText={false}
                  className="h-8 px-2 mt-1 justify-center"
                />
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-lg font-bold text-gray-600">{naCount}</div>
                <div className="text-sm text-gray-700">Not Applicable</div>
                <ComplianceStatusIndicator
                  status="N/A"
                  showText={false}
                  className="h-8 px-2 mt-1 justify-center"
                />
              </div>
            </div>
          </div>

          {/* Standards Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Standards Performance
            </h3>
            <div className="space-y-3">
              {standardBreakdown.map((standard) => (
                <div
                  key={standard.standard}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {standard.standard}
                    </div>
                    <div className="text-sm text-gray-600">
                      {standard.compliant} of {standard.total} requirements met
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${getComplianceColor(standard.percentage)}`}
                      >
                        {standard.percentage}%
                      </div>
                    </div>
                    <div className="w-20">
                      <Progress value={standard.percentage} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company Information */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FileTextIcon className="h-5 w-5 mr-2" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Company:</span>
                <span className="ml-2 text-gray-600">
                  {metadata.company_name}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Business Nature:
                </span>
                <span className="ml-2 text-gray-600">
                  {metadata.nature_of_business}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Demographics:</span>
                <span className="ml-2 text-gray-600">
                  {metadata.operational_demographics}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Framework:</span>
                <span className="ml-2 text-gray-600">
                  {framework.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Standards:</span>
                <span className="ml-2 text-gray-600">
                  {standards.join(", ")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
