import pytest                                   # Import pytest for testing
from httpx import AsyncClient, ASGITransport    # Import async HTTP client and ASGI transport


@pytest.mark.asyncio
async def test_add_favorite(test_app):
    # Test adding a coin to user's favorites

    transport = ASGITransport(app=test_app)     # Create ASGI transport using test app

    async with AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as ac:
        # Send POST request to add favorite coin
        res = await ac.post("/favorites", json={
            "user_id": "1",                     # User ID
            "coin_id": "bitcoin",               # Coin identifier
            "coin_data": {"price": 100}         # Coin data (price info)
        })

    assert res.status_code == 200                # Expect successful response


@pytest.mark.asyncio
async def test_get_favorites(test_app):
    # Test retrieving user's favorite coins

    transport = ASGITransport(app=test_app)     # Create ASGI transport using test app

    async with AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as ac:
        # Send GET request to fetch favorites for user with ID 1
        res = await ac.get("/favorites/1")

    assert res.status_code == 200                # Expect successful response
    assert isinstance(res.json(), list)          # Response should be a list
