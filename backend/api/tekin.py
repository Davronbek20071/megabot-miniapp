"""
Tekin Obunachi API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from tekin_obunachi_db import (
    get_tekin_balance, add_tekin_balance, deduct_tekin_balance,
    get_tekin_balance_stats, create_tekin_order, get_active_tekin_orders,
    get_user_order_history, claim_daily_bonus, get_active_admin_tasks,
    submit_task_completion, get_user_tekin_stats, get_user_achievements,
    get_recent_activities, PRICES
)
from database import create_payment_request

router = APIRouter()

# Pydantic models
class BalanceResponse(BaseModel):
    balance: int
    total_earned: int
    total_spent: int
    total_withdrawn: int

class OrderCreate(BaseModel):
    order_type: str  # 'subscriber', 'reaction', 'view'
    quantity: int
    target: str  # channel_id or message_link

class TaskSubmission(BaseModel):
    task_id: int
    proof_url: Optional[str] = None

class TopupRequest(BaseModel):
    amount: int
    receipt_photo: str

# ============================================
# BALANCE ENDPOINTS
# ============================================

@router.get("/balance")
async def get_balance(user_id: int):
    """Get user's Tekin Obunachi balance"""
    balance = await get_tekin_balance(user_id)
    stats = await get_tekin_balance_stats(user_id)
    
    return BalanceResponse(
        balance=balance,
        total_earned=stats.get('total_earned', 0),
        total_spent=stats.get('total_spent', 0),
        total_withdrawn=stats.get('total_withdrawn', 0)
    )

@router.get("/stats")
async def get_stats(user_id: int):
    """Get user's Tekin Obunachi statistics"""
    stats = await get_user_tekin_stats(user_id)
    return stats

@router.get("/achievements")
async def get_achievements(user_id: int):
    """Get user's achievements"""
    achievements = await get_user_achievements(user_id)
    return {"achievements": achievements}

@router.get("/activities")
async def get_activities(user_id: int, limit: int = 20):
    """Get user's recent activities"""
    activities = await get_recent_activities(user_id, limit)
    return {"activities": activities}

# ============================================
# EARNING ENDPOINTS
# ============================================

@router.post("/daily-bonus")
async def claim_daily(user_id: int):
    """Claim daily bonus"""
    result = await claim_daily_bonus(user_id)
    if result:
        return {"success": True, "amount": result, "message": "Daily bonus claimed!"}
    else:
        return {"success": False, "message": "Already claimed today"}

@router.get("/tasks")
async def get_tasks(user_id: int):
    """Get available admin tasks"""
    tasks = await get_active_admin_tasks()
    return {"tasks": tasks}

@router.post("/tasks/submit")
async def submit_task(user_id: int, submission: TaskSubmission):
    """Submit task completion"""
    success = await submit_task_completion(
        user_id=user_id,
        task_id=submission.task_id,
        proof_url=submission.proof_url
    )
    if success:
        return {"success": True, "message": "Task submitted for review"}
    else:
        return {"success": False, "message": "Failed to submit task"}

# ============================================
# ORDER ENDPOINTS
# ============================================

@router.get("/prices")
async def get_prices():
    """Get service prices"""
    return PRICES

@router.post("/orders")
async def create_order(user_id: int, order: OrderCreate):
    """Create a new order"""
    try:
        order_id = await create_tekin_order(
            user_id=user_id,
            order_type=order.order_type,
            quantity=order.quantity,
            target=order.target
        )
        return {"success": True, "order_id": order_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders/active")
async def get_active_orders(user_id: int):
    """Get user's active orders"""
    orders = await get_active_tekin_orders(user_id)
    return {"orders": orders}

@router.get("/orders/history")
async def get_order_history(user_id: int, limit: int = 50):
    """Get user's order history"""
    orders = await get_user_order_history(user_id, limit)
    return {"orders": orders}

# ============================================
# TOPUP ENDPOINTS
# ============================================

@router.post("/topup")
async def request_topup(user_id: int, topup: TopupRequest):
    """Request balance top-up"""
    try:
        request_id = await create_payment_request(
            user_id=user_id,
            amount=topup.amount,
            receipt_photo=topup.receipt_photo
        )
        return {"success": True, "request_id": request_id, "message": "Top-up request submitted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))