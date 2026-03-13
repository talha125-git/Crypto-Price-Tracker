import pytest                                   # Import pytest for testing
from httpx import AsyncClient, ASGITransport    # Import async HTTP client and ASGI transport


@pytest.mark.asyncio
async def test_register(test_app):
    # Test the user registration endpoint

    transport = ASGITransport(app=test_app)     # Create ASGI transport using test app

    async with AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as ac:
        # Send POST request to /register endpoint
        res = await ac.post("/register", json={
            "username": "rowaid",                # Test username
            "email": "rowaid@test.com",          # Test email
            "password": "123456"                # Test password
        })

    assert res.status_code == 200                # Expect successful registration


@pytest.mark.asyncio
async def test_login(test_app):
    # Test the user login endpoint (successful login)

    transport = ASGITransport(app=test_app)     # Create ASGI transport using test app

    async with AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as ac:
        # First register the user
        await ac.post("/register", json={
            "username": "talha",
            "email": "talha@test.com",
            "password": "123456"
        })

        # Then attempt login with correct credentials
        res = await ac.post("/login", json={
            "email": "talha@test.com",
            "password": "123456"
        })

    assert res.status_code == 200                # Expect successful login


@pytest.mark.asyncio
async def test_login_fail(test_app):
    # Test login failure with incorrect credentials

    transport = ASGITransport(app=test_app)     # Create ASGI transport using test app

    async with AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as ac:
        # Attempt login with wrong email and password
        res = await ac.post("/login", json={
            "email": "x@test.com",               # Invalid email
            "password": "wrong"                  # Invalid password
        })

    assert res.status_code == 401                # Expect unauthorized response
