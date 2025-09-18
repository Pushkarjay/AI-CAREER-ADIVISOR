#!/usr/bin/env python3
"""
Server startup script for AI Career Advisor Backend
"""
import sys
import os

# Add current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import and run the application
if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment variable (Cloud Run uses PORT=8080)
    port = int(os.environ.get("PORT", 8000))
    
    print("🚀 Starting AI Career Advisor Backend Server...")
    print(f"📁 Working directory: {current_dir}")
    print(f"🌐 Port: {port}")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False  # Disable reload in production
    )