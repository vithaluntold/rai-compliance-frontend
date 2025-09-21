import axios from "axios";

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'https://rai-compliance-backend.onrender.com'

export const api = {
  analysis: {
    // Upload a document for analysis
    async uploadDocument(file: File) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/analysis/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    },

    // Get the status of a document analysis
    async getStatus(documentId: string) {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/analysis/status/${documentId}`,
      );

      return response.data;
    },

    // Get the analysis results for a document
    async getResults(documentId: string) {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/analysis/documents/${documentId}/results`,
      );

      return response.data;
    },

    // Get available frameworks and standards
    async getFrameworks() {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/analysis/frameworks`,
      );

      return response.data;
    },

    // Get real-time analysis progress for a document
    async getProgress(documentId: string) {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/analysis/progress/${documentId}`,
      );

      return response.data;
    },

    // Get a specific framework's checklist
    async getFrameworkChecklist(framework: string, standard: string) {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/analysis/checklist/${framework}/${standard}`,
      );

      return response.data;
    },

    // Select a framework and standards for a document and start compliance analysis
    async selectFramework(
      documentId: string,
      data: {
        framework: string;
        standards: string[];
        specialInstructions?: string;
        extensiveSearch?: boolean;
        processingMode?: string;
      },
    ) {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/analysis/documents/${documentId}/select-framework`,
        data,
      );

      return response.data;
    },

    // Update a checklist item
    async updateChecklistItem(
      documentId: string,
      itemId: string,
      updates: unknown,
    ) {
      const response = await axios.patch(
        `${API_BASE_URL}/api/v1/analysis/documents/${documentId}/items/${itemId}`,
        updates,
      );

      return response.data;
    },
  },

  sessions: {
    // Create a new session
    async create(data: { title?: string; description?: string }) {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/sessions/create`,
        data,
      );
      return response.data;
    },

    // Get list of sessions
    async list(limit: number = 50, offset: number = 0) {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/sessions/list?limit=${limit}&offset=${offset}`,
      );
      return response.data;
    },

    // Get a specific session by ID
    async get(sessionId: string) {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/sessions/${sessionId}`,
      );
      return response.data;
    },

    // Update a session
    async update(sessionId: string, data: { 
      title?: string; 
      description?: string; 
      chat_state?: unknown; 
      messages?: unknown[] 
    }) {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/sessions/${sessionId}`,
        data,
      );
      return response.data;
    },

    // Delete a session
    async delete(sessionId: string) {
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/sessions/${sessionId}`,
      );
      return response.data;
    },

    // Archive a session
    async archive(sessionId: string) {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/sessions/${sessionId}/archive`,
      );
      return response.data;
    },
  },
};
