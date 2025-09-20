"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ChecklistItem from "@/components/checklist-item";
import { ComplianceMeter } from "@/components/compliance-meter";
import Image from "next/image";
import { api } from "@/lib/api-client";
import { FileDown, Loader2, Shield, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ComplianceItem {
  id: string;
  question: string;
  reference: string;
  status: string;
  confidence: number;
  explanation: string;
  evidence: string | string[];
  comments: string;
}

interface ComplianceSection {
  title: string;
  items: ComplianceItem[];
}

interface ComplianceReportData {
  sections: ComplianceSection[];
}

interface ChecklistFormProps {
  fileId: string | null;
}

export default function ChecklistForm({ fileId }: ChecklistFormProps) {
  const [checklist, setChecklist] = useState<ComplianceReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  // Calculate if complete based on checklist data
  const isComplete = checklist?.sections?.every((section: ComplianceSection) =>
      section.items?.every((item: ComplianceItem) => item.status && item.status !== "N/A"),
    ) || false;

  useEffect(() => {
    const fetchChecklist = async () => {
      setLoading(true);
      try {
        if (!fileId) throw new Error("No file ID provided");

        // Get the checklist data
        const data = await api.analysis.getComplianceReport(fileId);
        setChecklist(data as unknown as ComplianceReportData);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load checklist data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      fetchChecklist();
    }
  }, [fileId, toast]);

  const handleSave = async () => {
    if (!fileId || !checklist) return;

    setSaving(true);
    try {
      // Save each checklist item
      for (const section of checklist.sections || []) {
        for (const item of section.items || []) {
          await api.analysis.updateComplianceItem(fileId, item.id, {
            status: item.status,
            comments: item.comments || "",
          });
        }
      }

      setSaved(true);
      toast({
        title: "Checklist saved",
        description: "Your checklist has been saved successfully.",
      });
    } catch {
      toast({
        title: "Save failed",
        description:
          "There was an error saving your checklist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    // Create a JSON blob and download it
    const data = JSON.stringify(checklist, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ias40-checklist.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report downloaded",
      description: "Your checklist report has been downloaded as JSON.",
    });
  };

  if (loading) {
    return (
      <Card className="p-8 shadow-lg border-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center space-y-6"
        >
          <motion.div
            className="relative w-24 h-24 animate-pulse-teal"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <Image
              src="/logo.png"
              alt="RAi Logo"
              fill
              className="object-contain"
            />
          </motion.div>
          <div className="text-center">
            <h3 className="rai-brand-title text-xl">
              RAi is analyzing your document
            </h3>
            <p className="text-gray-500 mt-2">
              Our AI is reviewing your document for IAS 40 disclosures. This may
              take a moment...
            </p>
          </div>
          <div className="w-full max-w-md bg-gray-100 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[hsl(var(--rai-primary))]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="rai-compliance-engine text-xl">
            IAS 40 Disclosure Checklist
          </h2>
          <p className="text-gray-500">
            Review the AI-generated responses and make any necessary
            corrections.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isComplete ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center text-[hsl(var(--rai-primary))] text-sm bg-[hsl(var(--rai-primary))/0.1] px-3 py-1 rounded-full"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete
            </motion.span>
          ) : (
            <span className="text-amber-600 text-sm bg-amber-50 px-3 py-1 rounded-full">
              Incomplete
            </span>
          )}
        </div>
      </motion.div>

      <Accordion
        type="multiple"
        defaultValue={
          checklist?.sections?.map((_, sectionIndex) => `section-${sectionIndex}`) || []
        }
        className="space-y-4"
      >
        {checklist?.sections?.map((section, sectionIndex) => (
          <motion.div
            key={`section-${sectionIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <AccordionItem
              value={`section-${sectionIndex}`}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="font-medium">
                  {section.title || `Section ${sectionIndex + 1}`}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 p-4"
                  >
                    {sectionIndex === 0 && <ComplianceMeter />}
                    {section.items?.map((item) => (
                      <ChecklistItem
                        key={item.id}
                        item={{
                          id: item.id,
                          question: item.question,
                          reference: item.reference,
                          status: item.status || "",
                          adequacy: "", // Not available in API response
                          confidence: item.confidence || 0,
                          ai_explanation: item.explanation || "",
                          evidence: Array.isArray(item.evidence)
                            ? item.evidence.join(", ")
                            : item.evidence || "",
                          user_comment: item.comments || "",
                          is_resolved: false,
                        }}
                        onUpdate={(itemId: string, updates: Record<string, unknown>) => {
                          // Update the item in the checklist data
                          if (checklist) {
                            const updatedChecklist = { ...checklist };
                            const targetSectionIndex = updatedChecklist.sections?.findIndex((s) =>
                                s.items?.some((i) => i.id === itemId),
                              );
                            if (
                              targetSectionIndex !== undefined &&
                              targetSectionIndex >= 0
                            ) {
                              const itemIndex = updatedChecklist.sections?.[
                                targetSectionIndex
                              ]?.items?.findIndex((i) => i.id === itemId);
                              if (itemIndex !== undefined && itemIndex >= 0 && updatedChecklist.sections?.[targetSectionIndex]?.items?.[itemIndex]) {
                                updatedChecklist.sections[targetSectionIndex].items[
                                  itemIndex
                                ] = {
                                  ...updatedChecklist.sections[targetSectionIndex]
                                    .items[itemIndex],
                                  ...updates,
                                };
                                setChecklist(updatedChecklist);
                              }
                            }
                          }
                        }}
                        onDelete={(itemId: string) => {
                          // Remove the item from the checklist data
                          if (checklist) {
                            const updatedChecklist = { ...checklist };
                            updatedChecklist.sections =
                              updatedChecklist.sections?.map((s) => ({
                                ...s,
                                items: s.items?.filter((i) => i.id !== itemId),
                              }));
                            setChecklist(updatedChecklist);
                          }
                        }}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        )) || []}
      </Accordion>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end space-x-3"
      >
        <Button
          className="border"
          onClick={handleDownload}
          disabled={!checklist}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Download Report
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !checklist} // ✅ FIXED: Use specific saving state
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving... {/* ✅ FIXED: Inline loading text */}
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Save Checklist
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
