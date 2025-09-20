from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import your main FastAPI app from backend
try:
    from main import app as backend_app
except ImportError:
    # Fallback if direct import doesn't work
    backend_app = FastAPI()
    
    @backend_app.get("/")
    def read_root():
        return {"message": "RAI Compliance Engine API is running"}

# Configure CORS for production
backend_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This is the handler that Vercel will call
app = backend_app