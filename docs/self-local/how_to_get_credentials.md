# How to Get All Necessary Credentials

This guide provides a step-by-step flow to obtain all the credentials required for the **Personalized AI Career Advisor** project.

**⚠️ IMPORTANT:** Many Google Cloud services require a billing account (credit card). For student projects, we recommend using the **FREE ALTERNATIVES** section below.

---

## 💳 Billing Requirements Alert

### **Services That Require Billing Account:**
- ❌ Cloud Firestore API (after free tier limits)
- ❌ BigQuery API (after 1TB/month free)
- ❌ Vertex AI API (pay-per-use)
- ❌ Cloud Run (after free tier)
- ❌ Document AI API (pay-per-document)

### **Free Services (No Billing Required):**
- ✅ Firebase Authentication (50,000 MAU free)
- ✅ Firebase Hosting (10GB storage free)
- ✅ Google Analytics (completely free)
- ✅ Gemini API (limited free tier in some regions)

---

## 🆓 RECOMMENDED: Free Alternative Stack

**For student projects and prototypes, use this 100% free stack:**

### **Free Database & Auth:** Supabase
- **What:** PostgreSQL database + authentication
- **Free Tier:** 500MB database, 50MB file storage, 50,000 MAU
- **Setup:** [supabase.com](https://supabase.com) → Create account → New project

### **Free AI/Chat:** Multiple Options
1. **Ollama (Local)** - Run AI models on your computer
2. **Hugging Face API** - Free tier with rate limits
3. **OpenAI** - $5 free credit for new accounts
4. **Cohere** - 100 requests/month free

### **Free Hosting:** 
- **Frontend:** Vercel, Netlify (unlimited for personal projects)
- **Backend:** Railway, Render, Heroku alternatives

### **Free Analytics:** Google Analytics 4

---

## 🔄 Choose Your Path

### **Path A: 100% Free (Recommended for Students)**
Skip to **Section 4: Free Alternative Setup** below

### **Path B: Google Cloud (Requires Billing Account)**
Continue with the Google Cloud setup below

---

## 1. Google Cloud Platform (GCP) Setup

### 1.1. Create a Google Cloud Project

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Click the project drop-down menu at the top of the page and click **"New Project"**.
3.  Give your project a name (e.g., `ai-career-advisor`) and click **"Create"**.
4.  Your **Project ID** will be displayed on the project dashboard. This is your `GCP_PROJECT_ID`.

### 1.2. Enable Required APIs

For your new project, you need to enable several APIs.

1.  In the Cloud Console, navigate to **"APIs & Services" > "Library"**.
2.  Search for and enable each of the following APIs one by one:
    *   **Cloud Firestore API**
    *   **BigQuery API**
    *   **Document AI API**
    *   **Vertex AI API**
    *   **Cloud Run Admin API**
    *   **Cloud Build API**

### 1.3. Create a Service Account (`GCP_SA_KEY`)

The backend needs a service account to securely interact with Google Cloud services.

1.  Go to **"IAM & Admin" > "Service Accounts"**.
2.  Click **"+ CREATE SERVICE ACCOUNT"**.
3.  Give it a name (e.g., `backend-service`) and a description. Click **"Create and Continue"**.
4.  Grant the following roles to the service account. Search for each role and add it:
    *   `Cloud Datastore User` (for Firestore)
    *   `BigQuery Data Editor`
    *   `Document AI Editor`
    *   `Vertex AI User`
    *   `Cloud Run Invoker`
5.  Click **"Continue"**, then **"Done"**.
6.  Find the service account you just created in the list, click the three-dot menu under "Actions", and select **"Manage keys"**.
7.  Click **"ADD KEY" > "Create new key"**.
8.  Choose **JSON** as the key type and click **"Create"**.
9.  A JSON file will be downloaded to your computer. **This is a critical secret!**
10. Open the downloaded JSON file, copy its entire contents. This is the value for your `GCP_SA_KEY`.

### 1.4. Get Your Gemini API Key (`GEMINI_API_KEY`)

1.  Go to the [Google AI Studio](https://aistudio.google.com/).
2.  Click on **"Get API key"** in the top left.
3.  Click **"Create API key in new project"**.
4.  Your API key will be generated. Copy this key. This is your `GEMINI_API_KEY`.

---

## 2. Firebase Setup

### 2.1. Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"**.
3.  Select the Google Cloud project you created earlier from the dropdown menu.
4.  Follow the on-screen instructions to finish adding Firebase to your project.

### 2.2. Get Frontend Firebase Config

1.  In the Firebase Console, go to your project's **"Project Settings"** (click the gear icon).
2.  In the "General" tab, scroll down to "Your apps".
3.  Click the web icon (`</>`) to register a new web app.
4.  Give it a nickname (e.g., `career-advisor-frontend`) and click **"Register app"**.
5.  Firebase will provide you with a `firebaseConfig` object. These are the values you need for your frontend's `.env` file.

    ```javascript
    const firebaseConfig = {
      apiKey: "AIza...", // VITE_FIREBASE_API_KEY
      authDomain: "your-project.firebaseapp.com", // VITE_FIREBASE_AUTH_DOMAIN
      projectId: "your-project-id", // VITE_FIREBASE_PROJECT_ID
      storageBucket: "your-project.appspot.com", // VITE_FIREBASE_STORAGE_BUCKET
      messagingSenderId: "1234567890", // VITE_FIREBASE_MESSAGING_SENDER_ID
      appId: "1:12345..." // VITE_FIREBASE_APP_ID
    };
    ```

### 2.3. Set up Firebase Authentication

1.  In the Firebase Console, go to **"Build" > "Authentication"**.
2.  Click **"Get started"**.
3.  Under the "Sign-in method" tab, enable the providers you want to use (e.g., **Google** and **Email/Password**).

### 2.4. Get Firebase CI Token (`FIREBASE_TOKEN`)

This token is needed for GitHub Actions to deploy your frontend to Firebase Hosting.

1.  Open your local terminal (make sure you have the Firebase CLI installed: `npm install -g firebase-tools`).
2.  Run the command: `firebase login:ci`
3.  This will open a browser window for you to log in. After logging in, a token will be displayed in your terminal.
4.  Copy this token. This is your `FIREBASE_TOKEN` for GitHub Actions secrets.

---

## 3. Add Credentials to GitHub Secrets

For the CI/CD pipeline to work, you must add the credentials to your GitHub repository's secrets.

1.  Go to your repository on GitHub.
2.  Click on **"Settings" > "Secrets and variables" > "Actions"**.
3.  Click **"New repository secret"** for each of the following:
    *   **`GCP_PROJECT_ID`**: Your Google Cloud project ID.
    *   **`GCP_SA_KEY`**: The full content of the service account JSON file you downloaded.
    *   **`FIREBASE_TOKEN`**: The CI token you generated from the Firebase CLI.

You have now gathered all the necessary credentials! Remember to place them in the `.env` files in your local `frontend` and `backend` directories for local development.

---

## 4. 🆓 Free Alternative Setup (Recommended for Students)

### 4.1. Supabase Setup (Free Database + Auth)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New project"**
3. Choose organization and enter project details
4. Wait for project to be created (2-3 minutes)
5. Go to **Settings > API** to get your credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (for backend)
   ```

### 4.2. Free AI Options Setup

#### Option 1: Ollama (Local AI - Completely Free)
1. Install Ollama: [ollama.ai](https://ollama.ai)
2. Download a model: `ollama pull llama3.1:8b`
3. Run locally: `ollama serve`
4. Use endpoint: `http://localhost:11434`

#### Option 2: OpenAI Free Credits
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account and verify phone number
3. Get $5 free credits for new accounts
4. Create API key in **API Keys** section
   ```
   OPENAI_API_KEY=sk-your-api-key
   ```

#### Option 3: Hugging Face (Free Tier)
1. Go to [huggingface.co](https://huggingface.co) and create account
2. Go to **Settings > Access Tokens**
3. Create new token with "Read" permissions
   ```
   HUGGINGFACE_API_KEY=hf_your-token
   ```

### 4.3. Free Hosting Setup

#### Frontend: Vercel (Free)
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Import your repository
3. Environment variables are set in Vercel dashboard
4. Automatic deployments on git push

#### Backend: Railway (Free)
1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Create new project from GitHub repo
3. Add environment variables in Railway dashboard
4. Free tier: 500 hours/month, 1GB RAM

### 4.4. Analytics: Google Analytics 4 (Free)
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create account and property
3. Get your Measurement ID: `G-XXXXXXXXXX`
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

---

## 5. Environment Variables Summary

### Frontend `.env` (Free Stack)
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Analytics (Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# App Config
VITE_APP_NAME=AI Career Advisor
VITE_API_URL=http://localhost:8000
```

### Backend `.env` (Free Stack)
```bash
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI (Choose one)
OPENAI_API_KEY=sk-your-api-key
# OR
HUGGINGFACE_API_KEY=hf_your-token
# OR
OLLAMA_BASE_URL=http://localhost:11434

# App Config
ENVIRONMENT=development
API_PORT=8000
CORS_ORIGINS=http://localhost:5173
```

---

## 6. Cost Comparison

| Service | Google Cloud | Free Alternative | Monthly Cost |
|---------|--------------|------------------|--------------|
| Database | Firestore | Supabase | $0 vs $25+ |
| Auth | Firebase Auth | Supabase Auth | $0 vs $0 |
| AI/Chat | Vertex AI | Ollama/OpenAI Credits | $0-5 vs $20+ |
| Hosting | Cloud Run | Vercel/Railway | $0 vs $15+ |
| Analytics | GA4 | GA4 | $0 vs $0 |
| **TOTAL** | **$60+/month** | **$0-5/month** | **92% savings** |

---

## 7. Quick Start Commands

### Setup with Free Stack
```bash
# 1. Clone and setup
git clone https://github.com/Pushkarjay/Gen-AI-Hackathon.git
cd Gen-AI-Hackathon

# 2. Install dependencies
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# 3. Copy environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# 4. Edit .env files with your Supabase credentials
# (Use the values from step 4.1 above)

# 5. Start development servers
# Terminal 1:
cd backend && uvicorn main:app --reload

# Terminal 2:
cd frontend && npm run dev
```

### Test Local AI (Ollama)
```bash
# Install and run Ollama
ollama pull llama3.1:8b
ollama serve

# Test API
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "What is a data scientist?"
}'
```

---

## 🎓 Student Tips

1. **Start with free alternatives** - Get your MVP working first
2. **Use GitHub Student Pack** - Get free credits for various services
3. **Monitor usage** - Set up billing alerts if using paid services
4. **Scale gradually** - Move to paid tiers only when necessary
5. **Keep backups** - Free tiers have limitations, backup your data

**Remember:** The free stack is powerful enough for prototypes, learning, and even small production applications!
