"""Resource Suggest Agent - Suggests courses, certifications, and internships."""

from typing import Dict, Any, List
from datetime import datetime

from .base_agent import BaseAgent, AgentInput
from services.bigquery_service import BigQueryService
from services.gemini_service_mock import GeminiService
from models.career import LearningResource, ResourceRecommendation


class ResourceSuggestAgent(BaseAgent):
    """Agent responsible for suggesting learning resources, courses, and opportunities."""
    
    def __init__(self):
        super().__init__(
            name="resource_suggest_agent",
            description="Suggests personalized learning resources, courses, certifications, and internships"
        )
        self.bigquery = BigQueryService()
        self.gemini = GeminiService()
    
    async def _process(self, input_data: AgentInput) -> Dict[str, Any]:
        """Process resource suggestions for a user."""
        user_id = input_data.user_id
        user_profile = input_data.data.get("user_profile", {})
        skill_gaps = input_data.data.get("skill_gaps", [])
        target_career = input_data.data.get("target_career")
        context = input_data.context
        
        result = {
            "course_recommendations": [],
            "certification_recommendations": [],
            "internship_opportunities": [],
            "project_ideas": [],
            "personalization_factors": [],
            "resource_roadmap": {}
        }
        
        # Extract user preferences and constraints
        user_location = user_profile.get("location", "India")
        budget_preference = self._infer_budget_preference(user_profile)
        learning_style = self._infer_learning_style(user_profile)
        time_availability = self._infer_time_availability(user_profile)
        
        # Get skill-specific recommendations
        for skill_gap in skill_gaps:
            if skill_gap.get("gap_score", 0) > 2.0:  # Focus on significant gaps
                skill_resources = await self._get_skill_specific_resources(
                    skill_gap["skill_name"], 
                    skill_gap.get("current_proficiency", 0),
                    user_location,
                    budget_preference
                )
                
                result["course_recommendations"].extend(skill_resources["courses"])
                result["certification_recommendations"].extend(skill_resources["certifications"])
        
        # Get career-specific opportunities
        if target_career:
            career_opportunities = await self._get_career_specific_opportunities(
                target_career, user_profile, user_location
            )
            result["internship_opportunities"] = career_opportunities["internships"]
            result["project_ideas"] = career_opportunities["projects"]
        
        # Create personalized roadmap
        result["resource_roadmap"] = await self._create_resource_roadmap(
            result["course_recommendations"],
            result["certification_recommendations"],
            user_profile
        )
        
        # Generate AI-powered recommendations
        result["ai_suggestions"] = await self._generate_ai_suggestions(
            user_profile, skill_gaps, target_career
        )
        
        # Set personalization factors
        result["personalization_factors"] = [
            f"Location: {user_location}",
            f"Budget: {budget_preference}",
            f"Learning style: {learning_style}",
            f"Time availability: {time_availability}"
        ]
        
        # Remove duplicates and rank resources
        result = await self._rank_and_deduplicate_resources(result)
        
        return result
    
    async def _get_skill_specific_resources(self, skill_name: str, current_level: float, 
                                          location: str, budget: str) -> Dict[str, List[LearningResource]]:
        """Get learning resources for a specific skill."""
        try:
            # Query database for resources
            resources_data = await self.bigquery.query_learning_resources(
                skill=skill_name,
                level=self._map_proficiency_to_level(current_level),
                location=location,
                budget=budget
            )
            
            courses = []
            certifications = []
            
            for resource_data in resources_data:
                resource = LearningResource(**resource_data)
                
                if resource.type in ["course", "bootcamp", "tutorial"]:
                    courses.append(resource)
                elif resource.type in ["certification", "certificate"]:
                    certifications.append(resource)
            
            # Add curated resources if database query is limited
            courses.extend(await self._get_curated_courses(skill_name, current_level))
            certifications.extend(await self._get_curated_certifications(skill_name))
            
            return {
                "courses": courses[:5],  # Top 5 courses
                "certifications": certifications[:3]  # Top 3 certifications
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get resources for {skill_name}: {e}")
            return {"courses": [], "certifications": []}
    
    async def _get_career_specific_opportunities(self, career: Dict[str, Any], 
                                               user_profile: Dict[str, Any], 
                                               location: str) -> Dict[str, List[Dict[str, Any]]]:
        """Get internships and project opportunities for a specific career."""
        career_title = career.get("title", "")
        industry = career.get("industry", "")
        
        # Mock data - in production, this would query job boards and internship databases
        internships = [
            {
                "title": f"{career_title} Intern",
                "company": "Tech Company India",
                "location": location,
                "duration": "3-6 months",
                "requirements": career.get("required_skills", [])[:3],
                "application_deadline": "Open",
                "stipend": "₹15,000-25,000/month",
                "type": "internship"
            },
            {
                "title": f"Junior {career_title}",
                "company": "Startup Hub",
                "location": location,
                "duration": "6 months",
                "requirements": career.get("required_skills", [])[:2],
                "application_deadline": "Rolling",
                "stipend": "₹20,000-30,000/month",
                "type": "internship"
            }
        ]
        
        projects = [
            {
                "title": f"Build a {career_title} Portfolio Project",
                "description": f"Create a comprehensive project demonstrating {career_title} skills",
                "skills_demonstrated": career.get("required_skills", [])[:4],
                "estimated_time": "4-6 weeks",
                "difficulty": "intermediate",
                "type": "portfolio"
            },
            {
                "title": f"Open Source {industry} Contribution",
                "description": f"Contribute to open source projects in the {industry} domain",
                "skills_demonstrated": career.get("preferred_skills", [])[:3],
                "estimated_time": "2-3 weeks",
                "difficulty": "beginner",
                "type": "open_source"
            }
        ]
        
        return {"internships": internships, "projects": projects}
    
    async def _get_curated_courses(self, skill_name: str, current_level: float) -> List[LearningResource]:
        """Get curated courses for popular skills."""
        skill_lower = skill_name.lower()
        level = self._map_proficiency_to_level(current_level)
        
        # Curated course database
        course_catalog = {
            "python": [
                {
                    "title": "Python for Everybody Specialization",
                    "provider": "Coursera (University of Michigan)",
                    "url": "https://coursera.org/specializations/python",
                    "type": "course",
                    "duration": "8 months",
                    "cost": "Free (Audit) / ₹3,000/month",
                    "rating": 4.8,
                    "difficulty_level": "beginner",
                    "skills_covered": ["python", "programming", "data structures"]
                },
                {
                    "title": "Complete Python Bootcamp",
                    "provider": "Udemy",
                    "url": "https://udemy.com/course/complete-python-bootcamp",
                    "type": "course",
                    "duration": "22 hours",
                    "cost": "₹3,000-8,000",
                    "rating": 4.6,
                    "difficulty_level": "beginner",
                    "skills_covered": ["python", "programming", "projects"]
                }
            ],
            "machine learning": [
                {
                    "title": "Machine Learning Specialization",
                    "provider": "Coursera (Stanford)",
                    "url": "https://coursera.org/specializations/machine-learning-introduction",
                    "type": "course",
                    "duration": "3 months",
                    "cost": "₹3,000/month",
                    "rating": 4.9,
                    "difficulty_level": "intermediate",
                    "skills_covered": ["machine learning", "python", "algorithms"]
                }
            ],
            "javascript": [
                {
                    "title": "The Complete JavaScript Course",
                    "provider": "Udemy",
                    "url": "https://udemy.com/course/the-complete-javascript-course",
                    "type": "course",
                    "duration": "69 hours",
                    "cost": "₹3,000-8,000",
                    "rating": 4.7,
                    "difficulty_level": "beginner",
                    "skills_covered": ["javascript", "web development", "programming"]
                }
            ]
        }
        
        courses = course_catalog.get(skill_lower, [])
        
        # Filter by difficulty level
        filtered_courses = [
            course for course in courses 
            if course["difficulty_level"] == level or level == "intermediate"
        ]
        
        # Convert to LearningResource objects
        resources = []
        for course_data in filtered_courses:
            resource = LearningResource(**course_data)
            resources.append(resource)
        
        return resources
    
    async def _get_curated_certifications(self, skill_name: str) -> List[LearningResource]:
        """Get curated certifications for popular skills."""
        skill_lower = skill_name.lower()
        
        cert_catalog = {
            "aws": [
                {
                    "title": "AWS Certified Solutions Architect",
                    "provider": "Amazon Web Services",
                    "url": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
                    "type": "certification",
                    "duration": "3-6 months prep",
                    "cost": "$150 USD",
                    "rating": 4.5,
                    "difficulty_level": "intermediate",
                    "skills_covered": ["aws", "cloud", "architecture"]
                }
            ],
            "python": [
                {
                    "title": "Python Institute PCAP Certification",
                    "provider": "Python Institute",
                    "url": "https://pythoninstitute.org/pcap",
                    "type": "certification",
                    "duration": "2-3 months prep",
                    "cost": "$295 USD",
                    "rating": 4.3,
                    "difficulty_level": "intermediate",
                    "skills_covered": ["python", "programming", "oop"]
                }
            ]
        }
        
        certs = cert_catalog.get(skill_lower, [])
        
        resources = []
        for cert_data in certs:
            resource = LearningResource(**cert_data)
            resources.append(resource)
        
        return resources
    
    async def _create_resource_roadmap(self, courses: List[LearningResource], 
                                     certifications: List[LearningResource],
                                     user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Create a structured learning roadmap."""
        time_availability = self._infer_time_availability(user_profile)
        
        # Categorize resources by priority and sequence
        beginner_resources = [r for r in courses if r.difficulty_level == "beginner"]
        intermediate_resources = [r for r in courses if r.difficulty_level == "intermediate"]
        advanced_resources = [r for r in courses if r.difficulty_level == "advanced"]
        
        roadmap = {
            "immediate_start": {
                "resources": beginner_resources[:2],
                "timeline": "0-2 months",
                "description": "Foundation building"
            },
            "skill_development": {
                "resources": intermediate_resources[:2] + beginner_resources[2:],
                "timeline": "2-6 months",
                "description": "Core skill development"
            },
            "certification_phase": {
                "resources": certifications[:2],
                "timeline": "6-9 months",
                "description": "Skill validation and credentials"
            },
            "advanced_mastery": {
                "resources": advanced_resources + certifications[2:],
                "timeline": "9+ months",
                "description": "Advanced skills and specialization"
            }
        }
        
        # Adjust timeline based on time availability
        if time_availability == "part-time":
            for phase in roadmap.values():
                # Extend timeline by 50% for part-time learners
                timeline_parts = phase["timeline"].split("-")
                if len(timeline_parts) == 2:
                    start, end = timeline_parts
                    new_end = str(int(end.replace(" months", "").replace("+", "")) * 1.5)
                    phase["timeline"] = f"{start}-{new_end} months"
        
        return roadmap
    
    async def _generate_ai_suggestions(self, user_profile: Dict[str, Any], 
                                     skill_gaps: List[Dict[str, Any]], 
                                     target_career: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered learning suggestions."""
        try:
            context = {
                "background": user_profile.get("education_level", ""),
                "location": user_profile.get("location", "India"),
                "skills_needed": [gap.get("skill_name", "") for gap in skill_gaps],
                "career_goal": target_career.get("title", "") if target_career else ""
            }
            
            prompt = f"""
            Provide personalized learning recommendations for an Indian student:
            
            Background: {context['background']} student in {context['location']}
            Skills to develop: {', '.join(context['skills_needed'][:5])}
            Career goal: {context['career_goal']}
            
            Suggest:
            1. Best learning platforms for Indian students
            2. Free/affordable alternatives
            3. Local institutions or bootcamps
            4. Practical application strategies
            5. Networking and community resources
            6. Timeline optimization tips
            
            Focus on resources accessible in India with good ROI.
            """
            
            suggestions = await self.gemini.generate_suggestions(prompt)
            
            return {
                "platforms": suggestions.get("platforms", []),
                "affordable_options": suggestions.get("affordable", []),
                "local_resources": suggestions.get("local", []),
                "practical_tips": suggestions.get("practical", []),
                "networking": suggestions.get("networking", []),
                "timeline_tips": suggestions.get("timeline", [])
            }
            
        except Exception as e:
            self.logger.error(f"Failed to generate AI suggestions: {e}")
            return {"error": "Could not generate AI suggestions"}
    
    async def _rank_and_deduplicate_resources(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Rank and remove duplicate resources."""
        # Remove duplicates based on title and provider
        seen_courses = set()
        unique_courses = []
        
        for course in result["course_recommendations"]:
            key = (course.title.lower(), course.provider.lower())
            if key not in seen_courses:
                seen_courses.add(key)
                unique_courses.append(course)
        
        # Rank by rating and relevance
        unique_courses.sort(key=lambda x: (x.rating or 0, x.title), reverse=True)
        result["course_recommendations"] = unique_courses[:10]  # Top 10
        
        # Similar process for certifications
        seen_certs = set()
        unique_certs = []
        
        for cert in result["certification_recommendations"]:
            key = (cert.title.lower(), cert.provider.lower())
            if key not in seen_certs:
                seen_certs.add(key)
                unique_certs.append(cert)
        
        unique_certs.sort(key=lambda x: (x.rating or 0, x.title), reverse=True)
        result["certification_recommendations"] = unique_certs[:5]  # Top 5
        
        return result
    
    def _infer_budget_preference(self, user_profile: Dict[str, Any]) -> str:
        """Infer budget preference from user profile."""
        education_level = user_profile.get("education_level", "").lower()
        location = user_profile.get("location", "").lower()
        
        # Simple heuristic - can be enhanced with actual user input
        if "phd" in education_level or "master" in education_level:
            return "medium"
        elif any(city in location for city in ["mumbai", "delhi", "bangalore", "pune"]):
            return "medium"
        else:
            return "low"
    
    def _infer_learning_style(self, user_profile: Dict[str, Any]) -> str:
        """Infer learning style preference."""
        # Default to mixed - can be enhanced with user survey
        return "mixed"
    
    def _infer_time_availability(self, user_profile: Dict[str, Any]) -> str:
        """Infer time availability from user profile."""
        current_year = user_profile.get("current_year", 1)
        experience_years = user_profile.get("experience_years", 0)
        
        if current_year >= 3 or experience_years > 0:
            return "part-time"  # Likely working or in final years
        else:
            return "full-time"  # Early in studies
    
    def _map_proficiency_to_level(self, proficiency: float) -> str:
        """Map numeric proficiency to difficulty level."""
        if proficiency < 3:
            return "beginner"
        elif proficiency < 7:
            return "intermediate"
        else:
            return "advanced"
    
    def _calculate_confidence(self, result: Dict[str, Any]) -> float:
        """Calculate overall confidence score for the agent."""
        # Base confidence on resource quality and quantity
        courses = result.get("course_recommendations", [])
        certifications = result.get("certification_recommendations", [])
        internships = result.get("internship_opportunities", [])
        
        resource_quality = 0.0
        
        if courses:
            avg_course_rating = sum(c.rating or 0 for c in courses) / len(courses)
            resource_quality += avg_course_rating / 5.0 * 0.4
        
        if certifications:
            avg_cert_rating = sum(c.rating or 0 for c in certifications) / len(certifications)
            resource_quality += avg_cert_rating / 5.0 * 0.3
        
        if internships:
            resource_quality += 0.3  # Flat bonus for having internship suggestions
        
        # Bonus for AI suggestions
        ai_bonus = 0.2 if result.get("ai_suggestions", {}).get("platforms") else 0.0
        
        overall_confidence = min(resource_quality + ai_bonus, 1.0)
        return round(overall_confidence, 3)