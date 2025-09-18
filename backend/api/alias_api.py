"""Alias endpoints to match final architecture simple paths under /api/*.

These endpoints forward to existing logic in profiles, careers, and chat modules.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import HTTPBearer
from typing import Optional, Dict, Any
from datetime import datetime

from core.security import verify_token
from services.firestore_service import FirestoreService
from services.gemini_service_real import GeminiService

import re

router = APIRouter()
security = HTTPBearer()

# Initialize Firestore service
firestore_service = FirestoreService()

gemini = GeminiService()


@router.get("/profile")
async def get_profile(token: str = Depends(security)):
    """Get user profile via alias endpoint."""
    payload = verify_token(token.credentials)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    profile = await firestore_service.get_user_profile(user_id)
    if not profile:
        return {"data": {}}  # Return empty data instead of 404 for consistency
    return {"data": profile}


@router.post("/profile")
async def save_profile(profile: Dict[str, Any], token: str = Depends(security)):
    payload = verify_token(token.credentials)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    await firestore_service.save_user_profile(user_id, profile)
    return {"ok": True}


@router.post("/resume")
async def parse_resume(file: UploadFile = File(...), token: str = Depends(security)):
    """Enhanced resume parsing with profile auto-population."""
    payload = verify_token(token.credentials)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    content = (await file.read()).decode(errors="ignore")
    
    # Enhanced extraction
    emails = re.findall(r"[\w\.-]+@[\w\.-]+", content)
    phones = re.findall(r"\+?\d[\d\s\-]{8,}\d", content)

    # Enhanced skills extraction
    skills_list = []
    common_skills = [
        "python", "javascript", "react", "node.js", "java", "c#", "sql", "nosql", 
        "machine learning", "ml", "ai", "data analysis", "statistics", "aws", "gcp", 
        "azure", "docker", "kubernetes", "git", "linux", "html", "css", "mongodb",
        "postgresql", "mysql", "redis", "elasticsearch", "tensorflow", "pytorch",
        "pandas", "numpy", "scikit-learn", "django", "flask", "fastapi", "express",
        "angular", "vue", "typescript", "golang", "rust", "scala", "r programming",
        "tableau", "power bi", "spark", "hadoop", "kafka", "jenkins", "ci/cd"
    ]
    content_lower = content.lower()
    for skill in common_skills:
        if skill in content_lower:
            skills_list.append(skill.title())

    # Extract education information
    education_keywords = ["bachelor", "master", "phd", "degree", "university", "college", "b.tech", "m.tech", "mba"]
    education_info = []
    for line in content.split('\n'):
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in education_keywords):
            education_info.append(line.strip())

    # Extract experience
    experience_years = 0
    experience_matches = re.findall(r'(\d+)\+?\s*years?\s*(?:of\s*)?experience', content_lower)
    if experience_matches:
        experience_years = max([int(match) for match in experience_matches])

    # Extract location
    location = ""
    location_patterns = [
        r'([A-Z][a-z]+,\s*[A-Z][a-z]+)',  # City, State
        r'([A-Z][a-z]+,\s*[A-Z]{2})',     # City, ST
    ]
    for pattern in location_patterns:
        matches = re.findall(pattern, content)
        if matches:
            location = matches[0]
            break

    extracted = {
        "emails": list(set(emails)),
        "phones": list(set(phones)),
        "skills": list(sorted(set(skills_list))),
        "education": education_info,
        "experience_years": experience_years,
        "location": location
    }

    # Auto-populate user profile with extracted data
    current_profile = {}
    try:
        current_profile = await firestore_service.get_user_profile(user_id) or {}
    except:
        pass

    # Update profile with resume data (don't overwrite existing data)
    profile_updates = {
        "extracted_from_resume": extracted,
        "resume_parsed_at": datetime.now().isoformat()
    }
    
    # Only update profile fields if they're empty
    if not current_profile.get("skills") and skills_list:
        profile_updates["skills"] = skills_list
    
    if not current_profile.get("experience_years") and experience_years:
        profile_updates["experience_years"] = experience_years
        
    if not current_profile.get("location") and location:
        profile_updates["location"] = location

    # If we found education info, try to extract field of study
    if education_info and not current_profile.get("field_of_study"):
        # Simple heuristic to extract field of study
        edu_text = " ".join(education_info).lower()
        fields = ["computer science", "engineering", "business", "marketing", "data science", 
                 "information technology", "mathematics", "physics", "chemistry", "biology"]
        for field in fields:
            if field in edu_text:
                profile_updates["field_of_study"] = field.title()
                break

    await firestore_service.update_user_profile(user_id, profile_updates)
    
    return {"ok": True, "extracted": extracted, "profile_updated": True}


@router.get("/recommendations")
async def get_recommendations(token: str = Depends(security)):
    payload = verify_token(token.credentials)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Attempt to read latest recommendation; fallback to simple sample
    try:
        profile = await firestore_service.get_user_profile(user_id)
    except Exception:
        profile = None

    # Basic sample data first
    recs = [
        {"id":"sw-dev-001","title":"Software Developer","match":0.86},
        {"id":"data-sci-001","title":"Data Scientist","match":0.82},
        {"id":"pm-001","title":"Product Manager","match":0.76}
    ]
    return {"items": recs, "profile_present": bool(profile)}


@router.post("/chat")
async def chat(body: Dict[str, Any], token: str = Depends(security)):
    payload = verify_token(token.credentials)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    msg = body.get("message", "")
    history = body.get("history", [])
    ai = await gemini.generate_chat_response(msg, history, "You are an AI career advisor for Indian students.")
    return ai
