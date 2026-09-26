"""
Sale service — core business logic for completing a sale.

Workflow:
  1. Verify all products exist
  2. Verify stock >= quantity for each item
  3. Calculate subtotal, apply discount, calculate total
  4. Verify amount_received >= total
  5. Create Sale record
  6. Create SaleItem records
  7. Decrease product stock
  8. Create StockMovement records
  9. Create AuditLog record
  10. Commit transaction
"""

from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.sale import Sale, SaleStatus
from app.models.sale_item import SaleItem
from app.models.product import Product
from app.schemas.sale import SaleCreate
from app.services.stock_service import StockService
from app.services.audit_service import AuditService
from app.utils.sale_number import generate_sale_number
from app.models.stock_movement import MovementType


class SaleService:
    def __init__(self, db: Session):
        self.db = db

    def create_sale(self, data: SaleCreate, current_user, ip_address: str = None) -> Sale:
        # 1. Load and validate products
        products = {}
        for item in data.items:
            product = self.db.query(Product).filter(
                Product.id == item.product_id, Product.is_active == True
            ).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            if product.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity}",
                )
            products[item.product_id] = product

        # 2. Calculate totals
        subtotal = sum(
            Decimal(str(item.unit_price)) * item.quantity for item in data.items
        )
        discount = Decimal(str(data.discount))
        total = subtotal - discount

        if data.amount_received < total:
            raise HTTPException(status_code=400, detail="Amount received is less than total")

        change = Decimal(str(data.amount_received)) - total

        # 3. Create Sale
        sale_number = generate_sale_number(self.db)
        sale = Sale(
            sale_number=sale_number,
            user_id=current_user.id,
            customer_id=data.customer_id,
            subtotal=subtotal,
            discount=discount,
            total=total,
            amount_received=data.amount_received,
            change_amount=change,
            payment_method=data.payment_method,
            status=SaleStatus.COMPLETED,
            notes=data.notes,
        )
        self.db.add(sale)
        self.db.flush()  # get sale.id

        # 4. Create SaleItems + deduct stock
        stock_service = StockService(self.db)
        for item in data.items:
            product = products[item.product_id]
            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=Decimal(str(item.unit_price)) * item.quantity,
            )
            self.db.add(sale_item)
            # Deduct stock
            stock_service._record_movement(
                product=product,
                user=current_user,
                movement_type=MovementType.VENTE,
                quantity=-item.quantity,
                reason=f"Sale {sale_number}",
                reference_id=sale.id,
            )
            product.stock_quantity -= item.quantity

        # 5. Audit log
        audit_service = AuditService(self.db)
        audit_service.log(
            user_id=current_user.id,
            action="SALE_CREATED",
            entity="Sale",
            entity_id=sale.id,
            description=f"Sale {sale_number} created. Total: {total} HTG",
            ip_address=ip_address,
        )

        self.db.commit()
        self.db.refresh(sale)
        return sale

    def get_all(self, skip: int = 0, limit: int = 50, status: str = None):
        query = self.db.query(Sale).options(
            joinedload(Sale.sale_items).joinedload(SaleItem.product)
        )
        if status:
            query = query.filter(Sale.status == status)
        return query.order_by(Sale.created_at.desc()).offset(skip).limit(limit).all()

    def get_by_id(self, sale_id: int) -> Sale:
        sale = (
            self.db.query(Sale)
            .options(joinedload(Sale.sale_items).joinedload(SaleItem.product))
            .filter(Sale.id == sale_id)
            .first()
        )
        if not sale:
            raise HTTPException(status_code=404, detail="Sale not found")
        return sale

    def cancel_sale(self, sale_id: int, current_user) -> Sale:
        sale = self.get_by_id(sale_id)
        if sale.status == SaleStatus.CANCELLED:
            raise HTTPException(status_code=400, detail="Sale is already cancelled")

        # Restore stock
        stock_service = StockService(self.db)
        restored_details = []
        for item in sale.sale_items:
            product = self.db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                stock_service._record_movement(
                    product=product,
                    user=current_user,
                    movement_type=MovementType.RETOUR,
                    quantity=item.quantity,
                    reason=f"Commande {sale.sale_number} supprimée/annulée — Restitution du stock (+{item.quantity})",
                    reference_id=sale.id,
                )
                product.stock_quantity += item.quantity
                restored_details.append(f"{product.name} (+{item.quantity})")

        sale.status = SaleStatus.CANCELLED

        restored_summary = ", ".join(restored_details) if restored_details else "Aucun produit"
        AuditService(self.db).log(
            user_id=current_user.id,
            action="SALE_DELETED_OR_CANCELLED",
            entity="Sale",
            entity_id=sale.id,
            description=f"Commande {sale.sale_number} (Total: {sale.total} HTG) supprimée/annulée par {current_user.name}. Stock réintégré avec succès: {restored_summary}",
        )

        self.db.commit()
        self.db.refresh(sale)
        return sale
