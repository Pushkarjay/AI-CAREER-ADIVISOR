"""Development utilities for bypassing authentication during testing."""

from fastapi import HTTPException, status
from fastapi.security import HTTPBearer
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class OptionalHTTPBearer(HTTPBearer):
    """HTTPBearer that doesn't require authentication in development mode."""
    
    def __init__(self, auto_error: bool = False):
        super().__init__(auto_error=auto_error)
    
    async def __call__(self, request) -> Optional[str]:
        from core.config import settings
        
        # If in debug mode and no authorization header, create a mock token
        if settings.DEBUG:
            authorization = request.headers.get("Authorization")
            if not authorization:
                logger.warning("No auth header in DEBUG mode, creating mock token")
                return None  # This will trigger mock user creation in endpoints
        
        return await super().__call__(request)


def get_mock_user_from_no_auth():
    """Create a mock user when no authentication is provided in debug mode."""
    return {
        "user_id": "debug_user_123",
        "email": "debug@example.com",
        "name": "Debug User"
    }