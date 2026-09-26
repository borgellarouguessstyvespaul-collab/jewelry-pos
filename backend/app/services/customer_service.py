"""Customer service."""

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.services.audit_service import AuditService


class CustomerService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip=0, limit=100, search=None):
        query = self.db.query(Customer)
        if search:
            query = query.filter(
                Customer.name.ilike(f"%{search}%") |
                Customer.phone.ilike(f"%{search}%")
            )
        return query.offset(skip).limit(limit).all()

    def get_by_id(self, customer_id: int):
        return self.db.query(Customer).filter(Customer.id == customer_id).first()

    def create(self, data: CustomerCreate, current_user=None) -> Customer:
        customer = Customer(**data.model_dump())
        self.db.add(customer)
        self.db.flush()

        if current_user:
            AuditService(self.db).log(
                user_id=current_user.id,
                action="CUSTOMER_CREATED",
                entity="Customer",
                entity_id=customer.id,
                description=f"Client '{customer.name}' créé",
            )

        self.db.commit()
        self.db.refresh(customer)
        return customer

    def update(self, customer_id: int, data: CustomerUpdate, current_user=None) -> Customer:
        customer = self.get_by_id(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(customer, field, value)

        if current_user:
            AuditService(self.db).log(
                user_id=current_user.id,
                action="CUSTOMER_UPDATED",
                entity="Customer",
                entity_id=customer.id,
                description=f"Client '{customer.name}' mis à jour",
            )

        self.db.commit()
        self.db.refresh(customer)
        return customer
