import asyncio
import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def test_db():
    MONGO_URL = os.getenv("MONGO_URL")
    DB_NAME = os.getenv("DB_NAME")
    print(f"Connecting to {MONGO_URL} with certifi...")
    
    # Try with certifi
    client = AsyncIOMotorClient(
        MONGO_URL, 
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000
    )
    db = client[DB_NAME]
    try:
        await client.admin.command('ping')
        print("Connected successfully with certifi!")
    except Exception as e:
        print(f"Connection failed with certifi: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_db())
