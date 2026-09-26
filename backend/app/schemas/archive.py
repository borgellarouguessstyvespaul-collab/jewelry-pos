"""Monthly Archive Schemas."""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from decimal import Decimal
from datetime import datetime


class CategoryBreakdownItemSchema(BaseModel):
    name: str
    value: float


class MonthlyArchiveResponse(BaseModel):
    id: int
    year: int
    month: int
    month_name: str
    total_sales: Decimal
    total_profit: Decimal
    total_paid: Decimal
    transaction_count: int
    products_sold: int
    category_breakdown_json: Optional[str] = "{}"
    category_breakdown: List[CategoryBreakdownItemSchema] = []
    archived_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArchiveGenerateRequest(BaseModel):
    year: Optional[int] = None
    month: Optional[int] = None
