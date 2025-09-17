import os
import sys
from fastapi.testclient import TestClient

# Ensure the backend directory is on sys.path so we can import main.py
CURRENT_DIR = os.path.dirname(__file__)
BACKEND_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, os.pardir))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from main import app  # type: ignore


client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") == "healthy"


def test_chat_test_endpoint():
    r = client.post("/api/v1/chat/test", json={"message": "Hello"})
    assert r.status_code == 200
    data = r.json()
    assert "message" in data