from fastapi import APIRouter

from app.api.v1.endpoints import users, expenses, goals, transactions, gamification, accounts, uploads, chat
from app.core.users import auth_backend, fastapi_users
from app.models.user import UserRead, UserCreate

api_router = APIRouter()

api_router.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)
api_router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["gamification"])
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
