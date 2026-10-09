import asyncio
from sqlalchemy.orm import Session
from app.models import Book, Chunk
from app.services.chunking import chunk_text
from app.services.embedding import get_embeddings
from app.services.vector_store import create_and_save_index
from app.parsers.gutenberg_text import parse_gutenberg
from app.parsers.epub_parser import parse_epub
from app.parsers.pdf_parser import parse_pdf
from app.services.gutendex import download_gutenberg_text

async def ingest_book(db: Session, book_id: int):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        return
        
    pages_data = []
    try:
        if book.source == "gutenberg":
            text = await download_gutenberg_text(book.file_path)
            pages_data = parse_gutenberg(text)
        elif book.source == "epub":
            pages_data = parse_epub(book.file_path)
        elif book.source == "pdf":
            pages_data = parse_pdf(book.file_path)
            
        all_chunks = []
        chunk_idx = 0
        
        for page in pages_data:
            chunks = chunk_text(page["text"], page["chapter"], page["page"], chunk_idx)
            all_chunks.extend(chunks)
            chunk_idx += len(chunks)
            
        if not all_chunks:
            book.status = "error"
            db.commit()
            return

        chunk_texts = [c["text"] for c in all_chunks]
        embeddings = get_embeddings(chunk_texts)
        
        db_chunks = []
        chunk_indices = []
        for c in all_chunks:
            db_chunk = Chunk(
                book_id=book.id,
                chunk_index=c["chunk_index"],
                chapter=c["chapter"],
                page=c["page"],
                text=c["text"]
            )
            db_chunks.append(db_chunk)
            chunk_indices.append(c["chunk_index"])
            
        db.add_all(db_chunks)
        book.total_chunks = len(all_chunks)
        book.status = "ready"
        db.commit()
        
        create_and_save_index(book.id, embeddings, chunk_indices)
    except Exception as e:
        book.status = "error"
        db.commit()
