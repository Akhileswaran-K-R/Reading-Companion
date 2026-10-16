from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, String
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
        chapter_page_num = active_chunk.page if active_chunk and active_chunk.page else 1
        
        # Total unique pages in current chapter
        chap_total = db.query(func.max(Chunk.page)).filter(
            Chunk.book_id == book.id, 
            Chunk.chapter == chapter_str
        ).scalar() or 1

        # Total unique pages across the entire volume
        total_unique_pages = db.query(
            func.count(distinct(Chunk.chapter + ':' + func.cast(Chunk.page, String)))
        ).filter(Chunk.book_id == book.id).scalar()
        if not total_unique_pages or total_unique_pages == 0:
            total_unique_pages = max(1, int((book.total_chunks or 1) * 0.8))

        # Cumulative book page up to the active chunk
        cum_book_page = db.query(
            func.count(distinct(Chunk.chapter + ':' + func.cast(Chunk.page, String)))
        ).filter(
            Chunk.book_id == book.id,
            Chunk.chunk_index <= chunk_idx
        ).scalar()
        cum_book_page = max(1, cum_book_page or 1)
        
        total_chunks = book.total_chunks or 1
        percent = 100 if rl.status == "completed" else min(100, int((chunk_idx / max(1, total_chunks)) * 100))
        
        result.append({
            "book": {
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "source": book.source,
                "status": book.status,
                "total_chunks": book.total_chunks,
                "cover_image": book.cover_image,
            },
            "status": rl.status,
            "chapter": chapter_str,
            "page": chapter_page_num,
            "chapterPages": chap_total,
            "bookPage": cum_book_page,
            "totalPages": total_unique_pages,
            "percent": percent,
            "is_current": (rl.status == "currently_reading"),
            "note": f"Reading {chapter_str}."
        })
    return result

@router.post("/")
def add_to_library(item: LibraryAdd, db: Session = Depends(get_db)):
    if item.status == "currently_reading":
        # Ensure only ONE volume is actively currently_reading in SQL
        db.query(ReadingList).filter(
            ReadingList.user_id == DEMO_USER_ID,
            ReadingList.book_id != item.book_id,
            ReadingList.status == "currently_reading"
        ).update({"status": "reading_list"})

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
    return {"message": "Success", "active_book_id": item.book_id if item.status == "currently_reading" else None}

@router.put("/active/{book_id}")
def set_active_book(book_id: int, db: Session = Depends(get_db)):
    """Sets a volume as the active currently_reading book in SQL, demoting other active books to reading_list."""
    db.query(ReadingList).filter(
        ReadingList.user_id == DEMO_USER_ID,
        ReadingList.book_id != book_id,
        ReadingList.status == "currently_reading"
    ).update({"status": "reading_list"})

    item = db.query(ReadingList).filter(
        ReadingList.user_id == DEMO_USER_ID,
        ReadingList.book_id == book_id
    ).first()
    if item:
        item.status = "currently_reading"
    else:
        new_item = ReadingList(user_id=DEMO_USER_ID, book_id=book_id, status="currently_reading")
        db.add(new_item)

    db.commit()
    return {"message": "Active book updated in SQL", "active_book_id": book_id}
