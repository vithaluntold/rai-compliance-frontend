"use client";

import type React from "react";
import {useState, useEffect} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Info, Trash2, AlertCircle} from "lucide-react";
import {Textarea} from "@/components/ui/textarea";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {useChecklist} from "@/context/checklist-context";
import {Button} from "@/components/ui/button";
import {AdequacyMeter} from "@/components/adequacy-meter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {Label} from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface Evidence {
  paraNumber: string;
  description: string;
  pageNumber: string;
}

interface ChecklistItemProps {
  item: {
    id: string;
    question: string;
    reference: string;
    status: string;
    adequacy: string;
    confidence: number;
    ai_explanation: string;
    evidence: string;
    evidenceList?: Evidence[];
    user_comment: string;
    is_resolved: boolean;
  };
  onUpdate: (_id: string, updates: Record<string, unknown>) => void;
  onDelete: (_id: string) => void;
}

interface SectionHeaderProps {
  activeSection: {
    section: string;
    title: string;
  };
}

export function SectionHeader({ activeSection }: SectionHeaderProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h2 className="text-lg font-semibold mb-1 text-blue-900">
        {activeSection.section}
      </h2>
      <div className="text-base font-medium text-gray-700">
        {activeSection.title}
      </div>
    </div>
  );
}

export default function ChecklistItem({
  item,
  onUpdate,
  onDelete,
}: ChecklistItemProps) {
  // Note: Removed unused destructured variables from useChecklist
  useChecklist();
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(
    item.user_comment || item.ai_explanation || "",
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteComment, setDeleteComment] = useState("");
  const [deleteCommentError, setDeleteCommentError] = useState(false);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>(
    item.evidenceList || [],
  );

  useEffect(() => {
    if (
      item.status === "N/A" &&
      (!item.user_comment || item.user_comment.trim() === "")
    ) {
      setComment(item.ai_explanation || "");
    }
    // Update evidence list when item changes
    if (item.evidenceList) {
      setEvidenceList(item.evidenceList);
    }
  }, [item]);

  const handleStatusChange = (value: string) => {
    // If changing from N/A, clear the AI explanation from the comment
    const newComment =
      value !== "N/A" ? item.user_comment || "" : item.ai_explanation || "";
    setComment(newComment);

    onUpdate(item.id, {
      status: value,
      user_comment: newComment,
    });
  };

  const handleCommentChange = (value: string) => {
    setComment(value);
  };

  const handleSave = () => {
    onUpdate(item.id, {
      user_comment: comment,
    });
    setIsEditing(false);
  };

  const isCommentRequired = item.status === "N/A" || isEditing;

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteComment.trim()) {
      setDeleteCommentError(true);
      return;
    }

    onUpdate(item.id, {
      comment: deleteComment,
      status: "N/A",
    });
    setDeleteDialogOpen(false);

    // Animate out and then remove
    setTimeout(() => {
      onDelete(item.id);
    }, 500);
  };

  return (
    <AnimatePresence>
      {!item.is_resolved && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
        >
          <Card className="p-4 border transition-all duration-300 hover:border-[hsl(var(--electric-teal))]">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-[hsl(var(--rai-primary))] text-white rounded">
                      {item.reference}
                    </span>
                    <div className="w-20">
                      <AdequacyMeter
                        level={
                          item.adequacy as "high" | "low" | "medium" | "unknown"
                        }
                      />
                    </div>
                  </div>
                  <p className="text-sm font-medium">{item.question}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="min-w-[180px]">
                    <RadioGroup
                      value={item.status}
                      onValueChange={handleStatusChange}
                      className="flex space-x-2"
                      disabled={item.status === "Yes" && !isEditing}
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem
                          value="Yes"
                          id={`${item.id}-yes`}
                          className="text-[hsl(var(--deep-blue))] border-[hsl(var(--deep-blue))] focus:ring-[hsl(var(--deep-blue))]"
                        />
                        <Label
                          htmlFor={`${item.id}-yes`}
                          className="text-sm cursor-pointer"
                        >
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem
                          value="No"
                          id={`${item.id}-no`}
                          className="text-[hsl(var(--deep-blue))] border-[hsl(var(--deep-blue))] focus:ring-[hsl(var(--deep-blue))]"
                        />
                        <Label
                          htmlFor={`${item.id}-no`}
                          className="text-sm cursor-pointer"
                        >
                          No
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem
                          value="N/A"
                          id={`${item.id}-na`}
                          className="text-[hsl(var(--deep-blue))] border-[hsl(var(--deep-blue))] focus:ring-[hsl(var(--deep-blue))]"
                        />
                        <Label
                          htmlFor={`${item.id}-na`}
                          className="text-sm cursor-pointer"
                        >
                          N/A
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex space-x-1">
                    {evidenceList.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-blue-500" />
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="w-[800px] p-4"
                          >
                            <div className="max-h-[400px] overflow-auto rounded-lg border bg-white shadow-lg">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                    <th className="text-left p-3 font-semibold text-gray-600 border-b">
                                      Para Number
                                    </th>
                                    <th className="text-left p-3 font-semibold text-gray-600 border-b">
                                      Description
                                    </th>
                                    <th className="text-left p-3 font-semibold text-gray-600 border-b">
                                      Page
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {evidenceList
                                    .filter(
                                      (evidence, index, self) =>
                                        index ===
                                        self.findIndex(
                                          (e) =>
                                            e.paraNumber ===
                                              evidence.paraNumber &&
                                            e.description ===
                                              evidence.description &&
                                            e.pageNumber ===
                                              evidence.pageNumber,
                                        ),
                                    )
                                    .map((evidence, index) => (
                                      <tr
                                        key={`${evidence.paraNumber}-${index}`}
                                        className={`
                                          border-b last:border-b-0
                                          ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                          hover:bg-blue-50 transition-colors duration-150
                                        `}
                                      >
                                        <td className="p-3 font-medium text-gray-700">
                                          {evidence.paraNumber}
                                        </td>
                                        <td className="p-3 text-gray-600">
                                          {evidence.description}
                                        </td>
                                        <td className="p-3 text-gray-600">
                                          {evidence.pageNumber}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <Button
                      className="border h-8 px-2 flex-1 bg-red-50 border-red-200 hover:bg-red-100 hover:text-red-700"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label
                    htmlFor={`comment-${item.id}`}
                    className="text-xs text-gray-500"
                  >
                    Comments{" "}
                    {isCommentRequired && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  {item.status === "N/A" && !isEditing && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center text-red-500 text-xs"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      AI Explanation
                    </motion.div>
                  )}
                </div>
                <Textarea
                  id={`comment-${item.id}`}
                  value={comment}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  placeholder="Add your comments here..."
                  disabled={item.status === "Yes" && !isEditing}
                  className={`text-sm min-h-[80px] transition-all duration-300 ${
                    isCommentRequired && !comment
                      ? "border-red-300 focus-visible:ring-red-300"
                      : "focus-visible:ring-[hsl(var(--electric-teal))] focus-visible:border-[hsl(var(--electric-teal))]"
                  } ${item.status === "Yes" && !isEditing ? "bg-gray-50" : ""}`}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <Button
                    className="h-8 px-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleSave}
                    disabled={isCommentRequired && !comment}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Removal</DialogTitle>
                <DialogDescription>
                  You are about to remove this checklist item. Please provide a
                  reason for removal.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-4">
                <Label htmlFor="delete-comment" className="text-sm font-medium">
                  Reason for removal <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="delete-comment"
                  value={deleteComment}
                  onChange={(e) => {
                    setDeleteComment(e.target.value);
                    setDeleteCommentError(false);
                  }}
                  placeholder="Enter reason for removal..."
                  className={deleteCommentError ? "border-red-300" : ""}
                />
                {deleteCommentError && (
                  <p className="text-sm text-red-500">
                    Please provide a reason for removal
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  className="border"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
                  Remove Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
