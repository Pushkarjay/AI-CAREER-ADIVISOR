"""Alias endpoints to match final architecture simple paths under /api/*.

These endpoints forward to existing logic in profiles, careers, and chat modules.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import HTTPBearer
from typing import Optional, Dict, Any

from core.security import verify_token
from services.firestore_service import FirestoreService
from services.gemini_service_real import GeminiService

import re

router = APIRouter()
security = HTTPBearer()

# Initialize Firestore service
firestore_service = FirestoreService()

gemini = GeminiService()


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
    """Very simple resume parsing via regex as placeholder; spaCy model loading can be heavy, so keep lightweight.
    Extract emails, phone numbers, and naive skills list.
    """
    payload = verify_token(token.credentials)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    content = (await file.read()).decode(errors="ignore")
    emails = re.findall(r"[\w\.-]+@[\w\.-]+", content)
    phones = re.findall(r"\+?\d[\d\s\-]{8,}\d", content)

    # naive skills extraction
    skills_list = []
    common_skills = [
        "python","javascript","react","node","java","c#","sql","nosql","ml","machine learning",
        "data analysis","statistics","aws","gcp","azure","docker","kubernetes","git","linux"
    ]
    content_l = content.lower()
    for sk in common_skills:
        if sk in content_l:
            skills_list.append(sk)

    extracted = {
        "emails": list(set(emails)),
        "phones": list(set(phones)),
        "skills": list(sorted(set(skills_list))),
    }

    # Store on profile
    await firestore_service.update_user_profile(user_id, {"extracted_from_resume": extracted})
    return {"ok": True, "extracted": extracted}


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
