"""Authentication API endpoints."""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Optional
import logging

from models.user import UserCreate, User, Token
from core.security import create_access_token, verify_token
from services.firestore_service import FirestoreService

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

# Initialize services
firestore_service = FirestoreService()


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str


@router.post("/signup", response_model=Token)
async def signup(request: SignupRequest):
    """Register a new user."""
    try:
        # In a real implementation, this would:
        # 1. Validate email uniqueness
        # 2. Hash password
        # 3. Create user in authentication system
        # 4. Return JWT token
        
        # Mock implementation
        user_data = {
            "id": f"user_{request.email.split('@')[0]}",
            "email": request.email,
            "full_name": request.full_name,
            "is_active": True,
            "role": "student"
        }
        
        # Create access token
        token_data = {
            "user_id": user_data["id"],
            "email": user_data["email"]
        }
        access_token = create_access_token(token_data)
        
        logger.info(f"User registered: {request.email}")
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=1800  # 30 minutes
        )
        
    except Exception as e:
        logger.error(f"Signup failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=Token)
async def login(request: LoginRequest):
    """Authenticate user and return JWT token."""
    try:
        # In a real implementation, this would:
        # 1. Validate credentials against database
        # 2. Check password hash
        # 3. Return JWT token if valid
        
        # Mock implementation - accept any email/password for demo
        user_data = {
            "user_id": f"user_{request.email.split('@')[0]}",
            "email": request.email
        }
        
        access_token = create_access_token(user_data)
        
        logger.info(f"User logged in: {request.email}")
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=1800
        )
        
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


@router.post("/logout")
async def logout(token: str = Depends(security)):
    """Logout user (invalidate token)."""
    try:
        # In a real implementation, would add token to blacklist
        logger.info("User logged out")
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        return {"message": "Logout completed"}


@router.get("/me", response_model=User)
async def get_current_user(token: str = Depends(security)):
    """Get current user information."""
    try:
        # Verify token
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Get user profile from Firestore
        profile = await firestore_service.get_user_profile(user_id)
        
        if not profile:
            # Create basic user info from token
            user_data = {
                "id": user_id,
                "email": payload.get("email", ""),
                "full_name": "User",
                "is_active": True,
                "role": "student",
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00"
            }
        else:
            user_data = {
                "id": user_id,
                "email": profile.get("email", payload.get("email", "")),
                "full_name": profile.get("full_name", "User"),
                "is_active": profile.get("is_active", True),
                "role": profile.get("role", "student"),
                "created_at": profile.get("created_at", "2024-01-01T00:00:00"),
                "updated_at": profile.get("updated_at", "2024-01-01T00:00:00")
            }
        
        return User(**user_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get current user failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )


@router.post("/verify-token")
async def verify_user_token(token: str = Depends(security)):
    """Verify if token is valid."""
    try:
        payload = verify_token(token.credentials)
        return {
            "valid": True,
            "user_id": payload.get("user_id"),
            "email": payload.get("email")
        }
        
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )