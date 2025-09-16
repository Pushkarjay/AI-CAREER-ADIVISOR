"""BigQuery service for career data queries and analytics."""

import logging
from typing import Dict, Any, List, Optional
import asyncio

from google.cloud import bigquery
from google.cloud.bigquery import QueryJobConfig

from core.database import get_bigquery_client
from core.config import settings

logger = logging.getLogger(__name__)


class BigQueryService:
    """Service for BigQuery operations and career data queries."""
    
    def __init__(self):
        self.client = None
        self.dataset_id = settings.BIGQUERY_DATASET
        self.project_id = settings.GOOGLE_CLOUD_PROJECT
    
    def _get_client(self):
        """Get BigQuery client."""
        if self.client is None:
            self.client = get_bigquery_client()
        return self.client
    
    async def query_careers(self, query_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Query careers based on user criteria."""
        try:
            client = self._get_client()
            
            # Build the SQL query
            sql_query = self._build_career_query(query_params)
            
            # Configure query job
            job_config = QueryJobConfig(
                use_query_cache=True,
                use_legacy_sql=False
            )
            
            # Execute query
            query_job = client.query(sql_query, job_config=job_config)
            results = query_job.result()
            
            # Convert to list of dictionaries
            careers = []
            for row in results:
                career_data = {
                    "id": row.get("career_id"),
                    "title": row.get("title"),
                    "industry": row.get("industry"),
                    "description": row.get("description"),
                    "required_skills": row.get("required_skills", []),
                    "preferred_skills": row.get("preferred_skills", []),
                    "education_requirements": row.get("education_requirements", []),
                    "experience_level": row.get("experience_level"),
                    "salary_range_min": row.get("salary_min"),
                    "salary_range_max": row.get("salary_max"),
                    "location_flexibility": row.get("remote_friendly", True),
                    "growth_potential": row.get("growth_score", 5.0),
                    "demand_score": row.get("demand_score", 5.0),
                    "created_at": row.get("created_at"),
                    "updated_at": row.get("updated_at")
                }
                careers.append(career_data)
            
            logger.info(f"Retrieved {len(careers)} careers from BigQuery")
            return careers
            
        except Exception as e:
            logger.error(f"Failed to query careers: {e}")
            # Return mock data for development
            return self._get_mock_careers(query_params)
    
    async def query_learning_resources(self, skill: str, level: str, 
                                     location: str, budget: str) -> List[Dict[str, Any]]:
        """Query learning resources from BigQuery."""
        try:
            client = self._get_client()
            
            sql_query = f"""
            SELECT 
                resource_id,
                title,
                provider,
                url,
                type,
                duration,
                cost,
                rating,
                difficulty_level,
                skills_covered,
                location_specific,
                created_at
            FROM `{self.project_id}.{self.dataset_id}.learning_resources`
            WHERE 
                LOWER('{skill}') IN UNNEST(ARRAY(SELECT LOWER(skill) FROM UNNEST(skills_covered) AS skill))
                AND difficulty_level = '{level}'
                AND (location_specific IS NULL OR location_specific = '{location}')
                AND (budget_category = '{budget}' OR budget_category = 'free')
            ORDER BY rating DESC, created_at DESC
            LIMIT 20
            """
            
            query_job = client.query(sql_query)
            results = query_job.result()
            
            resources = []
            for row in results:
                resource_data = {
                    "title": row.get("title"),
                    "provider": row.get("provider"),
                    "url": row.get("url"),
                    "type": row.get("type"),
                    "duration": row.get("duration"),
                    "cost": row.get("cost"),
                    "rating": float(row.get("rating", 0)) if row.get("rating") else None,
                    "difficulty_level": row.get("difficulty_level"),
                    "skills_covered": row.get("skills_covered", [])
                }
                resources.append(resource_data)
            
            return resources
            
        except Exception as e:
            logger.error(f"Failed to query learning resources: {e}")
            return self._get_mock_resources(skill, level)
    
    async def get_career_statistics(self, career_ids: List[str]) -> Dict[str, Any]:
        """Get statistics for specific careers."""
        try:
            client = self._get_client()
            
            career_ids_str = "', '".join(career_ids)
            sql_query = f"""
            SELECT 
                industry,
                AVG(salary_min) as avg_salary_min,
                AVG(salary_max) as avg_salary_max,
                AVG(demand_score) as avg_demand,
                AVG(growth_score) as avg_growth,
                COUNT(*) as job_count
            FROM `{self.project_id}.{self.dataset_id}.careers`
            WHERE career_id IN ('{career_ids_str}')
            GROUP BY industry
            """
            
            query_job = client.query(sql_query)
            results = query_job.result()
            
            statistics = {
                "by_industry": [],
                "overall": {
                    "total_careers": 0,
                    "avg_salary_range": (0, 0),
                    "avg_demand_score": 0,
                    "avg_growth_score": 0
                }
            }
            
            total_careers = 0
            total_salary_min = 0
            total_salary_max = 0
            total_demand = 0
            total_growth = 0
            
            for row in results:
                industry_stat = {
                    "industry": row.get("industry"),
                    "avg_salary_range": (row.get("avg_salary_min", 0), row.get("avg_salary_max", 0)),
                    "avg_demand_score": row.get("avg_demand", 0),
                    "avg_growth_score": row.get("avg_growth", 0),
                    "job_count": row.get("job_count", 0)
                }
                statistics["by_industry"].append(industry_stat)
                
                # Aggregate for overall stats
                total_careers += industry_stat["job_count"]
                total_salary_min += industry_stat["avg_salary_range"][0] * industry_stat["job_count"]
                total_salary_max += industry_stat["avg_salary_range"][1] * industry_stat["job_count"]
                total_demand += industry_stat["avg_demand_score"] * industry_stat["job_count"]
                total_growth += industry_stat["avg_growth_score"] * industry_stat["job_count"]
            
            if total_careers > 0:
                statistics["overall"] = {
                    "total_careers": total_careers,
                    "avg_salary_range": (
                        total_salary_min / total_careers,
                        total_salary_max / total_careers
                    ),
                    "avg_demand_score": total_demand / total_careers,
                    "avg_growth_score": total_growth / total_careers
                }
            
            return statistics
            
        except Exception as e:
            logger.error(f"Failed to get career statistics: {e}")
            return {"error": str(e)}
    
    async def get_skill_demand_trends(self, skills: List[str]) -> Dict[str, Any]:
        """Get demand trends for specific skills."""
        try:
            client = self._get_client()
            
            skills_str = "', '".join(skills)
            sql_query = f"""
            SELECT 
                skill_name,
                demand_score,
                growth_trend,
                job_postings_count,
                avg_salary,
                last_updated
            FROM `{self.project_id}.{self.dataset_id}.skill_trends`
            WHERE LOWER(skill_name) IN ('{skills_str.lower()}')
            ORDER BY demand_score DESC
            """
            
            query_job = client.query(sql_query)
            results = query_job.result()
            
            trends = {}
            for row in results:
                skill_name = row.get("skill_name")
                trends[skill_name] = {
                    "demand_score": row.get("demand_score", 0),
                    "growth_trend": row.get("growth_trend", "stable"),
                    "job_postings_count": row.get("job_postings_count", 0),
                    "avg_salary": row.get("avg_salary", 0),
                    "last_updated": row.get("last_updated")
                }
            
            return trends
            
        except Exception as e:
            logger.error(f"Failed to get skill demand trends: {e}")
            return {}
    
    async def get_market_insights(self, location: str, industry: str) -> Dict[str, Any]:
        """Get market insights for a specific location and industry."""
        try:
            client = self._get_client()
            
            sql_query = f"""
            SELECT 
                job_count,
                avg_salary,
                top_companies,
                growth_rate,
                skill_demands,
                market_size,
                competition_level
            FROM `{self.project_id}.{self.dataset_id}.market_insights`
            WHERE LOWER(location) = LOWER('{location}')
                AND LOWER(industry) = LOWER('{industry}')
            ORDER BY last_updated DESC
            LIMIT 1
            """
            
            query_job = client.query(sql_query)
            results = query_job.result()
            
            for row in results:
                return {
                    "job_count": row.get("job_count", 0),
                    "avg_salary": row.get("avg_salary", 0),
                    "top_companies": row.get("top_companies", []),
                    "growth_rate": row.get("growth_rate", 0),
                    "skill_demands": row.get("skill_demands", []),
                    "market_size": row.get("market_size", "medium"),
                    "competition_level": row.get("competition_level", "medium")
                }
            
            return {"error": "No market insights found"}
            
        except Exception as e:
            logger.error(f"Failed to get market insights: {e}")
            return {"error": str(e)}
    
    def _build_career_query(self, params: Dict[str, Any]) -> str:
        """Build SQL query for career search."""
        skills = params.get("skills", [])
        interests = params.get("interests", [])
        industries = params.get("industries", [])
        experience_level = params.get("experience_level", "entry")
        limit = params.get("limit", 50)
        
        # Base query
        sql_query = f"""
        SELECT 
            career_id,
            title,
            industry,
            description,
            required_skills,
            preferred_skills,
            education_requirements,
            experience_level,
            salary_min,
            salary_max,
            remote_friendly,
            growth_score,
            demand_score,
            created_at,
            updated_at
        FROM `{self.project_id}.{self.dataset_id}.careers`
        WHERE 1=1
        """
        
        # Add filters
        if skills:
            skills_condition = " OR ".join([
                f"'{skill.lower()}' IN UNNEST(ARRAY(SELECT LOWER(s) FROM UNNEST(required_skills) AS s))"
                for skill in skills
            ])
            sql_query += f" AND ({skills_condition})"
        
        if industries:
            industries_str = "', '".join(industries)
            sql_query += f" AND LOWER(industry) IN ('{industries_str.lower()}')"
        
        if experience_level:
            sql_query += f" AND experience_level = '{experience_level}'"
        
        # Order by demand score and limit
        sql_query += f" ORDER BY demand_score DESC, growth_score DESC LIMIT {limit}"
        
        return sql_query
    
    def _get_mock_careers(self, query_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Return mock career data for development."""
        mock_careers = [
            {
                "id": "sw-dev-001",
                "title": "Software Developer",
                "industry": "technology",
                "description": "Develop and maintain software applications using modern technologies.",
                "required_skills": ["python", "javascript", "sql"],
                "preferred_skills": ["react", "node.js", "aws"],
                "education_requirements": ["bachelor in computer science"],
                "experience_level": "entry",
                "salary_range_min": 400000,
                "salary_range_max": 800000,
                "location_flexibility": True,
                "growth_potential": 8.5,
                "demand_score": 9.2,
                "created_at": "2024-01-01",
                "updated_at": "2024-01-01"
            },
            {
                "id": "da-analyst-001",
                "title": "Data Analyst",
                "industry": "technology",
                "description": "Analyze data to derive business insights and support decision-making.",
                "required_skills": ["python", "sql", "excel"],
                "preferred_skills": ["tableau", "r", "statistics"],
                "education_requirements": ["bachelor in any field"],
                "experience_level": "entry",
                "salary_range_min": 350000,
                "salary_range_max": 700000,
                "location_flexibility": True,
                "growth_potential": 7.8,
                "demand_score": 8.5,
                "created_at": "2024-01-01",
                "updated_at": "2024-01-01"
            },
            {
                "id": "product-mgr-001",
                "title": "Product Manager",
                "industry": "technology",
                "description": "Manage product development lifecycle and strategy.",
                "required_skills": ["product management", "analytics", "communication"],
                "preferred_skills": ["agile", "user research", "sql"],
                "education_requirements": ["bachelor in any field"],
                "experience_level": "mid",
                "salary_range_min": 800000,
                "salary_range_max": 1500000,
                "location_flexibility": True,
                "growth_potential": 9.0,
                "demand_score": 8.8,
                "created_at": "2024-01-01",
                "updated_at": "2024-01-01"
            }
        ]
        
        return mock_careers
    
    def _get_mock_resources(self, skill: str, level: str) -> List[Dict[str, Any]]:
        """Return mock learning resources for development."""
        return [
            {
                "title": f"Learn {skill.title()} - {level.title()} Course",
                "provider": "Online Learning Platform",
                "url": f"https://example.com/{skill}-{level}",
                "type": "course",
                "duration": "8 weeks",
                "cost": "₹2,999",
                "rating": 4.5,
                "difficulty_level": level,
                "skills_covered": [skill]
            }
        ]
    
    async def health_check(self) -> bool:
        """Check if BigQuery service is healthy."""
        try:
            client = self._get_client()
            # Simple health check query
            query = f"SELECT 1 as health_check"
            query_job = client.query(query)
            list(query_job.result())
            return True
        except Exception as e:
            logger.error(f"BigQuery health check failed: {e}")
            return False