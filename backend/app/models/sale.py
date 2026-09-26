"""
Sale model — represents a complete sales transaction.
"""

from sqlalchemy import (Column, Integer, String, DateTime, Numeric,
                        Enum as SAEnum, ForeignKey)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
import enum


class PaymentMethod(str, enum.Enum):
    CASH      = "CASH"
    CARD      = "CARD"
    TRANSFER  = "TRANSFER"


class SaleStatus(str, enum.Enum):
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    HELD      = "HELD"


class Sale(Base):
    __tablename__ = "sales"

    id              = Column(Integer, primary_key=True, index=True)
    sale_number     = Column(String(30), unique=True, index=True, nullable=False)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_id     = Column(Integer, ForeignKey("customers.id"), nullable=True)
    subtotal        = Column(Numeric(12, 2), nullable=False)
    discount        = Column(Numeric(12, 2), default=0)
    total           = Column(Numeric(12, 2), nullable=False)
    amount_received = Column(Numeric(12, 2), nullable=False)
    change_amount   = Column(Numeric(12, 2), default=0)
    payment_method  = Column(SAEnum(PaymentMethod), default=PaymentMethod.CASH)
    status          = Column(SAEnum(SaleStatus), default=SaleStatus.COMPLETED)
    notes           = Column(String(500), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user       = relationship("User", back_populates="sales")
    customer   = relationship("Customer", back_populates="sales")
    sale_items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Sale {self.sale_number} [{self.status}]>"
