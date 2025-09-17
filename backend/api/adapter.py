"""Adapter routes to align simplified frontend API expectations with existing v1 modules.

Exposes:
- POST /api/profile -> profiles.create_profile
- POST /api/resume -> profiles.upload_resume
- GET /api/recommendations -> careers.get_career_recommendations
- POST /api/chat -> chat.send_message (unauth fallback to /chat/test if no token)
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer
from typing import Optional, Dict, Any

from . import profiles as profiles_mod
from . import careers as careers_mod
from . import chat as chat_mod
from core.security import verify_token
from pydantic import BaseModel, RootModel

router = APIRouter()
security = HTTPBearer(auto_error=False)


class ProfilePayload(RootModel[Dict[str, Any]]):
    # Free-form schema passthrough to existing model in profiles module
    # We don't re-validate here; the called handler validates
    pass


class ChatPayload(BaseModel):
    message: str
    session_id: Optional[str] = None


@router.post("/profile")
async def save_profile(payload: ProfilePayload, token = Depends(security)):
    if token and token.credentials:
        # Call into profiles.create_profile with proper model
        # Reuse the endpoint by constructing the expected Pydantic type
        from models.user import UserProfileCreate
        try:
            data = payload.root
            model = UserProfileCreate(**data)
        except Exception:
            # Let underlying handler handle validation
            model = payload.root  # type: ignore
        return await profiles_mod.create_profile(model, token=token)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


@router.post("/resume")
async def parse_resume(file: UploadFile = File(...), token = Depends(security)):
    if token and token.credentials:
        return await profiles_mod.upload_resume(file=file, token=token)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


@router.get("/recommendations")
async def recommendations(token = Depends(security)):
    if token and token.credentials:
        return await careers_mod.get_career_recommendations(token=token)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


@router.post("/chat")
async def chat(payload: ChatPayload, token = Depends(security)):
    if token and token.credentials:
        return await chat_mod.send_message(chat_mod.ChatRequest(**payload.dict()), token=token)
    # if no token, allow test endpoint for UX during unauth
    return await chat_mod.test_chat(chat_mod.ChatRequest(**payload.dict()))
