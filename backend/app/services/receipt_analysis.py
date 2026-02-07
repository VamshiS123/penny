import base64
import json
from typing import List, Optional
from datetime import datetime

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field

from app.core.config import Config

class ReceiptItem(BaseModel):
    merchant: str = Field(description="The name of the store or merchant")
    category: str = Field(description="Category of the item (Food & Drink, Shopping, Transport, Entertainment, Groceries, Health, Utilities, Income)")
    amount: float = Field(description="The price of the item")
    date: str = Field(description="The date of purchase in YYYY-MM-DD format")
    item_name: str = Field(description="The name of the item purchased")

class ReceiptSplit(BaseModel):
    category: str
    amount: float
    items: List[str] = Field(default_factory=list, description="Names of items in this category")

class ReceiptAnalysisResult(BaseModel):
    items: List[ReceiptItem] = Field(description="List of items extracted from the receipt")

class ReceiptAnalysisResponse(BaseModel):
    merchant: str
    date: str
    total_amount: float
    splits: List[ReceiptSplit]
    raw_items: List[ReceiptItem]

async def analyze_receipt_image(image_bytes: bytes) -> ReceiptAnalysisResponse:
    if not Config.OPENROUTER_API_KEY:
        raise Exception("OpenRouter API key not configured")

    # Encode image to base64
    base64_image = base64.b64encode(image_bytes).decode('utf-8')

    llm = ChatOpenAI(
        model="google/gemini-2.5-flash",
        api_key=Config.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
        default_headers={
            "HTTP-Referer": "https://penny.app", 
            "X-Title": "Penny AI", 
        }
    )

    structured_llm = llm.with_structured_output(ReceiptAnalysisResult)

    prompt = """
    Analyze this receipt image. Extract all purchased items.
    
    For each item, identify:
    - The merchant name (usually at the top).
    - The item name.
    - The price/amount.
    - The date of the receipt (format YYYY-MM-DD). If not visible, use today's date.
    - A category from: Food & Drink, Shopping, Transport, Entertainment, Groceries, Health, Utilities.
    
    Do not include tax or subtotal lines as separate items.
    If multiple items are from the same merchant, list them as separate entries with the same merchant name.
    """

    message = HumanMessage(
        content=[
            {"type": "text", "text": prompt},
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
            },
        ]
    )

    try:
        # returns the Pydantic object directly
        result: ReceiptAnalysisResult = await structured_llm.ainvoke([message])
        items = result.items
        
        if not items:
            return ReceiptAnalysisResponse(
                merchant="Unknown",
                date=datetime.now().strftime("%Y-%m-%d"),
                total_amount=0.0,
                splits=[],
                raw_items=[]
            )

        # Aggregate for summary
        merchant = items[0].merchant # Assume single merchant for receipt
        date = items[0].date
        total_amount = sum(item.amount for item in items)
        
        splits_map = {}
        for item in items:
            if item.category not in splits_map:
                splits_map[item.category] = {"amount": 0.0, "items": []}
            splits_map[item.category]["amount"] += item.amount
            splits_map[item.category]["items"].append(item.item_name)
            
        splits = [
            ReceiptSplit(category=cat, amount=data["amount"], items=data["items"])
            for cat, data in splits_map.items()
        ]

        return ReceiptAnalysisResponse(
            merchant=merchant,
            date=date,
            total_amount=total_amount,
            splits=splits,
            raw_items=items
        )
        
    except Exception as e:
        print(f"Error analyzing receipt: {e}")
        raise e