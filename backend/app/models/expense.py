from typing import Optional, TYPE_CHECKING
import uuid
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User

class ExpenseBase(SQLModel):
    category: str
    name: str
    amount: float
    is_fixed: bool = Field(default=True)
    icon: str # String identifier for the icon

class Expense(ExpenseBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    
    user: "User" = Relationship(back_populates="expenses")

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(SQLModel):
    category: Optional[str] = None
    name: Optional[str] = None
    amount: Optional[float] = None
    is_fixed: Optional[bool] = None
    icon: Optional[str] = None
