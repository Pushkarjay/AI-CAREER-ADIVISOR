"""Mock BigQuery service for development."""

import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class BigQueryService:
    """Mock BigQuery service for development."""
    
    def __init__(self):
        """Initialize the mock BigQuery service."""
        logger.info("Initializing mock BigQuery service for development")
    
    async def get_career_trends(self) -> List[Dict[str, Any]]:
        """Get career trends data."""
        logger.info("Getting mock career trends")
        return [
            {
                "field": "Software Engineering",
                "growth": "+25%",
                "avg_salary": "₹12L",
                "description": "High demand for full-stack developers"
            },
            {
                "field": "Data Science",
                "growth": "+35%",
                "avg_salary": "₹15L",
                "description": "AI/ML skills in high demand"
            },
            {
                "field": "DevOps",
                "growth": "+30%",
                "avg_salary": "₹14L",
                "description": "Cloud infrastructure expertise needed"
            }
        ]
    
    async def get_skill_demand_trends(self, skills: List[str]) -> Dict[str, Any]:
        """Get skill demand trends."""
        logger.info(f"Getting mock skill demand for: {skills}")
        return {
            "Python": {"demand": "High", "growth": "+40%"},
            "React": {"demand": "High", "growth": "+35%"},
            "AWS": {"demand": "Very High", "growth": "+50%"},
            "Docker": {"demand": "High", "growth": "+45%"}
        }
    
    async def search_careers(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Search for careers."""
        logger.info(f"Mock career search for: {query}")
        return [
            {
                "id": "job_1",
                "title": "Software Developer",
                "company": "Tech Corp",
                "location": "Bangalore",
                "salary_range": "₹8-12 LPA",
                "experience": "2-4 years",
                "required_skills": ["Python", "React", "SQL"],
                "description": "Develop web applications using modern technologies",
                "match_score": 85
            },
            {
                "id": "job_2", 
                "title": "Data Scientist",
                "company": "Analytics Inc",
                "location": "Mumbai",
                "salary_range": "₹10-15 LPA",
                "experience": "3-5 years",
                "required_skills": ["Python", "Machine Learning", "SQL"],
                "description": "Build ML models for business insights",
                "match_score": 78
            }
        ]
    
    async def get_salary_insights(self, role: str, location: str = None) -> Dict[str, Any]:
        """Get salary insights for a role."""
        logger.info(f"Getting mock salary insights for: {role}")
        return {
            "role": role,
            "avg_salary": "₹12L",
            "salary_range": "₹8-18L", 
            "percentiles": {
                "25th": "₹8L",
                "50th": "₹12L",
                "75th": "₹16L",
                "90th": "₹18L"
            },
            "location_comparison": {
                "Bangalore": "₹13L",
                "Mumbai": "₹12L",
                "Delhi": "₹11L",
                "Pune": "₹10L"
            }
        }