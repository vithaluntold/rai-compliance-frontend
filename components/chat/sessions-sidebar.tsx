"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  MessageSquare, 
  Calendar,
  FileText,
  MoreVertical,
  Trash2,
  Archive,
  Edit,
  ChevronLeft,
  ChevronRight,
  Activity
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, Session, SessionDetail } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import { ProcessingLogs } from "@/components/ui/processing-logs";

interface SessionsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSessionSelect: (session: SessionDetail) => void;
  onNewSession: () => void;
  currentSessionId?: string;
  processingLogs?: any[];
  showProcessingLogs?: boolean;
  onToggleProcessingLogs?: () => void;
}

export function SessionsSidebar({ 
  isOpen, 
  onToggle, 
  onSessionSelect, 
  onNewSession,
  currentSessionId,
  processingLogs = [],
  showProcessingLogs = true,
  onToggleProcessingLogs
}: SessionsSidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const { toast } = useToast();

  // Load sessions function
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.sessions.list(50, 0);
      // ✅ CRITICAL FIX: Ensure data is always an array to prevent "m.map is not a function" error
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      // console.error("Failed to load sessions:", error);
      // ✅ CRITICAL FIX: Reset to empty array on error to prevent map failures
      setSessions([]);
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleCreateSession = async () => {
    try {
      // Use onNewSession to properly reset the chat interface instead of creating session here
      onNewSession();
      
      toast({
        title: "Success",
        description: "New session started",
      });
    } catch {
      // console.error("Failed to create session:", error);
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      const sessionDetail = await api.sessions.get(sessionId);
      onSessionSelect(sessionDetail);
    } catch {
      // console.error("Failed to load session:", error);
      toast({
        title: "Error",
        description: "Failed to load session",
        variant: "destructive",
      });
    }
  };

  const handleEditSession = async (sessionId: string, newTitle: string) => {
    try {
      await api.sessions.update(sessionId, { title: newTitle });
      await loadSessions();
      setEditingSession(null);
      toast({
        title: "Success",
        description: "Session renamed",
      });
    } catch {
      // console.error("Failed to update session:", error);
      toast({
        title: "Error",
        description: "Failed to rename session",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.sessions.delete(sessionId);
      await loadSessions();
      
      // If we deleted the current session, start a new one
      if (sessionId === currentSessionId) {
        onNewSession();
      }
      
      toast({
        title: "Success",
        description: "Session deleted",
      });
    } catch {
      // console.error("Failed to delete session:", error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const handleArchiveSession = async (sessionId: string) => {
    try {
      await api.sessions.archive(sessionId);
      await loadSessions();
      toast({
        title: "Success",
        description: "Session archived",
      });
    } catch {
      // console.error("Failed to archive session:", error);
      toast({
        title: "Error",
        description: "Failed to archive session",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        className="border h-10 px-3 fixed top-4 left-4 z-50 bg-white hover:bg-gray-50 shadow-lg border-gray-300 transition-all duration-200 rounded-md"
        onClick={onToggle}
        title={isOpen ? "Collapse Sessions" : "Expand Sessions"}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {!isOpen && <span className="ml-2 text-sm font-medium">Sessions</span>}
      </Button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={onToggle}
            />
            
            {/* Sidebar Content */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="fixed left-0 top-0 h-full w-[26rem] bg-white border-r border-gray-200 z-50 flex flex-col shadow-lg"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Analysis Sessions</h2>
                  <Button className="bg-transparent h-8 px-2" onClick={onToggle}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  onClick={handleCreateSession}
                  className="w-full bg-[#0087d9] hover:bg-blue-700 text-white h-8 px-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Session
                </Button>
              </div>

              {/* Sessions List */}
              <ScrollArea className="flex-1 p-4 min-h-0">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0087d9]"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No sessions yet</p>
                    <p className="text-sm">Create your first analysis session</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* ✅ CRITICAL FIX: Double protection against "m.map is not a function" error */}
                    {(Array.isArray(sessions) ? sessions : []).map((session) => (
                      <Card
                        key={session.session_id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          session.session_id === currentSessionId 
                            ? "border-[#0087d9] bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleSelectSession(session.session_id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 pr-2">
                              {editingSession === session.session_id ? (
                                <Input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onBlur={() => handleEditSession(session.session_id, editTitle)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleEditSession(session.session_id, editTitle);
                                    } else if (e.key === "Escape") {
                                      setEditingSession(null);
                                    }
                                  }}
                                  className="text-sm font-medium"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <h3 className="text-sm font-medium text-gray-900 break-words leading-relaxed" title={session.title}>
                                  {/* Display document ID if it looks like one, otherwise show cleaned title */}
                                  {session.title.match(/RAI-\d{8}-[A-Z0-9]{5}-[A-Z0-9]{5}/) ? 
                                    session.title : 
                                    (session.title.startsWith('Analysis - ') ? 
                                      session.title.replace('Analysis - ', '') : 
                                      session.title)
                                  }
                                </h3>
                              )}
                              
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <Badge 
                                  className={`bg-secondary text-xs ${getStatusColor(session.status)}`}
                                >
                                  {session.status}
                                </Badge>
                                {session.document_count > 0 && (
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {session.document_count} docs
                                  </span>
                                )}
                                <p className="text-xs text-gray-500 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(session.updated_at)}
                                </p>
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  className="bg-transparent h-8 w-8 p-0 hover:bg-gray-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSession(session.session_id);
                                    setEditTitle(session.title);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                {session.status === "active" && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleArchiveSession(session.session_id);
                                    }}
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSession(session.session_id);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Processing Logs Section - Permanently Attached to Bottom */}
              {showProcessingLogs && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        Processing Logs
                      </h3>
                      {onToggleProcessingLogs && (
                        <Button
                          onClick={onToggleProcessingLogs}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="h-64">
                    <ProcessingLogs 
                      logs={processingLogs}
                      isVisible={true}
                      maxHeight="256px"
                    />
                  </div>
                </div>
              )}

              {/* Show Logs Button when hidden */}
              {!showProcessingLogs && onToggleProcessingLogs && (
                <div className="border-t border-gray-200 bg-gray-50 p-3">
                  <Button
                    onClick={onToggleProcessingLogs}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                    size="sm"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Show Processing Logs
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
