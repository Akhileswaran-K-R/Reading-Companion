from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Bookmark, Chunk
from app.schemas import BookmarkUpdate, BookmarkResponse

router = APIRouter(prefix="/api/bookmarks", tags=["bookmarks"])
DEMO_USER_ID = 1

@router.get("/{book_id}", response_model=BookmarkResponse)
def get_bookmark(book_id: int, db: Session = Depends(get_db)):
    bm = db.query(Bookmark).filter(Bookmark.user_id == DEMO_USER_ID, Bookmark.book_id == book_id).first()
    if not bm:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"chunk_index": bm.chunk_index}

@router.put("/{book_id}", response_model=BookmarkResponse)
def update_bookmark(book_id: int, update: BookmarkUpdate, db: Session = Depends(get_db)):
    query = db.query(Chunk).filter(Chunk.book_id == book_id)
    if update.chapter:
        query = query.filter(Chunk.chapter == update.chapter)
    if update.page:
        query = query.filter(Chunk.page == update.page)
        
    chunks = query.order_by(Chunk.chunk_index).all()
    if not chunks:
        raise HTTPException(status_code=404, detail="No chunks found for the given criteria")
        
    if update.position is not None:
        idx = int(update.position * (len(chunks) - 1))
        target_chunk = chunks[idx]
    else:
        target_chunk = chunks[-1]
        
    bm = db.query(Bookmark).filter(Bookmark.user_id == DEMO_USER_ID, Bookmark.book_id == book_id).first()
    if not bm:
        bm = Bookmark(user_id=DEMO_USER_ID, book_id=book_id, chunk_index=target_chunk.chunk_index)
        db.add(bm)
    else:
        bm.chunk_index = target_chunk.chunk_index
        
    db.commit()
    return {"chunk_index": bm.chunk_index}
