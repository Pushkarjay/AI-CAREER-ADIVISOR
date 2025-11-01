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
        # Try multiple sources for API key
        self.api_key = os.getenv("GEMINI_API_KEY")
        
        if not self.api_key:
            # Try importing settings
            try:
                from core.config import settings
                self.api_key = settings.GEMINI_API_KEY
            except Exception as e:
                logger.warning(f"Could not import settings: {e}")
        
        if not self.api_key:
            logger.error("GEMINI_API_KEY not found in environment or settings")
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        # Configure the API
        genai.configure(api_key=self.api_key)
        
        # Initialize the model - using gemini-2.0-flash (stable and fast)
        self.model_name = 'gemini-2.0-flash'
        self.model = genai.GenerativeModel(self.model_name)
        self.temperature = float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
        
        # Safety settings
        self.safety_settings = {
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        }
        
        logger.info(f"Initialized real Gemini service with API key (model: {self.model_name})")
    
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
            Generate a highly personalized career development path with REAL, ACTIONABLE resources for an Indian student/professional.
            
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
            
            IMPORTANT: Provide SPECIFIC resources with REAL URLs and links. Focus on:
            - Free resources (YouTube channels, online courses, documentation)
            - Indian-accessible platforms (Coursera, Udemy, edX, FreeCodeCamp, etc.)
            - Official documentation and tutorials
            - Popular GitHub repositories
            - Community forums and Discord servers
            
            Generate a comprehensive plan with these sections:
            
            1. SKILL GAP ANALYSIS:
               - List skills they have: {', '.join(all_skills[:3])}
               - Critical missing skills needed
               - Priority order (1-5) for each skill
            
            2. LEARNING RESOURCES (PRIORITIZED):
               For EACH skill, provide 2-3 resources in this format:
               {{
                 "skill": "Skill Name",
                 "priority": 1-5,
                 "resources": [
                   {{
                     "title": "Resource Name",
                     "type": "video|course|documentation|tutorial",
                     "url": "actual URL",
                     "platform": "YouTube|Coursera|etc",
                     "duration": "X hours/weeks",
                     "cost": "Free|Paid",
                     "why": "Why this resource is best"
                   }}
                 ]
               }}
            
            3. HANDS-ON PROJECTS (3-5 projects):
               {{
                 "title": "Project Name",
                 "description": "What to build",
                 "skills_practiced": ["skill1", "skill2"],
                 "difficulty": "Beginner|Intermediate|Advanced",
                 "duration": "X weeks",
                 "tutorial_links": ["URL1", "URL2"],
                 "github_examples": ["example repo URL"]
               }}
            
            4. CERTIFICATIONS:
               {{
                 "name": "Certification Name",
                 "provider": "Company/Platform",
                 "priority": 1-5,
                 "cost": "$X or Free",
                 "preparation_time": "X weeks",
                 "url": "registration/info URL",
                 "why_valuable": "Why get this cert"
               }}
            
            5. PRACTICE PLATFORMS:
               {{
                 "platform": "Name",
                 "url": "URL",
                 "focus": "What to practice",
                 "free": true/false
               }}
            
            6. COMMUNITIES TO JOIN:
               {{
                 "name": "Community Name",
                 "platform": "Discord|Reddit|LinkedIn",
                 "url": "Join link",
                 "benefit": "What you'll gain"
               }}
            
            7. WEEK-BY-WEEK PLAN (First 4 weeks):
               Week 1: [Daily tasks with specific resource links]
               Week 2: [Daily tasks with specific resource links]
               Week 3: [Daily tasks with specific resource links]
               Week 4: [Daily tasks with specific resource links]
            
            8. TIMELINE MILESTONES:
               - Month 1: Complete [specific courses/projects]
               - Month 3: Build [specific portfolio projects]
               - Month 6: Apply for [types of positions]
            
            Return ONLY valid JSON. Be extremely specific with URLs, course names, and actionable steps tailored for India.
            """
            
            response = await self._generate_text(prompt)
            parsed_plan = self._parse_json_response(response["text"])
            
            return {
                "personalized_plan": parsed_plan if "content" not in parsed_plan else {"plan": response["text"]},
                "career_title": career_data.get('title', 'N/A'),
                "match_score": self._calculate_skill_match(all_skills, career_data.get('required_skills', [])),
                "confidence": response.get("confidence", 0.85),
                "model": self.model_name,
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
            Create a highly personalized learning roadmap with REAL, SPECIFIC resources and URLs for mastering this domain:
            
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
            
            CRITICAL: Provide ACTUAL URLs and REAL resources. Use popular, accessible platforms.
            
            Generate a personalized roadmap with these sections:
            
            1. PREREQUISITE ASSESSMENT:
               {{
                 "already_know": ["Skills they have"],
                 "need_to_learn": [
                   {{
                     "skill": "Prerequisite name",
                     "why_needed": "Explanation",
                     "learn_from": [
                       {{
                         "title": "Resource name",
                         "url": "Actual URL",
                         "type": "video|course|doc",
                         "duration": "X hours"
                       }}
                     ]
                   }}
                 ],
                 "estimated_time": "X weeks"
               }}
            
            2. CUSTOMIZED LEARNING PATH (Month-by-Month):
               {{
                 "month_1": {{
                   "focus": "What to learn",
                   "topics": ["topic1", "topic2"],
                   "resources": [
                     {{
                       "title": "Course/Tutorial name",
                       "url": "Direct URL",
                       "platform": "YouTube|Coursera|Udemy|etc",
                       "duration": "X hours",
                       "free": true|false,
                       "priority": 1-5
                     }}
                   ],
                   "practice": [
                     {{
                       "what": "Practice exercise",
                       "where": "Platform name",
                       "url": "Practice URL"
                     }}
                   ]
                 }},
                 "month_2": {{ ... }},
                 "month_3": {{ ... }}
               }}
            
            3. RESOURCE RECOMMENDATIONS (Prioritized):
               {{
                 "free_courses": [
                   {{
                     "title": "Course Name",
                     "provider": "Provider",
                     "url": "Course URL",
                     "duration": "X hours",
                     "level": "Beginner|Intermediate|Advanced",
                     "rating": "X/5",
                     "why_recommended": "Specific reason"
                   }}
                 ],
                 "youtube_channels": [
                   {{
                     "channel": "Channel Name",
                     "url": "Channel URL",
                     "focus": "What they teach",
                     "best_for": "Who should watch"
                   }}
                 ],
                 "documentation": [
                   {{
                     "name": "Doc name",
                     "url": "Doc URL",
                     "when_to_use": "When to reference"
                   }}
                 ],
                 "books": [
                   {{
                     "title": "Book title",
                     "free_pdf": "URL if available",
                     "buy_link": "Amazon/Flipkart URL",
                     "why_read": "Value proposition"
                   }}
                 ]
               }}
            
            4. HANDS-ON PROJECT PLAN:
               {{
                 "beginner_projects": [
                   {{
                     "title": "Project name",
                     "description": "What to build",
                     "skills": ["skill1", "skill2"],
                     "tutorial": "Step-by-step guide URL",
                     "github_example": "Example repo URL",
                     "duration": "X days"
                   }}
                 ],
                 "intermediate_projects": [...],
                 "capstone_project": {{
                   "title": "Main portfolio project",
                   "description": "Detailed description",
                   "features": ["feature1", "feature2"],
                   "resources": ["Guide URLs"],
                   "duration": "X weeks"
                 }}
               }}
            
            5. PRACTICE PLATFORMS:
               {{
                 "coding": [
                   {{"name": "Platform", "url": "URL", "focus": "What to practice", "free": true}}
                 ],
                 "interactive_learning": [...],
                 "challenges": [...]
               }}
            
            6. CERTIFICATIONS TO OBTAIN:
               {{
                 "name": "Cert name",
                 "provider": "Provider",
                 "url": "Registration URL",
                 "cost": "$X or Free",
                 "prep_time": "X weeks",
                 "priority": 1-5,
                 "value": "Career value"
               }}
            
            7. INDIAN CONTEXT:
               {{
                 "local_communities": [
                   {{"name": "Community", "platform": "Meetup/Discord", "url": "Join URL"}}
                 ],
                 "hiring_companies": ["Company1", "Company2"],
                 "salary_range": {{"entry": "X LPA", "mid": "X LPA", "senior": "X LPA"}},
                 "job_portals": [
                   {{"name": "Portal", "url": "URL", "focus": "What jobs"}}
                 ]
               }}
            
            8. WEEK-BY-WEEK PLAN (First Month):
               {{
                 "week_1": {{
                   "goal": "Weekly goal",
                   "daily_schedule": {{
                     "hours_per_day": 2-4,
                     "tasks": [
                       {{"day": 1, "task": "Task", "resource": "URL", "duration": "X hours"}}
                     ]
                   }}
                 }}
               }}
            
            9. MILESTONES:
               {{
                 "3_months": {{"complete": ["What to finish"], "skills_gained": ["Skills"]}},
                 "6_months": {{"complete": ["What to finish"], "ready_for": ["Job types"]}},
                 "12_months": {{"complete": ["What to finish"], "expertise_level": "Level"}}
               }}
            
            Return ONLY valid JSON with ACTUAL URLs and REAL resource names. Focus on free/affordable options for Indian learners.
            """
            
            response = await self._generate_text(prompt)
            parsed_roadmap = self._parse_json_response(response["text"])
            
            return {
                "personalized_roadmap": parsed_roadmap if "content" not in parsed_roadmap else {"roadmap": response["text"]},
                "domain_title": domain_title,
                "skill_alignment": self._calculate_skill_match(skills, prerequisites),
                "confidence": response.get("confidence", 0.85),
                "model": self.model_name,
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