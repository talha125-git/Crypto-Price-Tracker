import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import pytest
pytest.skip("Skipping Atlas DB integration test", allow_module_level=True)

load_dotenv()

async def test_db():
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    print(f"Testing connection to: {mongo_url}")
    try:
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=10000)
        # The ping command is cheap and does not require auth.
        await client.admin.command('ping')
        print("Connected successfully to MongoDB Atlas!")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_db())
