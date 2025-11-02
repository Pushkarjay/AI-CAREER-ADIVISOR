"""Profile API endpoints for user profile management."""

from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Request
from typing import Optional
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging

from models.user import UserProfile, UserProfileCreate, UserProfileUpdate
from core.security import verify_token
from services.firestore_service import FirestoreService
from agents.base_agent import orchestrator, AgentInput

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

firestore_service = FirestoreService()


@router.get("/me", response_model=UserProfile)
async def get_my_profile(token: str = Depends(security)):
    """Get current user's profile."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        profile_data = await firestore_service.get_user_profile(user_id)
        
        if not profile_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return UserProfile(**profile_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get profile"
        )


@router.post("/", response_model=UserProfile)
async def create_profile(profile_data: UserProfileCreate, token: str = Depends(security)):
    """Create user profile."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Execute profile agent to process and validate data
        agent_input = AgentInput(
            user_id=user_id,
            data={"profile_form": profile_data.dict()}
        )
        
        if "profile_agent" in orchestrator.agents:
            result = await orchestrator.agents["profile_agent"].execute(agent_input)
            
            if result.success and not result.result.get("validation_errors"):
                final_profile = result.result.get("final_profile", {})
                
                # Convert to UserProfile model
                profile = UserProfile(
                    user_id=user_id,
                    created_at="2024-01-01T00:00:00",
                    updated_at="2024-01-01T00:00:00",
                    **final_profile
                )
                
                return profile
            else:
                errors = result.result.get("validation_errors", ["Profile validation failed"])
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Profile validation errors: {', '.join(errors)}"
                )
        
        # Fallback: save directly
        profile_dict = profile_data.dict()
        await firestore_service.save_user_profile(user_id, profile_dict)
        
        profile = UserProfile(
            user_id=user_id,
            created_at="2024-01-01T00:00:00",
            updated_at="2024-01-01T00:00:00",
            **profile_dict
        )
        
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create profile"
        )


@router.put("/", response_model=UserProfile)
async def update_profile(profile_updates: UserProfileUpdate, token: str = Depends(security)):
    """Update user profile."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Get current profile
        current_profile = await firestore_service.get_user_profile(user_id)
        if not current_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        # Update profile
        update_data = profile_updates.dict(exclude_unset=True)
        await firestore_service.update_user_profile(user_id, update_data)
        
        # Get updated profile
        updated_profile = await firestore_service.get_user_profile(user_id)
        return UserProfile(**updated_profile)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.post("/upload-resume")
async def upload_resume(request: Request, file: UploadFile = File(...), token: str = Depends(security)):
    """Upload, store, parse resume and update user profile; returns resume metadata for preview and confirmation."""
    from services.resume_parser import ResumeParser
    try:
        logger.info(f"📤 Resume upload started: {file.filename}, size: {file.size if hasattr(file, 'size') else 'unknown'}")
        
        # Optional Firebase Storage
        try:
            import firebase_admin  # noqa: F401
            from firebase_admin import storage as fb_storage
            FIREBASE_STORAGE_AVAILABLE = True
            logger.info("✅ Firebase Storage is available")
        except Exception as fb_err:
            FIREBASE_STORAGE_AVAILABLE = False
            logger.info(f"⚠️ Firebase Storage not available: {fb_err}")

        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
        
        logger.info(f"👤 User ID: {user_id}")

        # Read file
        content_bytes = await file.read()
        file_size = len(content_bytes)
        logger.info(f"📄 File read successfully: {file_size} bytes")

        # Parse using ResumeParser
        parser = ResumeParser()
        parsed_result = None
        extracted_data = {}
        parsing_successful = False
        
        try:
            logger.info("🔍 Starting resume parsing...")
            parsed_result = await parser.parse_file(content_bytes, file.filename)
            extracted_data = parsed_result.get("parsed") if parsed_result.get("success") else {}
            parsing_successful = parsed_result.get("success", False)
            logger.info(f"✅ Parsing {'successful' if parsing_successful else 'failed'}")
        except Exception as pe:
            logger.warning(f"Resume parsing error, falling back to raw decode: {pe}")
            # Fallback minimal extraction: raw text only
            extracted_data = {
                "skills": [],
                "education_history": [],
                "experience_years": 0,
                "raw_text": content_bytes.decode('utf-8', errors='ignore')[:1000],
                "confidence_score": 0,
                "certifications": [],
                "projects": [],
                "languages": []
            }

        # Try to store the file: Firebase first, else local fallback (/uploads)
        resume_url = None
        stored = False
        if FIREBASE_STORAGE_AVAILABLE:
            try:
                bucket = fb_storage.bucket()
                from datetime import datetime as _dt
                import uuid as _uuid
                ts = _dt.now().strftime("%Y%m%d_%H%M%S")
                ext = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
                storage_path = f"resumes/{user_id}/{ts}_{_uuid.uuid4().hex[:8]}.{ext}"
                blob = bucket.blob(storage_path)
                blob.upload_from_string(content_bytes, content_type=file.content_type)
                blob.make_public()
                resume_url = blob.public_url
                stored = True
                logger.info(f"Resume stored in Firebase Storage: {storage_path}, URL: {resume_url}")
            except Exception as se:
                logger.warning(f"Firebase Storage upload failed; will fallback to local: {se}")
        
        if not stored:
            try:
                import os
                from datetime import datetime as _dt
                import uuid as _uuid
                os.makedirs(os.path.join("uploads", "resumes", user_id), exist_ok=True)
                ts = _dt.now().strftime("%Y%m%d_%H%M%S")
                ext = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
                fname = f"{ts}_{_uuid.uuid4().hex[:8]}.{ext}"
                fpath = os.path.join("uploads", "resumes", user_id, fname)
                with open(fpath, "wb") as fh:
                    fh.write(content_bytes)
                rel = f"/uploads/resumes/{user_id}/{fname}"
                # Always build absolute URL using request.base_url
                base = str(request.base_url).rstrip('/')
                resume_url = f"{base}{rel}"
                logger.info(f"Resume stored locally at: {fpath}, URL: {resume_url}")
            except Exception as le:
                logger.error(f"Local resume store failed: {le}")

        # Get current profile or create empty one
        try:
            current_profile = await firestore_service.get_user_profile(user_id) or {}
        except Exception:
            current_profile = {}

        # Track data sources for fields populated from resume
        data_sources = current_profile.get("data_sources", {})
        
        # Build comprehensive resume metadata
        from datetime import datetime as _dt
        resume_meta = {
            "url": resume_url,
            "filename": file.filename,
            "uploadedAt": _dt.now().isoformat(),  # Use camelCase for frontend compatibility
            "uploaded_at": _dt.now().isoformat(),  # Keep snake_case for backend compatibility
            "file_size": file_size,
            "confidence_score": extracted_data.get("confidence_score", 0),
            "parsed": extracted_data,  # Use 'parsed' for frontend consistency
            "parsed_data": extracted_data,  # Keep 'parsed_data' for backend compatibility
            "version": current_profile.get("resume", {}).get("version", 0) + 1,  # Increment version
        }
        
        # Prepare profile updates with resume data
        updates = {
            "resume": resume_meta, 
            "resume_parsed_at": _dt.now().isoformat()
        }

        # Auto-populate profile fields from parsed data if not already set
        # Name
        if not current_profile.get("name") and extracted_data.get("full_name"):
            updates["name"] = extracted_data["full_name"]
            data_sources["name"] = "resume"
        
        # Skills - merge with existing
        existing_skills = current_profile.get("skills", [])
        if isinstance(existing_skills, str):
            existing_skills = [s.strip() for s in existing_skills.split(',') if s.strip()]
        parsed_skills = extracted_data.get("skills", [])
        if parsed_skills:
            merged_skills = list(set(existing_skills + parsed_skills))
            updates["skills"] = merged_skills
            data_sources["skills"] = "resume_merged" if existing_skills else "resume"
        
        # Experience years
        if not current_profile.get("experience_years") and extracted_data.get("experience_years"):
            updates["experience_years"] = extracted_data["experience_years"]
            data_sources["experience_years"] = "resume"
        
        # Education (store raw parsed data in additional_info if not already populated)
        if extracted_data.get("education_history") and not current_profile.get("education_level"):
            # Try to extract degree level from first education entry
            first_edu = extracted_data["education_history"][0] if extracted_data["education_history"] else {}
            if first_edu.get("degree"):
                updates["education_level"] = first_edu["degree"]
                data_sources["education_level"] = "resume"
        
        # Certifications - merge with existing
        existing_certs = current_profile.get("certifications", [])
        parsed_certs = extracted_data.get("certifications", [])
        if parsed_certs:
            # Convert parsed certs to proper format
            formatted_certs = [
                {
                    "name": cert.get("name", cert.get("raw_text", "")),
                    "issuer": cert.get("issuer", ""),
                    "year": cert.get("year", ""),
                    "url": ""
                }
                for cert in parsed_certs
            ]
            # Merge with existing (avoid duplicates by name)
            existing_names = {c.get("name", "").lower() for c in existing_certs}
            new_certs = [c for c in formatted_certs if c["name"].lower() not in existing_names]
            if new_certs:
                updates["certifications"] = existing_certs + new_certs
                data_sources["certifications"] = "resume_merged" if existing_certs else "resume"
        
        # Projects - merge with existing
        existing_projects = current_profile.get("projects", [])
        parsed_projects = extracted_data.get("projects", [])
        if parsed_projects:
            # Convert parsed projects to proper format
            formatted_projects = [
                {
                    "name": proj.get("name", ""),
                    "description": proj.get("description", ""),
                    "technologies": [],
                    "url": ""
                }
                for proj in parsed_projects
            ]
            # Merge with existing (avoid duplicates by name)
            existing_names = {p.get("name", "").lower() for p in existing_projects}
            new_projects = [p for p in formatted_projects if p["name"].lower() not in existing_names]
            if new_projects:
                updates["projects"] = existing_projects + new_projects
                data_sources["projects"] = "resume_merged" if existing_projects else "resume"
        
        # Languages - merge with existing
        existing_languages = current_profile.get("languages", [])
        parsed_languages = extracted_data.get("languages", [])
        if parsed_languages:
            merged_languages = list(set(existing_languages + parsed_languages))
            updates["languages"] = merged_languages
            data_sources["languages"] = "resume_merged" if existing_languages else "resume"
        
        # Internships - merge with existing
        existing_internships = current_profile.get("internships", [])
        parsed_internships = extracted_data.get("internships", [])
        if parsed_internships:
            # Convert parsed internships to proper format
            formatted_internships = [
                {
                    "company": internship.get("company", ""),
                    "role": internship.get("role", ""),
                    "duration": internship.get("duration", ""),
                    "description": internship.get("description", ""),
                    "location": internship.get("location", "")
                }
                for internship in parsed_internships
                if internship.get("company")  # Only include if company name exists
            ]
            # Merge with existing (avoid duplicates by company+role)
            existing_keys = {(i.get("company", "").lower(), i.get("role", "").lower()) for i in existing_internships}
            new_internships = [
                i for i in formatted_internships 
                if (i["company"].lower(), i["role"].lower()) not in existing_keys
            ]
            if new_internships:
                updates["internships"] = existing_internships + new_internships
                data_sources["internships"] = "resume_merged" if existing_internships else "resume"
        
        # Update data_sources tracking
        updates["data_sources"] = data_sources

        # Save profile updates
        update_ok = True
        try:
            await firestore_service.update_user_profile(user_id, updates)
        except Exception as ue:
            logger.error(f"Profile update failed after resume upload: {ue}")
            update_ok = False

        # Return comprehensive confirmation with preview data
        return {
            "success": True,
            "message": "Resume uploaded and parsed successfully",
            "upload_confirmed": stored or (resume_url is not None),
            "parsing_successful": parsing_successful,
            "storage_location": "firebase" if stored else "local",
            "resume": {
                "url": resume_url,
                "filename": file.filename,
                "uploadedAt": resume_meta["uploadedAt"],  # Use camelCase
                "uploaded_at": resume_meta["uploaded_at"],  # Keep both for compatibility
                "file_size": file_size,
                "confidence_score": resume_meta.get("confidence_score", 0),
                "version": resume_meta.get("version", 1),
                "parsed": extracted_data,  # Include parsed data in response
            },
            "extracted_data": extracted_data,
            "profile_updated": update_ok,
            "fields_updated": list(updates.keys()),
            "data_sources": data_sources,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to upload resume: {type(e).__name__}: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload resume: {str(e)}"
        )


@router.get("/skill-gap-analysis")
async def get_skill_gap_analysis(career_id: Optional[str] = None, token: str = Depends(security)):
    """Get skill gap analysis for user profile."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Get user profile
        user_profile = await firestore_service.get_user_profile(user_id)
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile required for skill gap analysis"
            )
        
        # Mock target career if not provided
        target_career = {
            "id": career_id or "sw-dev-001",
            "title": "Software Developer",
            "required_skills": ["Python", "JavaScript", "SQL", "Git", "React"],
            "preferred_skills": ["AWS", "Docker", "Node.js"]
        }
        
        # Execute skill gap agent
        agent_input = AgentInput(
            user_id=user_id,
            data={
                "user_profile": user_profile,
                "target_career": target_career
            }
        )
        
        if "skill_gap_agent" in orchestrator.agents:
            result = await orchestrator.agents["skill_gap_agent"].execute(agent_input)
            
            if result.success:
                return result.result
        
        # Fallback mock analysis
        return {
            "skill_gaps": [
                {
                    "skill_name": "React",
                    "importance_level": 8.0,
                    "current_proficiency": 2.0,
                    "required_proficiency": 7.0,
                    "gap_score": 5.0,
                    "learning_resources": []
                }
            ],
            "overall_readiness": 65.0,
            "priority_skills": ["React", "SQL", "Git"],
            "time_estimates": {
                "total_weeks": 12,
                "total_hours": 120
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get skill gap analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform skill gap analysis"
        )


@router.get("/learning-resources")
async def get_learning_resources(token: str = Depends(security)):
    """Get personalized learning resources."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        
        # Get user profile
        user_profile = await firestore_service.get_user_profile(user_id)
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile required for resource recommendations"
            )
        
        # Mock skill gaps for resource suggestions
        skill_gaps = [
            {"skill_name": "React", "gap_score": 5.0},
            {"skill_name": "SQL", "gap_score": 4.0}
        ]
        
        # Execute resource suggest agent
        agent_input = AgentInput(
            user_id=user_id,
            data={
                "user_profile": user_profile,
                "skill_gaps": skill_gaps
            }
        )
        
        if "resource_suggest_agent" in orchestrator.agents:
            result = await orchestrator.agents["resource_suggest_agent"].execute(agent_input)
            
            if result.success:
                return result.result
        
        # Fallback mock resources
        return {
            "course_recommendations": [
                {
                    "title": "React Complete Course",
                    "provider": "Udemy",
                    "url": "https://udemy.com/react-course",
                    "type": "course",
                    "duration": "40 hours",
                    "cost": "₹3,000",
                    "rating": 4.7,
                    "difficulty_level": "beginner",
                    "skills_covered": ["React", "JavaScript"]
                }
            ],
            "certification_recommendations": [],
            "internship_opportunities": [],
            "project_ideas": []
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get learning resources: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get learning resources"
        )