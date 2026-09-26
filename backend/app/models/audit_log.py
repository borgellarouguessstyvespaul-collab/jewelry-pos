"""
AuditLog model — records all important admin actions for accountability.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=True)
    action      = Column(String(100), nullable=False)    # e.g. SALE_CREATED
    entity      = Column(String(100), nullable=False)    # e.g. Sale, Product
    entity_id   = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    ip_address  = Column(String(45), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self):
        return f"<AuditLog {self.action} on {self.entity}#{self.entity_id}>"
