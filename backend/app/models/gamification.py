from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User

# --- Achievements ---
class AchievementBase(SQLModel):
    name: str
    description: str
    icon: str
    xp_reward: int

class Achievement(AchievementBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    user_links: List["UserAchievement"] = Relationship(back_populates="achievement")

class UserAchievement(SQLModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    achievement_id: uuid.UUID = Field(foreign_key="achievement.id", primary_key=True)
    unlocked_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: "User" = Relationship(back_populates="achievements")
    achievement: "Achievement" = Relationship(back_populates="user_links")

# --- Shop Items ---
class ShopItemBase(SQLModel):
    name: str
    category: str # 'outfit', 'theme', etc.
    description: str
    price: int
    rarity: str # 'common', 'rare', 'legendary'
    preview: Optional[str] = None

class ShopItem(ShopItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    user_links: List["UserItem"] = Relationship(back_populates="item")

class UserItem(SQLModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    item_id: uuid.UUID = Field(foreign_key="shopitem.id", primary_key=True)
    is_equipped: bool = Field(default=False)
    
    user: "User" = Relationship(back_populates="items")
    item: "ShopItem" = Relationship(back_populates="user_links")
