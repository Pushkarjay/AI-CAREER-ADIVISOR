"""Real Gemini AI service using Google Generative AI."""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

logger = logging.getLogger(__name__)


class GeminiService:
    """Real Gemini service using Google Generative AI API."""
    
    def __init__(self):
        """Initialize the Gemini service with API key."""
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        # Configure the API
        genai.configure(api_key=self.api_key)
        
        # Initialize the model
        self.model_name = 'gemini-1.5-flash'
        self.model = genai.GenerativeModel(self.model_name)
        self.temperature = float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
        
        # Safety settings
        self.safety_settings = {
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        }
        
        logger.info("Initialized real Gemini service with API key")
    
    async def generate_chat_response(self, message: str, chat_history: List[Dict[str, str]] = None,
                                   system_prompt: str = None) -> Dict[str, Any]:
        """Generate a chat response using Gemini."""
        try:
            # Build conversation context
            conversation_parts = []
            
            if system_prompt:
                conversation_parts.append(f"System: {system_prompt}")
            
            if chat_history:
                for msg in chat_history[-10:]:  # Last 10 messages for context
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    conversation_parts.append(f"{role.title()}: {content}")
            
            conversation_parts.append(f"User: {message}")
            
            # Create prompt
            full_prompt = "\n".join(conversation_parts)
            
            # Generate response
            response = await self._generate_text(full_prompt)
            
            return {
                "response": response["text"],
                "usage": response.get("usage", {}),
                "model": self.model_name,
                "confidence": response.get("confidence", 0.8)
            }
            
        except Exception as e:
            logger.error(f"Chat response generation failed: {e}")
            return {
                "response": "I apologize, but I'm having trouble generating a response right now. Please try again.",
                "error": str(e)
            }
    
    async def generate_career_insights(self, user_profile: Dict[str, Any], 
                                     career_matches: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate career insights and recommendations."""
        try:
            prompt = self._build_career_insights_prompt(user_profile, career_matches)
            response = await self._generate_text(prompt)
            
            # Parse structured response
            insights = self._parse_career_insights(response["text"])
            
            return {
                "insights": insights,
                "confidence": response.get("confidence", 0.8),
                "model": self.model_name
            }
            
        except Exception as e:
            logger.error(f"Career insights generation failed: {e}")
            return {"error": str(e)}
    
    async def generate_skill_analysis(self, user_skills: List[str], 
                                    required_skills: List[str], 
                                    career_context: str) -> Dict[str, Any]:
        """Generate skill gap analysis and recommendations."""
        try:
            prompt = f"""
            Analyze the skill gap for a career transition:
            
            Current Skills: {', '.join(user_skills)}
            Required Skills: {', '.join(required_skills)}
            Career Context: {career_context}
            
            Provide:
            1. Skill gap assessment
            2. Priority skills to develop
            3. Learning recommendations
            4. Timeline suggestions
            5. Practical next steps
            
            Format as structured JSON with sections: gap_analysis, priorities, recommendations, timeline, next_steps
            """
            
            response = await self._generate_text(prompt)
            parsed_analysis = self._parse_json_response(response["text"])
            
            return {
                "analysis": parsed_analysis,
                "confidence": response.get("confidence", 0.8),
                "model": self.model_name
            }
            
        except Exception as e:
            logger.error(f"Skill analysis generation failed: {e}")
            return {"error": str(e)}
    
    async def generate_insights(self, prompt: str) -> Dict[str, Any]:
        """Generate general insights based on a prompt."""
        try:
            response = await self._generate_text(prompt)
            
            # Try to parse as structured data
            parsed_content = self._parse_insights_response(response["text"])
            
            return parsed_content
            
        except Exception as e:
            logger.error(f"Insights generation failed: {e}")
            return {"error": str(e)}
    
    async def generate_recommendations(self, prompt: str) -> Dict[str, Any]:
        """Generate recommendations based on a prompt."""
        try:
            response = await self._generate_text(prompt)
            
            # Parse recommendations
            recommendations = self._parse_recommendations_response(response["text"])
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Recommendations generation failed: {e}")
            return {"error": str(e)}
    
    async def generate_suggestions(self, prompt: str) -> Dict[str, Any]:
        """Generate suggestions based on a prompt."""
        try:
            response = await self._generate_text(prompt)
            
            # Parse suggestions
            suggestions = self._parse_suggestions_response(response["text"])
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Suggestions generation failed: {e}")
            return {"error": str(e)}
    
    async def _generate_text(self, prompt: str) -> Dict[str, Any]:
        """Core text generation method."""
        try:
            # Configure generation parameters
            generation_config = {
                "temperature": self.temperature,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
            
            # Generate response
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            # Extract text and metadata
            result = {
                "text": response.text,
                "usage": {
                    "prompt_tokens": len(prompt.split()),
                    "completion_tokens": len(response.text.split()) if response.text else 0
                },
                "confidence": 0.8  # Default confidence
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Text generation failed: {e}")
            raise
    
    def _build_career_insights_prompt(self, user_profile: Dict[str, Any], 
                                    career_matches: List[Dict[str, Any]]) -> str:
        """Build prompt for career insights generation."""
        skills = user_profile.get("skills", [])
        interests = user_profile.get("interests", [])
        location = user_profile.get("location", "India")
        education = user_profile.get("education_level", "")
        
        career_titles = [match.get("title", "") for match in career_matches[:5]]
        
        prompt = f"""
        Generate comprehensive career insights for an Indian student:
        
        Profile:
        - Skills: {', '.join(skills)}
        - Interests: {', '.join(interests)}
        - Education: {education}
        - Location: {location}
        
        Top Career Matches: {', '.join(career_titles)}
        
        Provide insights on:
        1. Market analysis for these careers in India
        2. Salary expectations and growth prospects
        3. Industry trends and future outlook
        4. Geographic opportunities (metros vs smaller cities)
        5. Key skills in demand
        6. Actionable career advice
        
        Format as structured JSON with sections: market_analysis, salary_insights, trends, geography, in_demand_skills, advice
        """
        
        return prompt
    
    def _parse_career_insights(self, response_text: str) -> Dict[str, Any]:
        """Parse career insights from response text."""
        try:
            # Try to parse as JSON first
            if "{" in response_text and "}" in response_text:
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                json_text = response_text[start:end]
                return json.loads(json_text)
        except:
            pass
        
        # Fallback to structured text parsing
        insights = {
            "market_analysis": "",
            "salary_insights": "",
            "trends": "",
            "geography": "",
            "in_demand_skills": [],
            "advice": ""
        }
        
        # Simple text extraction
        lines = response_text.split("\n")
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Detect sections
            if "market" in line.lower():
                current_section = "market_analysis"
            elif "salary" in line.lower():
                current_section = "salary_insights"
            elif "trend" in line.lower():
                current_section = "trends"
            elif "geography" in line.lower() or "location" in line.lower():
                current_section = "geography"
            elif "skill" in line.lower():
                current_section = "in_demand_skills"
            elif "advice" in line.lower() or "recommendation" in line.lower():
                current_section = "advice"
            elif current_section:
                insights[current_section] += line + " "
        
        return insights
    
    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """Parse JSON response from text."""
        try:
            # Extract JSON from response
            if "{" in response_text and "}" in response_text:
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                json_text = response_text[start:end]
                return json.loads(json_text)
        except:
            pass
        
        # Return structured fallback
        return {"content": response_text}
    
    def _parse_insights_response(self, response_text: str) -> Dict[str, Any]:
        """Parse insights response into structured format."""
        # Try JSON parsing first
        parsed = self._parse_json_response(response_text)
        if "content" not in parsed:
            return parsed
        
        # Fallback parsing
        return {
            "analysis": response_text,
            "summary": response_text[:200] + "..." if len(response_text) > 200 else response_text
        }
    
    def _parse_recommendations_response(self, response_text: str) -> Dict[str, Any]:
        """Parse recommendations response."""
        parsed = self._parse_json_response(response_text)
        if "content" not in parsed:
            return parsed
        
        # Extract recommendations from text
        lines = response_text.split("\n")
        recommendations = []
        
        for line in lines:
            line = line.strip()
            if line and (line.startswith("-") or line.startswith("•") or line.startswith("*")):
                recommendations.append(line[1:].strip())
        
        return {
            "strategy": response_text,
            "recommendations": recommendations[:5],
            "full_text": response_text
        }
    
    def _parse_suggestions_response(self, response_text: str) -> Dict[str, Any]:
        """Parse suggestions response."""
        parsed = self._parse_json_response(response_text)
        if "content" not in parsed:
            return parsed
        
        # Extract suggestions by category
        suggestions = {
            "platforms": [],
            "affordable": [],
            "local": [],
            "practical": [],
            "networking": [],
            "timeline": []
        }
        
        current_category = None
        lines = response_text.split("\n")
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect categories
            line_lower = line.lower()
            if "platform" in line_lower:
                current_category = "platforms"
            elif "affordable" in line_lower or "free" in line_lower:
                current_category = "affordable"
            elif "local" in line_lower:
                current_category = "local"
            elif "practical" in line_lower:
                current_category = "practical"
            elif "network" in line_lower:
                current_category = "networking"
            elif "timeline" in line_lower or "time" in line_lower:
                current_category = "timeline"
            elif current_category and (line.startswith("-") or line.startswith("•")):
                suggestions[current_category].append(line[1:].strip())
        
        return suggestions
    
    async def generate_personalized_career_path(
        self, 
        career_data: Dict[str, Any],
        user_profile: Dict[str, Any],
        resume_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate personalized career path based on career, user profile, and resume data."""
        try:
            # Extract user information
            skills = user_profile.get("skills", [])
            interests = user_profile.get("interests", [])
            education = user_profile.get("education_level", "")
            field_of_study = user_profile.get("field_of_study", "")
            experience_years = user_profile.get("experience_years", 0)
            career_goals = user_profile.get("career_goals", "")
            
            # Extract resume data if available
            resume_skills = []
            certifications = []
            projects = []
            internships = []
            
            if resume_data:
                parsed = resume_data.get("parsed_data", {})
                resume_skills = parsed.get("skills", [])
                certifications = user_profile.get("certifications", [])
                projects = user_profile.get("projects", [])
                internships = user_profile.get("internships", [])
            
            # Combine skills from profile and resume
            all_skills = list(set(skills + resume_skills))
            
            # Build prompt for personalized career path
            prompt = f"""
            Generate a highly personalized career development path for an Indian student/professional:
            
            CAREER TARGET:
            Title: {career_data.get('title', 'N/A')}
            Industry: {career_data.get('industry', 'N/A')}
            Description: {career_data.get('description', 'N/A')}
            Required Skills: {', '.join(career_data.get('required_skills', []))}
            
            USER PROFILE:
            Current Skills: {', '.join(all_skills)}
            Interests: {', '.join(interests)}
            Education: {education} in {field_of_study}
            Experience: {experience_years} years
            Career Goals: {career_goals}
            
            RESUME HIGHLIGHTS:
            Certifications: {', '.join([c.get('name', '') for c in certifications])}
            Projects: {', '.join([p.get('name', '') for p in projects])}
            Internships: {', '.join([i.get('company', '') for i in internships])}
            
            Please provide a comprehensive, personalized career development plan including:
            
            1. SKILL GAP ANALYSIS:
               - Skills you already have that match this career
               - Critical skills you need to develop
               - Priority order for learning new skills
            
            2. PERSONALIZED LEARNING ROADMAP:
               - Step-by-step learning path tailored to your background
               - Recommended courses, platforms, and resources
               - Timeline estimates (weeks/months for each phase)
            
            3. PROJECT RECOMMENDATIONS:
               - 3-5 hands-on projects to build relevant experience
               - How to leverage your existing projects
            
            4. CERTIFICATION STRATEGY:
               - Industry-recognized certifications to pursue
               - Order of priority based on your profile
            
            5. EXPERIENCE BUILDING:
               - Internship opportunities to target
               - Open-source contributions
               - Freelance/part-time opportunities
            
            6. NETWORKING & COMMUNITY:
               - Communities and forums to join
               - LinkedIn strategy
               - Mentorship opportunities
            
            7. JOB SEARCH STRATEGY:
               - When you'll be ready to apply
               - Companies that match your profile
               - How to position yourself
            
            8. PERSONALIZED TIMELINE:
               - 3-month action plan
               - 6-month milestones
               - 1-year career transition goals
            
            Format the response as structured JSON with clear sections. Be specific, actionable, and considerate of the Indian job market.
            """
            
            response = await self._generate_text(prompt)
            parsed_plan = self._parse_json_response(response["text"])
            
            return {
                "personalized_plan": parsed_plan if "content" not in parsed_plan else {"plan": response["text"]},
                "career_title": career_data.get('title', 'N/A'),
                "match_score": self._calculate_skill_match(all_skills, career_data.get('required_skills', [])),
                "confidence": response.get("confidence", 0.85),
                "model": "gemini-1.5-flash",
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Personalized career path generation failed: {e}")
            return {"error": str(e)}
    
    async def generate_personalized_domain_roadmap(
        self,
        domain_data: Dict[str, Any],
        user_profile: Dict[str, Any],
        resume_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate personalized learning roadmap for a specific domain."""
        try:
            # Extract user information
            skills = user_profile.get("skills", [])
            interests = user_profile.get("interests", [])
            education = user_profile.get("education_level", "")
            field_of_study = user_profile.get("field_of_study", "")
            certifications = user_profile.get("certifications", [])
            projects = user_profile.get("projects", [])
            
            # Extract domain information
            domain_title = domain_data.get("title", "")
            domain_description = domain_data.get("description", "")
            prerequisites = domain_data.get("prerequisites", [])
            learning_path = domain_data.get("learning_path", [])
            universal_foundations = domain_data.get("universal_foundations", [])
            
            prompt = f"""
            Create a highly personalized learning roadmap for mastering this domain:
            
            DOMAIN:
            Title: {domain_title}
            Description: {domain_description}
            Prerequisites: {', '.join(prerequisites)}
            Standard Learning Path: {', '.join(learning_path[:10])}
            Universal Foundations: {', '.join(universal_foundations)}
            
            LEARNER PROFILE:
            Current Skills: {', '.join(skills)}
            Interests: {', '.join(interests)}
            Education: {education} - {field_of_study}
            Certifications: {', '.join([c.get('name', '') for c in certifications])}
            Projects: {', '.join([p.get('name', '') for p in projects])}
            
            Generate a personalized roadmap including:
            
            1. PREREQUISITE ASSESSMENT:
               - Which prerequisites you already know
               - Which ones you need to learn first
               - Estimated time for prerequisite completion
            
            2. CUSTOMIZED LEARNING PATH:
               - Adjusted path based on your existing knowledge
               - Skip topics you already know
               - Deep-dive recommendations for weak areas
               - Month-by-month breakdown
            
            3. RESOURCE RECOMMENDATIONS:
               - Free courses (YouTube, Coursera, edX)
               - Paid courses worth the investment
               - Books and documentation
               - Practice platforms
            
            4. HANDS-ON PROJECT PLAN:
               - Beginner projects (weeks 1-4)
               - Intermediate projects (months 2-3)
               - Advanced capstone project (months 4-6)
               - How to showcase these projects
            
            5. SKILL VALIDATION:
               - Assessments and quizzes
               - Certifications to obtain
               - Portfolio building strategy
            
            6. INDIAN CONTEXT:
               - Local meetups and communities
               - Indian companies hiring in this domain
               - Salary expectations at different skill levels
               - Tier-1 vs Tier-2 city opportunities
            
            7. WEEK-BY-WEEK PLAN (First 4 weeks):
               - Daily study schedule
               - Specific topics and resources
               - Weekly goals and checkpoints
            
            8. LONG-TERM MILESTONES:
               - 3-month checkpoint
               - 6-month intermediate level
               - 12-month expert level
            
            Return as structured JSON. Be extremely specific with resource names, URLs where possible, and realistic timelines.
            """
            
            response = await self._generate_text(prompt)
            parsed_roadmap = self._parse_json_response(response["text"])
            
            return {
                "personalized_roadmap": parsed_roadmap if "content" not in parsed_roadmap else {"roadmap": response["text"]},
                "domain_title": domain_title,
                "skill_alignment": self._calculate_skill_match(skills, prerequisites),
                "confidence": response.get("confidence", 0.85),
                "model": "gemini-1.5-flash",
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Personalized domain roadmap generation failed: {e}")
            return {"error": str(e)}
    
    def _calculate_skill_match(self, user_skills: List[str], required_skills: List[str]) -> float:
        """Calculate percentage match between user skills and required skills."""
        if not required_skills:
            return 0.0
        
        user_skills_lower = set(s.lower() for s in user_skills)
        required_skills_lower = set(s.lower() for s in required_skills)
        
        matched = len(user_skills_lower.intersection(required_skills_lower))
        total = len(required_skills_lower)
        
        return round((matched / total) * 100, 2) if total > 0 else 0.0
    
    async def health_check(self) -> bool:
        """Check if the Gemini service is healthy."""
        try:
            test_response = await self._generate_text("Hello")
            return bool(test_response.get("text"))
        except Exception as e:
            logger.error(f"Gemini health check failed: {e}")
            return False