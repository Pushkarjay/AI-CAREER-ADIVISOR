"""Career API endpoints for career matching and recommendations."""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

from models.career import (
    Career, CareerMatch, CareerRecommendation,
    Job, JobSearchRequest, JobSearchResponse
)
from core.security import verify_token
from services.firestore_service import FirestoreService
from services.job_scraper_service import job_scraper_service
from agents.base_agent import orchestrator, AgentInput

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


class CareerSearchRequest(BaseModel):
    skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    industries: Optional[List[str]] = []
    experience_level: Optional[str] = "entry"
    location: Optional[str] = "India"


@router.post("/search", response_model=List[CareerMatch])
async def search_careers(request: CareerSearchRequest, token: str = Depends(security)):
    """Search for careers based on user criteria."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Get user profile
        user_profile = await firestore_service.get_user_profile(user_id)
        if not user_profile:
            user_profile = {}
        
        # Merge request data with profile
        search_data = {
            "user_profile": {
                **user_profile,
                "skills": request.skills or user_profile.get("skills", []),
                "interests": request.interests or user_profile.get("interests", []),
                "preferred_industries": request.industries or user_profile.get("preferred_industries", [])
            }
        }
        
        # Execute career match agent
        agent_input = AgentInput(
            user_id=user_id,
            data=search_data
        )
        
        if "career_match_agent" in orchestrator.agents:
            result = await orchestrator.agents["career_match_agent"].execute(agent_input)
            
            if result.success:
                career_matches = result.result.get("career_matches", [])
                return career_matches
        
        # Fallback mock data
        return _get_mock_career_matches()
        
    except Exception as e:
        logger.error(f"Career search failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search careers"
        )


@router.post("/recommend", response_model=CareerRecommendation)
async def get_career_recommendations(token: str = Depends(security)):
    """Get personalized career recommendations for the user."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Get user profile
        user_profile = await firestore_service.get_user_profile(user_id)
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile required for recommendations"
            )
        
        # Execute career match agent
        agent_input = AgentInput(
            user_id=user_id,
            data={"user_profile": user_profile}
        )
        
        if "career_match_agent" in orchestrator.agents:
            result = await orchestrator.agents["career_match_agent"].execute(agent_input)
            
            if result.success:
                career_matches = result.result.get("career_matches", [])
                confidence_scores = result.result.get("confidence_scores", {})
                
                recommendation = CareerRecommendation(
                    user_id=user_id,
                    recommended_careers=career_matches,
                    generated_at="2024-01-01T00:00:00",
                    confidence_score=confidence_scores.get("overall", 0.8) * 100,
                    methodology=result.result.get("matching_methodology", "AI-powered matching")
                )
                
                # Save recommendation
                await firestore_service.save_career_recommendation(user_id, recommendation.dict())
                
                return recommendation
        
        # Fallback
        return _get_mock_career_recommendation(user_id)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Career recommendation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations"
        )


@router.get("/trends")
async def get_career_trends():
    """Get current career trends and market insights."""
    try:
        trends = {
            "top_growing_careers": [
                {"title": "Data Scientist", "growth_rate": 35, "demand_score": 9.2},
                {"title": "AI/ML Engineer", "growth_rate": 40, "demand_score": 9.5},
                {"title": "Cloud Architect", "growth_rate": 30, "demand_score": 8.8},
                {"title": "Cybersecurity Analyst", "growth_rate": 28, "demand_score": 8.5},
                {"title": "Product Manager", "growth_rate": 25, "demand_score": 8.2}
            ],
            "high_demand_skills": [
                {"skill": "Python", "demand_increase": 45},
                {"skill": "Cloud Computing", "demand_increase": 50},
                {"skill": "Machine Learning", "demand_increase": 60},
                {"skill": "React", "demand_increase": 35},
                {"skill": "DevOps", "demand_increase": 40}
            ],
            "salary_trends": {
                "technology": {"avg_increase": 15, "range": "₹5L - ₹25L"},
                "finance": {"avg_increase": 12, "range": "₹4L - ₹20L"},
                "healthcare": {"avg_increase": 10, "range": "₹3L - ₹15L"}
            },
            "market_insights": {
                "total_job_openings": 1200000,
                "remote_opportunities": 45,
                "tier2_city_growth": 35
            }
        }
        
        return trends
        
    except Exception as e:
        logger.error(f"Failed to get career trends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get career trends"
        )


@router.get("/{career_id}")
async def get_career_details(career_id: str):
    """Get detailed information about a specific career."""
    try:
        # Mock career details - in production would query database
        career_details = {
            "id": career_id,
            "title": "Software Developer",
            "industry": "technology",
            "description": "Design, develop, and maintain software applications using various programming languages and frameworks.",
            "required_skills": ["Python", "JavaScript", "SQL", "Git"],
            "preferred_skills": ["React", "Node.js", "AWS", "Docker"],
            "education_requirements": ["Bachelor's degree in Computer Science or related field"],
            "experience_level": "entry",
            "salary_range_min": 400000,
            "salary_range_max": 800000,
            "location_flexibility": True,
            "growth_potential": 8.5,
            "demand_score": 9.2,
            "typical_responsibilities": [
                "Write clean, maintainable code",
                "Collaborate with cross-functional teams",
                "Debug and troubleshoot applications",
                "Participate in code reviews",
                "Stay updated with technology trends"
            ],
            "career_progression": [
                {"level": "Junior Developer", "years": "0-2", "salary_range": "₹4L-6L"},
                {"level": "Mid-level Developer", "years": "2-5", "salary_range": "₹6L-12L"},
                {"level": "Senior Developer", "years": "5-8", "salary_range": "₹12L-20L"},
                {"level": "Tech Lead", "years": "8+", "salary_range": "₹20L+"}
            ],
            "related_careers": [
                "Full Stack Developer",
                "DevOps Engineer",
                "Data Engineer",
                "Mobile App Developer"
            ],
            # Roadmap integration fields (prototype)
            "learning_roadmap_id": "backend-dev",
            "career_path_stages": [
                "Junior Developer",
                "Mid-level Developer",
                "Senior Developer",
                "Tech Lead"
            ]
        }
        
        return career_details
        
    except Exception as e:
        logger.error(f"Failed to get career details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get career details"
        )


@router.post("/{career_id}/personalized-path")
async def generate_personalized_career_path(career_id: str, token: str = Depends(security)):
    """
    Generate a personalized career development path using AI based on user profile and resume.
    Uses Gemini AI to create customized learning paths, skill gap analysis, and action plans.
    """
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Get user profile
        user_profile = await firestore_service.get_user_profile(user_id)
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile required for personalized path generation"
            )
        
        # Get career details (in production, fetch from database)
        # For now, using mock data similar to get_career_details
        career_data = {
            "id": career_id,
            "title": "Software Developer",
            "industry": "technology",
            "description": "Design, develop, and maintain software applications using various programming languages and frameworks.",
            "required_skills": ["Python", "JavaScript", "SQL", "Git"],
            "preferred_skills": ["React", "Node.js", "AWS", "Docker"],
        }
        
        # Extract resume data if available
        resume_data = user_profile.get("resume")
        
        # Generate personalized path using Gemini AI
        gemini_service = get_gemini_service()
        personalized_path = await gemini_service.generate_personalized_career_path(
            career_data=career_data,
            user_profile=user_profile,
            resume_data=resume_data
        )
        
        # Save the generated path to user's profile for future reference
        try:
            await firestore_service.save_personalized_path(
                user_id, 
                career_id, 
                personalized_path
            )
        except Exception as save_error:
            logger.warning(f"Could not save personalized path: {save_error}")
        
        return personalized_path
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate personalized career path: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate personalized path: {str(e)}"
        )


@router.post("/jobs/search", response_model=JobSearchResponse)
async def search_jobs(request: JobSearchRequest, token: str = Depends(security)):
    """
    Search for real job listings using jobspy.
    
    This endpoint scrapes job listings from multiple job boards including:
    - Indeed
    - LinkedIn
    - ZipRecruiter
    - Google Jobs
    """
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        logger.info(f"User {user_id} searching jobs: {request.search_term} in {request.location}")
        
        # Scrape jobs using the job scraper service
        jobs_data = job_scraper_service.scrape_jobs(
            search_term=request.search_term,
            location=request.location,
            results_wanted=request.results_wanted,
            hours_old=request.hours_old,
            country_indeed=request.country_indeed,
            google_search_term=request.google_search_term,
            site_name=request.site_name,
            linkedin_fetch_description=request.linkedin_fetch_description
        )
        
        # Convert to Job models
        jobs = [Job(**job_data) for job_data in jobs_data]
        
        # Create response
        response = JobSearchResponse(
            jobs=jobs,
            total_count=len(jobs),
            search_term=request.search_term,
            location=request.location,
            timestamp=datetime.utcnow()
        )
        
        logger.info(f"Found {len(jobs)} jobs for user {user_id}")
        
        return response
        
    except Exception as e:
        logger.error(f"Job search failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search jobs: {str(e)}"
        )


def _get_mock_career_matches() -> List[CareerMatch]:
    """Return mock career matches for development."""
    from models.career import Career, CareerMatch
    
    mock_career = Career(
        id="sw-dev-001",
        title="Software Developer",
        industry="technology",
        description="Develop software applications",
        required_skills=["Python", "JavaScript"],
        preferred_skills=["React", "AWS"],
        education_requirements=["Bachelor's degree"],
        experience_level="entry",
        salary_range_min=400000,
        salary_range_max=800000,
        location_flexibility=True,
        growth_potential=8.5,
        demand_score=9.2,
        created_at="2024-01-01T00:00:00",
        updated_at="2024-01-01T00:00:00"
    )
    
    match = CareerMatch(
        career=mock_career,
        match_score=85.5,
        skill_match_percentage=78.0,
        missing_skills=["React", "AWS"],
        matching_skills=["Python", "JavaScript"],
        recommendation_reason="Strong programming foundation with good growth potential"
    )
    
    return [match]


def _get_mock_career_recommendation(user_id: str) -> CareerRecommendation:
    """Return mock career recommendation for development."""
    career_matches = _get_mock_career_matches()
    
    return CareerRecommendation(
        user_id=user_id,
        recommended_careers=career_matches,
        generated_at="2024-01-01T00:00:00",
        confidence_score=85.0,
        methodology="AI-powered matching algorithm"
    )