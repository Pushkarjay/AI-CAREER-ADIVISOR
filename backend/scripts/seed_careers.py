"""
Script to seed the Firestore database with career data for the prototype.
Run this script once to populate the careers collection.
"""
import asyncio
import sys
import os

# Add parent directory to path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firestore_service import FirestoreService

# Career data for prototype
CAREERS_DATA = [
    {
        "id": "data-science",
        "title": "Data Scientist",
        "description": "Analyze and interpret complex data to help organizations make data-driven decisions using statistical methods, machine learning, and programming skills.",
        "avgSalary": 950000,
        "requiredSkills": [
            "Python", "Machine Learning", "Statistics", "SQL", "Pandas", 
            "Numpy", "Tableau", "Data Analysis", "R", "Jupyter"
        ],
        "suggestedCourses": [
            {
                "title": "Machine Learning Specialization",
                "provider": "Coursera",
                "url": "https://www.coursera.org/specializations/machine-learning",
                "duration": "3-6 months"
            },
            {
                "title": "Data Science with Python",
                "provider": "edX",
                "url": "https://www.edx.org/course/python-for-data-science",
                "duration": "4-8 weeks"
            },
            {
                "title": "Statistics for Data Science",
                "provider": "Khan Academy",
                "url": "https://www.khanacademy.org/math/statistics-probability",
                "duration": "Self-paced"
            }
        ],
        "industry": "Technology",
        "workType": "Remote Friendly",
        "experienceLevel": "Mid-Level",
        "growthRate": "22%",
        "jobOpenings": "1,200+",
        "skills_weightage": {
            "technical": 0.7,
            "analytical": 0.8,
            "communication": 0.6,
            "leadership": 0.4
        }
    },
    {
        "id": "full-stack-developer",
        "title": "Full Stack Developer",
        "description": "Build complete web applications using both frontend and backend technologies, managing everything from user interfaces to databases.",
        "avgSalary": 850000,
        "requiredSkills": [
            "JavaScript", "React", "Node.js", "HTML", "CSS", "SQL", 
            "Git", "MongoDB", "Express", "REST APIs"
        ],
        "suggestedCourses": [
            {
                "title": "Full Stack Web Development Bootcamp",
                "provider": "Udemy",
                "url": "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
                "duration": "12-16 weeks"
            },
            {
                "title": "React Developer Path",
                "provider": "Pluralsight",
                "url": "https://www.pluralsight.com/paths/react",
                "duration": "6-8 weeks"
            },
            {
                "title": "Node.js Backend Development",
                "provider": "FreeCodeCamp",
                "url": "https://www.freecodecamp.org/learn/apis-and-microservices/",
                "duration": "8-10 weeks"
            }
        ],
        "industry": "Technology",
        "workType": "Hybrid",
        "experienceLevel": "Entry-Mid Level",
        "growthRate": "13%",
        "jobOpenings": "2,500+",
        "skills_weightage": {
            "technical": 0.8,
            "analytical": 0.6,
            "communication": 0.5,
            "leadership": 0.3
        }
    },
    {
        "id": "cybersecurity-specialist",
        "title": "Cybersecurity Specialist",
        "description": "Protect organizations from digital threats by implementing security measures, conducting security assessments, and responding to incidents.",
        "avgSalary": 1200000,
        "requiredSkills": [
            "Network Security", "Ethical Hacking", "Linux", "Python", 
            "Penetration Testing", "Incident Response", "CISSP", "Security+", "Firewall Management"
        ],
        "suggestedCourses": [
            {
                "title": "Certified Ethical Hacker (CEH)",
                "provider": "EC-Council",
                "url": "https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/",
                "duration": "3-6 months"
            },
            {
                "title": "Cybersecurity Fundamentals",
                "provider": "Coursera",
                "url": "https://www.coursera.org/specializations/cyber-security",
                "duration": "4-6 months"
            },
            {
                "title": "CompTIA Security+",
                "provider": "CompTIA",
                "url": "https://www.comptia.org/certifications/security",
                "duration": "3-4 months"
            }
        ],
        "industry": "Security",
        "workType": "On-site",
        "experienceLevel": "Mid-Senior Level",
        "growthRate": "31%",
        "jobOpenings": "800+",
        "skills_weightage": {
            "technical": 0.9,
            "analytical": 0.8,
            "communication": 0.6,
            "leadership": 0.5
        }
    },
    {
        "id": "ui-ux-designer",
        "title": "UI/UX Designer",
        "description": "Design user interfaces and experiences that are both beautiful and functional, focusing on user research, prototyping, and visual design.",
        "avgSalary": 750000,
        "requiredSkills": [
            "UI/UX", "Figma", "Adobe XD", "User Research", "Prototyping", 
            "Web Design", "Adobe Creative Suite", "Sketch", "Wireframing", "User Testing"
        ],
        "suggestedCourses": [
            {
                "title": "Google UX Design Certificate",
                "provider": "Coursera",
                "url": "https://www.coursera.org/professional-certificates/google-ux-design",
                "duration": "6-8 months"
            },
            {
                "title": "UI Design Fundamentals",
                "provider": "Udacity",
                "url": "https://www.udacity.com/course/ui-design--ud849",
                "duration": "4-6 weeks"
            },
            {
                "title": "Design Thinking Process",
                "provider": "IDEO U",
                "url": "https://www.ideou.com/products/design-thinking-for-innovation",
                "duration": "6-8 weeks"
            }
        ],
        "industry": "Design",
        "workType": "Remote Friendly",
        "experienceLevel": "Entry-Mid Level",
        "growthRate": "13%",
        "jobOpenings": "950+",
        "skills_weightage": {
            "technical": 0.6,
            "analytical": 0.5,
            "communication": 0.8,
            "leadership": 0.4
        }
    },
    {
        "id": "cloud-engineer",
        "title": "Cloud Engineer",
        "description": "Design, deploy, and manage cloud infrastructure and services using platforms like AWS, Azure, or Google Cloud Platform.",
        "avgSalary": 1100000,
        "requiredSkills": [
            "AWS", "Azure", "Docker", "Kubernetes", "DevOps", "Python", 
            "Linux", "Terraform", "CI/CD", "Cloud Architecture"
        ],
        "suggestedCourses": [
            {
                "title": "AWS Solutions Architect",
                "provider": "AWS",
                "url": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
                "duration": "4-6 months"
            },
            {
                "title": "Azure Fundamentals",
                "provider": "Microsoft",
                "url": "https://docs.microsoft.com/en-us/learn/certifications/azure-fundamentals/",
                "duration": "2-3 months"
            },
            {
                "title": "Docker and Kubernetes",
                "provider": "Udemy",
                "url": "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
                "duration": "8-10 weeks"
            }
        ],
        "industry": "Technology",
        "workType": "Remote Friendly",
        "experienceLevel": "Mid-Senior Level",
        "growthRate": "25%",
        "jobOpenings": "1,800+",
        "skills_weightage": {
            "technical": 0.9,
            "analytical": 0.7,
            "communication": 0.5,
            "leadership": 0.6
        }
    }
]

async def seed_careers():
    """Seed the Firestore database with career data."""
    firestore_service = FirestoreService()
    
    print("🌱 Starting to seed careers data...")
    
    try:
        for career in CAREERS_DATA:
            career_id = career["id"]
            print(f"📄 Adding career: {career['title']} (ID: {career_id})")
            
            # Check if career already exists
            existing_career = await firestore_service.get_document("careers", career_id)
            
            if existing_career:
                print(f"⚠️  Career {career_id} already exists, updating...")
                await firestore_service.update_document("careers", career_id, career)
            else:
                print(f"✨ Creating new career {career_id}")
                await firestore_service.create_document("careers", career, career_id)
            
            print(f"✅ Successfully processed {career['title']}")
        
        print("\n🎉 All careers seeded successfully!")
        print(f"📊 Total careers added: {len(CAREERS_DATA)}")
        
        # Create a summary document
        summary = {
            "total_careers": len(CAREERS_DATA),
            "last_updated": firestore_service._get_timestamp(),
            "career_ids": [career["id"] for career in CAREERS_DATA],
            "industries": list(set(career["industry"] for career in CAREERS_DATA)),
            "average_salary_range": {
                "min": min(career["avgSalary"] for career in CAREERS_DATA),
                "max": max(career["avgSalary"] for career in CAREERS_DATA),
                "avg": sum(career["avgSalary"] for career in CAREERS_DATA) // len(CAREERS_DATA)
            }
        }
        
        await firestore_service.create_document("metadata", summary, "careers_summary")
        print("📋 Created careers summary metadata")
        
    except Exception as e:
        print(f"❌ Error seeding careers: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(seed_careers())