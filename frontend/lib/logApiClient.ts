/**
 * Frontend API client for sending logs to backend
 */

export interface LogData {
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

export class LogApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'https://rai-compliance-backend.onrender.com';
  }

  async sendPipelineLog(logData: Record<string, unknown>) {
    try {
      const response = await fetch(`${this.baseUrl}/api/logs/analysis-pipeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        throw new Error(`Failed to send pipeline log: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Log error for debugging
      if (typeof window !== 'undefined' && window.console) {
        window.console.error('Failed to send pipeline log to backend:', error);
      }
      // Don't throw - logging failures shouldn't break the app
    }
  }

  async sendProceedAnalysisLog(clickData: Record<string, unknown>) {
    try {
      const response = await fetch(`${this.baseUrl}/api/logs/proceed-analysis-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clickData),
      });

      if (!response.ok) {
        throw new Error(`Failed to send proceed analysis log: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Log error for debugging
      if (typeof window !== 'undefined' && window.console) {
        window.console.error('Failed to send proceed analysis log to backend:', error);
      }
      // Don't throw - logging failures shouldn't break the app
    }
  }

  async exportDebugLog(debugData: Record<string, unknown>) {
    try {
      const response = await fetch(`${this.baseUrl}/api/logs/debug-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debugData),
      });

      if (!response.ok) {
        throw new Error(`Failed to export debug log: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Log error for debugging
      if (typeof window !== 'undefined' && window.console) {
        window.console.error('Failed to export debug log to backend:', error);
      }
    }
  }
}

export const logApiClient = new LogApiClient();