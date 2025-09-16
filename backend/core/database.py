"""Database connection management."""

import logging
from core.config import settings

logger = logging.getLogger(__name__)

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

class MockBigQueryClient:
    def __init__(self):
        logger.info("Using mock BigQuery client for development")
    
    def query(self, query: str):
        logger.info(f"Mock BigQuery query: {query}")
        return []

# Global database connections
firestore_db = None
bigquery_client = None


async def initialize_connections():
    """Initialize database connections."""
    global firestore_db, bigquery_client
    
    try:
        # Initialize mock clients for development
        firestore_db = MockFirestoreClient()
        bigquery_client = MockBigQueryClient()
        
        logger.info("Database connections initialized successfully (mock mode)")
        
    except Exception as e:
        logger.error(f"Failed to initialize database connections: {e}")
        raise


def get_firestore_db():
    """Get Firestore database client."""
    if firestore_db is None:
        raise RuntimeError("Firestore not initialized")
    return firestore_db


def get_bigquery_client():
    """Get BigQuery client."""
    if bigquery_client is None:
        raise RuntimeError("BigQuery not initialized")
    return bigquery_client