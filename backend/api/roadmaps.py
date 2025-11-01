"""Roadmaps API endpoints for domain learning paths and personalized recommendations."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from typing import List, Dict, Any
import logging

from core.security import verify_token
from models.career import LearningRoadmap
from data.domains_roadmap import DOMAINS_ROADMAP, ALL_DOMAIN_SLUGS
from services.firestore_service import FirestoreService

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()
firestore_service = FirestoreService()

# Lazy initialization of Gemini service
_gemini_service = None

def get_gemini_service():
    """Get or create Gemini service instance."""
    global _gemini_service
    if _gemini_service is None:
        from services.gemini_service import GeminiService
        _gemini_service = GeminiService()
    return _gemini_service


@router.get("/", response_model=List[LearningRoadmap])
async def list_roadmaps():
    try:
        return [LearningRoadmap(
            domain_id=v["domain_id"],
            title=v["title"],
            description=v["description"],
            difficulty_level=v.get("difficulty", "mixed"),
            learning_path=v.get("learning_path", []),
            prerequisites=v.get("prerequisites", []),
            estimated_time=v.get("estimated_completion"),
            related_domains=v.get("related_domains", []),
            universal_foundations=v.get("universal_foundations", []),
        ) for v in DOMAINS_ROADMAP.values()]
    except Exception as e:
        logger.error(f"Failed to list roadmaps: {e}")
        raise HTTPException(status_code=500, detail="Failed to list roadmaps")


@router.get("/recommendations")
async def recommended_roadmaps(token: str = Depends(security)):
    """
    Return ALL domains ranked by user's matched skill percentage (0-100).
    Always includes every domain (even 0% matches) sorted descending.
    """
    import re
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        profile = await firestore_service.get_user_profile(user_id)
        skills = set(map(str.lower, (profile or {}).get("skills", [])))
        interests = set(map(str.lower, (profile or {}).get("interests", [])))
        user_tokens = {t for t in (skills | interests) if t}

        def tokenize(values: List[str]) -> set:
            text = " \n ".join([v for v in values if isinstance(v, str)])
            return {tok for tok in re.split(r"[^a-z0-9+.#]+", text.lower()) if tok}

        ranked: List[Dict[str, Any]] = []
        for v in DOMAINS_ROADMAP.values():
            domain_tokens = tokenize([v.get("title", "")] + v.get("prerequisites", []) + v.get("learning_path", []))
            matches = len(domain_tokens & user_tokens)
            # Normalize by domain token size to represent how much of the roadmap aligns
            denom = max(1, len(domain_tokens))
            score = round(100.0 * matches / denom, 2)
            item = {
                "domain_id": v["domain_id"],
                "title": v["title"],
                "description": v.get("description", ""),
                "difficulty_level": v.get("difficulty", "mixed"),
                "learning_path": v.get("learning_path", []),
                "prerequisites": v.get("prerequisites", []),
                "estimated_time": v.get("estimated_completion"),
                "related_domains": v.get("related_domains", []),
                "universal_foundations": v.get("universal_foundations", []),
                # scoring fields expected by frontend
                "match_score": score,
                "skill_match_percentage": score,
            }
            ranked.append(item)

        ranked.sort(key=lambda x: (x["match_score"], x["title"]), reverse=True)
        return ranked
    except Exception as e:
        logger.error(f"Failed to get roadmap recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get roadmap recommendations")


@router.get("/{domain_id}", response_model=LearningRoadmap)
async def get_roadmap(domain_id: str):
    try:
        data = DOMAINS_ROADMAP.get(domain_id)
        if not data:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        return LearningRoadmap(
            domain_id=data["domain_id"],
            title=data["title"],
            description=data["description"],
            difficulty_level=data.get("difficulty", "mixed"),
            learning_path=data.get("learning_path", []),
            prerequisites=data.get("prerequisites", []),
            estimated_time=data.get("estimated_completion"),
            related_domains=data.get("related_domains", []),
            universal_foundations=data.get("universal_foundations", []),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get roadmap: {e}")
        raise HTTPException(status_code=500, detail="Failed to get roadmap")


@router.post("/{domain_id}/personalized")
async def generate_personalized_roadmap(domain_id: str, token: str = Depends(security)):
    """
    Generate a personalized learning roadmap for a domain using AI.
    Uses Gemini AI to create customized learning paths based on user profile and resume.
    """
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Get user profile
        user_profile = await firestore_service.get_user_profile(user_id)
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile required for personalized roadmap generation"
            )
        
        # Get domain data
        domain_data = DOMAINS_ROADMAP.get(domain_id)
        if not domain_data:
            raise HTTPException(status_code=404, detail="Domain not found")
        
        # Extract resume data if available
        resume_data = user_profile.get("resume")
        
        # Generate personalized roadmap using Gemini AI
        gemini_service = get_gemini_service()
        personalized_roadmap = await gemini_service.generate_personalized_domain_roadmap(
            domain_data=domain_data,
            user_profile=user_profile,
            resume_data=resume_data
        )
        
        # Save the generated roadmap to user's profile for future reference
        try:
            await firestore_service.save_personalized_roadmap(
                user_id,
                domain_id,
                personalized_roadmap
            )
        except Exception as save_error:
            logger.warning(f"Could not save personalized roadmap: {save_error}")
        
        return personalized_roadmap
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate personalized roadmap: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate personalized roadmap: {str(e)}"
        )

