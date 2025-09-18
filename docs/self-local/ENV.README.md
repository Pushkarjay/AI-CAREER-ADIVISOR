# Environment Setup Guide

Use these copy-paste templates to configure local development, GitHub secrets, and Render/Vercel deployments. Never commit real secrets to the repo.

## Backend (.env for local / Render)
See `Self-local-documentationtempo files/backend.env.template` for a complete template. On Render, add each key in the dashboard.

## Frontend (.env for local / Vercel)
See `Self-local-documentationtempo files/frontend.env.template`. On Vercel/Netlify, add these as project environment variables.

## GitHub Secrets (CI/CD)
Add these in GitHub → Settings → Secrets and variables → Actions:
- BACKEND_SECRET_KEY
- BACKEND_GEMINI_API_KEY
- BACKEND_CORS_ORIGINS
- FRONTEND_API_BASE_URL
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Optional (if used):
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- GOOGLE_CLOUD_PROJECT, GOOGLE_APPLICATION_CREDENTIALS, VERTEX_AI_LOCATION
- FIRESTORE_DATABASE, BIGQUERY_DATASET, BIGQUERY_LOCATION

## Notes
- Keep the `.env` files out of version control.
- For local development, copy the templates to backend/.env and frontend/.env and fill values.
- For cloud, set the corresponding project variables in the provider UI.
