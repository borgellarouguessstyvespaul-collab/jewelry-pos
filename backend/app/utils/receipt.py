"""
Receipt data preparation utilities.
Formats sale data for printing.
"""

from datetime import datetime
from decimal import Decimal


def format_receipt(sale) -> dict:
    """
    Prepare a receipt data dict from a Sale object.
    Used by the frontend to render the receipt before printing.
    """
    return {
        "store_name": "Jewelry Store",
        "sale_number": sale.sale_number,
        "date": sale.created_at.strftime("%d/%m/%Y %H:%M"),
        "cashier": sale.user.name if sale.user else "—",
        "customer": sale.customer.name if sale.customer else "Client anonyme",
        "items": [
            {
                "name": item.product.name if item.product else f"Product #{item.product_id}",
                "qty": item.quantity,
                "unit_price": float(item.unit_price),
                "subtotal": float(item.subtotal),
            }
            for item in sale.sale_items
        ],
        "subtotal": float(sale.subtotal),
        "discount": float(sale.discount),
        "total": float(sale.total),
        "amount_received": float(sale.amount_received),
        "change": float(sale.change_amount),
        "payment_method": sale.payment_method,
        "footer": "Merci de votre achat!",
    }
