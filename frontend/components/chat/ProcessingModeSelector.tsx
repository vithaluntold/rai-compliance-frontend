"use client";

import React, { useState } from "react";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {
  Zap,
  Brain,
  BarChart3,
  Clock,
  DollarSign,
  Target,
  Users,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";
import {cn} from "@/lib/utils";

export type ProcessingMode = "zap" | "smart" | "comparison";

interface ProcessingModeSelectorProps {
  onModeSelect: (mode: ProcessingMode) => void;
  documentId: string;
  frameworks: string[];
  isSubmitting?: boolean;
  isCompleted?: boolean; // Track if selection has been made
}

interface ModeConfig {
  id: ProcessingMode;
  name: string;
  description: string;
  tagline: string;
  icon: React.ElementType;
  features: {
    speed: number; // 1-5 stars
    cost: number; // 1-5 stars
    accuracy: number; // 1-5 stars
    multiUser: number; // 1-5 stars
  };
  benefits: string[];
  bestFor: string;
  estimatedTime: string;
  color: string;
  gradient: string;
}

const modes: ModeConfig[] = [
  {
    id: "zap",
    name: "Zap Mode",
    description: "Lightning Fast Analysis",
    tagline: "Ultra-fast processing with 32 parallel workers",
    icon: Zap,
    features: {
      speed: 5,
      cost: 2,
      accuracy: 3,
      multiUser: 2,
    },
    benefits: [
      "Fastest processing (~2 minutes)",
      "32 concurrent workers",
      "Immediate results",
      "Perfect for quick testing",
    ],
    bestFor: "Quick Test",
    estimatedTime: "~2 minutes",
    color: "text-yellow-600",
    gradient:
      "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
  },
  {
    id: "smart",
    name: "Smart Mode",
    description: "AI-Powered Intelligence",
    tagline: "Intelligent semantic processing with cost efficiency",
    icon: Brain,
    features: {
      speed: 4,
      cost: 5,
      accuracy: 5,
      multiUser: 5,
    },
    benefits: [
      "60-80% cost reduction",
      "Intelligent content mapping",
      "Superior accuracy",
      "Production ready",
    ],
    bestFor: "Production",
    estimatedTime: "~3-4 minutes",
    color: "text-blue-600",
    gradient:
      "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
  },
  {
    id: "comparison",
    name: "Comparison Mode",
    description: "Performance Benchmark",
    tagline: "Run both methods with detailed performance metrics",
    icon: BarChart3,
    features: {
      speed: 3,
      cost: 3,
      accuracy: 5,
      multiUser: 3,
    },
    benefits: [
      "Side-by-side analysis",
      "Detailed performance metrics",
      "Method validation",
      "Best for evaluation",
    ],
    bestFor: "Analysis",
    estimatedTime: "~5-6 minutes",
    color: "text-purple-600",
    gradient:
      "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
  },
];

const StarRating = ({
  rating,
  icon: Icon,
}: {
  rating: number;
  icon: React.ElementType;
}) => {
  return (
    <div className="flex items-center gap-1">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={cn(
              "w-3 h-3 rounded-full",
              star <= rating ? "bg-yellow-400" : "bg-gray-200 dark:bg-gray-700",
            )}
          />
        ))}
      </div>
    </div>
  );
};

const FeatureComparison = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Feature Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Feature</th>
                <th className="text-center py-2 font-medium">Zap Mode</th>
                <th className="text-center py-2 font-medium">Smart Mode</th>
                <th className="text-center py-2 font-medium">Comparison</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-3 font-medium">Speed</td>
                <td className="text-center py-3">
                  <StarRating rating={5} icon={Clock} />
                </td>
                <td className="text-center py-3">
                  <StarRating rating={4} icon={Clock} />
                </td>
                <td className="text-center py-3">
                  <StarRating rating={3} icon={Clock} />
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Cost Efficiency</td>
                <td className="text-center py-3">
                  <StarRating rating={2} icon={DollarSign} />
                </td>
                <td className="text-center py-3">
                  <StarRating rating={5} icon={DollarSign} />
                </td>
                <td className="text-center py-3">
                  <StarRating rating={3} icon={DollarSign} />
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Accuracy</td>
                <td className="text-center py-3">
                  <StarRating rating={3} icon={Target} />
                </td>
                <td className="text-center py-3">
                  <StarRating rating={5} icon={Target} />
                </td>
                <td className="text-center py-3">
                  <StarRating rating={5} icon={Target} />
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Multi-User</td>
                <td className="text-center py-3">
                  <StarRating rating={2} icon={Users} />
                </td>
                <td className="text-center py-3">
                  <StarRating rating={5} icon={Users} />
                </td>
                <td className="text-center py-3">
                  <StarRating rating={3} icon={Users} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ProcessingModeSelector({
  onModeSelect,
  documentId,
  frameworks,
  isSubmitting = false,
  isCompleted = false,
}: ProcessingModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<ProcessingMode | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // If completed, show a simple confirmation message instead of the selector
  if (isCompleted) {
    return (
      <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Processing Mode Selected
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Analysis is now in progress with your selected processing mode.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleModeSelect = (mode: ProcessingMode) => {
    setSelectedMode(mode);
  };

  const handleContinue = () => {
    if (selectedMode) {
      onModeSelect(selectedMode);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Choose Your Processing Mode
        </h2>
        <p className="text-muted-foreground">
          Select the analysis approach that best fits your needs
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          className={cn(
            "h-8 px-2 flex items-center gap-2",
            showComparison
              ? "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              : "bg-transparent hover:bg-gray-100 text-gray-600"
          )}
          onClick={() => setShowComparison(!showComparison)}
        >
          <Info className="w-4 h-4" />
          {showComparison ? "Hide" : "Show"} Comparison Table
        </Button>
      </div>

      {showComparison && <FeatureComparison />}

      <div className="grid gap-4 md:grid-cols-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <Card
              key={mode.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg",
                isSelected
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md",
                `bg-gradient-to-br ${mode.gradient}`,
              )}
              onClick={() => handleModeSelect(mode.id)}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Icon className={cn("w-8 h-8", mode.color)} />
                  {isSelected && (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {mode.name}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium">
                    {mode.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{mode.tagline}</p>

                <div className="space-y-2">
                  {mode.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{mode.estimatedTime}</span>
                  </div>
                  <Badge className="bg-secondary text-xs">
                    Best for {mode.bestFor}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedMode && (
        <div className="flex flex-col items-center space-y-4 pt-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              You&apos;ve selected{" "}
              <span className="font-semibold">
                {modes.find((m) => m.id === selectedMode)?.name}
              </span>{" "}
              for your analysis
            </p>
            <p className="text-xs text-muted-foreground">
              Analyzing {frameworks.length} framework
              {frameworks.length !== 1 ? "s" : ""} • Document ID: {documentId}
            </p>
          </div>
          <Button
            onClick={handleContinue}
            disabled={isSubmitting}
            className="flex items-center gap-2 h-10 px-6 text-base"
          >
            {isSubmitting ? (
              "Starting Analysis..."
            ) : (
              <>
                Continue with {modes.find((m) => m.id === selectedMode)?.name}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
