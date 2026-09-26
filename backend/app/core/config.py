"""
Configuration settings for the Jewelry POS application.
Uses pydantic-settings to load from environment variables.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Jewelry POS"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./jewelry_pos.db"

    # Security / JWT
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    # Upload paths
    UPLOAD_DIR: str = "uploads/images"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
