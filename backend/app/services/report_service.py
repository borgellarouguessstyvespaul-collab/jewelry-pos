"""Report service — statistics, real-time dynamic trends, and daily/monthly archives."""

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timedelta
from decimal import Decimal

from app.models.sale import Sale, SaleStatus
from app.models.sale_item import SaleItem
from app.models.product import Product
from app.models.category import Category
from app.models.customer import Customer

MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]
DAY_NAMES_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_stats(self) -> dict:
        today = date.today()
        seven_days_ago = datetime.utcnow() - timedelta(days=7)

        # 1. Today
        total_today = self.db.query(func.sum(Sale.total)).filter(
            func.date(Sale.created_at) == today,
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or Decimal("0")

        total_cost_today = self.db.query(func.sum(func.coalesce(Product.purchase_price, 0) * SaleItem.quantity)).select_from(
            SaleItem
        ).join(
            Sale, SaleItem.sale_id == Sale.id
        ).outerjoin(
            Product, SaleItem.product_id == Product.id
        ).filter(
            func.date(Sale.created_at) == today,
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or Decimal("0")
        profits_today = max(Decimal("0"), total_today - total_cost_today)

        # 2. Week (Last 7 Days)
        total_sales_week = self.db.query(func.sum(Sale.total)).filter(
            Sale.created_at >= seven_days_ago,
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or Decimal("0")

        total_cost_week = self.db.query(func.sum(func.coalesce(Product.purchase_price, 0) * SaleItem.quantity)).select_from(
            SaleItem
        ).join(
            Sale, SaleItem.sale_id == Sale.id
        ).outerjoin(
            Product, SaleItem.product_id == Product.id
        ).filter(
            Sale.created_at >= seven_days_ago,
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or Decimal("0")
        profits_week = max(Decimal("0"), total_sales_week - total_cost_week)

        # 3. Month
        total_month = self.db.query(func.sum(Sale.total)).filter(
            func.extract("month", Sale.created_at) == today.month,
            func.extract("year", Sale.created_at) == today.year,
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or Decimal("0")

        total_cost_month = self.db.query(func.sum(func.coalesce(Product.purchase_price, 0) * SaleItem.quantity)).select_from(
            SaleItem
        ).join(
            Sale, SaleItem.sale_id == Sale.id
        ).outerjoin(
            Product, SaleItem.product_id == Product.id
        ).filter(
            func.extract("month", Sale.created_at) == today.month,
            func.extract("year", Sale.created_at) == today.year,
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or Decimal("0")
        profits_month = max(Decimal("0"), total_month - total_cost_month)

        # 4. All-time Lifetime Totals
        total_sales_all_time = self.db.query(func.sum(Sale.total)).filter(
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or Decimal("0")

        total_cost_all_time = self.db.query(func.sum(func.coalesce(Product.purchase_price, 0) * SaleItem.quantity)).select_from(
            SaleItem
        ).join(
            Sale, SaleItem.sale_id == Sale.id
        ).outerjoin(
            Product, SaleItem.product_id == Product.id
        ).filter(
            Sale.status == SaleStatus.COMPLETED
        ).scalar() or Decimal("0")
        total_profit = max(Decimal("0"), total_sales_all_time - total_cost_all_time)

        total_products = self.db.query(func.count(Product.id)).filter(Product.is_active == True).scalar() or 0

        # Low stock threshold is strictly < 5
        low_stock = self.db.query(func.count(Product.id)).filter(
            Product.is_active == True,
            Product.stock_quantity < 5
        ).scalar() or 0

        total_customers = self.db.query(func.count(Customer.id)).scalar() or 0

        # Real Monthly Trend for current year (Jan..Dec) starting from real data (0 if no sales)
        monthly_trend = []
        for m_idx in range(1, 13):
            m_sum = self.db.query(func.sum(Sale.total)).filter(
                func.extract("month", Sale.created_at) == m_idx,
                func.extract("year", Sale.created_at) == today.year,
                Sale.status == SaleStatus.COMPLETED
            ).scalar() or Decimal("0")
            monthly_trend.append({
                "month": MONTH_NAMES[m_idx - 1],
                "sales": float(m_sum)
            })

        # Category Breakdown based on actual products or completed sales
        cats = self.db.query(Category).filter(Category.is_active == True).all()
        category_breakdown = []
        for cat in cats:
            count = self.db.query(func.count(Product.id)).filter(
                Product.category_id == cat.id,
                Product.is_active == True
            ).scalar() or 0
            if count > 0:
                category_breakdown.append({
                    "name": cat.name,
                    "value": float(count)
                })

        return {
            "total_sales_today": total_today,
            "today_sales_total": total_today,
            "total_sales_week": total_sales_week,
            "total_sales_month": total_month,
            "total_sales_all_time": total_sales_all_time,
            "total_transactions_today": tx_today,
            "today_sales_count": tx_today,
            "total_paid_today": total_today,
            "profits_today": profits_today,
            "profits_week": profits_week,
            "profits_month": profits_month,
            "total_profit": total_profit,
            "total_products": total_products,
            "low_stock_count": low_stock,
            "total_customers": total_customers,
            "monthly_trend": monthly_trend,
            "category_breakdown": category_breakdown,
        }

    def get_sales_report(self, period: str = "daily", start_date=None, end_date=None) -> dict:
        query = self.db.query(
            func.date(Sale.created_at).label("day_date"),
            func.sum(Sale.total).label("total_sales"),
            func.count(Sale.id).label("transaction_count"),
        ).filter(Sale.status == SaleStatus.COMPLETED)

        if start_date:
            query = query.filter(func.date(Sale.created_at) >= start_date)
        if end_date:
            query = query.filter(func.date(Sale.created_at) <= end_date)

        rows = query.group_by(func.date(Sale.created_at)).order_by(func.date(Sale.created_at).desc()).all()

        items = []
        grand_total = Decimal("0")
        grand_count = 0
        grand_qty = 0

        for row in rows:
            day_str = str(row.day_date)
            # Calculate total quantity of items sold on this day
            qty_sold = self.db.query(func.sum(SaleItem.quantity)).join(
                Sale, SaleItem.sale_id == Sale.id
            ).filter(
                func.date(Sale.created_at) == row.day_date,
                Sale.status == SaleStatus.COMPLETED
            ).scalar() or 0

            # Format day name (e.g. Lundi 24 Novembre 2026)
            try:
                parsed_date = datetime.strptime(day_str, "%Y-%m-%d")
                weekday_name = DAY_NAMES_FR[parsed_date.weekday()]
                month_name = MONTH_NAMES[parsed_date.month - 1]
                formatted_day = f"{weekday_name} {parsed_date.day} {month_name} {parsed_date.year}"
            except Exception:
                formatted_day = day_str

            avg = (row.total_sales / row.transaction_count) if row.transaction_count else Decimal("0")
            items.append({
                "period": day_str,
                "day_name": formatted_day,
                "total_sales": row.total_sales or Decimal("0"),
                "quantity_sold": int(qty_sold),
                "transaction_count": row.transaction_count,
                "avg_transaction": avg,
            })
            grand_total += row.total_sales or Decimal("0")
            grand_count += row.transaction_count
            grand_qty += int(qty_sold)

        return {
            "items": items,
            "total": grand_total,
            "count": grand_count,
            "total_quantity": grand_qty,
        }

    def get_top_products(self, limit: int = 10) -> dict:
        rows = self.db.query(
            SaleItem.product_id,
            Product.name.label("product_name"),
            Product.sku.label("sku"),
            func.sum(SaleItem.quantity).label("total_quantity_sold"),
            func.sum(SaleItem.subtotal).label("total_revenue"),
        ).join(
            Product, SaleItem.product_id == Product.id
        ).join(
            Sale, SaleItem.sale_id == Sale.id
        ).filter(
            Sale.status == SaleStatus.COMPLETED
        ).group_by(
            SaleItem.product_id, Product.name, Product.sku
        ).order_by(
            func.sum(SaleItem.quantity).desc()
        ).limit(limit).all()

        return {
            "items": [
                {
                    "product_id": r.product_id,
                    "product_name": r.product_name,
                    "sku": r.sku,
                    "total_quantity_sold": r.total_quantity_sold,
                    "total_revenue": r.total_revenue,
                }
                for r in rows
            ]
        }

    def get_stock_report(self) -> list:
        products = self.db.query(Product).filter(Product.is_active == True).all()
        return [
            {
                "product_id": p.id,
                "product_name": p.name,
                "sku": p.sku,
                "current_stock": p.stock_quantity,
                "low_stock_threshold": p.low_stock_threshold,
                "is_low_stock": p.stock_quantity < 5,
                "purchase_price": p.purchase_price,
                "stock_value": p.purchase_price * p.stock_quantity,
            }
            for p in products
        ]
