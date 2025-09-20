# RAi Compliance Engine - Deployment Guide

## 🚀 Deployment Overview

The RAi Compliance Engine uses a **dual-deployment architecture**:

- **Frontend**: Next.js 14 deployed on **Vercel**
- **Backend**: FastAPI Python service deployed on **Render**
- **API Proxy**: Vercel functions route `/api/*` to Render backend

## 📁 Project Structure

```
Audricc all/
├── frontend/           # Next.js 14 App (Deploy to Vercel)
│   ├── package.json
│   ├── vercel.json     # Vercel configuration
│   ├── next.config.mjs # Next.js configuration
│   └── .env.example    # Environment variables template
├── render-backend/     # FastAPI App (Deploy to Render)
│   ├── main.py         # FastAPI application entry point
│   ├── requirements.txt # Python dependencies
│   ├── render.yaml     # Render service configuration
│   └── .env.example    # Environment variables template
└── api/               # Vercel API proxy (automatically deployed)
    └── index.py       # Proxy routes to Render backend
```

## 🔧 Environment Variables

### Frontend (Vercel)
Set these in your Vercel dashboard or in `vercel.json`:

```bash
NEXT_PUBLIC_API_URL=https://rai-compliance-backend.onrender.com
```

### Backend (Render)
Set these in your Render dashboard (Environment Variables section):

```bash
# Azure OpenAI Configuration (Required)
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-12-01-preview

# Azure OpenAI Embedding Configuration (Required)
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-ada-002
AZURE_OPENAI_EMBEDDING_API_VERSION=2023-05-15

# Optional Development Settings
DEBUG=False
LOG_LEVEL=INFO
```

## 🚀 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account connected to your GitHub repository
- Node.js 18+ locally for testing

### Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare frontend for deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `frontend/`
   - Vercel will auto-detect Next.js configuration

3. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install --legacy-peer-deps`

4. **Environment Variables**:
   - Set `NEXT_PUBLIC_API_URL=https://rai-compliance-backend.onrender.com`
   - Or use the `vercel.json` configuration (recommended)

### Verification
- Build should complete successfully ✅
- TypeScript errors are ignored due to `ignoreBuildErrors: true`
- Site will be available at `https://your-project.vercel.app`

## 🐍 Backend Deployment (Render)

### Prerequisites
- Render account connected to your GitHub repository
- Azure OpenAI service with API keys

### Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare backend for deployment"
   git push origin main
   ```

2. **Create Render Service**:
   - Visit [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Set root directory to `render-backend/`

3. **Configure Service Settings**:
   - **Name**: `rai-compliance-backend`
   - **Environment**: `Python`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `render-backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables** (Critical):
   In Render dashboard, add all the Azure OpenAI variables listed above.

5. **Auto-Deploy Settings**:
   - Enable "Auto-Deploy" for automatic deployments on git push
   - Health check path: `/api/v1/health`

### Verification
- Service should start without errors ✅
- Health check at `https://your-service.onrender.com/api/v1/health` should return success
- API documentation available at `https://your-service.onrender.com/docs`

## 🔄 API Proxy Configuration

The frontend uses Next.js rewrites to proxy API calls to the backend:

```javascript
// next.config.mjs
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "https://rai-compliance-backend.onrender.com/api/:path*",
    },
  ];
}
```

This means frontend calls to `/api/documents` are automatically routed to `https://rai-compliance-backend.onrender.com/api/documents`.

## 🧪 Pre-Deployment Testing

### Frontend Testing
```bash
cd frontend
npm install --legacy-peer-deps
npm run build        # ✅ Should complete successfully
npm run type-check   # ⚠️ Has warnings but builds ignore them
```

### Backend Testing
```bash
cd render-backend
pip install -r requirements.txt  # ✅ All dependencies install
# Note: Requires Azure OpenAI env vars to start fully
```

## 🚨 Common Deployment Issues

### Frontend Issues
1. **Build Failures**: 
   - Check TypeScript errors (ignored in build)
   - Verify all dependencies install with `--legacy-peer-deps`
   
2. **API Connection Issues**:
   - Verify `NEXT_PUBLIC_API_URL` points to correct Render backend
   - Check CORS configuration in backend

### Backend Issues
1. **Startup Failures**:
   - Verify all Azure OpenAI environment variables are set
   - Check Render service logs for missing dependencies
   
2. **Memory Issues**:
   - Current plan: Render Starter (512MB)
   - Consider upgrading if needed for large document processing

## 📊 Monitoring & Maintenance

### Frontend (Vercel)
- Monitor build status in Vercel dashboard
- Check Analytics tab for performance insights
- Review Function logs for API proxy issues

### Backend (Render)
- Monitor service health at `/api/v1/health`
- Check Render service logs for errors
- Monitor resource usage (CPU/Memory)

## 🔄 Deployment Commands Summary

### Quick Deploy Frontend
```bash
# From frontend directory
npm run build
git add . && git commit -m "Deploy frontend" && git push
# Vercel auto-deploys from GitHub
```

### Quick Deploy Backend
```bash
# From render-backend directory
git add . && git commit -m "Deploy backend" && git push
# Render auto-deploys from GitHub
```

## 🎯 Success Criteria

Deployment is successful when:

✅ **Frontend**: Builds without errors and deploys to Vercel  
✅ **Backend**: Starts without errors and responds to health checks  
✅ **API Integration**: Frontend can communicate with backend through proxy  
✅ **Environment Variables**: All required Azure OpenAI variables configured  
✅ **CORS**: Cross-origin requests work between domains  

## 🆘 Support

If deployment fails:
1. Check service logs in respective platforms
2. Verify environment variables are correctly set
3. Ensure Azure OpenAI service is active and accessible
4. Review this deployment guide for missed steps

---

**Note**: Both services support auto-deployment from GitHub. Push to `main` branch to trigger deployments.