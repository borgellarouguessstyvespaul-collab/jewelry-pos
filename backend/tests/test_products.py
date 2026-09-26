"""Tests for product endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_products_unauthenticated():
    response = client.get("/api/products/")
    assert response.status_code == 403


def test_get_product_by_barcode_unauthenticated():
    response = client.get("/api/products/barcode/123456789")
    assert response.status_code == 403


def test_create_product_unauthenticated():
    response = client.post("/api/products/", json={
        "name": "Test Ring",
        "sku": "R001",
        "category_id": 1,
        "purchase_price": "1000.00",
        "selling_price": "2500.00",
    })
    assert response.status_code == 403
