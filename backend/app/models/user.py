"""
User model — represents the 'users' table in PostgreSQL.
Roles: ADMIN, GESTIONNAIRE, CAISSIER
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.core.permissions import UserRole


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(150), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role          = Column(SAEnum(UserRole), nullable=False, default=UserRole.CAISSIER)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sales            = relationship("Sale", back_populates="user")
    stock_movements  = relationship("StockMovement", back_populates="user")
    audit_logs       = relationship("AuditLog", back_populates="user")

    def __repr__(self):
        return f"<User {self.email} [{self.role}]>"
