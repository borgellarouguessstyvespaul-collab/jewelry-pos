"""
Database connection and session management.
SQLAlchemy engine + session factory with PostgreSQL and SQLite fallback support.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

db_url = settings.DATABASE_URL

# Support SQLite or automatic fallback if postgres is not available
if db_url.startswith("sqlite"):
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
    )
else:
    try:
        # Test connection to PostgreSQL with small timeout
        test_engine = create_engine(db_url, pool_pre_ping=True, pool_size=5, max_overflow=10)
        with test_engine.connect() as conn:
            pass
        engine = test_engine
    except Exception:
        db_url = "sqlite:///./jewelry_pos.db"
        engine = create_engine(
            db_url,
            connect_args={"check_same_thread": False},
        )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency: yields a database session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
