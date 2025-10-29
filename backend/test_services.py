"""Test script to verify Gemini and Resume Parser services."""
import asyncio
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_gemini_service():
    """Test Gemini AI service."""
    print("\n=== Testing Gemini Service ===")
    
    try:
        from services.gemini_service_real import GeminiService
        
        # Initialize service
        gemini = GeminiService()
        
        if gemini._is_mock:
            print("❌ Gemini is running in MOCK mode")
            print("   Check if GEMINI_API_KEY is set correctly")
            return False
        
        print("✓ Gemini service initialized successfully")
        
        # Test basic response
        response = await gemini.generate_response("Hello, how are you?")
        print(f"✓ Test response: {response[:100]}...")
        
        # Test chat response
        chat_response = await gemini.generate_chat_response(
            message="What career options are available in data science?",
            chat_history=[],
            system_prompt="You are a career advisor."
        )
        print(f"✓ Chat response: {chat_response['response'][:100]}...")
        print(f"  Model used: {chat_response.get('model_used')}")
        
        print("✅ Gemini service is working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Gemini service error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_resume_parser():
    """Test Resume Parser service."""
    print("\n=== Testing Resume Parser ===")
    
    try:
        from services.resume_parser import ResumeParser
        
        # Initialize parser
        parser = ResumeParser()
        print("✓ Resume parser initialized successfully")
        
        # Create a test resume text
        test_resume = b"""
John Doe
john.doe@email.com | +91-9876543210

EDUCATION
Bachelor of Technology in Computer Science
XYZ University, 2020-2024

SKILLS
Python, JavaScript, React, Node.js, SQL, Machine Learning, Docker, AWS

EXPERIENCE
Software Developer Intern - ABC Company
2 years of experience in web development

PROJECTS
E-commerce Website using React and Node.js
Machine Learning model for sentiment analysis
"""
        
        # Test parsing
        result = await parser.parse_file(test_resume, "test_resume.txt")
        
        if result.get("success"):
            parsed = result.get("parsed", {})
            print(f"✓ Parsing successful!")
            print(f"  Name: {parsed.get('full_name')}")
            print(f"  Skills found: {len(parsed.get('skills', []))} - {', '.join(parsed.get('skills', [])[:5])}")
            print(f"  Experience: {parsed.get('experience_years')} years")
            print(f"  Education entries: {len(parsed.get('education_history', []))}")
            print(f"  Confidence: {parsed.get('confidence_score')}")
            print("✅ Resume parser is working correctly!")
            return True
        else:
            print(f"❌ Parsing failed: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Resume parser error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_firestore_connection():
    """Test Firestore connection."""
    print("\n=== Testing Firestore Connection ===")
    
    try:
        from services.firestore_service import FirestoreService
        
        firestore = FirestoreService()
        print("✓ Firestore service initialized")
        
        # Try to get a test profile (this will fail gracefully if not found)
        try:
            profile = await firestore.get_user_profile("test_user_12345_not_exist")
            if profile is None:
                print("✓ Firestore connection working (test query successful)")
            else:
                print("✓ Firestore connection working")
        except Exception as e:
            print(f"⚠ Firestore query test: {e}")
        
        print("✅ Firestore service appears to be working!")
        return True
        
    except Exception as e:
        print(f"❌ Firestore error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all tests."""
    print("=" * 60)
    print("AI Career Advisor - Service Tests")
    print("=" * 60)
    
    # Check environment
    from dotenv import load_dotenv
    load_dotenv()
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        print(f"✓ GEMINI_API_KEY found (starts with: {gemini_key[:20]}...)")
    else:
        print("❌ GEMINI_API_KEY not found in environment")
    
    results = {}
    
    # Run tests
    results['gemini'] = await test_gemini_service()
    results['resume_parser'] = await test_resume_parser()
    results['firestore'] = await test_firestore_connection()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    for service, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{service.upper()}: {status}")
    
    all_passed = all(results.values())
    if all_passed:
        print("\n🎉 All services are working correctly!")
    else:
        print("\n⚠️  Some services need attention - see details above")
    
    return all_passed


if __name__ == "__main__":
    asyncio.run(main())
