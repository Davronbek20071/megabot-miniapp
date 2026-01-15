"""
Premium API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from database import (
    get_premium_settings_db, activate_premium, get_premium_info,
    create_payment_request, get_user
)

router = APIRouter()

class PremiumPurchase(BaseModel):
    premium_type: str  # 'standard', 'pro', 'vip'
    receipt_photo: str

# ============================================
# PREMIUM ENDPOINTS
# ============================================

@router.get("/plans")
async def get_premium_plans():
    """Get premium plans and pricing"""
    settings = await get_premium_settings_db()
    
    plans = [
        {
            "id": "standard",
            "name": "Standard Premium",
            "price": settings.get('standard_price', 20000),
            "duration_days": 30,
            "features": [
                "5 ta rezyume",
                "99 ta matematik",
                "10 ta ish arizasi/oy",
                "Marketplace komissiyasi: 3%"
            ]
        },
        {
            "id": "pro",
            "name": "Pro Premium",
            "price": settings.get('pro_price', 40000),
            "duration_days": 30,
            "features": [
                "Cheksiz rezyume",
                "Cheksiz matematik",
                "Cheksiz ish arizasi",
                "Marketplace komissiyasi: 2%",
                "Premium support"
            ]
        },
        {
            "id": "vip",
            "name": "VIP Premium",
            "price": settings.get('vip_price', 100000),
            "duration_days": 30,
            "features": [
                "25 ta rezyume",
                "199 ta matematik",
                "Cheksiz ish arizasi",
                "Marketplace komissiyasi: 1%",
                "Premium support",
                "Maxsus belgi"
            ]
        }
    ]
    
    return {"plans": plans}

@router.get("/status")
async def get_premium_status(user_id: int):
    """Get user's premium status"""
    user = await get_user(user_id)
    premium_info = await get_premium_info(user_id)
    
    return {
        "is_premium": bool(user.get('premium_until')),
        "premium_type": user.get('premium_type'),
        "premium_until": user.get('premium_until'),
        "details": premium_info
    }

@router.post("/purchase")
async def purchase_premium(user_id: int, purchase: PremiumPurchase):
    """Request premium purchase"""
    settings = await get_premium_settings_db()
    
    # Get price based on type
    price_key = f"{purchase.premium_type}_price"
    price = settings.get(price_key, 20000)
    
    # Create payment request
    request_id = await create_payment_request(
        user_id=user_id,
        amount=price,
        receipt_photo=purchase.receipt_photo
    )
    
    return {
        "success": True,
        "request_id": request_id,
        "message": "Premium purchase request submitted. Admin will review shortly."
    }