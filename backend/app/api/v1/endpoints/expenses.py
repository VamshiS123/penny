import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_db
from app.core.users import current_active_user
from app.crud import expense as crud_expense
from app.models.expense import Expense, ExpenseCreate, ExpenseUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Expense])
async def read_expenses(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(current_active_user),
) -> List[Expense]:
    """
    Retrieve expenses.
    """
    expenses = await crud_expense.get_multi_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return expenses

@router.post("/", response_model=Expense)
async def create_expense(
    *,
    db: AsyncSession = Depends(get_db),
    expense_in: ExpenseCreate,
    current_user: User = Depends(current_active_user),
) -> Expense:
    """
    Create new expense.
    """
    expense = await crud_expense.create(db, obj_in=expense_in, user_id=current_user.id)
    return expense

@router.put("/{id}", response_model=Expense)
async def update_expense(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    expense_in: ExpenseUpdate,
    current_user: User = Depends(current_active_user),
) -> Expense:
    """
    Update an expense.
    """
    expense = await crud_expense.get(db, id=id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if expense.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    expense = await crud_expense.update(db, db_obj=expense, obj_in=expense_in)
    return expense

@router.delete("/{id}", response_model=Expense)
async def delete_expense(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    current_user: User = Depends(current_active_user),
) -> Expense:
    """
    Delete an expense.
    """
    expense = await crud_expense.get(db, id=id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if expense.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    expense = await crud_expense.remove(db, id=id)
    return expense
