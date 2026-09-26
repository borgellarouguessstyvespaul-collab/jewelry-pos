"""User schemas — create, update, and response."""

from pydantic import BaseModel, EmailStr, model_validator, computed_field
from typing import Optional
from datetime import datetime
from app.core.permissions import UserRole


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.CAISSIER

    @model_validator(mode="before")
    @classmethod
    def accept_full_name(cls, data):
        if isinstance(data, dict):
            if "full_name" in data and ("name" not in data or not data["name"]):
                data["name"] = data.get("full_name")
        return data


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None  # plain text — service will hash it

    @model_validator(mode="before")
    @classmethod
    def accept_full_name(cls, data):
        if isinstance(data, dict):
            if "full_name" in data and ("name" not in data or not data["name"]):
                data["name"] = data.get("full_name")
        return data


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime

    @computed_field
    @property
    def full_name(self) -> str:
        return self.name

    model_config = {"from_attributes": True}


