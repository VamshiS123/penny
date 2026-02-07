from typing import List, Optional
import uuid
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.goal import Goal, GoalCreate, GoalUpdate

class CRUDGoal:
    async def get(self, session: AsyncSession, id: uuid.UUID) -> Optional[Goal]:
        return await session.get(Goal, id)

    async def get_multi_by_user(
        self, session: AsyncSession, user_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Goal]:
        statement = select(Goal).where(Goal.user_id == user_id).offset(skip).limit(limit)
        result = await session.exec(statement)
        return result.all()

    async def create(self, session: AsyncSession, *, obj_in: GoalCreate, user_id: uuid.UUID) -> Goal:
        db_obj = Goal.model_validate(obj_in, update={"user_id": user_id})
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return db_obj

    async def update(
        self, session: AsyncSession, *, db_obj: Goal, obj_in: GoalUpdate | dict
    ) -> Goal:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        for key, value in update_data.items():
            setattr(db_obj, key, value)
            
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return db_obj

    async def remove(self, session: AsyncSession, *, id: uuid.UUID) -> Optional[Goal]:
        obj = await session.get(Goal, id)
        if obj:
            await session.delete(obj)
            await session.commit()
        return obj

goal = CRUDGoal()
