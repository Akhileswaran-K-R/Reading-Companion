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
    chunk = db.query(Chunk).filter(Chunk.book_id == book_id, Chunk.chunk_index == bm.chunk_index).first()
    return {
        "chunk_index": bm.chunk_index,
        "chapter": chunk.chapter if chunk else None,
        "page": chunk.page if chunk else None,
    }

@router.put("/{book_id}", response_model=BookmarkResponse)
@router.post("/{book_id}", response_model=BookmarkResponse)
def update_bookmark(book_id: int, update: BookmarkUpdate, db: Session = Depends(get_db)):
    if update.chunk_index is not None:
        target_chunk_index = update.chunk_index
    else:
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
        target_chunk_index = target_chunk.chunk_index
        
    bm = db.query(Bookmark).filter(Bookmark.user_id == DEMO_USER_ID, Bookmark.book_id == book_id).first()
    if not bm:
        bm = Bookmark(user_id=DEMO_USER_ID, book_id=book_id, chunk_index=target_chunk_index)
        db.add(bm)
    else:
        bm.chunk_index = target_chunk_index
        
    db.commit()

    chunk = db.query(Chunk).filter(Chunk.book_id == book_id, Chunk.chunk_index == bm.chunk_index).first()
    return {
        "chunk_index": bm.chunk_index,
        "chapter": chunk.chapter if chunk else None,
        "page": chunk.page if chunk else None,
    }
