"""Tests for user management endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_users_unauthenticated():
    response = client.get("/api/users/")
    assert response.status_code == 403


def test_create_user_unauthenticated():
    response = client.post("/api/users/", json={
        "name": "Test User",
        "email": "test@test.com",
        "password": "password123",
        "role": "CAISSIER"
    })
    assert response.status_code == 403
