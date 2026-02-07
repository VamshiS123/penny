from typing import List, Optional
import uuid
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.account import Account, AccountCreate, AccountUpdate

class CRUDAccount:
    async def get(self, session: AsyncSession, id: uuid.UUID) -> Optional[Account]:
        return await session.get(Account, id)

    async def get_multi_by_user(
        self, session: AsyncSession, user_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Account]:
        statement = select(Account).where(Account.user_id == user_id).offset(skip).limit(limit)
        result = await session.exec(statement)
        return result.all()

    async def create(self, session: AsyncSession, *, obj_in: AccountCreate, user_id: uuid.UUID) -> Account:
        db_obj = Account.model_validate(obj_in, update={"user_id": user_id})
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return db_obj

    async def update(
        self, session: AsyncSession, *, db_obj: Account, obj_in: AccountUpdate | dict
    ) -> Account:
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

    async def remove(self, session: AsyncSession, *, id: uuid.UUID) -> Optional[Account]:
        obj = await session.get(Account, id)
        if obj:
            await session.delete(obj)
            await session.commit()
        return obj

account = CRUDAccount()
