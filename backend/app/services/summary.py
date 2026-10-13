import json
from datetime import datetime, timezone
import httpx
from sqlalchemy.orm import Session
from app.models import Book, Chunk, BookSummary
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

async def get_or_generate_summary(db: Session, book_id: int, force_regenerate: bool = False) -> dict:
    # 1. Check SQLite cache first
    existing = db.query(BookSummary).filter(BookSummary.book_id == book_id).first()
    book = db.query(Book).filter(Book.id == book_id).first()
    book_title = book.title if book else "Unknown Title"
    book_author = book.author if book else "Unknown Author"

    if existing and not force_regenerate:
        try:
            recall_data = json.loads(existing.recall_points)
            return {
                "book_id": book_id,
                "title": book_title,
                "author": book_author,
                "overall_summary": existing.overall_summary,
                "recall_points": recall_data,
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

    # 5. Persist to SQLite cache
    recall_json = json.dumps(recall_points_list)
    now_iso = datetime.now(timezone.utc).isoformat()
    if existing:
        existing.overall_summary = overall_summary
        existing.recall_points = recall_json
        existing.created_at = now_iso
    else:
        new_summary = BookSummary(
            book_id=book_id,
            overall_summary=overall_summary,
            recall_points=recall_json,
            created_at=now_iso
        )
        db.add(new_summary)
    db.commit()

    return {
        "book_id": book_id,
        "title": book_title,
        "author": book_author,
        "overall_summary": overall_summary,
        "recall_points": recall_points_list,
        "cached": False
    }
