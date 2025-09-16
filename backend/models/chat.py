"""Chat-related Pydantic models."""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    """Message role enumeration."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class MessageType(str, Enum):
    """Message type enumeration."""
    TEXT = "text"
    CAREER_RECOMMENDATION = "career_recommendation"
    SKILL_ANALYSIS = "skill_analysis"
    RESOURCE_SUGGESTION = "resource_suggestion"
    RESUME_ANALYSIS = "resume_analysis"


class ChatMessage(BaseModel):
    """Chat message model."""
    id: str
    session_id: str
    user_id: str
    role: MessageRole
    content: str = Field(..., min_length=1, max_length=4000)
    message_type: MessageType = MessageType.TEXT
    metadata: Optional[Dict[str, Any]] = {}
    timestamp: datetime

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    """Chat message creation model."""
    content: str = Field(..., min_length=1, max_length=4000)
    message_type: MessageType = MessageType.TEXT
    metadata: Optional[Dict[str, Any]] = {}


class ChatSession(BaseModel):
    """Chat session model."""
    id: str
    user_id: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    message_count: int = 0

    class Config:
        from_attributes = True


class ChatSessionCreate(BaseModel):
    """Chat session creation model."""
    title: Optional[str] = Field(None, max_length=200)


class ChatSessionUpdate(BaseModel):
    """Chat session update model."""
    title: Optional[str] = Field(None, max_length=200)
    is_active: Optional[bool] = None


class ChatResponse(BaseModel):
    """Chat response model."""
    message: ChatMessage
    suggestions: Optional[List[str]] = []
    actions: Optional[List[Dict[str, Any]]] = []
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)


class AgentResponse(BaseModel):
    """Agent response model."""
    agent_name: str
    response_type: str
    content: Dict[str, Any]
    confidence: float = Field(..., ge=0.0, le=1.0)
    processing_time: float  # in seconds
    metadata: Optional[Dict[str, Any]] = {}


class ConversationSummary(BaseModel):
    """Conversation summary model."""
    session_id: str
    user_id: str
    summary: str
    key_topics: List[str] = []
    identified_goals: List[str] = []
    recommendations_given: List[str] = []
    next_steps: List[str] = []
    generated_at: datetime