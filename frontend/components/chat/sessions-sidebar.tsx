"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { 
  Plus, 
  MessageSquare, 
  Calendar,
  FileText,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Share2
} from "lucide-react";
import { api, Session, SessionDetail } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/context/theme-context";

interface SessionsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSessionSelect: (session: SessionDetail) => void;
  onNewSession: () => void;
  currentSessionId?: string;
}

export function SessionsSidebar({ 
  isOpen, 
  onToggle, 
  onSessionSelect, 
  onNewSession,
  currentSessionId
}: SessionsSidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const { toast } = useToast();
  
  // Connect to global theme context (theme automatically applied to document)
  useTheme();

  // Load sessions function
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.sessions.list(50, 0);
      // ✅ CRITICAL FIX: Ensure data is always an array to prevent "m.map is not a function" error
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      // // Removed console.error for production
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
      // // Removed console.error for production
toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    if (loadingSessionId === sessionId) return; // Prevent double-clicks
    
    try {
      setLoadingSessionId(sessionId);
      
      const sessionDetail = await api.sessions.get(sessionId);
      
      if (sessionDetail) {
        onSessionSelect(sessionDetail);
        toast({
          title: "Success",
          description: "Session loaded successfully",
        });
      } else {
        throw new Error("Session data is empty");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleShareSession = async (sessionId: string, title: string) => {
    try {
      const shareUrl = `${window.location.origin}/session/${sessionId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `RAi Analysis Session: ${title}`,
          text: `Check out this compliance analysis session: ${title}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Session link copied to clipboard",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to share session",
        variant: "destructive",
      });
    }
  };

  const handleEditSession = async (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast({
        title: "Error",
        description: "Session title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.sessions.update(sessionId, { title: newTitle.trim() });
      await loadSessions();
      setEditingSession(null);
      toast({
        title: "Success",
        description: "Session renamed successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to rename session",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = async (sessionId: string, sessionTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${sessionTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.sessions.delete(sessionId);
      await loadSessions();
      
      // If we deleted the current session, start a new one
      if (sessionId === currentSessionId) {
        onNewSession();
      }
      
      toast({
        title: "Success",
        description: "Session deleted successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };



  const formatDate = (dateString: string) => {
    // Only format dates on client side to prevent hydration mismatches
    if (typeof window === 'undefined') {
      return dateString; // Return raw date during SSR
    }
    
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
        className="border h-10 w-10 fixed top-4 left-4 z-50 bg-[#0087d9] text-white hover:bg-[#0070c7] shadow-lg border-[#0087d9] transition-all duration-200 rounded-md"
        onClick={onToggle}
        title={isOpen ? "Collapse Sessions" : "Expand Sessions"}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            suppressHydrationWarning
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={onToggle}
          />
          
          {/* Sidebar Content */}
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-0 h-full w-[26rem] bg-white sidebar-panel border-r border-gray-200 z-50 flex flex-col shadow-lg"
          >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-[#0087d9]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Sessions</h2>
                  <Button className="bg-transparent h-8 px-2 text-white hover:bg-white/10" onClick={onToggle}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  onClick={handleCreateSession}
                  className="w-full bg-white hover:bg-gray-100 text-[#0087d9] h-8 px-2 font-semibold"
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
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                          session.session_id === currentSessionId 
                            ? "border-[#0087d9] bg-blue-50 shadow-md" 
                            : "border-gray-200 hover:border-[#0087d9]/50"
                        } ${loadingSessionId === session.session_id ? "opacity-50 pointer-events-none" : ""}`}
                        onClick={() => handleSelectSession(session.session_id)}
                      >
                        <CardContent className="p-4">
                          {loadingSessionId === session.session_id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0087d9]"></div>
                            </div>
                          )}
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
                            
                            <div className="flex items-center space-x-1">
                              <Button
                                className="bg-transparent h-7 w-7 p-0 hover:bg-blue-100 text-[#0087d9]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingSession(session.session_id);
                                  setEditTitle(session.title);
                                }}
                                title="Edit session name"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                className="bg-transparent h-7 w-7 p-0 hover:bg-blue-100 text-[#0087d9]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareSession(session.session_id, session.title);
                                }}
                                title="Share session"
                              >
                                <Share2 className="h-3 w-3" />
                              </Button>
                              <Button
                                className="bg-transparent h-7 w-7 p-0 hover:bg-red-100 text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSession(session.session_id, session.title);
                                }}
                                title="Delete session"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>


            </motion.div>
          </>
        )}
    </>
  );
}
