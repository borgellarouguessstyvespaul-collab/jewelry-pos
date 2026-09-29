"""
Archive service — automatic & manual monthly dashboard snapshots.
"""

import json
from decimal import Decimal
from datetime import date, datetime
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.monthly_archive import MonthlyArchive
from app.models.sale import Sale, SaleStatus
from app.models.sale_item import SaleItem
from app.models.product import Product
from app.models.category import Category

MONTH_NAMES_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]


class ArchiveService:
    def __init__(self, db: Session):
        self.db = db

    def clear_all(self) -> dict:
        """Supprime toutes les archives mensuelles pour remettre le compteur à 0."""
        self.db.query(MonthlyArchive).delete()
        self.db.commit()
        return {"message": "Toutes les archives ont été supprimées avec succès. Compteur remis à 0."}

    def get_all_archives(self) -> List[dict]:
        """Returns all monthly archives recorded in the database."""
        archives = self.db.query(MonthlyArchive).order_by(
            MonthlyArchive.year.desc(),
            MonthlyArchive.month.desc()
        ).all()

        result = []
        for arch in archives:
            cat_breakdown = []
            try:
                if arch.category_breakdown_json:
                    cat_breakdown = json.loads(arch.category_breakdown_json)
            except Exception:
                cat_breakdown = []

            result.append({
                "id": arch.id,
                "year": arch.year,
                "month": arch.month,
                "month_name": arch.month_name,
                "total_sales": arch.total_sales or Decimal("0"),
                "total_profit": arch.total_profit or Decimal("0"),
                "total_paid": arch.total_paid or Decimal("0"),
                "transaction_count": arch.transaction_count or 0,
                "products_sold": arch.products_sold or 0,
                "category_breakdown_json": arch.category_breakdown_json,
                "category_breakdown": cat_breakdown,
                "archived_at": arch.archived_at,
            })
        return result

    def ensure_past_months_archived(self):
        """Auto-generate archives starting from August 2026 up to current month if missing."""
        today = date.today()
        # Starting point: August 2026 (2026, 8)
        start_year = 2026
        start_month = 8

        cur_year = start_year
        cur_month = start_month

        while (cur_year < today.year) or (cur_year == today.year and cur_month <= today.month):
            existing = self.db.query(MonthlyArchive).filter(
                MonthlyArchive.year == cur_year,
                MonthlyArchive.month == cur_month
            ).first()

            if not existing:
                self.create_or_update_archive(cur_year, cur_month)

            # Increment month
            if cur_month == 12:
                cur_month = 1
                cur_year += 1
            else:
                cur_month += 1

    def create_or_update_archive(self, year: int, month: int) -> MonthlyArchive:
        """Create or update archive for specific year and month."""
        month_str = MONTH_NAMES_FR[month - 1]
        month_name = f"{month_str} {year}"

        # 1. Sales total for the target month
        total_sales = self.db.query(func.sum(Sale.total)).filter(
            func.extract("year", Sale.created_at) == year,
            func.extract("month", Sale.created_at) == month,
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or Decimal("0")

        # 2. Total paid
        total_paid = self.db.query(func.sum(Sale.total)).filter(
            func.extract("year", Sale.created_at) == year,
            func.extract("month", Sale.created_at) == month,
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or total_sales

        # 3. Transaction count
        transaction_count = self.db.query(func.count(Sale.id)).filter(
            func.extract("year", Sale.created_at) == year,
            func.extract("month", Sale.created_at) == month,
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or 0

        # 4. Products sold total quantity
        products_sold = self.db.query(func.sum(SaleItem.quantity)).select_from(SaleItem).join(
            Sale, SaleItem.sale_id == Sale.id
        ).filter(
            func.extract("year", Sale.created_at) == year,
            func.extract("month", Sale.created_at) == month,
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or 0

        # 5. Total cost and profit
        total_cost = self.db.query(func.sum(Product.purchase_price * SaleItem.quantity)).select_from(
            SaleItem
        ).join(
            Sale, SaleItem.sale_id == Sale.id
        ).join(
            Product, SaleItem.product_id == Product.id
        ).filter(
            func.extract("year", Sale.created_at) == year,
            func.extract("month", Sale.created_at) == month,
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or Decimal("0")

        total_profit = max(Decimal("0"), total_sales - total_cost)

        # 6. Category breakdown for that month
        cats = self.db.query(Category).filter(Category.is_active == True).all()
        cat_list = []
        for cat in cats:
            c_qty = self.db.query(func.sum(SaleItem.quantity)).select_from(SaleItem).join(
                Sale, SaleItem.sale_id == Sale.id
            ).join(
                Product, SaleItem.product_id == Product.id
            ).filter(
                Product.category_id == cat.id,
                func.extract("year", Sale.created_at) == year,
                func.extract("month", Sale.created_at) == month,
                Sale.status == SaleStatus.COMPLETED
            ).scalar() or 0

            if c_qty > 0:
                cat_list.append({"name": cat.name, "value": float(c_qty)})

        category_breakdown_json = json.dumps(cat_list)

        # Save or update record
        archive = self.db.query(MonthlyArchive).filter(
            MonthlyArchive.year == year,
            MonthlyArchive.month == month
        ).first()

        if not archive:
            archive = MonthlyArchive(
                year=year,
                month=month,
                month_name=month_name,
                total_sales=total_sales,
                total_profit=total_profit,
                total_paid=total_paid,
                transaction_count=transaction_count,
                products_sold=products_sold,
                category_breakdown_json=category_breakdown_json,
            )
            self.db.add(archive)
        else:
            archive.month_name = month_name
            archive.total_sales = total_sales
            archive.total_profit = total_profit
            archive.total_paid = total_paid
            archive.transaction_count = transaction_count
            archive.products_sold = products_sold
            archive.category_breakdown_json = category_breakdown_json

        self.db.commit()
        self.db.refresh(archive)

        return archive
