"""Core configuration for the AI Career Advisor application."""

from typing import List, Optional
import os
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""
    
    # Application Info
    APP_NAME: str = "AI Career Advisor"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "default-dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
    ]
    
    # Google Cloud Configuration
    GOOGLE_CLOUD_PROJECT: str = "ai-career-advisor-dev"
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    VERTEX_AI_LOCATION: str = "asia-south1"
    # Accept optional raw SA key JSON some environments provide (not used directly by code)
    GCP_SA_KEY: Optional[str] = None
    
    # Firestore Configuration
    FIRESTORE_DATABASE: str = "(default)"
    
    # BigQuery Configuration
    BIGQUERY_DATASET: str = "career_data"
    BIGQUERY_LOCATION: str = "US"
    
    # Gemini Configuration
    GEMINI_MODEL: str = "gemini-pro"
    # Support both GEMINI_TEMPERATURE and legacy GEMINI_temperature from existing .env
    GEMINI_TEMPERATURE: float = Field(
        0.7,
        validation_alias=AliasChoices("GEMINI_TEMPERATURE", "GEMINI_temperature"),
    )
    GEMINI_API_KEY: Optional[str] = None
    
    # Firebase Configuration
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_PRIVATE_KEY_ID: Optional[str] = None
    FIREBASE_PRIVATE_KEY: Optional[str] = None
    FIREBASE_CLIENT_EMAIL: Optional[str] = None
    FIREBASE_CLIENT_ID: Optional[str] = None
    FIREBASE_AUTH_URI: Optional[str] = None
    FIREBASE_TOKEN_URI: Optional[str] = None
    FIREBASE_ADMIN_CREDENTIALS: Optional[str] = None
    FIREBASE_TOKEN: Optional[str] = None
    
    # MCP Server Configuration
    MCP_SERVER_HOST: str = "localhost"
    MCP_SERVER_PORT: int = 8001
    
    # Pydantic v2 settings configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",  # Ignore unknown env vars in .env
    )


# Global settings instance
settings = Settings()