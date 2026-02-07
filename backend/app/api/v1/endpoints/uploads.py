import csv
import io
from typing import Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_db
from app.core.users import current_active_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.account import Account, AccountCreate
from app.crud import transaction as crud_transaction
from app.crud import account as crud_account

router = APIRouter()

@router.post("/csv")
async def upload_csv(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(current_active_user),
    file: UploadFile = File(...),
) -> Any:
    """
    Upload and parse financial CSV data.
    Expected columns: Date, Merchant, Category, Amount, Account, Type
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    contents = await file.read()
    decoded = contents.decode("utf-8")
    io_string = io.StringIO(decoded)
    reader = csv.DictReader(io_string)

    user_id = current_user.id

    # 0. Reset existing data for a clean slate
    from sqlmodel import select, delete
    from app.models.expense import Expense
    
    await db.exec(delete(Transaction).where(Transaction.user_id == user_id))
    await db.exec(delete(Account).where(Account.user_id == user_id))
    await db.exec(delete(Expense).where(Expense.user_id == user_id))
    await db.flush()

    # Pre-fetch (will be empty now, but keeping structure for clarity or if we partially reset)
    accounts_found = {} 

    transactions_created = 0

    for row in reader:
        try:
            # 1. Handle Account
            account_name = row.get("Account", "Default")
            if account_name not in accounts_found:
                # Create account manually without committing
                acc = Account(
                    name=account_name,
                    user_id=user_id,
                    type="checking",
                    balance=0.0,
                    color="bg-blue-500",
                    initial=account_name[0].upper()
                )
                db.add(acc)
                accounts_found[account_name] = acc
            
            acc = accounts_found[account_name]

            # 2. Handle Transaction
            date_str = row.get("Date")
            merchant = row.get("Merchant")
            category = row.get("Category")
            amount_val = float(row.get("Amount", 0))
            trans_type = row.get("Type", "expense").lower()

            # Adjust amount sign if needed
            if trans_type == "expense" and amount_val > 0:
                amount_val = -amount_val
            elif trans_type == "income" and amount_val < 0:
                amount_val = abs(amount_val)

            # Update account balance (this stays in session memory)
            acc.balance += amount_val

            # Try to parse date
            try:
                date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            except:
                date_obj = datetime.utcnow()

            # Simple icon mapping
            icon_name = category
            cat_lower = category.lower()
            if "food" in cat_lower or "dining" in cat_lower or "chipotle" in cat_lower or "starbucks" in cat_lower:
                icon_name = "Pizza"
            elif "rent" in cat_lower or "housing" in cat_lower:
                icon_name = "Home"
            elif "transport" in cat_lower or "uber" in cat_lower or "gas" in cat_lower:
                icon_name = "Car"
            elif "sub" in cat_lower or "netflix" in cat_lower or "spotify" in cat_lower:
                icon_name = "RefreshCw"
            elif "shop" in cat_lower or "amazon" in cat_lower:
                icon_name = "ShoppingBag"

            new_trans = Transaction(
                user_id=user_id,
                merchant=merchant,
                category=category,
                amount=amount_val,
                date=date_obj,
                icon=icon_name
            )
            db.add(new_trans)
            transactions_created += 1

        except Exception as e:
            print(f"Skipping row due to error: {e}")
            continue

    await db.commit()

    # 3. Detect and seed recurring expenses automatically for the user
    # Logic: Any merchant appearing in multiple months or explicitly tagged as Housing/Utilities
    from sqlalchemy import func
    statement = select(Transaction.merchant, Transaction.category, func.avg(func.abs(Transaction.amount)).label("avg_amount")) \
        .where(Transaction.user_id == user_id, Transaction.amount < 0) \
        .group_by(Transaction.merchant, Transaction.category) \
        .having(func.count(Transaction.id) >= 1) # Simplified for demo: any merchant becomes a category
    
    result = await db.exec(statement)
    for merchant, category, avg_amount in result.all():
        # Seed top categories as fixed/flexible expenses
        cat_lower = category.lower()
        is_fixed = any(x in cat_lower for x in ["housing", "rent", "utilities", "sub", "insurance", "gym"])
        
        # Only add significant or known recurring ones
        if is_fixed or avg_amount > 50:
            db.add(Expense(
                user_id=user_id,
                category=category,
                name=merchant,
                amount=float(avg_amount),
                is_fixed=is_fixed,
                icon="RefreshCw" if is_fixed else "Pizza"
            ))
    
    await db.commit()
    return {"message": f"Successfully processed {transactions_created} transactions"}
