#!/usr/bin/env python3
"""
Script to test if domains are properly stored and retrievable from the database.
"""

import asyncio
import logging
import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import initialize_connections
from services.firestore_service import FirestoreService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_domains():
    """Test if domains are properly stored and retrievable."""
    try:
        # Initialize database connections
        await initialize_connections()
        
        # Initialize Firestore service
        firestore_service = FirestoreService()
        
        # Check if service is healthy
        is_healthy = await firestore_service.health_check()
        if not is_healthy:
            logger.error("Firestore service is not healthy.")
            return False
        
        # Get all domains
        domains = await firestore_service.get_all_domains(limit=100)
        
        logger.info(f"Found {len(domains)} domains in database:")
        
        # Show sample domains
        for i, domain in enumerate(domains[:10]):
            logger.info(f"  {i+1}. {domain.get('title', 'Unknown')} ({domain.get('domain_id', 'no-id')})")
            logger.info(f"     Description: {domain.get('description', 'No description')[:100]}...")
            logger.info(f"     Difficulty: {domain.get('difficulty', 'Unknown')}")
            logger.info(f"     Learning Path Steps: {len(domain.get('learning_path', []))}")
            logger.info("")
        
        if len(domains) > 10:
            logger.info(f"... and {len(domains) - 10} more domains")
        
        return len(domains) > 0
        
    except Exception as e:
        logger.error(f"Failed to test domains: {e}")
        return False


async def main():
    """Main function."""
    logger.info("Testing domain retrieval from database...")
    
    success = await test_domains()
    
    if success:
        logger.info("✅ Domain retrieval test successful!")
        logger.info("The All Domains tab should now display all your seeded domains.")
    else:
        logger.error("❌ Domain retrieval test failed!")
        logger.error("Please check your database seeding and connection.")


if __name__ == "__main__":
    asyncio.run(main())