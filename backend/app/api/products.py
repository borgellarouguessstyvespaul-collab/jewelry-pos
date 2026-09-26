"""
Products API routes.
GET    /api/products
GET    /api/products/{id}
GET    /api/products/barcode/{barcode}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import ProductService
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User
from app.core.permissions import UserRole

router = APIRouter()


@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ProductService(db)
    return service.get_all(skip=skip, limit=limit, category_id=category_id,
                           search=search, is_active=is_active)


@router.get("/barcode/{barcode}", response_model=ProductResponse)
def get_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ProductService(db)
    product = service.get_by_barcode(barcode)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ProductService(db)
    product = service.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.GESTIONNAIRE])),
):
    service = ProductService(db)
    return service.create(data, current_user)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.GESTIONNAIRE])),
):
    service = ProductService(db)
    return service.update(product_id, data, current_user)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    service = ProductService(db)
    service.deactivate(product_id, current_user)
