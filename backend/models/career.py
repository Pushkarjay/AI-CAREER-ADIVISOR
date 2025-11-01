"""Career-related Pydantic models."""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class CareerLevel(str, Enum):
    """Career level enumeration."""
    ENTRY = "entry"
    MID = "mid"
    SENIOR = "senior"
    EXECUTIVE = "executive"


class IndustryType(str, Enum):
    """Industry type enumeration."""
    TECHNOLOGY = "technology"
    HEALTHCARE = "healthcare"
    FINANCE = "finance"
    EDUCATION = "education"
    MANUFACTURING = "manufacturing"
    RETAIL = "retail"
    GOVERNMENT = "government"
    NONPROFIT = "nonprofit"
    CONSULTING = "consulting"
    MEDIA = "media"


class CareerBase(BaseModel):
    """Base career model."""
    title: str = Field(..., min_length=2, max_length=200)
    industry: IndustryType
    description: str = Field(..., min_length=10, max_length=2000)
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    education_requirements: List[str] = []
    experience_level: CareerLevel
    salary_range_min: Optional[int] = Field(None, ge=0)
    salary_range_max: Optional[int] = Field(None, ge=0)
    location_flexibility: bool = True
    growth_potential: float = Field(..., ge=0.0, le=10.0)


class Career(CareerBase):
    """Complete career model."""
    id: str
    demand_score: float = Field(..., ge=0.0, le=10.0)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CareerMatch(BaseModel):
    """Career match result model."""
    career: Career
    match_score: float = Field(..., ge=0.0, le=100.0)
    skill_match_percentage: float = Field(..., ge=0.0, le=100.0)
    missing_skills: List[str] = []
    matching_skills: List[str] = []
    recommendation_reason: str


class CareerRecommendation(BaseModel):
    """Career recommendation model."""
    user_id: str
    recommended_careers: List[CareerMatch]
    generated_at: datetime
    confidence_score: float = Field(..., ge=0.0, le=100.0)
    methodology: str


class SkillGap(BaseModel):
    """Skill gap analysis model."""
    skill_name: str
    importance_level: float = Field(..., ge=0.0, le=10.0)
    current_proficiency: float = Field(..., ge=0.0, le=10.0)
    required_proficiency: float = Field(..., ge=0.0, le=10.0)
    gap_score: float = Field(..., ge=0.0, le=10.0)
    learning_resources: List[Dict[str, Any]] = []


class SkillGapAnalysis(BaseModel):
    """Complete skill gap analysis model."""
    user_id: str
    career_id: str
    skill_gaps: List[SkillGap]
    overall_readiness: float = Field(..., ge=0.0, le=100.0)
    estimated_learning_time: int = Field(..., ge=0)  # in weeks
    priority_skills: List[str] = []
    generated_at: datetime


class LearningResource(BaseModel):
    """Learning resource model."""
    title: str
    provider: str
    url: str
    type: str  # course, certification, book, video, etc.
    duration: Optional[str] = None
    cost: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)
    difficulty_level: str  # beginner, intermediate, advanced
    skills_covered: List[str] = []


class ResourceRecommendation(BaseModel):
    """Resource recommendation model."""
    user_id: str
    skill_name: str
    recommended_resources: List[LearningResource]
    generated_at: datetime
    personalization_factors: List[str] = []


class SkillProgression(BaseModel):
    """Defines progression for a specific skill within a domain roadmap."""
    skill_name: str
    level: str = Field(..., pattern=r"^(beginner|intermediate|advanced)$")
    learning_resources: List[LearningResource] = []
    projects: List[str] = []
    certifications: List[str] = []


class LearningRoadmap(BaseModel):
    """Learning roadmap for a domain with ordered learning path and metadata."""
    domain_id: str
    title: str
    description: str
    difficulty_level: str = Field(..., pattern=r"^(beginner|intermediate|advanced|mixed)$")
    learning_path: List[str] = []  # ordered steps
    prerequisites: List[str] = []
    estimated_time: str | None = None
    related_domains: List[str] = []
    universal_foundations: List[str] = []


# Extend Career to include roadmap integration fields
class CareerWithRoadmap(Career):
    """Career model with roadmap integration fields (non-breaking alternative)."""
    learning_roadmap_id: Optional[str] = None
    skill_progressions: List[SkillProgression] = []
    career_path_stages: List[str] = []


class JobSearchRequest(BaseModel):
    """Job search request model."""
    search_term: str = Field(..., min_length=1, max_length=200)
    location: str = Field(default="India", max_length=200)
    results_wanted: int = Field(default=20, ge=1, le=100)
    hours_old: int = Field(default=72, ge=1, le=720)
    country_indeed: str = Field(default="India", max_length=100)
    google_search_term: Optional[str] = Field(None, max_length=500)
    site_name: Optional[List[str]] = None
    linkedin_fetch_description: bool = False


class Job(BaseModel):
    """Job listing model."""
    id: str
    title: str
    company: str
    location: str
    job_type: Optional[str] = None
    date_posted: Optional[str] = None
    salary_source: Optional[str] = None
    interval: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    currency: Optional[str] = None
    is_remote: bool = False
    job_url: Optional[str] = None
    job_url_direct: Optional[str] = None
    site: str
    description: Optional[str] = None
    emails: List[str] = []
    company_url: Optional[str] = None
    company_url_direct: Optional[str] = None
    company_addresses: Optional[str] = None
    company_num_employees: Optional[str] = None
    company_revenue: Optional[str] = None
    company_description: Optional[str] = None
    ceo_name: Optional[str] = None
    ceo_photo_url: Optional[str] = None
    logo_photo_url: Optional[str] = None
    banner_photo_url: Optional[str] = None

    class Config:
        from_attributes = True


class JobSearchResponse(BaseModel):
    """Job search response model."""
    jobs: List[Job]
    total_count: int
    search_term: str
    location: str
    timestamp: datetime