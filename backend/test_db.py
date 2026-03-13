import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import pytest
pytest.skip("Skipping DB integration test", allow_module_level=True)

async def test_db():
    try:
        client = AsyncIOMotorClient("mongodb://localhost:27017")
        # The ismaster command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("MongoDB is running")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_db())
