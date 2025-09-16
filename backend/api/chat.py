"""Chat API endpoints for AI-powered conversations."""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import asyncio

from models.chat import ChatMessage, ChatMessageCreate, ChatSession, ChatResponse
from core.security import verify_token
from services.firestore_service_mock import FirestoreService
from services.gemini_service_mock import GeminiService
from agents.base_agent import orchestrator, AgentInput

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

# Initialize services
firestore_service = FirestoreService()
gemini_service = GeminiService()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


@router.post("/sessions", response_model=ChatSession)
async def create_chat_session(token: str = Depends(security)):
    """Create a new chat session."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        session_id = await firestore_service.create_chat_session(user_id)
        
        # Get session data
        session_data = {
            "id": session_id,
            "user_id": user_id,
            "title": f"Chat Session {session_id[:8]}",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
            "is_active": True,
            "message_count": 0
        }
        
        return ChatSession(**session_data)
        
    except Exception as e:
        logger.error(f"Failed to create chat session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create chat session"
        )


@router.get("/sessions", response_model=List[ChatSession])
async def get_user_sessions(token: str = Depends(security)):
    """Get user's chat sessions."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        sessions_data = await firestore_service.get_user_sessions(user_id)
        
        sessions = []
        for session_data in sessions_data:
            session = ChatSession(**session_data)
            sessions.append(session)
        
        return sessions
        
    except Exception as e:
        logger.error(f"Failed to get user sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get chat sessions"
        )


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessage])
async def get_chat_history(session_id: str, token: str = Depends(security)):
    """Get chat history for a session."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        messages_data = await firestore_service.get_chat_history(session_id)
        
        messages = []
        for msg_data in messages_data:
            # Verify user owns this session
            if msg_data.get("user_id") != user_id:
                continue
                
            message = ChatMessage(**msg_data)
            messages.append(message)
        
        return messages
        
    except Exception as e:
        logger.error(f"Failed to get chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get chat history"
        )


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest, token: str = Depends(security)):
    """Send a message and get AI response."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Create session if not provided
        session_id = request.session_id
        if not session_id:
            session_id = await firestore_service.create_chat_session(user_id)
        
        # Save user message
        user_message_id = await firestore_service.save_chat_message(
            session_id=session_id,
            user_id=user_id,
            role="user",
            content=request.message,
            message_type="text"
        )
        
        # Get chat history for context
        chat_history = await firestore_service.get_chat_history(session_id, limit=10)
        
        # Generate AI response using Gemini
        ai_response = await gemini_service.generate_chat_response(
            message=request.message,
            chat_history=chat_history,
            system_prompt="You are an AI career advisor for Indian students. Provide helpful, practical career guidance."
        )
        
        # Save AI response
        ai_message_id = await firestore_service.save_chat_message(
            session_id=session_id,
            user_id=user_id,
            role="assistant",
            content=ai_response["response"],
            message_type="text",
            metadata={"confidence": ai_response.get("confidence", 0.8)}
        )
        
        # Create response message object
        response_message = ChatMessage(
            id=ai_message_id,
            session_id=session_id,
            user_id=user_id,
            role="assistant",
            content=ai_response["response"],
            message_type="text",
            metadata={"confidence": ai_response.get("confidence", 0.8)},
            timestamp="2024-01-01T00:00:00"
        )
        
        # Generate suggestions based on message content
        suggestions = await _generate_suggestions(request.message)
        
        return ChatResponse(
            message=response_message,
            suggestions=suggestions,
            confidence_score=ai_response.get("confidence", 0.8)
        )
        
    except Exception as e:
        logger.error(f"Failed to send message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process message"
        )


@router.post("/analyze-career-intent")
async def analyze_career_intent(request: ChatRequest, token: str = Depends(security)):
    """Analyze user message for career-related intent and trigger agents."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Analyze message intent
        intent = await _analyze_message_intent(request.message)
        
        if intent["type"] == "career_exploration":
            # Trigger career matching agent
            agent_input = AgentInput(
                user_id=user_id,
                data={"message": request.message, "intent": intent},
                session_id=request.session_id
            )
            
            # Execute career match agent
            if "career_match_agent" in orchestrator.agents:
                result = await orchestrator.agents["career_match_agent"].execute(agent_input)
                return {"intent": intent, "agent_response": result}
        
        return {"intent": intent, "message": "Intent analyzed"}
        
    except Exception as e:
        logger.error(f"Failed to analyze career intent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze intent"
        )


async def _generate_suggestions(message: str) -> List[str]:
    """Generate follow-up suggestions based on user message."""
    suggestions = []
    
    message_lower = message.lower()
    
    if any(word in message_lower for word in ["career", "job", "profession"]):
        suggestions.extend([
            "What are your interests and skills?",
            "Tell me about your educational background",
            "What industry interests you most?"
        ])
    elif any(word in message_lower for word in ["skill", "learn", "course"]):
        suggestions.extend([
            "What specific skills do you want to develop?",
            "What's your current skill level?",
            "How much time can you dedicate to learning?"
        ])
    elif any(word in message_lower for word in ["salary", "money", "pay"]):
        suggestions.extend([
            "What career field are you considering?",
            "What's your experience level?",
            "Which location are you targeting?"
        ])
    else:
        suggestions.extend([
            "Can you tell me more about your goals?",
            "What challenges are you facing?",
            "How can I help you today?"
        ])
    
    return suggestions[:3]  # Return top 3 suggestions


async def _analyze_message_intent(message: str) -> Dict[str, Any]:
    """Analyze message for intent classification."""
    message_lower = message.lower()
    
    # Simple intent classification
    if any(word in message_lower for word in ["career", "job", "profession", "work"]):
        return {
            "type": "career_exploration",
            "confidence": 0.8,
            "entities": ["career"]
        }
    elif any(word in message_lower for word in ["skill", "learn", "study", "course"]):
        return {
            "type": "skill_development",
            "confidence": 0.8,
            "entities": ["skills"]
        }
    elif any(word in message_lower for word in ["salary", "money", "pay", "income"]):
        return {
            "type": "salary_inquiry",
            "confidence": 0.7,
            "entities": ["salary"]
        }
    else:
        return {
            "type": "general_conversation",
            "confidence": 0.6,
            "entities": []
        }