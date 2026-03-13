import pytest                                   # Import pytest for testing
from httpx import AsyncClient, ASGITransport    # Import async HTTP client and ASGI transport


@pytest.mark.asyncio
async def test_add_watchlist(test_app):
    # Test adding a coin to the user's watchlist

    transport = ASGITransport(app=test_app)     # Create ASGI transport using the test app

    async with AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as ac:
        # Send POST request to add a coin to the watchlist
        res = await ac.post("/watchlist", json={
            "user_id": "1",                     # User ID
            "coin_id": "eth",                    # Coin identifier (Ethereum)
            "coin_data": {"price": 2000}         # Coin data (price)
        })

    assert res.status_code == 200                # Expect successful response


@pytest.mark.asyncio
async def test_get_watchlist(test_app):
    # Test retrieving user's watchlist

    transport = ASGITransport(app=test_app)     # Create ASGI transport using the test app

    async with AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as ac:
        # Send GET request to fetch watchlist for user ID 1
        res = await ac.get("/watchlist/1")

    assert res.status_code == 200                # Expect successful response
    assert isinstance(res.json(), list)          # Response should be a list of coins
