# RAi Compliance Engine - AI Agent Instructions

## Architecture Overview

This is **RAi Compliance Engine** - an AI-powered financial compliance analysis platform with a **dual-deployment architecture**:

- **Frontend**: Next.js 14 (App Router) deployed on Vercel (`frontend/`)
- **Backend**: FastAPI Python service deployed on Render (`render-backend/`)
- **API Proxy**: Vercel functions proxy (`api/index.py`) routes `/api/*` to Render backend

### Key Service Boundaries

- **AI Analysis Service** (`render-backend/services/ai.py`): Azure OpenAI integration with vector embeddings for document analysis
- **Document Processing** (`render-backend/services/`): PDF chunking, metadata extraction, and intelligent analysis
- **Frontend State Management**: React Context (`frontend/context/`) for checklist, progress, and theme state

## Development Workflows

### Local Development
```bash
# Frontend (port 3000)
cd frontend && npm run dev

# Backend (port 8000) 
cd render-backend && uvicorn main:app --reload

# HTTPS Development (required for some features)
cd frontend && npm run dev:https
```

### Testing Strategy
- **Unit/Integration**: `npm run test` (Jest + Testing Library, 85% coverage threshold)
- **E2E**: `npm run test:e2e` (Playwright multi-browser)
- **Type Safety**: `npm run type-check` (90% type coverage requirement)
- **Performance**: `npm run performance:test` (k6 load testing)

### Deployment Commands
- **Frontend**: `npm run build` → Vercel auto-deployment
- **Backend**: Render auto-deploys from `render-backend/` on push

## Project-Specific Conventions

### RAi Brand System
- **Primary Color**: `#0087d9` (RAi Blue) - use `rai.blue` in Tailwind or `hsl(var(--rai-primary))`
- **Component Pattern**: Radix UI primitives with custom RAi styling (`components/ui/`)
- **FinACEverse Branding**: Secondary brand colors in `tailwind.config.ts`

### Code Organization Patterns
- **UI Components**: Follow shadcn/ui pattern with `cn()` utility for class merging
- **API Routes**: Backend uses `/api/v1/` prefix, frontend proxies via Next.js rewrites
- **File Naming**: kebab-case for components, PascalCase for contexts/providers

### AI Service Integration
- **Azure OpenAI**: Configured via environment variables with fallback to `model-router` deployment
- **Vector Store**: FAISS-based document embeddings in `render-backend/services/vector_store.py`
- **Rate Limiting**: Conservative 30 req/min for Azure OpenAI S0 tier
- **Parallel Processing**: Limited to 4 workers for 512MB Render instance

### Security & Performance
- **CORS Configuration**: Restrictive origins for production (see `main.py`)
- **Build Optimization**: Source maps disabled, webpack workers enabled
- **Type Enforcement**: Strict TypeScript with `ignoreBuildErrors: true` for deployment speed

## Critical Integration Points

### Frontend ↔ Backend Communication
- **API Base URL**: `NEXT_PUBLIC_API_URL` env var or defaults to Render URL
- **Document Upload**: Multipart form data to `/api/documents` 
- **Analysis Flow**: Document → Chunking → AI Analysis → Checklist Population

### Cross-Component State Flow
1. **Document Upload** → `documents/` API → Backend storage
2. **Analysis Trigger** → `ai.py` service → Vector embedding + OpenAI analysis  
3. **Checklist Update** → Frontend context → Real-time UI updates
4. **Results Export** → JSON/Excel via backend `/export` endpoints

### Dependency Management
- **Frontend**: pnpm lockfile, Node 18+ required
- **Backend**: pip requirements, Python 3.8+ required  
- **Shared Types**: Manual sync between TypeScript interfaces and Pydantic models

## Quick Start Checklist

When working on this project:

1. **Check deployment status**: Frontend on Vercel, backend on Render
2. **Verify API connectivity**: Frontend should proxy to backend successfully
3. **Azure OpenAI credentials**: Required for document analysis features
4. **Brand consistency**: Use RAi blue (`#0087d9`) and follow component patterns
5. **Test coverage**: Maintain 85%+ coverage, run `npm run test:coverage`
6. **Type safety**: Run `npm run type-check` before commits

## Common Tasks

- **Add new API endpoint**: Create in `render-backend/routes/`, add to router imports
- **New UI component**: Follow shadcn/ui pattern in `components/ui/`
- **Update AI prompts**: Modify `render-backend/services/ai_prompts.py`
- **Brand color changes**: Update both `RAI_BRAND_COLORS.md` and `tailwind.config.ts`
- **Deploy fixes**: Frontend auto-deploys, backend needs manual Render trigger if env changes


IMPORTANT NOTES
&& DOESNT WORK IN TERMINAL COMMANDS IN POWERERSHELL