"""
Resume Builder API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from database import save_resume, get_user_resumes, delete_resume, get_resume_by_id

router = APIRouter()

class ResumeCreate(BaseModel):
    full_name: str
    phone: str
    email: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    objective: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[str] = None
    languages: Optional[str] = None
    additional: Optional[str] = None
    template: str = 'classic'

# ============================================
# RESUME ENDPOINTS
# ============================================

@router.post("/create")
async def create_resume(user_id: int, resume: ResumeCreate):
    """Create a new resume"""
    try:
        resume_id = await save_resume(
            user_id=user_id,
            data={
                'full_name': resume.full_name,
                'phone': resume.phone,
                'email': resume.email,
                'date_of_birth': resume.date_of_birth,
                'address': resume.address,
                'objective': resume.objective,
                'education': resume.education,
                'experience': resume.experience,
                'skills': resume.skills,
                'languages': resume.languages,
                'additional': resume.additional,
                'template': resume.template
            }
        )
        return {"success": True, "resume_id": resume_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/list")
async def list_resumes(user_id: int):
    """Get user's resumes"""
    resumes = await get_user_resumes(user_id)
    return {"resumes": resumes}

@router.get("/{resume_id}")
async def get_resume(user_id: int, resume_id: int):
    """Get resume details"""
    resume = await get_resume_by_id(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if resume.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return resume

@router.delete("/{resume_id}")
async def delete_resume_endpoint(user_id: int, resume_id: int):
    """Delete a resume"""
    resume = await get_resume_by_id(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if resume.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    success = await delete_resume(resume_id)
    return {"success": success}

@router.get("/templates/list")
async def get_templates():
    """Get available resume templates"""
    templates = [
        {"id": "classic", "name": "Classic", "preview": "/templates/classic.png"},
        {"id": "modern", "name": "Modern", "preview": "/templates/modern.png"},
        {"id": "professional", "name": "Professional", "preview": "/templates/professional.png"},
        {"id": "creative", "name": "Creative", "preview": "/templates/creative.png"}
    ]
    return {"templates": templates}