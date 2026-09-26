"""Stock service — manages inventory movements, stock status and adjustments with explicit joins."""

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.product import Product
from app.models.category import Category
from app.models.stock_movement import StockMovement, MovementType
from app.schemas.stock import StockAdjustment
from app.services.audit_service import AuditService


class StockService:
    def __init__(self, db: Session):
        self.db = db

    def get_stock_status(self, category_id=None, search=None):
        query = self.db.query(Product).join(Category, Product.category_id == Category.id, isouter=True).filter(Product.is_active == True)

        if category_id:
            query = query.filter(Product.category_id == category_id)
        if search:
            query = query.filter(
                Product.name.ilike(f"%{search}%") |
                Product.sku.ilike(f"%{search}%") |
                Product.barcode.ilike(f"%{search}%")
            )

        products = query.order_by(Product.id.desc()).all()

        items = []
        for p in products:
            threshold = p.low_stock_threshold or 5
            qty = p.stock_quantity or 0
            if qty <= 0:
                status_code = "RUPTURE"
                status_label = "Rupture"
            elif qty < threshold:
                status_code = "STOCK_BAS"
                status_label = "Stock Bas"
            else:
                status_code = "NORMAL"
                status_label = "Normal"

            items.append({
                "product_id": p.id,
                "id": p.id,
                "product_name": p.name,
                "name": p.name,
                "description": p.description,
                "sku": p.sku or "-",
                "barcode": p.barcode or "-",
                "category_id": p.category_id,
                "category_name": p.category.name if p.category else "Matériels & Accessoires",
                "selling_price": float(p.selling_price) if p.selling_price is not None else 0.0,
                "purchase_price": float(p.purchase_price) if p.purchase_price is not None else 0.0,
                "current_stock": qty,
                "stock_quantity": qty,
                "low_stock_threshold": threshold,
                "min_stock_alert": threshold,
                "status": status_code,
                "status_label": status_label,
                "is_low_stock": qty < threshold,
            })
        return items

    def get_low_stock(self):
        products = self.db.query(Product).filter(
            Product.is_active == True,
            Product.stock_quantity < 5
        ).all()
        return [
            {
                "product_id": p.id,
                "product_name": p.name,
                "name": p.name,
                "sku": p.sku,
                "barcode": p.barcode,
                "category_id": p.category_id,
                "category_name": p.category.name if p.category else "Matériels & Accessoires",
                "stock_quantity": p.stock_quantity,
                "current_stock": p.stock_quantity,
                "low_stock_threshold": p.low_stock_threshold,
                "min_stock_alert": p.low_stock_threshold,
                "is_low_stock": True,
            }
            for p in products
        ]

    def adjust_stock(self, data: StockAdjustment, current_user) -> StockMovement:
        product = self.db.query(Product).filter(Product.id == data.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Produit non trouvé")

        new_qty = product.stock_quantity + data.quantity
        if new_qty < 0:
            raise HTTPException(status_code=400, detail="Le stock ne peut pas être inférieur à 0")

        movement = self._record_movement(
            product=product,
            user=current_user,
            movement_type=data.movement_type,
            quantity=data.quantity,
            reason=data.reason,
        )
        product.stock_quantity = new_qty

        AuditService(self.db).log(
            user_id=current_user.id,
            action="STOCK_ADJUSTED",
            entity="Product",
            entity_id=product.id,
            description=f"Faire le plein / Stock ajusté pour '{product.name}': +{data.quantity} (Nouveau stock: {new_qty})",
        )

        self.db.commit()
        self.db.refresh(movement)
        return movement

    def _record_movement(self, product, user, movement_type: MovementType,
                         quantity: int, reason: str = None, reference_id: int = None) -> StockMovement:
        movement = StockMovement(
            product_id=product.id,
            user_id=user.id,
            movement_type=movement_type,
            quantity=quantity,
            previous_quantity=product.stock_quantity,
            new_quantity=product.stock_quantity + quantity,
            reason=reason,
            reference_id=reference_id,
        )
        self.db.add(movement)
        return movement

    def get_movements(self, product_id: int = None, skip: int = 0, limit: int = 100):
        query = self.db.query(StockMovement)
        if product_id:
            query = query.filter(StockMovement.product_id == product_id)
        return query.order_by(StockMovement.created_at.desc()).offset(skip).limit(limit).all()
