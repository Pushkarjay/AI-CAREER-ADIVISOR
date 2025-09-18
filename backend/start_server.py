#!/usr/bin/env python3
"""
Server startup script for AI Career Advisor Backend
"""
import sys
import os
import logging

# Add current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Configure logging early
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Import and run the application
if __name__ == "__main__":
    try:
        import uvicorn
        
        # Get port from environment variable (Cloud Run uses PORT=8080)
        port = int(os.environ.get("PORT", 8000))
        
        logger.info("🚀 Starting AI Career Advisor Backend Server...")
        logger.info(f"📁 Working directory: {current_dir}")
        logger.info(f"🌐 Port: {port}")
        logger.info(f"🐛 Debug mode: {os.environ.get('DEBUG', 'false')}")
        logger.info(f"📊 Log level: {os.environ.get('LOG_LEVEL', 'INFO')}")
        
        # Check for Firebase project ID
        firebase_project = os.environ.get('FIREBASE_PROJECT_ID') or os.environ.get('GOOGLE_CLOUD_PROJECT')
        if firebase_project:
            logger.info(f"🔥 Firebase Project: {firebase_project}")
        else:
            logger.warning("⚠️  No Firebase project ID found in environment")
        
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=port,
            reload=False  # Disable reload in production
        )
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        raise