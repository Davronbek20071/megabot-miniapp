"""
Admin API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
from pathlib import Path
import aiosqlite
import os

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from database import (
    DB_NAME, get_user_count, get_resume_count,
    get_pending_payment_requests, update_payment_request_status,
    add_balance, activate_premium
)

router = APIRouter()

ADMIN_ID = int(os.getenv('ADMIN_ID', '0'))

# Middleware to check admin
async def check_admin(user_id: int):
    if user_id != ADMIN_ID:
        raise HTTPException(status_code=403, detail="Admin access required")
    return True

# ============================================
# STATISTICS ENDPOINTS
# ============================================

@router.get("/stats")
async def get_stats(user_id: int):
    """Get bot statistics (admin only)"""
    await check_admin(user_id)
    
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        
        stats = {
            'total_users': await get_user_count(),
            'total_resumes': await get_resume_count(),
            'premium_users': 0,
            'today_users': 0,
            'total_balance': 0,
            'active_jobs': 0,
            'active_products': 0
        }
        
        # Premium users
        async with db.execute(
            "SELECT COUNT(*) as count FROM users WHERE premium_until > datetime('now')"
        ) as cursor:
            stats['premium_users'] = (await cursor.fetchone())[0]
        
        # Today's new users
        async with db.execute(
            "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = DATE('now')"
        ) as cursor:
            stats['today_users'] = (await cursor.fetchone())[0]
        
        # Total balance
        async with db.execute(
            "SELECT SUM(balance) as total FROM users"
        ) as cursor:
            result = await cursor.fetchone()
            stats['total_balance'] = result[0] or 0
        
        # Active jobs
        async with db.execute(
            "SELECT COUNT(*) as count FROM jobs WHERE status = 'active'"
        ) as cursor:
            stats['active_jobs'] = (await cursor.fetchone())[0]
        
        # Active products
        async with db.execute(
            "SELECT COUNT(*) as count FROM products WHERE status = 'active' AND stock > 0"
        ) as cursor:
            stats['active_products'] = (await cursor.fetchone())[0]
    
    return stats

# ============================================
# PAYMENT APPROVAL ENDPOINTS
# ============================================

@router.get("/payments/pending")
async def get_pending_payments(user_id: int):
    """Get pending payment requests (admin only)"""
    await check_admin(user_id)
    
    requests = await get_pending_payment_requests()
    return {"requests": requests}

@router.post("/payments/{request_id}/approve")
async def approve_payment(user_id: int, request_id: int):
    """Approve payment request (admin only)"""
    await check_admin(user_id)
    
    # Get request details
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM payment_requests WHERE id = ?",
            (request_id,)
        ) as cursor:
            request = await cursor.fetchone()
            if not request:
                raise HTTPException(status_code=404, detail="Payment request not found")
            request = dict(request)
    
    # Add balance
    await add_balance(request['user_id'], request['amount'], "Payment approved")
    
    # Update request status
    await update_payment_request_status(request_id, 'approved', user_id, "Approved by admin")
    
    return {"success": True, "message": "Payment approved"}

@router.post("/payments/{request_id}/reject")
async def reject_payment(user_id: int, request_id: int, reason: str = ""):
    """Reject payment request (admin only)"""
    await check_admin(user_id)
    
    await update_payment_request_status(request_id, 'rejected', user_id, reason or "Rejected by admin")
    
    return {"success": True, "message": "Payment rejected"}

# ============================================
# USER MANAGEMENT ENDPOINTS
# ============================================

@router.get("/users")
async def get_users(user_id: int, limit: int = 50, offset: int = 0):
    """Get users list (admin only)"""
    await check_admin(user_id)
    
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """SELECT user_id, username, first_name, balance, premium_until, created_at
               FROM users 
               ORDER BY created_at DESC 
               LIMIT ? OFFSET ?""",
            (limit, offset)
        ) as cursor:
            rows = await cursor.fetchall()
            users = [dict(row) for row in rows]
    
    return {"users": users}

@router.post("/users/{target_user_id}/add-balance")
async def add_user_balance(user_id: int, target_user_id: int, amount: int):
    """Add balance to user (admin only)"""
    await check_admin(user_id)
    
    await add_balance(target_user_id, amount, "Added by admin")
    return {"success": True, "message": f"Added {amount:,} to user {target_user_id}"}

@router.post("/users/{target_user_id}/activate-premium")
async def activate_user_premium(
    user_id: int,
    target_user_id: int,
    premium_type: str = 'standard',
    days: int = 30
):
    """Activate premium for user (admin only)"""
    await check_admin(user_id)
    
    await activate_premium(target_user_id, premium_type, days)
    return {"success": True, "message": f"Premium activated for user {target_user_id}"}