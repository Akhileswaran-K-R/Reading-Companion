from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas import SummaryResponse
from app.services.summary import get_or_generate_summary

router = APIRouter(prefix="/api/books", tags=["summaries"])

@router.get("/{book_id}/summary", response_model=SummaryResponse)
async def get_book_summary(book_id: int, db: Session = Depends(get_db)):
    summary = await get_or_generate_summary(db, book_id, force_regenerate=False)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary

@router.post("/{book_id}/summary", response_model=SummaryResponse)
async def generate_book_summary(book_id: int, db: Session = Depends(get_db)):
    summary = await get_or_generate_summary(db, book_id, force_regenerate=True)
    return summary
