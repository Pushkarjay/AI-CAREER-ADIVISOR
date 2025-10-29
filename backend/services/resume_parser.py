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
        
        # Internship/Experience keywords
        self.experience_keywords = [
            "intern", "internship", "trainee", "co-op", "work experience",
            "employment", "position", "role", "job", "worked at", "working at"
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
                "internships": self._extract_internships(text),
                "languages": self._extract_languages(text),
                "raw_text": text[:1500],  # First 1500 chars for preview
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
        """Extract full name from resume text with improved accuracy."""
        lines = text.strip().split('\n')
        
        # Look in first few lines for name patterns
        for i, line in enumerate(lines[:10]):  # Check more lines
            line = line.strip()
            if not line or len(line) < 3:
                continue
                
            # Skip lines that look like headers, contact info, etc.
            line_lower = line.lower()
            skip_keywords = [
                'email', 'phone', 'address', 'linkedin', 'github', 
                'resume', 'cv', 'curriculum vitae', 'portfolio',
                'http', 'www', '@', 'tel:', 'mobile'
            ]
            if any(keyword in line_lower for keyword in skip_keywords):
                continue
                
            # Skip lines that are all caps and short (likely headers)
            if line.isupper() and len(line) < 30:
                continue
            
            # Name heuristic: 2-5 words, mostly alphabetic, proper case
            words = line.split()
            if 2 <= len(words) <= 5:
                # Check if words are mostly alphabetic (allow hyphens, apostrophes, periods)
                valid_words = []
                for word in words:
                    # Remove common name suffixes/prefixes
                    clean_word = re.sub(r'^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s*', '', word, flags=re.I)
                    clean_word = re.sub(r'\s*(Jr\.|Sr\.|III|IV|Ph\.D\.)$', '', clean_word, flags=re.I)
                    
                    # Check if word is alphabetic (with allowed punctuation)
                    if re.match(r'^[A-Za-z][\w\'\-\.]*[A-Za-z]?$', clean_word):
                        valid_words.append(word)
                
                if len(valid_words) >= 2 and len(valid_words) == len(words):
                    # Likely a name - return the original line
                    return line
                
        return None
    
    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education history from resume text with improved accuracy."""
        education = []
        lines = text.split('\n')
        
        in_education_section = False
        current_entry = {}
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            line_lower = line_stripped.lower()
            
            # Detect education section header
            if re.match(r'^(education|academic|qualification)s?\s*:?\s*$', line_lower):
                in_education_section = True
                continue
            
            # Stop at next major section
            if in_education_section and re.match(
                r'^(experience|work|employment|skills|projects|certifications?|internships?|activities)\s*:?\s*$',
                line_lower
            ):
                if current_entry:
                    education.append(current_entry)
                break
            
            if not line_stripped:
                if current_entry:
                    education.append(current_entry)
                    current_entry = {}
                continue
            
            # Check if line contains education keywords
            has_education_keyword = any(keyword in line_lower for keyword in self.education_keywords)
            
            if has_education_keyword or in_education_section:
                # Extract year (more flexible pattern)
                year_matches = re.findall(r'\b(19\d{2}|20\d{2})\b', line_stripped)
                
                # Extract degree keywords
                degree_match = None
                for degree_keyword in ["bachelor", "master", "phd", "doctorate", "b.tech", "b.e.", 
                                      "m.tech", "m.e.", "mba", "b.sc", "m.sc", "diploma"]:
                    if degree_keyword in line_lower:
                        degree_match = degree_keyword
                        break
                
                # Build education entry
                if not current_entry and (degree_match or year_matches or in_education_section):
                    current_entry = {"raw_text": line_stripped}
                    
                    if year_matches:
                        # Use the most recent year or year range
                        current_entry["year"] = " - ".join(year_matches[-2:]) if len(year_matches) >= 2 else year_matches[-1]
                    
                    if degree_match:
                        current_entry["degree"] = degree_match.upper() if len(degree_match) <= 6 else degree_match.title()
                    
                    # Look for institution in current or next few lines
                    for j in range(i, min(i + 3, len(lines))):
                        context_line = lines[j].strip()
                        if any(inst_word in context_line.lower() for inst_word in 
                              ["university", "college", "institute", "school", "academy"]):
                            current_entry["institution"] = context_line
                            break
        
        # Add last entry if exists
        if current_entry:
            education.append(current_entry)
        
        return education[:5]  # Return max 5 education entries
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text using keyword matching with improved accuracy."""
        text_lower = text.lower()
        found_skills = set()
        
        # Look for dedicated skills section first (more accurate)
        skills_section_match = re.search(
            r'(?:^|\n)\s*(?:skills?|technical skills?|core competencies|expertise|proficiencies?)\s*:?\s*\n((?:.*\n){1,15})',
            text_lower,
            re.MULTILINE
        )
        
        search_text = text_lower
        if skills_section_match:
            # Prioritize skills section content
            search_text = skills_section_match.group(1) + "\n" + text_lower
        
        # Tokenize text for better matching
        # Split on common separators while preserving multi-word skills
        tokens = re.findall(r'\b[\w\+\-\.#]+(?:\s+[\w\+\-\.#]+)?\b', search_text)
        token_set = set(tok.lower() for tok in tokens)
        
        # Match each skill from our canonical list
        for skill in self.canonical_skills:
            skill_lower = skill.lower()
            
            # Exact matches in tokens (handles word boundaries better)
            if skill_lower in token_set:
                found_skills.add(self._normalize_skill_name(skill))
                continue
            
            # For multi-word skills, check in full text
            if ' ' in skill_lower or '.' in skill_lower:
                # Use word boundary regex for better matching
                pattern = r'\b' + re.escape(skill_lower) + r'\b'
                if re.search(pattern, search_text):
                    found_skills.add(self._normalize_skill_name(skill))
                    continue
        
        # Return sorted unique list (limit to 30 top skills)
        return sorted(list(found_skills))[:30]
    
    def _normalize_skill_name(self, skill: str) -> str:
        """Normalize skill names for consistent display."""
        skill_lower = skill.lower()
        
        # Special cases for proper capitalization
        special_cases = {
            "node.js": "Node.js",
            "next.js": "Next.js",
            "vue.js": "Vue.js",
            "express.js": "Express.js",
            "react.js": "React.js",
            "angular.js": "Angular.js",
            "javascript": "JavaScript",
            "typescript": "TypeScript",
            "mongodb": "MongoDB",
            "mysql": "MySQL",
            "postgresql": "PostgreSQL",
            "nosql": "NoSQL",
            "graphql": "GraphQL",
            "html": "HTML",
            "css": "CSS",
            "sql": "SQL",
            "c++": "C++",
            "c#": "C#",
            "ui/ux": "UI/UX",
            "aws": "AWS",
            "gcp": "GCP",
            "azure": "Azure",
            "ml": "Machine Learning",
            "ai": "Artificial Intelligence",
            "ci/cd": "CI/CD",
            "rest api": "REST API",
            "graphql": "GraphQL",
            "github": "GitHub",
            "gitlab": "GitLab",
            "tensorflow": "TensorFlow",
            "pytorch": "PyTorch",
            "scikit-learn": "Scikit-learn"
        }
        
        return special_cases.get(skill_lower, skill.title())
    
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
        max_score = 8.0  # Increased for new fields
        
        # Name found (+1)
        if parsed_data.get("full_name"):
            score += 1.0
        
        # Skills found (+1.5 - most important)
        if parsed_data.get("skills") and len(parsed_data["skills"]) >= 3:
            score += 1.5
        elif parsed_data.get("skills"):
            score += 0.75
        
        # Education found (+1)
        if parsed_data.get("education_history") and len(parsed_data["education_history"]) >= 1:
            score += 1.0
        
        # Contact info found (+1)
        contact = parsed_data.get("contact_info", {})
        if contact.get("emails") or contact.get("phones"):
            score += 1.0
        
        # Experience/Internships found (+1.5)
        if parsed_data.get("internships") and len(parsed_data["internships"]) >= 1:
            score += 1.0
        if parsed_data.get("experience_years", 0) > 0:
            score += 0.5
        
        # Certifications found (+1)
        if parsed_data.get("certifications"):
            score += 0.5
        
        # Projects found (+1)
        if parsed_data.get("projects"):
            score += 0.5
        
        # Languages found (+0.5)
        if parsed_data.get("languages"):
            score += 0.5
        
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
    
    def _extract_internships(self, text: str) -> List[Dict[str, str]]:
        """Extract internships/work experience from resume text."""
        internships = []
        lines = text.split('\n')
        
        in_experience_section = False
        current_entry = {}
        entry_lines = []
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            line_lower = line_stripped.lower()
            
            # Detect experience/internship section header
            if re.match(r'^(experience|work experience|internships?|employment|professional experience)\s*:?\s*$', line_lower):
                in_experience_section = True
                continue
            
            # Stop at next major section
            if in_experience_section and re.match(
                r'^(education|skills|projects|certifications?|activities|awards)\s*:?\s*$',
                line_lower
            ):
                if current_entry:
                    internships.append(current_entry)
                break
            
            # Empty line might signal new entry
            if not line_stripped:
                if current_entry and entry_lines:
                    current_entry["description"] = " ".join(entry_lines)
                    internships.append(current_entry)
                    current_entry = {}
                    entry_lines = []
                continue
            
            # Check for experience indicators
            has_experience_keyword = any(keyword in line_lower for keyword in self.experience_keywords)
            
            # Check for date patterns (common in experience sections)
            date_pattern = r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current|\d{4})'
            has_date = re.search(date_pattern, line_lower)
            
            if (has_experience_keyword or in_experience_section) and (has_date or current_entry):
                # Check if this line starts a new entry (has company/role indicators)
                is_new_entry = (
                    (has_date and '|' in line_stripped) or  # Common format: "Company | Role | Date"
                    (has_date and '-' in line_stripped and any(kw in line_lower for kw in ['intern', 'engineer', 'developer', 'analyst', 'manager'])) or
                    bool(re.match(r'^[A-Z][\w\s]+(?:Inc\.|Ltd\.|LLC|Corp|Company|Technologies|Systems)', line_stripped))  # Company name pattern
                )
                
                if is_new_entry and current_entry:
                    # Save previous entry
                    if entry_lines:
                        current_entry["description"] = " ".join(entry_lines[:3])  # First 3 description lines
                    internships.append(current_entry)
                    current_entry = {}
                    entry_lines = []
                
                if not current_entry:
                    # Start new entry
                    current_entry = {}
                    
                    # Try to extract company name (usually first capitalized phrase or before |)
                    company_match = re.match(r'^([A-Z][\w\s&,\.]+?)(?:\s*[\|•–-]\s*|\s*,\s*|\s{2,})', line_stripped)
                    if company_match:
                        current_entry["company"] = company_match.group(1).strip()
                    elif re.match(r'^[A-Z]', line_stripped):
                        # Fallback: first capitalized sequence
                        words = line_stripped.split()
                        if words:
                            current_entry["company"] = words[0]
                    
                    # Extract role (often after company or between delimiters)
                    role_keywords = ['intern', 'engineer', 'developer', 'analyst', 'designer', 'manager', 
                                   'associate', 'specialist', 'consultant', 'trainee', 'co-op']
                    for keyword in role_keywords:
                        if keyword in line_lower:
                            role_match = re.search(r'(\w+\s+)*' + keyword + r'(\s+\w+)*', line_lower, re.I)
                            if role_match:
                                current_entry["role"] = role_match.group(0).title()
                                break
                    
                    # Extract duration (date range)
                    date_matches = re.findall(r'((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|present|current|\d{4})', line_lower)
                    if len(date_matches) >= 2:
                        current_entry["duration"] = f"{date_matches[0].title()} - {date_matches[-1].title()}"
                    elif len(date_matches) == 1:
                        current_entry["duration"] = date_matches[0].title()
                    
                    # Extract location if present
                    location_match = re.search(r',\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:,\s*[A-Z]{2})?)\s*$', line_stripped)
                    if location_match:
                        current_entry["location"] = location_match.group(1)
                    
                else:
                    # Add to description lines
                    if line_stripped and not line_stripped.startswith(('•', '-', '*')):
                        entry_lines.append(line_stripped)
                    elif line_stripped:
                        entry_lines.append(line_stripped[1:].strip())  # Remove bullet
        
        # Add last entry
        if current_entry:
            if entry_lines:
                current_entry["description"] = " ".join(entry_lines[:3])
            internships.append(current_entry)
        
        return internships[:8]  # Return max 8 internships/experiences