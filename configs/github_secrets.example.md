# GitHub Secrets Configuration Guide

This document lists all GitHub Secrets required for CI/CD deployment. Set these in your GitHub repository under Settings > Secrets and variables > Actions.

## Required Repository Secrets

### Firebase Configuration
- **`FIREBASE_API_KEY`**
  - Description: Firebase Web API Key for frontend authentication
  - Source: Firebase Console > Project Settings > General > Web apps > SDK setup and configuration
  - Example format: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

- **`FIREBASE_APP_ID`** 
  - Description: Firebase App ID for web application
  - Source: Firebase Console > Project Settings > General > Web apps
  - Example format: `1:123456789:web:abcdef123456789`

- **`FIREBASE_MEASUREMENT_ID`**
  - Description: Google Analytics measurement ID (optional)
  - Source: Firebase Console > Project Settings > General > Google Analytics
  - Example format: `G-XXXXXXXXXX`

- **`FIREBASE_TOKEN`**
  - Description: Firebase CLI refresh token for deployment
  - Source: Run `firebase login:ci` locally and copy the token
  - Example format: `1//abcdefghijklmnopqrstuvwxyz...`

### Google Cloud Platform
- **`GCP_PROJECT_ID`**
  - Description: Google Cloud Project ID
  - Source: Google Cloud Console > Project Info
  - Example format: `my-project-12345`

- **`GCP_SA_KEY`**
  - Description: Google Cloud Service Account JSON key (base64 encoded or raw JSON)
  - Source: Google Cloud Console > IAM & Admin > Service Accounts > Create Key
  - Format: Complete JSON service account key file content
  - Required permissions:
    - Cloud Run Admin
    - Cloud Build Editor  
    - Artifact Registry Administrator
    - Firebase Hosting Admin
    - Storage Admin
    - Service Account User

## Setting Up GitHub Secrets

1. **Navigate to your repository** on GitHub
2. **Go to Settings** > Secrets and variables > Actions
3. **Click "New repository secret"** for each secret above
4. **Enter the name** exactly as shown (case-sensitive)
5. **Paste the value** from the corresponding source
6. **Click "Add secret"**

## Security Best Practices

- ✅ **Never commit secrets** to your repository code
- ✅ **Rotate secrets regularly** (every 90 days recommended)
- ✅ **Use minimal permissions** for service accounts
- ✅ **Monitor secret usage** in Actions logs
- ❌ **Never log or echo** secret values in workflows
- ❌ **Don't store secrets** in issues, pull requests, or wiki

## Troubleshooting

### Deployment Fails with "Missing Secret"
- Verify secret name matches exactly (case-sensitive)
- Check that secret value is complete and not truncated
- Ensure service account has required permissions

### Firebase Deployment Fails
- Verify `FIREBASE_TOKEN` is current (tokens expire)
- Check `GCP_SA_KEY` has Firebase Hosting Admin role
- Ensure project ID matches across all Firebase secrets

### Backend Deployment Fails  
- Verify `GCP_SA_KEY` has Cloud Run Admin permissions
- Check Google Cloud APIs are enabled in your project
- Ensure `GCP_PROJECT_ID` is correct

## Getting Help

- See `/docs/self-local/how_to_get_credentials.md` for detailed credential setup
- See `/docs/LOCAL_CREDENTIALS_INSTRUCTIONS.md` for local development setup
- See GitHub Actions logs for specific error messages