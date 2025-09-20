import { toast } from '../hooks/use-toast';

interface ComplianceResults {
  status: string;
  document_id: string;
  timestamp: string;
  completed_at?: string;
  metadata: {
    company_name: string;
    nature_of_business: string;
    operational_demographics: string;
    financial_statements_type?: string;
  };
  sections: Array<{
    section: string;
    title: string;
    standard: string;
    items: Array<{
      id: string;
      question: string;
      reference: string;
      status: "YES" | "NO" | "PARTIAL" | "N/A";
      confidence: number;
      explanation: string;
      evidence: string[];
      suggestion?: string;
    }>;
  }>;
  framework: string;
  standards: string[];
  specialInstructions?: string;
  extensiveSearch?: boolean;
  message: string;
}

interface ExportData {
  metadata: {
    company_name: string;
    framework: string;
    standards: string[];
    completed_at: string;
    total_items: number;
    compliant_items: number;
    compliance_percentage: number;
  };
  sections: Array<{
    section_id: string;
    title: string;
    standard: string;
    items: Array<{
      id: string;
      question: string;
      reference: string;
      status: string;
      confidence: number;
      explanation: string;
      evidence: string;
      suggestion: string;
    }>;
  }>;
}

export async function exportComplianceResults(
  results: ComplianceResults,
  format: "pdf" | "excel",
): Promise<void> {
  try {
    // Show loading toast
    toast({
      title: "Preparing Export",
      description: `Generating ${format.toUpperCase()} report...`,
    });

    // Calculate summary statistics
    const totalItems = results.sections.reduce(
      (total, section) => total + section.items.length,
      0,
    );
    const compliantItems = results.sections.reduce(
      (total, section) =>
        total + section.items.filter((item) => item.status === "YES").length,
      0,
    );
    const compliancePercentage = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;

    // Prepare export data
    const exportData = {
      metadata: {
        company_name: results.metadata.company_name,
        framework: results.framework,
        standards: results.standards,
        completed_at: results.completed_at || new Date().toISOString(),
        total_items: totalItems,
        compliant_items: compliantItems,
        compliance_percentage: compliancePercentage,
      },
      sections: results.sections.map((section) => ({
        section_id: section.section,
        title: section.title,
        standard: section.standard,
        items: section.items.map((item) => ({
          id: item.id,
          question: item.question,
          reference: item.reference,
          status: item.status,
          confidence: Math.round(item.confidence * 100),
          explanation: item.explanation,
          evidence: item.evidence.join(" | "),
          suggestion: item.suggestion || "",
        })),
      })),
    };

    if (format === "excel") {
      await exportToExcel(exportData, results.metadata.company_name);
    } else if (format === "pdf") {
      await exportToPDF(exportData);
    }

    // Update to success toast
    toast({
      title: "Export Complete",
      description: `${format.toUpperCase()} report has been downloaded successfully.`,
    });
  } catch {
    toast({
      title: "Export Failed",
      description: `Failed to generate ${format.toUpperCase()} report. Please try again.`,
      variant: "destructive",
    });
  }
}

async function exportToExcel(data: ExportData, companyName: string): Promise<void> {
  // For now, we'll create a simple CSV export
  // In production, you'd use a library like xlsx or exceljs

  const csvContent = generateCSVContent(data);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${sanitizeFilename(companyName)}_compliance_report.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

async function exportToPDF(data: ExportData): Promise<void> {
  // For now, we'll create a simple HTML report that can be printed to PDF
  // In production, you'd use a library like jsPDF or react-pdf

  const htmlContent = generateHTMLReport(data);
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Open in new window for printing to PDF
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 100);
    };
  }
}

function generateCSVContent(data: ExportData): string {
  const headers = [
    "Section",
    "Standard",
    "Question",
    "Reference",
    "Status",
    "Confidence (%)",
    "Explanation",
    "Evidence",
    "Suggestion",
  ];

  let csvContent = headers.join(",") + "\n";

  // Add metadata row
  csvContent += `"METADATA","${data.metadata.company_name}","Framework: ${data.metadata.framework}","Standards: ${data.metadata.standards.join(", ")}","Compliance: ${data.metadata.compliance_percentage}%","Total Items: ${data.metadata.total_items}","Compliant: ${data.metadata.compliant_items}","Completed: ${data.metadata.completed_at}",""\n`;
  csvContent += "\n"; // Empty row

  // Add section data
  data.sections.forEach((section) => {
    section.items.forEach((item) => {
      const row = [
        `"${section.title}"`,
        `"${section.standard}"`,
        `"${item.question.replace(/"/g, '""')}"`,
        `"${item.reference.replace(/"/g, '""')}"`,
        `"${item.status}"`,
        `"${item.confidence}"`,
        `"${item.explanation.replace(/"/g, '""')}"`,
        `"${item.evidence.replace(/"/g, '""')}"`,
        `"${item.suggestion.replace(/"/g, '""')}"`,
      ];
      csvContent += row.join(",") + "\n";
    });
  });

  return csvContent;
}

function generateHTMLReport(data: ExportData): string {
  const currentDate = new Date().toLocaleDateString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compliance Report - ${data.metadata.company_name}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.4;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #0087d9;
            padding-bottom: 20px;
        }
        .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #0087d9;
        }
        .metadata { 
            background-color: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 20px;
        }
        .section { 
            margin-bottom: 25px; 
            border: 1px solid #ddd; 
            border-radius: 8px;
        }
        .section-header { 
            background-color: #0087d9; 
            color: white; 
            padding: 10px 15px; 
            font-weight: bold;
            border-radius: 8px 8px 0 0;
        }
        .item { 
            padding: 15px; 
            border-bottom: 1px solid #eee;
        }
        .item:last-child { 
            border-bottom: none;
        }
        .status-yes { background-color: #d4edda; }
        .status-no { background-color: #f8d7da; }
        .status-partial { background-color: #fff3cd; }
        .status-na { background-color: #f1f3f4; }
        .question { font-weight: bold; margin-bottom: 5px; }
        .reference { font-style: italic; color: #666; margin-bottom: 10px; }
        .explanation { margin-bottom: 10px; }
        .evidence { font-size: 0.9em; color: #555; background-color: #f8f9fa; padding: 8px; border-radius: 4px; }
        .suggestion { font-size: 0.9em; color: #0066cc; background-color: #e6f3ff; padding: 8px; border-radius: 4px; margin-top: 8px; }
        @media print {
            .no-print { display: none; }
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${data.metadata.company_name}</div>
        <div>Compliance Analysis Report</div>
        <div style="font-size: 14px; color: #666; margin-top: 10px;">
            Generated on ${currentDate} | Framework: ${data.metadata.framework}
        </div>
    </div>

    <div class="metadata">
        <h3>Executive Summary</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div><strong>Overall Compliance:</strong> ${data.metadata.compliance_percentage}%</div>
            <div><strong>Total Requirements:</strong> ${data.metadata.total_items}</div>
            <div><strong>Compliant Items:</strong> ${data.metadata.compliant_items}</div>
            <div><strong>Standards Analyzed:</strong> ${data.metadata.standards.join(", ")}</div>
        </div>
    </div>

    ${data.sections
      .map(
        (section) => `
        <div class="section">
            <div class="section-header">
                ${section.title} (${section.standard})
            </div>
            ${section.items
              .map(
                (item) => `
                <div class="item status-${item.status.toLowerCase()}">
                    <div class="question">${item.question}</div>
                    <div class="reference">${item.reference}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <strong>Status: ${item.status}</strong>
                        <span>Confidence: ${item.confidence}%</span>
                    </div>
                    <div class="explanation">${item.explanation}</div>
                    ${item.evidence ? `<div class="evidence"><strong>Evidence:</strong> ${item.evidence}</div>` : ""}
                    ${item.suggestion ? `<div class="suggestion"><strong>Recommendation:</strong> ${item.suggestion}</div>` : ""}
                </div>
            `,
              )
              .join("")}
        </div>
    `,
      )
      .join("")}

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        <p>This report was generated by RAi Compliance Engine on ${currentDate}</p>
        <p class="no-print">Use your browser's print function to save as PDF</p>
    </div>
</body>
</html>
  `;
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9_\-]/gi, "_").toLowerCase();
}
