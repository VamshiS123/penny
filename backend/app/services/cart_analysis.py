import base64
from typing import List, Optional
from datetime import datetime

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field

from app.core.config import Config


class CartItem(BaseModel):
    """Individual item from a shopping cart screenshot."""
    merchant: str = Field(description="The name of the store or website (e.g., Amazon, Target, Best Buy)")
    category: str = Field(description="Category of the item: Food & Drink, Shopping, Transport, Entertainment, Groceries, Health, Utilities")
    amount: float = Field(description="The price of the item in dollars")
    item_name: str = Field(description="The name/description of the item")


class CartAnalysisResult(BaseModel):
    """Structured output from cart analysis."""
    items: List[CartItem] = Field(description="List of items extracted from the cart screenshot")
    total_amount: float = Field(description="The total cart amount shown on the page")
    merchant: str = Field(description="The primary merchant/store name")


class CartSplit(BaseModel):
    """Category breakdown for budget tracking."""
    category: str
    amount: float
    items: List[str] = Field(default_factory=list, description="Names of items in this category")


class CartAnalysisResponse(BaseModel):
    """API response for cart analysis."""
    merchant: str
    date: str
    total_amount: float
    time_cost_hours: Optional[float] = None
    splits: List[CartSplit]
    raw_items: List[CartItem]


async def analyze_cart_screenshot(image_bytes: bytes, hourly_rate: Optional[float] = None) -> CartAnalysisResponse:
    """
    Analyze a shopping cart screenshot using vision LLM.
    
    Args:
        image_bytes: The screenshot image data
        hourly_rate: Optional hourly rate for time cost calculation
        
    Returns:
        CartAnalysisResponse with extracted items and totals
    """
    if not Config.OPENROUTER_API_KEY:
        raise Exception("OpenRouter API key not configured")

    # Encode image to base64
    base64_image = base64.b64encode(image_bytes).decode('utf-8')

    llm = ChatOpenAI(
        model="google/gemini-2.5-flash",
        api_key=Config.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
        max_tokens=4096,  # Ensure enough tokens for complete response
        temperature=0.1,  # Lower temperature for more consistent structured output
        default_headers={
            "HTTP-Referer": "https://penny.app", 
            "X-Title": "Penny AI", 
        }
    )

    structured_llm = llm.with_structured_output(CartAnalysisResult)

    prompt = """Analyze this shopping cart screenshot. Extract items being purchased.

For each item provide:
- merchant: The store name (Amazon, Target, Walmart, etc.)
- item_name: Short item description (max 50 chars)
- amount: Price in dollars as a number
- category: One of: Shopping, Groceries, Food & Drink, Entertainment, Health, Utilities, Transport

Also provide:
- total_amount: The cart total shown
- merchant: The store name

Keep item names short. Only include actual products, not taxes or fees."""

    message = HumanMessage(
        content=[
            {"type": "text", "text": prompt},
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{base64_image}"},
            },
        ]
    )

    # Retry logic for handling transient failures
    max_retries = 3
    last_error = None
    
    for attempt in range(max_retries):
        try:
            result: CartAnalysisResult = await structured_llm.ainvoke([message])
            items = result.items
            
            if not items:
                return CartAnalysisResponse(
                    merchant=result.merchant or "Unknown",
                    date=datetime.now().strftime("%Y-%m-%d"),
                    total_amount=result.total_amount or 0.0,
                    time_cost_hours=None,
                    splits=[],
                    raw_items=[]
                )

            # Use the merchant from structured output or first item
            merchant = result.merchant or items[0].merchant
            date = datetime.now().strftime("%Y-%m-%d")
            total_amount = result.total_amount or sum(item.amount for item in items)
            
            # Calculate time cost if hourly rate provided
            time_cost_hours = None
            if hourly_rate and hourly_rate > 0:
                time_cost_hours = round(total_amount / hourly_rate, 1)
            
            # Aggregate by category for splits
            splits_map = {}
            for item in items:
                if item.category not in splits_map:
                    splits_map[item.category] = {"amount": 0.0, "items": []}
                splits_map[item.category]["amount"] += item.amount
                splits_map[item.category]["items"].append(item.item_name)
                
            splits = [
                CartSplit(category=cat, amount=round(data["amount"], 2), items=data["items"])
                for cat, data in splits_map.items()
            ]

            return CartAnalysisResponse(
                merchant=merchant,
                date=date,
                total_amount=round(total_amount, 2),
                time_cost_hours=time_cost_hours,
                splits=splits,
                raw_items=items
            )
            
        except Exception as e:
            last_error = e
            print(f"Cart analysis attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                import asyncio
                await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
                continue
            
    print(f"Error analyzing cart screenshot after {max_retries} attempts: {last_error}")
    raise last_error

