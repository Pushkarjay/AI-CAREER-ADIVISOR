"""Database connection management."""

import logging
"""Database connection management for Firestore (Firebase Admin in prod, mock in dev)."""

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


# Mock implementations for development
class MockFirestoreClient:
    def __init__(self):
        logger.info("Using mock Firestore client for development")
    
    def collection(self, name: str):
        return MockCollection(name)

class MockCollection:
    def __init__(self, name: str):
        self.name = name
    
    def document(self, doc_id: str):
        return MockDocument(self.name, doc_id)
    
    def add(self, data: dict):
        logger.info(f"Mock add to {self.name}: {data}")
        return None, MockDocument(self.name, "mock_id")

class MockDocument:
    def __init__(self, collection: str, doc_id: str):
        self.collection = collection
        self.id = doc_id
    
    def get(self):
        logger.info(f"Mock get from {self.collection}/{self.id}")
        return MockSnapshot()
    
    def set(self, data: dict):
        logger.info(f"Mock set to {self.collection}/{self.id}: {data}")

class MockSnapshot:
    def __init__(self):
        self.exists = True
    
    def to_dict(self):
        return {"mock": "data"}


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
            else:
                # Fallback to GOOGLE_APPLICATION_CREDENTIALS or default application credentials
                if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
                    cred = credentials.ApplicationDefault()
                    firebase_admin.initialize_app(cred)
                    logger.info("Initialized Firebase Admin from application default credentials")
                else:
                    logger.warning("Firebase Admin credentials not set; using mock Firestore")
                    return None
        return fa_firestore.client() if fa_firestore is not None else None
    except Exception as e:  # pragma: no cover
        logger.error(f"Failed to initialize Firebase Admin: {e}")
        return None


async def initialize_connections():
    """Initialize Firestore connection (real if possible, otherwise mock)."""
    global firestore_db
    try:
        real_client = _init_firebase_admin_if_possible()
        if real_client is not None:
            firestore_db = real_client
            logger.info("Firestore connection initialized (real)")
        else:
            firestore_db = MockFirestoreClient()
            logger.info("Firestore connection initialized (mock)")
    except Exception as e:
        logger.error(f"Failed to initialize Firestore connection: {e}")
        raise


def get_firestore_db():
    """Get Firestore database client."""
    if firestore_db is None:
        raise RuntimeError("Firestore not initialized")
    return firestore_db