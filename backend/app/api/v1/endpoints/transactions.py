import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_db
from app.core.users import current_active_user
from app.crud import transaction as crud_transaction
from app.models.transaction import Transaction, TransactionCreate, TransactionUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Transaction])
async def read_transactions(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(current_active_user),
) -> List[Transaction]:
    """
    Retrieve transactions.
    """
    transactions = await crud_transaction.get_multi_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return transactions

@router.post("/", response_model=Transaction)
async def create_transaction(
    *,
    db: AsyncSession = Depends(get_db),
    transaction_in: TransactionCreate,
    current_user: User = Depends(current_active_user),
) -> Transaction:
    """
    Create new transaction.
    """
    transaction = await crud_transaction.create(db, obj_in=transaction_in, user_id=current_user.id)
    return transaction

@router.put("/{id}", response_model=Transaction)
async def update_transaction(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    transaction_in: TransactionUpdate,
    current_user: User = Depends(current_active_user),
) -> Transaction:
    """
    Update a transaction.
    """
    transaction = await crud_transaction.get(db, id=id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    transaction = await crud_transaction.update(db, db_obj=transaction, obj_in=transaction_in)
    return transaction

@router.delete("/{id}", response_model=Transaction)
async def delete_transaction(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    current_user: User = Depends(current_active_user),
) -> Transaction:
    """
    Delete a transaction.
    """
    transaction = await crud_transaction.get(db, id=id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    transaction = await crud_transaction.remove(db, id=id)
    return transaction
