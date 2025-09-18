"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, Terminal, Copy, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  category: string;
  message: string;
  details?: any;
  duration?: number;
}

interface ProcessingLogsProps {
  logs: LogEntry[];
  isVisible?: boolean;
  onToggle?: () => void;
  maxHeight?: string;
}

export function ProcessingLogs({ 
  logs, 
  isVisible = false, 
  onToggle,
  maxHeight = "300px" 
}: ProcessingLogsProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const copyLogsToClipboard = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()} - ${log.category}: ${log.message}${
        log.details ? '\n  Details: ' + JSON.stringify(log.details, null, 2) : ''
      }`
    ).join('\n');
    
    navigator.clipboard.writeText(logText);
  };

  const downloadLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()} - ${log.category}: ${log.message}${
        log.details ? '\n  Details: ' + JSON.stringify(log.details, null, 2) : ''
      }`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processing-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getLevelSymbol = (level: string) => {
    switch (level) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✗';
      default: return 'ℹ';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Terminal className="h-5 w-5 text-gray-600" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Processing Logs</h3>
            <p className="text-xs text-gray-500">{logs.length} entries</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          {/* Actions */}
          <Button
            variant="ghost"
            size="sm"
            onClick={copyLogsToClipboard}
            className="h-8 w-8 p-0"
            title="Copy logs to clipboard"
          >
            <Copy className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadLogs}
            className="h-8 w-8 p-0"
            title="Download logs"
          >
            <Download className="h-3 w-3" />
          </Button>

          {/* Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            {isVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Search */}
      {isVisible && (
        <div className="p-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Logs */}
      {isVisible && (
        <div 
          className="overflow-y-auto"
          style={{ maxHeight }}
        >
          {filteredLogs.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No logs found
            </div>
          ) : (
            <div className="p-3 space-y-1">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="group hover:bg-gray-50 rounded p-2 transition-colors"
                >
                  <div className="flex items-start space-x-2">
                    <span className={cn(
                      "inline-flex items-center justify-center w-5 h-5 rounded text-xs font-mono",
                      getLevelColor(log.level)
                    )}>
                      {getLevelSymbol(log.level)}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-900 truncate">
                          [{log.category}] {log.message}
                        </span>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {log.duration && (
                            <span>({log.duration}ms)</span>
                          )}
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                      
                      {log.details && (
                        <details className="mt-1 group-hover:bg-white rounded">
                          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                            Show details
                          </summary>
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hook to manage processing logs
export function useProcessingLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (
    level: LogEntry['level'],
    category: string,
    message: string,
    details?: any,
    duration?: number
  ) => {
    const newLog: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      category,
      message,
      details,
      duration,
    };

    setLogs(prev => [newLog, ...prev].slice(0, 1000)); // Keep only last 1000 logs
  };

  const clearLogs = () => setLogs([]);

  return {
    logs,
    addLog,
    clearLogs,
  };
}