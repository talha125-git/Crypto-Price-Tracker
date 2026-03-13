# -------------------- Imports --------------------
import os
import requests
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import certifi

# Load environment variables from .env file
load_dotenv()

# -------------------- CORS Configuration --------------------
# Read allowed origins from environment variable, fallback to localhost for dev
FRONTEND_URL = os.getenv("FRONTEND_URL", "")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]

# Add production frontend URL if set
if FRONTEND_URL:
    origins.append(FRONTEND_URL)

# -------------------- MongoDB Setup --------------------
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "crypto_tracker")

client = AsyncIOMotorClient(
    MONGO_URL,
    serverSelectionTimeoutMS=5000,
    tls=True,
    tlsAllowInvalidCertificates=True
)
db = client[DB_NAME]

users_collection = db["users"]
favorites_collection = db["favorites"]
watchlist_collection = db["watchlist"]

# -------------------- App Lifespan --------------------
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await client.admin.command('ping')
        print("Connected to MongoDB!")
    except Exception as e:
        print(f"CRITICAL: Could not connect to MongoDB: {e}")
    yield
    client.close()

# -------------------- FastAPI App --------------------
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Password Hashing --------------------
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

# -------------------- Pydantic Models --------------------
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class FavoriteItem(BaseModel):
    user_id: str
    coin_id: str
    coin_data: dict

class WatchlistItem(BaseModel):
    user_id: str
    coin_id: str
    coin_data: dict

# -------------------- Authentication Routes --------------------
@app.post("/register")
async def register(user: UserRegister):
    try:
        existing_user = await users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed_password = hash_password(user.password)
        new_user = {
            "username": user.username,
            "email": user.email,
            "password": hashed_password
        }
        result = await users_collection.insert_one(new_user)
        return {"message": "User registered successfully", "id": str(result.inserted_id)}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /register: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "id": str(db_user["_id"]),
        "username": db_user["username"],
        "email": db_user["email"]
    }

# -------------------- Favorites Routes --------------------
@app.get("/favorites/{user_id}")
async def get_favorites(user_id: str):
    try:
        favorites = await favorites_collection.find({"user_id": user_id}).to_list(length=100)
        for fav in favorites:
            fav["_id"] = str(fav["_id"])
        return favorites
    except Exception as e:
        print(f"Database error in get_favorites for user {user_id}: {e}")
        return []

@app.post("/favorites")
async def add_favorite(item: FavoriteItem):
    try:
        await favorites_collection.update_one(
            {"user_id": item.user_id, "coin_id": item.coin_id},
            {"$set": {"coin_data": item.coin_data}},
            upsert=True
        )
        return {"message": "Favorite updated"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/favorites/{user_id}/{coin_id}")
async def remove_favorite(user_id: str, coin_id: str):
    try:
        await favorites_collection.delete_one({"user_id": user_id, "coin_id": coin_id})
        return {"message": "Favorite removed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# -------------------- Watchlist Routes --------------------
@app.get("/watchlist/{user_id}")
async def get_watchlist(user_id: str):
    try:
        watchlist = await watchlist_collection.find({"user_id": user_id}).to_list(length=100)
        for item in watchlist:
            item["_id"] = str(item["_id"])
        return watchlist
    except Exception as e:
        print(f"Database error in get_watchlist for user {user_id}: {e}")
        return []

@app.post("/watchlist")
async def add_watchlist(item: WatchlistItem):
    try:
        await watchlist_collection.update_one(
            {"user_id": item.user_id, "coin_id": item.coin_id},
            {"$set": {"coin_data": item.coin_data}},
            upsert=True
        )
        return {"message": "Watchlist updated"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/watchlist/{user_id}/{coin_id}")
async def remove_watchlist(user_id: str, coin_id: str):
    try:
        await watchlist_collection.delete_one({"user_id": user_id, "coin_id": coin_id})
        return {"message": "Watchlist removed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# -------------------- External API Routes --------------------
@app.get("/prices")
def get_prices():
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {"ids": "bitcoin,ethereum,binancecoin", "vs_currencies": "usd"}
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code != 200:
            return {"bitcoin": {"usd": 96000}, "ethereum": {"usd": 2600}, "binancecoin": {"usd": 600}}
        return response.json()
    except Exception:
        return {"bitcoin": {"usd": 96000}, "ethereum": {"usd": 2600}, "binancecoin": {"usd": 600}}

@app.get("/coins")
def get_coins():
    url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": 50,
        "page": 1,
        "sparkline": "false"
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"CoinGecko API Error: {response.status_code}, returning mock data.")
            return get_mock_coins()
        return response.json()
    except Exception as e:
        print(f"Request Error: {e}, returning mock data.")
        return get_mock_coins()

def get_mock_coins():
    return [
        {"id":"bitcoin","symbol":"btc","name":"Bitcoin","image":"https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png","current_price":96000,"market_cap":1800000000000,"market_cap_rank":1,"price_change_percentage_24h":2.5},
        {"id":"ethereum","symbol":"eth","name":"Ethereum","image":"https://coin-images.coingecko.com/coins/images/279/large/ethereum.png","current_price":2600,"market_cap":300000000000,"market_cap_rank":2,"price_change_percentage_24h":-1.2},
        {"id":"binancecoin","symbol":"bnb","name":"BNB","image":"https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png","current_price":600,"market_cap":80000000000,"market_cap_rank":4,"price_change_percentage_24h":0.5},
        {"id":"solana","symbol":"sol","name":"Solana","image":"https://coin-images.coingecko.com/coins/images/4128/large/solana.png","current_price":145,"market_cap":65000000000,"market_cap_rank":5,"price_change_percentage_24h":5.8},
        {"id":"ripple","symbol":"xrp","name":"XRP","image":"https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png","current_price":0.60,"market_cap":33000000000,"market_cap_rank":6,"price_change_percentage_24h":1.1},
        {"id":"dogecoin","symbol":"doge","name":"Dogecoin","image":"https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png","current_price":0.12,"market_cap":18000000000,"market_cap_rank":8,"price_change_percentage_24h":-3.4},
        {"id":"cardano","symbol":"ada","name":"Cardano","image":"https://coin-images.coingecko.com/coins/images/975/large/cardano.png","current_price":0.45,"market_cap":16000000000,"market_cap_rank":10,"price_change_percentage_24h":0.2},
        {"id":"tron","symbol":"trx","name":"TRON","image":"https://coin-images.coingecko.com/coins/images/1094/large/tron-logo.png","current_price":0.15,"market_cap":13000000000,"market_cap_rank":11,"price_change_percentage_24h":1.5},
        {"id":"avalanche-2","symbol":"avax","name":"Avalanche","image":"https://coin-images.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png","current_price":28.50,"market_cap":11000000000,"market_cap_rank":12,"price_change_percentage_24h":4.1},
        {"id":"shiba-inu","symbol":"shib","name":"Shiba Inu","image":"https://coin-images.coingecko.com/coins/images/11939/large/shiba.png","current_price":0.000017,"market_cap":10000000000,"market_cap_rank":13,"price_change_percentage_24h":-1.5},
        {"id":"polkadot","symbol":"dot","name":"Polkadot","image":"https://coin-images.coingecko.com/coins/images/12171/large/polkadot.png","current_price":4.20,"market_cap":6000000000,"market_cap_rank":15,"price_change_percentage_24h":-2.1},
        {"id":"chainlink","symbol":"link","name":"Chainlink","image":"https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png","current_price":11.50,"market_cap":7000000000,"market_cap_rank":16,"price_change_percentage_24h":2.8},
        {"id":"bitcoin-cash","symbol":"bch","name":"Bitcoin Cash","image":"https://coin-images.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png","current_price":350,"market_cap":6900000000,"market_cap_rank":17,"price_change_percentage_24h":0.9},
        {"id":"near","symbol":"near","name":"NEAR Protocol","image":"https://coin-images.coingecko.com/coins/images/10365/large/near.png","current_price":4.80,"market_cap":5500000000,"market_cap_rank":18,"price_change_percentage_24h":3.3},
        {"id":"polygon","symbol":"matic","name":"Polygon","image":"https://coin-images.coingecko.com/coins/images/4713/large/matic-token-icon.png","current_price":0.40,"market_cap":4000000000,"market_cap_rank":21,"price_change_percentage_24h":-0.5}
    ]