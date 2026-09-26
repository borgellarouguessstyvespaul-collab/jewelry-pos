"""
Auth API routes.
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import LoginRequest
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user by email or username and return JWT token + user info."""
    service = AuthService(db)
    return service.login(request.identifier, request.password)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user."""
    return current_user


@router.post("/logout")
def logout():
    """Logout — client should discard the token."""
    return {"message": "Logged out successfully"}
