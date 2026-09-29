"""
Audit API routes — ADMIN only.
GET /api/audit
GET /api/audit/{id}
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.schemas.audit import AuditLogResponse
from app.services.audit_service import AuditService
from app.dependencies.auth import require_role
from app.core.permissions import UserRole

router = APIRouter()


@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN])),
):
    service = AuditService(db)
    return service.get_logs(skip=skip, limit=limit, action=action, user_id=user_id)


@router.delete("/clear")
def clear_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN])),
):
    """Clear all audit log entries to reset system to virgin state (ADMIN only)."""
    service = AuditService(db)
    return service.clear_all()


@router.get("/{log_id}", response_model=AuditLogResponse)
def get_audit_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN])),
):
    service = AuditService(db)
    return service.get_by_id(log_id)
