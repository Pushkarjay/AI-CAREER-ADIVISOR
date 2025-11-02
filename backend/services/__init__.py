"""Services package initialization."""

from core.config import settings

# Default to mock services if DEBUG is not explicitly set to False
if settings.DEBUG:
    from .bigquery_service_mock import BigQueryService
    from .firestore_service_mock import FirestoreService
    from .gemini_service_mock import GeminiService
    
else:
    from .bigquery_service import BigQueryService
    from .firestore_service import FirestoreService
    from .gemini_service_real import GeminiService as GeminiService

__all__ = [
    "BigQueryService",
    "FirestoreService",
    "GeminiService",
]