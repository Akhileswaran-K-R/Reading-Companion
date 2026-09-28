from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.embedding import get_query_embedding, rerank
from app.services.vector_store import search_index
from app.models import Chunk, Bookmark
from app.config import settings

def retrieve_and_rerank_chunks(db: Session, user_id: int, book_id: int, question: str):
    question_embedding = get_query_embedding(question)
    
    bookmark = db.query(Bookmark).filter(Bookmark.user_id == user_id, Bookmark.book_id == book_id).first()
    if not bookmark:
        raise HTTPException(status_code=400, detail="No bookmark set for this book.")
    
    retrieved_indices = search_index(book_id, question_embedding, settings.RETRIEVE_K, bookmark.chunk_index)
    if not retrieved_indices:
        return []

    chunks = db.query(Chunk).filter(
        Chunk.book_id == book_id,
        Chunk.chunk_index.in_(retrieved_indices)
    ).all()
    
    chunk_map = {c.chunk_index: c for c in chunks}
    retrieved_chunks = [chunk_map[idx] for idx in retrieved_indices if idx in chunk_map]
    
    if not retrieved_chunks:
        return []
        
    chunk_texts = [c.text for c in retrieved_chunks]
    scores = rerank(question, chunk_texts)
    
    scored_chunks = list(zip(retrieved_chunks, scores))
    scored_chunks.sort(key=lambda x: x[1], reverse=True)
    
    top_chunks = [c[0] for c in scored_chunks[:settings.RERANK_TOP_N]]
    top_chunks.sort(key=lambda c: c.chunk_index)
    
    for c in top_chunks:
        assert c.chunk_index <= bookmark.chunk_index, f"Retrieved chunk index {c.chunk_index} is past bookmark {bookmark.chunk_index}"
        
    return top_chunks
