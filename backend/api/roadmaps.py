"""Roadmaps API endpoints for domain learning paths and personalized recommendations."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from typing import List, Dict, Any
import logging
import re

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


# Pre-compute and cache domain tokens for faster recommendation matching
_domain_tokens_cache: Dict[str, set] = {}

def _tokenize(values: List[str]) -> set:
    """Tokenize a list of strings into lowercase alphanumeric tokens."""
    text = " \n ".join([v for v in values if isinstance(v, str)])
    return {tok for tok in re.split(r"[^a-z0-9+.#]+", text.lower()) if tok}

def _get_domain_tokens(domain_id: str, domain_data: Dict[str, Any]) -> set:
    """Get cached tokens for a domain, computing if necessary."""
    if domain_id not in _domain_tokens_cache:
        _domain_tokens_cache[domain_id] = _tokenize(
            [domain_data.get("title", "")] + 
            domain_data.get("prerequisites", []) + 
            domain_data.get("learning_path", [])
        )
    return _domain_tokens_cache[domain_id]


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
    Return top-ranked domains by user's matched skill percentage (0-100).
    Optimized to return only the most relevant recommendations.
    """
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        profile = await firestore_service.get_user_profile(user_id)
        skills = set(map(str.lower, (profile or {}).get("skills", [])))
        interests = set(map(str.lower, (profile or {}).get("interests", [])))
        user_tokens = {t for t in (skills | interests) if t}

        ranked: List[Dict[str, Any]] = []
        
        # Process all domains but use cached tokens
        for domain_id, domain_data in DOMAINS_ROADMAP.items():
            # Use cached domain tokens to avoid recomputing every time
            domain_tokens = _get_domain_tokens(domain_id, domain_data)
            
            matches = len(domain_tokens & user_tokens)
            # Normalize by domain token size to represent how much of the roadmap aligns
            denom = max(1, len(domain_tokens))
            score = round(100.0 * matches / denom, 2)
            
            item = {
                "domain_id": domain_data["domain_id"],
                "title": domain_data["title"],
                "description": domain_data.get("description", ""),
                "difficulty_level": domain_data.get("difficulty", "mixed"),
                "learning_path": domain_data.get("learning_path", []),
                "prerequisites": domain_data.get("prerequisites", []),
                "estimated_time": domain_data.get("estimated_completion"),
                "related_domains": domain_data.get("related_domains", []),
                "universal_foundations": domain_data.get("universal_foundations", []),
                # scoring fields expected by frontend
                "match_score": score,
                "skill_match_percentage": score,
            }
            ranked.append(item)

        # Sort by score descending
        ranked.sort(key=lambda x: (x["match_score"], x["title"]), reverse=True)
        
        # Return top 24 recommendations (3 rows of 8 cards) plus all with score > 0
        # This ensures we show meaningful matches while not overwhelming the UI
        top_matches = [r for r in ranked if r["match_score"] > 0][:24]
        
        # If we have fewer than 24 matches, fill with top-rated domains
        if len(top_matches) < 24:
            remaining = 24 - len(top_matches)
            zero_score = [r for r in ranked if r["match_score"] == 0][:remaining]
            top_matches.extend(zero_score)
        
        return top_matches
        
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

