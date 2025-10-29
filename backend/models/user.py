"""User-related Pydantic models."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User role enumeration."""
    STUDENT = "student"
    ADMIN = "admin"


class UserBase(BaseModel):
    """Base user model."""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    is_active: bool = True
    role: UserRole = UserRole.STUDENT


class UserCreate(UserBase):
    """User creation model."""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """User update model."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    is_active: Optional[bool] = None


class UserProfile(BaseModel):
    """Extended user profile model."""
    user_id: str
    education_level: Optional[str] = None
    field_of_study: Optional[str] = None
    current_year: Optional[int] = None
    location: Optional[str] = None
    interests: List[str] = []
    skills: List[str] = []
    experience_years: Optional[int] = 0
    preferred_industries: List[str] = []
    career_goals: Optional[str] = None
    internships_experience: Optional[str] = None
    additional_info: Optional[str] = None
    resume_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class UserProfileCreate(BaseModel):
    """User profile creation model."""
    education_level: Optional[str] = None
    field_of_study: Optional[str] = None
    current_year: Optional[int] = Field(None, ge=1, le=6)
    location: Optional[str] = None
    interests: List[str] = []
    skills: List[str] = []
    experience_years: Optional[int] = Field(0, ge=0, le=50)
    preferred_industries: List[str] = []
    career_goals: Optional[str] = None
    internships_experience: Optional[str] = None
    additional_info: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """User profile update model."""
    education_level: Optional[str] = None
    field_of_study: Optional[str] = None
    current_year: Optional[int] = Field(None, ge=1, le=6)
    location: Optional[str] = None
    interests: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[int] = Field(None, ge=0, le=50)
    preferred_industries: Optional[List[str]] = None
    career_goals: Optional[str] = None
    internships_experience: Optional[str] = None
    additional_info: Optional[str] = None


class User(UserBase):
    """Complete user model."""
    id: str
    created_at: datetime
    updated_at: datetime
    profile: Optional[UserProfile] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token model."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Token data model."""
    user_id: Optional[str] = None
    email: Optional[str] = None