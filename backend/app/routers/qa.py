from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Bookmark
from app.schemas import QAQuery, QAResponse
from app.services.retrieval import retrieve_and_rerank_chunks, check_forward_look_hint
from app.services.generation import generate_answer

router = APIRouter(prefix="/api/qa", tags=["qa"])
DEMO_USER_ID = 1

@router.post("/{book_id}", response_model=QAResponse)
async def ask_question(book_id: int, query: QAQuery, db: Session = Depends(get_db)):
    # Stage 1: Retrieve context chunks strictly bounded by the reader's bookmark
    chunks = retrieve_and_rerank_chunks(db, DEMO_USER_ID, book_id, query.question)
    
    # If no pre-bookmark chunks match
    if not chunks:
        bookmark = db.query(Bookmark).filter(Bookmark.user_id == DEMO_USER_ID, Bookmark.book_id == book_id).first()
        bookmark_chunk_index = bookmark.chunk_index if bookmark else 0

        # Stage 2: Forward-look check (Agent 2 Spoiler Guard)
        hint_result = check_forward_look_hint(db, book_id, bookmark_chunk_index, query.question)
        if hint_result.get("found"):
            return QAResponse(
                answer=hint_result["nudge"],
                citations=[]
            )
        else:
            return QAResponse(
                answer="Based strictly on the text read up to your bookmark, this detail does not appear in the narrative.",
                citations=[]
            )
        
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
