from pydantic import BaseModel
from typing import List, Optional

class BookCreate(BaseModel):
    gutenberg_id: int

class BookResponse(BaseModel):
    id: int
    title: str
    author: Optional[str]
    source: str
    gutenberg_id: Optional[int]
    status: str

    class Config:
        from_attributes = True

class ChapterResponse(BaseModel):
    chapter: Optional[str]
    start_chunk: int
    end_chunk: int

class LibraryAdd(BaseModel):
    book_id: int
    status: str

class BookmarkUpdate(BaseModel):
    chapter: Optional[str] = None
    page: Optional[int] = None
    position: Optional[float] = None
    chunk_index: Optional[int] = None

class BookmarkResponse(BaseModel):
    chunk_index: int

class QAQuery(BaseModel):
    question: str

class Citation(BaseModel):
    chapter: Optional[str]
    page: Optional[int]
    chunk_index: int

class QAResponse(BaseModel):
    answer: str
    citations: List[Citation]
