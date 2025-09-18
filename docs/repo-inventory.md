# Repository Inventory

Generated during repo cleanup on 2025-09-18 22:45

## Root Level Files and Directories

### Configuration Files
- `.env.example` - Environment variable template
- `.firebaserc` - Firebase project configuration
- `.gitattributes` - Git line ending configuration
- `.gitignore` - Git ignore patterns
- `firebase.json` - Firebase hosting/functions configuration
- `firestore.indexes.json` - Firestore database indexes
- `firestore.rules` - Firestore security rules
- `package.json` - Root-level Node.js dependencies
- `package-lock.json` - Node.js dependency lock file
- `deploy-example.yml` - Deployment configuration example

### Documentation
- `README.md` - Main project documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `SELF_LOCAL_SETUP.md` - Local development setup instructions
- `DEBUG_PRODUCTION.md` - Production debugging notes
- `docs/` - Documentation directory (contains schemas.md)

### Application Code
- `backend/` - FastAPI Python backend application
- `frontend/` - React + Vite frontend application

### Build/Dev Artifacts
- `.firebase/` - Firebase CLI local cache
- `.git/` - Git repository metadata
- `.github/` - GitHub Actions workflows and templates
- `.pytest_cache/` - Python test cache
- `.venv/` - Python virtual environment

### Temporary/Local Files
- `Self-local-documentationtempo files/` - Temporary documentation and credentials
- `auth-users.json` - Local authentication data
- `desktop.ini` - Windows folder configuration

## Directory Structure Details

### backend/
Contains Python FastAPI application with:
- API endpoints
- Database models
- Core configuration
- Agent implementations
- Service integrations

### frontend/ 
Contains React + Vite application with:
- User interface components
- Authentication flows
- API integration
- Build configuration

### .github/
Contains CI/CD workflows:
- `deploy.yml` - Production deployment pipeline

### Self-local-documentationtempo files/
Contains temporary documentation and potentially sensitive files:
- Credential files
- Workshop notes
- Setup instructions
- Service configuration

**Note:** This inventory was created as part of repository reorganization to identify files for consolidation and security review.