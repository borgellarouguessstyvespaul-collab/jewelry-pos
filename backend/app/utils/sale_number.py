"""
Sale number generator.
Format: SALE-YYYY-NNNNNN (e.g. SALE-2026-000001)
"""

from datetime import datetime
from sqlalchemy.orm import Session
from app.models.sale import Sale


def generate_sale_number(db: Session) -> str:
    year = datetime.now().year
    prefix = f"SALE-{year}-"

    last_sale = (
        db.query(Sale)
        .filter(Sale.sale_number.like(f"{prefix}%"))
        .order_by(Sale.id.desc())
        .first()
    )

    if last_sale:
        last_num = int(last_sale.sale_number.split("-")[-1])
        next_num = last_num + 1
    else:
        next_num = 1

    return f"{prefix}{next_num:06d}"
