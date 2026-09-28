"""
Initial Database Seeder.
Runs on startup to ensure default demo accounts (admin, manager, caissier) exist.
"""

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password
from app.core.permissions import UserRole

def init_db():
    db: Session = SessionLocal()
    try:
        # Check / Seed Admin (only if not existing)
        admin = db.query(User).filter(User.email == "admin@jewelrypos.com").first()
        if not admin:
            admin = User(
                name="admin",
                email="admin@jewelrypos.com",
                password_hash=hash_password("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)

        # Seed default categories if none exist
        from app.models.category import Category
        if db.query(Category).count() == 0:
            default_categories = [
                Category(name="Bagues", description="Bagues & Alliances en Or, Argent et Platine", color="#eab308"),
                Category(name="Colliers", description="Pendentifs, chaînes et colliers fins", color="#ec4899"),
                Category(name="Bracelets", description="Bracelets rigides, chaînettes et gourmets", color="#3b82f6"),
                Category(name="Boucles d'oreilles", description="Puces, créoles et pendantes", color="#8b5cf6"),
                Category(name="Montres", description="Montres de luxe et horlogerie", color="#10b981"),
            ]
            db.add_all(default_categories)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()
