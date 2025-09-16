"""Mock Gemini AI service for development."""

import logging
from typing import List, Dict, Any, Optional
import asyncio

logger = logging.getLogger(__name__)


class GeminiService:
    """Mock Gemini service for development."""
    
    def __init__(self):
        """Initialize the mock Gemini service."""
        logger.info("Initializing mock Gemini service for development")
    
    async def generate_response(self, prompt: str, context: Optional[str] = None) -> str:
        """Generate a mock response."""
        logger.info(f"Mock Gemini response for prompt: {prompt[:50]}...")
        
        # Mock responses based on prompt content
        if "career" in prompt.lower():
            return "Based on your skills and interests, I recommend exploring software development, data science, or product management roles. These fields offer great growth opportunities in India's tech industry."
        elif "skill" in prompt.lower():
            return "To improve your skillset, consider focusing on Python programming, cloud technologies like AWS or Azure, and data analysis tools. These are highly in demand in the current job market."
        elif "salary" in prompt.lower():
            return "The average salary for your target roles ranges from ₹8-15 LPA for mid-level positions, with significant growth potential based on experience and specialization."
        else:
            return "I understand your question. Let me help you with career guidance based on your profile and current market trends. Could you provide more specific details about what you'd like to know?"
    
    async def analyze_intent(self, message: str) -> Dict[str, Any]:
        """Analyze the intent of a user message."""
        logger.info(f"Mock intent analysis for: {message[:50]}...")
        
        # Mock intent analysis
        if any(word in message.lower() for word in ["job", "career", "role", "position"]):
            return {
                "intent": "career_search",
                "confidence": 0.85,
                "entities": ["software developer", "technology"]
            }
        elif any(word in message.lower() for word in ["skill", "learn", "improve"]):
            return {
                "intent": "skill_development",
                "confidence": 0.90,
                "entities": ["Python", "programming"]
            }
        elif any(word in message.lower() for word in ["salary", "pay", "compensation"]):
            return {
                "intent": "salary_inquiry",
                "confidence": 0.88,
                "entities": ["₹", "LPA"]
            }
        else:
            return {
                "intent": "general_inquiry",
                "confidence": 0.70,
                "entities": []
            }
    
    async def generate_career_recommendations(self, user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate career recommendations based on user profile."""
        logger.info("Generating mock career recommendations")
        
        # Mock career recommendations
        return [
            {
                "title": "Software Developer",
                "match_score": 0.92,
                "reason": "Strong match based on your programming skills and interests",
                "growth_potential": "High",
                "avg_salary": "₹8-12 LPA"
            },
            {
                "title": "Data Scientist",
                "match_score": 0.85,
                "reason": "Good fit for your analytical skills and Python knowledge",
                "growth_potential": "Very High",
                "avg_salary": "₹10-18 LPA"
            },
            {
                "title": "Product Manager",
                "match_score": 0.78,
                "reason": "Matches your leadership potential and technical background",
                "growth_potential": "High",
                "avg_salary": "₹12-20 LPA"
            }
        ]
    
    async def generate_skill_gap_analysis(self, user_skills: List[str], target_role: str) -> Dict[str, Any]:
        """Analyze skill gaps for a target role."""
        logger.info(f"Mock skill gap analysis for: {target_role}")
        
        # Mock skill gap analysis
        return {
            "missing_skills": ["Docker", "Kubernetes", "AWS"],
            "skill_levels": {
                "Python": "Advanced",
                "JavaScript": "Intermediate",
                "React": "Beginner"
            },
            "recommendations": [
                "Complete a Docker fundamentals course",
                "Practice building containerized applications",
                "Get AWS certification"
            ],
            "estimated_time": "3-4 months"
        }
    
    async def generate_learning_resources(self, skills: List[str]) -> List[Dict[str, Any]]:
        """Generate learning resource recommendations."""
        logger.info(f"Generating mock learning resources for: {skills}")
        
        # Mock learning resources
        return [
            {
                "title": "Python for Everybody Specialization",
                "provider": "Coursera",
                "type": "Course",
                "duration": "8 weeks",
                "rating": 4.8,
                "url": "https://coursera.org/python"
            },
            {
                "title": "React Complete Guide",
                "provider": "Udemy",
                "type": "Course",
                "duration": "12 weeks",
                "rating": 4.7,
                "url": "https://udemy.com/react"
            },
            {
                "title": "AWS Cloud Practitioner",
                "provider": "AWS",
                "type": "Certification",
                "duration": "6 weeks",
                "rating": 4.9,
                "url": "https://aws.amazon.com/certification/"
            }
        ]
    
    async def generate_chat_response(self, message: str, chat_history: List[Dict[str, str]] = None,
                                   system_prompt: str = None) -> Dict[str, Any]:
        """Generate a chat response using mock Gemini."""
        logger.info(f"Mock chat response for: {message[:50]}...")
        
        response_text = await self.generate_response(message)
        intent = await self.analyze_intent(message)
        
        return {
            "response": response_text,
            "intent": intent["intent"],
            "confidence": intent["confidence"],
            "suggestions": [
                "Tell me more about your skills",
                "What are your career goals?",
                "Would you like salary information?"
            ]
        }