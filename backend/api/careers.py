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
        # Try to fetch from Firestore careers collection
        careers_ref = firestore_service.db.collection('careers').document(career_id)
        career_doc = careers_ref.get()
        
        if career_doc.exists:
            career_data = career_doc.to_dict()
            
            # Format the data for frontend consumption
            career_details = {
                "id": career_id,
                "title": career_data.get("title", "Unknown Career"),
                "industry": career_data.get("industry", "General"),
                "description": career_data.get("description", ""),
                "required_skills": career_data.get("requiredSkills", []),
                "suggested_courses": career_data.get("suggestedCourses", []),
                "experience_level": career_data.get("experienceLevel", "Entry Level"),
                "avg_salary": career_data.get("avgSalary", 0),
                "salary_range": f"₹{career_data.get('avgSalary', 0) * 0.7 / 100000:.1f}L - ₹{career_data.get('avgSalary', 0) * 1.3 / 100000:.1f}L",
                "work_type": career_data.get("workType", "Office"),
                "growth_rate": career_data.get("growthRate", "N/A"),
                "job_openings": career_data.get("jobOpenings", "N/A"),
                "domain_id": career_data.get("domain_id", ""),
                "skills_weightage": career_data.get("skills_weightage", {}),
                "typical_responsibilities": career_data.get("responsibilities", [
                    "Apply domain knowledge and skills",
                    "Collaborate with team members",
                    "Deliver quality work on time",
                    "Continuously learn and improve"
                ]),
                "career_progression": [
                    {"level": "Entry Level", "years": "0-2", "salary_range": f"₹{career_data.get('avgSalary', 0) * 0.5 / 100000:.1f}L-₹{career_data.get('avgSalary', 0) * 0.7 / 100000:.1f}L"},
                    {"level": "Mid Level", "years": "2-5", "salary_range": f"₹{career_data.get('avgSalary', 0) * 0.8 / 100000:.1f}L-₹{career_data.get('avgSalary', 0) * 1.2 / 100000:.1f}L"},
                    {"level": "Senior Level", "years": "5-8", "salary_range": f"₹{career_data.get('avgSalary', 0) * 1.3 / 100000:.1f}L-₹{career_data.get('avgSalary', 0) * 1.8 / 100000:.1f}L"},
                    {"level": "Lead/Manager", "years": "8+", "salary_range": f"₹{career_data.get('avgSalary', 0) * 2 / 100000:.1f}L+"}
                ],
                "learning_roadmap_id": career_data.get("domain_id", ""),
            }
            
            return career_details
        else:
            # Fallback: Return 404 if career not found in database
            raise HTTPException(
                status_code=404,
                detail=f"Career with ID '{career_id}' not found in database"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get career details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get career details"
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