"""
Sales API routes.
POST /api/sales
GET  /api/sales
GET  /api/sales/{id}
POST /api/sales/{id}/cancel
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.schemas.sale import SaleCreate, SaleResponse
from app.services.sale_service import SaleService
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User
from app.core.permissions import UserRole

router = APIRouter()


@router.post("/", response_model=SaleResponse, status_code=201)
def create_sale(
    data: SaleCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.CAISSIER])),
):
    """Complete a sale transaction."""
    service = SaleService(db)
    ip = request.client.host if request.client else None
    return service.create_sale(data, current_user, ip_address=ip)


@router.get("/", response_model=List[SaleResponse])
def get_sales(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SaleService(db)
    return service.get_all(skip=skip, limit=limit, status=status)


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SaleService(db)
    return service.get_by_id(sale_id)


@router.post("/{sale_id}/cancel")
def cancel_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Cancel a completed sale (ADMIN only)."""
    service = SaleService(db)
    return service.cancel_sale(sale_id, current_user)


@router.delete("/history/clear")
def clear_sales_history(
    date_str: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Permanently clear sales history for a specific day or all days (ADMIN only)."""
    service = SaleService(db)
    return service.clear_history(date_str=date_str, current_user=current_user)


@router.delete("/{sale_id}")
def delete_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Cancel a sale and restore product stock (ADMIN only)."""
    service = SaleService(db)
    return service.cancel_sale(sale_id, current_user)


@router.delete("/{sale_id}/permanent", status_code=204)
def delete_sale_permanently(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Permanently delete a single sale record from history (ADMIN only)."""
    service = SaleService(db)
    service.delete_permanently(sale_id, current_user)

