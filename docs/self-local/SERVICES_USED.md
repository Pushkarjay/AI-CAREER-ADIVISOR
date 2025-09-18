# Services Used in AI Career Advisor

This document summarizes all external and internal services the app uses, and where/how they are configured.

## 1) Backend (FastAPI)
- Purpose: Core API for chat, careers, profiles, analytics
- Location: `backend/`
- Framework: FastAPI + Uvicorn
- CORS: controlled by `BACKEND_CORS_ORIGINS`
- Base URL (local): `http://localhost:8000`

## 2) Google Gemini (Generative AI)
- Purpose: AI responses, intent analysis
- Env Vars: `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_TEMPERATURE`
- Files: `backend/services/gemini_service_real.py`, `backend/api/chat.py`

## 3) Firebase Authentication (Frontend)
- Purpose: User auth (email/password, Google)
- Env Vars (Frontend): `VITE_FIREBASE_*`
- File: `frontend/src/firebase/config.js`

## 4) Optional Data Stores (Mocked/Pluggable)
- Firestore (Mock service provided):
  - Env: `FIRESTORE_DATABASE`
  - File: `backend/services/firestore_service_mock.py`
- Supabase (present in .env, optional):
  - Env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- BigQuery (optional analytics):
  - Env: `BIGQUERY_DATASET`, `BIGQUERY_LOCATION`

## 5) Frontend (React + Vite + Tailwind)
- Location: `frontend/`
- Dev server: `http://localhost:5173` (auto-bumps ports if busy)
- API base: `VITE_API_BASE_URL` (default: `http://localhost:8000`)

## 6) Deployment Targets
- Render (Backend): containerized FastAPI; configure env in Render dashboard
- Vercel/Netlify (Frontend): static build; configure VITE_* env in project settings
- GitHub Secrets: add production secrets for CI/CD workflows

## 7) Secrets/Keys Summary (Do NOT commit real values)
- Backend:
  - `SECRET_KEY` (JWT)
  - `GEMINI_API_KEY`
  - (Optional) Supabase keys, Firebase service credentials
- Frontend:
  - `VITE_API_BASE_URL`
  - `VITE_FIREBASE_*`

## 8) Health/Test Endpoints
- Backend health: `GET /health`
- Chat test (no auth): `POST /api/v1/chat/test` with body `{ "message": "..." }`

## 9) Ports
- Backend: 8000
- Frontend: 5173 (or 5174/5175 if busy)

