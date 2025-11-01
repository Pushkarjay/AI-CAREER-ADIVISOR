"""Test script for Market Trends Service with Gemini integration."""

import asyncio
import os
import sys
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from services.market_trends_service import market_trends_service


async def test_general_market_trends():
    """Test fetching general market trends."""
    print("\n" + "="*80)
    print("Testing General Market Trends Generation")
    print("="*80 + "\n")
    
    try:
        trends = await market_trends_service.get_general_market_trends()
        
        print("✅ Successfully fetched market trends!")
        print(f"\nGenerated at: {trends.get('generated_at', 'N/A')}")
        
        # Display key metrics
        if 'skill_demand' in trends:
            print(f"\n📊 Skill Demand Insights: {len(trends['skill_demand'])} skills")
            for skill in trends['skill_demand'][:3]:
                print(f"  - {skill.get('skill', 'N/A')}: {skill.get('demand_change', 'N/A')} | {skill.get('avg_salary', 'N/A')}")
        
        if 'industry_growth' in trends:
            print(f"\n🏭 Industry Growth: {len(trends['industry_growth'])} industries")
            for industry in trends['industry_growth'][:3]:
                print(f"  - {industry.get('industry', 'N/A')}: {industry.get('growth_rate', 'N/A')} | {industry.get('job_openings', 'N/A')} jobs")
        
        if 'location_insights' in trends:
            print(f"\n📍 Location Insights: {len(trends['location_insights'])} cities")
            for location in trends['location_insights'][:3]:
                print(f"  - {location.get('city', 'N/A')}: {location.get('avg_salary', 'N/A')} | {location.get('job_count', 'N/A')} jobs")
        
        if 'emerging_roles' in trends:
            print(f"\n🚀 Emerging Roles: {len(trends['emerging_roles'])} roles")
            for role in trends['emerging_roles'][:3]:
                print(f"  - {role.get('role', 'N/A')}: {role.get('growth', 'N/A')} | {role.get('avg_salary', 'N/A')}")
        
        if 'insights' in trends:
            print(f"\n💡 Market Insights:")
            insights = trends['insights']
            if 'summary' in insights:
                print(f"  Summary: {insights['summary'][:100]}...")
            if 'opportunities' in insights:
                print(f"  Opportunities: {len(insights['opportunities'])} identified")
        
        # Save to file for inspection
        output_file = Path(__file__).parent / "test_output_general_trends.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(trends, f, indent=2, ensure_ascii=False)
        print(f"\n📝 Full output saved to: {output_file}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_career_specific_trends():
    """Test fetching career-specific market trends."""
    print("\n" + "="*80)
    print("Testing Career-Specific Market Trends Generation")
    print("="*80 + "\n")
    
    try:
        career_data = {
            "title": "Data Scientist",
            "industry": "technology",
            "required_skills": ["Python", "Machine Learning", "SQL", "Statistics"]
        }
        
        print(f"Generating trends for: {career_data['title']}")
        
        trends = await market_trends_service.get_career_specific_trends(
            career_title=career_data['title'],
            career_data=career_data
        )
        
        print("✅ Successfully fetched career-specific trends!")
        print(f"\nGenerated at: {trends.get('generated_at', 'N/A')}")
        
        # Display key metrics
        if 'career_overview' in trends:
            overview = trends['career_overview']
            print(f"\n📋 Career Overview:")
            print(f"  Title: {overview.get('title', 'N/A')}")
            print(f"  Demand Score: {overview.get('demand_score', 'N/A')}/10")
            print(f"  Growth Outlook: {overview.get('growth_outlook', 'N/A')}")
            if 'market_summary' in overview:
                print(f"  Summary: {overview['market_summary'][:150]}...")
        
        if 'salary_insights' in trends:
            salary = trends['salary_insights']
            print(f"\n💰 Salary Insights:")
            if 'entry_level' in salary:
                print(f"  Entry Level: {salary['entry_level'].get('avg', 'N/A')}")
            if 'mid_level' in salary:
                print(f"  Mid Level: {salary['mid_level'].get('avg', 'N/A')}")
            if 'senior_level' in salary:
                print(f"  Senior Level: {salary['senior_level'].get('avg', 'N/A')}")
        
        if 'demand_analysis' in trends:
            demand = trends['demand_analysis']
            print(f"\n📈 Demand Analysis:")
            print(f"  Job Openings: {demand.get('job_openings', 'N/A')}")
            print(f"  Hiring Velocity: {demand.get('hiring_velocity', 'N/A')}")
            print(f"  Competition: {demand.get('competition_level', 'N/A')}")
        
        if 'skills_in_demand' in trends:
            print(f"\n🎯 Skills in Demand: {len(trends['skills_in_demand'])} skills")
            for skill in trends['skills_in_demand'][:3]:
                print(f"  - {skill.get('skill', 'N/A')}: {skill.get('importance', 'N/A')} | {skill.get('demand_growth', 'N/A')}")
        
        # Save to file for inspection
        output_file = Path(__file__).parent / "test_output_career_trends.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(trends, f, indent=2, ensure_ascii=False)
        print(f"\n📝 Full output saved to: {output_file}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all tests."""
    print("\n🔬 Market Trends Service Test Suite")
    print("=" * 80)
    
    # Check for API key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("\n⚠️  WARNING: GEMINI_API_KEY not found in environment!")
        print("   The service will use fallback mock data.")
        print("   To test with real Gemini API, set GEMINI_API_KEY in your .env file.\n")
    else:
        print(f"\n✅ GEMINI_API_KEY found (starts with: {api_key[:20]}...)\n")
    
    # Run tests
    test1_passed = await test_general_market_trends()
    await asyncio.sleep(2)  # Small delay between tests
    
    test2_passed = await test_career_specific_trends()
    
    # Summary
    print("\n" + "="*80)
    print("Test Summary")
    print("="*80)
    print(f"General Market Trends: {'✅ PASSED' if test1_passed else '❌ FAILED'}")
    print(f"Career-Specific Trends: {'✅ PASSED' if test2_passed else '❌ FAILED'}")
    print("="*80 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
