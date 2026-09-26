"""Product schemas — create, update, and response."""

from pydantic import BaseModel, model_validator
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.schemas.category import CategoryResponse


class ProductCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    barcode: Optional[str] = None
    description: Optional[str] = None
    category_id: int
    purchase_price: Optional[Decimal] = Decimal('0.0')
    cost_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    price: Optional[Decimal] = None
    stock_quantity: int = 0
    low_stock_threshold: int = 5
    min_stock_alert: Optional[int] = None
    image_url: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def reconcile_fields(cls, data):
        if isinstance(data, dict):
            # Resolve price -> selling_price
            if data.get('selling_price') is None and data.get('price') is not None:
                data['selling_price'] = data['price']
            elif data.get('price') is None and data.get('selling_price') is not None:
                data['price'] = data['selling_price']
            if data.get('selling_price') is None:
                data['selling_price'] = Decimal('0.0')

            # Resolve cost_price -> purchase_price
            if data.get('purchase_price') is None and data.get('cost_price') is not None:
                data['purchase_price'] = data['cost_price']
            elif data.get('cost_price') is None and data.get('purchase_price') is not None:
                data['cost_price'] = data['purchase_price']
            if data.get('purchase_price') is None:
                data['purchase_price'] = Decimal('0.0')

            # Resolve min_stock_alert -> low_stock_threshold
            if data.get('min_stock_alert') is not None and data.get('low_stock_threshold') is None:
                data['low_stock_threshold'] = data['min_stock_alert']
        return data


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    purchase_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    price: Optional[Decimal] = None
    stock_quantity: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    min_stock_alert: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

    @model_validator(mode='before')
    @classmethod
    def reconcile_fields(cls, data):
        if isinstance(data, dict):
            if data.get('selling_price') is None and data.get('price') is not None:
                data['selling_price'] = data['price']
            if data.get('purchase_price') is None and data.get('cost_price') is not None:
                data['purchase_price'] = data['cost_price']
            if data.get('min_stock_alert') is not None and data.get('low_stock_threshold') is None:
                data['low_stock_threshold'] = data['min_stock_alert']
        return data


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    barcode: Optional[str] = None
    description: Optional[str] = None
    category_id: int
    category: Optional[CategoryResponse] = None
    purchase_price: Decimal
    selling_price: Decimal
    price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    stock_quantity: int
    low_stock_threshold: int
    min_stock_alert: Optional[int] = None
    is_low_stock: bool
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
