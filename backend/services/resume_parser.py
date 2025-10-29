"""
Resume parsing service for extracting structured data from PDF and DOCX files.
"""
import io
import re
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

logger = logging.getLogger(__name__)


class ResumeParser:
    """Lightweight resume parser for PDF and DOCX files."""
    
    def __init__(self):
        # Canonical skills list for matching
        self.canonical_skills = [
            "python", "javascript", "java", "c++", "c#", "go", "golang", "rust", "swift",
            "kotlin", "typescript", "php", "ruby", "scala", "r", "matlab", "sql", "nosql",
            "react", "vue", "angular", "node.js", "express", "django", "flask", "fastapi",
            "spring", "laravel", "rails", "next.js", "svelte", "html", "css", "sass",
            "bootstrap", "tailwind", "jquery", "redux", "vuex", "webpack", "babel",
            "docker", "kubernetes", "aws", "azure", "gcp", "google cloud", "linux", "unix",
            "git", "github", "gitlab", "ci/cd", "jenkins", "terraform", "ansible",
            "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "cassandra",
            "machine learning", "ml", "artificial intelligence", "ai", "deep learning",
            "neural networks", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
            "data analysis", "data science", "statistics", "tableau", "power bi", "excel",
            "spark", "hadoop", "kafka", "airflow", "etl", "data engineering",
            "cybersecurity", "penetration testing", "ethical hacking", "network security",
            "ui/ux", "user experience", "user interface", "figma", "sketch", "adobe xd",
            "photoshop", "illustrator", "graphic design", "web design", "mobile development",
            "android", "ios", "react native", "flutter", "xamarin", "unity", "game development",
            "blockchain", "ethereum", "solidity", "smart contracts", "cryptocurrency",
            "agile", "scrum", "kanban", "project management", "jira", "confluence",
            "communication", "teamwork", "leadership", "problem solving", "analytical thinking"
        ]
        
        # Education keywords for extraction
        self.education_keywords = [
            "bachelor", "master", "phd", "doctorate", "degree", "diploma", "certificate",
            "university", "college", "institute", "school", "academy",
            "b.tech", "b.e.", "b.sc", "b.a", "b.com", "bba", "bca",
            "m.tech", "m.e.", "m.sc", "m.a", "m.com", "mba", "mca",
            "engineering", "computer science", "information technology", "software engineering",
            "data science", "business administration", "management", "marketing", "finance"
        ]
        
        # Certification keywords
        self.certification_keywords = [
            "certified", "certification", "certificate", "accredited", "credential",
            "aws", "azure", "google cloud", "gcp", "cisco", "microsoft", "oracle",
            "pmp", "scrum master", "cissp", "ceh", "comptia", "itil"
        ]
        
        # Project section keywords
        self.project_keywords = [
            "project", "portfolio", "work sample", "developed", "built", "created",
            "implemented", "designed", "architected"
        ]
    
    async def parse_file(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Parse resume file and extract structured data."""
        try:
            # Determine file type and extract text
            text = await self._extract_text(file_content, filename)
            
            if not text.strip():
                return {
                    "success": False,
                    "error": "Could not extract text from file",
                    "parsed": {}
                }
            
            # Extract structured information
            parsed_data = {
                "full_name": self._extract_name(text),
                "education_history": self._extract_education(text),
                "skills": self._extract_skills(text),
                "contact_info": self._extract_contact_info(text),
                "experience_years": self._extract_experience_years(text),
                "certifications": self._extract_certifications(text),
                "projects": self._extract_projects(text),
                "languages": self._extract_languages(text),
                "raw_text": text[:1000],  # First 1000 chars for preview
                "confidence_score": 0
            }
            
            # Calculate confidence score
            parsed_data["confidence_score"] = self._calculate_confidence(parsed_data)
            
            return {
                "success": True,
                "parsed": parsed_data,
                "filename": filename,
                "parsed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Resume parsing failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "parsed": {}
            }
    
    async def _extract_text(self, file_content: bytes, filename: str) -> str:
        """Extract text from PDF or DOCX file."""
        file_ext = filename.lower().split('.')[-1] if '.' in filename else ''
        
        try:
            if file_ext == 'pdf' and PDF_AVAILABLE:
                return self._extract_pdf_text(file_content)
            elif file_ext in ['docx', 'doc'] and DOCX_AVAILABLE:
                return self._extract_docx_text(file_content)
            else:
                # Fallback: try to decode as plain text
                return file_content.decode('utf-8', errors='ignore')
        except Exception as e:
            logger.warning(f"Failed to extract text from {filename}: {e}")
            # Last resort: decode as text
            return file_content.decode('utf-8', errors='ignore')
    
    def _extract_pdf_text(self, file_content: bytes) -> str:
        """Extract text from PDF using PyPDF2."""
        if not PDF_AVAILABLE:
            raise ImportError("PyPDF2 not available for PDF parsing")
            
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        
        for page in pdf_reader.pages:
            try:
                text += page.extract_text() + "\n"
            except Exception as e:
                logger.warning(f"Failed to extract text from PDF page: {e}")
                continue
                
        return text
    
    def _extract_docx_text(self, file_content: bytes) -> str:
        """Extract text from DOCX using python-docx."""
        if not DOCX_AVAILABLE:
            raise ImportError("python-docx not available for DOCX parsing")
            
        doc = Document(io.BytesIO(file_content))
        text = ""
        
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
            
        return text
    
    def _extract_name(self, text: str) -> Optional[str]:
        """Extract full name from resume text."""
        lines = text.strip().split('\n')
        
        # Look in first few lines for name patterns
        for i, line in enumerate(lines[:5]):
            line = line.strip()
            if not line:
                continue
                
            # Skip lines that look like headers, contact info, etc.
            if any(keyword in line.lower() for keyword in ['email', 'phone', 'address', 'linkedin', 'github']):
                continue
                
            # Simple heuristic: name is likely 2-4 words, mostly alphabetic
            words = line.split()
            if 2 <= len(words) <= 4 and all(word.replace('-', '').replace("'", "").isalpha() for word in words):
                return line
                
        return None
    
    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education history from resume text."""
        education = []
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            line_lower = line.lower().strip()
            
            # Check if line contains education keywords
            if any(keyword in line_lower for keyword in self.education_keywords):
                education_entry = {"raw_text": line.strip()}
                
                # Try to extract year
                year_match = re.search(r'\b(19|20)\d{2}\b', line)
                if year_match:
                    education_entry["year"] = year_match.group()
                
                # Try to extract degree type
                for keyword in ["bachelor", "master", "phd", "b.tech", "m.tech", "mba"]:
                    if keyword in line_lower:
                        education_entry["degree"] = keyword.title()
                        break
                
                # Look for institution name (usually in the same or next line)
                context_lines = lines[max(0, i-1):i+2]
                for context_line in context_lines:
                    if any(inst_word in context_line.lower() for inst_word in ["university", "college", "institute"]):
                        education_entry["institution"] = context_line.strip()
                        break
                
                education.append(education_entry)
        
        return education[:3]  # Return max 3 education entries
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text using keyword matching."""
        text_lower = text.lower()
        found_skills = []
        
        # Remove common punctuation and split into tokens
        clean_text = re.sub(r'[^\w\s\-\.\+#]', ' ', text_lower)
        tokens = set(clean_text.split())
        
        # Also check for multi-word skills
        for skill in self.canonical_skills:
            skill_lower = skill.lower()
            
            # Check for exact skill match
            if skill_lower in text_lower:
                # Normalize skill name
                if skill_lower == "node.js":
                    found_skills.append("Node.js")
                elif skill_lower == "next.js":
                    found_skills.append("Next.js")
                elif skill_lower in ["ml", "machine learning"]:
                    found_skills.append("Machine Learning")
                elif skill_lower in ["ai", "artificial intelligence"]:
                    found_skills.append("Artificial Intelligence")
                elif skill_lower == "ui/ux":
                    found_skills.append("UI/UX")
                else:
                    found_skills.append(skill.title())
        
        # Remove duplicates and return sorted list
        return sorted(list(set(found_skills)))[:25]  # Max 25 skills
    
    def _extract_contact_info(self, text: str) -> Dict[str, List[str]]:
        """Extract contact information from resume text."""
        contact_info = {
            "emails": [],
            "phones": [],
            "links": []
        }
        
        # Extract emails
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        contact_info["emails"] = list(set(re.findall(email_pattern, text)))
        
        # Extract phone numbers
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        contact_info["phones"] = list(set(re.findall(phone_pattern, text)))
        
        # Extract LinkedIn, GitHub, etc.
        link_patterns = [
            r'linkedin\.com/in/[\w\-]+',
            r'github\.com/[\w\-]+',
            r'https?://[\w\-\.]+\.[\w]+/?[\w\-\./?=&%]*'
        ]
        
        for pattern in link_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            contact_info["links"].extend(matches)
        
        contact_info["links"] = list(set(contact_info["links"]))
        
        return contact_info
    
    def _extract_experience_years(self, text: str) -> int:
        """Extract years of experience from resume text."""
        text_lower = text.lower()
        
        # Look for patterns like "5 years experience", "3+ years", etc.
        experience_patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\+?\s*years?\s*(?:in|of|with)',
            r'experience.*?(\d+)\+?\s*years?'
        ]
        
        max_years = 0
        for pattern in experience_patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                try:
                    years = int(match)
                    max_years = max(max_years, years)
                except ValueError:
                    continue
        
        return max_years
    
    def _calculate_confidence(self, parsed_data: Dict[str, Any]) -> float:
        """Calculate confidence score based on extracted data quality."""
        score = 0.0
        max_score = 5.0
        
        # Name found (+1)
        if parsed_data.get("full_name"):
            score += 1.0
        
        # Skills found (+1)
        if parsed_data.get("skills"):
            score += 1.0
        
        # Education found (+1)
        if parsed_data.get("education_history"):
            score += 1.0
        
        # Contact info found (+1)
        contact = parsed_data.get("contact_info", {})
        if contact.get("emails") or contact.get("phones"):
            score += 1.0
        
        # Experience years found (+1)
        if parsed_data.get("experience_years", 0) > 0:
            score += 1.0
        
        return round(score / max_score, 2)
    
    def _extract_certifications(self, text: str) -> List[Dict[str, str]]:
        """Extract certifications from resume text."""
        certifications = []
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            line_lower = line.lower().strip()
            
            # Check if line contains certification keywords
            if any(keyword in line_lower for keyword in self.certification_keywords):
                cert_entry = {"raw_text": line.strip()}
                
                # Try to extract year
                year_match = re.search(r'\b(19|20)\d{2}\b', line)
                if year_match:
                    cert_entry["year"] = year_match.group()
                
                # Extract certification name
                cert_entry["name"] = line.strip()
                
                certifications.append(cert_entry)
        
        return certifications[:5]  # Return max 5 certifications
    
    def _extract_projects(self, text: str) -> List[Dict[str, str]]:
        """Extract projects from resume text."""
        projects = []
        lines = text.split('\n')
        
        in_project_section = False
        current_project = None
        
        for i, line in enumerate(lines):
            line_lower = line.lower().strip()
            
            # Detect project section
            if any(keyword in line_lower for keyword in ["projects", "portfolio", "work samples"]):
                in_project_section = True
                continue
            
            # Stop at next major section
            if in_project_section and any(keyword in line_lower for keyword in 
                                          ["experience", "education", "skills", "certifications"]):
                in_project_section = False
            
            # Extract project names (usually bullet points or numbered)
            if in_project_section and line.strip() and (
                line.strip().startswith('-') or 
                line.strip().startswith('•') or 
                line.strip().startswith('*') or
                re.match(r'^\d+\.', line.strip())
            ):
                project_text = re.sub(r'^[-•*]\s*|\d+\.\s*', '', line.strip())
                if project_text:
                    projects.append({
                        "name": project_text[:100],  # Limit length
                        "description": project_text
                    })
        
        return projects[:5]  # Return max 5 projects
    
    def _extract_languages(self, text: str) -> List[str]:
        """Extract spoken languages from resume text."""
        languages = []
        common_languages = [
            "english", "hindi", "spanish", "french", "german", "chinese", "mandarin",
            "japanese", "korean", "arabic", "portuguese", "russian", "italian",
            "tamil", "telugu", "marathi", "bengali", "gujarati", "kannada", "malayalam"
        ]
        
        text_lower = text.lower()
        
        # Look for language section
        lang_section_match = re.search(r'languages?\s*:?\s*(.*?)(?:\n\n|\Z)', text_lower, re.DOTALL)
        if lang_section_match:
            lang_text = lang_section_match.group(1)
            for lang in common_languages:
                if lang in lang_text:
                    languages.append(lang.title())
        
        # Also check in full text if no language section found
        if not languages:
            for lang in common_languages:
                if lang in text_lower:
                    languages.append(lang.title())
        
        return list(set(languages))[:5]  # Return max 5 unique languages