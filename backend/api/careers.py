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
    """Get detailed information about a specific career (domain/roadmap)."""
    try:
        # Import domains data
        from data.domains_roadmap import DOMAINS_ROADMAP
        
        # Try to get from roadmap domains first (analytics-engineer, etc.)
        domain_data = DOMAINS_ROADMAP.get(career_id)
        
        if domain_data:
            # Build career details from domain roadmap data
            avg_salary = 900000  # Default salary
            
            career_details = {
                "id": career_id,
                "title": domain_data.get("title", "Unknown Career"),
                "industry": "Technology",
                "description": domain_data.get("description", ""),
                "required_skills": domain_data.get("prerequisites", []) or domain_data.get("learning_path", [])[:5],
                "suggested_courses": [f"{step}" for step in (domain_data.get("learning_path", [])[:3])],
                "experience_level": domain_data.get("difficulty", "intermediate").title(),
                "avg_salary": avg_salary,
                "salary_range": f"₹{avg_salary * 0.7 / 100000:.1f}L - ₹{avg_salary * 1.3 / 100000:.1f}L",
                "work_type": "Hybrid",
                "growth_rate": "25%",
                "job_openings": "High",
                "domain_id": career_id,
                "skills_weightage": {},
                "typical_responsibilities": [
                    "Apply domain knowledge and skills",
                    "Collaborate with team members",
                    "Deliver quality work on time",
                    "Continuously learn and improve"
                ],
                "career_progression": [
                    {"level": "Entry Level", "years": "0-2", "salary_range": f"₹{avg_salary * 0.5 / 100000:.1f}L-₹{avg_salary * 0.7 / 100000:.1f}L"},
                    {"level": "Mid Level", "years": "2-5", "salary_range": f"₹{avg_salary * 0.8 / 100000:.1f}L-₹{avg_salary * 1.2 / 100000:.1f}L"},
                    {"level": "Senior Level", "years": "5-8", "salary_range": f"₹{avg_salary * 1.3 / 100000:.1f}L-₹{avg_salary * 1.8 / 100000:.1f}L"},
                    {"level": "Lead/Manager", "years": "8+", "salary_range": f"₹{avg_salary * 2 / 100000:.1f}L+"}
                ],
                "learning_roadmap_id": career_id,
            }
            
            return career_details
        
        # Fallback: Try to fetch from Firestore careers collection
        db = firestore_service._get_db()
        if db is not None:
            careers_ref = db.collection('careers').document(career_id)
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
        
        # Return 404 if career not found anywhere
        raise HTTPException(
            status_code=404,
            detail=f"Career with ID '{career_id}' not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get career details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get career details"
        )


@router.post("/{career_id}/personalized-path")
async def generate_personalized_path(career_id: str, token: str = Depends(security)):
    """Generate a personalized learning path for a specific career using AI."""
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
        
        # Import domains data
        from data.domains_roadmap import DOMAINS_ROADMAP
        
        # Get career/domain data - try roadmaps first, then Firestore careers
        domain_data = DOMAINS_ROADMAP.get(career_id)
        career_title = None
        career_skills = []
        
        if domain_data:
            # Using roadmap domain data
            career_title = domain_data.get("title", career_id.replace('-', ' ').title())
            career_skills = domain_data.get("prerequisites", []) or domain_data.get("learning_path", [])[:5]
        else:
            # Try Firestore careers collection
            db = firestore_service._get_db()
            if db is not None:
                career_ref = db.collection('careers').document(career_id)
                career_doc = career_ref.get()
                
                if career_doc.exists:
                    career_data = career_doc.to_dict()
                    career_title = career_data.get("title", "Unknown Career")
                    career_skills = career_data.get("requiredSkills", [])
        
        if not career_title:
            raise HTTPException(
                status_code=404,
                detail=f"Career with ID '{career_id}' not found"
            )
        
        # Use Gemini to generate personalized path
        from services.gemini_service import GeminiService
        gemini = GeminiService()
        
        user_skills = user_profile.get("skills", [])
        user_interests = user_profile.get("interests", [])
        
        # Build prompt for Gemini
        prompt = f"""Generate a comprehensive personalized learning path for a user pursuing a career as {career_title}.

User Profile:
- Current Skills: {', '.join(user_skills) if user_skills else 'None specified'}
- Interests: {', '.join(user_interests) if user_interests else 'None specified'}

Career Requirements:
- Required Skills: {', '.join(career_skills) if career_skills else 'General career skills'}
- Career Path: {career_title}

Please provide a JSON response with the following structure:
{{
    "overview": "Brief overview of the learning path (2-3 sentences)",
    "current_level": "Assessment of user's current skill level",
    "skill_gaps": [
        {{
            "skill": "Skill name",
            "current_level": "beginner/intermediate/advanced",
            "target_level": "intermediate/advanced/expert",
            "priority": "high/medium/low",
            "reason": "Why this skill is important"
        }}
    ],
    "learning_roadmap": [
        {{
            "phase": "Phase name (e.g., Foundation, Intermediate, Advanced)",
            "duration": "Estimated time",
            "focus_areas": ["Area 1", "Area 2"],
            "resources": [
                {{
                    "type": "course/tutorial/documentation/practice",
                    "title": "Resource title",
                    "description": "Brief description",
                    "url": "https://example.com (use real URLs when possible)",
                    "difficulty": "beginner/intermediate/advanced",
                    "estimated_hours": 10
                }}
            ]
        }}
    ],
    "projects": [
        {{
            "title": "Project name",
            "description": "Project description",
            "skills_practiced": ["Skill 1", "Skill 2"],
            "difficulty": "beginner/intermediate/advanced",
            "estimated_hours": 20
        }}
    ],
    "certifications": [
        {{
            "name": "Certification name",
            "provider": "Provider name",
            "relevance": "Why this certification is relevant",
            "difficulty": "beginner/intermediate/advanced",
            "estimated_cost": "$XXX",
            "url": "https://example.com (use real URLs when possible)"
        }}
    ],
    "timeline": {{
        "total_duration": "X months",
        "beginner_path": "3-6 months",
        "intermediate_path": "6-12 months",
        "advanced_path": "12+ months"
    }},
    "success_metrics": [
        "Metric 1",
        "Metric 2"
    ],
    "next_steps": [
        "Step 1",
        "Step 2"
    ]
}}

Provide real, actionable recommendations with actual course links (Coursera, Udemy, freeCodeCamp, etc.) where applicable."""

        response = await gemini._generate_text(prompt)
        
        # Parse JSON response
        import json
        import re
        
        # Extract the text from the response dictionary
        response_text = response.get("text", "") if isinstance(response, dict) else str(response)
        
        # Extract JSON from markdown code blocks if present
        json_match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1)
        
        try:
            personalized_path = json.loads(response_text)
        except json.JSONDecodeError:
            # If not valid JSON, create a structured response from the text
            personalized_path = {
                "overview": response_text[:500] + "..." if len(response_text) > 500 else response_text,
                "current_level": "Assessment pending",
                "skill_gaps": [],
                "learning_roadmap": [],
                "projects": [],
                "certifications": [],
                "timeline": {
                    "total_duration": "6-12 months",
                    "beginner_path": "3-6 months",
                    "intermediate_path": "6-12 months",
                    "advanced_path": "12+ months"
                },
                "success_metrics": [],
                "next_steps": [],
                "raw_response": response_text
            }
        
        logger.info(f"Generated personalized path for user {user_id} and career {career_id}")
        
        return {
            "career_id": career_id,
            "career_title": career_title,
            "user_id": user_id,
            "generated_at": datetime.utcnow().isoformat(),
            **personalized_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate personalized path: {e}")
        import traceback
        traceback.print_exc()
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