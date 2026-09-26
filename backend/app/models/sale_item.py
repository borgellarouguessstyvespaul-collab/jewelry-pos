"""
SaleItem model — individual line items within a sale.
"""

from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class SaleItem(Base):
    __tablename__ = "sale_items"

    id         = Column(Integer, primary_key=True, index=True)
    sale_id    = Column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity   = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal   = Column(Numeric(12, 2), nullable=False)

    # Relationships
    sale    = relationship("Sale", back_populates="sale_items")
    product = relationship("Product", back_populates="sale_items")

    @property
    def product_name(self) -> str:
        return self.product.name if self.product else f"Produit #{self.product_id}"

    def __repr__(self):
        return f"<SaleItem sale={self.sale_id} product={self.product_id} qty={self.quantity}>"
