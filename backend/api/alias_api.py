"""Alias endpoints to match final architecture simple paths under /api/*.

These endpoints forward to existing logic in profiles, careers, and chat modules.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.security import HTTPBearer
from typing import Optional, Dict, Any
from datetime import datetime
import re
import uuid
import logging
import os

from core.security import verify_token
from services.firestore_service import FirestoreService
from services.gemini_service_real import GeminiService
from services.resume_parser import ResumeParser
from data.domains_roadmap import ALL_DOMAIN_SLUGS, DOMAINS_ROADMAP
from agents.base_agent import orchestrator, AgentInput

logger = logging.getLogger(__name__)

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
    # Use update (merge) semantics so it works whether profile exists or not
    await firestore_service.update_user_profile(user_id, profile)
    return {"ok": True, "updated": True}


@router.post("/resume")
async def parse_resume(request: Request, file: UploadFile = File(...), token: str = Depends(security)):
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
                "extracted_data": {}
            }
        
        parsed_data = parse_result["parsed"]
        
        # Store file in Firebase Storage if available, else local uploads fallback
        resume_url = None
        stored = False
        if FIREBASE_STORAGE_AVAILABLE:
            try:
                bucket = storage.bucket()
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
                storage_filename = f"resumes/{user_id}/{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"
                blob = bucket.blob(storage_filename)
                blob.upload_from_string(file_content, content_type=file.content_type)
                blob.make_public()
                resume_url = blob.public_url
                stored = True
                logger.info(f"Resume stored in Firebase Storage: {storage_filename}, URL: {resume_url}")
            except Exception as e:
                logger.warning(f"Failed to store resume in Firebase Storage: {e}")
        if not stored:
            # Local filesystem fallback
            try:
                os.makedirs(os.path.join("uploads", "resumes", user_id), exist_ok=True)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                ext = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
                fname = f"{timestamp}_{uuid.uuid4().hex[:8]}.{ext}"
                fpath = os.path.join("uploads", "resumes", user_id, fname)
                with open(fpath, "wb") as fh:
                    fh.write(file_content)
                rel_path = f"/uploads/resumes/{user_id}/{fname}"
                # Build absolute URL for frontend iframe
                base = str(request.base_url).rstrip('/')
                resume_url = f"{base}{rel_path}"
            except Exception as e:
                print(f"Failed to store resume locally: {e}")
        
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
            "uploadedAt": datetime.now().isoformat(),  # Use camelCase for frontend
            "uploaded_at": datetime.now().isoformat(),  # Keep snake_case for backend
            "parsed": parsed_data,  # Use 'parsed' for frontend consistency
            "parsed_data": parsed_data,  # Keep 'parsed_data' for backend compatibility
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
        
        # Update profile in Firestore (merge/upsert)
        await firestore_service.update_user_profile(user_id, profile_updates)

        # Normalize response shape for frontend client
        return {
            "ok": True,
            "extracted_data": parsed_data,
            "resume": {
                "url": resume_url,
                "filename": file.filename,
                "uploadedAt": resume_metadata["uploadedAt"],
                "confidence_score": confidence
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Resume parsing error in alias_api: {type(e).__name__}: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@router.get("/recommendations")
async def get_recommendations(token: str = Depends(security)):
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
    except Exception as auth_error:
        logger.warning(f"Auth failed for recommendations: {auth_error}")
        # Return fallback data instead of failing
        recs = [
            {
                "id": "sw-dev-001",
                "title": "Software Developer",
                "match_score": 86,
                "required_skills": ["JavaScript", "React", "Node.js", "Python", "SQL"],
                "company": "Tech Companies",
                "salary": "12-25 LPA",
                "location": "Multiple Cities"
            },
            {
                "id": "data-sci-001",
                "title": "Data Scientist",
                "match_score": 82,
                "required_skills": ["Python", "Machine Learning", "Statistics", "SQL"],
                "company": "Analytics Firms", 
                "salary": "10-20 LPA",
                "location": "Multiple Cities"
            },
            {
                "id": "pm-001",
                "title": "Product Manager",
                "match_score": 76,
                "required_skills": ["Communication", "Strategy", "Analytics", "Leadership"],
                "company": "Product Companies",
                "salary": "15-30 LPA", 
                "location": "Multiple Cities"
            },
        ]
        return {"items": recs, "profile_present": False, "auth_error": True}

    try:
        # Get user profile
        profile = await firestore_service.get_user_profile(user_id)
        if not profile:
            # Return fallback data if no profile
            recs = [
                {
                    "id": "sw-dev-001",
                    "title": "Software Developer",
                    "match_score": 86,
                    "required_skills": ["JavaScript", "React", "Node.js", "Python", "SQL"],
                    "company": "Tech Companies",
                    "salary": "12-25 LPA",
                    "location": "Multiple Cities"
                },
                {
                    "id": "data-sci-001", 
                    "title": "Data Scientist",
                    "match_score": 82,
                    "required_skills": ["Python", "Machine Learning", "Statistics", "SQL"],
                    "company": "Analytics Firms",
                    "salary": "10-20 LPA", 
                    "location": "Multiple Cities"
                },
                {
                    "id": "pm-001",
                    "title": "Product Manager", 
                    "match_score": 76,
                    "required_skills": ["Communication", "Strategy", "Analytics", "Leadership"],
                    "company": "Product Companies",
                    "salary": "15-30 LPA",
                    "location": "Multiple Cities"
                },
            ]
            return {"items": recs, "profile_present": False}
        
        # Get the career matches using orchestrator
        agent_input = AgentInput(
            user_id=user_id,
            data={"user_profile": profile}
        )
        
        if "career_match_agent" in orchestrator.agents:
            result = await orchestrator.agents["career_match_agent"].execute(agent_input)
            
            if result.success:
                career_matches = result.result.get("career_matches", [])
                
                # Transform to expected format for frontend
                recs = []
                for match in career_matches[:10]:  # Top 10 recommendations
                    career = match.get("career", {})
                    recs.append({
                        "id": career.get("id", f"career-{len(recs)}"),
                        "title": career.get("title", "Unknown Career"),
                        "match_score": round(match.get("match_score", 0) * 100),
                        "required_skills": career.get("required_skills", []),
                        "company": career.get("company", "Various Companies"),
                        "salary": f"{career.get('salary_range_min', 0)/100000:.0f}-{career.get('salary_range_max', 0)/100000:.0f} LPA" if career.get('salary_range_min') else "Competitive",
                        "location": career.get("location", "Multiple Cities"),
                        "description": career.get("description", ""),
                        "experience_level": career.get("experience_level", "entry")
                    })
                
                if recs:
                    return {"items": recs, "profile_present": True}
        
        # Fallback if agent fails
        recs = [
            {
                "id": "sw-dev-001",
                "title": "Software Developer",
                "match_score": 86, 
                "required_skills": ["JavaScript", "React", "Node.js", "Python", "SQL"],
                "company": "Tech Companies",
                "salary": "12-25 LPA",
                "location": "Multiple Cities"
            },
            {
                "id": "data-sci-001",
                "title": "Data Scientist", 
                "match_score": 82,
                "required_skills": ["Python", "Machine Learning", "Statistics", "SQL"],
                "company": "Analytics Firms",
                "salary": "10-20 LPA",
                "location": "Multiple Cities"
            },
            {
                "id": "pm-001",
                "title": "Product Manager",
                "match_score": 76,
                "required_skills": ["Communication", "Strategy", "Analytics", "Leadership"],
                "company": "Product Companies",
                "salary": "15-30 LPA",
                "location": "Multiple Cities"
            },
        ]
        return {"items": recs, "profile_present": True}
        
    except Exception as e:
        logger.error(f"Error getting recommendations for user {user_id}: {e}")
        # Return fallback data on error
        recs = [
            {
                "id": "sw-dev-001",
                "title": "Software Developer",
                "match_score": 86,
                "required_skills": ["JavaScript", "React", "Node.js", "Python", "SQL"],
                "company": "Tech Companies",
                "salary": "12-25 LPA",
                "location": "Multiple Cities"
            },
            {
                "id": "data-sci-001",
                "title": "Data Scientist",
                "match_score": 82, 
                "required_skills": ["Python", "Machine Learning", "Statistics", "SQL"],
                "company": "Analytics Firms",
                "salary": "10-20 LPA",
                "location": "Multiple Cities"
            },
            {
                "id": "pm-001",
                "title": "Product Manager",
                "match_score": 76,
                "required_skills": ["Communication", "Strategy", "Analytics", "Leadership"],
                "company": "Product Companies",
                "salary": "15-30 LPA",
                "location": "Multiple Cities"
            },
        ]
        return {"items": recs, "profile_present": False}


@router.get("/careers")
async def get_careers(token: str = Depends(security)):
    """Get all available careers for the Careers page - returns all 76 roadmap domains."""
    payload = verify_token(token.credentials)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        # Use all domain roadmaps as careers (76 domains)
        careers = []
        for slug in ALL_DOMAIN_SLUGS:
            data = DOMAINS_ROADMAP.get(slug, {})
            careers.append({
                "id": slug,  # Use domain slug as career ID
                "title": data.get("title", slug.replace('-', ' ').title()),
                "description": data.get("description", f"Career path for {slug.replace('-', ' ')}"),
                "avgSalary": 900000,  # Default salary
                "requiredSkills": data.get("prerequisites", []) or data.get("learning_path", [])[:5] or ["Communication", "Problem Solving"],
                "difficulty": data.get("difficulty", "intermediate"),
                "estimated_completion": data.get("estimated_completion", "6-12 months"),
                "related_domains": data.get("related_domains", []),
                "domain_id": slug,
            })

        logger.info(f"Returning {len(careers)} careers from roadmap domains")
        return {"careers": careers}
        
    except Exception as e:
        logger.error(f"Error fetching careers: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch careers")


@router.get("/roadmaps")
async def get_roadmaps():
    """Get all available roadmaps/domains for the roadmaps page. Public endpoint."""
    # Make this public - no authentication required to browse roadmaps
    user_id = None  # No user context for public endpoint
    
    try:
        # Try to get domains from database first
        domains_from_db = await firestore_service.get_all_domains(limit=100)
        
        roadmaps = []
        
        if domains_from_db:
            # Use domains from database
            for domain in domains_from_db:
                roadmaps.append({
                    "domain_id": domain.get("domain_id", "unknown"),
                    "title": domain.get("title", "Unknown Domain"),
                    "description": domain.get("description", "Domain description"),
                    "difficulty_level": domain.get("difficulty", "intermediate"),
                    "estimated_completion": domain.get("estimated_completion", "6-12 months"),
                    "prerequisites": domain.get("prerequisites", []),
                    "learning_path": domain.get("learning_path", []),
                    "related_domains": domain.get("related_domains", []),
                    "match_score": 0  # Will be calculated by frontend based on user profile
                })
        else:
            # Fallback to hardcoded data if database is empty
            for slug in ALL_DOMAIN_SLUGS:
                data = DOMAINS_ROADMAP.get(slug, {})
                roadmaps.append({
                    "domain_id": slug,
                    "title": data.get("title", slug.replace('-', ' ').title()),
                    "description": data.get("description", f"Domain for {slug.replace('-', ' ')}"),
                    "difficulty_level": data.get("difficulty", "intermediate"),
                    "estimated_completion": data.get("estimated_completion", "6-12 months"),
                    "prerequisites": data.get("prerequisites", []),
                    "learning_path": data.get("learning_path", []),
                    "related_domains": data.get("related_domains", []),
                    "match_score": 0
                })

        return {"items": roadmaps}
        
    except Exception as e:
        logger.error(f"Error fetching roadmaps: {e}")
        # Fallback to hardcoded data in case of any error
        roadmaps = []
        for slug in ALL_DOMAIN_SLUGS:
            data = DOMAINS_ROADMAP.get(slug, {})
            roadmaps.append({
                "domain_id": slug,
                "title": data.get("title", slug.replace('-', ' ').title()),
                "description": data.get("description", f"Domain for {slug.replace('-', ' ')}"),
                "difficulty_level": data.get("difficulty", "intermediate"),
                "estimated_completion": data.get("estimated_completion", "6-12 months"),
                "prerequisites": data.get("prerequisites", []),
                "learning_path": data.get("learning_path", []),
                "related_domains": data.get("related_domains", []),
                "match_score": 0
            })
        
        return {"items": roadmaps}


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
