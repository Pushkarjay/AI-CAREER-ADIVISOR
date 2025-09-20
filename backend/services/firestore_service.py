"""Firestore service for user data and chat history management."""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

from google.cloud import firestore
from google.cloud.firestore_v1 import FieldFilter

from core.database import get_firestore_db
from models.user import UserProfile
from models.chat import ChatMessage, ChatSession

logger = logging.getLogger(__name__)


class FirestoreService:
    """Service for Firestore database operations."""
    
    def __init__(self):
        self.db = None
    
    def _get_db(self):
        """Get Firestore database client."""
        if self.db is None:
            self.db = get_firestore_db()
        return self.db
    
    async def save_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> str:
        """Save user profile to Firestore."""
        try:
            db = self._get_db()
            
            # Prepare profile document
            profile_doc = {
                "user_id": user_id,
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                **profile_data
            }
            
            # Save to profiles collection
            doc_ref = db.collection("profiles").document(user_id)
            doc_ref.set(profile_doc)
            
            logger.info(f"User profile saved for user: {user_id}")
            return user_id
            
        except Exception as e:
            logger.error(f"Failed to save user profile: {e}")
            raise
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile from Firestore."""
        try:
            db = self._get_db()
            
            doc_ref = db.collection("profiles").document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            else:
                logger.warning(f"Profile not found for user: {user_id}")
                return None
                
        except Exception as e:
            logger.error(f"Failed to get user profile: {e}")
            raise
    
    async def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user profile in Firestore."""
        try:
            db = self._get_db()
            
            updates["updated_at"] = datetime.now()
            
            doc_ref = db.collection("profiles").document(user_id)
            doc_ref.update(updates)
            
            logger.info(f"User profile updated for user: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update user profile: {e}")
            raise
    
    async def create_chat_session(self, user_id: str, title: Optional[str] = None) -> str:
        """Create a new chat session."""
        try:
            db = self._get_db()
            
            session_id = str(uuid.uuid4())
            session_doc = {
                "id": session_id,
                "user_id": user_id,
                "title": title or f"Chat Session {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "is_active": True,
                "message_count": 0
            }
            
            doc_ref = db.collection("chat_sessions").document(session_id)
            doc_ref.set(session_doc)
            
            logger.info(f"Chat session created: {session_id} for user: {user_id}")
            return session_id
            
        except Exception as e:
            logger.error(f"Failed to create chat session: {e}")
            raise
    
    async def save_chat_message(self, session_id: str, user_id: str, 
                               role: str, content: str, message_type: str = "text",
                               metadata: Optional[Dict[str, Any]] = None) -> str:
        """Save a chat message to Firestore."""
        try:
            db = self._get_db()
            
            message_id = str(uuid.uuid4())
            message_doc = {
                "id": message_id,
                "session_id": session_id,
                "user_id": user_id,
                "role": role,
                "content": content,
                "message_type": message_type,
                "metadata": metadata or {},
                "timestamp": datetime.now()
            }
            
            # Save message
            doc_ref = db.collection("chat_messages").document(message_id)
            doc_ref.set(message_doc)
            
            # Update session message count
            session_ref = db.collection("chat_sessions").document(session_id)
            session_ref.update({
                "message_count": firestore.Increment(1),
                "updated_at": datetime.now()
            })
            
            logger.info(f"Chat message saved: {message_id}")
            return message_id
            
        except Exception as e:
            logger.error(f"Failed to save chat message: {e}")
            raise
    
    async def get_chat_history(self, session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get chat history for a session."""
        try:
            db = self._get_db()
            
            # Simple query without ordering to avoid index requirement
            query = (db.collection("chat_messages")
                    .where(filter=FieldFilter("session_id", "==", session_id))
                    .limit(limit))
            
            docs = query.stream()
            messages = [doc.to_dict() for doc in docs]
            
            # Sort in Python instead of Firestore to avoid index requirement
            messages.sort(key=lambda x: x.get('timestamp', ''), reverse=False)
            
            return messages
            
        except Exception as e:
            logger.error(f"Failed to get chat history: {e}")
            # Return empty list as fallback instead of raising
            return []
    
    async def get_user_sessions(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get chat sessions for a user."""
        try:
            db = self._get_db()
            
            query = (db.collection("chat_sessions")
                    .where(filter=FieldFilter("user_id", "==", user_id))
                    .where(filter=FieldFilter("is_active", "==", True))
                    .order_by("updated_at", direction=firestore.Query.DESCENDING)
                    .limit(limit))
            
            docs = query.stream()
            sessions = [doc.to_dict() for doc in docs]
            
            return sessions
            
        except Exception as e:
            logger.error(f"Failed to get user sessions: {e}")
            raise
    
    async def save_career_recommendation(self, user_id: str, 
                                       recommendation_data: Dict[str, Any]) -> str:
        """Save career recommendation result."""
        try:
            db = self._get_db()
            
            rec_id = str(uuid.uuid4())
            rec_doc = {
                "id": rec_id,
                "user_id": user_id,
                "created_at": datetime.now(),
                **recommendation_data
            }
            
            doc_ref = db.collection("career_recommendations").document(rec_id)
            doc_ref.set(rec_doc)
            
            logger.info(f"Career recommendation saved: {rec_id}")
            return rec_id
            
        except Exception as e:
            logger.error(f"Failed to save career recommendation: {e}")
            raise
    
    async def save_skill_gap_analysis(self, user_id: str, 
                                     analysis_data: Dict[str, Any]) -> str:
        """Save skill gap analysis result."""
        try:
            db = self._get_db()
            
            analysis_id = str(uuid.uuid4())
            analysis_doc = {
                "id": analysis_id,
                "user_id": user_id,
                "created_at": datetime.now(),
                **analysis_data
            }
            
            doc_ref = db.collection("skill_gap_analyses").document(analysis_id)
            doc_ref.set(analysis_doc)
            
            logger.info(f"Skill gap analysis saved: {analysis_id}")
            return analysis_id
            
        except Exception as e:
            logger.error(f"Failed to save skill gap analysis: {e}")
            raise
    
    async def save_resource_recommendations(self, user_id: str, 
                                          recommendations_data: Dict[str, Any]) -> str:
        """Save resource recommendations result."""
        try:
            db = self._get_db()
            
            rec_id = str(uuid.uuid4())
            rec_doc = {
                "id": rec_id,
                "user_id": user_id,
                "created_at": datetime.now(),
                **recommendations_data
            }
            
            doc_ref = db.collection("resource_recommendations").document(rec_id)
            doc_ref.set(rec_doc)
            
            logger.info(f"Resource recommendations saved: {rec_id}")
            return rec_id
            
        except Exception as e:
            logger.error(f"Failed to save resource recommendations: {e}")
            raise
    
    async def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get analytics data for a user."""
        try:
            db = self._get_db()
            
            # Get session count
            sessions_query = (db.collection("chat_sessions")
                            .where(filter=FieldFilter("user_id", "==", user_id)))
            session_count = len(list(sessions_query.stream()))
            
            # Get message count
            messages_query = (db.collection("chat_messages")
                            .where(filter=FieldFilter("user_id", "==", user_id)))
            message_count = len(list(messages_query.stream()))
            
            # Get recommendation count
            recs_query = (db.collection("career_recommendations")
                         .where(filter=FieldFilter("user_id", "==", user_id)))
            recommendation_count = len(list(recs_query.stream()))
            
            return {
                "session_count": session_count,
                "message_count": message_count,
                "recommendation_count": recommendation_count,
                "last_active": datetime.now()  # Would be tracked separately
            }
            
        except Exception as e:
            logger.error(f"Failed to get user analytics: {e}")
            raise
    
    async def health_check(self) -> bool:
        """Check if Firestore service is healthy."""
        try:
            db = self._get_db()
            # Simple health check - try to read from a collection
            list(db.collection("profiles").limit(1).stream())
            return True
        except Exception as e:
            logger.error(f"Firestore health check failed: {e}")
            return False
    
    # Domain management methods
    async def save_domain(self, domain_id: str, domain_data: Dict[str, Any]) -> str:
        """Save a domain to Firestore."""
        try:
            db = self._get_db()
            
            domain_doc = {
                "domain_id": domain_id,
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                **domain_data
            }
            
            doc_ref = db.collection("domains").document(domain_id)
            doc_ref.set(domain_doc)
            
            logger.info(f"Domain saved: {domain_id}")
            return domain_id
            
        except Exception as e:
            logger.error(f"Failed to save domain {domain_id}: {e}")
            raise
    
    async def get_domain(self, domain_id: str) -> Optional[Dict[str, Any]]:
        """Get a domain from Firestore."""
        try:
            db = self._get_db()
            
            doc_ref = db.collection("domains").document(domain_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            else:
                logger.warning(f"Domain not found: {domain_id}")
                return None
                
        except Exception as e:
            logger.error(f"Failed to get domain {domain_id}: {e}")
            raise
    
    async def get_all_domains(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all domains from Firestore."""
        try:
            db = self._get_db()
            
            query = db.collection("domains").limit(limit)
            docs = query.stream()
            domains = [doc.to_dict() for doc in docs]
            
            return domains
            
        except Exception as e:
            logger.error(f"Failed to get all domains: {e}")
            return []
    
    async def save_multiple_domains(self, domains_data: Dict[str, Dict[str, Any]]) -> List[str]:
        """Save multiple domains to Firestore in batch."""
        try:
            db = self._get_db()
            
            # Use batch writes for better performance
            batch = db.batch()
            saved_ids = []
            
            for domain_id, domain_data in domains_data.items():
                domain_doc = {
                    "domain_id": domain_id,
                    "created_at": datetime.now(),
                    "updated_at": datetime.now(),
                    **domain_data
                }
                
                doc_ref = db.collection("domains").document(domain_id)
                batch.set(doc_ref, domain_doc)
                saved_ids.append(domain_id)
            
            # Commit the batch
            batch.commit()
            
            logger.info(f"Batch saved {len(saved_ids)} domains")
            return saved_ids
            
        except Exception as e:
            logger.error(f"Failed to save multiple domains: {e}")
            raise