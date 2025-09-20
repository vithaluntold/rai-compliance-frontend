export type AnalysisStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "FRAMEWORK_SELECTED"
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface Document {
  id: string;
  filename: string;
  uploaded_at: string;
  analysis_status: AnalysisStatus;
}
