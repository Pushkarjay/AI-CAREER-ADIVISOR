"""
Migration script to add new resume-related fields to existing user profiles.

This script adds:
- certifications: List[CertificationItem]
- projects: List[ProjectItem]
- internships: List[InternshipItem]
- languages: List[str]
- data_sources: Dict[str, str]

Existing fields are preserved.
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, Any

# Setup path for imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.firestore_service import FirestoreService
from core.database import get_firestore_db

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def migrate_profile(firestore_service: FirestoreService, user_id: str, profile_data: Dict[str, Any]) -> bool:
    """Migrate a single profile to include new fields."""
    try:
        updates = {}
        modified = False
        
        # Add certifications field if not present
        if 'certifications' not in profile_data:
            updates['certifications'] = []
            modified = True
        
        # Add projects field if not present
        if 'projects' not in profile_data:
            updates['projects'] = []
            modified = True
        
        # Add languages field if not present
        if 'languages' not in profile_data:
            updates['languages'] = []
            modified = True
        
        # Add internships field if not present
        if 'internships' not in profile_data:
            updates['internships'] = []
            modified = True
        
        # Add data_sources field if not present
        if 'data_sources' not in profile_data:
            updates['data_sources'] = {}
            modified = True
        
        # Only update if there are changes
        if modified:
            updates['updated_at'] = datetime.now()
            await firestore_service.update_user_profile(user_id, updates)
            logger.info(f"✓ Migrated profile for user: {user_id}")
            return True
        else:
            logger.info(f"○ Profile already migrated for user: {user_id}")
            return False
            
    except Exception as e:
        logger.error(f"✗ Failed to migrate profile for user {user_id}: {e}")
        return False


async def run_migration():
    """Run the migration for all profiles."""
    logger.info("=" * 60)
    logger.info("Starting profile migration: Adding resume fields")
    logger.info("=" * 60)
    
    try:
        firestore_service = FirestoreService()
        db = get_firestore_db()
        
        # Get all profiles
        profiles_ref = db.collection("profiles")
        profiles = profiles_ref.stream()
        
        total_count = 0
        migrated_count = 0
        skipped_count = 0
        error_count = 0
        
        for profile_doc in profiles:
            total_count += 1
            user_id = profile_doc.id
            profile_data = profile_doc.to_dict()
            
            logger.info(f"\nProcessing profile {total_count}: {user_id}")
            
            result = await migrate_profile(firestore_service, user_id, profile_data)
            
            if result:
                migrated_count += 1
            elif result is False:
                error_count += 1
            else:
                skipped_count += 1
        
        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("Migration Summary")
        logger.info("=" * 60)
        logger.info(f"Total profiles processed: {total_count}")
        logger.info(f"Profiles migrated: {migrated_count}")
        logger.info(f"Already migrated (skipped): {total_count - migrated_count - error_count}")
        logger.info(f"Errors: {error_count}")
        logger.info("=" * 60)
        
        if error_count == 0:
            logger.info("✓ Migration completed successfully!")
        else:
            logger.warning(f"⚠ Migration completed with {error_count} errors")
        
    except Exception as e:
        logger.error(f"✗ Migration failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(run_migration())
