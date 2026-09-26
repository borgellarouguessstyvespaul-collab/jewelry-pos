"""Report schemas — dashboard stats and report responses."""

from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from decimal import Decimal
from datetime import date


class MonthlyTrendItem(BaseModel):
    month: str
    sales: float


class CategoryBreakdownItem(BaseModel):
    name: str
    value: float


class DashboardStats(BaseModel):
    total_sales_today: Decimal = Decimal('0.0')
    today_sales_total: Decimal = Decimal('0.0')
    total_sales_month: Decimal = Decimal('0.0')
    total_transactions_today: int = 0
    today_sales_count: int = 0
    total_paid_today: Decimal = Decimal('0.0')
    profits_today: Decimal = Decimal('0.0')
    total_products: int = 0
    low_stock_count: int = 0
    total_customers: int = 0
    monthly_trend: List[MonthlyTrendItem] = []
    category_breakdown: List[CategoryBreakdownItem] = []


class SalesReportItem(BaseModel):
    period: str
    day_name: Optional[str] = None
    total_sales: Decimal
    quantity_sold: int = 0
    transaction_count: int
    avg_transaction: Decimal


class TopProductItem(BaseModel):
    product_id: int
    product_name: str
    sku: str
    total_quantity_sold: int
    total_revenue: Decimal


class SalesReportResponse(BaseModel):
    items: List[SalesReportItem]
    total: Decimal
    count: int
    total_quantity: int = 0


class TopProductsResponse(BaseModel):
    items: List[TopProductItem]


class StockReportItem(BaseModel):
    product_id: int
    product_name: str
    sku: str
    current_stock: int
    low_stock_threshold: int
    is_low_stock: bool
    purchase_price: Decimal
    stock_value: Decimal
