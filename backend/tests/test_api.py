from fastapi.testclient import TestClient  # Import TestClient to test FastAPI endpoints
from main import app                       # Import the FastAPI app

client = TestClient(app)                  # Create a test client using the app


def test_prices():
    # Test the /prices endpoint
    res = client.get("/prices")            # Send GET request to /prices
    assert res.status_code == 200           # Check that response status is OK (200)
    assert "bitcoin" in res.json()          # Verify 'bitcoin' key exists in response JSON


def test_coins():
    # Test the /coins endpoint
    res = client.get("/coins")              # Send GET request to /coins
    assert res.status_code == 200           # Check that response status is OK (200)
    assert isinstance(res.json(), list)     # Ensure response data is a list
