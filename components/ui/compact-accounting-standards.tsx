import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Book, FileText, Info} from "lucide-react";

interface CompactStandardsProps {
  showHeader?: boolean;
  maxHeight?: string;
  className?: string;
}

/**
 * Compact Accounting Standards List
 * 
 * A space-efficient version for integration into sidebars, chat interfaces, or small spaces.
 * Displays the 9 key accounting standards in a vertically scrollable list format.
 */

const CompactAccountingStandards: React.FC<CompactStandardsProps> = ({ 
  showHeader = true, 
  maxHeight = "600px",
  className = ""
}) => {
  const standards = [
    {
      id: "IAS 1",
      title: "Presentation of Financial Statements",
      description: "Essential for the presentation of financial statements, ensuring consistent disclosure and reporting across all regions of operation.",
      category: "Core",
      icon: <FileText className="w-4 h-4" />,
      color: "bg-rai-blue"
    },
    {
      id: "IAS 7",
      title: "Statement of Cash Flows", 
      description: "Required for the preparation of cash flow statements, providing insights into the cash movements from operating, investing, and financing activities.",
      category: "Core",
      icon: <FileText className="w-4 h-4" />,
      color: "bg-rai-blue"
    },
    {
      id: "IFRS 15",
      title: "Revenue from Contracts with Customers",
      description: "Crucial for revenue recognition from property sales, service contracts, and long-term construction or development projects.",
      category: "Industry",
      icon: <Book className="w-4 h-4" />,
      color: "bg-orange-500"
    },
    {
      id: "IAS 16", 
      title: "Property, Plant and Equipment",
      description: "Applies to the accounting for property, plant, and equipment involved in development, construction, and management of real estate assets.",
      category: "Industry",
      icon: <Book className="w-4 h-4" />,
      color: "bg-orange-500"
    },
    {
      id: "IAS 40",
      title: "Investment Property",
      description: "Pertinent for measuring investment properties held for rental and capital appreciation, which is core to the Group's business model.",
      category: "Industry", 
      icon: <Book className="w-4 h-4" />,
      color: "bg-orange-500"
    },
    {
      id: "IFRS 16",
      title: "Leases",
      description: "Key for handling lease contracts, both as a lessee for operational assets and possibly as a lessor in property leasing activities.",
      category: "Specialized",
      icon: <Info className="w-4 h-4" />,
      color: "bg-purple-500"
    },
    {
      id: "IAS 36",
      title: "Impairment of Assets",
      description: "Important for assessing impairment of long-term assets, particularly given the considerable investments in property and development projects.",
      category: "Specialized",
      icon: <Info className="w-4 h-4" />,
      color: "bg-purple-500"
    },
    {
      id: "IFRS 13",
      title: "Fair Value Measurement",
      description: "Provides a framework for fair value measurement of assets and liabilities, critical for accurate valuation of diverse real estate holdings.",
      category: "Specialized",
      icon: <Info className="w-4 h-4" />,
      color: "bg-purple-500"
    },
    {
      id: "IAS 12",
      title: "Income Taxes",
      description: "Relevant for accounting for income taxes, especially due to operations across multiple jurisdictions with varying tax regulations.",
      category: "Specialized",
      icon: <Info className="w-4 h-4" />,
      color: "bg-purple-500"
    }
  ];

  return (
    <Card className={`w-full ${className}`}>
      {showHeader && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-rai-blue flex items-center gap-2">
            <Book className="w-5 h-5" />
            Accounting Standards
          </CardTitle>
          <p className="text-sm text-gray-600">
            Key standards for real estate operations
          </p>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        <div 
          className="space-y-1 overflow-y-auto"
          style={{ maxHeight }}
        >
          {standards.map((standard, index) => (
            <div
              key={standard.id}
              className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
            >
              {/* Icon and ID */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="p-1 rounded">
                  {standard.icon}
                </div>
                <Badge className={`${standard.color} text-white text-xs font-semibold`}>
                  {standard.id}
                </Badge>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                    {standard.title}
                  </h4>
                  <Badge className="border" className="text-xs">
                    {standard.category}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {standard.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary footer */}
        <div className="p-3 bg-blue-50 border-t border-blue-200 text-center">
          <div className="flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-rai-blue rounded-full"></div>
              <span className="text-gray-600">2 Core</span>
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">3 Industry</span>
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">4 Specialized</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactAccountingStandards;