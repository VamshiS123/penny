import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_db
from app.core.users import current_active_user
from app.crud import account as crud_account
from app.models.account import Account, AccountCreate, AccountUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Account])
async def read_accounts(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(current_active_user),
) -> List[Account]:
    """
    Retrieve accounts.
    """
    accounts = await crud_account.get_multi_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return accounts

@router.post("/", response_model=Account)
async def create_account(
    *,
    db: AsyncSession = Depends(get_db),
    account_in: AccountCreate,
    current_user: User = Depends(current_active_user),
) -> Account:
    """
    Create new account.
    """
    account = await crud_account.create(db, obj_in=account_in, user_id=current_user.id)
    return account

@router.put("/{id}", response_model=Account)
async def update_account(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    account_in: AccountUpdate,
    current_user: User = Depends(current_active_user),
) -> Account:
    """
    Update an account.
    """
    account = await crud_account.get(db, id=id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if account.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    account = await crud_account.update(db, db_obj=account, obj_in=account_in)
    return account

@router.delete("/{id}", response_model=Account)
async def delete_account(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    current_user: User = Depends(current_active_user),
) -> Account:
    """
    Delete an account.
    """
    account = await crud_account.get(db, id=id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if account.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    account = await crud_account.remove(db, id=id)
    return account
