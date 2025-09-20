"use client";

import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle,
  ArrowRight,
  Upload,
  Settings,
  Search,
  FileCheck,
} from "lucide-react";

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 1,
    title: "Document Upload",
    description: "Upload your compliance documents for analysis",
    icon: <Upload className="w-6 h-6" />,
    details: [
      "Drag & drop or select files",
      "Supports PDF, Word, Excel formats",
      "Secure file processing",
      "Automatic document validation",
    ],
  },
  {
    id: 2,
    title: "Metadata Configuration",
    description: "Configure document metadata and analysis parameters",
    icon: <Settings className="w-6 h-6" />,
    details: [
      "Set document properties",
      "Define analysis scope",
      "Configure compliance settings",
      "Customize reporting preferences",
    ],
  },
  {
    id: 3,
    title: "Framework Selection",
    description: "Choose compliance frameworks for analysis",
    icon: <Shield className="w-6 h-6" />,
    details: [
      "SOX (Sarbanes-Oxley Act)",
      "COSO (Committee of Sponsoring Organizations)",
      "ISO 27001 Information Security",
      "Custom framework definitions",
    ],
  },
  {
    id: 4,
    title: "AI Analysis",
    description: "Advanced AI-powered compliance analysis",
    icon: <Search className="w-6 h-6" />,
    details: [
      "Natural language processing",
      "Risk assessment algorithms",
      "Control effectiveness evaluation",
      "Real-time progress tracking",
    ],
  },
  {
    id: 5,
    title: "Results & Reports",
    description: "Comprehensive compliance analysis results",
    icon: <FileCheck className="w-6 h-6" />,
    details: [
      "Detailed compliance scores",
      "Risk identification and prioritization",
      "Actionable recommendations",
      "Exportable compliance reports",
    ],
  },
];

interface LandingPageProps {
  onProceed: () => void;
}

export function LandingPage({ onProceed }: LandingPageProps) {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-[#0087d9] mb-4">
            RAi Compliance Engine
          </h1>
        </motion.div>

        {/* Workflow Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedStep === step.id
                      ? "ring-2 ring-[#0087d9] shadow-lg"
                      : "hover:shadow-md"
                  }`}
                  onClick={() =>
                    setSelectedStep(selectedStep === step.id ? null : step.id)
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-[#0087d9]">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-[#0087d9] bg-blue-50 px-2 py-1 rounded-full">
                            Step {step.id}
                          </span>
                        </div>
                        <CardTitle className="text-lg mt-1">
                          {step.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">{step.description}</p>

                    {selectedStep === step.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t pt-3 mt-3"
                      >
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <li
                              key={idx}
                              className="flex items-center space-x-2 text-sm text-gray-700"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                {/* Connection arrow */}
                {index < workflowSteps.length - 1 && index % 3 !== 2 && (
                  <div className="hidden lg:block absolute top-16 -right-6 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Card className="max-w-4xl mx-auto p-6 bg-[#0087d9] text-white">
            <h3 className="text-2xl font-bold mb-5">Ready to Get Started?</h3>
            <Button
              onClick={onProceed}
              className="h-10 px-6 text-base bg-white text-[#0087d9] hover:bg-blue-50 transition-colors duration-300"
            >
              Proceed to Chat Interface
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
