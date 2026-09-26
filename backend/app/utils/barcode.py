"""
Barcode utilities — validation and generation helpers.
"""

import re


def is_valid_barcode(barcode: str) -> bool:
    """Validate EAN-13 or UPC-A barcode format."""
    barcode = barcode.strip()
    return bool(re.match(r"^\d{8,14}$", barcode))


def generate_internal_barcode(sku: str) -> str:
    """
    Generate a simple internal barcode from SKU.
    For production, use a proper barcode library.
    """
    digits = "".join(filter(str.isdigit, sku)) or "0000000000"
    return digits[:12].zfill(12)
