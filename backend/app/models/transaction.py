from typing import Optional, TYPE_CHECKING
from datetime import datetime
import uuid
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User

class TransactionBase(SQLModel):
    merchant: str
    category: str
    amount: float
    date: datetime = Field(default_factory=datetime.utcnow)
    icon: str

class Transaction(TransactionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    
    user: "User" = Relationship(back_populates="transactions")

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(SQLModel):
    merchant: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[datetime] = None
    icon: Optional[str] = None
