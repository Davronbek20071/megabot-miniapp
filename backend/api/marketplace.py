"""
Marketplace API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
from pathlib import Path
import aiosqlite

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from database import DB_NAME, get_user_balance, deduct_balance, add_balance

router = APIRouter()

class ProductCreate(BaseModel):
    name: str
    description: str
    price: int
    category: str
    location: str
    stock: int
    images: List[str] = []

class OrderCreate(BaseModel):
    product_id: int
    quantity: int
    delivery_address: str
    phone: str

# ============================================
# PRODUCT ENDPOINTS
# ============================================

@router.get("/products")
async def get_products(
    category: Optional[str] = None,
    region: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """Get marketplace products"""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        
        query = "SELECT * FROM products WHERE status = 'active' AND stock > 0"
        params = []
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        if region:
            query += " AND region = ?"
            params.append(region)
        
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            products = [dict(row) for row in rows]
    
    return {"products": products, "total": len(products)}

@router.get("/products/{product_id}")
async def get_product(product_id: int):
    """Get product details"""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM products WHERE id = ?", (product_id,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Product not found")
            return dict(row)

@router.post("/products/create")
async def create_product(user_id: int, product: ProductCreate):
    """Create a new product listing"""
    # Check balance for listing fee
    balance = await get_user_balance(user_id)
    listing_fee = 5000  # 5,000 so'm
    
    if balance < listing_fee:
        raise HTTPException(status_code=400, detail="Insufficient balance for listing fee")
    
    await deduct_balance(user_id, listing_fee, "Product listing fee")
    
    async with aiosqlite.connect(DB_NAME) as db:
        import json
        cursor = await db.execute(
            """INSERT INTO products 
               (seller_id, name, description, price, category, location, stock, images, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, product.name, product.description, product.price,
             product.category, product.location, product.stock,
             json.dumps(product.images), 'active')
        )
        await db.commit()
        product_id = cursor.lastrowid
    
    return {"success": True, "product_id": product_id}

@router.get("/categories")
async def get_categories():
    """Get product categories"""
    categories = [
        "Elektronika",
        "Kiyim-kechak",
        "Uy-ro'zg'or",
        "Kitoblar",
        "Sport va Faoliyat",
        "Bolalar uchun",
        "Boshqa"
    ]
    return {"categories": categories}

# ============================================
# ORDER ENDPOINTS
# ============================================

@router.post("/orders/create")
async def create_order(user_id: int, order: OrderCreate):
    """Create a product order"""
    async with aiosqlite.connect(DB_NAME) as db:
        # Get product
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM products WHERE id = ?", (order.product_id,)) as cursor:
            product = await cursor.fetchone()
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            
            product = dict(product)
        
        # Check stock
        if product['stock'] < order.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        
        # Calculate total
        total_price = product['price'] * order.quantity
        commission = int(total_price * 0.05)  # 5% commission
        
        # Create order
        cursor = await db.execute(
            """INSERT INTO orders 
               (buyer_id, seller_id, product_id, quantity, total_price, 
                commission_amount, delivery_address, buyer_phone, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, product['seller_id'], order.product_id, order.quantity,
             total_price, commission, order.delivery_address, order.phone, 'pending')
        )
        await db.commit()
        order_id = cursor.lastrowid
        
        # Update stock
        await db.execute(
            "UPDATE products SET stock = stock - ? WHERE id = ?",
            (order.quantity, order.product_id)
        )
        await db.commit()
    
    return {"success": True, "order_id": order_id, "total_price": total_price}

@router.get("/orders/my")
async def get_my_orders(user_id: int, limit: int = 20):
    """Get user's orders"""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """SELECT o.*, p.name as product_name, p.price
               FROM orders o
               JOIN products p ON o.product_id = p.id
               WHERE o.buyer_id = ?
               ORDER BY o.created_at DESC LIMIT ?""",
            (user_id, limit)
        ) as cursor:
            rows = await cursor.fetchall()
            orders = [dict(row) for row in rows]
    
    return {"orders": orders}

@router.get("/orders/selling")
async def get_selling_orders(user_id: int, limit: int = 20):
    """Get seller's orders"""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """SELECT o.*, p.name as product_name
               FROM orders o
               JOIN products p ON o.product_id = p.id
               WHERE o.seller_id = ?
               ORDER BY o.created_at DESC LIMIT ?""",
            (user_id, limit)
        ) as cursor:
            rows = await cursor.fetchall()
            orders = [dict(row) for row in rows]
    
    return {"orders": orders}