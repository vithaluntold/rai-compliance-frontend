"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface ChecklistItem {
  id: string;
  reference: string;
  question: string;
  status: "Yes" | "No" | "N/A";
  comment: string;
}

interface ChecklistContextType {
  checklist: ChecklistItem[];
  setChecklist: (items: ChecklistItem[]) => void;
  updateItem: (id: string, updates: Partial<ChecklistItem>) => void;
  removeItem: (id: string) => void;
  isComplete: boolean;
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(
  undefined,
);

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const updateItem = (_id: string, updates: Partial<ChecklistItem>) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === _id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (_id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== _id));
  };

  const isComplete = checklist.every(
    (item) =>
      item.status !== "N/A" ||
      (item.status === "N/A" && item.comment && item.comment.trim() !== ""),
  );

  return (
    <ChecklistContext.Provider
      value={{ checklist, setChecklist, updateItem, removeItem, isComplete }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklist() {
  const context = useContext(ChecklistContext);
  if (context === undefined) {
    throw new Error("useChecklist must be used within a ChecklistProvider");
  }
  return context;
}
