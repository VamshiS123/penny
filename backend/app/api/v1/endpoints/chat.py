from typing import Any, List, Optional
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from langchain_openai import ChatOpenAI
from langchain_classic.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from pydantic import BaseModel

from app.api.deps import get_db
from app.core.config import Config
from app.core.users import current_active_user
from app.models.user import User
from app.models.transaction import Transaction, TransactionCreate, TransactionUpdate
from app.models.account import Account, AccountCreate, AccountUpdate
from app.models.expense import Expense, ExpenseCreate, ExpenseUpdate
from app.models.goal import Goal, GoalCreate, GoalUpdate
from app.models.gamification import Achievement, UserAchievement

from app.crud.crud_transaction import transaction as crud_transaction
from app.crud.crud_account import account as crud_account
from app.crud.crud_expense import expense as crud_expense
from app.crud.crud_goal import goal as crud_goal

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []

class ChatResponse(BaseModel):
    response: str

def create_financial_tools(db: AsyncSession, user_id: uuid.UUID):
    # --- UTILITY ---
    @tool
    async def get_current_time() -> str:
        """Get the current date and time. Useful for relative date queries (e.g., 'this month')."""
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # --- TRANSACTIONS ---
    @tool
    async def get_transactions(limit: int = 10, category: str = None, merchant: str = None) -> str:
        """
        Fetch transactions for the user. 
        Optional filters: category (e.g. 'Food'), merchant (e.g. 'Amazon').
        Output includes the ID for each transaction, which is needed for updates/deletes.
        """
        statement = select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.date.desc())
        if category:
            statement = statement.where(Transaction.category.ilike(f"%{category}%"))
        if merchant:
            statement = statement.where(Transaction.merchant.ilike(f"%{merchant}%"))
        
        statement = statement.limit(limit)
        result = await db.exec(statement)
        transactions = result.all()
        
        if not transactions:
            return "No transactions found with the given criteria."
        return "\n".join([f"- ID: {t.id} | {t.date.strftime('%Y-%m-%d')}: {t.merchant} (${t.amount}) - {t.category}" for t in transactions])

    @tool
    async def add_transaction(merchant: str, amount: float, category: str, date: str = None, icon: str = "DollarSign") -> str:
        """
        Add a new transaction.
        Date should be 'YYYY-MM-DD'. If omitted, defaults to today.
        """
        try:
            dt = datetime.strptime(date, "%Y-%m-%d") if date else datetime.utcnow()
            obj_in = TransactionCreate(merchant=merchant, amount=amount, category=category, date=dt, icon=icon)
            t = await crud_transaction.create(db, obj_in=obj_in, user_id=user_id)
            return f"Successfully added transaction: {t.merchant} (${t.amount}) on {t.date.strftime('%Y-%m-%d')}."
        except Exception as e:
            return f"Failed to add transaction: {str(e)}"

    @tool
    async def update_transaction(transaction_id: str, merchant: str = None, amount: float = None, category: str = None) -> str:
        """
        Update an existing transaction using its ID.
        Only provide fields you want to update.
        """
        try:
            t_id = uuid.UUID(transaction_id)
            transaction = await crud_transaction.get(db, id=t_id)
            if not transaction or transaction.user_id != user_id:
                return "Transaction not found."
            
            update_data = {}
            if merchant: update_data["merchant"] = merchant
            if amount: update_data["amount"] = amount
            if category: update_data["category"] = category
            
            obj_in = TransactionUpdate(**update_data)
            await crud_transaction.update(db, db_obj=transaction, obj_in=obj_in)
            return "Transaction updated successfully."
        except ValueError:
            return "Invalid ID format."
        except Exception as e:
            return f"Failed to update transaction: {str(e)}"

    @tool
    async def delete_transaction(transaction_id: str) -> str:
        """Delete a transaction by its ID."""
        try:
            t_id = uuid.UUID(transaction_id)
            # Verify ownership first
            t = await crud_transaction.get(db, id=t_id)
            if not t or t.user_id != user_id:
                return "Transaction not found."
            
            await crud_transaction.remove(db, id=t_id)
            return "Transaction deleted successfully."
        except ValueError:
            return "Invalid ID format."
        except Exception as e:
            return f"Failed to delete transaction: {str(e)}"

    @tool
    async def get_spending_summary(days: int = 30) -> str:
        """Get a summary of spending by category over the last N days."""
        from datetime import timedelta
        since_date = datetime.utcnow() - timedelta(days=days)
        
        statement = (
            select(Transaction.category, func.sum(Transaction.amount).label("total"))
            .where(Transaction.user_id == user_id)
            .where(Transaction.date >= since_date)
            .group_by(Transaction.category)
        )
        result = await db.exec(statement)
        rows = result.all()
        
        if not rows:
            return f"No spending data found for the last {days} days."
        
        summary = [f"**Spending Summary (last {days} days):**\n"]
        total_all = 0
        for category, total in rows:
            summary.append(f"* **{category}:** ${total:.2f}")
            total_all += total
        summary.append(f"\n**Total Spending:** ${total_all:.2f}")
        return "\n".join(summary)

    # --- ACCOUNTS ---
    @tool
    async def get_accounts() -> str:
        """Fetch the user's bank accounts, balances, and IDs."""
        accounts = await crud_account.get_multi_by_user(db, user_id=user_id)
        if not accounts:
            return "No accounts found."
        return "\n".join([f"- ID: {a.id} | {a.name} ({a.type}): ${a.balance}" for a in accounts])

    @tool
    async def add_account(name: str, type: str, balance: float, initial: str = "B", color: str = "bg-blue-500") -> str:
        """
        Add a new bank account.
        Type examples: 'checking', 'savings', 'credit'.
        """
        try:
            obj_in = AccountCreate(name=name, type=type, balance=balance, initial=initial, color=color)
            a = await crud_account.create(db, obj_in=obj_in, user_id=user_id)
            return f"Successfully created account '{a.name}' with balance ${a.balance}."
        except Exception as e:
            return f"Failed to create account: {str(e)}"

    @tool
    async def update_account(account_id: str, name: str = None, balance: float = None) -> str:
        """Update an account's name or balance using its ID."""
        try:
            a_id = uuid.UUID(account_id)
            account = await crud_account.get(db, id=a_id)
            if not account or account.user_id != user_id:
                return "Account not found."
            
            update_data = {}
            if name: update_data["name"] = name
            if balance is not None: update_data["balance"] = balance
            
            obj_in = AccountUpdate(**update_data)
            await crud_account.update(db, db_obj=account, obj_in=obj_in)
            return "Account updated successfully."
        except ValueError:
            return "Invalid ID format."
        except Exception as e:
            return f"Failed to update account: {str(e)}"

    @tool
    async def delete_account(account_id: str) -> str:
        """Delete an account by its ID."""
        try:
            a_id = uuid.UUID(account_id)
            a = await crud_account.get(db, id=a_id)
            if not a or a.user_id != user_id:
                return "Account not found."
            await crud_account.remove(db, id=a_id)
            return "Account deleted successfully."
        except ValueError:
            return "Invalid ID format."
        except Exception as e:
            return f"Failed to delete account: {str(e)}"

    # --- EXPENSES (Recurring) ---
    @tool
    async def get_expenses() -> str:
        """Fetch the user's monthly recurring expenses and IDs."""
        expenses = await crud_expense.get_multi_by_user(db, user_id=user_id)
        if not expenses:
            return "No expenses found."
        return "\n".join([f"- ID: {e.id} | {e.name} ({e.category}): ${e.amount} ({'Fixed' if e.is_fixed else 'Variable'})" for e in expenses])

    @tool
    async def add_recurring_expense(name: str, amount: float, category: str, is_fixed: bool = True, icon: str = "Bill") -> str:
        """Add a new monthly recurring expense."""
        try:
            obj_in = ExpenseCreate(name=name, amount=amount, category=category, is_fixed=is_fixed, icon=icon)
            e = await crud_expense.create(db, obj_in=obj_in, user_id=user_id)
            return f"Successfully added expense '{e.name}' of ${e.amount}."
        except Exception as e:
            return f"Failed to add expense: {str(e)}"

    @tool
    async def delete_recurring_expense(expense_id: str) -> str:
        """Delete a recurring expense by its ID."""
        try:
            e_id = uuid.UUID(expense_id)
            e = await crud_expense.get(db, id=e_id)
            if not e or e.user_id != user_id:
                return "Expense not found."
            await crud_expense.remove(db, id=e_id)
            return "Expense deleted successfully."
        except ValueError:
            return "Invalid ID format."
        except Exception as e:
            return f"Failed to delete expense: {str(e)}"

    # --- GOALS ---
    @tool
    async def get_goals() -> str:
        """Fetch the user's financial goals, progress, and IDs."""
        goals = await crud_goal.get_multi_by_user(db, user_id=user_id)
        if not goals:
            return "No goals found."
        return "\n".join([f"- ID: {g.id} | {g.name}: target ${g.target_amount}, saved ${g.saved_amount} ({g.description})" for g in goals])

    @tool
    async def create_financial_goal(name: str, description: str, target_amount: float, icon: str = "Target") -> str:
        """Create a new financial goal."""
        try:
            goal_in = GoalCreate(name=name, description=description, target_amount=target_amount, saved_amount=0.0, icon=icon)
            await crud_goal.create(db, obj_in=goal_in, user_id=user_id)
            return f"Successfully created goal '{name}' with a target of ${target_amount}."
        except Exception as e:
            return f"Failed to create goal: {str(e)}"

    @tool
    async def update_goal(goal_id: str, saved_amount: float = None, target_amount: float = None) -> str:
        """Update a goal's saved amount or target amount using its ID."""
        try:
            g_id = uuid.UUID(goal_id)
            goal = await crud_goal.get(db, id=g_id)
            if not goal or goal.user_id != user_id:
                return "Goal not found."
            
            update_data = {}
            if saved_amount is not None: update_data["saved_amount"] = saved_amount
            if target_amount is not None: update_data["target_amount"] = target_amount
            
            obj_in = GoalUpdate(**update_data)
            await crud_goal.update(db, db_obj=goal, obj_in=obj_in)
            return "Goal updated successfully."
        except ValueError:
            return "Invalid ID format."
        except Exception as e:
            return f"Failed to update goal: {str(e)}"

    @tool
    async def delete_goal(goal_id: str) -> str:
        """Delete a financial goal by its ID."""
        try:
            g_id = uuid.UUID(goal_id)
            g = await crud_goal.get(db, id=g_id)
            if not g or g.user_id != user_id:
                return "Goal not found."
            await crud_goal.remove(db, id=g_id)
            return "Goal deleted successfully."
        except ValueError:
            return "Invalid ID format."
        except Exception as e:
            return f"Failed to delete goal: {str(e)}"

    # --- GAMIFICATION ---
    @tool
    async def get_achievements() -> str:
        """Get a list of achievements the user has unlocked."""
        statement = select(Achievement, UserAchievement).join(UserAchievement).where(UserAchievement.user_id == user_id)
        result = await db.exec(statement)
        rows = result.all()
        
        if not rows:
            return "No achievements unlocked yet."
        
        return "\n".join([f"- {a.name}: {a.description} (Unlocked: {ua.unlocked_at.strftime('%Y-%m-%d')})" for a, ua in rows])

    @tool
    async def get_xp_level() -> str:
        """Get the user's current XP and Level."""
        u = await db.get(User, user_id)
        return f"Level: {u.level} | XP: {u.xp}"

    @tool
    async def get_financial_advice_categories() -> str:
        """Get a list of topics Penny can provide advice on."""
        return "Budgeting, Saving, Debt Reduction, Investing Basics, Subscription Management."

    return [
        get_current_time,
        get_transactions, add_transaction, update_transaction, delete_transaction, get_spending_summary,
        get_accounts, add_account, update_account, delete_account,
        get_expenses, add_recurring_expense, delete_recurring_expense,
        get_goals, create_financial_goal, update_goal, delete_goal,
        get_achievements, get_xp_level,
        get_financial_advice_categories
    ]

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user)
):
    if not Config.OPENROUTER_API_KEY:
        return ChatResponse(response="I'm sorry, but the OpenRouter API key is not configured. I cannot assist you at the moment.")

    llm = ChatOpenAI(
        model="google/gemini-2.5-flash",
        api_key=Config.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
        model_kwargs={"stop": ["\nHuman:", "\nUser:"]},
        default_headers={
            "HTTP-Referer": "https://penny.app", 
            "X-Title": "Penny AI", 
        }
    )

    tools = create_financial_tools(db, user.id)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are Penny, a helpful and friendly financial assistant mascot. "
                   "You help users manage their finances by providing insights into their transactions, accounts, expenses, and goals. "
                   "Be encouraging and use a friendly tone. "
                   "Use the provided tools to fetch, create, update, or delete real data about the user's finances when asked. "
                   "IMPORTANT: When updating or deleting items, you often need the ID. If you don't have the ID, use the 'get_' tools to list items and find the ID first. "
                   "IMPORTANT: Do not impersonate the user or predict their next message. Only provide your own response as Penny."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    # Convert history to LangChain format
    chat_history = []
    for msg in request.history:
        role = msg.get("role")
        content = msg.get("content")
        if role == "user":
            chat_history.append(("human", content))
        elif role == "assistant":
            chat_history.append(("ai", content))

    try:
        result = await agent_executor.ainvoke({
            "input": request.message,
            "chat_history": chat_history
        })
        return ChatResponse(response=result["output"])
    except Exception as e:
        print(f"Error in agent: {e}")
        return ChatResponse(response="I encountered an error while processing your request. Please try again later.")