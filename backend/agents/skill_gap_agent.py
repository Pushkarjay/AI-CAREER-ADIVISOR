"""Skill Gap Agent - Analyzes missing skills and creates learning roadmaps."""

from typing import Dict, Any, List
from datetime import datetime, timedelta

from .base_agent import BaseAgent, AgentInput
from services.bigquery_service import BigQueryService
from services.gemini_service_mock import GeminiService
from models.career import SkillGap, SkillGapAnalysis


class SkillGapAgent(BaseAgent):
    """Agent responsible for analyzing skill gaps and creating learning roadmaps."""
    
    def __init__(self):
        super().__init__(
            name="skill_gap_agent",
            description="Analyzes skill gaps between user capabilities and career requirements"
        )
        self.bigquery = BigQueryService()
        self.gemini = GeminiService()
    
    async def _process(self, input_data: AgentInput) -> Dict[str, Any]:
        """Process skill gap analysis for a user and target career."""
        user_id = input_data.user_id
        user_profile = input_data.data.get("user_profile", {})
        target_career = input_data.data.get("target_career")
        context = input_data.context
        
        if not target_career:
            raise ValueError("target_career is required for skill gap analysis")
        
        result = {
            "skill_gaps": [],
            "overall_readiness": 0.0,
            "learning_roadmap": {},
            "priority_skills": [],
            "time_estimates": {}
        }
        
        # Get user's current skills with proficiency levels
        user_skills = await self._get_user_skill_proficiency(user_profile)
        
        # Get required skills for target career
        career_skills = await self._get_career_skill_requirements(target_career)
        
        # Analyze gaps for each required skill
        skill_gaps = []
        for skill_req in career_skills:
            gap = await self._analyze_single_skill_gap(skill_req, user_skills)
            skill_gaps.append(gap)
        
        result["skill_gaps"] = skill_gaps
        
        # Calculate overall readiness
        result["overall_readiness"] = await self._calculate_overall_readiness(skill_gaps)
        
        # Create learning roadmap
        result["learning_roadmap"] = await self._create_learning_roadmap(skill_gaps)
        
        # Identify priority skills
        result["priority_skills"] = await self._identify_priority_skills(skill_gaps)
        
        # Estimate learning time
        result["time_estimates"] = await self._estimate_learning_time(skill_gaps)
        
        # Generate AI-powered recommendations
        result["ai_recommendations"] = await self._generate_skill_recommendations(
            user_profile, target_career, skill_gaps
        )
        
        return result
    
    async def _get_user_skill_proficiency(self, user_profile: Dict[str, Any]) -> Dict[str, float]:
        """Get user's current skills with estimated proficiency levels."""
        user_skills = user_profile.get("skills", [])
        experience_years = user_profile.get("experience_years", 0)
        education_level = user_profile.get("education_level", "bachelor")
        
        skill_proficiency = {}
        
        for skill in user_skills:
            # Estimate proficiency based on experience and education
            base_proficiency = self._estimate_base_proficiency(education_level)
            
            # Adjust based on experience
            experience_boost = min(experience_years * 0.5, 3.0)
            
            # Add some variation for different skill types
            skill_type_modifier = self._get_skill_type_modifier(skill)
            
            proficiency = min(base_proficiency + experience_boost + skill_type_modifier, 10.0)
            skill_proficiency[skill.lower()] = round(proficiency, 1)
        
        return skill_proficiency
    
    async def _get_career_skill_requirements(self, career: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get skill requirements for a specific career with importance levels."""
        required_skills = career.get("required_skills", [])
        preferred_skills = career.get("preferred_skills", [])
        
        skill_requirements = []
        
        # Process required skills (high importance)
        for skill in required_skills:
            skill_req = {
                "name": skill.lower(),
                "importance_level": 9.0,
                "required_proficiency": 7.0,
                "skill_type": self._classify_skill_type(skill),
                "is_required": True
            }
            skill_requirements.append(skill_req)
        
        # Process preferred skills (medium importance)
        for skill in preferred_skills:
            if skill.lower() not in [s["name"] for s in skill_requirements]:
                skill_req = {
                    "name": skill.lower(),
                    "importance_level": 6.0,
                    "required_proficiency": 5.0,
                    "skill_type": self._classify_skill_type(skill),
                    "is_required": False
                }
                skill_requirements.append(skill_req)
        
        return skill_requirements
    
    async def _analyze_single_skill_gap(self, skill_req: Dict[str, Any], 
                                       user_skills: Dict[str, float]) -> SkillGap:
        """Analyze gap for a single skill."""
        skill_name = skill_req["name"]
        current_proficiency = user_skills.get(skill_name, 0.0)
        required_proficiency = skill_req["required_proficiency"]
        importance_level = skill_req["importance_level"]
        
        # Calculate gap score
        gap_score = max(required_proficiency - current_proficiency, 0.0)
        
        # Get learning resources for this skill
        learning_resources = await self._get_learning_resources(skill_name, current_proficiency)
        
        return SkillGap(
            skill_name=skill_name,
            importance_level=importance_level,
            current_proficiency=current_proficiency,
            required_proficiency=required_proficiency,
            gap_score=gap_score,
            learning_resources=learning_resources
        )
    
    async def _calculate_overall_readiness(self, skill_gaps: List[SkillGap]) -> float:
        """Calculate overall readiness percentage."""
        if not skill_gaps:
            return 100.0
        
        total_weighted_score = 0.0
        total_weight = 0.0
        
        for gap in skill_gaps:
            # Weight by importance level
            weight = gap.importance_level
            
            # Calculate readiness for this skill (0-100%)
            if gap.required_proficiency > 0:
                skill_readiness = min(gap.current_proficiency / gap.required_proficiency * 100, 100)
            else:
                skill_readiness = 100.0
            
            total_weighted_score += skill_readiness * weight
            total_weight += weight
        
        overall_readiness = total_weighted_score / total_weight if total_weight > 0 else 100.0
        return round(overall_readiness, 1)
    
    async def _create_learning_roadmap(self, skill_gaps: List[SkillGap]) -> Dict[str, Any]:
        """Create a structured learning roadmap."""
        # Group skills by priority and difficulty
        high_priority = []
        medium_priority = []
        low_priority = []
        
        for gap in skill_gaps:
            if gap.gap_score > 5.0 and gap.importance_level > 7.0:
                high_priority.append(gap)
            elif gap.gap_score > 3.0 and gap.importance_level > 5.0:
                medium_priority.append(gap)
            else:
                low_priority.append(gap)
        
        # Sort each priority group by importance
        high_priority.sort(key=lambda x: x.importance_level, reverse=True)
        medium_priority.sort(key=lambda x: x.importance_level, reverse=True)
        low_priority.sort(key=lambda x: x.importance_level, reverse=True)
        
        roadmap = {
            "phase_1_immediate": {
                "skills": [gap.skill_name for gap in high_priority[:3]],
                "duration_weeks": 8,
                "description": "Critical skills needed for career entry"
            },
            "phase_2_foundation": {
                "skills": [gap.skill_name for gap in high_priority[3:] + medium_priority[:3]],
                "duration_weeks": 12,
                "description": "Core competency development"
            },
            "phase_3_advanced": {
                "skills": [gap.skill_name for gap in medium_priority[3:] + low_priority],
                "duration_weeks": 16,
                "description": "Advanced skills for career growth"
            }
        }
        
        return roadmap
    
    async def _identify_priority_skills(self, skill_gaps: List[SkillGap]) -> List[str]:
        """Identify the top priority skills to focus on."""
        # Calculate priority score: gap_score * importance_level
        prioritized_gaps = []
        
        for gap in skill_gaps:
            priority_score = gap.gap_score * gap.importance_level
            prioritized_gaps.append((gap.skill_name, priority_score))
        
        # Sort by priority score and return top 5
        prioritized_gaps.sort(key=lambda x: x[1], reverse=True)
        return [skill for skill, _ in prioritized_gaps[:5]]
    
    async def _estimate_learning_time(self, skill_gaps: List[SkillGap]) -> Dict[str, Any]:
        """Estimate time required to close skill gaps."""
        total_weeks = 0
        skill_estimates = {}
        
        for gap in skill_gaps:
            # Base time estimation formula
            base_hours = gap.gap_score * 10  # 10 hours per gap point
            
            # Adjust based on skill type
            skill_type_multiplier = {
                "technical": 1.2,
                "soft": 0.8,
                "domain": 1.0,
                "language": 1.5
            }.get(gap.learning_resources[0].get("skill_type", "domain"), 1.0) if gap.learning_resources else 1.0
            
            estimated_hours = base_hours * skill_type_multiplier
            estimated_weeks = max(estimated_hours / 10, 1)  # Assuming 10 hours/week study
            
            skill_estimates[gap.skill_name] = {
                "hours": round(estimated_hours),
                "weeks": round(estimated_weeks)
            }
            
            total_weeks += estimated_weeks
        
        return {
            "total_weeks": round(total_weeks),
            "total_hours": sum(est["hours"] for est in skill_estimates.values()),
            "skill_breakdown": skill_estimates,
            "intensive_weeks": round(total_weeks * 0.7),  # If studying intensively
            "part_time_weeks": round(total_weeks * 1.5)   # If studying part-time
        }
    
    async def _generate_skill_recommendations(self, user_profile: Dict[str, Any], 
                                             target_career: Dict[str, Any], 
                                             skill_gaps: List[SkillGap]) -> Dict[str, Any]:
        """Generate AI-powered skill development recommendations."""
        try:
            # Prepare context for Gemini
            context = {
                "user_background": user_profile.get("education_level", ""),
                "current_skills": user_profile.get("skills", []),
                "target_career": target_career.get("title", ""),
                "major_gaps": [gap.skill_name for gap in skill_gaps if gap.gap_score > 4.0]
            }
            
            prompt = f"""
            Create personalized skill development recommendations for:
            
            Background: {context['user_background']} student
            Current Skills: {', '.join(context['current_skills'])}
            Target Career: {context['target_career']}
            Major Skill Gaps: {', '.join(context['major_gaps'])}
            
            Provide:
            1. Learning strategy tailored to their background
            2. Recommended order for skill development
            3. Tips for accelerated learning
            4. How to practice and build portfolio
            5. Common pitfalls to avoid
            
            Keep recommendations practical and actionable for Indian students.
            """
            
            recommendations = await self.gemini.generate_recommendations(prompt)
            
            return {
                "learning_strategy": recommendations.get("strategy", ""),
                "skill_order": recommendations.get("order", []),
                "learning_tips": recommendations.get("tips", []),
                "portfolio_advice": recommendations.get("portfolio", ""),
                "pitfalls": recommendations.get("pitfalls", [])
            }
            
        except Exception as e:
            self.logger.error(f"Failed to generate skill recommendations: {e}")
            return {"error": "Could not generate recommendations"}
    
    def _estimate_base_proficiency(self, education_level: str) -> float:
        """Estimate base proficiency based on education level."""
        education_mapping = {
            "high school": 2.0,
            "diploma": 3.0,
            "bachelor": 4.0,
            "master": 5.0,
            "phd": 6.0
        }
        return education_mapping.get(education_level.lower(), 4.0)
    
    def _get_skill_type_modifier(self, skill: str) -> float:
        """Get modifier based on skill type."""
        skill_lower = skill.lower()
        
        if any(word in skill_lower for word in ["python", "java", "javascript", "coding", "programming"]):
            return 1.0  # Technical skills get base modifier
        elif any(word in skill_lower for word in ["communication", "leadership", "teamwork"]):
            return 0.5  # Soft skills assumed to be more developed
        elif any(word in skill_lower for word in ["ai", "machine learning", "blockchain"]):
            return -0.5  # Emerging tech skills may be less developed
        else:
            return 0.0  # Default modifier
    
    def _classify_skill_type(self, skill: str) -> str:
        """Classify skill into categories."""
        skill_lower = skill.lower()
        
        if any(word in skill_lower for word in ["python", "java", "javascript", "sql", "programming"]):
            return "technical"
        elif any(word in skill_lower for word in ["communication", "leadership", "management"]):
            return "soft"
        elif any(word in skill_lower for word in ["english", "hindi", "spanish"]):
            return "language"
        else:
            return "domain"
    
    async def _get_learning_resources(self, skill_name: str, current_level: float) -> List[Dict[str, Any]]:
        """Get learning resources for a specific skill."""
        # This would typically query a database of learning resources
        # For now, return a mock structure
        return [
            {
                "type": "course",
                "title": f"Learn {skill_name.title()}",
                "provider": "Online Platform",
                "duration": "4-6 weeks",
                "difficulty": "beginner" if current_level < 3 else "intermediate",
                "skill_type": self._classify_skill_type(skill_name)
            }
        ]
    
    def _calculate_confidence(self, result: Dict[str, Any]) -> float:
        """Calculate overall confidence score for the agent."""
        # Base confidence on data quality and analysis completeness
        skill_gaps = result.get("skill_gaps", [])
        
        if not skill_gaps:
            return 0.3
        
        # Higher confidence with more comprehensive analysis
        data_quality = min(len(skill_gaps) / 10, 1.0)  # Ideal: 10 skills analyzed
        
        # Check if roadmap was created
        roadmap_quality = 1.0 if result.get("learning_roadmap") else 0.5
        
        # Check if AI recommendations were generated
        ai_quality = 1.0 if result.get("ai_recommendations", {}).get("learning_strategy") else 0.7
        
        overall_confidence = (data_quality * 0.4 + roadmap_quality * 0.3 + ai_quality * 0.3)
        return round(overall_confidence, 3)