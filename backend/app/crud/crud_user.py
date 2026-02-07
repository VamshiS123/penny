from typing import Optional
import uuid
from sqlalchemy.future import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.user import User, UserCreate, UserUpdate

class CRUDUser:
    async def get(self, session: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
        return await session.get(User, user_id)

    async def get_by_email(self, session: AsyncSession, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email)
        result = await session.exec(statement)
        return result.first()

    async def update(self, session: AsyncSession, *, db_obj: User, obj_in: UserUpdate | dict) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(db_obj, key, value)
            
        session.add(db_obj)
        await session.flush()
        return db_obj

user = CRUDUser()
