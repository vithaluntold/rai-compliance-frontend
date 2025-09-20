"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  FileTextIcon,
  QuoteIcon,
  ExternalLinkIcon,
  FilterIcon,
  BookmarkIcon,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {AnimatePresence, motion} from "framer-motion";

interface EvidenceItem {
  id: string;
  text: string;
  source?: string;
  page?: number;
  section?: string;
  confidence?: number;
  type?: "direct_quote" | "paraphrase" | "reference" | "calculation";
  context?: string;
}

interface EvidenceViewerProps {
  evidence: EvidenceItem[];
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  highlightKeywords?: string[];
  className?: string;
}

export function EvidenceViewer({
  evidence,
  title = "Evidence",
  searchable = true,
  filterable = true,
  highlightKeywords = [],
  className,
}: EvidenceViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Filter evidence based on search and type filters
  const filteredEvidence = evidence.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.section?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedTypes.length === 0 ||
      (item.type && selectedTypes.includes(item.type));

    return matchesSearch && matchesType;
  });

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "direct_quote":
        return <QuoteIcon className="h-3 w-3" />;
      case "paraphrase":
        return <FileTextIcon className="h-3 w-3" />;
      case "reference":
        return <BookmarkIcon className="h-3 w-3" />;
      case "calculation":
        return <ExternalLinkIcon className="h-3 w-3" />;
      default:
        return <FileTextIcon className="h-3 w-3" />;
    }
  };

  const getTypeBadge = (type?: string) => {
    const typeConfig = {
      direct_quote: {
        label: "Quote",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
      paraphrase: {
        label: "Paraphrase",
        color: "bg-green-100 text-green-800 border-green-200",
      },
      reference: {
        label: "Reference",
        color: "bg-purple-100 text-purple-800 border-purple-200",
      },
      calculation: {
        label: "Calculation",
        color: "bg-orange-100 text-orange-800 border-orange-200",
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || {
      label: "Evidence",
      color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600",
    };

    return (
      <Badge className={cn("border text-xs", config.color)}>
        {getTypeIcon(type)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const highlightText = (text: string, keywords: string[]) => {
    if (keywords.length === 0) return text;

    let highlightedText = text;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200 px-1 rounded">$1</mark>',
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  // Get unique evidence types for filtering
  const availableTypes = Array.from(
    new Set(evidence.map((e) => e.type).filter(Boolean)),
  ) as string[];

  if (evidence.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-gray-500">
          <FileTextIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No evidence available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <Badge className="border text-sm">
            {filteredEvidence.length} of {evidence.length} items
          </Badge>
        </div>

        {/* Search and Filter Controls */}
        {(searchable || filterable) && (
          <div className="space-y-3">
            {searchable && (
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search evidence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            {filterable && availableTypes.length > 0 && (
              <div className="flex items-center space-x-2">
                <FilterIcon className="h-4 w-4 text-gray-500" />
                <div className="flex flex-wrap gap-1">
                  {availableTypes.map((type) => (
                    <Button
                      key={type}
                      className={cn(
                        "h-7 px-2 text-xs",
                        selectedTypes.includes(type)
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      )}
                      onClick={() => toggleTypeFilter(type)}
                    >
                      {getTypeIcon(type)}
                      <span className="ml-1 capitalize">
                        {type.replace("_", " ")}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <AnimatePresence>
          {filteredEvidence.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className="border rounded-lg"
            >
              <Collapsible
                open={expandedItems.has(item.id)}
                onOpenChange={() => toggleItem(item.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    className="bg-transparent w-full justify-between p-3 h-auto text-left"
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {highlightText(
                            item.text,
                            [...highlightKeywords, searchTerm].filter(Boolean),
                          )}
                        </p>
                        {item.source && (
                          <p className="text-xs text-gray-500 mt-1">
                            {item.source}
                            {item.page && ` • Page ${item.page}`}
                            {item.section && ` • ${item.section}`}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 space-y-1">
                        {getTypeBadge(item.type)}
                        {item.confidence !== undefined && (
                          <div className="text-xs text-gray-500 text-right">
                            {Math.round(item.confidence * 100)}% confident
                          </div>
                        )}
                      </div>
                    </div>
                    {expandedItems.has(item.id) ? (
                      <ChevronDownIcon className="h-4 w-4 ml-2 flex-shrink-0" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 ml-2 flex-shrink-0" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-3 border-t dark:border-white bg-gray-50 dark:bg-gray-800">
                    {/* Full Evidence Text */}
                    <div className="mb-3">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                        Full Evidence
                      </h4>
                      <blockquote className="bg-white dark:bg-gray-700 p-3 rounded border-l-4 border-blue-200 dark:border-blue-400 italic text-sm text-gray-700 dark:text-gray-300">
                        {highlightText(
                          item.text,
                          [...highlightKeywords, searchTerm].filter(Boolean),
                        )}
                      </blockquote>
                    </div>

                    {/* Context */}
                    {item.context && (
                      <div className="mb-3">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                          Context
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 p-2 rounded border dark:border-white">
                          {item.context}
                        </p>
                      </div>
                    )}

                    {/* Source Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {item.source && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Source:
                          </span>
                          <span className="ml-2 text-gray-600">
                            {item.source}
                          </span>
                        </div>
                      )}
                      {item.page && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Page:
                          </span>
                          <span className="ml-2 text-gray-600">
                            {item.page}
                          </span>
                        </div>
                      )}
                      {item.section && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Section:
                          </span>
                          <span className="ml-2 text-gray-600">
                            {item.section}
                          </span>
                        </div>
                      )}
                      {item.confidence !== undefined && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Confidence:
                          </span>
                          <span className="ml-2 text-gray-600">
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredEvidence.length === 0 && searchTerm && (
          <div className="text-center py-6 text-gray-500">
            <SearchIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No evidence matches your search criteria</p>
            <Button
              className="bg-transparent h-8 px-2 mt-2"
              onClick={() => setSearchTerm("")}
            >
              Clear search
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
