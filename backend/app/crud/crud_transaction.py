from typing import List, Optional
import uuid
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.transaction import Transaction, TransactionCreate, TransactionUpdate
from app.models.transaction_split import TransactionSplit

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
        # Separate splits from transaction data
        splits_in = obj_in.splits
        
        # Create transaction
        # Exclude splits from the initial creation to avoid relationship type mismatch errors
        # (Transaction expects List[TransactionSplit], but obj_in has List[TransactionSplitCreate])
        transaction_data = obj_in.model_dump(exclude={"splits"})
        db_obj = Transaction.model_validate(transaction_data, update={"user_id": user_id})
        
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)

        # Create splits
        if splits_in:
            for split in splits_in:
                db_split = TransactionSplit(
                    transaction_id=db_obj.id,
                    category=split.category,
                    amount=split.amount,
                    note=split.note
                )
                session.add(db_split)
            await session.commit()
            await session.refresh(db_obj) # Refresh to load splits relationship

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
