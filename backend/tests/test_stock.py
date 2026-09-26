"""Tests for stock endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_stock_unauthenticated():
    response = client.get("/api/stock/")
    assert response.status_code == 403


def test_get_low_stock_unauthenticated():
    response = client.get("/api/stock/low")
    assert response.status_code == 403


def test_adjust_stock_unauthenticated():
    response = client.post("/api/stock/adjust", json={
        "product_id": 1,
        "quantity": 10,
        "movement_type": "ENTREE",
        "reason": "Test adjustment"
    })
    assert response.status_code == 403
