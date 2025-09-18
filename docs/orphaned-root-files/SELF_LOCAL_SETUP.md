# AI Career Advisor - Complete Setup Guide

## 🔍 Architecture Overview

**Current Deployment Architecture:**
- **Frontend**: React + Vite → Firebase Hosting (`frontend/dist`)
- **Backend**: FastAPI → Google Cloud Run (`backend-service` in `asia-south1`)
- **Database**: Firestore (currently locked down with restrictive rules)
- **Authentication**: Firebase Auth (Google Sign-In)
- **CI/CD**: GitHub Actions (automated deploy to both Cloud Run + Firebase Hosting)

## 📋 Quick Status Check

### ✅ What's Working:
- React frontend with Vite build system ✓
- FastAPI backend with proper CORS and middleware ✓
- Firebase configuration with environment validation ✓
- GitHub Actions CI/CD pipeline ✓
- Environment-based URL switching (via `VITE_API_BASE_URL`) ✓

### ⚠️ Critical Issues Found:
1. **Firestore Rules**: Currently blocking ALL reads/writes (`allow read, write: if false`)
2. **Missing Environment Files**: No `.env` files exist (only templates)
3. **Firebase Hosting API Rewrites**: Config points to Cloud Run but may need verification
4. **Authentication Flow**: Frontend expects both Firebase Auth + backend JWT

## 🚀 Step-by-Step Setup Instructions

### 1. Google Cloud & Firebase Setup

#### 1.1 Enable Required APIs
```bash
# In Google Cloud Console (https://console.cloud.google.com)
# Enable the following APIs for your project:

- Cloud Run API
- Firebase Hosting API
- Firestore API
- Firebase Authentication API
- Identity and Access Management (IAM) API
```

#### 1.2 Firebase Project Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ai-career-advisor-id` ✅ (Already exists)
3. **Authentication Setup**:
   - Enable Google Sign-In provider
   - Add authorized domains:
     - `localhost` (for local development)
     - `ai-career-advisor-id.web.app` (Firebase Hosting domain)
     - `ai-career-advisor-id.firebaseapp.com` (Firebase Hosting domain)

#### 1.3 Get Firebase Web Config
1. Go to Project Settings → General → Your apps
2. Select your web app or create new one
3. Copy the Firebase config object:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "ai-career-advisor-id.firebaseapp.com",
  projectId: "ai-career-advisor-id",
  storageBucket: "ai-career-advisor-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 2. Local Environment Setup

#### 2.1 Create Frontend Environment File
Create `frontend/.env`:
```bash
# Local Development
VITE_API_BASE_URL=http://localhost:8000

# Firebase Config (from step 1.3)
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=ai-career-advisor-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-career-advisor-id
VITE_FIREBASE_STORAGE_BUCKET=ai-career-advisor-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Optional
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### 2.2 Create Backend Environment File
Create `backend/.env`:
```bash
# Application
APP_NAME=AI Career Advisor Backend
DEBUG=True
LOG_LEVEL=DEBUG

# CORS (include your Firebase Hosting URL when deployed)
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","https://ai-career-advisor-id.web.app"]

# Security
SECRET_KEY=your-super-secret-key-for-jwt-signing

# Google Cloud
GOOGLE_CLOUD_PROJECT=ai-career-advisor-id
# Leave empty for local development with application default credentials
GOOGLE_APPLICATION_CREDENTIALS=

# AI Services
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-pro
GEMINI_TEMPERATURE=0.7
```

### 3. Google Cloud Service Account for CI/CD ✅ Already Done!

Your project already has the necessary service accounts:
- `backend-service@ai-career-advisor-id.iam.gserviceaccount.com` ✅
- `firebase-adminsdk-fbsvc@ai-career-advisor-id.iam.gserviceaccount.com` ✅

#### 3.1 Service Account Keys Available
You have existing service account keys:
- `backend-service` key: `acd48fa625db8c9825e9c99ee292cce40296804a` (created Sept 18, 2025)
- `firebase-adminsdk` key: `582e048011c7808c7adab8ab40c6062c302972ca` (created Sept 17, 2025)

**For GitHub Actions**, you can use either:
1. The existing `backend-service` service account key
2. Download the key JSON from the Console if you need it for GitHub secrets

### 4. GitHub Secrets Configuration

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Value |
|-------------|-------|
| `GCP_PROJECT_ID` | ai-career-advisor-id |
| `GCP_SA_KEY` | Contents of your service account JSON key file |

### 5. Fix Firestore Security Rules

**⚠️ CRITICAL**: Current Firestore rules block everything. Update `firestore.rules`:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read/write their profiles
    match /profiles/{profileId} {
      allow read, write: if request.auth != null && request.auth.uid == profileId;
    }
    
    // Allow authenticated users to read career data
    match /careers/{document=**} {
      allow read: if request.auth != null;
    }
    
    // Allow authenticated users to read/write their chat sessions
    match /chat_sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
    
    // Allow authenticated users to access analytics (read-only)
    match /analytics/{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### 6. Local Development Testing

#### 6.1 Test Backend Locally
```bash
cd backend
pip install -r requirements.txt
python main.py
# Should start on http://localhost:8000
# Test: http://localhost:8000/health
```

#### 6.2 Test Frontend Locally
```bash
cd frontend
npm install
npm run dev
# Should start on http://localhost:5173
```

#### 6.3 Verify Environment Switching
The frontend automatically uses:
- **Local**: `http://localhost:8000` (from `VITE_API_BASE_URL`)
- **Production**: Firebase Hosting rewrites `/api/**` to Cloud Run service

### 7. Production Deployment

#### 7.1 Manual Deploy (Fallback)
```bash
# Build and deploy frontend
cd frontend
npm run build
firebase deploy --only hosting

# Deploy backend
cd ../backend
gcloud run deploy backend-service \
  --source . \
  --region asia-south1 \
  --project ai-career-advisor-id \
  --allow-unauthenticated
```

#### 7.2 Verify Production URLs
After deployment, verify:
- **Frontend URL**: `https://ai-career-advisor-id.web.app`
- **Backend URL**: `https://backend-service-xxxx-uc.a.run.app`
- **API Routing**: `https://ai-career-advisor-id.web.app/api/health` should proxy to backend

### 8. Environment Variables Summary

| Environment | Frontend URL | Backend URL | Config Method |
|-------------|-------------|-------------|---------------|
| **Local Dev** | `http://localhost:5173` | `http://localhost:8000` | `frontend/.env` → `VITE_API_BASE_URL` |
| **Production** | `https://ai-career-advisor-id.web.app` | `https://backend-service-xxxx.run.app` | Firebase Hosting rewrites |

### 9. Authentication Flow Verification

1. **Frontend**: Firebase Auth handles Google Sign-In
2. **Token Exchange**: Frontend gets Firebase ID token
3. **Backend**: FastAPI validates Firebase token and creates session
4. **API Calls**: Frontend sends Firebase token in `Authorization: Bearer <token>` header

### 10. Troubleshooting Checklist

#### Local Development Issues:
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173  
- [ ] `.env` files created with correct values
- [ ] Firebase Auth redirect URLs include `localhost`

#### Production Issues:
- [ ] GitHub secrets configured correctly
- [ ] Firestore rules updated (not blocking all access)
- [ ] CORS origins include Firebase Hosting domain
- [ ] Service account has required permissions

#### API Connection Issues:
- [ ] Check browser network tab for API calls
- [ ] Verify `VITE_API_BASE_URL` in local development
- [ ] Check Firebase Hosting rewrite rules for production

### 11. Next Manual Actions Required

Before running the app, you MUST:

1. **Create Firebase project** and enable Authentication + Firestore
2. **Add Google Sign-In provider** with correct redirect URLs
3. **Create `.env` files** in both `frontend/` and `backend/` directories
4. **Get Gemini API key** from Google AI Studio
5. **Update Firestore rules** (currently blocking everything)
6. **Create GitHub secrets** for CI/CD deployment
7. **Test locally** before pushing to production

### 12. URLs to Test After Setup

| Test Case | URL | Expected Result |
|-----------|-----|-----------------|
| Backend Health | `http://localhost:8000/health` | `{"status": "healthy"}` |
| Backend API Docs | `http://localhost:8000/docs` | FastAPI documentation |
| Frontend Local | `http://localhost:5173` | React app loads |
| Production Frontend | `https://ai-career-advisor-id.web.app` | React app loads |
| Production API | `https://ai-career-advisor-id.web.app/api/health` | Proxied to backend |

---

**⚠️ Security Notes:**
- Never commit real API keys to git
- Use GitHub secrets for CI/CD credentials
- Update Firestore rules before production
- Configure CORS properly for your domains
- Use strong `SECRET_KEY` for JWT signing

**📞 Support:**
- Check GitHub Actions logs for deployment issues
- Use Firebase Console for Auth/Firestore debugging
- Monitor Google Cloud Logs for backend errors