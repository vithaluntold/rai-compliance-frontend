import React, { useState } from "react";
import {AccountingStandardsDisplay, AccountingStandard} from "@/components/ui/accounting-standards-display";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

const AccountingStandardsDemo: React.FC = () => {
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");

  const realEstateStandards: AccountingStandard[] = [
    {
      id: "IAS 1",
      title: "IAS 1 - Presentation of Financial Statements",
      description: "Essential for the presentation of financial statements, ensuring consistent disclosure and reporting across all regions of operation.",
      category: "core",
      isSelected: selectedStandards.includes("IAS 1")
    },
    {
      id: "IAS 7", 
      title: "IAS 7 - Statement of Cash Flows",
      description: "Required for the preparation of cash flow statements, providing insights into the cash movements from operating, investing, and financing activities.",
      category: "core",
      isSelected: selectedStandards.includes("IAS 7")
    },
    {
      id: "IFRS 15",
      title: "IFRS 15 - Revenue from Contracts with Customers", 
      description: "Crucial for revenue recognition from property sales, service contracts, and long-term construction or development projects.",
      category: "industry-specific",
      isSelected: selectedStandards.includes("IFRS 15")
    },
    {
      id: "IAS 16",
      title: "IAS 16 - Property, Plant and Equipment",
      description: "Applies to the accounting for property, plant, and equipment involved in development, construction, and management of real estate assets.",
      category: "industry-specific",
      isSelected: selectedStandards.includes("IAS 16")
    },
    {
      id: "IAS 40",
      title: "IAS 40 - Investment Property",
      description: "Pertinent for measuring investment properties held for rental and capital appreciation, which is core to the Group's business model.",
      category: "industry-specific",
      isSelected: selectedStandards.includes("IAS 40")
    },
    {
      id: "IFRS 16",
      title: "IFRS 16 - Leases",
      description: "Key for handling lease contracts, both as a lessee for operational assets and possibly as a lessor in property leasing activities.",
      category: "specialized",
      isSelected: selectedStandards.includes("IFRS 16")
    },
    {
      id: "IAS 36",
      title: "IAS 36 - Impairment of Assets",
      description: "Important for assessing impairment of long-term assets, particularly given the considerable investments in property and development projects.",
      category: "specialized",
      isSelected: selectedStandards.includes("IAS 36")
    },
    {
      id: "IFRS 13",
      title: "IFRS 13 - Fair Value Measurement",
      description: "Provides a framework for fair value measurement of assets and liabilities, critical for accurate valuation of diverse real estate holdings.",
      category: "specialized",
      isSelected: selectedStandards.includes("IFRS 13")
    },
    {
      id: "IAS 12",
      title: "IAS 12 - Income Taxes",
      description: "Relevant for accounting for income taxes, especially due to operations across multiple jurisdictions with varying tax regulations.",
      category: "specialized",
      isSelected: selectedStandards.includes("IAS 12")
    }
  ];

  const handleStandardSelect = (standardId: string) => {
    setSelectedStandards(prev => {
      if (prev.includes(standardId)) {
        return prev.filter(id => id !== standardId);
      } else {
        return [...prev, standardId];
      }
    });
  };

  const clearSelection = () => {
    setSelectedStandards([]);
  };

  const selectAll = () => {
    setSelectedStandards(realEstateStandards.map(s => s.id));
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-rai-blue mb-4">
          Accounting Standards Display Component
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          A comprehensive UI component for displaying accounting standards with categorization,
          selection capabilities, and responsive design.
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
              className="bg-rai-blue hover:bg-rai-blue/90"
            >
              Grid View
            </Button>
            <Button
              variant={viewMode === "compact" ? "default" : "outline"}
              onClick={() => setViewMode("compact")}
              className="bg-rai-blue hover:bg-rai-blue/90"
            >
              Compact View
            </Button>
            <Button className="border" onClick={selectAll}>
              Select All
            </Button>
            <Button className="border" onClick={clearSelection}>
              Clear Selection
            </Button>
          </div>
          
          {selectedStandards.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-rai-blue mb-2">
                Selected Standards ({selectedStandards.length}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedStandards.map(id => (
                  <Badge key={id} className="bg-rai-blue text-white">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Component Display */}
      <AccountingStandardsDisplay
        standards={realEstateStandards}
        title="Real Estate Industry - Applicable Accounting Standards"
        description="Key IFRS and IAS standards specifically relevant for real estate development, investment, and management companies."
        onStandardSelect={handleStandardSelect}
        selectable={true}
        compact={viewMode === "compact"}
      />

      {/* Static Examples */}
      <div className="space-y-8 mt-12">
        <h2 className="text-2xl font-bold text-rai-blue">Additional Examples</h2>
        
        {/* Non-selectable compact view */}
        <AccountingStandardsDisplay
          standards={realEstateStandards.slice(0, 4)}
          title="Core Standards Summary"
          description="Essential standards that apply to most entities."
          selectable={false}
          compact={true}
        />

        {/* Different industry example */}
        <AccountingStandardsDisplay
          standards={[
            {
              id: "IFRS 9",
              title: "IFRS 9 - Financial Instruments",
              description: "Classification, measurement, impairment and hedge accounting of financial instruments.",
              category: "core"
            },
            {
              id: "IFRS 7",
              title: "IFRS 7 - Financial Instruments: Disclosures",
              description: "Disclosure requirements for financial instruments to enhance understanding of their significance.",
              category: "core"
            },
            {
              id: "IFRS 17",
              title: "IFRS 17 - Insurance Contracts",
              description: "Accounting for insurance contracts to provide transparent reporting.",
              category: "industry-specific"
            }
          ]}
          title="Financial Services Standards"
          description="Standards specifically relevant for banks, insurance companies, and financial institutions."
          selectable={false}
          compact={false}
        />
      </div>

      {/* Usage Instructions */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="text-xl text-rai-blue">Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Basic Usage:</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import AccountingStandardsDisplay from "@/components/ui/accounting-standards-display";

<AccountingStandardsDisplay
  standards={yourStandards}
  title="Your Title"
  description="Your description"
  selectable={true}
  onStandardSelect={handleSelection}
  compact={false}
/>`}
            </pre>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Responsive grid layout (adjusts from 1 to 3 columns)</li>
              <li>Compact list view for sidebars or smaller spaces</li>
              <li>Selectable mode with visual feedback</li>
              <li>Category-based color coding and icons</li>
              <li>Hover effects and smooth transitions</li>
              <li>Accessibility-friendly design</li>
              <li>Consistent with RAi brand colors</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountingStandardsDemo;