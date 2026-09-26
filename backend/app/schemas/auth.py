"""Auth schemas — login request and token response."""

from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    identifier: str          # email OR username
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[dict] = None


class TokenData(BaseModel):
    user_id: int
    email: str
    role: str
