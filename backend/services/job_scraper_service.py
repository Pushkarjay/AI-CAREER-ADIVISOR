"""Job scraping service using python-jobspy."""

import csv
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
import pandas as pd
from jobspy import scrape_jobs

logger = logging.getLogger(__name__)


class JobScraperService:
    """Service for scraping job listings from multiple sources."""
    
    def __init__(self):
        """Initialize the job scraper service."""
        self.supported_sites = ["indeed", "linkedin", "zip_recruiter", "google"]
        # Additional sites available: "glassdoor", "bayt", "naukri", "bdjobs"
    
    def scrape_jobs(
        self,
        search_term: str,
        location: str = "India",
        results_wanted: int = 20,
        hours_old: int = 72,
        country_indeed: str = "India",
        google_search_term: Optional[str] = None,
        site_name: Optional[List[str]] = None,
        linkedin_fetch_description: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Scrape job listings from multiple job boards.
        
        Args:
            search_term: Job title or keywords to search for
            location: Location to search in
            results_wanted: Number of results to return
            hours_old: Only include jobs posted within this many hours
            country_indeed: Country code for Indeed searches
            google_search_term: Custom search term for Google jobs
            site_name: List of sites to scrape from
            linkedin_fetch_description: Fetch full job descriptions from LinkedIn (slower)
            
        Returns:
            List of job dictionaries
        """
        try:
            # Use provided sites or default supported sites
            sites = site_name if site_name else self.supported_sites
            
            # Build google search term if not provided
            if not google_search_term and "google" in sites:
                google_search_term = f"{search_term} jobs near {location}"
                if hours_old <= 24:
                    google_search_term += " since yesterday"
            
            logger.info(f"Scraping jobs: {search_term} in {location} from {sites}")
            
            # Scrape jobs using jobspy
            jobs_df = scrape_jobs(
                site_name=sites,
                search_term=search_term,
                google_search_term=google_search_term,
                location=location,
                results_wanted=results_wanted,
                hours_old=hours_old,
                country_indeed=country_indeed,
                linkedin_fetch_description=linkedin_fetch_description
            )
            
            if jobs_df is None or jobs_df.empty:
                logger.warning(f"No jobs found for: {search_term} in {location}")
                return []
            
            logger.info(f"Found {len(jobs_df)} jobs")
            
            # Convert DataFrame to list of dictionaries
            jobs_list = jobs_df.to_dict('records')
            
            # Clean and format the data
            formatted_jobs = self._format_jobs(jobs_list)
            
            return formatted_jobs
            
        except Exception as e:
            logger.error(f"Error scraping jobs: {e}")
            raise
    
    def _format_jobs(self, jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Format and clean job data.
        
        Args:
            jobs: Raw job data from jobspy
            
        Returns:
            Formatted job data
        """
        formatted = []
        
        for job in jobs:
            try:
                # Handle potential None/NaN values
                formatted_job = {
                    "id": self._generate_job_id(job),
                    "title": self._safe_str(job.get("title")),
                    "company": self._safe_str(job.get("company")),
                    "location": self._safe_str(job.get("location")),
                    "job_type": self._safe_str(job.get("job_type")),
                    "date_posted": self._format_date(job.get("date_posted")),
                    "salary_source": self._safe_str(job.get("salary_source")),
                    "interval": self._safe_str(job.get("interval")),
                    "min_amount": self._safe_number(job.get("min_amount")),
                    "max_amount": self._safe_number(job.get("max_amount")),
                    "currency": self._safe_str(job.get("currency")),
                    "is_remote": self._safe_bool(job.get("is_remote")),
                    "job_url": self._safe_str(job.get("job_url")),
                    "job_url_direct": self._safe_str(job.get("job_url_direct")),
                    "site": self._safe_str(job.get("site")),
                    "description": self._safe_str(job.get("description")),
                    "emails": self._safe_list(job.get("emails")),
                    "company_url": self._safe_str(job.get("company_url")),
                    "company_url_direct": self._safe_str(job.get("company_url_direct")),
                    "company_addresses": self._safe_str(job.get("company_addresses")),
                    "company_num_employees": self._safe_str(job.get("company_num_employees")),
                    "company_revenue": self._safe_str(job.get("company_revenue")),
                    "company_description": self._safe_str(job.get("company_description")),
                    "ceo_name": self._safe_str(job.get("ceo_name")),
                    "ceo_photo_url": self._safe_str(job.get("ceo_photo_url")),
                    "logo_photo_url": self._safe_str(job.get("logo_photo_url")),
                    "banner_photo_url": self._safe_str(job.get("banner_photo_url")),
                }
                
                formatted.append(formatted_job)
                
            except Exception as e:
                logger.warning(f"Error formatting job: {e}")
                continue
        
        return formatted
    
    def _generate_job_id(self, job: Dict[str, Any]) -> str:
        """Generate a unique ID for a job."""
        # Use combination of company, title, and site
        company = self._safe_str(job.get("company", "unknown"))
        title = self._safe_str(job.get("title", "unknown"))
        site = self._safe_str(job.get("site", "unknown"))
        
        # Create a simple hash-like ID
        import hashlib
        unique_str = f"{company}_{title}_{site}".lower().replace(" ", "_")
        hash_obj = hashlib.md5(unique_str.encode())
        return f"job_{hash_obj.hexdigest()[:12]}"
    
    def _safe_str(self, value: Any, default: str = "") -> str:
        """Safely convert value to string."""
        if value is None or (isinstance(value, float) and pd.isna(value)):
            return default
        return str(value)
    
    def _safe_number(self, value: Any, default: Optional[float] = None) -> Optional[float]:
        """Safely convert value to number."""
        if value is None or (isinstance(value, float) and pd.isna(value)):
            return default
        try:
            return float(value)
        except (ValueError, TypeError):
            return default
    
    def _safe_bool(self, value: Any, default: bool = False) -> bool:
        """Safely convert value to boolean."""
        if value is None or (isinstance(value, float) and pd.isna(value)):
            return default
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() in ["true", "yes", "1"]
        return bool(value)
    
    def _safe_list(self, value: Any, default: Optional[List] = None) -> List:
        """Safely convert value to list."""
        if default is None:
            default = []
        if value is None or (isinstance(value, float) and pd.isna(value)):
            return default
        if isinstance(value, list):
            return value
        return default
    
    def _format_date(self, value: Any) -> Optional[str]:
        """Format date to ISO string."""
        if value is None or (isinstance(value, float) and pd.isna(value)):
            return None
        
        try:
            # If it's already a datetime
            if isinstance(value, datetime):
                return value.isoformat()
            
            # If it's a pandas Timestamp
            if hasattr(value, 'isoformat'):
                return value.isoformat()
            
            # Try to convert string to datetime
            if isinstance(value, str):
                return value
            
            return str(value)
            
        except Exception:
            return None
    
    def save_jobs_to_csv(
        self,
        jobs: List[Dict[str, Any]],
        filename: str = "jobs.csv"
    ) -> str:
        """
        Save jobs to CSV file.
        
        Args:
            jobs: List of job dictionaries
            filename: Output filename
            
        Returns:
            Path to saved file
        """
        try:
            # Convert to DataFrame
            df = pd.DataFrame(jobs)
            
            # Save to CSV
            df.to_csv(
                filename,
                quoting=csv.QUOTE_NONNUMERIC,
                escapechar="\\",
                index=False
            )
            
            logger.info(f"Saved {len(jobs)} jobs to {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"Error saving jobs to CSV: {e}")
            raise


# Singleton instance
job_scraper_service = JobScraperService()
