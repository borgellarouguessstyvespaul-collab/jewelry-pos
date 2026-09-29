"""Sale schemas — create request, line items, and response."""

from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from app.models.sale import PaymentMethod, SaleStatus


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: Decimal


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    cost_price: Optional[Decimal] = Decimal("0.00")
    purchase_price: Optional[Decimal] = Decimal("0.00")
    product_name: Optional[str] = None

    class Config:
        from_attributes = True


class SaleCreate(BaseModel):
    items: List[SaleItemCreate]
    customer_id: Optional[int] = None
    discount: Decimal = Decimal("0.00")
    amount_received: Decimal
    payment_method: PaymentMethod = PaymentMethod.CASH
    notes: Optional[str] = None


class SaleResponse(BaseModel):
    id: int
    sale_number: str
    user_id: int
    customer_id: Optional[int]
    subtotal: Decimal
    discount: Decimal
    total: Decimal
    amount_received: Decimal
    change_amount: Decimal
    payment_method: PaymentMethod
    status: SaleStatus
    notes: Optional[str]
    sale_items: List[SaleItemResponse]
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentRequest(BaseModel):
    """Used for validating payment before completing sale."""
    total: Decimal
    amount_received: Decimal
    payment_method: PaymentMethod = PaymentMethod.CASH
