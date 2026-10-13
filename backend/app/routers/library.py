from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import ReadingList, Book, Bookmark, Chunk
from app.schemas import LibraryAdd

router = APIRouter(prefix="/api/library", tags=["library"])
DEMO_USER_ID = 1

@router.get("/")
def get_library(db: Session = Depends(get_db)):
    items = db.query(ReadingList, Book).join(Book, ReadingList.book_id == Book.id).filter(ReadingList.user_id == DEMO_USER_ID).all()
    result = []
    for rl, book in items:
        bm = db.query(Bookmark).filter(Bookmark.user_id == DEMO_USER_ID, Bookmark.book_id == book.id).first()
        chunk_idx = bm.chunk_index if bm else 0
        
        active_chunk = db.query(Chunk).filter(Chunk.book_id == book.id, Chunk.chunk_index == chunk_idx).first()
        chapter_str = active_chunk.chapter if active_chunk and active_chunk.chapter else "Chapter I"
        page_num = active_chunk.page if active_chunk and active_chunk.page else 1
        
        total_chunks = book.total_chunks or 1
        total_pages = max(1, int(total_chunks * 0.8))
        percent = 100 if rl.status == "completed" else min(100, int((chunk_idx / max(1, total_chunks)) * 100))
        
        result.append({
            "book": {
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "source": book.source,
                "status": book.status,
                "total_chunks": book.total_chunks,
            },
            "status": rl.status,
            "chapter": chapter_str,
            "page": page_num,
            "totalPages": total_pages,
            "percent": percent,
            "note": f"Reading {chapter_str}."
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
