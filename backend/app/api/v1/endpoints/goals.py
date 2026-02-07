import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_db
from app.core.users import current_active_user
from app.crud import goal as crud_goal
from app.models.goal import Goal, GoalCreate, GoalUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Goal])
async def read_goals(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(current_active_user),
) -> List[Goal]:
    """
    Retrieve goals.
    """
    goals = await crud_goal.get_multi_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return goals

@router.post("/", response_model=Goal)
async def create_goal(
    *,
    db: AsyncSession = Depends(get_db),
    goal_in: GoalCreate,
    current_user: User = Depends(current_active_user),
) -> Goal:
    """
    Create new goal.
    """
    goal = await crud_goal.create(db, obj_in=goal_in, user_id=current_user.id)
    return goal

@router.put("/{id}", response_model=Goal)
async def update_goal(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    goal_in: GoalUpdate,
    current_user: User = Depends(current_active_user),
) -> Goal:
    """
    Update a goal.
    """
    goal = await crud_goal.get(db, id=id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    goal = await crud_goal.update(db, db_obj=goal, obj_in=goal_in)
    return goal

@router.delete("/{id}", response_model=Goal)
async def delete_goal(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    current_user: User = Depends(current_active_user),
) -> Goal:
    """
    Delete a goal.
    """
    goal = await crud_goal.get(db, id=id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    goal = await crud_goal.remove(db, id=id)
    return goal
