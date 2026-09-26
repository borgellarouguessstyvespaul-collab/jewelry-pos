"""
Reports API routes.
GET /api/reports/dashboard
GET /api/reports/sales
GET /api/reports/products
GET /api/reports/stock
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.core.database import get_db
from app.schemas.report import (DashboardStats, SalesReportResponse,
                                 TopProductsResponse, StockReportItem)
from app.services.report_service import ReportService
from app.dependencies.auth import require_role
from app.core.permissions import UserRole

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.GESTIONNAIRE])),
):
    service = ReportService(db)
    return service.get_dashboard_stats()


@router.get("/sales", response_model=SalesReportResponse)
def get_sales_report(
    period: str = Query("daily", enum=["daily", "weekly", "monthly"]),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.GESTIONNAIRE])),
):
    service = ReportService(db)
    return service.get_sales_report(period=period, start_date=start_date, end_date=end_date)


@router.get("/products", response_model=TopProductsResponse)
def get_products_report(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.GESTIONNAIRE])),
):
    service = ReportService(db)
    return service.get_top_products(limit=limit)


@router.get("/stock")
def get_stock_report(
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.GESTIONNAIRE])),
):
    service = ReportService(db)
    return service.get_stock_report()
