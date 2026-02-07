from typing import Optional, TYPE_CHECKING
import uuid
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User

class GoalBase(SQLModel):
    name: str
    description: str
    target_amount: float
    saved_amount: float = Field(default=0.0)
    icon: str

class Goal(GoalBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    
    user: "User" = Relationship(back_populates="goals")

class GoalCreate(GoalBase):
    pass

class GoalUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[float] = None
    saved_amount: Optional[float] = None
    icon: Optional[str] = None
