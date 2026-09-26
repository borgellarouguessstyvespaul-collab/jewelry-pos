"""
Monthly Archives API endpoints.
GET /api/archives
POST /api/archives/generate
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.schemas.archive import MonthlyArchiveResponse, ArchiveGenerateRequest
from app.services.archive_service import ArchiveService
from app.dependencies.auth import require_role
from app.core.permissions import UserRole

router = APIRouter()


@router.get("", response_model=List[MonthlyArchiveResponse])
def get_monthly_archives(
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.GESTIONNAIRE])),
):
    service = ArchiveService(db)
    return service.get_all_archives()


@router.post("/generate", response_model=MonthlyArchiveResponse)
def generate_monthly_archive(
    req: Optional[ArchiveGenerateRequest] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.GESTIONNAIRE])),
):
    today = date.today()
    year = req.year if (req and req.year) else today.year
    month = req.month if (req and req.month) else today.month

    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Mois invalide (doit être entre 1 et 12)")

    service = ArchiveService(db)
    archive = service.create_or_update_archive(year=year, month=month)
    
    # Format response properly
    cat_breakdown = []
    try:
        import json
        if archive.category_breakdown_json:
            cat_breakdown = json.loads(archive.category_breakdown_json)
    except Exception:
        cat_breakdown = []

    return {
        "id": archive.id,
        "year": archive.year,
        "month": archive.month,
        "month_name": archive.month_name,
        "total_sales": archive.total_sales,
        "total_profit": archive.total_profit,
        "total_paid": archive.total_paid,
        "transaction_count": archive.transaction_count,
        "products_sold": archive.products_sold,
        "category_breakdown_json": archive.category_breakdown_json,
        "category_breakdown": cat_breakdown,
        "archived_at": archive.archived_at,
    }
