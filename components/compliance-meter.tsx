import {useChecklist} from "@/context/checklist-context";
import {Check, AlertTriangle, Circle, AlertCircle} from "lucide-react";
import {motion} from "framer-motion";
"use client";


export function ComplianceMeter() {
  const { checklist } = useChecklist();

  // Calculate compliance metrics
  const totalItems = checklist.length;
  const resolvedItems = checklist.filter(
    (item) =>
      item.status === "Yes" ||
      item.status === "No" ||
      (item.status === "N/A" && item.comment && item.comment.trim() !== ""),
  ).length;

  const yesItems = checklist.filter((item) => item.status === "Yes").length;
  const noItems = checklist.filter((item) => item.status === "No").length;
  const naItems = checklist.filter(
    (item) =>
      item.status === "N/A" && item.comment && item.comment.trim() !== "",
  ).length;

  const compliancePercentage = totalItems > 0 ? Math.round((yesItems / totalItems) * 100) : 0;
  const completionPercentage = totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0;

  // Determine compliance level
  let complianceLevel = "Low";
  let complianceColor = "text-red-500";
  let bgColor = "bg-red-100";
  let icon = <AlertTriangle className="h-5 w-5 text-red-500" />;

  if (compliancePercentage >= 80) {
    complianceLevel = "High";
    complianceColor = "text-green-500";
    bgColor = "bg-green-100";
    icon = <CheckCircle className="h-5 w-5 text-green-500" />;
  } else if (compliancePercentage >= 50) {
    complianceLevel = "Medium";
    complianceColor = "text-amber-500";
    bgColor = "bg-amber-100";
    icon = <AlertCircle className="h-5 w-5 text-amber-500" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg p-4 ${bgColor} mb-6`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className={`font-bold ${complianceColor}`}>
              {complianceLevel} Compliance Level
            </h3>
            <p className="text-sm text-gray-600">
              {compliancePercentage}% of requirements are compliant
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="flex justify-between text-xs mb-1">
            <span>Completion: {completionPercentage}%</span>
            <span>
              <span className="text-green-500">{yesItems} Yes</span> •
              <span className="text-red-500"> {noItems} No</span> •
              <span className="text-gray-500"> {naItems} N/A</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-2.5 rounded-full bg-[hsl(var(--rai-primary))]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
