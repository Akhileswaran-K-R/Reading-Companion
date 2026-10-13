from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base, SessionLocal
from app.models import User
from app.routers import books, library, bookmarks, qa, summary
import os
from app.config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Reading Companion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router)
app.include_router(library.router)
app.include_router(bookmarks.router)
app.include_router(qa.router)
app.include_router(summary.router)

@app.on_event("startup")
def startup_event():
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    db = SessionLocal()
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, username="demo")
        db.add(user)
        db.commit()
    db.close()
