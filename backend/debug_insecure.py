import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def test_db():
    MONGO_URL = os.getenv("MONGO_URL")
    DB_NAME = os.getenv("DB_NAME")
    print(f"Connecting to {MONGO_URL} with tlsAllowInvalidCertificates=True...")
    
    client = AsyncIOMotorClient(
        MONGO_URL, 
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=5000
    )
    db = client[DB_NAME]
    try:
        await client.admin.command('ping')
        print("Connected successfully with tlsAllowInvalidCertificates!")
    except Exception as e:
        print(f"Connection failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_db())
