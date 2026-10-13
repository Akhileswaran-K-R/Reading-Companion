from fastapi import APIRouter, Depends, BackgroundTasks, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os
import shutil
from app.db import get_db
from app.schemas import BookCreate, BookResponse, ChapterResponse
from app.models import Book, Chunk
from app.services.gutendex import search_gutendex, get_book_details
from app.services.ingestion import ingest_book
from app.config import settings
from sqlalchemy import func

router = APIRouter(prefix="/api/books", tags=["books"])

@router.get("/search")
async def search_books(q: str):
    return await search_gutendex(q)

@router.post("/add", response_model=BookResponse)
async def add_book(book_in: BookCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing = db.query(Book).filter(Book.gutenberg_id == book_in.gutenberg_id).first()
    if existing:
        return existing
        
    details = await get_book_details(book_in.gutenberg_id)
    title = details.get("title", "Unknown")
    authors = details.get("authors", [])
    author = authors[0]["name"] if authors else "Unknown"
    
    formats = details.get("formats", {})
    text_url = None
    for k, v in formats.items():
        if "text/plain" in k and "utf-8" in k:
            text_url = v
            break
    if not text_url:
        for k, v in formats.items():
            if "text/plain" in k:
                text_url = v
                break
                
    if not text_url:
        raise HTTPException(status_code=400, detail="No plain text format found on Gutendex")
        
    book = Book(
        title=title,
        author=author,
        source="gutenberg",
        gutenberg_id=book_in.gutenberg_id,
        file_path=text_url,
        status="processing"
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    
    background_tasks.add_task(ingest_book, book.id)
    return book

@router.post("/upload", response_model=BookResponse)
async def upload_book(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    if file.filename.endswith(".epub"):
        source = "epub"
    elif file.filename.endswith(".pdf"):
        source = "pdf"
    else:
        raise HTTPException(status_code=400, detail="Only EPUB and PDF are supported")
        
    books_dir = os.path.join(settings.DATA_DIR, "books")
    os.makedirs(books_dir, exist_ok=True)
    file_path = os.path.join(books_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    book = Book(
        title=file.filename,
        author="Unknown",
        source=source,
        file_path=file_path,
        status="processing"
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    
    background_tasks.add_task(ingest_book, book.id)
    return book

@router.get("/{book_id}/chapters")
def get_chapters(book_id: int, db: Session = Depends(get_db)):
    chapters = db.query(
        Chunk.chapter,
        func.min(Chunk.chunk_index).label('start_chunk'),
        func.max(Chunk.chunk_index).label('end_chunk')
    ).filter(Chunk.book_id == book_id, Chunk.chapter != None).group_by(Chunk.chapter).order_by(func.min(Chunk.chunk_index)).all()
    
    return [
        {"chapter": c.chapter, "start_chunk": c.start_chunk, "end_chunk": c.end_chunk}
        for c in chapters
    ]

@router.get("/{book_id}/content")
def get_book_content(book_id: int, chapter: str = None, db: Session = Depends(get_db)):
    query = db.query(Chunk).filter(Chunk.book_id == book_id)
    if chapter:
        query = query.filter(Chunk.chapter == chapter)
    chunks = query.order_by(Chunk.chunk_index).all()
    
    processed = []
    for i, c in enumerate(chunks):
        words = c.text.split()
        text = c.text
        
        if i > 0 and c.chapter == chunks[i-1].chapter and c.page == chunks[i-1].page:
            text = " ".join(words[settings.CHUNK_OVERLAP_WORDS:])
                
        processed.append({
            "chunk_index": c.chunk_index,
            "chapter": c.chapter,
            "page": c.page,
            "text": text
        })
        
    return processed
