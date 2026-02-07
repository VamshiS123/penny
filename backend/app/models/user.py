from typing import TYPE_CHECKING, Optional, List, Any
import uuid
from sqlmodel import Field, Relationship, SQLModel
from fastapi_users import schemas

if TYPE_CHECKING:
    from .expense import Expense
    from .goal import Goal
    from .transaction import Transaction
    from .gamification import UserAchievement, UserItem
    from .account import Account

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    is_verified: bool = Field(default=False)

    income_type: str = Field(default="salary")
    annual_salary: Optional[float] = Field(default=None)
    pay_frequency: Optional[str] = Field(default="monthly")
    hourly_rate: Optional[float] = Field(default=None)
    hours_per_week: Optional[float] = Field(default=40.0)
    
    age: Optional[int] = Field(default=None)
    city: Optional[str] = Field(default=None)
    household_size: Optional[int] = Field(default=1)
    housing_status: Optional[str] = Field(default="rent")
    
    xp: int = Field(default=0)
    level: int = Field(default=1)
    streak: int = Field(default=0)
    coins: int = Field(default=100)

class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str = Field()
    
    expenses: list["Expense"] = Relationship(back_populates="user")
    goals: list["Goal"] = Relationship(back_populates="user")
    transactions: list["Transaction"] = Relationship(back_populates="user")
    accounts: list["Account"] = Relationship(back_populates="user")
    
    achievements: list["UserAchievement"] = Relationship(back_populates="user")
    items: list["UserItem"] = Relationship(back_populates="user")

    @property
    def monthly_income(self) -> float:
        if self.income_type == "salary" and self.annual_salary:
            return self.annual_salary / 12
        elif self.income_type == "hourly" and self.hourly_rate:
            return self.hourly_rate * (self.hours_per_week or 40) * 4.33
        return 0.0

class UserRead(schemas.BaseUser[uuid.UUID]):
    full_name: Optional[str]
    income_type: str
    annual_salary: Optional[float]
    pay_frequency: Optional[str]
    hourly_rate: Optional[float]
    hours_per_week: Optional[float]
    monthly_income: Optional[float] = 0.0
    age: Optional[int]
    city: Optional[str]
    household_size: Optional[int]
    housing_status: Optional[str]
    xp: int
    level: int
    streak: int
    coins: int
    achievements: List[Any] = []
    items: List[Any] = []

class UserCreate(schemas.BaseUserCreate):
    full_name: Optional[str] = None
    income_type: Optional[str] = "salary"
    annual_salary: Optional[float] = None
    pay_frequency: Optional[str] = "monthly"
    hourly_rate: Optional[float] = None
    hours_per_week: Optional[float] = 40.0
    age: Optional[int] = None
    city: Optional[str] = None
    household_size: Optional[int] = 1
    housing_status: Optional[str] = "rent"
    xp: Optional[int] = 0
    level: Optional[int] = 1
    streak: Optional[int] = 0
    coins: Optional[int] = 100

class UserUpdate(schemas.BaseUserUpdate):
    full_name: Optional[str] = None
    income_type: Optional[str] = None
    annual_salary: Optional[float] = None
    pay_frequency: Optional[str] = None
    hourly_rate: Optional[float] = None
    hours_per_week: Optional[float] = None
    age: Optional[int] = None
    city: Optional[str] = None
    household_size: Optional[int] = None
    housing_status: Optional[str] = None
    xp: Optional[int] = None
    level: Optional[int] = None
    streak: Optional[int] = None
    coins: Optional[int] = None

UserRead.model_rebuild()
