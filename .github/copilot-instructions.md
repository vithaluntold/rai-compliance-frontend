# RAi Compliance Engine - AI Agent Instructions

## Architecture Overview

This is **RAi Compliance Engine** - an AI-powered financial compliance analysis platform with a **single Render deployment architecture**:

- **Frontend**: Next.js 14 (App Router) deployed on Render (`Audricc all/frontend/`)
- **Backend**: FastAPI Python service deployed on Render (`render-backend/`)
- **Database**: PostgreSQL on Render with connection pooling and session management

### Key Service Boundaries

- **AI Analysis Service** (`render-backend/services/ai.py`): Azure OpenAI integration with FAISS vector embeddings for document analysis
- **Document Processing** (`render-backend/services/`): Intelligent PDF chunking, metadata extraction, and geographic detection
- **Frontend State Management**: React Context (`frontend/context/` and `frontend/contexts/`) for checklist, progress, and theme state
- **Persistent Storage**: PostgreSQL with smart session management (`services/persistent_storage_enhanced.py`)

## Development Workflows

### Local Development
```bash
# Frontend (port 3000) - Use semicolons for PowerShell
cd frontend; npm run dev

# Backend (port 8000) - Python virtual environment required
cd render-backend; uvicorn main:app --reload

# HTTPS Development (required for some Azure features)
cd frontend; npm run dev:https
```

### Testing & Quality Assurance
- **Type Safety**: `npm run type-check` (90% type coverage requirement - tracked in `type-coverage.json`)
- **Code Quality**: `npm run lint:fix` and `npm run format` (ESLint + Prettier)
- **Security**: `npm run audit:security` for dependency vulnerabilities
- **Dependencies**: `npm run audit:deps` (depcheck for unused dependencies)

### Deployment Commands
- **Frontend**: Render auto-deploys from `Audricc all/frontend/` on push to `master` branch
- **Backend**: Render auto-deploys from `render-backend/` on push to `master` branch using `render.yaml`
- **Environment**: PostgreSQL database connection managed via `render.yaml` environment variables

## Project-Specific Conventions

### RAi Brand System
- **Primary Color**: `#0087d9` (RAi Blue) - use `hsl(var(--rai-primary))` in Tailwind or custom `rai` variant
- **Component Pattern**: Radix UI primitives with shadcn/ui pattern (`components/ui/`)
- **Custom Button Variant**: `variant="rai"` for RAi-branded buttons (see `button.tsx`)
- **Font References**: Montserrat for brand elements, check `RAI_BRAND_COLORS.md` for full palette

### Code Organization Patterns
- **UI Components**: Follow shadcn/ui pattern with `cn()` utility for class merging
- **File Naming**: kebab-case for components, PascalCase for contexts/providers
- **Context Pattern**: Separate files in both `frontend/context/` AND `frontend/contexts/` (dual structure)
- **Build Configuration**: Uses `--legacy-peer-deps` for npm installs

### AI Service Integration & Cost Optimization
- **Azure OpenAI**: Uses `model-router` deployment with specific API version `2024-12-01-preview`
- **Vector Store**: FAISS-based chunking with intelligent metadata extraction (targeting 80% cost reduction)
- **Token Optimization**: Current focus on reducing 75K→15K tokens per document analysis
- **Geographic Service**: 613-line comprehensive service for document location detection (`geographical_service.py`)
- **Smart Categorization**: spaCy-based NLP pipeline for content classification

### Database & Storage Architecture
- **PostgreSQL**: Production database on Render with connection pooling
- **Session Management**: Enhanced persistent storage with smart session tracking
- **File Storage**: Document uploads in `render-backend/uploads/` with FAISS indexing
- **Dual Storage**: SQLite fallback for development, PostgreSQL for production

### PowerShell Compatibility
- **Terminal Commands**: Use semicolons (`;`) instead of `&&` for command chaining in PowerShell
- **Path Handling**: Be aware of Windows path separators in file operations
- **Environment**: Project runs in Windows PowerShell v5.1 environment

## Critical Integration Points

### Frontend ↔ Backend Communication
- **API Base URL**: Direct connection between Render services or localhost in development
- **Document Upload**: Direct API calls to backend via consolidated `analysis_routes.py` router
- **Analysis Flow**: Document → Smart Chunning → Vector Embedding → AI Analysis → PostgreSQL Storage
- **State Sync**: Frontend contexts track backend via polling with enhanced session management
- **No API Proxies**: Frontend makes direct calls to backend (API proxy routes removed)

### Cross-Component State Flow
1. **Document Upload** → `analysis_routes.py` → `uploads/` directory + PostgreSQL metadata
2. **Analysis Trigger** → `ai.py` + `smart_metadata_extractor.py` → Optimized token usage
3. **Checklist Update** → Enhanced persistent storage → Real-time frontend updates
4. **Results Export** → PostgreSQL queries via analysis routes

### Dependency Management & Environment
- **Frontend**: npm with `--legacy-peer-deps`, Node 18+ required, pnpm lockfile present
- **Backend**: pip requirements with Python 3.11 optimization, spaCy wheel dependencies
- **Database**: PostgreSQL connection string in `render.yaml` with existing database ID
- **Shared Types**: Manual sync between TypeScript interfaces and Pydantic models

### Recent Architecture Changes
- **PostgreSQL Migration**: Moved from SQLite to PostgreSQL for production reliability
- **Smart Metadata Extraction**: Implementing token optimization (75K → 15K target)
- **Enhanced Sessions**: Session management with automatic cleanup and state tracking
- **Consolidated Routing**: Single `analysis_routes.py` replaces multiple route files

## Quick Start Checklist

When working on this project:

1. **Check deployment status**: Both frontend and backend deployed on Render with PostgreSQL database
2. **Verify API connectivity**: Frontend connects directly to backend service on Render
3. **Azure OpenAI credentials**: Required for document analysis, uses `model-router` deployment
4. **Brand consistency**: Use `hsl(var(--rai-primary))` and check `RAI_BRAND_COLORS.md`
5. **Type safety**: Run `npm run type-check` - maintains 90%+ type coverage
6. **PowerShell compatibility**: Use semicolons (`;`) instead of `&&` for command chaining

## Common Tasks

- **Add new API endpoint**: Add to `render-backend/routes/analysis_routes.py` (consolidated router)
- **New UI component**: Follow shadcn/ui pattern in `components/ui/`, use `cn()` utility
- **Update AI prompts**: Modify `render-backend/services/ai_prompts.py` (see usage guide)
- **Brand color changes**: Update `RAI_BRAND_COLORS.md` and `tailwind.config.ts`
- **Database changes**: Update PostgreSQL schema via `persistent_storage_enhanced.py`
- **Deploy fixes**: Both deployments are automatic on Render from `master` branch, check Render dashboard

## Key Files for AI Context

- **Core Services**: `render-backend/services/ai.py`, `smart_metadata_extractor.py`
- **Database Layer**: `services/persistent_storage_enhanced.py` (PostgreSQL integration)
- **Frontend Context**: `frontend/contexts/` (multiple context providers)
- **Configuration**: `render-backend/render.yaml` (backend deployment config), frontend deployment via Render dashboard
- **Optimization Plan**: `OPTIMIZED_METADATA_EXTRACTION_IMPLEMENTATION_PLAN.md` (current focus area)

## IMPORTANT NOTES
- **PowerShell Environment**: `&&` operators don't work - use semicolons (`;`) for command chaining
- **Token Optimization Focus**: Current priority is reducing AI analysis costs by 80%
- **PostgreSQL Required**: Database connection required for backend functionality
- **Build Dependencies**: Frontend requires `--legacy-peer-deps` flag for npm installations on Render
- **Master Branch**: Both services deploy from `master` branch (not `main`)
- **API Architecture**: Direct backend calls (Vercel proxy files removed)