"""
StockMovement model — tracks every stock change with reason.
Movement types: ENTREE, VENTE, RETOUR, AJUSTEMENT
"""

from sqlalchemy import (Column, Integer, String, DateTime,
                        Enum as SAEnum, ForeignKey, Text)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
import enum


class MovementType(str, enum.Enum):
    ENTREE      = "ENTREE"       # Stock entry / purchase
    VENTE       = "VENTE"        # Sale deduction
    RETOUR      = "RETOUR"       # Customer return
    AJUSTEMENT  = "AJUSTEMENT"   # Manual adjustment


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id                = Column(Integer, primary_key=True, index=True)
    product_id        = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id           = Column(Integer, ForeignKey("users.id"), nullable=True)
    movement_type     = Column(SAEnum(MovementType), nullable=False)
    quantity          = Column(Integer, nullable=False)   # positive = in, negative = out
    previous_quantity = Column(Integer, nullable=False)
    new_quantity      = Column(Integer, nullable=False)
    reason            = Column(Text, nullable=True)
    reference_id      = Column(Integer, nullable=True)    # e.g. sale_id
    created_at        = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    product = relationship("Product", back_populates="stock_movements")
    user    = relationship("User", back_populates="stock_movements")

    def __repr__(self):
        return f"<StockMovement {self.movement_type} qty={self.quantity} product={self.product_id}>"
