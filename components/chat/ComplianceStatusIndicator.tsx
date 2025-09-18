"use client";

import {
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  MinusCircleIcon,
  InfoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type ComplianceStatus = "YES" | "NO" | "PARTIAL" | "N/A" | "UNKNOWN";

interface ComplianceStatusIndicatorProps {
  status: ComplianceStatus;
  confidence?: number;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showConfidence?: boolean;
  className?: string;
}

export function ComplianceStatusIndicator({
  status,
  confidence,
  size = "md",
  showText = true,
  showConfidence = false,
  className,
}: ComplianceStatusIndicatorProps) {
  const getStatusConfig = (status: ComplianceStatus) => {
    switch (status) {
      case "YES":
        return {
          icon: CheckCircleIcon,
          label: "Compliant",
          badge:
            "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
          textColor: "text-green-700",
          iconColor: "text-green-500",
        };
      case "NO":
        return {
          icon: XCircleIcon,
          label: "Non-Compliant",
          badge: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
          textColor: "text-red-700",
          iconColor: "text-red-500",
        };
      case "PARTIAL":
        return {
          icon: AlertCircleIcon,
          label: "Partially Compliant",
          badge:
            "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
          textColor: "text-yellow-700",
          iconColor: "text-yellow-500",
        };
      case "N/A":
        return {
          icon: MinusCircleIcon,
          label: "Not Applicable",
          badge: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
          textColor: "text-gray-600",
          iconColor: "text-gray-400",
        };
      default:
        return {
          icon: InfoIcon,
          label: "Unknown",
          badge: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
          textColor: "text-gray-600",
          iconColor: "text-gray-400",
        };
    }
  };

  const getSizeConfig = (size: "sm" | "md" | "lg") => {
    switch (size) {
      case "sm":
        return {
          icon: "h-3 w-3",
          text: "text-xs",
          padding: "px-2 py-1",
          gap: "space-x-1",
        };
      case "lg":
        return {
          icon: "h-5 w-5",
          text: "text-sm font-medium",
          padding: "px-3 py-2",
          gap: "space-x-2",
        };
      default: // md
        return {
          icon: "h-4 w-4",
          text: "text-sm",
          padding: "px-2.5 py-1.5",
          gap: "space-x-1.5",
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const sizeConfig = getSizeConfig(size);
  const IconComponent = statusConfig.icon;

  if (!showText) {
    // Icon only mode
    return (
      <div
        className={cn("inline-flex items-center", className)}
        title={statusConfig.label}
      >
        <IconComponent
          className={cn(sizeConfig.icon, statusConfig.iconColor)}
        />
      </div>
    );
  }

  return (
    <Badge
      className={cn(
        "border",
        statusConfig.badge,
        sizeConfig.padding,
        "inline-flex items-center transition-colors",
        sizeConfig.gap,
        className,
      )}
    >
      <IconComponent className={cn(sizeConfig.icon, statusConfig.iconColor)} />
      <span className={cn(sizeConfig.text, statusConfig.textColor)}>
        {statusConfig.label}
      </span>
      {showConfidence && confidence !== undefined && (
        <span className={cn("font-mono", sizeConfig.text, "opacity-75")}>
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </Badge>
  );
}

// Utility component for displaying a summary of compliance statuses
interface ComplianceStatusSummaryProps {
  statuses: Array<{ status: ComplianceStatus; count: number }>;
  total: number;
  className?: string;
}

export function ComplianceStatusSummary({
  statuses,
  total,
  className,
}: ComplianceStatusSummaryProps) {
  const compliancePercentage = total > 0
      ? Math.round(
          ((statuses.find((s) => s.status === "YES")?.count || 0) / total) *
            100,
        )
      : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Overall Compliance
        </span>
        <span className="text-lg font-bold text-blue-600">
          {compliancePercentage}%
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map(({ status, count }) => (
          <div key={status} className="flex items-center space-x-1">
            <ComplianceStatusIndicator
              status={status}
              className="h-8 px-2"
              showText={false}
            />
            <span className="text-sm text-gray-600">{count}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${compliancePercentage}%` }}
        />
      </div>
    </div>
  );
}

// Utility function to calculate status summary from items
export function calculateStatusSummary(
  items: Array<{ status: ComplianceStatus }>,
) {
  const statusCounts = items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<ComplianceStatus, number>,
  );

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status as ComplianceStatus,
    count,
  }));
}
