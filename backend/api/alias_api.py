"""Alias endpoints to match final architecture simple paths under /api/*.

These endpoints forward to existing logic in profiles, careers, and chat modules.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import HTTPBearer
from typing import Optional, Dict, Any
from datetime import datetime
import re
import uuid

from core.security import verify_token
from services.firestore_service import FirestoreService
from services.gemini_service_real import GeminiService
from services.resume_parser import ResumeParser

# Firebase storage imports
try:
    import firebase_admin
    from firebase_admin import storage
    FIREBASE_STORAGE_AVAILABLE = True
except ImportError:
    FIREBASE_STORAGE_AVAILABLE = False

router = APIRouter()
security = HTTPBearer()

# Initialize services
firestore_service = FirestoreService()
gemini = GeminiService()
resume_parser = ResumeParser()


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
    """Enhanced resume parsing with profile auto-population and file storage."""
    payload = verify_token(token.credentials)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        # Read file content
        file_content = await file.read()
        
        # Parse resume using the new resume parser
        parse_result = await resume_parser.parse_file(file_content, file.filename)
        
        if not parse_result["success"]:
            return {
                "ok": False, 
                "error": parse_result.get("error", "Failed to parse resume"),
                "extracted": {}
            }
        
        parsed_data = parse_result["parsed"]
        
        # Store file in Firebase Storage (if available)
        resume_url = None
        if FIREBASE_STORAGE_AVAILABLE:
            try:
                bucket = storage.bucket()
                
                # Create unique filename
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
                storage_filename = f"resumes/{user_id}/{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"
                
                # Upload file
                blob = bucket.blob(storage_filename)
                blob.upload_from_string(file_content, content_type=file.content_type)
                
                # Make file publicly readable (or use signed URLs)
                blob.make_public()
                resume_url = blob.public_url
                
            except Exception as e:
                # Log error but continue - file storage is not critical
                print(f"Failed to store resume file: {e}")
        
        # Get current profile
        current_profile = {}
        try:
            current_profile = await firestore_service.get_user_profile(user_id) or {}
        except Exception:
            pass
        
        # Prepare resume metadata
        resume_metadata = {
            "url": resume_url,
            "filename": file.filename,
            "uploadedAt": datetime.now().isoformat(),
            "parsed": parsed_data,
            "confidence_score": parsed_data.get("confidence_score", 0)
        }
        
        # Update profile with resume data and metadata
        profile_updates = {
            "resume": resume_metadata,
            "resume_parsed_at": datetime.now().isoformat()
        }
        
        # Only update profile fields if they're empty or confidence is high
        confidence = parsed_data.get("confidence_score", 0)
        
        if not current_profile.get("name") and parsed_data.get("full_name"):
            profile_updates["name"] = parsed_data["full_name"]
        
        if not current_profile.get("skills") and parsed_data.get("skills"):
            profile_updates["skills"] = parsed_data["skills"]
        
        if not current_profile.get("education") and parsed_data.get("education_history"):
            # Convert education history to a simpler format for profile
            education_entries = []
            for edu in parsed_data["education_history"]:
                entry = {
                    "degree": edu.get("degree", ""),
                    "institution": edu.get("institution", ""),
                    "year": edu.get("year", "")
                }
                education_entries.append(entry)
            profile_updates["education"] = education_entries
        
        # Extract experience years if found
        if not current_profile.get("experience_years") and parsed_data.get("experience_years", 0) > 0:
            profile_updates["experience_years"] = parsed_data["experience_years"]
        
        # Try to infer field of study from education
        if not current_profile.get("field_of_study") and parsed_data.get("education_history"):
            edu_text = " ".join([edu.get("raw_text", "") for edu in parsed_data["education_history"]]).lower()
            fields = ["computer science", "engineering", "business", "marketing", "data science", 
                     "information technology", "mathematics", "physics", "chemistry", "biology"]
            for field in fields:
                if field in edu_text:
                    profile_updates["field_of_study"] = field.title()
                    break
        
        # Update profile in Firestore
        await firestore_service.update_user_profile(user_id, profile_updates)
        
        return {
            "ok": True, 
            "extracted": parsed_data,
            "resume_url": resume_url,
            "confidence_score": confidence,
            "profile_updated": True
        }
        
    except Exception as e:
        print(f"Resume parsing error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


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


@router.get("/careers")
async def get_careers(token: str = Depends(security)):
    """Get all available careers for the Careers page."""
    payload = verify_token(token.credentials)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Return prototype careers data
    careers = [
        {
            "id": "data-science",
            "title": "Data Scientist",
            "description": "Analyze and interpret complex data to help organizations make data-driven decisions",
            "avgSalary": 950000,
            "requiredSkills": ["Python", "Machine Learning", "Statistics", "SQL", "Pandas", "Numpy", "Tableau"],
            "suggestedCourses": [
                {"title": "Machine Learning Specialization", "provider": "Coursera", "url": "https://coursera.org/ml"},
                {"title": "Data Science with Python", "provider": "edX", "url": "https://edx.org/python-ds"}
            ]
        },
        {
            "id": "full-stack",
            "title": "Full Stack Developer",
            "description": "Build complete web applications using both frontend and backend technologies",
            "avgSalary": 850000,
            "requiredSkills": ["JavaScript", "React", "Node.js", "HTML", "CSS", "SQL", "Git"],
            "suggestedCourses": [
                {"title": "Full Stack Web Development", "provider": "Udemy", "url": "https://udemy.com/fullstack"},
                {"title": "React Developer Path", "provider": "Pluralsight", "url": "https://pluralsight.com/react"}
            ]
        },
        {
            "id": "cybersecurity",
            "title": "Cybersecurity Specialist",
            "description": "Protect organizations from digital threats and implement security measures",
            "avgSalary": 1200000,
            "requiredSkills": ["Network Security", "Ethical Hacking", "Linux", "Python", "Penetration Testing"],
            "suggestedCourses": [
                {"title": "Certified Ethical Hacker", "provider": "EC-Council", "url": "https://eccouncil.org/ceh"},
                {"title": "Cybersecurity Fundamentals", "provider": "Coursera", "url": "https://coursera.org/cybersec"}
            ]
        },
        {
            "id": "ui-ux",
            "title": "UI/UX Designer",
            "description": "Design user interfaces and experiences that are both beautiful and functional",
            "avgSalary": 750000,
            "requiredSkills": ["UI/UX", "Figma", "Adobe XD", "User Research", "Prototyping", "Web Design"],
            "suggestedCourses": [
                {"title": "Google UX Design Certificate", "provider": "Coursera", "url": "https://coursera.org/google-ux"},
                {"title": "UI Design Fundamentals", "provider": "Udacity", "url": "https://udacity.com/ui-design"}
            ]
        },
        {
            "id": "cloud-engineer",
            "title": "Cloud Engineer",
            "description": "Design, deploy, and manage cloud infrastructure and services",
            "avgSalary": 1100000,
            "requiredSkills": ["AWS", "Azure", "Docker", "Kubernetes", "DevOps", "Python", "Linux"],
            "suggestedCourses": [
                {"title": "AWS Solutions Architect", "provider": "AWS", "url": "https://aws.amazon.com/certification"},
                {"title": "Azure Fundamentals", "provider": "Microsoft", "url": "https://docs.microsoft.com/azure"}
            ]
        }
    ]
    
    return {"careers": careers}


@router.get("/profiles/{uid}")
async def get_profile_by_uid(uid: str, token: str = Depends(security)):
    """Get specific user profile by UID."""
    payload = verify_token(token.credentials)
    requesting_user_id = payload.get("user_id")
    
    # Only allow users to access their own profile
    if requesting_user_id != uid:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        profile = await firestore_service.get_user_profile(uid)
        return profile or {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")


@router.post("/profiles/{uid}")
async def update_profile_by_uid(uid: str, profile_data: Dict[str, Any], token: str = Depends(security)):
    """Update specific user profile by UID."""
    payload = verify_token(token.credentials)
    requesting_user_id = payload.get("user_id")
    
    # Only allow users to update their own profile
    if requesting_user_id != uid:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        await firestore_service.update_user_profile(uid, profile_data)
        return {"ok": True, "message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


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
