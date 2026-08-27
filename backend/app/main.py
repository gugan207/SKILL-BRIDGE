"""
SkillBridge AI — FastAPI Application
Main entry point with CORS, health check, and route registration.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routes import auth, upload, analysis, reports, account

# Structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("skillbridge")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    settings = get_settings()
    logger.info("SkillBridge AI backend starting")
    logger.info(f"Frontend URL (CORS): {settings.FRONTEND_URL}")

    # Validate critical env vars at startup
    missing = []
    if not settings.SUPABASE_URL:
        missing.append("SUPABASE_URL")
    if not settings.SUPABASE_ANON_KEY:
        missing.append("SUPABASE_ANON_KEY")
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if not settings.NVIDIA_API_KEY:
        missing.append("NVIDIA_API_KEY")
    if missing:
        logger.warning(f"Missing environment variables: {', '.join(missing)}")

    yield
    logger.info("SkillBridge AI backend shutting down")


app = FastAPI(
    title="SkillBridge AI",
    description="Resume-to-JD skill gap analyzer with AI-powered roadmaps",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — locked to frontend domain, not wildcard
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(account.router, prefix="/api/account", tags=["Account"])


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring and keep-alive pings."""
    return {
        "status": "healthy",
        "service": "skillbridge-ai",
        "version": "2.0.0",
    }
