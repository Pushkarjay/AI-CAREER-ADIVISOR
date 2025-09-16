"""Career Match Agent - Queries BigQuery for career matches and ranks opportunities."""

from typing import Dict, Any, List
import asyncio
from datetime import datetime

from .base_agent import BaseAgent, AgentInput
from services.bigquery_service import BigQueryService
from services.gemini_service_mock import GeminiService
from models.career import CareerMatch, Career


class CareerMatchAgent(BaseAgent):
    """Agent responsible for matching users with suitable career opportunities."""
    
    def __init__(self):
        super().__init__(
            name="career_match_agent",
            description="Matches users with suitable careers based on skills, interests, and market demand"
        )
        self.bigquery = BigQueryService()
        self.gemini = GeminiService()
    
    async def _process(self, input_data: AgentInput) -> Dict[str, Any]:
        """Process career matching for a user."""
        user_id = input_data.user_id
        user_profile = input_data.data.get("user_profile", {})
        context = input_data.context
        
        result = {
            "career_matches": [],
            "matching_methodology": "",
            "confidence_scores": {},
            "market_insights": {}
        }
        
        # Extract user preferences and skills
        user_skills = user_profile.get("skills", [])
        user_interests = user_profile.get("interests", [])
        preferred_industries = user_profile.get("preferred_industries", [])
        experience_level = self._determine_experience_level(user_profile)
        
        # Query careers from BigQuery
        candidate_careers = await self._query_careers(
            skills=user_skills,
            interests=user_interests,
            industries=preferred_industries,
            experience_level=experience_level
        )
        
        # Calculate match scores for each career
        career_matches = []
        for career in candidate_careers:
            match_score = await self._calculate_match_score(user_profile, career)
            
            if match_score["total_score"] > 30:  # Minimum threshold
                career_match = CareerMatch(
                    career=career,
                    match_score=match_score["total_score"],
                    skill_match_percentage=match_score["skill_match"],
                    missing_skills=match_score["missing_skills"],
                    matching_skills=match_score["matching_skills"],
                    recommendation_reason=match_score["reasoning"]
                )
                career_matches.append(career_match)
        
        # Sort by match score and limit results
        career_matches.sort(key=lambda x: x.match_score, reverse=True)
        result["career_matches"] = career_matches[:10]  # Top 10 matches
        
        # Generate AI-powered insights
        if career_matches:
            insights = await self._generate_market_insights(user_profile, career_matches[:5])
            result["market_insights"] = insights
        
        # Set methodology
        result["matching_methodology"] = self._get_methodology_description()
        
        # Calculate confidence scores
        result["confidence_scores"] = await self._calculate_matching_confidence(career_matches)
        
        return result
    
    async def _query_careers(self, skills: List[str], interests: List[str], 
                            industries: List[str], experience_level: str) -> List[Career]:
        """Query careers from BigQuery based on user criteria."""
        try:
            # Build query parameters
            query_params = {
                "skills": skills,
                "interests": interests,
                "industries": industries if industries else ["technology", "finance", "healthcare"],
                "experience_level": experience_level,
                "limit": 50
            }
            
            # Execute BigQuery query
            careers_data = await self.bigquery.query_careers(query_params)
            
            # Convert to Career objects
            careers = []
            for career_data in careers_data:
                career = Career(**career_data)
                careers.append(career)
            
            return careers
            
        except Exception as e:
            self.logger.error(f"Failed to query careers: {e}")
            return []
    
    async def _calculate_match_score(self, user_profile: Dict[str, Any], career: Career) -> Dict[str, Any]:
        """Calculate comprehensive match score between user and career."""
        # Initialize scoring components
        skill_score = 0.0
        interest_score = 0.0
        industry_score = 0.0
        education_score = 0.0
        experience_score = 0.0
        
        # User data
        user_skills = set(skill.lower() for skill in user_profile.get("skills", []))
        user_interests = set(interest.lower() for interest in user_profile.get("interests", []))
        user_industries = set(industry.lower() for industry in user_profile.get("preferred_industries", []))
        user_education = user_profile.get("education_level", "").lower()
        user_experience = user_profile.get("experience_years", 0)
        
        # Career requirements
        required_skills = set(skill.lower() for skill in career.required_skills)
        preferred_skills = set(skill.lower() for skill in career.preferred_skills)
        all_career_skills = required_skills.union(preferred_skills)
        
        # 1. Skill matching (40% of total score)
        if all_career_skills:
            matching_skills = user_skills.intersection(all_career_skills)
            required_matching = user_skills.intersection(required_skills)
            
            skill_score = (
                (len(matching_skills) / len(all_career_skills)) * 70 +
                (len(required_matching) / max(len(required_skills), 1)) * 30
            )
        
        # 2. Interest alignment (25% of total score)
        career_keywords = set(word.lower() for word in career.title.split() + career.description.split()[:20])
        interest_matches = sum(1 for interest in user_interests if any(keyword in interest for keyword in career_keywords))
        if user_interests:
            interest_score = min((interest_matches / len(user_interests)) * 100, 100)
        
        # 3. Industry preference (15% of total score)
        if user_industries:
            if career.industry.lower() in user_industries:
                industry_score = 100
            else:
                industry_score = 50  # Partial score for exploring new industries
        else:
            industry_score = 80  # No penalty if no preference specified
        
        # 4. Education alignment (10% of total score)
        education_mapping = {
            "high school": 1,
            "diploma": 2,
            "bachelor": 3,
            "master": 4,
            "phd": 5
        }
        
        user_edu_level = education_mapping.get(user_education, 3)
        required_edu = career.education_requirements[0] if career.education_requirements else "bachelor"
        required_edu_level = education_mapping.get(required_edu.lower(), 3)
        
        if user_edu_level >= required_edu_level:
            education_score = 100
        elif user_edu_level == required_edu_level - 1:
            education_score = 70
        else:
            education_score = 40
        
        # 5. Experience alignment (10% of total score)
        experience_mapping = {
            "entry": (0, 2),
            "mid": (2, 8),
            "senior": (8, 15),
            "executive": (15, 50)
        }
        
        exp_range = experience_mapping.get(career.experience_level.lower(), (0, 2))
        if exp_range[0] <= user_experience <= exp_range[1]:
            experience_score = 100
        elif user_experience < exp_range[0]:
            experience_score = max(60 - (exp_range[0] - user_experience) * 10, 20)
        else:
            experience_score = max(80 - (user_experience - exp_range[1]) * 5, 50)
        
        # Calculate weighted total score
        total_score = (
            skill_score * 0.40 +
            interest_score * 0.25 +
            industry_score * 0.15 +
            education_score * 0.10 +
            experience_score * 0.10
        )
        
        # Generate reasoning
        reasoning = self._generate_match_reasoning(
            skill_score, interest_score, industry_score, 
            education_score, experience_score, career
        )
        
        return {
            "total_score": round(total_score, 2),
            "skill_match": round(skill_score, 2),
            "matching_skills": list(user_skills.intersection(all_career_skills)),
            "missing_skills": list(required_skills - user_skills),
            "reasoning": reasoning,
            "component_scores": {
                "skills": skill_score,
                "interests": interest_score,
                "industry": industry_score,
                "education": education_score,
                "experience": experience_score
            }
        }
    
    async def _generate_market_insights(self, user_profile: Dict[str, Any], 
                                      top_matches: List[CareerMatch]) -> Dict[str, Any]:
        """Generate AI-powered market insights using Gemini."""
        try:
            # Prepare context for Gemini
            context = {
                "user_profile": user_profile,
                "top_careers": [match.career.title for match in top_matches],
                "skills": user_profile.get("skills", []),
                "location": user_profile.get("location", "India")
            }
            
            prompt = f"""
            Analyze the career market for a student with the following profile:
            - Skills: {', '.join(context['skills'])}
            - Location: {context['location']}
            - Top career matches: {', '.join(context['top_careers'])}
            
            Provide insights on:
            1. Market demand for these careers in India
            2. Salary expectations
            3. Growth trends
            4. Geographic opportunities
            5. Key recommendations
            
            Keep response concise and actionable.
            """
            
            insights = await self.gemini.generate_insights(prompt)
            
            return {
                "market_analysis": insights.get("analysis", ""),
                "salary_insights": insights.get("salary", ""),
                "growth_trends": insights.get("trends", ""),
                "recommendations": insights.get("recommendations", [])
            }
            
        except Exception as e:
            self.logger.error(f"Failed to generate market insights: {e}")
            return {"error": "Could not generate market insights"}
    
    def _determine_experience_level(self, user_profile: Dict[str, Any]) -> str:
        """Determine user's experience level."""
        experience_years = user_profile.get("experience_years", 0)
        current_year = user_profile.get("current_year", 1)
        
        if experience_years == 0 and current_year <= 2:
            return "entry"
        elif experience_years <= 2:
            return "entry"
        elif experience_years <= 7:
            return "mid"
        elif experience_years <= 15:
            return "senior"
        else:
            return "executive"
    
    def _generate_match_reasoning(self, skill_score: float, interest_score: float, 
                                 industry_score: float, education_score: float, 
                                 experience_score: float, career: Career) -> str:
        """Generate human-readable reasoning for the match."""
        reasons = []
        
        if skill_score > 70:
            reasons.append("Strong skill alignment")
        elif skill_score > 40:
            reasons.append("Good skill foundation with room to grow")
        else:
            reasons.append("Developing skills required")
        
        if interest_score > 60:
            reasons.append("aligns with your interests")
        
        if industry_score > 80:
            reasons.append("matches your preferred industry")
        
        if education_score > 80:
            reasons.append("education requirements are met")
        
        if experience_score > 80:
            reasons.append("experience level is appropriate")
        
        base_reason = f"This career {', '.join(reasons[:3])}."
        
        if career.growth_potential > 7:
            base_reason += " High growth potential in the market."
        
        return base_reason
    
    def _get_methodology_description(self) -> str:
        """Get description of the matching methodology."""
        return """
        Career matching algorithm considers:
        - Skill alignment (40%): Required vs preferred skills match
        - Interest compatibility (25%): Profile interests vs career keywords
        - Industry preference (15%): Stated industry preferences
        - Education fit (10%): Education requirements vs user qualifications
        - Experience level (10%): Experience requirements vs user background
        
        Weighted scoring provides personalized career recommendations with explanations.
        """
    
    async def _calculate_matching_confidence(self, career_matches: List[CareerMatch]) -> Dict[str, Any]:
        """Calculate confidence metrics for the matching process."""
        if not career_matches:
            return {"overall": 0.0, "data_quality": 0.0, "match_diversity": 0.0}
        
        # Overall confidence based on top match scores
        top_scores = [match.match_score for match in career_matches[:5]]
        avg_top_score = sum(top_scores) / len(top_scores) if top_scores else 0
        
        # Data quality confidence
        data_quality = 0.8 if len(career_matches) >= 5 else 0.6
        
        # Match diversity (different industries/roles)
        industries = set(match.career.industry for match in career_matches[:10])
        diversity = min(len(industries) / 5, 1.0)  # Ideal: 5 different industries
        
        overall_confidence = (avg_top_score / 100) * 0.5 + data_quality * 0.3 + diversity * 0.2
        
        return {
            "overall": round(overall_confidence, 3),
            "data_quality": round(data_quality, 3),
            "match_diversity": round(diversity, 3),
            "top_match_score": round(avg_top_score, 2) if top_scores else 0
        }
    
    def _calculate_confidence(self, result: Dict[str, Any]) -> float:
        """Calculate overall confidence score for the agent."""
        return result.get("confidence_scores", {}).get("overall", 0.5)