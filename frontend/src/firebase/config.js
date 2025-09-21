import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';

// Validate required env vars and provide actionable error messages in dev
function requireEnv(name) {
  const value = import.meta.env[name];
  if (!value) {
    const msg = `Missing ${name}. Create frontend/.env with your Firebase Web App config from the Firebase Console (Project Settings → General → Your apps → Web SDK config). See frontend/.env.example.`;
    // Throw in dev to fail fast; in prod it will also surface clearly
    throw new Error(msg);
  }
  return value;
}

const firebaseConfig = {
  apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
  authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requireEnv('VITE_FIREBASE_APP_ID'),
  // Optional
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

// For development - you can enable this when you have Firebase emulator running
// if (import.meta.env.DEV && !auth._config.emulator) {
//   connectAuthEmulator(auth, "http://localhost:9099");
// }
