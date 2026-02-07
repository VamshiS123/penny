from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_db
from app.core.users import current_active_user
from app.crud import user as crud_user
from app.models.user import User, UserUpdate, UserRead, UserReadWithRelations

router = APIRouter()

from sqlalchemy.orm import selectinload
from sqlmodel import select

@router.get("/me", response_model=UserReadWithRelations)
async def read_user_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(current_active_user),
) -> Any:
    """
    Get current user.
    """
    # Force load relationships
    statement = select(User).where(User.id == current_user.id).options(
        selectinload(User.achievements),
        selectinload(User.items)
    )
    result = await db.exec(statement)
    user = result.one()
    
    return user

@router.patch("/me", response_model=UserReadWithRelations)
async def update_user_me(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(current_active_user),
) -> Any:
    """
    Update current user.
    """
    user = await crud_user.update(db, db_obj=current_user, obj_in=user_in)
    await db.commit()
    
    # Reload with relations
    statement = select(User).where(User.id == user.id).options(
        selectinload(User.achievements),
        selectinload(User.items)
    )
    result = await db.exec(statement)
    return result.one()
