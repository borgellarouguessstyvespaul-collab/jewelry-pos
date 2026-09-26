"""
Database Seed Script for Jewelry POS.
Populates standard roles, initial users, categories, luxury jewelry catalog,
customers, and initial stock levels.
"""

import sys
import os
from decimal import Decimal

# Ensure backend app is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend')))

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.customer import Customer
from app.models.stock_movement import StockMovement, MovementType
from app.core.permissions import UserRole


def seed():
    # Create all tables in database
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("[INFO] Seeding database...")

        # 1. Users
        users_data = [
            {
                "name": "admin",
                "email": "admin@jewelrypos.com",
                "password_hash": hash_password("admin123"),
                "role": UserRole.ADMIN,
                "is_active": True,
            },
            {
                "name": "Claire Laurent (Gestionnaire)",
                "email": "manager@jewelrypos.com",
                "password_hash": hash_password("manager123"),
                "role": UserRole.GESTIONNAIRE,
                "is_active": True,
            },
            {
                "name": "Sophie Martin (Caissière)",
                "email": "caissier@jewelrypos.com",
                "password_hash": hash_password("caissier123"),
                "role": UserRole.CAISSIER,
                "is_active": True,
            },
        ]

        for u_data in users_data:
            existing = db.query(User).filter(User.email == u_data["email"]).first()
            if not existing:
                db.add(User(**u_data))
                print(f"  + Added user: {u_data['email']} ({u_data['role']})")
            else:
                existing.password_hash = u_data["password_hash"]
                existing.is_active = True
                print(f"  ~ Updated password for user: {u_data['email']}")
        db.commit()

        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()

        # 2. Categories
        categories_data = [
            ("Bagues & Solitaires", "Bagues de fiançailles, solitaires diamant et anneaux or"),
            ("Colliers & Pendentifs", "Chaines en or, colliers de perles et pendentifs précieux"),
            ("Bracelets", "Joncs, bracelets rivière et chaines de poignet"),
            ("Boucles d'Oreilles", "Créoles, puces diamant et pendants d'oreilles"),
            ("Alliances", "Alliances de mariage classiques et serties"),
            ("Montres de Luxe", "Horlogerie fine et chronographes"),
        ]

        cat_map = {}
        for name, desc in categories_data:
            cat = db.query(Category).filter(Category.name == name).first()
            if not cat:
                cat = Category(name=name, description=desc, is_active=True)
                db.add(cat)
                db.flush()
                print(f"  + Added category: {name}")
            cat_map[name] = cat
        db.commit()

        # 3. Products
        products_data = [
            {
                "name": "Bague Solitaire Diamant 1.0ct Or Blanc",
                "sku": "BAG-SOL-001",
                "barcode": "JWL-100001",
                "category": "Bagues & Solitaires",
                "purchase_price": Decimal("1400.00"),
                "selling_price": Decimal("2450.00"),
                "stock": 4,
                "min_alert": 2,
            },
            {
                "name": "Bague Émeraude de Colombie & Diamants",
                "sku": "BAG-EME-002",
                "barcode": "JWL-100002",
                "category": "Bagues & Solitaires",
                "purchase_price": Decimal("1800.00"),
                "selling_price": Decimal("3200.00"),
                "stock": 2,
                "min_alert": 2,
            },
            {
                "name": "Collier Rivière Diamants Or Blanc",
                "sku": "COL-RIV-003",
                "barcode": "JWL-100003",
                "category": "Colliers & Pendentifs",
                "purchase_price": Decimal("3400.00"),
                "selling_price": Decimal("5800.00"),
                "stock": 3,
                "min_alert": 1,
            },
            {
                "name": "Pendentif Croix Or Jaune 18K",
                "sku": "PEN-CRX-004",
                "barcode": "JWL-100004",
                "category": "Colliers & Pendentifs",
                "purchase_price": Decimal("280.00"),
                "selling_price": Decimal("490.00"),
                "stock": 8,
                "min_alert": 3,
            },
            {
                "name": "Bracelet Jonc Ouvrant Or Rose 18K",
                "sku": "BRA-JON-005",
                "barcode": "JWL-100005",
                "category": "Bracelets",
                "purchase_price": Decimal("750.00"),
                "selling_price": Decimal("1350.00"),
                "stock": 5,
                "min_alert": 2,
            },
            {
                "name": "Bracelet Maille Royale Argent 925",
                "sku": "BRA-ROY-006",
                "barcode": "JWL-100006",
                "category": "Bracelets",
                "purchase_price": Decimal("70.00"),
                "selling_price": Decimal("180.00"),
                "stock": 15,
                "min_alert": 4,
            },
            {
                "name": "Créoles Diamant Pavé Or Blanc",
                "sku": "BOU-CRE-007",
                "barcode": "JWL-100007",
                "category": "Boucles d'Oreilles",
                "purchase_price": Decimal("620.00"),
                "selling_price": Decimal("1150.00"),
                "stock": 3,
                "min_alert": 2,
            },
            {
                "name": "Puces d'Oreilles Saphir Bleu & Or",
                "sku": "BOU-SAP-008",
                "barcode": "JWL-100008",
                "category": "Boucles d'Oreilles",
                "purchase_price": Decimal("450.00"),
                "selling_price": Decimal("890.00"),
                "stock": 6,
                "min_alert": 2,
            },
            {
                "name": "Alliance Ruban Confort Or Jaune 4mm",
                "sku": "ALL-RUB-009",
                "barcode": "JWL-100009",
                "category": "Alliances",
                "purchase_price": Decimal("220.00"),
                "selling_price": Decimal("420.00"),
                "stock": 10,
                "min_alert": 3,
            },
            {
                "name": "Alliance Tour Complet Diamants Or Blanc",
                "sku": "ALL-DIA-010",
                "barcode": "JWL-100010",
                "category": "Alliances",
                "purchase_price": Decimal("900.00"),
                "selling_price": Decimal("1650.00"),
                "stock": 2,
                "min_alert": 2,
            },
        ]

        for p_info in products_data:
            prod = db.query(Product).filter(Product.barcode == p_info["barcode"]).first()
            if not prod:
                cat = cat_map[p_info["category"]]
                prod = Product(
                    name=p_info["name"],
                    sku=p_info["sku"],
                    barcode=p_info["barcode"],
                    description=f"{p_info['name']} de qualité supérieure",
                    category_id=cat.id,
                    purchase_price=p_info["purchase_price"],
                    selling_price=p_info["selling_price"],
                    stock_quantity=p_info["stock"],
                    low_stock_threshold=p_info["min_alert"],
                    is_active=True,
                )
                db.add(prod)
                db.flush()

                # Add initial stock movement
                mov = StockMovement(
                    product_id=prod.id,
                    user_id=admin_user.id if admin_user else 1,
                    movement_type=MovementType.ENTREE,
                    quantity=p_info["stock"],
                    previous_quantity=0,
                    new_quantity=p_info["stock"],
                    reason="Stock initial seed",
                )
                db.add(mov)
                print(f"  + Added product: {p_info['name']} (Stock: {p_info['stock']})")
        db.commit()

        # 4. Customers
        customers_data = [
            ("Mme. Nathalie Desrosiers", "+509 3712-3456", "nathalie.d@example.com", "Petion-Ville, Rue Panamericaine", "Cliente VIP - Or 18K"),
            ("M. Patrick Beaubrun", "+509 3422-9876", "patrick.b@example.com", "Port-au-Prince, Bois Verna", "Alliances de mariage"),
            ("Mme. Valerie Pierre", "+33 6 12 34 56 78", "valerie.p@example.com", "Paris 16eme", "Solitaires & diamants"),
        ]

        for name, phone, email, addr, notes in customers_data:
            cust = db.query(Customer).filter(Customer.phone == phone).first()
            if not cust:
                cust = Customer(name=name, phone=phone, email=email, address=addr, notes=notes)
                db.add(cust)
                print(f"  + Added customer: {name}")
        db.commit()

        print("[SUCCESS] Database successfully seeded!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
