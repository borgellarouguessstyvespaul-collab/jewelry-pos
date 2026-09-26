"""
Stock API routes.
GET  /api/stock
GET  /api/stock/low
POST /api/stock/adjust
GET  /api/stock/movements
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.schemas.stock import StockAdjustment, StockMovementResponse, StockStatusResponse
from app.services.stock_service import StockService
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User
from app.core.permissions import UserRole

router = APIRouter()


@router.get("/", response_model=List[StockStatusResponse])
def get_stock(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = StockService(db)
    return service.get_stock_status(search=search, category_id=category_id)


@router.get("/low", response_model=List[StockStatusResponse])
def get_low_stock(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = StockService(db)
    return service.get_low_stock()


@router.post("/adjust", response_model=StockMovementResponse)
def adjust_stock(
    data: StockAdjustment,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.GESTIONNAIRE])),
):
    service = StockService(db)
    return service.adjust_stock(data, current_user)


@router.get("/movements", response_model=List[StockMovementResponse])
def get_movements(
    product_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = StockService(db)
    return service.get_movements(product_id=product_id, skip=skip, limit=limit)
