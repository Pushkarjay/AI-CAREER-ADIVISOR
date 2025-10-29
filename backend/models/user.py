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


class CertificationItem(BaseModel):
    """Individual certification entry."""
    name: str
    issuer: Optional[str] = None
    year: Optional[str] = None
    url: Optional[str] = None


class ProjectItem(BaseModel):
    """Individual project entry."""
    name: str
    description: Optional[str] = None
    technologies: Optional[List[str]] = []
    url: Optional[str] = None


class InternshipItem(BaseModel):
    """Individual internship entry."""
    company: str
    role: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None


class ResumeMetadata(BaseModel):
    """Resume metadata and parsing information."""
    url: Optional[str] = None
    filename: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    file_size: Optional[int] = None
    confidence_score: Optional[float] = None
    parsed_data: Optional[Dict[str, Any]] = None
    version: int = 1  # For tracking resume versions


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
    
    # Resume-related fields
    resume_url: Optional[str] = None  # Deprecated: use resume.url instead
    resume: Optional[ResumeMetadata] = None  # New structured resume metadata
    resume_parsed_at: Optional[datetime] = None
    
    # New fields from resume parsing
    certifications: List[CertificationItem] = []
    projects: List[ProjectItem] = []
    internships: List[InternshipItem] = []
    languages: List[str] = []  # Spoken languages
    
    # Data tracking
    data_sources: Optional[Dict[str, str]] = None  # Track which fields came from resume vs manual
    
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
    certifications: List[CertificationItem] = []
    projects: List[ProjectItem] = []
    internships: List[InternshipItem] = []
    languages: List[str] = []


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
    certifications: Optional[List[CertificationItem]] = None
    projects: Optional[List[ProjectItem]] = None
    internships: Optional[List[InternshipItem]] = None
    languages: Optional[List[str]] = None


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