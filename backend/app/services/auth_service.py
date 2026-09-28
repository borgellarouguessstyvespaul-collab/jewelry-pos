"""
Auth service — handles login and token creation.
Supports login by email OR username (name field) with case-insensitive matching.
"""

from datetime import timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from fastapi import HTTPException, status

from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.core.config import settings
from app.core.permissions import UserRole


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def login(self, identifier: str, password: str) -> dict:
        """Authenticate by email OR username securely."""
        clean_id = (identifier or "").strip()
        clean_pwd = (password or "").strip()

        if not clean_id or not clean_pwd:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Veuillez remplir l'identifiant et le mot de passe",
            )

        # Try to find by email or by name (case-insensitive)
        user = self.db.query(User).filter(
            or_(
                func.lower(User.email) == clean_id.lower(),
                func.lower(User.name) == clean_id.lower(),
                User.email.ilike(f"{clean_id}%"),
                User.name.ilike(f"%{clean_id}%"),
            )
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiant ou mot de passe incorrect",
            )

        # Verify password securely against the database hash
        is_valid = verify_password(clean_pwd, user.password_hash)

        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiant ou mot de passe incorrect",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ce compte est désactivé",
            )

        token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "full_name": user.name,
                "email": user.email,
                "role": user.role.value if hasattr(user.role, 'value') else user.role,
                "is_active": user.is_active,
            },
        }