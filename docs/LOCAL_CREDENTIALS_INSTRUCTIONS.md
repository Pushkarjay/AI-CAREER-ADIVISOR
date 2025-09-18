# Local Credentials Setup Instructions

## Overview
During repository cleanup, sensitive credential files were moved to `/private_credentials_local/` to prevent accidental commits. This folder is ignored by Git and will not be pushed to the remote repository.

## Moved Files and Local Placement

### For Local Development Setup

**Backend Credentials:**
- Place `backend.env` at `/private_credentials_local/backend.env`
- Place `backend-service-account-key.json` at `/private_credentials_local/backend-service-account-key.json`  
- Place `backend-firebase-admin-key.json` at `/private_credentials_local/backend-firebase-admin-key.json`

**Frontend Credentials:**
- Place `frontend.env` at `/private_credentials_local/frontend.env`

**Authentication Data:**
- Place `auth-users.json` at `/private_credentials_local/auth-users.json`

**Google Cloud Service Accounts:**
- Place `ai-career-advisor-id-acd48fa625db.json` at `/private_credentials_local/ai-career-advisor-id-acd48fa625db.json`
- Place `ai-career-advisor-id-firebase-adminsdk-fbsvc-582e048011.json` at `/private_credentials_local/ai-career-advisor-id-firebase-adminsdk-fbsvc-582e048011.json`

## Setting Up Local Development

1. **Copy credentials to working directories:**
   ```bash
   # Copy backend env file
   cp private_credentials_local/backend.env backend/.env
   
   # Copy frontend env file  
   cp private_credentials_local/frontend.env frontend/.env
   
   # Copy service account keys for backend
   cp private_credentials_local/backend-service-account-key.json backend/service-account-key.json
   cp private_credentials_local/backend-firebase-admin-key.json backend/firebase-admin-key.json
   ```

2. **Update environment file paths if needed** - some code may reference relative paths to credential files

3. **Never commit these working copies** - they are covered by `.gitignore` patterns

## Security Reminders

- ⚠️ **NEVER commit files from `/private_credentials_local/`**
- ⚠️ **Do not share credential files** via email, chat, or public repositories  
- ⚠️ **Regenerate credentials** if accidentally exposed
- ✅ **Use the example files** in `/configs/` as templates for new setups

## Getting New Credentials

Refer to `/Self-local-documentationtempo files/how_to_get_credentials.md` for instructions on obtaining fresh credentials from Google Cloud Console and Firebase.