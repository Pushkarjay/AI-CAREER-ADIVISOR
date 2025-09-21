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
async def upload_resume(request: Request = None, file: UploadFile = File(...), token: str = Depends(security)):
    """Upload, store, parse resume and update user profile; returns resume metadata for preview."""
    # Lazy imports to avoid heavy deps at import time
    from services.resume_parser import ResumeParser
    try:
        # Optional Firebase Storage
        try:
            import firebase_admin  # noqa: F401
            from firebase_admin import storage as fb_storage
            FIREBASE_STORAGE_AVAILABLE = True
        except Exception:
            FIREBASE_STORAGE_AVAILABLE = False

        payload = verify_token(token.credentials)
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

        # Read file
        content_bytes = await file.read()

        # Parse using ResumeParser
        parser = ResumeParser()
        try:
            parsed_result = await parser.parse_file(content_bytes, file.filename)
            extracted_data = parsed_result.get("parsed") if parsed_result.get("success") else {}
        except Exception as pe:
            logger.warning(f"Resume parsing error, falling back to raw decode: {pe}")
            # Fallback minimal extraction: raw text only
            extracted_data = {
                "skills": [],
                "education_history": [],
                "experience_years": 0,
                "raw_text": content_bytes.decode('utf-8', errors='ignore')[:1000],
                "confidence_score": 0
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
                if request is not None:
                    base = str(request.base_url).rstrip('/')
                    resume_url = f"{base}{rel}"
                else:
                    # Fallback to relative URL when Request is not provided
                    resume_url = rel
            except Exception as le:
                logger.error(f"Local resume store failed: {le}")

        # Update profile with resume metadata and parsed fields where sensible
        try:
            current_profile = await firestore_service.get_user_profile(user_id) or {}
        except Exception:
            current_profile = {}

        from datetime import datetime as _dt
        resume_meta = {
            "url": resume_url,
            "filename": file.filename,
            "uploadedAt": _dt.now().isoformat(),
            "confidence_score": extracted_data.get("confidence_score", 0),
            "parsed": extracted_data,
        }
        updates = {"resume": resume_meta, "resume_parsed_at": _dt.now().isoformat()}

        if not current_profile.get("name") and extracted_data.get("full_name"):
            updates["name"] = extracted_data["full_name"]
        if not current_profile.get("skills") and extracted_data.get("skills"):
            updates["skills"] = extracted_data["skills"]
        if not current_profile.get("experience_years") and extracted_data.get("experience_years"):
            updates["experience_years"] = extracted_data["experience_years"]

        update_ok = True
        try:
            await firestore_service.update_user_profile(user_id, updates)
        except Exception as ue:
            logger.error(f"Profile update failed after resume upload: {ue}")
            update_ok = False

        return {
            "message": "Resume uploaded successfully",
            "extracted_data": extracted_data,
            "resume": {
                "url": resume_url,
                "filename": file.filename,
                "uploadedAt": resume_meta["uploadedAt"],
                "confidence_score": resume_meta.get("confidence_score", 0),
            },
            "profile_updated": update_ok,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upload resume: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload resume"
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