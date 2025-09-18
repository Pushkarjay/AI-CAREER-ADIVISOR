"""Development authentication endpoints for testing without real Firebase."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from core.security import create_access_token
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class DevLoginRequest(BaseModel):
    email: str = "test@example.com"
    name: str = "Test User"


@router.post("/dev-login")
async def dev_login(request: DevLoginRequest):
    """Create a test token for development - NO REAL AUTHENTICATION."""
    try:
        # Create a mock user
        user_data = {
            "user_id": f"dev_user_{request.email.split('@')[0]}",
            "email": request.email,
            "name": request.name
        }
        
        # Create access token that expires in 24 hours
        access_token = create_access_token(
            user_data, 
            expires_delta=timedelta(hours=24)
        )
        
        logger.info(f"Development login for: {request.email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400,  # 24 hours
            "user": user_data
        }
        
    except Exception as e:
        logger.error(f"Development login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Development login failed"
        )


@router.get("/dev-token")
async def get_dev_token():
    """Get a quick development token."""
    return await dev_login(DevLoginRequest())