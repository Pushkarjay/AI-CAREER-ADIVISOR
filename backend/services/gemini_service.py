"""Google Vertex AI Gemini service for AI-powered insights and recommendations."""

import logging
from typing import Dict, Any, List, Optional
import asyncio
import json

from google.cloud import aiplatform
import vertexai
from vertexai.generative_models import GenerativeModel

from core.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for interacting with Google Vertex AI Gemini models."""
    
    def __init__(self):
        self.project_id = settings.GOOGLE_CLOUD_PROJECT
        self.location = settings.VERTEX_AI_LOCATION
        self.model_name = settings.GEMINI_MODEL
        self.temperature = settings.GEMINI_TEMPERATURE
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Vertex AI client."""
        try:
            # Initialize Vertex AI
            vertexai.init(
                project=self.project_id,
                location=self.location
            )
            
            self.model = GenerativeModel(self.model_name)
            logger.info(f"Gemini service initialized with model: {self.model_name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini service: {e}")
            raise
    
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
    
    async def health_check(self) -> bool:
        """Check if the Gemini service is healthy."""
        try:
            test_response = await self._generate_text("Hello")
            return bool(test_response.get("text"))
        except Exception as e:
            logger.error(f"Gemini health check failed: {e}")
            return False