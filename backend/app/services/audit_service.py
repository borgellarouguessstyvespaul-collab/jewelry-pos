"""Audit service — record system actions for accountability."""

from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.models.audit_log import AuditLog
from fastapi import HTTPException


class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log(
        self,
        action: str,
        entity: str,
        user_id: Optional[int] = None,
        entity_id: Optional[int] = None,
        description: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            description=description,
            ip_address=ip_address,
        )
        self.db.add(entry)
        # Note: caller is responsible for commit
        return entry

    def get_logs(self, skip=0, limit=200, action=None, user_id=None):
        query = self.db.query(AuditLog).options(joinedload(AuditLog.user))
        if action:
            query = query.filter(AuditLog.action == action)
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        return query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

    def get_by_id(self, log_id: int) -> AuditLog:
        log = self.db.query(AuditLog).options(joinedload(AuditLog.user)).filter(AuditLog.id == log_id).first()
        if not log:
            raise HTTPException(status_code=404, detail="Audit log not found")
        return log

    def clear_all(self) -> dict:
        count = self.db.query(AuditLog).delete()
        self.db.commit()
        return {"deleted_count": count, "message": f"{count} entrée(s) du journal d'audit effacée(s). Le système est vierge."}
