"""Customers API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.services.customer_service import CustomerService
from app.dependencies.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[CustomerResponse])
def get_customers(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = CustomerService(db)
    return service.get_all(skip=skip, limit=limit, search=search)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = CustomerService(db)
    customer = service.get_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/", response_model=CustomerResponse, status_code=201)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = CustomerService(db)
    return service.create(data, current_user)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, data: CustomerUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = CustomerService(db)
    return service.update(customer_id, data, current_user)
