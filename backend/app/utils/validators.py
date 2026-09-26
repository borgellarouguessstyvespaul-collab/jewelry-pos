"""Input validators for common fields."""

import re


def validate_email(email: str) -> bool:
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w{2,}$"
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """Validate Haitian phone number formats."""
    pattern = r"^(\+509)?[\s-]?[34]\d{7}$"
    return bool(re.match(pattern, phone.replace(" ", "")))


def validate_price(price) -> bool:
    """Price must be a non-negative number."""
    try:
        return float(price) >= 0
    except (TypeError, ValueError):
        return False


def validate_sku(sku: str) -> bool:
    """SKU should be alphanumeric with optional hyphens."""
    return bool(re.match(r"^[A-Za-z0-9\-_]{2,20}$", sku))
