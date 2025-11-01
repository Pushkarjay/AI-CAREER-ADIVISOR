"""Market Trends Service - Fetch real market data using Gemini AI."""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)


class MarketTrendsService:
    """Service to fetch real-time market trends and career insights using Gemini AI."""
    
    def __init__(self):
        """Initialize the market trends service."""
        self.gemini_service = None
        logger.info("MarketTrendsService initialized")
    
    def _get_gemini_service(self):
        """Lazy load Gemini service."""
        if self.gemini_service is None:
            from services.gemini_service import GeminiService
            self.gemini_service = GeminiService()
        return self.gemini_service
    
    async def get_general_market_trends(self) -> Dict[str, Any]:
        """
        Fetch general Indian job market trends using Gemini AI.
        Returns comprehensive market analysis including skills, industries, locations, etc.
        """
        try:
            gemini = self._get_gemini_service()
            
            prompt = """
            You are a career market analyst focusing on the Indian job market (2024-2025).
            
            Provide a comprehensive, data-driven analysis of current market trends in JSON format.
            Use real-world insights and current industry trends.
            
            CRITICAL: Return ONLY valid JSON - no markdown, no ```json blocks, no explanations.
            
            Required JSON structure:
            {
              "skill_demand": [
                {
                  "skill": "Skill name",
                  "demand_change": "+X%",
                  "avg_salary": "₹X.XL",
                  "job_openings": 1234,
                  "trend": "rising|stable|declining",
                  "industries": ["Industry1", "Industry2"]
                }
              ],
              "industry_growth": [
                {
                  "industry": "Industry name",
                  "growth_rate": "+X%",
                  "job_openings": 12345,
                  "avg_salary_range": "₹XL - ₹YL",
                  "hot_roles": ["Role1", "Role2"],
                  "outlook": "Positive|Neutral|Cautious"
                }
              ],
              "location_insights": [
                {
                  "city": "City name",
                  "avg_salary": "₹X.XL",
                  "job_count": 12345,
                  "growth_rate": "+X%",
                  "cost_of_living": "High|Medium|Low",
                  "top_industries": ["Industry1", "Industry2"],
                  "remote_opportunities": "X%"
                }
              ],
              "emerging_roles": [
                {
                  "role": "Role name",
                  "growth": "+X%",
                  "avg_salary": "₹XL",
                  "demand_score": 8.5,
                  "required_skills": ["Skill1", "Skill2"],
                  "experience_needed": "X years",
                  "description": "Brief description"
                }
              ],
              "market_trends": [
                {
                  "month": "Jan 2024",
                  "job_openings": 12345,
                  "applications": 98765,
                  "hiring_rate": "X%"
                },
                {
                  "month": "Feb 2024",
                  "job_openings": 12345,
                  "applications": 98765,
                  "hiring_rate": "X%"
                }
              ],
              "top_skills": [
                {
                  "skill": "Skill name",
                  "demand": 9.2,
                  "growth": "+X%",
                  "avg_salary_boost": "+X%"
                }
              ],
              "salary_trends": {
                "technology": {
                  "avg_increase": "X%",
                  "entry_level": "₹X-YL",
                  "mid_level": "₹X-YL",
                  "senior_level": "₹X-YL"
                },
                "finance": {
                  "avg_increase": "X%",
                  "entry_level": "₹X-YL",
                  "mid_level": "₹X-YL",
                  "senior_level": "₹X-YL"
                },
                "healthcare": {
                  "avg_increase": "X%",
                  "entry_level": "₹X-YL",
                  "mid_level": "₹X-YL",
                  "senior_level": "₹X-YL"
                }
              },
              "remote_work_trends": {
                "percentage": "X%",
                "growth": "+X%",
                "popular_sectors": ["Sector1", "Sector2"],
                "salary_comparison": "Remote vs Office: +X%"
              },
              "hiring_trends": {
                "total_openings": 123456,
                "month_over_month": "+X%",
                "year_over_year": "+X%",
                "fastest_hiring": ["Industry1", "Industry2"]
              },
              "insights": {
                "summary": "Brief market summary",
                "opportunities": ["Opportunity 1", "Opportunity 2"],
                "challenges": ["Challenge 1", "Challenge 2"],
                "recommendations": ["Recommendation 1", "Recommendation 2"]
              },
              "generated_at": "2024-XX-XXTXX:XX:XX"
            }
            
            Focus on:
            - Technology sector (AI/ML, Cloud, Web Dev, Data Science, DevOps)
            - Tier 1 & Tier 2 Indian cities
            - Entry to Mid-level roles
            - Current 2024-2025 trends
            - Realistic Indian salary ranges (in Lakhs per annum)
            
            Provide at least:
            - 8-10 skills in skill_demand
            - 5-6 industries in industry_growth
            - 6-8 cities in location_insights
            - 5-6 emerging roles
            - 6 months of market_trends data
            - 8-10 top_skills
            
            RETURN ONLY THE JSON - NO EXTRA TEXT OR MARKDOWN.
            """
            
            response = await gemini._generate_text(prompt)
            parsed_trends = self._parse_json_response(response["text"])
            
            # Add generation timestamp
            if "generated_at" not in parsed_trends:
                parsed_trends["generated_at"] = datetime.now().isoformat()
            
            logger.info("Successfully generated general market trends")
            return parsed_trends
            
        except Exception as e:
            logger.error(f"Failed to get general market trends: {e}")
            # Return fallback data
            return self._get_fallback_market_trends()
    
    async def get_career_specific_trends(
        self, 
        career_title: str,
        career_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Fetch market trends specific to a career using Gemini AI.
        
        Args:
            career_title: The title of the career
            career_data: Optional additional career data for context
        
        Returns:
            Dict containing career-specific market trends
        """
        try:
            gemini = self._get_gemini_service()
            
            # Extract career context
            industry = career_data.get("industry", "technology") if career_data else "technology"
            required_skills = career_data.get("required_skills", []) if career_data else []
            
            prompt = f"""
            You are a career market analyst focusing on the Indian job market.
            
            Provide detailed market trends and insights for: {career_title} ({industry})
            Required Skills Context: {', '.join(required_skills[:10])}
            
            CRITICAL: Return ONLY valid JSON - no markdown, no ```json blocks, no explanations.
            
            Required JSON structure:
            {{
              "career_overview": {{
                "title": "{career_title}",
                "industry": "{industry}",
                "current_demand": "High|Medium|Low",
                "demand_score": 8.5,
                "growth_outlook": "Excellent|Good|Stable|Declining",
                "market_summary": "2-3 sentence summary"
              }},
              "salary_insights": {{
                "entry_level": {{
                  "min": "₹XL",
                  "max": "₹YL",
                  "avg": "₹ZL",
                  "percentile_25": "₹XL",
                  "percentile_75": "₹YL"
                }},
                "mid_level": {{
                  "min": "₹XL",
                  "max": "₹YL",
                  "avg": "₹ZL",
                  "percentile_25": "₹XL",
                  "percentile_75": "₹YL"
                }},
                "senior_level": {{
                  "min": "₹XL",
                  "max": "₹YL",
                  "avg": "₹ZL",
                  "percentile_25": "₹XL",
                  "percentile_75": "₹YL"
                }},
                "salary_growth": "+X% YoY",
                "top_paying_companies": ["Company1", "Company2", "Company3"],
                "location_variance": {{
                  "bangalore": "₹XL",
                  "mumbai": "₹XL",
                  "delhi": "₹XL",
                  "pune": "₹XL",
                  "hyderabad": "₹XL"
                }}
              }},
              "demand_analysis": {{
                "job_openings": 12345,
                "month_over_month": "+X%",
                "year_over_year": "+X%",
                "hiring_velocity": "Fast|Moderate|Slow",
                "competition_level": "High|Medium|Low",
                "time_to_hire": "X weeks",
                "top_hiring_companies": ["Company1", "Company2", "Company3"]
              }},
              "skills_in_demand": [
                {{
                  "skill": "Skill name",
                  "importance": "Critical|Important|Beneficial",
                  "demand_growth": "+X%",
                  "salary_premium": "+X%",
                  "market_penetration": "X%"
                }}
              ],
              "location_trends": [
                {{
                  "city": "City name",
                  "job_count": 1234,
                  "avg_salary": "₹XL",
                  "growth_rate": "+X%",
                  "major_employers": ["Company1", "Company2"],
                  "remote_options": "X%"
                }}
              ],
              "industry_trends": {{
                "key_drivers": ["Driver 1", "Driver 2"],
                "emerging_specializations": ["Specialization 1", "Specialization 2"],
                "technology_impact": "Description of tech impact",
                "future_outlook": "Description of future",
                "disruption_factors": ["Factor 1", "Factor 2"]
              }},
              "career_progression": [
                {{
                  "level": "Entry Level",
                  "typical_titles": ["Title1", "Title2"],
                  "years": "0-2",
                  "salary_range": "₹X-YL",
                  "key_skills": ["Skill1", "Skill2"]
                }},
                {{
                  "level": "Mid Level",
                  "typical_titles": ["Title1", "Title2"],
                  "years": "2-5",
                  "salary_range": "₹X-YL",
                  "key_skills": ["Skill1", "Skill2"]
                }},
                {{
                  "level": "Senior Level",
                  "typical_titles": ["Title1", "Title2"],
                  "years": "5-8",
                  "salary_range": "₹X-YL",
                  "key_skills": ["Skill1", "Skill2"]
                }},
                {{
                  "level": "Lead Level",
                  "typical_titles": ["Title1", "Title2"],
                  "years": "8+",
                  "salary_range": "₹X-YL",
                  "key_skills": ["Skill1", "Skill2"]
                }}
              ],
              "hiring_patterns": {{
                "peak_hiring_months": ["Month1", "Month2"],
                "average_applications_per_role": 123,
                "interview_to_offer_ratio": "X:1",
                "common_interview_rounds": 3,
                "typical_hiring_timeline": "X weeks"
              }},
              "market_insights": {{
                "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
                "challenges": ["Challenge 1", "Challenge 2"],
                "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
                "success_factors": ["Factor 1", "Factor 2", "Factor 3"]
              }},
              "related_careers": [
                {{
                  "title": "Related Career",
                  "similarity": "X%",
                  "transition_difficulty": "Easy|Moderate|Hard",
                  "avg_salary": "₹XL"
                }}
              ],
              "generated_at": "2024-XX-XXTXX:XX:XX"
            }}
            
            Focus on Indian market context:
            - Realistic salary ranges in Indian Rupees (Lakhs per annum)
            - Major Indian cities and hiring hubs
            - Top Indian companies and MNCs in India
            - Current 2024-2025 market conditions
            - Tier 1 & Tier 2 city opportunities
            
            Provide data-driven, realistic insights based on current market trends.
            
            RETURN ONLY THE JSON - NO EXTRA TEXT OR MARKDOWN.
            """
            
            response = await gemini._generate_text(prompt)
            parsed_trends = self._parse_json_response(response["text"])
            
            # Add generation timestamp
            if "generated_at" not in parsed_trends:
                parsed_trends["generated_at"] = datetime.now().isoformat()
            
            logger.info(f"Successfully generated career-specific trends for {career_title}")
            return parsed_trends
            
        except Exception as e:
            logger.error(f"Failed to get career-specific trends for {career_title}: {e}")
            # Return fallback data
            return self._get_fallback_career_trends(career_title)
    
    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """Parse JSON response from text, handling markdown code blocks."""
        try:
            # Remove markdown code blocks if present
            if "```json" in response_text:
                start = response_text.find("```json") + 7
                end = response_text.rfind("```")
                if end > start:
                    response_text = response_text[start:end].strip()
            elif "```" in response_text:
                start = response_text.find("```") + 3
                end = response_text.rfind("```")
                if end > start:
                    response_text = response_text[start:end].strip()
            
            # Try to parse the JSON
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse JSON: {e}. Attempting fallback parsing.")
            # Try to extract JSON from response
            if "{" in response_text and "}" in response_text:
                try:
                    start = response_text.find("{")
                    end = response_text.rfind("}") + 1
                    json_text = response_text[start:end]
                    return json.loads(json_text)
                except:
                    pass
            
            # Last resort: return empty structure
            return {}
        except Exception as e:
            logger.error(f"Unexpected error parsing JSON: {e}")
            return {}
    
    def _get_fallback_market_trends(self) -> Dict[str, Any]:
        """Return fallback market trends data if Gemini fails."""
        return {
            "skill_demand": [
                {"skill": "Python", "demand_change": "+35%", "avg_salary": "₹8.5L", "job_openings": 15000, "trend": "rising"},
                {"skill": "React", "demand_change": "+28%", "avg_salary": "₹7.2L", "job_openings": 12000, "trend": "rising"},
                {"skill": "AWS", "demand_change": "+45%", "avg_salary": "₹12.0L", "job_openings": 10000, "trend": "rising"},
                {"skill": "Machine Learning", "demand_change": "+60%", "avg_salary": "₹15.0L", "job_openings": 8000, "trend": "rising"}
            ],
            "industry_growth": [
                {"industry": "Technology", "growth_rate": "+25%", "job_openings": 450000, "avg_salary_range": "₹5L - ₹25L"},
                {"industry": "Finance", "growth_rate": "+15%", "job_openings": 200000, "avg_salary_range": "₹4L - ₹20L"},
                {"industry": "Healthcare", "growth_rate": "+20%", "job_openings": 180000, "avg_salary_range": "₹3L - ₹15L"}
            ],
            "location_insights": [
                {"city": "Bangalore", "avg_salary": "₹12.5L", "job_count": 25000, "growth_rate": "+30%"},
                {"city": "Mumbai", "avg_salary": "₹11.8L", "job_count": 22000, "growth_rate": "+25%"},
                {"city": "Delhi", "avg_salary": "₹11.2L", "job_count": 20000, "growth_rate": "+22%"},
                {"city": "Pune", "avg_salary": "₹9.5L", "job_count": 15000, "growth_rate": "+28%"}
            ],
            "emerging_roles": [
                {"role": "AI/ML Engineer", "growth": "+65%", "avg_salary": "₹18L", "demand_score": 9.5},
                {"role": "Cloud Architect", "growth": "+40%", "avg_salary": "₹22L", "demand_score": 9.0},
                {"role": "Data Scientist", "growth": "+35%", "avg_salary": "₹16L", "demand_score": 8.8}
            ],
            "generated_at": datetime.now().isoformat(),
            "note": "Using fallback data - Gemini API unavailable"
        }
    
    def _get_fallback_career_trends(self, career_title: str) -> Dict[str, Any]:
        """Return fallback career-specific trends data if Gemini fails."""
        return {
            "career_overview": {
                "title": career_title,
                "current_demand": "High",
                "demand_score": 8.5,
                "market_summary": f"Strong demand for {career_title} in Indian market."
            },
            "salary_insights": {
                "entry_level": {"min": "₹4L", "max": "₹8L", "avg": "₹6L"},
                "mid_level": {"min": "₹8L", "max": "₹15L", "avg": "₹12L"},
                "senior_level": {"min": "₹15L", "max": "₹30L", "avg": "₹22L"}
            },
            "demand_analysis": {
                "job_openings": 5000,
                "hiring_velocity": "Moderate",
                "competition_level": "Medium"
            },
            "generated_at": datetime.now().isoformat(),
            "note": "Using fallback data - Gemini API unavailable"
        }


# Global service instance
market_trends_service = MarketTrendsService()
