import React, { useState, useEffect } from "react";
import DocumentUpload from "./components/DocumentUpload";
import DocumentStatus from "./components/DocumentStatus";

// Mock types and functions since this is a test file
interface Document {
  id: string;
  filename: string;
  upload_date: string;
  status: string;
}

const listDocuments = async (): Promise<Document[]> => {
  return [];
};

const App: React.FC = () => {
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(
    null,
  );
  const [documents, setDocuments] = useState<Document[]>([]);

  // Helper functions for status styling
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ffd700';
      case 'processing': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'failed': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#000';
      case 'processing': return 'white';
      case 'completed': return 'white';
      case 'failed': return 'white';
      default: return 'white';
    }
  };

  // Load documents on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await listDocuments();
        setDocuments(docs);
      } catch (__error) {
      }
    };
    loadDocuments();
  }, []);

  const handleUploadComplete = (documentId: string) => {
    setCurrentDocumentId(documentId);
    // Refresh documents list
    listDocuments().then(setDocuments).catch(() => {});
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#333', margin: '0' }}>IAS 40 Document Analysis</h1>
      </header>

      <main>
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#444', marginBottom: '20px' }}>Upload Document</h2>
          <DocumentUpload onUploadComplete={handleUploadComplete} />
        </section>

        {currentDocumentId && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#444', marginBottom: '20px' }}>Document Status</h2>
            <DocumentStatus
              documentId={currentDocumentId}
              onComplete={() => {
                // Refresh documents list when processing completes
                listDocuments().then(setDocuments).catch(() => {});
              }}
            />
          </section>
        )}

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#444', marginBottom: '20px' }}>Recent Documents</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderColor: doc.id === currentDocumentId ? '#2196f3' : '#ddd',
                  backgroundColor: doc.id === currentDocumentId ? 'rgba(33, 150, 243, 0.05)' : 'white'
                }}
                className={`document-card ${doc.id === currentDocumentId ? "active" : ""}`}
                onClick={() => setCurrentDocumentId(doc.id)}
              >
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>{doc.filename}</h3>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9em' }}>
                  Uploaded: {new Date(doc.upload_date).toLocaleString()}
                </p>
                <div 
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '0.8em',
                    backgroundColor: getStatusColor(doc.status),
                    color: getStatusTextColor(doc.status)
                  }}
                  className={`status-badge ${doc.status.toLowerCase()}`}
                >
                  {doc.status}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
