# FastAPI Backend for AI Career Advisor

A high-performance Python backend implementing a multi-agent system for personalized career guidance.

## Project Structure

```
backend/
├── agents/               # Multi-agent system
│   ├── __init__.py
│   ├── base_agent.py    # Abstract base agent
│   ├── profile_agent.py # User profile processing
│   ├── career_match_agent.py # Career matching
│   ├── skill_gap_agent.py   # Skill analysis
│   └── resource_suggest_agent.py # Resource recommendations
├── api/                 # API route handlers
│   ├── __init__.py
│   ├── auth.py         # Authentication endpoints
│   ├── chat.py         # Chat endpoints
│   ├── careers.py      # Career endpoints
│   ├── profiles.py     # Profile endpoints
│   └── analytics.py    # Analytics endpoints
├── core/               # Core configuration
│   ├── __init__.py
│   ├── config.py       # Application settings
│   ├── security.py     # Security utilities
│   └── database.py     # Database connections
├── models/             # Pydantic models
│   ├── __init__.py
│   ├── user.py        # User models
│   ├── career.py      # Career models
│   └── chat.py        # Chat models
├── services/           # Business logic
│   ├── __init__.py
│   ├── gemini_service.py    # Vertex AI integration
│   ├── firestore_service.py # Firestore operations
│   ├── bigquery_service.py  # BigQuery operations
│   └── document_ai_service.py # Document AI operations
├── tests/              # Test suite
│   ├── __init__.py
│   ├── test_agents.py
│   ├── test_api.py
│   └── test_services.py
├── main.py            # FastAPI application entry point
├── requirements.txt   # Python dependencies
├── Dockerfile        # Container configuration
└── .env.example      # Environment variables template
```

## Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Run development server:
```bash
uvicorn main:app --reload
```

### Environment notes

- Use `GEMINI_TEMPERATURE` (uppercase) for the model temperature. Older docs may show `GEMINI_temperature`; the app now accepts both, but prefer `GEMINI_TEMPERATURE`.
- Prefer `GOOGLE_APPLICATION_CREDENTIALS` pointing to a local JSON file for Google service accounts instead of embedding raw JSON in env vars. Example on Windows PowerShell:
	- `setx GOOGLE_APPLICATION_CREDENTIALS "C:\\path\\to\\service-account.json"`
- Extra/unknown variables in `.env` are ignored at runtime, but it's best to remove unused entries to avoid confusion.

## API Documentation

Once running, visit:
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

Run tests with:
```bash
pytest tests/ -v
```

## Deployment

Build and deploy to Google Cloud Run:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/career-advisor-backend
gcloud run deploy --image gcr.io/PROJECT_ID/career-advisor-backend
```