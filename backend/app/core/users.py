import uuid
from typing import Optional

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.user import User
from app.models.expense import Expense
from app.api.deps import get_db

SECRET = "SUPER_SECRET_KEY_FOR_JWT_AUTHENTICATION_PENNY_APP_2026" # Ideally from config

async def get_user_db(session: AsyncSession = Depends(get_db)):
    yield SQLAlchemyUserDatabase(session, User)

class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered. Seeding default expenses.")
        async for session in get_db():
            default_expenses = [
                Expense(user_id=user.id, category="Housing", name="Rent/Mortgage", amount=1500.0, is_fixed=True, icon="Home"),
                Expense(user_id=user.id, category="Utilities", name="Utilities", amount=200.0, is_fixed=True, icon="Zap"),
                Expense(user_id=user.id, category="Food", name="Groceries/Dining", amount=500.0, is_fixed=False, icon="Pizza"),
                Expense(user_id=user.id, category="Transportation", name="Gas/Transport", amount=200.0, is_fixed=False, icon="Car"),
                Expense(user_id=user.id, category="Subscriptions", name="Monthly Subscriptions", amount=100.0, is_fixed=True, icon="RefreshCw"),
            ]
            for exp in default_expenses:
                session.add(exp)
            await session.commit()
            break # Only need one session

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend],
)

current_active_user = fastapi_users.current_user(active=True)
