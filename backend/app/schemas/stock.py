"""Stock schemas — adjustment and movement response."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.stock_movement import MovementType


class StockAdjustment(BaseModel):
    product_id: int
    quantity: int           # positive = add, negative = remove
    movement_type: MovementType
    reason: Optional[str] = None


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    movement_type: MovementType
    quantity: int
    previous_quantity: int
    new_quantity: int
    reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class StockStatusResponse(BaseModel):
    product_id: int
    id: Optional[int] = None
    product_name: str
    name: Optional[str] = None
    description: Optional[str] = None
    sku: str
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    selling_price: Optional[float] = 0.0
    purchase_price: Optional[float] = 0.0
    current_stock: int
    stock_quantity: Optional[int] = None
    low_stock_threshold: int
    min_stock_alert: Optional[int] = None
    is_low_stock: bool
    status: Optional[str] = None
    status_label: Optional[str] = None

    class Config:
        from_attributes = True
