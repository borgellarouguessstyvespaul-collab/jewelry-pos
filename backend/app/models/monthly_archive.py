"""Monthly Archive model — stores end-of-month snapshots of dashboard stats."""

from sqlalchemy import Column, Integer, String, Numeric, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.core.database import Base


class MonthlyArchive(Base):
    __tablename__ = "monthly_archives"
    __table_args__ = (
        UniqueConstraint("year", "month", name="uq_archive_year_month"),
    )

    id               = Column(Integer, primary_key=True, index=True)
    year             = Column(Integer, nullable=False)
    month            = Column(Integer, nullable=False)          # 1-12
    month_name       = Column(String(20), nullable=False)       # e.g. "Août 2026"

    # Financial totals for the month
    total_sales      = Column(Numeric(12, 2), default=0)
    total_profit     = Column(Numeric(12, 2), default=0)
    total_paid       = Column(Numeric(12, 2), default=0)

    # Transaction counts
    transaction_count = Column(Integer, default=0)
    products_sold     = Column(Integer, default=0)        # total quantity sold

    # Category breakdown stored as JSON string
    category_breakdown_json = Column(String(2000), default="{}")

    archived_at = Column(DateTime(timezone=True), server_default=func.now())
