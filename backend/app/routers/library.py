from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import ReadingList, Book
from app.schemas import LibraryAdd

router = APIRouter(prefix="/api/library", tags=["library"])
DEMO_USER_ID = 1

@router.get("/")
def get_library(db: Session = Depends(get_db)):
    items = db.query(ReadingList, Book).join(Book).filter(ReadingList.user_id == DEMO_USER_ID).all()
    result = []
    for rl, book in items:
        result.append({
            "book": {
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "source": book.source,
                "status": book.status,
            },
            "status": rl.status
        })
    return result

@router.post("/")
def add_to_library(item: LibraryAdd, db: Session = Depends(get_db)):
    existing = db.query(ReadingList).filter(
        ReadingList.user_id == DEMO_USER_ID, 
        ReadingList.book_id == item.book_id
    ).first()
    
    if existing:
        existing.status = item.status
    else:
        new_item = ReadingList(user_id=DEMO_USER_ID, book_id=item.book_id, status=item.status)
        db.add(new_item)
        
    db.commit()
    return {"message": "Success"}
