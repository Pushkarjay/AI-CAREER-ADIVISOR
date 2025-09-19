"""Database connection management for Firestore."""

import logging
import os
from core.config import settings

logger = logging.getLogger(__name__)

try:
    import firebase_admin
    from firebase_admin import credentials, firestore as fa_firestore
except Exception:  # pragma: no cover
    firebase_admin = None
    fa_firestore = None


# Global database connection
firestore_db = None


def _init_firebase_admin_if_possible():
    """Initialize Firebase Admin if credentials are available."""
    if firebase_admin is None:
        return None
    try:
        if not firebase_admin._apps:
            # Prefer explicit service account from env variables
            if settings.FIREBASE_PRIVATE_KEY and settings.FIREBASE_CLIENT_EMAIL and settings.FIREBASE_PROJECT_ID:
                private_key = settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n')
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID or "",
                    "private_key": private_key,
                    "client_email": settings.FIREBASE_CLIENT_EMAIL,
                    "client_id": settings.FIREBASE_CLIENT_ID or "",
                    "auth_uri": settings.FIREBASE_AUTH_URI or "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": settings.FIREBASE_TOKEN_URI or "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{settings.FIREBASE_CLIENT_EMAIL}"
                })
                firebase_admin.initialize_app(cred)
                logger.info("Initialized Firebase Admin from env service account")
            # Check for FIREBASE_ADMIN_CREDENTIALS file path
            elif settings.FIREBASE_ADMIN_CREDENTIALS and os.path.exists(settings.FIREBASE_ADMIN_CREDENTIALS):
                cred = credentials.Certificate(settings.FIREBASE_ADMIN_CREDENTIALS)
                firebase_admin.initialize_app(cred)
                logger.info(f"Initialized Firebase Admin from credentials file: {settings.FIREBASE_ADMIN_CREDENTIALS}")
            # Check for GOOGLE_APPLICATION_CREDENTIALS file
            elif settings.GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS):
                cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS)
                firebase_admin.initialize_app(cred)
                logger.info(f"Initialized Firebase Admin from Google credentials: {settings.GOOGLE_APPLICATION_CREDENTIALS}")
            # Try using Application Default Credentials (works in Cloud Run)
            else:
                try:
                    cred = credentials.ApplicationDefault()
                    firebase_admin.initialize_app(cred)
                    logger.info("Initialized Firebase Admin from application default credentials")
                except Exception as e:
                    logger.warning(f"Failed to use Application Default Credentials: {e}")
                    logger.warning("Firebase Admin credentials not set; using mock Firestore")
                    return None
        return fa_firestore.client() if fa_firestore is not None else None
    except Exception as e:  # pragma: no cover
        logger.error(f"Failed to initialize Firebase Admin: {e}")
        return None


async def initialize_connections():
    """Initialize Firestore connection."""
    global firestore_db
    try:
        real_client = _init_firebase_admin_if_possible()
        if real_client is not None:
            firestore_db = real_client
            logger.info("Firestore connection initialized (real)")
        else:
            logger.warning("Failed to initialize Firebase Admin - no credentials found")
            # In production, we want this to fail, but let's try to continue
            from core.config import settings
            if not settings.DEBUG:
                logger.error("Production environment requires Firebase credentials")
                raise RuntimeError("Firestore initialization failed - credentials required in production")
            else:
                logger.warning("Running in debug mode without Firebase credentials")
    except Exception as e:
        logger.error(f"Failed to initialize Firestore connection: {e}")
        # Only raise in production
        from core.config import settings
        if not settings.DEBUG:
            raise
        else:
            logger.warning("Continuing without Firestore in debug mode")


def get_firestore_db():
    """Get Firestore database client."""
    if firestore_db is None:
        raise RuntimeError("Firestore not initialized")
    return firestore_db