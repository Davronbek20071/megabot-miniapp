"""
MEGABOT Mini App Backend
FastAPI server that reuses existing bot database and handlers
"""
import sys
import os
from pathlib import Path

# Add parent directory to path to import bot modules
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import hashlib
import hmac
import json
from urllib.parse import parse_qsl
from typing import Optional
import logging

# Import bot modules
from database import get_user, add_user, get_user_balance
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv('BOT_TOKEN')
if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN not found in environment variables")

app = FastAPI(
    title="MEGABOT Mini App API",
    description="Telegram Mini App backend for MEGABOT",
    version="1.0.0"
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# TELEGRAM WEBAPP AUTHENTICATION
# ============================================

def validate_telegram_webapp_data(init_data: str) -> dict:
    """
    Validate Telegram WebApp initData
    Returns user data if valid, raises HTTPException if invalid
    """
    try:
        # Parse init_data
        parsed_data = dict(parse_qsl(init_data))
        
        # Get hash from data
        received_hash = parsed_data.pop('hash', None)
        if not received_hash:
            raise HTTPException(status_code=401, detail="No hash provided")
        
        # Create data-check-string
        data_check_arr = [f"{k}={v}" for k, v in sorted(parsed_data.items())]
        data_check_string = '\n'.join(data_check_arr)
        
        # Calculate hash
        secret_key = hmac.new(
            key=b"WebAppData",
            msg=BOT_TOKEN.encode(),
            digestmod=hashlib.sha256
        ).digest()
        
        calculated_hash = hmac.new(
            key=secret_key,
            msg=data_check_string.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()
        
        # Verify hash
        if calculated_hash != received_hash:
            raise HTTPException(status_code=401, detail="Invalid hash")
        
        # Parse user data
        user_data = json.loads(parsed_data.get('user', '{}'))
        
        return {
            'user_id': user_data.get('id'),
            'username': user_data.get('username'),
            'first_name': user_data.get('first_name'),
            'last_name': user_data.get('last_name'),
            'language_code': user_data.get('language_code')
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=401, detail="Invalid user data format")
    except Exception as e:
        logger.error(f"Telegram auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    Dependency to get current authenticated user
    Expects Authorization header with Telegram WebApp initData
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # Remove 'Bearer ' prefix if present
    init_data = authorization.replace('Bearer ', '')
    
    user_data = validate_telegram_webapp_data(init_data)
    
    # Ensure user exists in database
    user_id = user_data['user_id']
    user = await get_user(user_id)
    if not user:
        # Create new user
        await add_user(
            user_id=user_id,
            username=user_data.get('username'),
            first_name=user_data.get('first_name'),
            last_name=user_data.get('last_name')
        )
    
    return user_data

# ============================================
# HEALTH CHECK
# ============================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "app": "MEGABOT Mini App API",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected"
    }

# ============================================
# AUTH ENDPOINTS
# ============================================

@app.post("/api/auth/validate")
async def validate_auth(user: dict = Depends(get_current_user)):
    """Validate Telegram WebApp authentication"""
    db_user = await get_user(user['user_id'])
    balance = await get_user_balance(user['user_id'])
    
    return {
        "valid": True,
        "user": {
            "id": user['user_id'],
            "username": user.get('username'),
            "first_name": user.get('first_name'),
            "last_name": user.get('last_name'),
            "balance": balance,
            "is_premium": db_user.get('premium_until') if db_user else None
        }
    }

# Import API routers
from api import tekin, jobs, resume, marketplace, books, premium, admin_api

# Include API routers
app.include_router(tekin.router, prefix="/api/tekin", tags=["Tekin Obunachi"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(marketplace.router, prefix="/api/market", tags=["Marketplace"])
app.include_router(books.router, prefix="/api/books", tags=["Books"])
app.include_router(premium.router, prefix="/api/premium", tags=["Premium"])
app.include_router(admin_api.router, prefix="/api/admin", tags=["Admin"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)