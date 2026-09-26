"""Tests for sales endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_sale_unauthenticated():
    response = client.post("/api/sales/", json={
        "items": [{"product_id": 1, "quantity": 1, "unit_price": "2500.00"}],
        "amount_received": "3000.00",
    })
    assert response.status_code == 403


def test_get_sales_unauthenticated():
    response = client.get("/api/sales/")
    assert response.status_code == 403


def test_cancel_sale_unauthenticated():
    response = client.post("/api/sales/1/cancel")
    assert response.status_code == 403
