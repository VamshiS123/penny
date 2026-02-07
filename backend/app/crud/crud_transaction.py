from typing import List, Optional
import uuid
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.transaction import Transaction, TransactionCreate, TransactionUpdate

class CRUDTransaction:
    async def get(self, session: AsyncSession, id: uuid.UUID) -> Optional[Transaction]:
        return await session.get(Transaction, id)

    async def get_multi_by_user(
        self, session: AsyncSession, user_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Transaction]:
        statement = select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.date.desc()).offset(skip).limit(limit)
        result = await session.exec(statement)
        return result.all()

    async def create(self, session: AsyncSession, *, obj_in: TransactionCreate, user_id: uuid.UUID) -> Transaction:
        db_obj = Transaction.model_validate(obj_in, update={"user_id": user_id})
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return db_obj

    async def update(
        self, session: AsyncSession, *, db_obj: Transaction, obj_in: TransactionUpdate | dict
    ) -> Transaction:
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

    async def remove(self, session: AsyncSession, *, id: uuid.UUID) -> Optional[Transaction]:
        obj = await session.get(Transaction, id)
        if obj:
            await session.delete(obj)
            await session.commit()
        return obj

transaction = CRUDTransaction()
