"""Product service — CRUD, automatic SKU/barcode generation, and lookup."""

import random
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.audit_service import AuditService

VALID_PRODUCT_COLUMNS = {
    "name",
    "sku",
    "barcode",
    "description",
    "category_id",
    "purchase_price",
    "selling_price",
    "stock_quantity",
    "low_stock_threshold",
    "image_url",
    "is_active",
}


class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip=0, limit=100, category_id=None, search=None, is_active=True):
        query = self.db.query(Product)
        if is_active is not None:
            query = query.filter(Product.is_active == is_active)
        if category_id:
            query = query.filter(Product.category_id == category_id)
        if search:
            query = query.filter(
                Product.name.ilike(f"%{search}%") |
                Product.sku.ilike(f"%{search}%") |
                Product.barcode.ilike(f"%{search}%")
            )
        return query.order_by(Product.id.desc()).offset(skip).limit(limit).all()

    def get_by_id(self, product_id: int) -> Product:
        return self.db.query(Product).filter(Product.id == product_id).first()

    def get_by_barcode(self, barcode: str) -> Product:
        return self.db.query(Product).filter(
            Product.barcode == barcode, Product.is_active == True
        ).first()

    def create(self, data: ProductCreate, current_user) -> Product:
        # Automatic SKU generation if empty or not provided
        if not data.sku or not str(data.sku).strip():
            count = self.db.query(Product).count() + 1
            generated_sku = f"PRD-{1000 + count}"
            while self.db.query(Product).filter(Product.sku == generated_sku).first():
                generated_sku = f"PRD-{random.randint(1000, 99999)}"
            data.sku = generated_sku

        # Check SKU uniqueness
        existing = self.db.query(Product).filter(Product.sku == data.sku).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Le code/SKU '{data.sku}' existe déjà.")

        # Automatic barcode generation if empty or not provided
        if not data.barcode or not str(data.barcode).strip():
            generated_barcode = f"2026{random.randint(10000000, 99999999)}"
            while self.db.query(Product).filter(Product.barcode == generated_barcode).first():
                generated_barcode = f"2026{random.randint(10000000, 99999999)}"
            data.barcode = generated_barcode

        dump_dict = data.model_dump()
        product_attrs = {k: v for k, v in dump_dict.items() if k in VALID_PRODUCT_COLUMNS}

        product = Product(**product_attrs)
        self.db.add(product)
        self.db.flush()

        AuditService(self.db).log(
            user_id=current_user.id,
            action="PRODUCT_CREATED",
            entity="Product",
            entity_id=product.id,
            description=f"Produit '{product.name}' (SKU: {product.sku}) créé",
        )

        self.db.commit()
        self.db.refresh(product)
        return product

    def update(self, product_id: int, data: ProductUpdate, current_user) -> Product:
        product = self.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Produit introuvable")

        dump_dict = data.model_dump(exclude_unset=True)

        # Check SKU uniqueness if SKU is being changed
        if "sku" in dump_dict and dump_dict["sku"] and dump_dict["sku"] != product.sku:
            existing = self.db.query(Product).filter(Product.sku == dump_dict["sku"]).first()
            if existing:
                raise HTTPException(status_code=400, detail=f"Le code/SKU '{dump_dict['sku']}' existe déjà.")

        for field, value in dump_dict.items():
            if field in VALID_PRODUCT_COLUMNS and hasattr(product, field):
                setattr(product, field, value)

        AuditService(self.db).log(
            user_id=current_user.id,
            action="PRODUCT_UPDATED",
            entity="Product",
            entity_id=product.id,
            description=f"Produit '{product.name}' mis à jour",
        )

        self.db.commit()
        self.db.refresh(product)
        return product

    def deactivate(self, product_id: int, current_user) -> None:
        product = self.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Produit introuvable")
        product.is_active = False

        AuditService(self.db).log(
            user_id=current_user.id,
            action="PRODUCT_DELETED",
            entity="Product",
            entity_id=product.id,
            description=f"Produit '{product.name}' désactivé",
        )

        self.db.commit()
