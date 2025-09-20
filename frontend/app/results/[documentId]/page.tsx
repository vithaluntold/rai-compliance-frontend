"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, WidthType, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { api, type AnalysisResults, type ChecklistSection, type ChecklistItem } from "@/lib/api-client";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Building,
  Shield,
  Edit,
  Save,
  ChevronDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DocumentMetadata {
  company_name?: string;
  nature_of_business?: string;
  business_address?: string;
  period_end_date?: string;
  document_type?: string;
}

export default function ComplianceChecklistPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const documentId = params?.['documentId'] as string;

  // State management
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState<Record<string, { status: string; comment?: string }>>({});
  const [auditComments, setAuditComments] = useState<Record<string, string>>({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [currentEditItem, setCurrentEditItem] = useState<{ questionId: string; newStatus: string } | null>(null);
  
  // ✅ FIXED: Separate loading states for different operations instead of global loading
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);

  const loadSavedAuditReview = useCallback(() => {
    try {
      const savedReview = localStorage.getItem(`audit_review_${documentId}`);
      if (savedReview) {
        const auditData = JSON.parse(savedReview);
        setEditedAnswers(auditData.edited_answers || {});
        setAuditComments(auditData.audit_comments || {});
        
        if (Object.keys(auditData.edited_answers || {}).length > 0) {
          toast({
            title: "Previous Review Loaded",
            description: `Loaded ${Object.keys(auditData.edited_answers).length} previously saved modifications.`,
          });
        }
      }
    } catch {
      // // Removed console.error for production
}
  }, [documentId, toast]);

  const loadComplianceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load analysis results
      const analysisResults = await api.analysis.getResults(documentId);
      setResults(analysisResults);

      // Load metadata from the document (the get method returns metadata)
      const documentResponse = await api.documents.get(documentId);
      setMetadata(documentResponse.metadata || {});

    } catch (err: unknown) {
      // // Removed console.error for production
const errorMessage = err instanceof Error ? err.message : "Failed to load compliance data";
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to load compliance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [documentId, toast]);

  // Load data on component mount
  useEffect(() => {
    if (documentId) {
      loadComplianceData();
      loadSavedAuditReview();
    }
  }, [documentId, loadComplianceData, loadSavedAuditReview]);

  // Handle radio button change
  const handleRadioChange = (questionId: string, newStatus: string) => {
    if (!isEditMode) return;
    
    const currentAnswer = editedAnswers[questionId]?.status || getOriginalAnswer(questionId);
    
    if (currentAnswer !== newStatus) {
      // Answer is being changed, require comment
      setCurrentEditItem({ questionId, newStatus });
      setCommentInput(auditComments[questionId] || '');
      setShowCommentModal(true);
    }
  };

  const getOriginalAnswer = (questionId: string) => {
    // Extract original answer from results
    const [standardId, itemIndex] = questionId.split('-');
    const section = results?.sections?.find(s => (s.standard || s.id) === standardId);
    if (!itemIndex) return 'n/a';
    const item = section?.items?.[parseInt(itemIndex)];
    return item?.status?.toLowerCase() || 'n/a';
  };

  const confirmAnswerChange = (comment: string) => {
    if (!currentEditItem || !comment.trim()) return;

    const { questionId, newStatus } = currentEditItem;
    
    // Update edited answers
    setEditedAnswers(prev => ({
      ...prev,
      [questionId]: {
        status: newStatus,
        comment: comment.trim()
      }
    }));

    // Update audit comments
    setAuditComments(prev => ({
      ...prev,
      [questionId]: comment.trim()
    }));

    // Close modal and reset
    setShowCommentModal(false);
    setCommentInput('');
    setCurrentEditItem(null);

    toast({
      title: "Assessment Updated",
      description: "Your assessment change has been recorded with the provided comment.",
    });
  };

  const saveAuditReport = async () => {
    try {
      setIsSaving(true); // ✅ FIXED: Use specific saving state instead of global loading
      
      // Prepare the audit data with edited answers and comments
      const auditData = {
        document_id: documentId,
        edited_answers: editedAnswers,
        audit_comments: auditComments,
        timestamp: new Date().toISOString(),
        auditor_review: Object.keys(editedAnswers).length > 0
      };

      // For now, we'll save to localStorage as a backup
      // In the future, this could be sent to a backend API
      localStorage.setItem(`audit_review_${documentId}`, JSON.stringify(auditData));
      
      toast({
        title: "Review Saved",
        description: `Your audit review has been saved successfully. ${Object.keys(editedAnswers).length} items modified.`,
      });
    } catch {
      // // Removed console.error for production
toast({
        title: "Save Failed",
        description: "Failed to save audit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false); // ✅ FIXED: Reset specific saving state
    }
  };

  const downloadReport = async () => {
    try {
      setIsDownloading(true); // ✅ FIXED: Use specific downloading state
      
      // Get the report data from the API
      const reportData = await api.report.get(documentId);
      
      // Create a comprehensive report including audit modifications
      const fullReport = {
        ...reportData,
        metadata,
        results,
        audit_review: {
          edited_answers: editedAnswers,
          audit_comments: auditComments,
          review_timestamp: new Date().toISOString(),
          total_modifications: Object.keys(editedAnswers).length
        }
      };

      // Create and download the report as JSON
      const blob = new Blob([JSON.stringify(fullReport, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance_report_${documentId}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your compliance report has been downloaded successfully.",
      });
    } catch {
      // // Removed console.error for production
// Fallback: download current data even if API fails
      const fallbackReport = {
        document_id: documentId,
        metadata,
        results,
        audit_review: {
          edited_answers: editedAnswers,
          audit_comments: auditComments,
          review_timestamp: new Date().toISOString(),
          total_modifications: Object.keys(editedAnswers).length
        },
        note: "This report was generated locally due to API unavailability"
      };

      const blob = new Blob([JSON.stringify(fallbackReport, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance_report_${documentId}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Completed",
        description: "Report downloaded with local data (API unavailable).",
        variant: "default",
      });
    } finally {
      setIsDownloading(false); // ✅ FIXED: Reset specific downloading state
    }
  };

  const exportToPDF = async () => {
    try {
      setIsExportingPDF(true); // ✅ FIXED: Use specific PDF export state
      
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      
      // Helper function to add text with automatic page breaks
      const addText = (text: string, fontSize = 10, isBold = false, isHeader = false) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        if (isHeader) {
          pdf.setTextColor(0, 51, 102); // Dark blue for headers
        } else {
          pdf.setTextColor(0, 0, 0); // Black for normal text
        }
        
        const lines = pdf.splitTextToSize(text, pageWidth - 40);
        pdf.text(lines, 20, yPosition);
        yPosition += lines.length * (fontSize * 0.4) + 5;
      };

      // Title
      addText(`Compliance Checklist Report - ${documentId}`, 16, true, true);
      yPosition += 5;

      // Metadata section
      if (metadata.company_name) {
        addText('Company Information', 14, true, true);
        addText(`Company Name: ${metadata.company_name}`, 10);
        if (metadata.nature_of_business) addText(`Nature of Business: ${metadata.nature_of_business}`, 10);
        if (metadata.business_address) addText(`Business Address: ${metadata.business_address}`, 10);
        if (metadata.period_end_date) addText(`Period End Date: ${metadata.period_end_date}`, 10);
        if (metadata.document_type) addText(`Document Type: ${metadata.document_type}`, 10);
        yPosition += 10;
      }

      // Summary statistics
      if (results?.sections) {
        const totalItems = results.sections.reduce((sum, section) => sum + (section.items?.length || 0), 0);
        const yesCount = results.sections.reduce((sum, section) => 
          sum + (section.items?.filter(item => (editedAnswers[`${section.standard || section.id}-${section.items?.indexOf(item)}`]?.status || item.status)?.toLowerCase() === 'yes').length || 0), 0);
        const noCount = results.sections.reduce((sum, section) => 
          sum + (section.items?.filter(item => (editedAnswers[`${section.standard || section.id}-${section.items?.indexOf(item)}`]?.status || item.status)?.toLowerCase() === 'no').length || 0), 0);

        addText('Executive Summary', 14, true, true);
        addText(`Total Items Assessed: ${totalItems}`, 10);
        addText(`Compliant Items: ${yesCount}`, 10);
        addText(`Non-Compliant Items: ${noCount}`, 10);
        addText(`Compliance Rate: ${totalItems > 0 ? Math.round((yesCount / totalItems) * 100) : 0}%`, 10);
        yPosition += 10;
      }

      // Audit modifications summary
      if (Object.keys(editedAnswers).length > 0) {
        addText('Audit Review Summary', 14, true, true);
        addText(`Total Modifications Made: ${Object.keys(editedAnswers).length}`, 10);
        yPosition += 5;
      }

      // Detailed results by section
      if (results?.sections) {
        addText('Detailed Assessment Results', 14, true, true);
        
        results.sections.forEach((section) => {
          addText(`${section.standard || section.id}: ${section.title || 'Untitled Section'}`, 12, true, true);
          
          section.items?.forEach((item, itemIndex) => {
            const questionId = `${section.standard || section.id}-${itemIndex}`;
            const editedAnswer = editedAnswers[questionId];
            const currentStatus = editedAnswer?.status || item.status || 'N/A';
            const hasBeenModified = editedAnswer !== undefined;
            
            addText(`Q${itemIndex + 1}: ${item.question}`, 10);
            addText(`Status: ${currentStatus.toUpperCase()}${hasBeenModified ? ' (Modified by Auditor)' : ''}`, 10, hasBeenModified);
            
            if (item.explanation) {
              addText(`Explanation: ${item.explanation}`, 9);
            }
            
            if (editedAnswer?.comment) {
              addText(`Auditor Comment: ${editedAnswer.comment}`, 9, false);
            }
            
            yPosition += 3;
          });
          
          yPosition += 5;
        });
      }

      // Footer
      const pageCount = (pdf as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`, 20, pageHeight - 10);
      }

      // Save the PDF
      pdf.save(`compliance_report_${documentId}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Export Complete",
        description: "Your compliance report has been exported as PDF successfully.",
      });
    } catch {
      // // Removed console.error for production
toast({
        title: "PDF Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExportingPDF(false); // ✅ FIXED: Reset specific PDF export state
    }
  };

  const exportToWord = async () => {
    try {
      setIsExportingWord(true); // ✅ FIXED: Use specific Word export state

      const children = [];

      // Title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Compliance Checklist Report - ${documentId}`,
              bold: true,
              size: 32,
              color: "003366",
            }),
          ],
          heading: HeadingLevel.TITLE,
          spacing: { after: 400 },
        })
      );

      // Metadata section
      if (metadata.company_name) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Company Information",
                bold: true,
                size: 28,
                color: "003366",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          })
        );

        const metadataTable = new DocxTable({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            ...(metadata.company_name ? [new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Company Name:", bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: metadata.company_name })] })] }),
              ],
            })] : []),
            ...(metadata.nature_of_business ? [new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nature of Business:", bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: metadata.nature_of_business })] })] }),
              ],
            })] : []),
            ...(metadata.business_address ? [new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Business Address:", bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: metadata.business_address })] })] }),
              ],
            })] : []),
            ...(metadata.period_end_date ? [new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Period End Date:", bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: metadata.period_end_date })] })] }),
              ],
            })] : []),
          ],
        });
        children.push(metadataTable);
      }

      // Summary statistics
      if (results?.sections) {
        const totalItems = results.sections.reduce((sum, section) => sum + (section.items?.length || 0), 0);
        const yesCount = results.sections.reduce((sum, section) => 
          sum + (section.items?.filter(item => (editedAnswers[`${section.standard || section.id}-${section.items?.indexOf(item)}`]?.status || item.status)?.toLowerCase() === 'yes').length || 0), 0);
        const noCount = results.sections.reduce((sum, section) => 
          sum + (section.items?.filter(item => (editedAnswers[`${section.standard || section.id}-${section.items?.indexOf(item)}`]?.status || item.status)?.toLowerCase() === 'no').length || 0), 0);

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Executive Summary",
                bold: true,
                size: 28,
                color: "003366",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );

        const summaryTable = new DocxTable({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total Items Assessed:", bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: totalItems.toString() })] })] }),
              ],
            }),
            new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Compliant Items:", bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: yesCount.toString() })] })] }),
              ],
            }),
            new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Non-Compliant Items:", bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: noCount.toString() })] })] }),
              ],
            }),
            new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Compliance Rate:", bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${totalItems > 0 ? Math.round((yesCount / totalItems) * 100) : 0}%` })] })] }),
              ],
            }),
          ],
        });
        children.push(summaryTable);
      }

      // Audit modifications summary
      if (Object.keys(editedAnswers).length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Audit Review Summary",
                bold: true,
                size: 28,
                color: "003366",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Total Modifications Made: ${Object.keys(editedAnswers).length}`,
                bold: true,
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }

      // Detailed results by section
      if (results?.sections) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Detailed Assessment Results",
                bold: true,
                size: 28,
                color: "003366",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );

        results.sections.forEach((section) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${section.standard || section.id}: ${section.title || 'Untitled Section'}`,
                  bold: true,
                  size: 24,
                  color: "003366",
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 200 },
            })
          );

          section.items?.forEach((item, itemIndex) => {
            const questionId = `${section.standard || section.id}-${itemIndex}`;
            const editedAnswer = editedAnswers[questionId];
            const currentStatus = editedAnswer?.status || item.status || 'N/A';
            const hasBeenModified = editedAnswer !== undefined;

            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Question ${itemIndex + 1}: `,
                    bold: true,
                  }),
                  new TextRun({
                    text: item.question || 'No question text available',
                  }),
                ],
                spacing: { before: 200, after: 100 },
              })
            );

            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Status: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: `${currentStatus.toUpperCase()}${hasBeenModified ? ' (Modified by Auditor)' : ''}`,
                    bold: hasBeenModified,
                    color: hasBeenModified ? "CC0000" : "000000",
                  }),
                ],
                spacing: { after: 100 },
              })
            );

            if (item.explanation) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Explanation: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: item.explanation,
                    }),
                  ],
                  spacing: { after: 100 },
                })
              );
            }

            if (editedAnswer?.comment) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Auditor Comment: ",
                      bold: true,
                      color: "CC0000",
                    }),
                    new TextRun({
                      text: editedAnswer.comment,
                      italics: true,
                    }),
                  ],
                  spacing: { after: 200 },
                })
              );
            }
          });
        });
      }

      // Create the document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      });

      // Generate and save the document
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer as unknown as ArrayBuffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      saveAs(blob, `compliance_report_${documentId}_${new Date().toISOString().split('T')[0]}.docx`);

      toast({
        title: "Word Export Complete",
        description: "Your compliance report has been exported as Word document successfully.",
      });
    } catch {
      // // Removed console.error for production
toast({
        title: "Word Export Failed",
        description: "Failed to export Word document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExportingWord(false); // ✅ FIXED: Reset specific Word export state
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getCurrentAnswer = (questionId: string) => {
    return editedAnswers[questionId]?.status || getOriginalAnswer(questionId);
  };

  const isAnswerEdited = (questionId: string) => {
    return !!editedAnswers[questionId];
  };

  if (loading) {
    return (
      <div className="full-height bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading compliance checklist...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="full-height bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || "Failed to load compliance data"}</p>
          <Button onClick={() => router.back()} className="mt-4 touch-friendly">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-rendering-optimized">
      {/* Header */}
      <div className="bg-white border-b sticky-fallback top-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Button className="bg-transparent touch-friendly" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Document
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Compliance Checklist</h1>
                <p className="text-sm text-gray-600">Document ID: {documentId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Edit Mode Toggle */}
              <Button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-2 ${isEditMode ? "bg-blue-600 text-white" : "border border-gray-300"}`}
              >
                <Edit className="h-4 w-4" />
                {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
              </Button>
              
              {/* Save Button (only show in edit mode if there are changes) */}
              {isEditMode && Object.keys(editedAnswers).length > 0 && (
                <Button 
                  onClick={saveAuditReport} 
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                  disabled={isSaving} // ✅ FIXED: Use specific saving state
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Review ({Object.keys(editedAnswers).length} changes)
                </Button>
              )}
              
              {/* Unsaved changes indicator */}
              {isEditMode && Object.keys(editedAnswers).length > 0 && (
                <Badge className="border text-orange-600 border-orange-400 bg-orange-50">
                  {Object.keys(editedAnswers).length} unsaved changes
                </Badge>
              )}
              
              {/* Export Options Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="flex items-center gap-2"
                    disabled={isDownloading || isExportingPDF || isExportingWord} // ✅ FIXED: Use specific states
                  >
                    {(isDownloading || isExportingPDF || isExportingWord) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Export Report
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={exportToPDF} disabled={isExportingPDF}>
                    {isExportingPDF ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToWord} disabled={isExportingWord}>
                    {isExportingWord ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                    Export as Word
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadReport} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-6">
        {/* Company Metadata Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* First Row: Company Name and Geography */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-4 border-b border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-700">Company Name:</label>
                <p className="text-lg font-medium text-gray-900 mt-1">{metadata.company_name || "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Geography of Operations:</label>
                <p className="text-lg font-medium text-gray-900 mt-1">{metadata.business_address || "Not specified"}</p>
              </div>
            </div>
            
            {/* Second Row: Nature of Business */}
            <div className="pb-4 border-b border-gray-200">
              <label className="text-sm font-medium text-gray-700">Nature of Business:</label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-300 min-h-[100px]">
                <p className="text-gray-900 leading-relaxed">{metadata.nature_of_business || "Not specified"}</p>
              </div>
            </div>
            
            {/* Third Row: Period End Date */}
            <div>
              <label className="text-sm font-medium text-gray-700">Period End Date:</label>
              <p className="text-lg font-medium text-gray-900 mt-1">{metadata.period_end_date || "Not specified"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Accounting Framework & Standards Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Accounting Framework & Standards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Accounting Framework */}
            <div>
              <label className="text-sm font-medium text-gray-700">Accounting Framework:</label>
              <p className="text-lg font-medium text-blue-600 mt-1">
                {results?.standard || results?.standards?.join(", ") || "Not specified"}
              </p>
            </div>
            
            {/* AI Suggested Standards */}
            <div>
              <label className="text-sm font-medium text-gray-700">Accounting Standards suggested by AI:</label>
              <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200 min-h-[80px]">
                <div className="flex flex-wrap gap-2">
                  {results?.sections?.map((section, index) => (
                    <Badge key={index} className="border bg-blue-100 text-blue-800 border-blue-300">
                      {section.standard || section.title}
                    </Badge>
                  )) || <p className="text-gray-700 text-sm italic">AI-suggested standards will appear here based on document analysis</p>}
                </div>
              </div>
            </div>
            
            {/* User Selected Standards */}
            <div>
              <label className="text-sm font-medium text-gray-700">Accounting Standards selected by User:</label>
              <div className="mt-2 p-4 bg-green-50 rounded-lg border border-green-200 min-h-[80px]">
                <div className="flex flex-wrap gap-2">
                  {results?.sections?.map((section, index) => (
                    <Badge key={index} className="border bg-green-100 text-green-800 border-green-300">
                      {section.standard || section.title}
                    </Badge>
                  )) || <p className="text-gray-700 text-sm italic">User-selected standards will appear here</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Standards Tabs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Compliance Checklist by Standards
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue={results.sections?.[0]?.standard || results.sections?.[0]?.id || "general"} className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-gray-50 h-auto p-2 gap-2">
                {results.sections?.map((section: ChecklistSection) => (
                  <TabsTrigger
                    key={section.standard}
                    value={section.standard || section.id}
                    className="rounded-lg px-6 py-3 font-medium text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:border data-[state=inactive]:border-gray-300 shadow-sm hover:shadow-md transition-all"
                  >
                    {section.standard || section.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {results.sections?.map((section: ChecklistSection) => (
                <TabsContent key={section.standard || section.id} value={section.standard || section.id} className="p-6 mt-0">
                  <div className="space-y-8">
                    {section.items?.map((item: ChecklistItem, index: number) => {
                      const questionId = `${section.standard || section.id}-${index}`;
                      const currentAnswer = getCurrentAnswer(questionId);
                      const isEdited = isAnswerEdited(questionId);

                      return (
                        <div key={index} className="border rounded-lg p-6 bg-white">
                          {/* Question Header with Radio Buttons */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-base font-medium text-gray-900 mb-2">
                                Q{index + 1}: {item.question}
                              </h3>
                              <div className="text-sm text-gray-600">
                                Reference: {item.reference || 'N/A'}
                              </div>
                            </div>
                            
                            {/* Radio Buttons */}
                            <div className="flex items-center space-x-4 ml-6">
                              {['yes', 'no', 'n/a'].map((option) => {
                                const isSelected = currentAnswer === option;
                                const optionLabel = option === 'n/a' ? 'N/A' : option.charAt(0).toUpperCase() + option.slice(1);
                                
                                return (
                                  <label
                                    key={option}
                                    className={`flex items-center space-x-2 cursor-pointer ${
                                      !isEditMode ? 'pointer-events-none' : ''
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={questionId}
                                      value={option}
                                      checked={isSelected}
                                      onChange={() => handleRadioChange(questionId, option)}
                                      disabled={!isEditMode}
                                      className="w-4 h-4"
                                    />
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        isSelected
                                          ? option === 'yes'
                                            ? 'bg-green-100 text-green-800'
                                            : option === 'no'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                          : 'bg-gray-50 text-gray-600'
                                      } ${isEdited ? 'ring-2 ring-orange-400' : ''}`}
                                    >
                                      {optionLabel}
                                    </span>
                                  </label>
                                );
                              })}
                              {isEdited && (
                                <Badge className="border text-orange-600 border-orange-400">
                                  Auditor Modified
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Confidence Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Confidence</span>
                              <span className="text-sm font-medium text-gray-900">
                                {Math.round((item.confidence || 0) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full confidence-bar ${getConfidenceColor(item.confidence || 0)}`}
                                ref={(el) => {
                                  if (el) {
                                    el.style.setProperty('--confidence-width', `${(item.confidence || 0) * 100}%`);
                                  }
                                }}
                              />
                            </div>
                          </div>

                          {/* Explanation */}
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-2">Explanation</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {item.explanation || 'No explanation provided.'}
                            </p>
                          </div>

                          {/* Evidence Table */}
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">Evidence</h4>
                            <div className="overflow-x-auto">
                              <Table className="w-full table-auto">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[120px]">Reference</TableHead>
                                    <TableHead className="w-[120px]">Requirement</TableHead>
                                    <TableHead className="w-[120px]">Description</TableHead>
                                    <TableHead className="w-[100px]">Page Number</TableHead>
                                    <TableHead className="w-[300px]">Extract</TableHead>
                                    <TableHead className="w-[300px]">Content Analysis</TableHead>
                                  </TableRow>
                                </TableHeader>
                              <TableBody>
                                {Array.isArray(item.evidence) ? item.evidence.map((evidenceString, evidenceIndex) => {
                                  // Parse the 7-field evidence format: Reference|Requirement|Description|Page|Extract|Content Analysis|Suggestion
                                  const evidenceFields = evidenceString.split('|');
                                  const [
                                    evidenceRef = 'N/A',
                                    evidenceReq = 'N/A', 
                                    evidenceDesc = 'N/A',
                                    evidencePage = 'N/A',
                                    evidenceExtract = 'N/A',
                                    evidenceContentAnalysis = 'N/A'
                                  ] = evidenceFields;
                                  
                                  return (
                                    <TableRow key={evidenceIndex}>
                                      <TableCell className="font-medium text-sm">
                                        {evidenceRef}
                                      </TableCell>
                                      <TableCell className="text-sm">{evidenceReq}</TableCell>
                                      <TableCell className="text-sm">
                                        <div className="whitespace-normal break-words text-sm leading-relaxed">
                                          {evidenceDesc.length > 100 ? evidenceDesc.substring(0, 100) + '...' : evidenceDesc}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-sm">{evidencePage}</TableCell>
                                      <TableCell className="min-w-[200px]">
                                        <div className="whitespace-normal break-words text-sm leading-relaxed">
                                          {evidenceExtract}
                                        </div>
                                      </TableCell>
                                      <TableCell className="min-w-[200px]">
                                        <div className="whitespace-normal break-words text-sm leading-relaxed">
                                          {evidenceContentAnalysis}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  );
                                }) : (
                                  <TableRow>
                                    <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                                      No evidence available
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                            </div>
                          </div>

                          {/* Suggested Disclosure */}
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-2">Suggested Disclosure</h4>
                            <p className="text-gray-700 text-sm leading-relaxed bg-blue-50 p-3 rounded">
                              {item.suggestions || item.suggestion || item.ai_suggestion || 'No suggestions provided.'}
                            </p>
                          </div>

                          {/* Your Comments */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Your Comments</h4>
                            {auditComments[questionId] ? (
                              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                                <p className="text-sm text-gray-700">{auditComments[questionId]}</p>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">No comments added yet</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Comment Modal */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Audit Comment</DialogTitle>
            <DialogDescription>
              Please provide a reason for changing this assessment. This comment will be included in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentEditItem && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Changing answer to: <span className="font-semibold text-gray-900">{currentEditItem.newStatus}</span>
                </p>
              </div>
            )}
            <Textarea
              placeholder="Enter your reason for this change..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button className="border" onClick={() => {
              setShowCommentModal(false);
              setCommentInput('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => confirmAnswerChange(commentInput)}
              disabled={!commentInput.trim()}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
