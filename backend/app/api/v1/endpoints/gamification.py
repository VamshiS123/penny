from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api import deps
from app.core.users import current_active_user
from app.models.gamification import Achievement, ShopItem, UserAchievement, UserItem
from app.models.user import User

router = APIRouter()

# --- Achievements ---
@router.get("/achievements", response_model=List[Achievement])
async def read_achievements(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> List[Achievement]:
    statement = select(Achievement).offset(skip).limit(limit)
    result = await db.exec(statement)
    return result.all()

@router.post("/achievements/seed", response_model=List[Achievement])
async def seed_achievements(
    db: AsyncSession = Depends(deps.get_db),
) -> List[Achievement]:
    # Basic seed for demo
    existing = await db.exec(select(Achievement))
    if existing.first():
        return []
        
    achievements = [
        Achievement(name="First Steps", description="Complete onboarding", icon="Egg", xp_reward=50),
        Achievement(name="Week Warrior", description="7 day streak", icon="Flame", xp_reward=100),
        Achievement(name="First $100", description="Save your first $100", icon="Coins", xp_reward=150),
    ]
    for a in achievements:
        db.add(a)
    await db.commit()
    return achievements

@router.post("/achievements/{id}/unlock")
async def unlock_achievement(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: uuid.UUID,
    current_user: User = Depends(current_active_user),
) -> Any:
    # Check if exists
    achievement = await db.get(Achievement, id)
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
        
    # Check if already unlocked
    link = await db.get(UserAchievement, (current_user.id, id))
    if link:
        return {"message": "Already unlocked"}
        
    user_achievement = UserAchievement(user_id=current_user.id, achievement_id=id)
    db.add(user_achievement)
    
    # Add XP
    current_user.xp += achievement.xp_reward
    db.add(current_user)
    
    await db.commit()
    return {"message": "Unlocked", "xp_gained": achievement.xp_reward}

# --- Shop ---
@router.get("/shop", response_model=List[ShopItem])
async def read_shop_items(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> List[ShopItem]:
    statement = select(ShopItem).offset(skip).limit(limit)
    result = await db.exec(statement)
    return result.all()

@router.post("/shop/seed", response_model=List[ShopItem])
async def seed_shop(
    db: AsyncSession = Depends(deps.get_db),
) -> List[ShopItem]:
    existing = await db.exec(select(ShopItem))
    if existing.first():
        return []
        
    items_data = [
      # Outfits
      { "name": "Red Bowtie", "category": "outfit", "description": "A classic red look", "price": 50, "rarity": "common" },
      { "name": "Gold Bowtie", "category": "outfit", "description": "Shiny and elegant", "price": 150, "rarity": "rare" },
      { "name": "Top Hat", "category": "outfit", "description": "Fancy penguin vibes", "price": 100, "rarity": "common" },
      { "name": "Royal Crown", "category": "outfit", "description": "For the budget royalty", "price": 500, "rarity": "legendary" },
      { "name": "Cool Glasses", "category": "outfit", "description": "Stay cool", "price": 75, "rarity": "common" },
      { "name": "Cozy Scarf", "category": "outfit", "description": "Winter ready", "price": 80, "rarity": "common" },
      
      # Themes
      { "name": "Ocean Blue", "category": "theme", "description": "Calm and serene", "price": 200, "rarity": "common" },
      { "name": "Sunset Coral", "category": "theme", "description": "Warm and inviting", "price": 200, "rarity": "common" },
      { "name": "Midnight Dark", "category": "theme", "description": "Easy on the eyes", "price": 200, "rarity": "common" },
      { "name": "Forest Green", "category": "theme", "description": "Nature inspired", "price": 200, "rarity": "common" },
      { "name": "Gold Premium", "category": "theme", "description": "Luxurious feel", "price": 1000, "rarity": "legendary" },
      
      # Expressions
      { "name": "Dancing Penny", "category": "expression", "description": "Celebrate savings!", "price": 300, "rarity": "rare" },
      { "name": "Sleeping Penny", "category": "expression", "description": "Passive income mode", "price": 250, "rarity": "rare" },
      { "name": "Superhero Penny", "category": "expression", "description": "Budget hero!", "price": 400, "rarity": "rare" },
      { "name": "Ninja Penny", "category": "expression", "description": "Stealthy savings", "price": 350, "rarity": "rare" },
      
      # Widgets
      { "name": "Advanced Analytics", "category": "widget", "description": "Deep dive into your data", "price": 500, "rarity": "rare" },
      { "name": "Investment Tracker", "category": "widget", "description": "Track your portfolio", "price": 600, "rarity": "rare" },
      { "name": "Net Worth Timeline", "category": "widget", "description": "See your wealth grow", "price": 400, "rarity": "rare" },
      
      # Streak shields
      { "name": "Streak Freeze x1", "category": "streak", "description": "Protect one missed day", "price": 50, "rarity": "common" },
      { "name": "Streak Freeze x3", "category": "streak", "description": "Pack of three", "price": 120, "rarity": "common" },
    ]
    
    items = [ShopItem(**item) for item in items_data]
    for i in items:
        db.add(i)
    await db.commit()
    return items

@router.post("/shop/{id}/purchase")
async def purchase_item(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: uuid.UUID,
    current_user: User = Depends(current_active_user),
) -> Any:
    item = await db.get(ShopItem, id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    link = await db.get(UserItem, (current_user.id, id))
    if link:
        return {"message": "Already owned"}
        
    if current_user.coins < item.price:
        raise HTTPException(status_code=400, detail="Not enough coins")
        
    current_user.coins -= item.price
    user_item = UserItem(user_id=current_user.id, item_id=id, is_equipped=False)
    
    db.add(current_user)
    db.add(user_item)
    await db.commit()
    
    return {"message": "Purchased", "remaining_coins": current_user.coins}

@router.post("/shop/{id}/equip")
async def equip_item(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: uuid.UUID,
    current_user: User = Depends(current_active_user),
) -> Any:
    # Check if user owns the item
    user_item = await db.get(UserItem, (current_user.id, id))
    if not user_item:
        raise HTTPException(status_code=400, detail="Item not owned")
        
    # Get the item details to know the category
    item = await db.get(ShopItem, id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found") # Should not happen if foreign key holds
        
    # Unequip other items in the same category
    # Find all user items for this user
    statement = select(UserItem, ShopItem).join(ShopItem).where(
        UserItem.user_id == current_user.id,
        ShopItem.category == item.category,
        UserItem.is_equipped == True
    )
    results = await db.exec(statement)
    
    for u_item, _ in results:
        u_item.is_equipped = False
        db.add(u_item)
        
    # Equip the new item
    user_item.is_equipped = True
    db.add(user_item)
    
    await db.commit()
    
    return {"message": "Equipped"}
