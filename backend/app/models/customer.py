"""
Customer model — optional customer tracking for loyalty and history.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(150), nullable=False)
    phone      = Column(String(20), unique=True, nullable=True)
    email      = Column(String(255), unique=True, nullable=True)
    address    = Column(Text, nullable=True)
    notes      = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    sales = relationship("Sale", back_populates="customer")

    @property
    def customer_code(self) -> str:
        return f"CUST-{1000 + self.id}"

    def __repr__(self):
        return f"<Customer {self.customer_code} - {self.name}>"
