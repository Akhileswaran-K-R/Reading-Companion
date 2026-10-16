from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.embedding import get_query_embedding, rerank
from app.services.vector_store import search_index, search_index_range
from app.models import Chunk, Bookmark
from app.config import settings

def is_confident_rerank_score(score: float, threshold: float = None) -> bool:
    """
    Evaluates whether a reranker score indicates genuine semantic relevance.
    Handles both probability-based rerankers (like BAAI/bge-reranker-base in [0.0, 1.0])
    and logit-based cross-encoders (like ms-marco in [-10, 10]).
    """
    if threshold is None:
        threshold = getattr(settings, "RERANK_THRESHOLD", 0.02)
    # If the score is negative, it represents a raw logit
    if score < 0:
        return score > -2.5
    # If the score is in [0.0, 1.0], it represents a probability from BGE
    return score >= threshold

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
    
    # Filter by model confidence threshold
    confident_scored = [
        item for item in scored_chunks[:settings.RERANK_TOP_N]
        if is_confident_rerank_score(item[1])
    ]
            
    if not confident_scored:
        return []

    top_chunks = [c[0] for c in confident_scored]
    top_chunks.sort(key=lambda c: c.chunk_index)
    
    for c in top_chunks:
        assert c.chunk_index <= bookmark.chunk_index, f"Retrieved chunk index {c.chunk_index} is past bookmark {bookmark.chunk_index}"
        
    return top_chunks

def check_forward_look_hint(db: Session, book_id: int, bookmark_chunk_index: int, question: str) -> dict:
    """
    Agent 2 Forward-Look Hinting:
    Inspects chunks *after* the reader's bookmark horizon.
    If a strong relevance match exists further ahead, returns the milestone hint
    without leaking spoiler plot details.
    """
    question_embedding = get_query_embedding(question)
    future_indices = search_index_range(
        book_id=book_id,
        query_embedding=question_embedding,
        top_k=settings.RETRIEVE_K,
        min_chunk_index=bookmark_chunk_index + 1,
        max_chunk_index=999999
    )
    if not future_indices:
        return {"found": False, "out_of_scope": True}

    chunks = db.query(Chunk).filter(
        Chunk.book_id == book_id,
        Chunk.chunk_index.in_(future_indices)
    ).all()
    if not chunks:
        return {"found": False, "out_of_scope": True}

    chunk_texts = [c.text for c in chunks]
    scores = rerank(question, chunk_texts)
    scored = list(zip(chunks, scores))
    scored.sort(key=lambda x: x[1], reverse=True)

    top_chunk, top_score = scored[0]
    
    # Check if the future relevance meets the confidence threshold
    if is_confident_rerank_score(top_score):
        chap_name = top_chunk.chapter or "a future chapter"
        return {
            "found": True,
            "chapter": chap_name,
            "page": top_chunk.page,
            "chunk_index": top_chunk.chunk_index,
            "nudge": f"This is revealed further along in {chap_name}. Keep reading to discover it!"
        }
    
    return {"found": False, "out_of_scope": True}
