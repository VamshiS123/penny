#!/usr/bin/env python3
"""Script to clear and reseed shop items"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import select
from app.core.db import async_session_maker
from app.models.gamification import ShopItem

async def reseed_shop():
    async with async_session_maker() as session:
        # Clear all existing items
        existing_items_result = await session.exec(select(ShopItem))
        existing_items = existing_items_result.all()
        count = len(existing_items)
        
        for item in existing_items:
            await session.delete(item)
        
        await session.commit()
        print(f"Deleted {count} existing shop items")
        
        # Seed fresh items
        items_data = [
            # Outfits
            {"name": "Baseball Cap", "category": "outfit", "description": "A classic casual look", "price": 50, "rarity": "common"},
            {"name": "Gold Bowtie", "category": "outfit", "description": "Shiny and elegant", "price": 150, "rarity": "rare"},
            {"name": "Top Hat", "category": "outfit", "description": "Fancy penguin vibes", "price": 100, "rarity": "common"},
            {"name": "Royal Crown", "category": "outfit", "description": "For the budget royalty", "price": 500, "rarity": "legendary"},
            {"name": "Cool Glasses", "category": "outfit", "description": "Stay cool", "price": 75, "rarity": "common"},
            {"name": "Cozy Scarf", "category": "outfit", "description": "Winter ready", "price": 80, "rarity": "common"},
            
            # Themes
            {"name": "Ocean Blue", "category": "theme", "description": "Calm and serene", "price": 200, "rarity": "common"},
            {"name": "Sunset Coral", "category": "theme", "description": "Warm and inviting", "price": 200, "rarity": "common"},
            {"name": "Midnight Dark", "category": "theme", "description": "Easy on the eyes", "price": 200, "rarity": "common"},
            {"name": "Forest Green", "category": "theme", "description": "Nature inspired", "price": 200, "rarity": "common"},
            {"name": "Gold Premium", "category": "theme", "description": "Luxurious feel", "price": 1000, "rarity": "legendary"},
            
            # Expressions
            {"name": "Dancing Penny", "category": "expression", "description": "Celebrate savings!", "price": 300, "rarity": "rare"},
            {"name": "Sleeping Penny", "category": "expression", "description": "Passive income mode", "price": 250, "rarity": "rare"},
            {"name": "Superhero Penny", "category": "expression", "description": "Budget hero!", "price": 400, "rarity": "rare"},
            {"name": "Ninja Penny", "category": "expression", "description": "Stealthy savings", "price": 350, "rarity": "rare"},
            
            # Widgets
            {"name": "Advanced Analytics", "category": "widget", "description": "Deep dive into your data", "price": 500, "rarity": "rare"},
            {"name": "Investment Tracker", "category": "widget", "description": "Track your portfolio", "price": 600, "rarity": "rare"},
            {"name": "Net Worth Timeline", "category": "widget", "description": "See your wealth grow", "price": 400, "rarity": "rare"},
            
            # Streak shields
            {"name": "Streak Freeze x1", "category": "streak", "description": "Protect one missed day", "price": 50, "rarity": "common"},
            {"name": "Streak Freeze x3", "category": "streak", "description": "Pack of three", "price": 120, "rarity": "common"},
        ]
        
        items = [ShopItem(**item) for item in items_data]
        for item in items:
            session.add(item)
        
        await session.commit()
        print(f"Created {len(items)} new shop items")
        print("Reseed complete!")

if __name__ == "__main__":
    asyncio.run(reseed_shop())
