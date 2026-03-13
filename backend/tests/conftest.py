import pytest                     # Import pytest for writing and running tests
from main import app              # Import the FastAPI app from main.py


class FakeCollection:
    # This class mocks a MongoDB collection for testing

    def __init__(self):
        self.data = []            # Stores fake documents
        self.should_fail = False  # Flag to simulate database failure

    async def find_one(self, query):
        # Simulates MongoDB find_one operation
        if self.should_fail:      # If failure flag is set
            raise Exception("Database error")  # Simulate DB error
        for d in self.data:       # Loop through stored documents
            if all(d.get(k) == v for k, v in query.items()):
                return d          # Return matching document
        return None               # Return None if no match found

    async def insert_one(self, doc):
        # Simulates MongoDB insert_one operation
        if self.should_fail:      # Check if DB should fail
            raise Exception("Database error")
        doc["_id"] = "123"        # Assign fake MongoDB ID
        self.data.append(doc)     # Add document to fake data list

        class Result:
            inserted_id = "123"   # Mimic MongoDB insert result

        return Result()           # Return fake insert result

    async def update_one(self, query, update, upsert=False):
        # Simulates MongoDB update_one operation
        if self.should_fail:      # Check for simulated failure
            raise Exception("Database error")
        # Add updated document to fake data
        self.data.append({**query, **update["$set"]})

    async def delete_one(self, query):
        # Simulates MongoDB delete_one operation
        if self.should_fail:      # Check for simulated failure
            raise Exception("Database error")
        self.data = []            # Clear all data (simulate delete)

    def find(self, query):
        # Simulates MongoDB find operation
        if self.should_fail:      # Check for simulated failure
            raise Exception("Database error")

        # Filter data matching the query
        data = [d for d in self.data if all(d.get(k) == v for k, v in query.items())]

        class Cursor:
            # Fake cursor class to mimic MongoDB cursor
            def __init__(self, data):
                self.data = data  # Store filtered data

            async def to_list(self, length):
                return self.data # Return data as a list

        return Cursor(data)       # Return fake cursor object


@pytest.fixture
def test_setup(monkeypatch):
    # Pytest fixture to set up fake database collections

    users = FakeCollection()      # Fake users collection
    favorites = FakeCollection()  # Fake favorites collection
    watchlist = FakeCollection()  # Fake watchlist collection

    # Replace real DB collections with fake ones
    monkeypatch.setattr("main.users_collection", users)
    monkeypatch.setattr("main.favorites_collection", favorites)
    monkeypatch.setattr("main.watchlist_collection", watchlist)

    # Return test environment data
    return {
        "app": app,               # FastAPI app instance
        "users": users,           # Fake users collection
        "favorites": favorites,   # Fake favorites collection
        "watchlist": watchlist    # Fake watchlist collection
    }


@pytest.fixture
def test_app(test_setup):
    # Fixture that returns only the app instance
    return test_setup["app"]
