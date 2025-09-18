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
    
    print("🚀 Starting AI Career Advisor Backend Server...")
    print(f"📁 Working directory: {current_dir}")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[current_dir]
    )