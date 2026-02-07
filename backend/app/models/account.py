from typing import Optional, TYPE_CHECKING
import uuid
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User

class AccountBase(SQLModel):
    name: str
    type: str # 'checking', 'savings', 'credit', 'investment'
    balance: float
    color: str # 'bg-blue-500' etc.
    initial: str # 'C' for Chase

class Account(AccountBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    
    user: "User" = Relationship(back_populates="accounts")

class AccountCreate(AccountBase):
    pass

class AccountUpdate(SQLModel):
    name: Optional[str] = None
    type: Optional[str] = None
    balance: Optional[float] = None
    color: Optional[str] = None
    initial: Optional[str] = None
