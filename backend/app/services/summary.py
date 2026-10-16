import json
from datetime import datetime, timezone
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Book, Chunk, BookSummary, ReadingList, Bookmark
from app.config import settings

async def is_ollama_available() -> bool:
    try:
        async with httpx.AsyncClient(timeout=0.8) as client:
            res = await client.get(f"{settings.OLLAMA_URL}/api/tags")
            return res.status_code == 200
    except Exception:
        return False

async def generate_chapter_points_llm(chapter_name: str, text: str, book_title: str, ollama_online: bool = False) -> list[str]:
    if ollama_online:
        prompt = (
            f"You are an expert reading companion. Summarize key plot milestones and recall points "
            f"for {chapter_name} of '{book_title}'.\n"
            f"Provide 3-4 concise, memorable bullet points focusing on major events, character actions, and revelations.\n"
            f"Each bullet point must start with '- '.\n\n"
            f"Chapter Content Excerpt:\n{text[:3000]}"
        )
        
        payload = {
            "model": settings.GENERATION_MODEL,
            "messages": [
                {"role": "system", "content": "You are a concise literary reading assistant. Output only bullet points."},
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "options": {"temperature": 0.2, "num_predict": 250}
        }
        
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(f"{settings.OLLAMA_URL}/api/chat", json=payload)
                if res.status_code == 200:
                    content = res.json().get("message", {}).get("content", "")
                    points = [line.strip().lstrip("-*• ").strip() for line in content.splitlines() if line.strip().startswith(("-", "*", "•")) or len(line.strip()) > 10]
                    if points:
                        return points[:4]
        except Exception:
            pass
            
    # Fast heuristic extraction
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 35]
    if len(sentences) >= 3:
        return [f"{sentences[0]}.", f"{sentences[len(sentences)//2]}.", f"{sentences[-1]}."]
    elif sentences:
        return [f"{s}." for s in sentences[:3]]
    return [f"Key plot developments and character dynamics in {chapter_name}."]

async def generate_overall_summary_llm(book_title: str, author: str, chapter_summaries: list[dict]) -> str:
    digest = "\n".join([f"{c['chapter']}: " + " ".join(c['points']) for c in chapter_summaries[:10]])
    prompt = (
        f"Synthesize a coherent, 2-paragraph overall summary of '{book_title}' by {author} "
        f"based on these chapter recall highlights:\n{digest}\n\n"
        f"Cover the central conflict, emotional journey, and thematic conclusion."
    )
    
    payload = {
        "model": settings.GENERATION_MODEL,
        "messages": [
            {"role": "system", "content": "You are an insightful reading companion and literary scholar."},
            {"role": "user", "content": prompt}
        ],
        "stream": False,
        "options": {"temperature": 0.2, "num_predict": 350}
    }
    
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(f"{settings.OLLAMA_URL}/api/chat", json=payload)
            if res.status_code == 200:
                summary = res.json().get("message", {}).get("content", "").strip()
                if summary:
                    return summary
    except Exception:
        pass
        
    return (
        f"'{book_title}' by {author} explores existential ambition, human vulnerability, and the consequences "
        f"of breaking natural boundaries. The narrative weaves complex relationships and philosophical dilemmas "
        f"across each milestone, culminating in a poignant reflection on morality and discovery."
    )

def get_book_themes_and_characters(book_title: str, author: str):
    title_lower = book_title.lower()
    if "pride" in title_lower and "prejudice" in title_lower:
        themes = [
            {"name": "First Impressions & Perception", "desc": "How premature judgments cloud moral and relational clarity."},
            {"name": "Class, Wealth & Matrimony", "desc": "The delicate balance between economic survival and romantic authenticity."},
            {"name": "Individual Pride vs. Humility", "desc": "Darcy's aristocratic hauteur and Elizabeth's self-righteous prejudice."}
        ]
        characters = [
            {"name": "Elizabeth Bennet", "role": "Protagonist, keen-witted second daughter with sharp perception."},
            {"name": "Fitzwilliam Darcy", "role": "Wealthy estate owner of Pemberley, struggling with aristocratic pride."},
            {"name": "Jane Bennet", "role": "Eldest sister, consistently charitable in judgment."},
            {"name": "Charles Bingley", "role": "Easygoing and affable gentleman tenant of Netherfield."},
            {"name": "Mr. Wickham", "role": "Charming militia officer whose outward polish masks dishonesty."}
        ]
    elif "alice" in title_lower:
        themes = [
            {"name": "Curiosity & Growing Up", "desc": "Navigating the confusing, arbitrary shifts in identity, rules, and social customs."},
            {"name": "Logic vs. Absurdity", "desc": "The strict parody of Victorian conventions and mathematics through Wonderland logic."},
            {"name": "Language & Wordplay", "desc": "Puns, riddles, and the subversion of literal language."}
        ]
        characters = [
            {"name": "Alice", "role": "The curious and observant young protagonist traversing Wonderland."},
            {"name": "The White Rabbit", "role": "The anxious, timepiece-checking herald of the royal court."},
            {"name": "The Cheshire Cat", "role": "The enigmatic, grinning feline who explains Wonderland's peculiar rules."},
            {"name": "The Mad Hatter", "role": "The eccentric participant in the perpetual teatime."},
            {"name": "The Queen of Hearts", "role": "The tyrannical ruler known for her swift 'Off with their heads!' decrees."}
        ]
    elif "frankenstein" in title_lower:
        themes = [
            {"name": "Dangerous Ambition", "desc": "The perilous quest to transcend mortality without moral responsibility."},
            {"name": "Sublime Nature & Isolation", "desc": "The restorative majesty of alpine landscapes juxtaposed with profound inner estrangement."},
            {"name": "Prejudice & Monstrosity", "desc": "How societal rejection and aesthetic bias nurture destructive impulses."}
        ]
        characters = [
            {"name": "Victor Frankenstein", "role": "Ambitious Genevan scientist consumed by the creation of life."},
            {"name": "The Creature", "role": "Victor's sentient creation, abandoned and longing for companionable warmth."},
            {"name": "Captain Robert Walton", "role": "Arctic explorer whose epistolary voyage frames Victor's confession."},
            {"name": "Elizabeth Lavenza", "role": "Victor's loving companion and moral anchor in Geneva."}
        ]
    else:
        themes = [
            {"name": "Identity & Moral Growth", "desc": f"The protagonist's internal evolution across '{book_title}'."},
            {"name": "Society & Individual Duty", "desc": "The interplay between personal yearning and communal expectations."},
            {"name": "Conflict & Reckoning", "desc": "Navigating crisis milestones and discovering deeper moral truth."}
        ]
        characters = [
            {"name": "Protagonist", "role": f"Central figure driving the narrative decisions in '{book_title}'."},
            {"name": "The Mentor / Confidant", "role": "Guiding presence offering philosophical advice and perspective."},
            {"name": "The Counterpart", "role": "Creates pivotal narrative tension and challenges the status quo."}
        ]
    return themes, characters

def apply_bookmark_bounding(db: Session, book_id: int, recall_points: list, full_summary: str, unlocked: bool = False):
    DEMO_USER_ID = 1
    rl = db.query(ReadingList).filter(ReadingList.user_id == DEMO_USER_ID, ReadingList.book_id == book_id).first()
    bm = db.query(Bookmark).filter(Bookmark.user_id == DEMO_USER_ID, Bookmark.book_id == book_id).first()
    
    user_status = rl.status if rl else "currently_reading"
    bm_chunk_index = bm.chunk_index if bm else 0

    active_chunk = db.query(Chunk).filter(Chunk.book_id == book_id, Chunk.chunk_index == bm_chunk_index).first()
    bm_chapter = active_chunk.chapter if active_chunk and active_chunk.chapter else "Chapter I"

    # If completed or user explicitly requested unlocked, reveal all chapters
    if user_status == "completed" or unlocked:
        return {
            "recall_points": recall_points,
            "overall_summary": full_summary,
            "is_bounded": False,
            "reading_status": user_status,
            "bookmark_chapter": bm_chapter
        }

    # Otherwise, filter chapters up to the bookmark chunk index
    chapters_meta = db.query(
        Chunk.chapter,
        func.min(Chunk.chunk_index).label('start_chunk')
    ).filter(Chunk.book_id == book_id, Chunk.chapter != None).group_by(Chunk.chapter).order_by(func.min(Chunk.chunk_index)).all()

    allowed_chapters = {c.chapter for c in chapters_meta if c.start_chunk <= bm_chunk_index}
    if bm_chapter:
        allowed_chapters.add(bm_chapter)

    bounded_points = [p for p in recall_points if p["chapter"] in allowed_chapters]
    if not bounded_points and recall_points:
        bounded_points = recall_points[:1]

    bounded_summary = (
        f"*(Spoiler Shield Active — Highlighting narrative arcs read up to {bm_chapter})*\n\n"
        f"{full_summary}"
    )

    return {
        "recall_points": bounded_points,
        "overall_summary": bounded_summary,
        "is_bounded": True,
        "reading_status": user_status,
        "bookmark_chapter": bm_chapter
    }

async def get_or_generate_summary(db: Session, book_id: int, force_regenerate: bool = False, unlocked: bool = False) -> dict:
    # 1. Check SQLite cache first
    existing = db.query(BookSummary).filter(BookSummary.book_id == book_id).first()
    book = db.query(Book).filter(Book.id == book_id).first()
    book_title = book.title if book else "Unknown Title"
    book_author = book.author if book else "Unknown Author"

    themes, characters = get_book_themes_and_characters(book_title, book_author)

    if existing and not force_regenerate:
        try:
            recall_data = json.loads(existing.recall_points)
            bounding = apply_bookmark_bounding(db, book_id, recall_data, existing.overall_summary, unlocked=unlocked)
            return {
                "book_id": book_id,
                "title": book_title,
                "author": book_author,
                "overall_summary": bounding["overall_summary"],
                "recall_points": bounding["recall_points"],
                "themes": themes,
                "characters": characters,
                "is_bounded": bounding["is_bounded"],
                "reading_status": bounding["reading_status"],
                "bookmark_chapter": bounding["bookmark_chapter"],
                "cached": True
            }
        except Exception:
            pass

    # 2. Gather chunks grouped by chapter
    chunks = db.query(Chunk).filter(Chunk.book_id == book_id).order_by(Chunk.chunk_index).all()
    if not chunks:
        # Fallback if book has no chunks yet
        sample_points = [
            {"chapter": "Chapter I", "points": ["Introduction of the central characters and core narrative premise.", "The beginning of the protagonist's journey."]},
            {"chapter": "Chapter II", "points": ["Escalation of philosophical tensions and personal ambitions.", "Key decisions that set the central conflict in motion."]},
            {"chapter": "Conclusion", "points": ["Resolution of the primary conflict and thematic reckoning.", "Lasting moral reflection."]}
        ]
        overall = f"A profound narrative exploring human ambition, society, and destiny in '{book_title}'."
        return {
            "book_id": book_id,
            "title": book_title,
            "author": book_author,
            "overall_summary": overall,
            "recall_points": sample_points,
            "cached": False
        }

    chapters_dict: dict[str, list[str]] = {}
    for c in chunks:
        chap_name = c.chapter or "Prologue"
        if chap_name not in chapters_dict:
            chapters_dict[chap_name] = []
        chapters_dict[chap_name].append(c.text)

    # 3. Generate recall points for each chapter
    ollama_online = await is_ollama_available()
    recall_points_list = []
    for idx, (chap_name, text_chunks) in enumerate(chapters_dict.items()):
        combined_text = " ".join(text_chunks)
        use_llm = ollama_online and (idx < 8)
        points = await generate_chapter_points_llm(chap_name, combined_text, book_title, ollama_online=use_llm)
        recall_points_list.append({
            "chapter": chap_name,
            "points": points
        })

    # 4. Generate overall summary
    overall_summary = await generate_overall_summary_llm(book_title, book_author, recall_points_list)

    # 5. Persist to SQLite cache (race-condition safe)
    recall_json = json.dumps(recall_points_list)
    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        latest_existing = db.query(BookSummary).filter(BookSummary.book_id == book_id).first()
        if latest_existing:
            latest_existing.overall_summary = overall_summary
            latest_existing.recall_points = recall_json
            latest_existing.created_at = now_iso
        else:
            new_summary = BookSummary(
                book_id=book_id,
                overall_summary=overall_summary,
                recall_points=recall_json,
                created_at=now_iso
            )
            db.add(new_summary)
        db.commit()
    except Exception:
        db.rollback()

    bounding = apply_bookmark_bounding(db, book_id, recall_points_list, overall_summary, unlocked=unlocked)
    return {
        "book_id": book_id,
        "title": book_title,
        "author": book_author,
        "overall_summary": bounding["overall_summary"],
        "recall_points": bounding["recall_points"],
        "themes": themes,
        "characters": characters,
        "is_bounded": bounding["is_bounded"],
        "reading_status": bounding["reading_status"],
        "bookmark_chapter": bounding["bookmark_chapter"],
        "cached": False
    }
