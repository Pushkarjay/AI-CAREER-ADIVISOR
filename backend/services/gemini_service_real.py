"""Real Gemini AI service using Google Generative AI."""

import os
import json
import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

logger = logging.getLogger(__name__)


class GeminiService:
    """Real Gemini service using Google Generative AI API."""
    
    def __init__(self):
        """Initialize the Gemini service with API key."""
        # Try to get API key from multiple sources
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            # Try importing settings
            try:
                from core.config import settings
                self.api_key = settings.GEMINI_API_KEY
            except:
                pass
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found, using mock service")
            self._is_mock = True
            return
        
        try:
            # Configure the API
            genai.configure(api_key=self.api_key)
            
            # Initialize the model - using gemini-2.5-flash (stable and fast)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            
            # Safety settings
            self.safety_settings = {
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
            
            self._is_mock = False
            logger.info("Initialized real Gemini service with API key")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini service: {e}")
            self._is_mock = True
    
    async def generate_response(self, prompt: str, context: Optional[str] = None) -> str:
        """Generate a response using Gemini AI."""
        if self._is_mock:
            return self._mock_response(prompt)
        
        try:
            # Construct the full prompt with context
            full_prompt = prompt
            if context:
                full_prompt = f"Context: {context}\n\nUser Question: {prompt}"
            
            # Add career advisor system prompt
            system_prompt = """You are an AI career advisor specifically designed for Indian students and professionals. 
            Your role is to provide practical, actionable career guidance considering the Indian job market, 
            educational system, and cultural context. Always be helpful, encouraging, and provide specific recommendations."""
            
            final_prompt = f"{system_prompt}\n\n{full_prompt}"
            
            # Generate response
            response = self.model.generate_content(
                final_prompt,
                safety_settings=self.safety_settings
            )
            
            if response.text:
                logger.info(f"Generated response for prompt: {prompt[:50]}...")
                return response.text
            else:
                logger.warning("Empty response from Gemini API")
                return "I apologize, but I couldn't generate a response. Please try rephrasing your question."
                
        except Exception as e:
            logger.error(f"Error generating Gemini response: {e}")
            return "I'm experiencing technical difficulties. Please try again later."
    
    async def generate_chat_response(self, message: str, chat_history: List[Dict[str, Any]], system_prompt: str) -> Dict[str, Any]:
        """Generate a chat response with conversation context."""
        if self._is_mock:
            return self._mock_chat_response(message)
        
        try:
            # Build conversation context
            conversation_context = ""
            if chat_history:
                for msg in chat_history[-5:]:  # Last 5 messages for context
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    conversation_context += f"{role.capitalize()}: {content}\n"
            
            # Create the prompt
            full_prompt = f"""{system_prompt}

Previous conversation:
{conversation_context}

Current user message: {message}

Please provide a helpful, specific response as an AI career advisor for Indian students."""
            
            # Generate response
            response = self.model.generate_content(
                full_prompt,
                safety_settings=self.safety_settings
            )
            
            if response.text:
                return {
                    "response": response.text,
                    "confidence": 0.85,
                    "model_used": "gemini-2.5-flash"
                }
            else:
                return {
                    "response": "I couldn't generate a proper response. Could you please rephrase your question?",
                    "confidence": 0.3,
                    "model_used": "gemini-2.5-flash"
                }
                
        except Exception as e:
            logger.error(f"Error in chat response generation: {e}")
            return {
                "response": "I'm having trouble processing your request right now. Please try again.",
                "confidence": 0.1,
                "model_used": "gemini-2.5-flash"
            }
    
    async def analyze_intent(self, message: str) -> Dict[str, Any]:
        """Analyze the intent of a user message using Gemini."""
        if self._is_mock:
            return self._fallback_intent_analysis(message)
        
        try:
            prompt = f"""Analyze the following message and classify its intent for a career advisory chatbot.
            
Message: "{message}"

Classify the intent as one of:
- career_exploration: looking for career options, job roles, career paths
- skill_development: asking about skills to learn, courses, training
- salary_inquiry: asking about compensation, salary expectations
- interview_preparation: seeking interview tips, preparation advice
- resume_help: asking for resume feedback, writing tips
- general_conversation: casual chat, greetings, unrelated topics

Return your response in this exact format:
Intent: [intent_type]
Confidence: [0.0-1.0]
Entities: [comma-separated relevant keywords]
Reasoning: [brief explanation]"""

            response = self.model.generate_content(prompt, safety_settings=self.safety_settings)
            
            if response.text:
                # Parse the response (simple parsing)
                lines = response.text.strip().split('\n')
                intent_type = "general_conversation"
                confidence = 0.5
                entities = []
                
                for line in lines:
                    if line.startswith("Intent:"):
                        intent_type = line.split(":", 1)[1].strip()
                    elif line.startswith("Confidence:"):
                        try:
                            confidence = float(line.split(":", 1)[1].strip())
                        except:
                            confidence = 0.5
                    elif line.startswith("Entities:"):
                        entities_str = line.split(":", 1)[1].strip()
                        entities = [e.strip() for e in entities_str.split(",") if e.strip()]
                
                return {
                    "intent": intent_type,
                    "confidence": confidence,
                    "entities": entities
                }
            
        except Exception as e:
            logger.error(f"Error in intent analysis: {e}")
        
        # Fallback to simple keyword-based analysis
        return self._fallback_intent_analysis(message)
    
    def _fallback_intent_analysis(self, message: str) -> Dict[str, Any]:
        """Fallback intent analysis using keywords."""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["job", "career", "role", "position", "profession"]):
            return {"intent": "career_exploration", "confidence": 0.7, "entities": ["career"]}
        elif any(word in message_lower for word in ["skill", "learn", "course", "training", "study"]):
            return {"intent": "skill_development", "confidence": 0.7, "entities": ["skills"]}
        elif any(word in message_lower for word in ["salary", "pay", "compensation", "money"]):
            return {"intent": "salary_inquiry", "confidence": 0.7, "entities": ["salary"]}
        elif any(word in message_lower for word in ["interview", "prepare", "tips"]):
            return {"intent": "interview_preparation", "confidence": 0.7, "entities": ["interview"]}
        elif any(word in message_lower for word in ["resume", "cv", "portfolio"]):
            return {"intent": "resume_help", "confidence": 0.7, "entities": ["resume"]}
        else:
            return {"intent": "general_conversation", "confidence": 0.6, "entities": []}
    
    async def generate_career_recommendations(self, user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate career recommendations based on user profile using Gemini."""
        if self._is_mock:
            return self._mock_career_recommendations()
        
        try:
            prompt = f"""Based on the following user profile, suggest 3-5 career options suitable for the Indian job market:

User Profile:
- Skills: {user_profile.get('skills', [])}
- Education: {user_profile.get('education', 'Not specified')}
- Experience: {user_profile.get('experience', 'Fresher')}
- Interests: {user_profile.get('interests', [])}
- Location: {user_profile.get('location', 'India')}

For each career recommendation, provide:
1. Job Title
2. Match Score (0.0-1.0)
3. Reason for recommendation
4. Growth Potential (Low/Medium/High/Very High)
5. Average Salary in India (in LPA)

Format your response as a structured list."""

            response = self.model.generate_content(prompt, safety_settings=self.safety_settings)
            
            if response.text:
                # For now, return the text response - can be parsed later for structured data
                return [{
                    "title": "AI-Generated Recommendations",
                    "match_score": 0.85,
                    "reason": response.text,
                    "growth_potential": "High",
                    "avg_salary": "Varies based on role"
                }]
                
        except Exception as e:
            logger.error(f"Error generating career recommendations: {e}")
        
        # Fallback recommendations
        return self._mock_career_recommendations()
    
    async def generate_skill_gap_analysis(self, user_skills: List[str], target_role: str) -> Dict[str, Any]:
        """Analyze skill gaps for a target role using Gemini."""
        if self._is_mock:
            return self._mock_skill_analysis(target_role)
        
        try:
            prompt = f"""Analyze the skill gap for someone wanting to become a {target_role} in India.

Current Skills: {', '.join(user_skills) if user_skills else 'None specified'}
Target Role: {target_role}

Please provide:
1. Missing skills needed for this role
2. Assessment of current skill levels
3. Learning recommendations
4. Time estimate to bridge the gap
5. Relevant courses or certifications

Consider the Indian job market and industry standards."""

            response = self.model.generate_content(prompt, safety_settings=self.safety_settings)
            
            if response.text:
                return {
                    "analysis": response.text,
                    "missing_skills": ["Skill analysis generated by AI"],
                    "recommendations": ["Please see detailed analysis above"]
                }
                
        except Exception as e:
            logger.error(f"Error in skill gap analysis: {e}")
        
        # Fallback analysis
        return self._mock_skill_analysis(target_role)
    
    def _mock_response(self, prompt: str) -> str:
        """Mock response for development."""
        if "career" in prompt.lower():
            return "Based on your skills and interests, I recommend exploring software development, data science, or product management roles. These fields offer great growth opportunities in India's tech industry."
        elif "skill" in prompt.lower():
            return "To improve your skillset, consider focusing on Python programming, cloud technologies like AWS or Azure, and data analysis tools. These are highly in demand in the current job market."
        elif "salary" in prompt.lower():
            return "The average salary for your target roles ranges from ₹8-15 LPA for mid-level positions, with significant growth potential based on experience and specialization."
        else:
            return "I understand your question. Let me help you with career guidance based on your profile and current market trends. Could you provide more specific details about what you'd like to know?"
    
    def _mock_chat_response(self, message: str) -> Dict[str, Any]:
        """Mock chat response for development."""
        return {
            "response": self._mock_response(message),
            "confidence": 0.8,
            "model_used": "mock-service"
        }
    
    def _mock_career_recommendations(self) -> List[Dict[str, Any]]:
        """Mock career recommendations."""
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
    
    def _mock_skill_analysis(self, target_role: str) -> Dict[str, Any]:
        """Mock skill gap analysis."""
        return {
            "missing_skills": ["Docker", "Kubernetes", "AWS"],
            "recommendations": [
                "Complete online courses in containerization",
                "Practice with hands-on projects",
                "Get AWS certification"
            ],
            "analysis": f"To become a {target_role}, focus on cloud technologies and DevOps skills. The Indian market has high demand for these skills."
        }
    
    async def health_check(self) -> bool:
        """Check if the Gemini service is healthy."""
        if self._is_mock:
            return True
        
        try:
            test_response = await self.generate_response("Hello")
            return bool(test_response)
        except Exception as e:
            logger.error(f"Gemini health check failed: {e}")
            return False