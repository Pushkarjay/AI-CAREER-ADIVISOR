"""Quick script to check seeded careers."""
import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import initialize_connections, get_firestore_db

async def check_careers():
    await initialize_connections()
    db = get_firestore_db()
    
    careers = list(db.collection('careers').stream())
    print(f'✅ Found {len(careers)} careers in Firestore:\n')
    
    for doc in careers:
        data = doc.to_dict()
        print(f"  📌 {doc.id}: {data.get('title')}")
        print(f"     Industry: {data.get('industry')}")
        print(f"     Avg Salary: ₹{data.get('avgSalary', 0) / 100000:.1f}L")
        print()

if __name__ == "__main__":
    asyncio.run(check_careers())
