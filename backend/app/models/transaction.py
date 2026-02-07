from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
import uuid
from sqlmodel import Field, Relationship, SQLModel
from pydantic import validator

if TYPE_CHECKING:
    from .user import User
    from .transaction_split import TransactionSplit

class TransactionBase(SQLModel):
    merchant: str
    category: str
    amount: float
    date: datetime = Field(default_factory=datetime.utcnow)
    icon: str

    @validator("date", pre=True)
    def ensure_naive_datetime(cls, v):
        if isinstance(v, str):
            try:
                # Handle ISO format from frontend (e.g. 2026-02-07T17:10:40.000Z)
                v = v.replace("Z", "+00:00")
                dt = datetime.fromisoformat(v)
                if dt.tzinfo:
                    return dt.astimezone(timezone.utc).replace(tzinfo=None)
                return dt
            except ValueError:
                return v
        if isinstance(v, datetime) and v.tzinfo is not None:
            return v.astimezone(timezone.utc).replace(tzinfo=None)
        return v

class Transaction(TransactionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    
    user: "User" = Relationship(back_populates="transactions")
    splits: List["TransactionSplit"] = Relationship(back_populates="transaction", sa_relationship_kwargs={"cascade": "all, delete"})

# Need to import this late or use forward ref for Pydantic if defined in same file? 
# Better to define a Pydantic model for input that includes splits.
from .transaction_split import TransactionSplitCreate, TransactionSplit

class TransactionCreate(TransactionBase):
    splits: List[TransactionSplitCreate] = []

class TransactionUpdate(SQLModel):
    merchant: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[datetime] = None
    icon: Optional[str] = None
