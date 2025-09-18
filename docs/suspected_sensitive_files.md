# Suspected Sensitive Files Report

Generated during repo cleanup on 2025-09-18 22:45

## Files Identified for Security Review

### Service Account JSON Files (HIGH RISK)
- `Self-local-documentationtempo files/ai-career-advisor-id-acd48fa625db.json` - Google Cloud service account key
- `Self-local-documentationtempo files/ai-career-advisor-id-firebase-adminsdk-fbsvc-582e048011.json` - Firebase Admin SDK service account key  
- `backend/service-account-key.json` - Google Cloud service account key (local development)
- `backend/firebase-admin-key.json` - Firebase Admin SDK key (local development)

### Environment Files (MEDIUM RISK)
- `backend/.env` - Backend environment variables (may contain API keys, secrets)
- `frontend/.env` - Frontend environment variables (may contain API keys)

### Credential Template/Production Files (LOW-MEDIUM RISK)
- `Self-local-documentationtempo files/backend_env_production.txt` - Production environment template
- `Self-local-documentationtempo files/frontend_env_production.txt` - Production environment template  
- `Self-local-documentationtempo files/backend.env.template` - Backend environment template
- `Self-local-documentationtempo files/frontend.env.template` - Frontend environment template
- `Self-local-documentationtempo files/how_to_get_credentials.md` - Credential setup instructions

### Authentication Data (MEDIUM RISK)
- `auth-users.json` - Local authentication user data

## Scan Summary
- **Total suspicious files found:** 11
- **High risk (service accounts/keys):** 4 files
- **Medium risk (env files/auth data):** 3 files  
- **Low-medium risk (templates/docs):** 4 files

## Security Notes
- Service account JSON files contain private keys and should NEVER be committed to version control
- Environment files may contain API keys, database URLs, and other sensitive configuration
- All identified files will be moved to `/private_credentials_local/` which is added to `.gitignore`

## Next Steps
1. Move all identified files to local-only directory
2. Update `.gitignore` to prevent future commits of sensitive files
3. Create example/template files for development setup guidance
4. Document local credential setup process for developers