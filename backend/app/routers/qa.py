from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas import QAQuery, QAResponse
from app.services.retrieval import retrieve_and_rerank_chunks
from app.services.generation import generate_answer

router = APIRouter(prefix="/api/qa", tags=["qa"])
DEMO_USER_ID = 1

@router.post("/{book_id}", response_model=QAResponse)
async def ask_question(book_id: int, query: QAQuery, db: Session = Depends(get_db)):
    chunks = retrieve_and_rerank_chunks(db, DEMO_USER_ID, book_id, query.question)
    
    if not chunks:
        return QAResponse(answer="No relevant context found before the bookmark.", citations=[])
        
    context_chunks = [
        {"chapter": c.chapter, "page": c.page, "text": c.text, "chunk_index": c.chunk_index}
        for c in chunks
    ]
    
    answer = await generate_answer(query.question, context_chunks)
    
    citations = [
        {"chapter": c.chapter, "page": c.page, "chunk_index": c.chunk_index}
        for c in chunks
    ]
    
    return QAResponse(answer=answer, citations=citations)
