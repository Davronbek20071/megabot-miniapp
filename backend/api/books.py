"""
Books & Competitions API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
from pathlib import Path
import aiosqlite

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from database import DB_NAME, deduct_balance

router = APIRouter()

class CompetitionJoin(BaseModel):
    competition_id: int

class TestAnswer(BaseModel):
    competition_id: int
    answers: List[int]  # List of selected option indices

# ============================================
# COMPETITION ENDPOINTS
# ============================================

@router.get("/competitions")
async def get_competitions(status: Optional[str] = None):
    """Get book competitions"""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        
        query = "SELECT * FROM competitions"
        params = []
        
        if status:
            query += " WHERE status = ?"
            params.append(status)
        else:
            query += " WHERE status IN ('upcoming', 'active')"
        
        query += " ORDER BY start_date DESC"
        
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            competitions = [dict(row) for row in rows]
    
    return {"competitions": competitions}

@router.get("/competitions/{competition_id}")
async def get_competition(competition_id: int):
    """Get competition details"""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM competitions WHERE id = ?",
            (competition_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Competition not found")
            return dict(row)

@router.post("/competitions/join")
async def join_competition(user_id: int, join: CompetitionJoin):
    """Join a competition"""
    async with aiosqlite.connect(DB_NAME) as db:
        # Check if already joined
        async with db.execute(
            "SELECT * FROM competition_participants WHERE user_id = ? AND competition_id = ?",
            (user_id, join.competition_id)
        ) as cursor:
            existing = await cursor.fetchone()
            if existing:
                raise HTTPException(status_code=400, detail="Already joined this competition")
        
        # Get competition details
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM competitions WHERE id = ?",
            (join.competition_id,)
        ) as cursor:
            competition = await cursor.fetchone()
            if not competition:
                raise HTTPException(status_code=404, detail="Competition not found")
            competition = dict(competition)
        
        # Deduct participation fee
        fee = competition.get('participation_fee', 0)
        if fee > 0:
            await deduct_balance(user_id, fee, f"Competition participation - {competition['title']}")
        
        # Add participant
        await db.execute(
            """INSERT INTO competition_participants 
               (user_id, competition_id, payment_status)
               VALUES (?, ?, ?)""",
            (user_id, join.competition_id, 'paid' if fee > 0 else 'free')
        )
        await db.commit()
    
    return {"success": True, "message": "Successfully joined competition"}

@router.get("/competitions/{competition_id}/questions")
async def get_questions(competition_id: int, user_id: int):
    """Get competition questions"""
    async with aiosqlite.connect(DB_NAME) as db:
        # Check if user is participant
        async with db.execute(
            "SELECT * FROM competition_participants WHERE user_id = ? AND competition_id = ?",
            (user_id, competition_id)
        ) as cursor:
            participant = await cursor.fetchone()
            if not participant:
                raise HTTPException(status_code=403, detail="Not a participant")
        
        # Get questions
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM competition_questions WHERE competition_id = ? ORDER BY id",
            (competition_id,)
        ) as cursor:
            rows = await cursor.fetchall()
            questions = [dict(row) for row in rows]
    
    return {"questions": questions}

@router.post("/competitions/submit-test")
async def submit_test(user_id: int, test: TestAnswer):
    """Submit test answers"""
    async with aiosqlite.connect(DB_NAME) as db:
        # Check if already submitted
        async with db.execute(
            """SELECT * FROM competition_participants 
               WHERE user_id = ? AND competition_id = ? AND test_submitted = 1""",
            (user_id, test.competition_id)
        ) as cursor:
            if await cursor.fetchone():
                raise HTTPException(status_code=400, detail="Test already submitted")
        
        # Calculate score
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM competition_questions WHERE competition_id = ? ORDER BY id",
            (test.competition_id,)
        ) as cursor:
            questions = await cursor.fetchall()
        
        correct_count = 0
        for i, question in enumerate(questions):
            if i < len(test.answers) and test.answers[i] == question['correct_answer']:
                correct_count += 1
        
        # Update participant
        await db.execute(
            """UPDATE competition_participants 
               SET test_submitted = 1, test_score = ?, test_date = CURRENT_TIMESTAMP
               WHERE user_id = ? AND competition_id = ?""",
            (correct_count, user_id, test.competition_id)
        )
        await db.commit()
    
    return {
        "success": True,
        "score": correct_count,
        "total": len(questions),
        "message": f"Test submitted! Score: {correct_count}/{len(questions)}"
    }

@router.get("/my-competitions")
async def get_my_competitions(user_id: int):
    """Get user's competitions"""
    async with aiosqlite.connect(DB_NAME) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """SELECT cp.*, c.title, c.book_title, c.status
               FROM competition_participants cp
               JOIN competitions c ON cp.competition_id = c.id
               WHERE cp.user_id = ?
               ORDER BY cp.joined_at DESC""",
            (user_id,)
        ) as cursor:
            rows = await cursor.fetchall()
            competitions = [dict(row) for row in rows]
    
    return {"competitions": competitions}