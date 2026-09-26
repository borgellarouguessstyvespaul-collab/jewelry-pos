"""
Role-based permissions system for the Jewelry POS.

Roles:
- ADMIN       → full access to everything
- GESTIONNAIRE→ stock, products, reports
- CAISSIER    → POS sales, product consultation
"""

from enum import Enum
from fastapi import HTTPException, status


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    GESTIONNAIRE = "GESTIONNAIRE"
    CAISSIER = "CAISSIER"


# Define which roles can access which resources
PERMISSIONS = {
    "ADMIN": [
        "read:users", "write:users", "delete:users",
        "read:products", "write:products", "delete:products",
        "read:categories", "write:categories", "delete:categories",
        "read:sales", "write:sales", "cancel:sales",
        "read:stock", "write:stock",
        "read:reports",
        "read:audit",
        "read:customers", "write:customers",
    ],
    "GESTIONNAIRE": [
        "read:products", "write:products",
        "read:categories", "write:categories",
        "read:stock", "write:stock",
        "read:reports",
        "read:customers", "write:customers",
        "read:sales",
    ],
    "CAISSIER": [
        "read:products",
        "read:categories",
        "write:sales", "read:sales",
        "read:customers", "write:customers",
    ],
}


def require_permission(permission: str, user_role: str) -> None:
    """Check if a role has a specific permission. Raises 403 if not."""
    allowed = PERMISSIONS.get(user_role, [])
    if permission not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{user_role}' does not have permission: '{permission}'",
        )


def has_permission(permission: str, user_role: str) -> bool:
    """Return True if the role has the permission."""
    return permission in PERMISSIONS.get(user_role, [])
