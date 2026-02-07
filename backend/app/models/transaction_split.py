import uuid
from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .transaction import Transaction

class TransactionSplitBase(SQLModel):
    category: str
    amount: float
    note: str | None = None

class TransactionSplit(TransactionSplitBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    transaction_id: uuid.UUID = Field(foreign_key="transaction.id", ondelete="CASCADE")
    
    transaction: "Transaction" = Relationship(back_populates="splits")

class TransactionSplitCreate(TransactionSplitBase):
    pass
