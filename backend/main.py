"""
FastAPI application for AI Career Advisor.

A multi-agent system providing personalized career guidance for students in India.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import logging
from contextlib import asynccontextmanager
import os

from core.config import settings
from core.database import initialize_connections
from api import auth, chat, careers, profiles, analytics
from api import roadmaps
from api import adapter as adapter_routes
from api.alias_api import router as alias_router
from api import dev_auth


# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    # Startup
    logger.info("Starting AI Career Advisor Backend...")
    # Ensure uploads directory exists for local storage fallback
    try:
        os.makedirs("uploads", exist_ok=True)
        os.makedirs(os.path.join("uploads", "resumes"), exist_ok=True)
    except Exception as e:
        logger.warning(f"Could not create uploads directory: {e}")
    await initialize_connections()
    logger.info("Application startup complete.")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Career Advisor Backend...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="A multi-agent AI system for personalized career guidance",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure this properly in production
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "ai-career-advisor-backend"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AI Career Advisor Backend",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


# Exception handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError exceptions."""
    logger.error(f"ValueError: {exc}")
    return JSONResponse(
        status_code=400,
        content={"error": "Invalid input", "detail": str(exc)}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )


# Include API routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["authentication"]
)

# Development authentication (only for testing)
app.include_router(
    dev_auth.router,
    prefix="/api/dev-auth",
    tags=["development"]
)

app.include_router(
    chat.router,
    prefix=f"{settings.API_V1_STR}/chat",
    tags=["chat"]
)

app.include_router(
    careers.router,
    prefix=f"{settings.API_V1_STR}/careers",
    tags=["careers"]
)

app.include_router(
    profiles.router,
    prefix=f"{settings.API_V1_STR}/profiles",
    tags=["profiles"]
)

app.include_router(
    analytics.router,
    prefix=f"{settings.API_V1_STR}/analytics",
    tags=["analytics"]
)

app.include_router(
    roadmaps.router,
    prefix=f"{settings.API_V1_STR}/roadmaps",
    tags=["roadmaps"]
)

# Adapter routes for simplified frontend expectations
app.include_router(
    adapter_routes.router,
    prefix="/api",
    tags=["adapter"]
)

# Simple alias routes as per final architecture (no version prefix)
app.include_router(
    alias_router,
    prefix="/api",
    tags=["alias"]
)

# Serve uploaded files in development/local fallback
try:
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
    logger.info("Mounted /uploads static file serving")
except Exception as e:
    logger.warning(f"Failed to mount /uploads static: {e}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )