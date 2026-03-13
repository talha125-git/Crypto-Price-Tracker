import requests
import time

try:
    print("Sending POST request to /register...")
    start_time = time.time()
    response = requests.post(
        "http://localhost:8000/register",
        json={
            "username": "testuser3",
            "email": "test3@example.com",
            "password": "testpassword"
        },
        timeout=5
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    print(f"Time taken: {time.time() - start_time:.2f}s")
except Exception as e:
    print(f"Error: {e}")
