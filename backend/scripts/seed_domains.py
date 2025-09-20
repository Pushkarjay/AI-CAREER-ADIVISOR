#!/usr/bin/env python3
"""
Script to seed all domains data to Firestore database.
This script loads the complete domains dataset and stores it in Firestore
for persistent access by the application.
"""

import asyncio
import logging
import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import initialize_connections
from services.firestore_service import FirestoreService
from data.domains_roadmap import DOMAINS_ROADMAP

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed_domains():
    """Seed all domains data to Firestore."""
    try:
        # Initialize database connections
        await initialize_connections()
        
        # Initialize Firestore service
        firestore_service = FirestoreService()
        
        # Check if service is healthy
        is_healthy = await firestore_service.health_check()
        if not is_healthy:
            logger.error("Firestore service is not healthy. Cannot proceed with seeding.")
            return False
        
        logger.info(f"Starting to seed {len(DOMAINS_ROADMAP)} domains to Firestore...")
        
        # Save all domains using batch write
        saved_ids = await firestore_service.save_multiple_domains(DOMAINS_ROADMAP)
        
        logger.info(f"Successfully seeded {len(saved_ids)} domains to Firestore")
        
        # Verify by reading back a few domains
        logger.info("Verifying seeded data...")
        all_domains = await firestore_service.get_all_domains(limit=5)
        logger.info(f"Verification: Found {len(all_domains)} domains in database")
        
        for domain in all_domains[:3]:
            logger.info(f"  - {domain.get('title', 'Unknown')} ({domain.get('domain_id', 'no-id')})")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to seed domains: {e}")
        return False


async def main():
    """Main function."""
    logger.info("Domain seeding script started")
    
    success = await seed_domains()
    
    if success:
        logger.info("Domain seeding completed successfully!")
        sys.exit(0)
    else:
        logger.error("Domain seeding failed!")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())