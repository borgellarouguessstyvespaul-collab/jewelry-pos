"""Categories API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.category_service import CategoryService
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User
from app.core.permissions import UserRole

router = APIRouter()


@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = CategoryService(db)
    return service.get_all()


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = CategoryService(db)
    cat = service.get_by_id(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.GESTIONNAIRE])),
):
    service = CategoryService(db)
    return service.create(data, current_user)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.GESTIONNAIRE])),
):
    service = CategoryService(db)
    return service.update(category_id, data, current_user)


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.GESTIONNAIRE])),
):
    service = CategoryService(db)
    service.deactivate(category_id, current_user)
