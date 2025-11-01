# Environment Configuration Guide

## Security Notice
**NEVER commit `.env` files to the repository!** They contain sensitive credentials.

## Setup Instructions

### Local Development

1. **Copy the example file:**
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Fill in your credentials** in `.env`:
   - Get Firebase credentials from Firebase Console
   - Use `http://localhost:8000` for local backend
   - Keep all secrets private

### Production Deployment

**DO NOT** edit `.env` files for production! Instead:

1. **Add secrets to GitHub:**
   - Go to: Repository Settings → Secrets and variables → Actions
   - Already configured secrets:
     - `FIREBASE_API_KEY`
     - `FIREBASE_APP_ID`
     - `FIREBASE_MEASUREMENT_ID`
     - `GCP_PROJECT_ID`
     - `GCP_SA_KEY`
     - `GEMINI_API_KEY`

2. **GitHub Actions handles production:**
   - The workflow in `.github/workflows/deploy.yml` sets environment variables
   - Production uses HTTPS backend: `https://backend-service-680116190409.asia-south1.run.app`
   - All secrets are injected during build time

## How It Works

### Local Development
- `.env` file is read by Vite
- Uses `http://localhost:8000` for backend
- Git ignores `.env` (protected by `.gitignore`)

### Production Build (GitHub Actions)
- Environment variables are set in the workflow
- Secrets are pulled from GitHub repository secrets
- Backend URL is forced to HTTPS Cloud Run endpoint
- No `.env` file is used or needed

## Files

- `frontend/.env` - Local development (git ignored, never commit!)
- `frontend/.env.example` - Template file (safe to commit)
- `.github/workflows/deploy.yml` - Production environment configuration

## Current Production URLs

- **Frontend:** `https://ai-career-advisor-id.web.app`
- **Backend:** `https://backend-service-680116190409.asia-south1.run.app`
