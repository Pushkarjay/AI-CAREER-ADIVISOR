"""Profile API endpoints for user profile management."""

from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging

from models.user import UserProfile, UserProfileCreate, UserProfileUpdate
from core.security import verify_token
from services.firestore_service import FirestoreService
from agents.base_agent import orchestrator, AgentInput

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

firestore_service = FirestoreService()


@router.get("/me", response_model=UserProfile)
async def get_my_profile(token: str = Depends(security)):
    """Get current user's profile."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        profile_data = await firestore_service.get_user_profile(user_id)
        
        if not profile_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return UserProfile(**profile_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get profile"
        )


@router.post("/", response_model=UserProfile)
async def create_profile(profile_data: UserProfileCreate, token: str = Depends(security)):
    """Create user profile."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Execute profile agent to process and validate data
        agent_input = AgentInput(
            user_id=user_id,
            data={"profile_form": profile_data.dict()}
        )
        
        if "profile_agent" in orchestrator.agents:
            result = await orchestrator.agents["profile_agent"].execute(agent_input)
            
            if result.success and not result.result.get("validation_errors"):
                final_profile = result.result.get("final_profile", {})
                
                # Convert to UserProfile model
                profile = UserProfile(
                    user_id=user_id,
                    created_at="2024-01-01T00:00:00",
                    updated_at="2024-01-01T00:00:00",
                    **final_profile
                )
                
                return profile
            else:
                errors = result.result.get("validation_errors", ["Profile validation failed"])
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Profile validation errors: {', '.join(errors)}"
                )
        
        # Fallback: save directly
        profile_dict = profile_data.dict()
        await firestore_service.save_user_profile(user_id, profile_dict)
        
        profile = UserProfile(
            user_id=user_id,
            created_at="2024-01-01T00:00:00",
            updated_at="2024-01-01T00:00:00",
            **profile_dict
        )
        
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create profile"
        )


@router.put("/", response_model=UserProfile)
async def update_profile(profile_updates: UserProfileUpdate, token: str = Depends(security)):
    """Update user profile."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Get current profile
        current_profile = await firestore_service.get_user_profile(user_id)
        if not current_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        # Update profile
        update_data = profile_updates.dict(exclude_unset=True)
        await firestore_service.update_user_profile(user_id, update_data)
        
        # Get updated profile
        updated_profile = await firestore_service.get_user_profile(user_id)
        return UserProfile(**updated_profile)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), token: str = Depends(security)):
    """Upload and parse resume using lightweight text parsing (no paid APIs)."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        # Read file (expect text; PDFs/Docs would need extra libs, omitted per constraints)
        content_bytes = await file.read()
        text = content_bytes.decode(errors="ignore")

        # Very simple skill extraction via keyword matching
        known_skills = [
            "python","java","javascript","react","node","sql","nosql","aws","gcp","azure",
            "docker","kubernetes","machine learning","ml","data analysis","pandas","numpy","git"
        ]
        found = []
        lower = text.lower()
        for sk in known_skills:
            if sk in lower:
                # Normalize formatting
                found.append(sk.title() if sk.isalpha() else sk)

        extracted = {
            "skills": sorted(list(set(found)))[:20],
        }
        
        return {
            "message": "Resume uploaded successfully",
            "extracted_data": extracted
        }
        
    except Exception as e:
        logger.error(f"Failed to upload resume: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload resume"
        )


@router.get("/skill-gap-analysis")
async def get_skill_gap_analysis(career_id: Optional[str] = None, token: str = Depends(security)):
    """Get skill gap analysis for user profile."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Get user profile
        user_profile = await firestore_service.get_user_profile(user_id)
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile required for skill gap analysis"
            )
        
        # Mock target career if not provided
        target_career = {
            "id": career_id or "sw-dev-001",
            "title": "Software Developer",
            "required_skills": ["Python", "JavaScript", "SQL", "Git", "React"],
            "preferred_skills": ["AWS", "Docker", "Node.js"]
        }
        
        # Execute skill gap agent
        agent_input = AgentInput(
            user_id=user_id,
            data={
                "user_profile": user_profile,
                "target_career": target_career
            }
        )
        
        if "skill_gap_agent" in orchestrator.agents:
            result = await orchestrator.agents["skill_gap_agent"].execute(agent_input)
            
            if result.success:
                return result.result
        
        # Fallback mock analysis
        return {
            "skill_gaps": [
                {
                    "skill_name": "React",
                    "importance_level": 8.0,
                    "current_proficiency": 2.0,
                    "required_proficiency": 7.0,
                    "gap_score": 5.0,
                    "learning_resources": []
                }
            ],
            "overall_readiness": 65.0,
            "priority_skills": ["React", "SQL", "Git"],
            "time_estimates": {
                "total_weeks": 12,
                "total_hours": 120
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get skill gap analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform skill gap analysis"
        )


@router.get("/learning-resources")
async def get_learning_resources(token: str = Depends(security)):
    """Get personalized learning resources."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Get user profile
        user_profile = await firestore_service.get_user_profile(user_id)
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile required for resource recommendations"
            )
        
        # Mock skill gaps for resource suggestions
        skill_gaps = [
            {"skill_name": "React", "gap_score": 5.0},
            {"skill_name": "SQL", "gap_score": 4.0}
        ]
        
        # Execute resource suggest agent
        agent_input = AgentInput(
            user_id=user_id,
            data={
                "user_profile": user_profile,
                "skill_gaps": skill_gaps
            }
        )
        
        if "resource_suggest_agent" in orchestrator.agents:
            result = await orchestrator.agents["resource_suggest_agent"].execute(agent_input)
            
            if result.success:
                return result.result
        
        # Fallback mock resources
        return {
            "course_recommendations": [
                {
                    "title": "React Complete Course",
                    "provider": "Udemy",
                    "url": "https://udemy.com/react-course",
                    "type": "course",
                    "duration": "40 hours",
                    "cost": "₹3,000",
                    "rating": 4.7,
                    "difficulty_level": "beginner",
                    "skills_covered": ["React", "JavaScript"]
                }
            ],
            "certification_recommendations": [],
            "internship_opportunities": [],
            "project_ideas": []
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get learning resources: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get learning resources"
        )