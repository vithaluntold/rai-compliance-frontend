import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Book, FileText, Info} from "lucide-react";

/**
 * Real Estate Accounting Standards Cards Component
 * 
 * This component displays the 9 key accounting standards relevant for real estate companies
 * in a clean, organized card layout with proper categorization and RAi branding.
 */

const RealEstateAccountingStandards: React.FC = () => {
  const standards = [
    {
      id: "IAS 1",
      title: "Presentation of Financial Statements",
      description: "Essential for the presentation of financial statements, ensuring consistent disclosure and reporting across all regions of operation.",
      category: "Core Standard",
      icon: <FileText className="w-4 h-4" />,
      color: "bg-rai-blue"
    },
    {
      id: "IAS 7",
      title: "Statement of Cash Flows", 
      description: "Required for the preparation of cash flow statements, providing insights into the cash movements from operating, investing, and financing activities.",
      category: "Core Standard",
      icon: <FileText className="w-4 h-4" />,
      color: "bg-rai-blue"
    },
    {
      id: "IFRS 15",
      title: "Revenue from Contracts with Customers",
      description: "Crucial for revenue recognition from property sales, service contracts, and long-term construction or development projects.",
      category: "Industry Specific",
      icon: <Book className="w-4 h-4" />,
      color: "bg-orange-500"
    },
    {
      id: "IAS 16", 
      title: "Property, Plant and Equipment",
      description: "Applies to the accounting for property, plant, and equipment involved in development, construction, and management of real estate assets.",
      category: "Industry Specific",
      icon: <Book className="w-4 h-4" />,
      color: "bg-orange-500"
    },
    {
      id: "IAS 40",
      title: "Investment Property",
      description: "Pertinent for measuring investment properties held for rental and capital appreciation, which is core to the Group's business model.",
      category: "Industry Specific", 
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
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-rai-blue flex items-center justify-center gap-3">
          <Book className="w-8 h-8" />
          Applicable Accounting Standards
        </h2>
        <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Key IFRS and IAS standards specifically relevant for real estate development, 
          investment, and management companies across multiple jurisdictions.
        </p>
      </div>

      {/* Standards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {standards.map((standard, index) => (
          <Card 
            key={standard.id}
            className="h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-rai-blue"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <Badge className={`${standard.color} text-white font-semibold px-3 py-1`}>
                  {standard.id}
                </Badge>
                <div className="flex items-center gap-1">
                  {standard.icon}
                  <Badge className="border" className="text-xs">
                    {standard.category}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg leading-tight text-gray-900">
                {standard.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                {standard.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Legend */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-rai-blue flex-shrink-0 mt-1" />
          <div className="space-y-3">
            <h4 className="font-bold text-rai-blue text-lg">Standards Categories</h4>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-rai-blue text-white px-3 py-1">
                  <FileText className="w-3 h-3 mr-1" />
                  Core
                </Badge>
                <span className="text-sm text-gray-700">Essential for all entities</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-orange-500 text-white px-3 py-1">
                  <Book className="w-3 h-3 mr-1" />
                  Industry Specific
                </Badge>
                <span className="text-sm text-gray-700">Real estate focused</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-500 text-white px-3 py-1">
                  <Info className="w-3 h-3 mr-1" />
                  Specialized
                </Badge>
                <span className="text-sm text-gray-700">Complex requirements</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-rai-blue">9</div>
          <div className="text-sm text-gray-600">Total Standards</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-rai-blue">2</div>
          <div className="text-sm text-gray-600">Core Standards</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-orange-500">3</div>
          <div className="text-sm text-gray-600">Industry Specific</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-purple-500">4</div>
          <div className="text-sm text-gray-600">Specialized</div>
        </div>
      </div>
    </div>
  );
};

export default RealEstateAccountingStandards;