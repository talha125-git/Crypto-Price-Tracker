import pytest                                         # Import pytest for testing
from fastapi.testclient import TestClient             # Import TestClient for FastAPI testing
from fastapi import HTTPException                     # Import HTTPException for error handling
from unittest.mock import MagicMock, patch, AsyncMock # Import mocking utilities
import main                                          # Import main module
from main import app, verify_password, get_mock_coins, lifespan  # Import required functions and app


def test_lifespan_success():
    # Test successful application lifespan startup
    with patch("main.client") as mock_client:
        mock_client.admin.command = AsyncMock(return_value={"ok": 1.0})  # Mock successful DB ping

        import asyncio
        async def run_lifespan():
            async with lifespan(None):               # Run lifespan context
                pass

        asyncio.run(run_lifespan())                  # Execute async lifespan
        mock_client.admin.command.assert_called_once_with('ping')  # Ensure ping was called
        mock_client.close.assert_called_once()       # Ensure client was closed


def test_lifespan_failure():
    # Test lifespan when database connection fails
    with patch("main.client") as mock_client:
        mock_client.admin.command = AsyncMock(side_effect=Exception("Connection error"))  # Mock failure

        import asyncio
        async def run_lifespan():
            async with lifespan(None):               # Run lifespan context
                pass

        asyncio.run(run_lifespan())                  # Execute async lifespan
        mock_client.admin.command.assert_called_once_with('ping')  # Ping attempted
        mock_client.close.assert_called_once()       # Client closed even on failure


def test_verify_password_exception():
    # Test password verification failure due to exception
    with patch("bcrypt.checkpw") as mock_check:
        mock_check.side_effect = Exception("Bcrypt error")  # Force bcrypt error
        assert verify_password("pass", "hash") is False     # Should safely return False


def test_register_exception(test_setup):
    # Test register endpoint when database fails
    with TestClient(test_setup["app"]) as client:
        test_setup["users"].should_fail = True       # Force DB failure
        response = client.post("/register", json={
            "username": "test",
            "email": "test@example.com",
            "password": "test"
        })
        assert response.status_code == 500            # Expect server error


def test_get_favorites_with_data(test_setup):
    # Test getting favorites when data exists
    test_setup["favorites"].data.append({
        "user_id": "user123",
        "coin_id": "btc",
        "_id": "someid"
    })

    with TestClient(test_setup["app"]) as client:
        response = client.get("/favorites/user123")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["_id"] == "someid"


def test_get_favorites_exception(test_setup):
    # Test favorites retrieval when DB fails
    with TestClient(test_setup["app"]) as client:
        test_setup["favorites"].should_fail = True
        response = client.get("/favorites/user123")
        assert response.status_code == 500


def test_get_favorites_http_exception(test_setup):
    # Test favorites retrieval with HTTPException
    with TestClient(test_setup["app"]) as client:
        with patch.object(
            test_setup["favorites"],
            "find",
            side_effect=HTTPException(status_code=404)
        ):
            response = client.get("/favorites/user123")
            assert response.status_code == 404


def test_add_favorite_exception(test_setup):
    # Test adding favorite when DB fails
    with TestClient(test_setup["app"]) as client:
        test_setup["favorites"].should_fail = True
        response = client.post("/favorites", json={
            "user_id": "user123",
            "coin_id": "bitcoin",
            "coin_data": {}
        })
        assert response.status_code == 500


def test_add_favorite_http_exception(test_setup):
    # Test adding favorite with HTTPException
    with TestClient(test_setup["app"]) as client:
        with patch.object(
            test_setup["favorites"],
            "update_one",
            side_effect=HTTPException(status_code=400)
        ):
            response = client.post("/favorites", json={
                "user_id": "user123",
                "coin_id": "bitcoin",
                "coin_data": {}
            })
            assert response.status_code == 400


def test_remove_favorite_success(test_setup):
    # Test successful favorite removal
    with TestClient(test_setup["app"]) as client:
        response = client.delete("/favorites/user123/bitcoin")
        assert response.status_code == 200
        assert response.json()["message"] == "Favorite removed"


def test_remove_favorite_exception(test_setup):
    # Test favorite removal when DB fails
    with TestClient(test_setup["app"]) as client:
        test_setup["favorites"].should_fail = True
        response = client.delete("/favorites/user123/bitcoin")
        assert response.status_code == 500


def test_remove_favorite_http_exception(test_setup):
    # Test favorite removal with HTTPException
    with TestClient(test_setup["app"]) as client:
        with patch.object(
            test_setup["favorites"],
            "delete_one",
            side_effect=HTTPException(status_code=400)
        ):
            response = client.delete("/favorites/user123/bitcoin")
            assert response.status_code == 400


def test_get_watchlist_with_data(test_setup):
    # Test getting watchlist when data exists
    test_setup["watchlist"].data.append({
        "user_id": "user123",
        "coin_id": "btc",
        "_id": "someid"
    })

    with TestClient(test_setup["app"]) as client:
        response = client.get("/watchlist/user123")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["_id"] == "someid"


def test_get_watchlist_exception(test_setup):
    # Test watchlist retrieval when DB fails
    with TestClient(test_setup["app"]) as client:
        test_setup["watchlist"].should_fail = True
        response = client.get("/watchlist/user123")
        assert response.status_code == 500


def test_get_watchlist_http_exception(test_setup):
    # Test watchlist retrieval with HTTPException
    with TestClient(test_setup["app"]) as client:
        with patch.object(
            test_setup["watchlist"],
            "find",
            side_effect=HTTPException(status_code=404)
        ):
            response = client.get("/watchlist/user123")
            assert response.status_code == 404


def test_add_watchlist_exception(test_setup):
    # Test adding watchlist when DB fails
    with TestClient(test_setup["app"]) as client:
        test_setup["watchlist"].should_fail = True
        response = client.post("/watchlist", json={
            "user_id": "user123",
            "coin_id": "bitcoin",
            "coin_data": {}
        })
        assert response.status_code == 500


def test_add_watchlist_http_exception(test_setup):
    # Test adding watchlist with HTTPException
    with TestClient(test_setup["app"]) as client:
        with patch.object(
            test_setup["watchlist"],
            "update_one",
            side_effect=HTTPException(status_code=400)
        ):
            response = client.post("/watchlist", json={
                "user_id": "user123",
                "coin_id": "bitcoin",
                "coin_data": {}
            })
            assert response.status_code == 400


def test_remove_watchlist_success(test_setup):
    # Test successful watchlist removal
    with TestClient(test_setup["app"]) as client:
        response = client.delete("/watchlist/user123/bitcoin")
        assert response.status_code == 200
        assert response.json()["message"] == "Watchlist removed"


def test_remove_watchlist_exception(test_setup):
    # Test watchlist removal when DB fails
    with TestClient(test_setup["app"]) as client:
        test_setup["watchlist"].should_fail = True
        response = client.delete("/watchlist/user123/bitcoin")
        assert response.status_code == 500


def test_remove_watchlist_http_exception(test_setup):
    # Test watchlist removal with HTTPException
    with TestClient(test_setup["app"]) as client:
        with patch.object(
            test_setup["watchlist"],
            "delete_one",
            side_effect=HTTPException(status_code=400)
        ):
            response = client.delete("/watchlist/user123/bitcoin")
            assert response.status_code == 400


def test_prices_failure():
    # Test prices endpoint when external API fails
    with TestClient(app) as client:
        with patch("requests.get") as mock_get:
            mock_get.return_value.status_code = 500
            response = client.get("/prices")
            assert response.status_code == 200
            assert response.json()["bitcoin"]["usd"] == 96000


def test_prices_exception():
    # Test prices endpoint when exception occurs
    with TestClient(app) as client:
        with patch("requests.get") as mock_get:
            mock_get.side_effect = Exception("Network error")
            response = client.get("/prices")
            assert response.status_code == 200
            assert response.json()["bitcoin"]["usd"] == 96000


def test_coins_failure():
    # Test coins endpoint when external API fails
    with TestClient(app) as client:
        with patch("requests.get") as mock_get:
            mock_get.return_value.status_code = 500
            response = client.get("/coins")
            assert response.status_code == 200
            assert response.json()[0]["id"] == "bitcoin"


def test_coins_exception():
    # Test coins endpoint when exception occurs
    with TestClient(app) as client:
        with patch("requests.get") as mock_get:
            mock_get.side_effect = Exception("Network error")
            response = client.get("/coins")
            assert response.status_code == 200
            assert response.json()[0]["id"] == "bitcoin"


def test_get_mock_coins():
    # Test mock coins function
    coins = get_mock_coins()
    assert len(coins) > 0
    assert coins[0]["id"] == "bitcoin"


def test_register_existing_user(test_setup):
    # Test registering an already existing user
    with TestClient(test_setup["app"]) as client:
        test_setup["users"].data.append({
            "email": "test@example.com",
            "username": "test"
        })

        response = client.post("/register", json={
            "username": "test2",
            "email": "test@example.com",
            "password": "test"
        })

        assert response.status_code == 400
        assert response.json()["detail"] == "Email already registered"
