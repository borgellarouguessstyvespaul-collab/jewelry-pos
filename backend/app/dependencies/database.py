"""Database dependency — re-export get_db for cleaner imports."""

from app.core.database import get_db

__all__ = ["get_db"]
