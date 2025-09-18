"""Mock Firestore service for development."""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


class FirestoreService:
    """Mock Firestore service for development."""
    
    def __init__(self):
        """Initialize the mock Firestore service."""
        logger.info("Initializing mock Firestore service for development")
        # Mock in-memory storage
        self.data = {
            "users": {},
            "chat_sessions": {},
            "user_profiles": {},
            "analytics": {}
        }
    
    async def create_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> str:
        """Create a new user profile."""
        logger.info(f"Creating mock user profile for: {user_id}")
        from datetime import datetime
        # Ensure required fields are present
        if "user_id" not in profile_data:
            profile_data["user_id"] = user_id
        if "created_at" not in profile_data:
            profile_data["created_at"] = datetime.now()
        if "updated_at" not in profile_data:
            profile_data["updated_at"] = datetime.now()
        
        self.data["user_profiles"][user_id] = profile_data
        return user_id
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile."""
        logger.info(f"Getting mock user profile for: {user_id}")
        from datetime import datetime
        return self.data["user_profiles"].get(user_id, {
            "user_id": user_id,
            "education_level": "Bachelor's",
            "field_of_study": "Computer Science",
            "current_year": 3,
            "location": "India",
            "interests": ["AI", "Web Development", "Data Science"],
            "skills": ["Python", "JavaScript", "React", "FastAPI"],
            "experience_years": 2,
            "preferred_industries": ["Technology", "Software Development"],
            "career_goals": "Become a Full Stack Developer",
            "resume_url": None,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        })
    
    async def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> None:
        """Update user profile."""
        logger.info(f"Updating mock user profile for: {user_id}")
        from datetime import datetime
        if user_id not in self.data["user_profiles"]:
            self.data["user_profiles"][user_id] = {
                "user_id": user_id,
                "created_at": datetime.now()
            }
        
        # Always update the updated_at timestamp
        updates["updated_at"] = datetime.now()
        self.data["user_profiles"][user_id].update(updates)
    
    async def create_chat_session(self, user_id: str) -> str:
        """Create a new chat session."""
        session_id = f"session_{len(self.data['chat_sessions']) + 1}"
        logger.info(f"Creating mock chat session: {session_id}")
        self.data["chat_sessions"][session_id] = {
            "user_id": user_id,
            "messages": [],
            "created_at": "2024-01-01T10:00:00Z"
        }
        return session_id
    
    async def add_chat_message(self, session_id: str, message: Dict[str, Any]) -> None:
        """Add message to chat session."""
        logger.info(f"Adding message to mock session: {session_id}")
        if session_id in self.data["chat_sessions"]:
            self.data["chat_sessions"][session_id]["messages"].append(message)
    
    async def save_chat_message(self, session_id: str, message: Dict[str, Any]) -> None:
        """Save message to chat session (alias for add_chat_message)."""
        await self.add_chat_message(session_id, message)
    
    async def get_chat_messages(self, session_id: str) -> List[Dict[str, Any]]:
        """Get chat messages."""
        logger.info(f"Getting mock chat messages for: {session_id}")
        if session_id in self.data["chat_sessions"]:
            return self.data["chat_sessions"][session_id]["messages"]
        return []
    
    async def get_user_chat_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's chat sessions."""
        logger.info(f"Getting mock chat sessions for user: {user_id}")
        return [
            {
                "id": session_id,
                "created_at": session["created_at"],
                "message_count": len(session["messages"])
            }
            for session_id, session in self.data["chat_sessions"].items()
            if session["user_id"] == user_id
        ]
    
    async def save_user_analytics(self, user_id: str, analytics_data: Dict[str, Any]) -> None:
        """Save user analytics."""
        logger.info(f"Saving mock analytics for user: {user_id}")
        self.data["analytics"][user_id] = analytics_data
    
    async def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get user analytics."""
        logger.info(f"Getting mock analytics for user: {user_id}")
        return self.data["analytics"].get(user_id, {
            "session_count": 5,
            "message_count": 25,
            "recommendation_count": 8,
            "last_active": "2024-01-01T10:00:00Z"
        })