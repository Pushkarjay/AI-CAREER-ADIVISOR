"""Analytics API endpoints for user analytics and insights."""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging

from core.security import verify_token
from services.firestore_service import FirestoreService
from services.bigquery_service_mock import BigQueryService
from services.market_trends_service import market_trends_service

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

firestore_service = FirestoreService()
bigquery_service = BigQueryService()


@router.get("/dashboard")
async def get_dashboard_analytics(token: str = Depends(security)):
    """Get dashboard analytics for the user."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Get user analytics
        user_analytics = await firestore_service.get_user_analytics(user_id)
        
        # Mock additional analytics
        dashboard_data = {
            "user_stats": {
                "chat_sessions": user_analytics.get("session_count", 0),
                "messages_sent": user_analytics.get("message_count", 0),
                "career_recommendations": user_analytics.get("recommendation_count", 0),
                "profile_completion": 85,
                "last_activity": user_analytics.get("last_active", "2024-01-01T00:00:00")
            },
            "recent_activities": [
                {
                    "type": "career_search",
                    "description": "Searched for software developer careers",
                    "timestamp": "2024-01-01T10:00:00"
                },
                {
                    "type": "skill_analysis",
                    "description": "Completed skill gap analysis",
                    "timestamp": "2024-01-01T09:30:00"
                }
            ],
            "skill_progress": [
                {"skill": "Python", "current_level": 7, "target_level": 9, "progress": 78},
                {"skill": "React", "current_level": 4, "target_level": 8, "progress": 50},
                {"skill": "SQL", "current_level": 5, "target_level": 7, "progress": 71}
            ],
            "career_readiness": {
                "overall_score": 72,
                "strengths": ["Programming fundamentals", "Problem solving"],
                "areas_to_improve": ["Frontend frameworks", "Database management"],
                "next_steps": ["Complete React course", "Practice SQL queries"]
            }
        }
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Failed to get dashboard analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get dashboard analytics"
        )


@router.get("/market-trends")
async def get_market_trends():
    """Get current market trends and insights using Gemini AI."""
    try:
        # Fetch real market trends using Gemini AI
        trends = await market_trends_service.get_general_market_trends()
        
        return trends
        
    except Exception as e:
        logger.error(f"Failed to get market trends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get market trends"
        )


@router.get("/skill-analytics")
async def get_skill_analytics(token: str = Depends(security)):
    """Get skill-based analytics and recommendations."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Get user profile to analyze skills
        user_profile = await firestore_service.get_user_profile(user_id)
        user_skills = user_profile.get("skills", []) if user_profile else []
        
        # Get skill demand trends
        if user_skills:
            skill_trends = await bigquery_service.get_skill_demand_trends(user_skills)
        else:
            skill_trends = {}
        
        analytics = {
            "user_skills": user_skills,
            "skill_demand": skill_trends,
            "skill_gaps": [
                {
                    "missing_skill": "Docker",
                    "importance": "High",
                    "market_demand": "+55%",
                    "learning_time": "4-6 weeks"
                },
                {
                    "missing_skill": "Kubernetes",
                    "importance": "Medium",
                    "market_demand": "+40%",
                    "learning_time": "6-8 weeks"
                }
            ],
            "skill_recommendations": [
                {
                    "skill": "TypeScript",
                    "reason": "Complements JavaScript skills",
                    "market_value": "+30% salary boost",
                    "difficulty": "Medium"
                },
                {
                    "skill": "GraphQL",
                    "reason": "Modern API development",
                    "market_value": "+25% opportunities",
                    "difficulty": "Medium"
                }
            ],
            "competitive_analysis": {
                "percentile": 75,
                "compared_to": "Peers in same field",
                "strengths": ["Programming fundamentals", "Problem solving"],
                "improvement_areas": ["Cloud technologies", "DevOps practices"]
            }
        }
        
        return analytics
        
    except Exception as e:
        logger.error(f"Failed to get skill analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get skill analytics"
        )


@router.get("/career-journey")
async def get_career_journey(token: str = Depends(security)):
    """Get user's career journey and progress tracking."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        journey = {
            "current_stage": "Skill Development",
            "progress_percentage": 68,
            "milestones": [
                {
                    "stage": "Profile Setup",
                    "status": "completed",
                    "completion_date": "2024-01-01",
                    "description": "Created profile and uploaded resume"
                },
                {
                    "stage": "Career Exploration",
                    "status": "completed",
                    "completion_date": "2024-01-02",
                    "description": "Explored career options and received recommendations"
                },
                {
                    "stage": "Skill Gap Analysis",
                    "status": "in_progress",
                    "completion_date": None,
                    "description": "Identifying skills to develop for target career"
                },
                {
                    "stage": "Learning Path",
                    "status": "pending",
                    "completion_date": None,
                    "description": "Following personalized learning recommendations"
                },
                {
                    "stage": "Career Readiness",
                    "status": "pending",
                    "completion_date": None,
                    "description": "Achieving career readiness for job applications"
                }
            ],
            "achievements": [
                {
                    "title": "Profile Creator",
                    "description": "Completed comprehensive profile setup",
                    "earned_date": "2024-01-01"
                },
                {
                    "title": "Career Explorer",
                    "description": "Explored 10+ career options",
                    "earned_date": "2024-01-02"
                }
            ],
            "next_actions": [
                "Complete React fundamentals course",
                "Build a portfolio project",
                "Practice coding interviews",
                "Apply for internships"
            ],
            "timeline": {
                "estimated_job_ready": "3-4 months",
                "next_milestone": "Complete skill development",
                "weekly_goals": [
                    "Complete 2 coding exercises",
                    "Study 5 hours of React",
                    "Build one small project"
                ]
            }
        }
        
        return journey
        
    except Exception as e:
        logger.error(f"Failed to get career journey: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get career journey"
        )