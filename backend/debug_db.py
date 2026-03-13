import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def test_db():
    MONGO_URL = os.getenv("MONGO_URL")
    DB_NAME = os.getenv("DB_NAME")
    print(f"Connecting to {MONGO_URL}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    try:
        await client.admin.command('ping')
        print("Connected successfully!")
        
        users = await db.users.find().to_list(10)
        print(f"Users found: {len(users)}")
        for u in users:
            print(f"User: {u.get('email')}, ID: {u.get('_id')}")
            
        favs = await db.favorites.find().to_list(10)
        print(f"Favorites found: {len(favs)}")
        for f in favs:
            print(f"Fav: user={f.get('user_id')}, coin={f.get('coin_id')}")

    except Exception as e:
        print(f"Connection failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_db())
