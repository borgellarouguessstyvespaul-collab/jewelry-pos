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
        # Check / Seed Admin
        admin = db.query(User).filter(User.email == "admin@jewelrypos.com").first()
        if not admin:
            admin = User(
                name="Admin (Administrateur)",
                email="admin@jewelrypos.com",
                password_hash=hash_password("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)

        # Check / Seed Manager
        manager = db.query(User).filter(User.email == "manager@jewelrypos.com").first()
        if not manager:
            manager = User(
                name="Claire Laurent (Gestionnaire)",
                email="manager@jewelrypos.com",
                password_hash=hash_password("manager123"),
                role=UserRole.GESTIONNAIRE,
                is_active=True
            )
            db.add(manager)

        # Check / Seed Cashier
        cashier = db.query(User).filter(User.email == "caissier@jewelrypos.com").first()
        if not cashier:
            cashier = User(
                name="Sophie Martin (Caissière)",
                email="caissier@jewelrypos.com",
                password_hash=hash_password("caissier123"),
                role=UserRole.CAISSIER,
                is_active=True
            )
            db.add(cashier)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()
