# Intelligent Metadata Extraction Implementation Guide

## Executive Summary
Implementation of Quick Analysis vs Comprehensive Analysis with Zap Mode toggle, maintaining full integration with existing codebase.

---

## Field Mapping & Integration Points

### 1. Frontend State Management

#### **Existing Fields (Keep As-Is)**
```typescript
// In chat-interface.tsx - DO NOT MODIFY
interface ChatState {
  documentId: string | null
  fileName: string | null
  documentMetadata: {
    company_name: string
    nature_of_business: string
    operational_demographics: string
  } | null
  currentStep: ChatStep | null
  isProcessing: boolean
}
```

#### **New Fields to Add**
```typescript
// ADD to existing ChatState interface
interface ChatState {
  // ... existing fields above ...
  
  // NEW: Analysis mode tracking
  analysisMode: 'quick' | 'comprehensive'
  
  // NEW: Real-time keyword extraction feedback
  keywordExtractionStatus: {
    isExtracting: boolean
    currentKeyword: string | null
    discoveredKeywords: string[]
    extractionStep: string | null
  }
  
  // NEW: Processing time tracking
  processingStartTime: number | null
  estimatedProcessingTime: number
}
```

#### **New Component State (Additional)**
```typescript
// In side-panel.tsx - ADD these states
const [zapModeEnabled, setZapModeEnabled] = useState(false)
const [showKeywordAnimation, setShowKeywordAnimation] = useState(false)
const [extractionProgress, setExtractionProgress] = useState(0)
```

---

### 2. Backend Document Processing

#### **Existing Document Status (Keep Structure)**
```python
# In enhanced_debug_server.py - MAINTAIN existing structure
document_status = {
    "document_id": {
        "status": "COMPLETED",
        "metadata_extraction": "COMPLETED", 
        "metadata": {
            "company_name": str,
            "nature_of_business": str,
            "operational_demographics": str,
            "_overall_status": str
        }
    }
}
```

#### **Enhanced Document Status (Add Fields)**
```python
# EXTEND existing document_status structure
document_status = {
    "document_id": {
        # ... existing fields above ...
        
        # NEW: Analysis mode tracking
        "analysis_mode": "quick" | "comprehensive",
        
        # NEW: Extraction process tracking
        "extraction_process": {
            "keywords_discovered": [],
            "sections_analyzed": [],
            "processing_time_seconds": float,
            "extraction_method": str
        },
        
        # NEW: Content targeting info
        "content_analysis": {
            "document_sections_identified": [],
            "keyword_matches": {},
            "content_quality_score": float
        }
    }
}
```

---

### 3. API Endpoint Integration

#### **Existing Upload Endpoint (Modify)**
```python
# File: enhanced_debug_server.py
# Function: upload_document()
# CURRENT: Simple 8000 character truncation
# MODIFY TO: Mode-aware extraction

@app.post("/api/v1/analysis/upload")
async def upload_document(
    file: UploadFile, 
    analysis_mode: str = "quick"  # NEW PARAMETER
):
    # ... existing file handling code ...
    
    # REPLACE simple truncation with intelligent extraction
    if analysis_mode == "quick":
        extracted_content = quick_extraction_strategy(text)
    else:
        extracted_content = comprehensive_extraction_strategy(text)
    
    # ... rest of existing code ...
```

#### **New Keyword Tracking Endpoint**
```python
# ADD new endpoint for real-time keyword feedback
@app.get("/api/v1/analysis/documents/{document_id}/keywords")
async def get_keyword_extraction_status(document_id: str):
    return {
        "keywords_discovered": [],
        "current_step": str,
        "progress_percentage": float
    }
```

---

### 4. Frontend Component Integration

#### **Side Panel Progress Steps (Extend Existing)**
```typescript
// In side-panel.tsx - renderProgressSteps()
// CURRENT: Basic upload progress
// ADD: Zap mode toggle and keyword animation

const renderProgressSteps = () => {
  // ... existing steps array ...
  
  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#0884dc]">Analysis Progress</h3>
        
        {/* NEW: Zap Mode Toggle */}
        <ZapModeToggle 
          enabled={zapModeEnabled}
          onToggle={setZapModeEnabled}
          disabled={isUploading}
        />
      </div>
      
      {/* EXISTING: Steps rendering */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          // ... existing step rendering ...
          
          {/* NEW: Keyword extraction animation for upload step */}
          {step.id === 'upload' && isActive && isUploading && (
            <KeywordExtractionDisplay 
              keywords={chatState.keywordExtractionStatus.discoveredKeywords}
              currentKeyword={chatState.keywordExtractionStatus.currentKeyword}
              step={chatState.keywordExtractionStatus.extractionStep}
            />
          )}
        })}
      </div>
    </Card>
  )
}
```

#### **Chat Interface Upload Handler (Extend)**
```typescript
// In chat-interface.tsx - handleFileUpload()
// CURRENT: Simple upload with progress tracking
// MODIFY: Add analysis mode and keyword tracking

const handleFileUpload = async (file: File) => {
  try {
    // ... existing upload setup ...
    
    // NEW: Set analysis mode based on Zap toggle
    const analysisMode = chatState.analysisMode
    
    // NEW: Initialize keyword tracking
    setChatState(prev => ({
      ...prev,
      keywordExtractionStatus: {
        isExtracting: true,
        currentKeyword: null,
        discoveredKeywords: [],
        extractionStep: "Analyzing document structure..."
      },
      processingStartTime: Date.now(),
      estimatedProcessingTime: analysisMode === 'quick' ? 8 : 20
    }))
    
    // MODIFY: Upload with analysis mode
    const response = await api.documents.upload(file, { analysisMode })
    
    // NEW: Start keyword polling
    startKeywordPolling(response.document_id)
    
    // ... existing success handling ...
  } catch (error) {
    // ... existing error handling ...
  }
}
```

---

### 5. New Components to Create

#### **ZapModeToggle Component**
```typescript
// NEW FILE: components/ui/zap-mode-toggle.tsx
interface ZapModeToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  disabled?: boolean
}

// Thunder icon with blue color
// Toggle between Quick/Comprehensive
// Disabled state during processing
```

#### **KeywordExtractionDisplay Component**
```typescript
// NEW FILE: components/ui/keyword-extraction-display.tsx
interface KeywordExtractionDisplayProps {
  keywords: string[]
  currentKeyword: string | null
  step: string | null
}

// Magnifying glass animation
// Real-time keyword appearance
// Progress indication
```

---

### 6. Backend Processing Strategy

#### **Document Analysis Classes**
```python
# NEW FILE: document_analyzer.py
class DocumentAnalyzer:
    def __init__(self, analysis_mode: str):
        self.mode = analysis_mode
        
    def extract_content(self, pdf_text: str) -> str:
        if self.mode == "quick":
            return self.quick_extraction(pdf_text)
        else:
            return self.comprehensive_extraction(pdf_text)
    
    def quick_extraction(self, text: str) -> str:
        # Target first 3000 chars + keyword areas
        # Processing time: ~2-3 seconds
        pass
    
    def comprehensive_extraction(self, text: str) -> str:
        # Multi-section intelligent sampling
        # Processing time: ~5-8 seconds
        pass

class KeywordExtractor:
    def __init__(self):
        self.target_keywords = [
            "company name", "registered office", "nature of business",
            "principal activities", "incorporated", "headquarters"
        ]
    
    def find_keyword_sections(self, text: str) -> dict:
        # Return sections containing target keywords
        pass
```

---

### 7. Integration Checkpoints

#### **Phase 1: Backend Integration**
- [ ] Modify upload endpoint to accept analysis_mode parameter
- [ ] Implement DocumentAnalyzer class with both extraction strategies
- [ ] Add keyword tracking to document_status structure
- [ ] Create keyword polling endpoint

#### **Phase 2: Frontend State Integration**
- [ ] Extend ChatState interface with new fields
- [ ] Add analysis mode state management to chat-interface.tsx
- [ ] Integrate Zap toggle with existing side panel

#### **Phase 3: Component Integration**
- [ ] Create ZapModeToggle component
- [ ] Create KeywordExtractionDisplay component
- [ ] Integrate both components into existing side panel structure

#### **Phase 4: Process Integration**
- [ ] Modify handleFileUpload to include analysis mode
- [ ] Add keyword polling mechanism
- [ ] Update progress tracking with mode-specific messaging

#### **Phase 5: Testing Integration**
- [ ] Test Quick mode with existing documents
- [ ] Test Comprehensive mode end-to-end
- [ ] Verify all existing functionality remains intact

---

### 8. Critical Integration Points

#### **DO NOT MODIFY (Maintain Compatibility)**
- Existing API response structures for document details
- Current chat message format and flow
- Existing error handling mechanisms
- Document upload file handling logic
- Framework selection workflow

#### **EXTEND CAREFULLY**
- Side panel rendering (add components without breaking layout)
- Chat state management (add fields without changing existing)
- Upload process (enhance without changing success/error flows)

#### **TESTING REQUIREMENTS**
- All existing workflows must continue working
- New features should be additive, not replacement
- Backward compatibility with existing document sessions
- Error handling should gracefully fall back to existing behavior

---

## Implementation Timeline

1. **Week 1**: Backend document analysis strategy implementation
2. **Week 2**: Frontend component creation and state integration
3. **Week 3**: API integration and keyword polling
4. **Week 4**: UI polish and comprehensive testing
5. **Week 5**: Performance optimization and bug fixes

---

## Success Metrics

- **Quick Analysis**: 5-8 seconds processing time, 85%+ metadata accuracy
- **Comprehensive Analysis**: 12-20 seconds processing time, 95%+ metadata accuracy
- **User Engagement**: Smooth animation feedback, no perceived waiting
- **Integration Success**: All existing functionality works unchanged