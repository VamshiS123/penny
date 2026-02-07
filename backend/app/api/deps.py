from typing import AsyncGenerator
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.db import get_session

# Primary DB session dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_session():
        yield session