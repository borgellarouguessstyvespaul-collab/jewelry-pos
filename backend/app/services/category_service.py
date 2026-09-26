"""Category service — CRUD and validation."""

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.services.audit_service import AuditService


class CategoryService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Category).filter(Category.is_active == True).order_by(Category.name).all()

    def get_by_id(self, category_id: int):
        return self.db.query(Category).filter(Category.id == category_id).first()

    def create(self, data: CategoryCreate, current_user=None) -> Category:
        existing = self.db.query(Category).filter(
            Category.name.ilike(data.name.strip()),
            Category.is_active == True
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"La catégorie '{data.name}' existe déjà.")

        cat = Category(
            name=data.name.strip(),
            description=data.description.strip() if data.description else None,
            is_active=True
        )
        self.db.add(cat)
        self.db.flush()

        if current_user:
            AuditService(self.db).log(
                user_id=current_user.id,
                action="CATEGORY_CREATED",
                entity="Category",
                entity_id=cat.id,
                description=f"Catégorie '{cat.name}' créée",
            )

        self.db.commit()
        self.db.refresh(cat)
        return cat

    def update(self, category_id: int, data: CategoryUpdate, current_user=None) -> Category:
        cat = self.get_by_id(category_id)
        if not cat:
            raise HTTPException(status_code=404, detail="Catégorie introuvable")

        dump = data.model_dump(exclude_unset=True)
        if "name" in dump and dump["name"]:
            cat.name = dump["name"].strip()
        if "description" in dump:
            cat.description = dump["description"].strip() if dump["description"] else None
        if "is_active" in dump:
            cat.is_active = dump["is_active"]

        if current_user:
            AuditService(self.db).log(
                user_id=current_user.id,
                action="CATEGORY_UPDATED",
                entity="Category",
                entity_id=cat.id,
                description=f"Catégorie '{cat.name}' mise à jour",
            )

        self.db.commit()
        self.db.refresh(cat)
        return cat

    def deactivate(self, category_id: int, current_user=None) -> None:
        cat = self.get_by_id(category_id)
        if not cat:
            raise HTTPException(status_code=404, detail="Catégorie introuvable")

        # Check if products are associated
        active_products = self.db.query(Product).filter(
            Product.category_id == category_id,
            Product.is_active == True
        ).count()
        if active_products > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Impossible de supprimer cette catégorie car {active_products} produit(s) y sont rattachés. Veuillez d'abord modifier ou déplacer ces produits."
            )

        if current_user:
            AuditService(self.db).log(
                user_id=current_user.id,
                action="CATEGORY_DELETED",
                entity="Category",
                entity_id=cat.id,
                description=f"Catégorie '{cat.name}' supprimée",
            )

        self.db.delete(cat)
        self.db.commit()
