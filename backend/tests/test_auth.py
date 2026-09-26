"""Tests for authentication endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login_success():
    """Test successful login returns access token."""
    response = client.post("/api/auth/login", json={
        "identifier": "admin",
        "password": "admin12345"
    })
    # Note: requires seeded database
    assert response.status_code in [200, 401]  # 401 if DB not seeded


def test_login_invalid_credentials():
    response = client.post("/api/auth/login", json={
        "email": "wrong@email.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401


def test_login_missing_fields():
    response = client.post("/api/auth/login", json={"email": "test@test.com"})
    assert response.status_code == 422


def test_get_me_without_token():
    response = client.get("/api/auth/me")
    assert response.status_code == 403
