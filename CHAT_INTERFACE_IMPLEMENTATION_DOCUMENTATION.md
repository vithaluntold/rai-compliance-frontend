# RAi Compliance Engine - Chat Interface Implementation Documentation

## Project Overview
Converting the existing multi-page RAi Compliance Engine into a guided chat interface with restricted interactions and side panel confirmations for enhanced user experience and workflow control.

### Core Purpose & Methodology

**RAi Compliance Engine** is an AI-powered financial compliance analysis platform that automates the complex process of verifying whether financial statements meet specific accounting standard requirements. The system:

#### What We Ask & Why
The system asks **detailed compliance questions** derived from accounting standards (IFRS, IAS, IFRIC, SIC) to systematically verify financial statement completeness. For example:

- **IFRS 9 Questions**: "Does the entity disclose the carrying amounts of financial assets measured at fair value through profit or loss?"
- **IAS 40 Questions**: "Does the entity disclose the depreciation methods used and useful lives for investment property?"
- **Disclosure Requirements**: Each question maps to specific paragraph references (e.g., "IAS 16.77", "IFRS 9.4.1.1")

#### Analysis Methodology
1. **Document Processing**: Upload financial statements (PDF/DOCX) → Text extraction → Vector indexing
2. **Framework Selection**: Choose accounting framework (IFRS) and specific standards (e.g., IFRS 9, IAS 1)
3. **Intelligent Analysis**: AI analyzes document content against 100+ checklist questions per standard
4. **Evidence Extraction**: System finds relevant excerpts, page references, and assigns confidence scores
5. **Compliance Assessment**: Each question receives status (YES/NO/N/A/PARTIAL) with detailed explanation

#### Evidence Quality Assessment
The system performs sophisticated analysis:
- **Substantive Evidence**: Actual disclosure content vs. generic policy statements
- **Evidence Quality Scoring**: 0-100 score based on specificity and completeness  
- **Citation Mapping**: Exact page references and document excerpts
- **Confidence Levels**: 0.0-1.0 confidence in AI assessment
- **Suggestion Generation**: Specific disclosure improvements for non-compliant items

#### Final Output Structure
The system generates comprehensive compliance reports showing:
- **Company Metadata**: Extracted company name, business nature, operational demographics
- **Standard-by-Standard Analysis**: Sections for each accounting standard
- **Item-Level Results**: Individual compliance items with evidence, explanations, suggestions
- **Audit Trail**: Timestamps, processing status, error handling

This methodology ensures **systematic, auditable, and comprehensive** financial statement compliance verification that would typically require manual review by accounting professionals.

### Chat Interface Workflow Design

#### Guided Conversation Flow
The chat interface will mirror the existing systematic compliance analysis workflow:

1. **Document Upload Phase**
   - Chat Message: "Please upload your financial statement document (PDF or DOCX)"
   - User Action: File upload via drag-and-drop or file picker
   - System Response: "Document uploaded successfully. Extracting metadata..."
   - Backend Process: Text extraction, metadata analysis, vector indexing

2. **Metadata Confirmation Phase**  
   - Chat Message: "I've extracted the following company information. Please confirm:"
   - Side Panel Display: Editable fields for company_name, nature_of_business, operational_demographics
   - System Validation: Ensures complete metadata before proceeding

3. **Framework Selection Phase**
   - Chat Message: "Which accounting standards should I analyze your document against?"
   - Side Panel Display: Framework selector (IFRS/IAS) with available standards checklist
   - User Selection: Multiple standards (IFRS 9, IAS 1, etc.)
   - Chat Confirmation: "I'll analyze compliance with: IFRS 9, IAS 1, IAS 16. This will check 300+ requirements."

4. **Analysis Execution Phase**
   - Chat Message: "Analyzing your document for compliance..."
   - Progress Display: Real-time updates showing current standard being processed
   - Backend Process: AI analyzes each checklist question, extracts evidence, assigns confidence scores
   - Status Updates: "Processing IFRS 9... 45 questions completed"

5. **Results Presentation Phase**
   - Chat Message: "Analysis complete! Here's your compliance summary:"
   - Interactive Results: Expandable sections by standard, filterable by compliance status
   - Evidence Display: Click to view specific excerpts, page references, AI explanations
   - Action Items: Clear list of non-compliant items with suggested improvements

#### Conversation Intelligence
The chat interface will provide context-aware responses based on analysis results:
- **Proactive Suggestions**: "I noticed potential issues with IFRS 9 disclosures. Would you like me to prioritize these?"
- **Clarification Requests**: "The document mentions investment property but lacks depreciation disclosures. Should I check IAS 40 compliance?"
- **Confidence Alerts**: "I found 3 items with low confidence scores. These may need manual review."

#### Workflow Continuity
The system maintains workflow state across sessions:
- **Resume Analysis**: "Welcome back! Your IFRS 9 analysis is 75% complete. Shall I continue?"
- **Comparative Analysis**: "I can compare this with your previous submissions. Would you like a comparison?"
- **Iterative Improvements**: "Based on my suggestions, you can re-upload an updated document for re-analysis."

---

## Current System Analysis

### Existing Components to Analyze
- **Frontend**: Next.js 15.5.2 with TypeScript
- **Backend**: FastAPI server (simple_server.py) on localhost:8000
- **Document Processing**: Existing document analysis capabilities
- **Framework Selector**: Current framework-selector.tsx component
- **API Client**: lib/api-client.ts with error handling

### Current API Endpoints in Use
```
POST /api/v1/analysis/upload
GET /api/v1/analysis/status/{document_id}
GET /api/v1/analysis/documents/{document_id}
GET /api/v1/analysis/frameworks
POST /api/v1/analysis/documents/{document_id}/select-framework
```

### Current Data Structures
```typescript
// From existing implementation
interface DocumentMetadata {
    company_name: string;
    nature_of_business?: string;
    operational_demographics?: string;
    _overall_status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'PARTIAL' | 'NOT_FOUND';
    applicable_standards?: string[];
}

interface Document {
    id: string;
    filename: string;
    upload_date: string;
    analysis_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

// Framework structure from backend
interface Framework {
    id: string;
    name: string;
    description: string;
    standards: Array<{
        id: string;
        name: string;
        description: string;
        available: boolean;
    }>;
}
```

---

## Implementation Phases

### Phase 1: Chat Interface Foundation
**Objective**: Replace existing upload page with basic chat interface

#### Components to Create
- **ChatInterface**: Main chat component replacing current upload page
- **ChatMessage**: Individual message component for bot and system messages
- **SidePanel**: Collapsible panel for data confirmation and selections

#### Components to Remove/Replace
- **Current Upload Page**: Replace with ChatInterface
- **Multi-page Navigation**: Replace with single-page chat flow

#### Field Mappings (Phase 1)
- Use existing `document_id` from upload response
- Maintain existing `DocumentMetadata` interface structure
- Preserve `filename` and `upload_date` fields

### Phase 2: Document Analysis Integration
**Objective**: Integrate existing document analysis with chat workflow

#### Components to Modify
- **ChatInterface**: Add document analysis display
- **SidePanel**: Add company details confirmation section

#### API Flow Changes
- **Upload Flow**: POST /api/v1/analysis/upload → immediate metadata extraction
- **Metadata Display**: Use existing DocumentMetadata fields in side panel
- **Status Polling**: Maintain existing GET /api/v1/analysis/status/{document_id} polling

#### Field Mappings (Phase 2)
```typescript
// Existing fields to use in side panel
company_name: string          // Display in editable field
nature_of_business: string    // Display in editable field  
operational_demographics: string // Display in editable field
```

### Phase 3: Framework Selection Integration
**Objective**: Convert framework selector to side panel with chat guidance

#### Components to Modify
- **Framework Selector Logic**: Extract from framework-selector.tsx
- **SidePanel**: Add framework selection section
- **ChatInterface**: Add framework guidance messages

#### Components to Remove/Replace
- **framework-selector.tsx**: Logic extracted and integrated into SidePanel
- **Framework Selection Page**: Replaced by side panel

#### Field Mappings (Phase 3)
```typescript
// Use existing framework structure
selectedFramework: string     // From existing framework.id
selectedStandards: string[]   // From existing standards[].id array
```

#### API Integrations
- **Frameworks Loading**: Maintain GET /api/v1/analysis/frameworks
- **Framework Selection**: Maintain POST /api/v1/analysis/documents/{document_id}/select-framework

### Phase 4: Selective Processing Implementation
**Objective**: Process only user-selected standards

#### Backend Modifications Required
- **Analysis Pipeline**: Modify to accept selected standards as input
- **Checklist Filtering**: Filter questions based on selected standards
- **Results Generation**: Generate results only for selected standards

#### Field Mappings (Phase 4)
```typescript
// New processing parameters
processingStandards: string[]    // Selected standards for processing
specialInstructions?: string     // User's specific focus areas
extensiveSearch?: boolean        // Flag for extensive compliance search
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    RAi Chat Interface                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐   │
│  │                     │  │        Side Panel               │   │
│  │   Chat Interface    │  │  ┌─────────────────────────────┐ │   │
│  │                     │  │  │  Company Details            │ │   │
│  │  ┌───────────────┐  │  │  │  - company_name             │ │   │
│  │  │ Bot: Upload    │  │  │  │  - nature_of_business       │ │   │
│  │  │ your report    │  │  │  │  - operational_demographics │ │   │
│  │  └───────────────┘  │  │  └─────────────────────────────┘ │   │
│  │                     │  │                                 │   │
│  │  ┌───────────────┐  │  │  ┌─────────────────────────────┐ │   │
│  │  │ [File Upload] │  │  │  │  Framework Selection        │ │   │
│  │  └───────────────┘  │  │  │  - selectedFramework        │ │   │
│  │                     │  │  │  - selectedStandards[]      │ │   │
│  │  ┌───────────────┐  │  │  └─────────────────────────────┘ │   │
│  │  │ Bot: Review    │  │  │                                 │   │
│  │  │ company details│  │  │  ┌─────────────────────────────┐ │   │
│  │  └───────────────┘  │  │  │  Special Instructions       │ │   │
│  │                     │  │  │  - specialInstructions      │ │   │
│  │  ┌───────────────┐  │  │  │  - extensiveSearch          │ │   │
│  │  │ Bot: Select    │  │  │  └─────────────────────────────┘ │   │
│  │  │ standards      │  │  │                                 │   │
│  │  └───────────────┘  │  │                                 │   │
│  │                     │  │                                 │   │
│  └─────────────────────┘  └─────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POST /api/v1/analysis/upload                                   │
│  ├─── File Processing                                           │
│  ├─── Metadata Extraction (company_name, nature_of_business)    │
│  └─── Return document_id                                        │
│                                                                 │
│  GET /api/v1/analysis/frameworks                                │
│  └─── Return frameworks with standards                          │
│                                                                 │
│  POST /api/v1/analysis/documents/{document_id}/select-framework │
│  ├─── Receive selectedFramework + selectedStandards[]           │
│  ├─── Filter checklist by selected standards                   │
│  └─── Process only selected standards                          │
│                                                                 │
│  GET /api/v1/analysis/status/{document_id}                      │
│  └─── Return processing status                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Component Specifications

### ChatInterface Component
**Purpose**: Main container for the chat workflow
**State Management**:
```typescript
interface ChatState {
  currentStep: 'upload' | 'company-review' | 'framework-selection' | 'instructions' | 'processing';
  documentId?: string;
  documentMetadata?: DocumentMetadata;
  selectedFramework?: string;
  selectedStandards?: string[];
  specialInstructions?: string;
  extensiveSearch?: boolean;
}
```

### SidePanel Component
**Purpose**: Display confirmation data and capture user selections
**Sections**:
1. **Company Details Section** (appears after upload)
   - Editable fields for company_name, nature_of_business, operational_demographics
   - Submit button to confirm corrections

2. **Framework Selection Section** (appears after company confirmation)
   - Framework radio buttons using existing framework data
   - Standards checkboxes using existing standards arrays
   - Submit button to finalize selection

3. **Instructions Section** (appears after framework selection)
   - Text area for specialInstructions
   - Checkbox for extensiveSearch
   - Final submit button

### Chat Flow Controller
**Step-by-Step Flow**:

#### Step 1: Upload
- Chat Message: "Please upload your annual report"
- UI State: Only file upload button active, text input disabled
- Action: File upload triggers POST /api/v1/analysis/upload
- Next: Move to company-review step

#### Step 2: Company Review
- Chat Message: "Please review and correct the company details"
- UI State: Side panel company section active, text input disabled
- Action: User reviews/edits company details in side panel
- Next: Move to framework-selection step

#### Step 3: Framework Selection
- Chat Message: "Select the applicable accounting frameworks and standards"
- UI State: Side panel framework section active, text input disabled
- Action: User selects framework and standards in side panel
- Next: Move to instructions step

#### Step 4: Special Instructions
- Chat Message: "Do you have any specific focus areas for the compliance analysis?"
- UI State: Side panel instructions section active, text input enabled with restrictions
- Action: User provides optional special instructions
- Next: Move to processing step

#### Step 5: Processing
- Chat Message: "Analyzing your document for compliance..."
- UI State: All inputs disabled, show progress indicators
- Action: System processes document with selected standards only
- API: POST /api/v1/analysis/documents/{document_id}/select-framework

---

## Data Flow Mapping

### Existing Field Utilization
```typescript
// FROM existing DocumentMetadata interface
company_name → Side panel editable field
nature_of_business → Side panel editable field  
operational_demographics → Side panel editable field
_overall_status → Processing status indicator
applicable_standards → Pre-populate suggested standards

// FROM existing Framework interface
framework.id → selectedFramework
framework.name → Framework display name
framework.description → Framework description
standards[].id → selectedStandards array
standards[].name → Standards display names
standards[].available → Standards availability filter

// FROM existing Document interface  
id → documentId (primary identifier)
filename → Display in chat confirmation
upload_date → Metadata timestamp
analysis_status → Processing status tracking
```

### New Fields Required
```typescript
// Additional fields for chat interface
specialInstructions?: string     // User's specific focus areas
extensiveSearch?: boolean        // Flag for extensive analysis
currentStep: ChatStep           // Workflow step tracking
```

---

## File Structure Changes

### Files to Create
```
frontend/components/
├── chat/
│   ├── ChatInterface.tsx       // Main chat container
│   ├── ChatMessage.tsx         // Individual chat messages
│   ├── SidePanel.tsx          // Side panel with sections
│   └── ChatController.ts       // Chat flow logic
```

### Files to Modify
```
frontend/
├── lib/api-client.ts          // Add chat-specific API methods
├── app/page.tsx               // Replace with ChatInterface
└── app/layout.tsx             // Update for single-page layout
```

### Files to Remove/Archive
```
frontend/components/
├── framework-selector.tsx      // Logic extracted to SidePanel
└── [upload-page-components]    // Replaced by ChatInterface
```

---

## API Modifications Required

### Backend Changes (simple_server.py)
```python
# MODIFY existing endpoint
@app.post("/api/v1/analysis/documents/{document_id}/select-framework")
async def select_framework(document_id: str, framework_data: dict):
    # ADD support for:
    # - selectedFramework: str
    # - selectedStandards: list[str]  
    # - specialInstructions: str (optional)
    # - extensiveSearch: bool (optional)
    
    # IMPLEMENT selective processing logic
    # Filter checklist questions by selectedStandards
    # Process only selected standards
```

### New API Response Structure
```typescript
// Enhanced framework selection response
interface FrameworkSelectionResponse {
    success: boolean;
    document_id: string;
    selectedFramework: string;
    selectedStandards: string[];
    specialInstructions?: string;
    extensiveSearch?: boolean;
    message: string;
    processingStarted: boolean;
}
```

---

## Input Validation & Restrictions

### Chat Input Controls by Step
1. **Upload Step**: File upload only, no text input
2. **Company Review Step**: Side panel editing only, no text input  
3. **Framework Selection Step**: Side panel selection only, no text input
4. **Instructions Step**: Limited text input with predefined suggestions
5. **Processing Step**: All inputs disabled

### Text Input Restrictions (Instructions Step Only)
- Maximum character limit: 500 characters
- Predefined quick-select options for common requests
- Input validation to prevent off-topic content
- Clear instructions displayed above text area

---

## Error Handling Strategy

### Upload Failures
- Chat Message: "Upload failed. Please try again with a valid PDF file."
- UI State: Reset to upload step
- Side Panel: Clear any partial data

### Document Analysis Failures  
- Chat Message: "Document analysis encountered an issue. Please review the file and try again."
- UI State: Return to upload step
- Side Panel: Preserve user selections if valid

### Framework Selection Errors
- Chat Message: "Please select at least one accounting standard to proceed."
- UI State: Remain in framework-selection step
- Side Panel: Highlight missing selections

### API Communication Errors
- Chat Message: "Connection issue detected. Retrying..."
- UI State: Show retry button
- Side Panel: Preserve all user data

---

## Success Metrics & Validation

### Phase 1 Success Criteria
- ✅ Chat interface renders properly
- ✅ File upload works through chat
- ✅ Side panel displays correctly
- ✅ Basic navigation between steps functions

### Phase 2 Success Criteria  
- ✅ Document metadata displays in side panel - **COMPLETED**
- ✅ User can edit company details - **COMPLETED**  
- ✅ Metadata updates are saved properly - **COMPLETED**
- ✅ Existing DocumentMetadata fields are utilized - **COMPLETED**
- ✅ Document analysis integration with chat workflow - **COMPLETED**
- ✅ Upload flow integrated with existing API endpoints - **COMPLETED**

**Phase 2 Status: COMPLETE** ✅

### Phase 3 Success Criteria
- ✅ Framework selection works in side panel
- ✅ Standards populate based on framework choice
- ✅ Existing Framework interface data is properly used
- ✅ Selection submission triggers correct API calls

### Phase 4 Success Criteria
- ✅ Only selected standards are processed
- ✅ Checklist questions are filtered correctly  
- ✅ Processing time is reduced for partial selections
- ✅ Results contain only requested standard analyses

---

## Implementation Priority Order

### Priority 1 (Critical Path)
1. Create ChatInterface component structure
2. Implement SidePanel with company details section
3. Replace current upload page with chat interface
4. Ensure existing API endpoints continue to work

### Priority 2 (Core Functionality)
1. Extract framework selection logic from framework-selector.tsx
2. Implement framework selection in SidePanel
3. Add chat flow controller logic
4. Implement step-by-step UI state management

### Priority 3 (Enhancement)
1. Add special instructions functionality
2. Implement selective processing logic
3. Add progress indicators and status updates
4. Optimize performance for reduced processing

### Priority 4 (Polish)
1. Enhance error handling and user feedback
2. Add input validation and restrictions
3. Implement retry mechanisms
4. Add accessibility features

---

## Final Report Structure (CRITICAL - DO NOT MODIFY)

The existing report format is **EXTREMELY CRUCIAL** and must be preserved exactly. The final compliance analysis report structure is:

### Report Schema (MUST MAINTAIN)
```json
{
  "status": "COMPLETED",
  "document_id": "RAI-DDMMYYYY-XXXXX-XXXXX",
  "timestamp": "ISO datetime of start",
  "completed_at": "ISO datetime of completion",
  "metadata": {
    "company_name": "string",
    "nature_of_business": "string", 
    "operational_demographics": "string",
    "applicable_standards": "string listing all standards",
    "_overall_status": "COMPLETED|PENDING|FAILED"
  },
  "sections": [
    {
      "section": "IFRS 15|IFRS 9|IAS 1|etc", 
      "title": "Full standard name",
      "standard": "IFRS 15", // Added for selective processing
      "items": [
        {
          "id": "unique_identifier",
          "question": "Compliance question text",
          "reference": "Standard paragraph reference", 
          "status": "YES|NO|PARTIAL|N/A",
          "confidence": 0.0-1.0,
          "explanation": "Detailed explanation of compliance assessment",
          "evidence": [
            "Evidence text with citations and page references"
          ],
          "suggestion": "Compliance improvement recommendation"
        }
      ]
    }
  ],
  "framework": "ifrs|ias", // Framework used for analysis
  "standards": ["IFRS 15", "IFRS 9"], // Standards processed 
  "message": "Completion message"
}
```

### Critical Report Requirements

#### Data Structure Integrity
- **NEVER** modify the core JSON structure
- **PRESERVE** all existing field names exactly
- **MAINTAIN** the evidence array format with citations
- **KEEP** the confidence scoring system (0.0-1.0)
- **RETAIN** the status enumeration (YES|NO|PARTIAL|N/A)

#### Section Organization  
- Each accounting standard gets its own section
- Items within sections represent individual compliance checklist questions
- Each item has a unique ID for tracking and updates
- Questions reference specific paragraphs from accounting standards

#### Evidence Structure
- Evidence must include specific citations from the document
- Page references where available
- Exact quotes from the analyzed document
- Clear linkage between evidence and compliance assessment

#### Metadata Preservation
- Company name, business nature, and operational demographics are extracted from documents
- Applicable standards list shows all relevant standards identified
- Overall status tracks the processing state

### Chat Interface Report Integration

#### Display in Chat Flow
The chat interface will display report results while **maintaining the exact backend structure**:

```typescript
// Frontend display component receives backend JSON directly
interface ComplianceReport {
  // EXACT match to backend structure - no transformation
  status: string;
  document_id: string;
  timestamp: string;
  completed_at?: string;
  metadata: DocumentMetadata;
  sections: ComplianceSection[];
  framework: string;
  standards: string[];
  message: string;
}
```

#### Selective Processing Impact
When implementing selective processing:
- **ADD** framework and standards fields to track what was processed  
- **ADD** standard field to each section for identification
- **PRESERVE** all existing fields and structure
- **MAINTAIN** backwards compatibility with existing reports

#### Critical Preservation Rules
1. **No structural changes** to the JSON schema
2. **No field renaming** or removal 
3. **No modification** of existing data types
4. **No changes** to the evidence format
5. **No alteration** of confidence scoring
6. **No modification** of status values

The report structure represents thousands of hours of development and testing. Any modification could break existing functionality, invalidate previous analyses, and corrupt the compliance assessment logic.

---

**Document Version**: 1.0  
**Last Updated**: September 12, 2025  
**Status**: Implementation Ready  
**Approved By**: [Pending User Approval]