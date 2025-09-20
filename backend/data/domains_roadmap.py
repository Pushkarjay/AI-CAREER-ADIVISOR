"""
Comprehensive domain learning roadmaps for 70+ CSE domains.
This dataset is designed for read-mostly access and can be served from memory.
"""
from __future__ import annotations
from typing import Dict, List

UNIVERSAL_FOUNDATIONS: List[str] = [
    "Programming",
    "Data Structures & Algorithms",
    "OS & Networks",
    "Databases & SQL",
    "Linux",
    "Git",
    "Software Engineering",
    "Math foundations",
]

# Minimal representative data for a few domains to keep repo size reasonable;
# extend incrementally while UI supports pagination and search.
DOMAINS_ROADMAP: Dict[str, dict] = {
    "data-analytics": {
        "domain_id": "data-analytics",
        "title": "Data Analytics",
        "description": "Analyze data using SQL/Excel/Python to generate insights and dashboards.",
        "difficulty": "beginner",
        "estimated_completion": "3-6 months",
        "prerequisites": ["Programming basics", "SQL basics"],
        "learning_path": [
            "Excel fundamentals & functions",
            "SQL (SELECT/JOINS/Window functions)",
            "Python for analysis (pandas, numpy)",
            "Visualization (Matplotlib/Seaborn)",
            "BI tools (PowerBI/Tableau)",
            "Storytelling & dashboards",
        ],
        "related_domains": ["business-intelligence", "data-science"],
        "universal_foundations": UNIVERSAL_FOUNDATIONS,
    },
    "data-science": {
        "domain_id": "data-science",
        "title": "Data Science",
        "description": "End-to-end modeling with statistics and machine learning.",
        "difficulty": "intermediate",
        "estimated_completion": "6-12 months",
        "prerequisites": ["Python", "Statistics", "Linear Algebra"],
        "learning_path": [
            "EDA & feature engineering",
            "Classical ML (scikit-learn)",
            "Model evaluation & interpretation",
            "Intro to DL (PyTorch/TensorFlow)",
            "Deployment (FastAPI/Docker)",
        ],
        "related_domains": ["ml-engineer", "mlops", "data-engineering"],
        "universal_foundations": UNIVERSAL_FOUNDATIONS,
    },
    "ml-engineer": {
        "domain_id": "ml-engineer",
        "title": "ML Engineer",
        "description": "Production ML systems and scalable deployment.",
        "difficulty": "advanced",
        "estimated_completion": "9-12 months",
        "prerequisites": ["Python", "ML basics", "Cloud basics"],
        "learning_path": [
            "Model training pipelines",
            "Feature stores & versioning",
            "Serving (TorchServe/TensorFlow Serving)",
            "Monitoring & drift",
            "Optimization (quantization/pruning)",
        ],
        "related_domains": ["mlops", "data-engineering", "nlp", "computer-vision"],
        "universal_foundations": UNIVERSAL_FOUNDATIONS,
    },
    "frontend-dev": {
        "domain_id": "frontend-dev",
        "title": "Frontend Developer",
        "description": "Build user interfaces for the web.",
        "difficulty": "beginner",
        "estimated_completion": "3-6 months",
        "prerequisites": ["HTML", "CSS", "JavaScript"],
        "learning_path": [
            "HTML semantics & responsive CSS",
            "Modern JS (ES6+)",
            "React fundamentals (hooks, router)",
            "State management (Context/Redux)",
            "Testing & accessibility",
            "Performance & PWAs",
        ],
        "related_domains": ["full-stack", "backend-dev", "ui-ux"],
        "universal_foundations": UNIVERSAL_FOUNDATIONS,
    },
    "backend-dev": {
        "domain_id": "backend-dev",
        "title": "Backend Developer",
        "description": "Build APIs and services with databases and auth.",
        "difficulty": "intermediate",
        "estimated_completion": "4-8 months",
        "prerequisites": ["JavaScript/Java/Python", "Databases"],
        "learning_path": [
            "REST/GraphQL APIs",
            "Database modeling & ORMs",
            "Auth (JWT/OAuth2)",
            "Caching (Redis) & queues (Kafka)",
            "CI/CD & deployment (Docker)",
            "Observability & security",
        ],
        "related_domains": ["full-stack", "cloud-devops"],
        "universal_foundations": UNIVERSAL_FOUNDATIONS,
    },
}

# Placeholder list of 70+ slugs to be expanded; UI will handle pagination/search.
ALL_DOMAIN_SLUGS: List[str] = list(DOMAINS_ROADMAP.keys()) + [
    # Extend with more slugs as data is curated
    "full-stack", "mobile-android", "mobile-ios", "flutter", "react-native",
    "nlp", "computer-vision", "recommender-systems", "time-series",
    "data-engineering", "big-data", "analytics-engineer", "business-intelligence",
    "cloud", "devops", "sre", "cybersecurity", "appsec", "pentest", "blue-team",
    "embedded", "iot", "robotics", "fpga", "vlsi", "control-systems", "dsp",
    "hpc", "gpu", "database-engineer", "information-retrieval", "blockchain",
    "web3", "ar-vr", "game-dev-unity", "game-dev-unreal", "graphics-rendering",
    "privacy-engineering", "observability", "product-analytics", "quant",
]
