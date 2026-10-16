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
    cover_image: Optional[str] = None
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
    chapter: Optional[str] = None
    page: Optional[int] = None

class QAQuery(BaseModel):
    question: str

class Citation(BaseModel):
    chapter: Optional[str]
    page: Optional[int]
    chunk_index: int

class QAResponse(BaseModel):
    answer: str
    citations: List[Citation]

class ChapterRecallPoint(BaseModel):
    chapter: str
    points: List[str]

class ThemeItem(BaseModel):
    name: str
    desc: str

class CharacterItem(BaseModel):
    name: str
    role: str

class SummaryResponse(BaseModel):
    book_id: int
    title: Optional[str] = None
    author: Optional[str] = None
    overall_summary: str
    recall_points: List[ChapterRecallPoint]
    themes: Optional[List[ThemeItem]] = []
    characters: Optional[List[CharacterItem]] = []
    is_bounded: bool = False
    reading_status: Optional[str] = None
    bookmark_chapter: Optional[str] = None
    cached: bool = True
