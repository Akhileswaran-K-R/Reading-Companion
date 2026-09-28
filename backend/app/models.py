from sqlalchemy import Column, Integer, String, ForeignKey, Text, UniqueConstraint
from .db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String)
    source = Column(String)
    gutenberg_id = Column(Integer, nullable=True)
    file_path = Column(String, nullable=True)
    total_chunks = Column(Integer, default=0)
    status = Column(String, default="processing")

class Chunk(Base):
    __tablename__ = "chunks"
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"))
    chunk_index = Column(Integer)
    chapter = Column(String, nullable=True)
    page = Column(Integer, nullable=True)
    text = Column(Text)
    
    __table_args__ = (UniqueConstraint('book_id', 'chunk_index', name='uq_chunk_book_index'),)

class ReadingList(Base):
    __tablename__ = "reading_list"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    book_id = Column(Integer, ForeignKey("books.id"), primary_key=True)
    status = Column(String)

class Bookmark(Base):
    __tablename__ = "bookmarks"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    book_id = Column(Integer, ForeignKey("books.id"), primary_key=True)
    chunk_index = Column(Integer)
