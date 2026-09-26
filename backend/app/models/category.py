"""
Category model — represents jewelry product categories.
Examples: Bagues, Colliers, Bracelets, Boucles d'oreilles, Montres, etc.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    color       = Column(String(7), default="#6366f1")   # hex color for UI badge
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    products = relationship("Product", back_populates="category")

    def __repr__(self):
        return f"<Category {self.name}>"
