"""
Product model — represents the 'products' table.
Central model of the POS system.
"""

from sqlalchemy import (Column, Integer, String, Boolean, DateTime,
                        Numeric, Text, ForeignKey)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id                  = Column(Integer, primary_key=True, index=True)
    name                = Column(String(200), nullable=False)
    sku                 = Column(String(50), unique=True, index=True, nullable=False)
    barcode             = Column(String(100), unique=True, index=True, nullable=True)
    description         = Column(Text, nullable=True)
    category_id         = Column(Integer, ForeignKey("categories.id"), nullable=False)
    purchase_price      = Column(Numeric(10, 2), nullable=False, default=0)
    selling_price       = Column(Numeric(10, 2), nullable=False)
    stock_quantity      = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=5)
    image_url           = Column(String(500), nullable=True)
    is_active           = Column(Boolean, default=True)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    category         = relationship("Category", back_populates="products")
    sale_items       = relationship("SaleItem", back_populates="product")
    stock_movements  = relationship("StockMovement", back_populates="product")

    @property
    def price(self):
        return self.selling_price

    @property
    def cost_price(self):
        return self.purchase_price

    @property
    def min_stock_alert(self):
        return self.low_stock_threshold

    @property
    def is_low_stock(self) -> bool:
        return self.stock_quantity <= self.low_stock_threshold

    def __repr__(self):
        return f"<Product {self.sku}: {self.name}>"
