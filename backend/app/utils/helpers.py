"""General helper functions."""

from decimal import Decimal, ROUND_HALF_UP


def format_currency(amount, currency: str = "HTG") -> str:
    """Format a number as currency string."""
    return f"{float(amount):,.2f} {currency}"


def round_decimal(value, places: int = 2) -> Decimal:
    """Round a Decimal to specified places."""
    quantize_str = "0." + "0" * places
    return Decimal(str(value)).quantize(Decimal(quantize_str), rounding=ROUND_HALF_UP)


def paginate(query, skip: int, limit: int):
    """Apply pagination to a SQLAlchemy query."""
    return query.offset(skip).limit(limit).all()
