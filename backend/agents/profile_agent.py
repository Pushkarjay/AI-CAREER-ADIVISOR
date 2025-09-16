"""Profile Agent - Collects and validates user data from resumes and forms."""

from typing import Dict, Any, List
import json
import re
from datetime import datetime

from .base_agent import BaseAgent, AgentInput
from services.document_ai_service import DocumentAIService
from services.firestore_service_mock import FirestoreService
from models.user import UserProfile, UserProfileCreate


class ProfileAgent(BaseAgent):
    """Agent responsible for processing and validating user profile data."""
    
    def __init__(self):
        super().__init__(
            name="profile_agent",
            description="Processes user profiles, validates data, and extracts information from resumes"
        )
        self.document_ai = DocumentAIService()
        self.firestore = FirestoreService()
    
    async def _process(self, input_data: AgentInput) -> Dict[str, Any]:
        """Process user profile data and resume information."""
        user_id = input_data.user_id
        data = input_data.data
        
        result = {
            "profile_data": {},
            "resume_analysis": {},
            "validation_errors": [],
            "confidence_metrics": {}
        }
        
        # Process profile form data if provided
        if "profile_form" in data:
            profile_result = await self._process_profile_form(data["profile_form"])
            result["profile_data"] = profile_result
        
        # Process resume if provided
        if "resume_file" in data:
            resume_result = await self._process_resume(data["resume_file"])
            result["resume_analysis"] = resume_result
        
        # Merge and validate all data
        merged_profile = await self._merge_profile_data(
            result["profile_data"], 
            result["resume_analysis"]
        )
        
        # Validate merged profile
        validation_result = await self._validate_profile(merged_profile)
        result["validation_errors"] = validation_result["errors"]
        result["final_profile"] = validation_result["profile"]
        
        # Calculate confidence metrics
        result["confidence_metrics"] = await self._calculate_profile_confidence(result)
        
        # Save to Firestore if validation passes
        if not result["validation_errors"]:
            await self._save_profile(user_id, result["final_profile"])
        
        return result
    
    async def _process_profile_form(self, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process profile form data."""
        processed_data = {
            "education_level": form_data.get("education_level"),
            "field_of_study": form_data.get("field_of_study"),
            "current_year": form_data.get("current_year"),
            "location": form_data.get("location"),
            "interests": self._parse_list_field(form_data.get("interests", [])),
            "skills": self._parse_list_field(form_data.get("skills", [])),
            "experience_years": form_data.get("experience_years", 0),
            "preferred_industries": self._parse_list_field(form_data.get("preferred_industries", [])),
            "career_goals": form_data.get("career_goals"),
            "source": "form"
        }
        
        return processed_data
    
    async def _process_resume(self, resume_file: str) -> Dict[str, Any]:
        """Process resume using Document AI."""
        try:
            # Parse resume using Document AI
            resume_data = await self.document_ai.parse_resume(resume_file)
            
            # Extract structured information
            extracted_data = {
                "education": self._extract_education(resume_data),
                "experience": self._extract_experience(resume_data),
                "skills": self._extract_skills(resume_data),
                "contact_info": self._extract_contact_info(resume_data),
                "certifications": self._extract_certifications(resume_data),
                "source": "resume",
                "raw_text": resume_data.get("text", "")
            }
            
            return extracted_data
            
        except Exception as e:
            self.logger.error(f"Resume processing failed: {e}")
            return {"error": str(e), "source": "resume"}
    
    async def _merge_profile_data(self, form_data: Dict[str, Any], resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """Merge form data with resume data, prioritizing form data."""
        merged = {}
        
        # Start with form data as base
        if form_data and "error" not in form_data:
            merged.update(form_data)
        
        # Enhance with resume data where form data is missing
        if resume_data and "error" not in resume_data:
            # Map resume fields to profile fields
            if not merged.get("field_of_study") and resume_data.get("education"):
                merged["field_of_study"] = self._infer_field_of_study(resume_data["education"])
            
            if not merged.get("skills"):
                merged["skills"] = resume_data.get("skills", [])
            else:
                # Merge skills from both sources
                form_skills = set(merged.get("skills", []))
                resume_skills = set(resume_data.get("skills", []))
                merged["skills"] = list(form_skills.union(resume_skills))
            
            if not merged.get("experience_years"):
                merged["experience_years"] = self._calculate_experience_years(resume_data.get("experience", []))
        
        return merged
    
    async def _validate_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate profile data against business rules."""
        errors = []
        validated_profile = profile_data.copy()
        
        # Required field validation
        required_fields = ["education_level", "field_of_study"]
        for field in required_fields:
            if not validated_profile.get(field):
                errors.append(f"Missing required field: {field}")
        
        # Data type validation
        if validated_profile.get("current_year"):
            try:
                year = int(validated_profile["current_year"])
                if year < 1 or year > 6:
                    errors.append("current_year must be between 1 and 6")
                validated_profile["current_year"] = year
            except (ValueError, TypeError):
                errors.append("current_year must be a valid integer")
        
        if validated_profile.get("experience_years"):
            try:
                exp = int(validated_profile["experience_years"])
                if exp < 0 or exp > 50:
                    errors.append("experience_years must be between 0 and 50")
                validated_profile["experience_years"] = exp
            except (ValueError, TypeError):
                errors.append("experience_years must be a valid integer")
        
        # Clean and validate lists
        for list_field in ["interests", "skills", "preferred_industries"]:
            if list_field in validated_profile:
                validated_profile[list_field] = self._clean_list_field(validated_profile[list_field])
        
        return {"errors": errors, "profile": validated_profile}
    
    async def _save_profile(self, user_id: str, profile_data: Dict[str, Any]):
        """Save validated profile to Firestore."""
        try:
            profile_data["user_id"] = user_id
            profile_data["created_at"] = datetime.now()
            profile_data["updated_at"] = datetime.now()
            
            await self.firestore.save_user_profile(user_id, profile_data)
            self.logger.info(f"Profile saved successfully for user {user_id}")
            
        except Exception as e:
            self.logger.error(f"Failed to save profile for user {user_id}: {e}")
            raise
    
    def _parse_list_field(self, field_value) -> List[str]:
        """Parse list field from various input formats."""
        if isinstance(field_value, str):
            # Split by common separators
            items = re.split(r'[,;\n]+', field_value)
            return [item.strip() for item in items if item.strip()]
        elif isinstance(field_value, list):
            return [str(item).strip() for item in field_value if str(item).strip()]
        return []
    
    def _clean_list_field(self, field_value: List[str]) -> List[str]:
        """Clean and deduplicate list field."""
        if not isinstance(field_value, list):
            return []
        
        cleaned = []
        seen = set()
        
        for item in field_value:
            if isinstance(item, str):
                clean_item = item.strip().lower()
                if clean_item and clean_item not in seen:
                    cleaned.append(item.strip())
                    seen.add(clean_item)
        
        return cleaned[:20]  # Limit to 20 items
    
    def _extract_education(self, resume_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract education information from resume."""
        # Implementation depends on Document AI response format
        return resume_data.get("education", [])
    
    def _extract_experience(self, resume_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract work experience from resume."""
        return resume_data.get("experience", [])
    
    def _extract_skills(self, resume_data: Dict[str, Any]) -> List[str]:
        """Extract skills from resume."""
        return resume_data.get("skills", [])
    
    def _extract_contact_info(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract contact information from resume."""
        return resume_data.get("contact", {})
    
    def _extract_certifications(self, resume_data: Dict[str, Any]) -> List[str]:
        """Extract certifications from resume."""
        return resume_data.get("certifications", [])
    
    def _infer_field_of_study(self, education_data: List[Dict[str, Any]]) -> str:
        """Infer field of study from education data."""
        if not education_data:
            return ""
        
        # Get the most recent or highest degree
        latest_education = education_data[0] if education_data else {}
        return latest_education.get("field", "")
    
    def _calculate_experience_years(self, experience_data: List[Dict[str, Any]]) -> int:
        """Calculate total years of experience."""
        total_months = 0
        
        for exp in experience_data:
            start_date = exp.get("start_date")
            end_date = exp.get("end_date", "present")
            
            # Simple calculation - can be enhanced
            if start_date:
                if end_date == "present":
                    # Assume 2 years if current
                    total_months += 24
                else:
                    # Simple year difference
                    total_months += 12
        
        return min(total_months // 12, 50)  # Cap at 50 years
    
    async def _calculate_profile_confidence(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate confidence metrics for profile data."""
        confidence = {
            "overall": 0.0,
            "form_data_quality": 0.0,
            "resume_parsing_quality": 0.0,
            "data_completeness": 0.0
        }
        
        profile = result.get("final_profile", {})
        
        # Data completeness score
        required_fields = ["education_level", "field_of_study", "skills", "interests"]
        completed_fields = sum(1 for field in required_fields if profile.get(field))
        confidence["data_completeness"] = completed_fields / len(required_fields)
        
        # Form data quality
        if result.get("profile_data") and "error" not in result["profile_data"]:
            confidence["form_data_quality"] = 0.9
        
        # Resume parsing quality
        if result.get("resume_analysis") and "error" not in result["resume_analysis"]:
            confidence["resume_parsing_quality"] = 0.8
        
        # Overall confidence
        confidence["overall"] = (
            confidence["data_completeness"] * 0.4 +
            confidence["form_data_quality"] * 0.3 +
            confidence["resume_parsing_quality"] * 0.3
        )
        
        return confidence
    
    def _calculate_confidence(self, result: Dict[str, Any]) -> float:
        """Calculate overall confidence score for the agent."""
        return result.get("confidence_metrics", {}).get("overall", 0.5)