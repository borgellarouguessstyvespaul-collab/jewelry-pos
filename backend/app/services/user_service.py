"""User service — CRUD for user management with Single Unique Admin enforcement & password audit logging."""

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password
from app.core.permissions import UserRole


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return (
            self.db.query(User)
            .filter(~User.email.in_(["admin@jewelrypos.com", "kisa@kisa.com"]))
            .order_by(User.id)
            .all()
        )

    def get_by_id(self, user_id: int) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        return user

    def get_by_email(self, email: str) -> User:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, data: UserCreate) -> User:
        if self.get_by_email(data.email):
            raise HTTPException(status_code=400, detail="Email déjà utilisé par un autre compte")

        # Prohibition: Only Caissier accounts can be created
        target_role = data.role.value if hasattr(data.role, 'value') else str(data.role)
        if target_role != UserRole.CAISSIER.value:
            raise HTTPException(
                status_code=400,
                detail="Seuls les comptes avec le rôle Caissier / Vendeur peuvent être créés."
            )

        clean_pwd = data.password.strip() if data.password else ""
        user = User(
            name=data.name,
            email=data.email,
            password_hash=hash_password(clean_pwd),
            role=data.role,
            is_active=True,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # Log creation & initial password in Audit Log for Admin notification
        from app.services.audit_service import AuditService
        audit = AuditService(self.db)
        audit.log(
            user_id=user.id,
            action="USER_CREATED",
            entity="User",
            entity_id=user.id,
            description=f"Création de l'utilisateur '{user.name}' ({user.email}). Mot de passe initial: {clean_pwd}",
        )
        self.db.commit()

        return user

    def update(self, user_id: int, data: UserUpdate) -> User:
        user = self.get_by_id(user_id)
        update_dict = data.model_dump(exclude_unset=True)

        # Check role mutation restrictions
        if "role" in update_dict:
            new_role = update_dict["role"].value if hasattr(update_dict["role"], 'value') else str(update_dict["role"])
            old_role = user.role.value if hasattr(user.role, 'value') else str(user.role)

            if new_role == UserRole.ADMIN.value and old_role != UserRole.ADMIN.value:
                existing_admins = self.db.query(User).filter(User.role == UserRole.ADMIN, User.id != user_id).count()
                if existing_admins >= 1:
                    raise HTTPException(
                        status_code=400,
                        detail="Un seul administrateur unique est autorisé dans le système."
                    )
            elif old_role == UserRole.ADMIN.value and new_role != UserRole.ADMIN.value:
                other_admins = self.db.query(User).filter(User.role == UserRole.ADMIN, User.id != user_id).count()
                if other_admins == 0:
                    raise HTTPException(
                        status_code=400,
                        detail="L'administrateur principal unique ne peut pas changer de rôle."
                    )

        # Handle password change separately & record in Audit Log with new password
        password_changed = False
        new_password_text = ""
        if "password" in update_dict:
            raw_password = update_dict.pop("password")
            if raw_password and raw_password.strip():
                new_password_text = raw_password.strip()
                user.password_hash = hash_password(new_password_text)
                password_changed = True

        for field, value in update_dict.items():
            if hasattr(user, field):
                setattr(user, field, value)

        self.db.commit()

        # Log password modification to Audit Logs
        if password_changed:
            from app.services.audit_service import AuditService
            audit = AuditService(self.db)
            audit.log(
                user_id=user_id,
                action="PASSWORD_CHANGED",
                entity="User",
                entity_id=user_id,
                description=f"Mot de passe modifié pour l'utilisateur '{user.name}' ({user.email}). Nouveau mot de passe: {new_password_text}",
            )
            self.db.commit()

        self.db.refresh(user)
        return user

    def deactivate(self, user_id: int) -> None:
        user = self.get_by_id(user_id)
        current_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
        if current_role == UserRole.ADMIN.value:
            raise HTTPException(
                status_code=400,
                detail="L'administrateur principal unique ne peut pas être désactivé."
            )
        user.is_active = False
        self.db.commit()

    def delete_permanently(self, user_id: int, current_user_id: int = None) -> None:
        user = self.get_by_id(user_id)
        current_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
        if current_role == UserRole.ADMIN.value:
            raise HTTPException(
                status_code=400,
                detail="L'administrateur principal unique ne peut pas être supprimé."
            )

        from app.models.sale import Sale
        from app.models.stock_movement import StockMovement
        from app.models.audit_log import AuditLog
        from app.services.audit_service import AuditService

        audit = AuditService(self.db)
        audit.log(
            user_id=current_user_id or user_id,
            action="USER_DELETED",
            entity="User",
            entity_id=user_id,
            description=f"Utilisateur '{user.name}' ({user.email}) supprimé définitivement",
        )

        # Unlink user references to prevent foreign key errors
        self.db.query(Sale).filter(Sale.user_id == user_id).update({"user_id": None})
        self.db.query(StockMovement).filter(StockMovement.user_id == user_id).update({"user_id": None})
        self.db.query(AuditLog).filter(AuditLog.user_id == user_id).update({"user_id": None})

        self.db.delete(user)
        self.db.commit()

    def activate(self, user_id: int) -> User:
        user = self.get_by_id(user_id)
        user.is_active = True
        self.db.commit()
        self.db.refresh(user)
        return user
