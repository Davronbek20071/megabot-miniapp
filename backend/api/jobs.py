"""
Jobs API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
from pathlib import Path
import aiosqlite

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from database import DB_NAME, deduct_balance, get_user_balance

router = APIRouter()

class JobCreate(BaseModel):
    title: str
    company: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    location: Optional[str] = None
    category: Optional[str] = None
    job_type: str = 'monthly'  # 'monthly' or 'daily'

class DailyJobCreate(BaseModel):
    title: str
    description: str
    location: str
    salary: int
    work_date: str
    work_time: str
    contact_phone: str

class JobApplication(BaseModel):
    job_id: int
    cover_letter: Optional[str] = None

# ============================================
# JOB LISTING ENDPOINTS
# ============================================

@router.get("/list")
async def get_jobs(
    category: Optional[str] = None,
    region: Optional[str] = None,
    job_type: str = 'monthly',
    limit: int = 20,
    offset: int = 0
):
    """Get job listings"""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        
        query = "SELECT * FROM jobs WHERE status = 'active' AND job_type = ?"
        params = [job_type]
        
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
            jobs = [dict(row) for row in rows]
    
    return {"jobs": jobs, "total": len(jobs)}

@router.get("/daily")
async def get_daily_jobs(
    region: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """Get daily job listings"""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        
        query = "SELECT * FROM daily_jobs WHERE status = 'active'"
        params = []
        
        if region:
            query += " AND location LIKE ?"
            params.append(f"%{region}%")
        
        query += " ORDER BY work_date DESC, created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            jobs = [dict(row) for row in rows]
    
    return {"jobs": jobs, "total": len(jobs)}

@router.get("/{job_id}")
async def get_job(job_id: int):
    """Get job details"""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Job not found")
            return dict(row)

@router.get("/categories/list")
async def get_categories():
    """Get job categories"""
    categories = [
        "IT va Dasturlash",
        "Marketing va Reklama",
        "Savdo va Biznes",
        "Ta'lim",
        "Sog'liqni saqlash",
        "Qurilish",
        "Transport",
        "Boshqa"
    ]
    return {"categories": categories}

# ============================================
# JOB POSTING ENDPOINTS
# ============================================

@router.post("/create")
async def create_job(user_id: int, job: JobCreate):
    """Create a new job posting"""
    # Check if user can post (premium or has balance)
    balance = await get_user_balance(user_id)
    posting_fee = 5000  # 5,000 so'm per job post
    
    if balance < posting_fee:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Deduct posting fee
    await deduct_balance(user_id, posting_fee, "Job posting fee")
    
    # Create job
    async with aiosqlite.connect(DB_NAME) as db:
        from datetime import datetime, timedelta
        expires_at = (datetime.now() + timedelta(days=30)).isoformat()
        
        cursor = await db.execute(
            """INSERT INTO jobs 
               (employer_id, title, company, description, requirements, salary_min, 
                salary_max, location, category, expires_at, status, job_type)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, job.title, job.company, job.description,
             job.requirements, job.salary_min, job.salary_max,
             job.location, job.category, expires_at, 'active', job.job_type)
        )
        await db.commit()
        job_id = cursor.lastrowid
    
    return {"success": True, "job_id": job_id}

@router.post("/daily/create")
async def create_daily_job(user_id: int, job: DailyJobCreate):
    """Create a daily job posting"""
    balance = await get_user_balance(user_id)
    posting_fee = 3000  # 3,000 so'm for daily job
    
    if balance < posting_fee:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    await deduct_balance(user_id, posting_fee, "Daily job posting fee")
    
    async with aiosqlite.connect(DB_NAME) as db:
        cursor = await db.execute(
            """INSERT INTO daily_jobs 
               (user_id, title, description, location, salary, work_date, 
                work_time, contact_phone, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, job.title, job.description, job.location, job.salary,
             job.work_date, job.work_time, job.contact_phone, 'active')
        )
        await db.commit()
        job_id = cursor.lastrowid
    
    return {"success": True, "job_id": job_id}

# ============================================
# APPLICATION ENDPOINTS
# ============================================

@router.post("/apply")
async def apply_to_job(user_id: int, application: JobApplication):
    """Apply to a job"""
    async with aiosqlite.connect(DB_NAME) as db:
        # Check if already applied
        async with db.execute(
            "SELECT * FROM job_applications WHERE user_id = ? AND job_id = ?",
            (user_id, application.job_id)
        ) as cursor:
            existing = await cursor.fetchone()
            if existing:
                raise HTTPException(status_code=400, detail="Already applied to this job")
        
        # Create application
        await db.execute(
            """INSERT INTO job_applications 
               (user_id, job_id, cover_letter, status)
               VALUES (?, ?, ?, ?)""",
            (user_id, application.job_id, application.cover_letter, 'pending')
        )
        await db.commit()
    
    return {"success": True, "message": "Application submitted"}

@router.get("/applications/my")
async def get_my_applications(user_id: int, limit: int = 20):
    """Get user's job applications"""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """SELECT ja.*, j.title, j.company 
               FROM job_applications ja
               JOIN jobs j ON ja.job_id = j.id
               WHERE ja.user_id = ?
               ORDER BY ja.created_at DESC LIMIT ?""",
            (user_id, limit)
        ) as cursor:
            rows = await cursor.fetchall()
            applications = [dict(row) for row in rows]
    
    return {"applications": applications}