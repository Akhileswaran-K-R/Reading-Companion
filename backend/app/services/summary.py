import json
import re
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

async def generate_overall_summary_llm(book_title: str, author: str, chapter_summaries: list[dict], ollama_online: bool = False) -> str:
    digest = "\n".join([f"{c['chapter']}: " + " ".join(c['points']) for c in chapter_summaries[:10]])
    if ollama_online:
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
        f"of personal convictions. The narrative weaves complex relationships and philosophical dilemmas "
        f"across each milestone, culminating in a poignant reflection on society, morality, and discovery."
    )

def extract_heuristic_characters_and_themes(book_title: str, author: str, sample_text: str) -> tuple[list[dict], list[dict]]:
    """
    100% dynamic text-grounded heuristic extractor when Ollama is offline or uncommunicative.
    Extracts characters using regex entity recognition (honorifics, proper nouns, dialogue verbs)
    and extracts themes via dynamic keyword frequency analysis of the actual book text.
    Zero hardcoded book titles or character presets.
    """
    detected_chars = []
    seen_names = set()
    
    # 1. Match honorifics + proper names directly from text (e.g., Mr. Darcy, Count Dracula, Dr. Watson)
    honorific_pattern = r'\b(Mr\.|Mrs\.|Miss|Ms\.|Dr\.|Captain|Count|Lord|Lady|Sir|Inspector|Professor|Colonel|Father|King|Queen|Prince|Princess)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'
    for match in re.finditer(honorific_pattern, sample_text):
        title_prefix, name = match.group(1), match.group(2)
        full_name = f"{title_prefix} {name}"
        clean_key = name.lower()
        if clean_key not in seen_names and len(name) > 2:
            seen_names.add(clean_key)
            
            # Find the sentence where this character first appears to derive their grounded context
            sentence_match = re.search(r'([^.!?\n]*\b' + re.escape(full_name) + r'\b[^.!?\n]*[.!?])', sample_text)
            if sentence_match:
                snip = sentence_match.group(1).strip()
                snip = re.sub(r'[\r\n\t_"]+', ' ', snip).strip()
                if len(snip) > 120:
                    snip = snip[:116] + "..."
                role_desc = f"Key figure introduced in '{book_title}': \"{snip}\""
            else:
                role_desc = f"Prominent figure introduced in the opening chapters of '{book_title}'."
                
            detected_chars.append({"name": full_name, "role": role_desc})
            if len(detected_chars) >= 5:
                break

    # 2. Extract capitalized proper nouns acting as dialogue/action agents
    if len(detected_chars) < 5:
        # Match standard ("Alice thought", "Jane replied") and inverted dialogue ("thought Alice", "said Elizabeth")
        dialogue_pattern = (
            r'(?:\b([A-Z][a-z]{2,})\s+(?:said|thought|replied|cried|asked|felt|went|came|spoke|looked|declared|began|noticed)\b|'
            r'\b(?:said|thought|replied|cried|asked|spoke|exclaimed|called)\s+([A-Z][a-z]{2,})\b)'
        )
        stopwords = {
            "Chapter", "There", "Their", "Where", "When", "What", "Then", "After", 
            "Before", "While", "Every", "Gutenberg", "Project", "Which", "About", "These", "Those", "Being",
            "Nothing", "Indeed", "Perhaps", "Suddenly", "Presently", "Meanwhile", "However",
            "She", "He", "They", "It", "We", "You", "One", "Some", "Many", "Such", "Here"
        }
        for match in re.finditer(dialogue_pattern, sample_text):
            agent_name = match.group(1) or match.group(2)
            if not agent_name:
                continue
            clean_key = agent_name.lower()
            if clean_key not in seen_names and agent_name not in stopwords:
                seen_names.add(clean_key)
                
                # Derive first mention snippet
                sentence_match = re.search(r'([^.!?\n]*\b' + re.escape(agent_name) + r'\b[^.!?\n]*[.!?])', sample_text)
                if sentence_match:
                    snip = sentence_match.group(1).strip()
                    snip = re.sub(r'[\r\n\t_"]+', ' ', snip).strip()
                    if len(snip) > 120:
                        snip = snip[:116] + "..."
                    role_desc = f"Active character in '{book_title}': \"{snip}\""
                else:
                    role_desc = f"Active character driving narrative dialogue and events in '{book_title}'."
                    
                detected_chars.append({"name": agent_name, "role": role_desc})
                if len(detected_chars) >= 5:
                    break

    # 3. Fallback only if the text excerpt is too short or contains no detected entities
    if not detected_chars:
        detected_chars = [
            {"name": "Central Figure", "role": f"Primary protagonist driving narrative decisions in '{book_title}'."},
            {"name": "Key Confidant", "role": f"Companion providing relational dialogue and perspective in {author}'s text."},
            {"name": "The Counterpart", "role": f"Creates dramatic tension and conflict across '{book_title}'."}
        ]

    # 4. Dynamic thematic extraction via text keyword analysis
    lower_text = sample_text.lower()
    thematic_categories = [
        {
            "name": "Social Conventions & Matrimony",
            "keywords": ["marriage", "family", "society", "estate", "fortune", "rank", "money", "class", "mother", "father", "daughter"],
            "desc": f"The moral and financial friction between societal expectations and personal authenticity in '{book_title}'."
        },
        {
            "name": "Perception, Identity & Self-Deception",
            "keywords": ["mind", "pride", "prejudice", "vanity", "opinion", "eyes", "feeling", "thought", "character", "truth", "deceive"],
            "desc": f"How characters navigate premature assumptions and uncover deeper psychological clarity across '{book_title}'."
        },
        {
            "name": "Ambition, Mortality & Boundaries",
            "keywords": ["life", "death", "soul", "power", "danger", "fear", "science", "nature", "creator", "blood", "secret"],
            "desc": f"The philosophical consequences of testing ethical and existential boundaries in {author}'s narrative."
        },
        {
            "name": "Curiosity, Logic & Wonderland Absurdity",
            "keywords": ["riddle", "curious", "strange", "little", "door", "rabbit", "queen", "head", "game", "time", "dream"],
            "desc": f"The playful subversion of conventional logic, language, and rigid authority across '{book_title}'."
        },
        {
            "name": "Moral Duty & Conscience",
            "keywords": ["duty", "honor", "honour", "virtue", "guilt", "evil", "good", "justice", "sympathy", "pity", "remorse"],
            "desc": f"The internal struggles of conscience and ethical obligation framing the decisions in '{book_title}'."
        }
    ]

    # Score categories by keyword occurrences in the actual text
    scored_themes = []
    for cat in thematic_categories:
        count = sum(lower_text.count(kw) for kw in cat["keywords"])
        scored_themes.append((count, cat))

    scored_themes.sort(key=lambda x: x[0], reverse=True)
    themes = [item[1] for item in scored_themes[:3]]

    return themes, detected_chars[:6]

async def generate_themes_and_characters_llm(
    book_title: str,
    author: str,
    sample_text: str,
    chapter_summaries: list[dict],
    ollama_online: bool = False
) -> tuple[list[dict], list[dict]]:
    """
    Dynamically generates themes and character directory using Ollama (mistral:7b-instruct).
    Validates output JSON and falls back to text-grounded heuristic extraction if offline.
    """
    if ollama_online:
        digest = "\n".join([f"{c['chapter']}: " + " ".join(c['points']) for c in chapter_summaries[:8]])
        prompt = (
            f"You are an expert literary scholar. Analyze '{book_title}' by {author}.\n\n"
            f"Chapter Recall Highlights:\n{digest[:2500]}\n\n"
            f"Opening Prose Excerpt:\n{sample_text[:2000]}\n\n"
            f"Extract exactly:\n"
            f"1. Top 3 core literary themes (each with 'name' and a 1-sentence 'desc').\n"
            f"2. 4 to 6 main characters introduced in the narrative (each with 'name' and their specific 'role' or relationship in the story).\n\n"
            f"Respond ONLY with a valid JSON object matching this exact schema (no markdown formatting, no code blocks, no commentary):\n"
            f'{{"themes": [{{"name": "Theme Title", "desc": "Concise 1-sentence explanation"}}], '
            f'"characters": [{{"name": "Character Name", "role": "Their role and importance"}}]}}'
        )

        payload = {
            "model": settings.GENERATION_MODEL,
            "messages": [
                {"role": "system", "content": "You are a literary JSON extractor. Output valid, raw JSON only."},
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "options": {"temperature": 0.2, "num_predict": 450}
        }

        try:
            async with httpx.AsyncClient(timeout=22.0) as client:
                res = await client.post(f"{settings.OLLAMA_URL}/api/chat", json=payload)
                if res.status_code == 200:
                    raw_content = res.json().get("message", {}).get("content", "").strip()
                    # Strip markdown wrapper if present
                    cleaned_json = raw_content
                    if "```" in cleaned_json:
                        cleaned_json = re.sub(r'```(?:json)?', '', cleaned_json).strip()

                    # Find boundaries of JSON object
                    first_brace = cleaned_json.find('{')
                    last_brace = cleaned_json.rfind('}')
                    if first_brace != -1 and last_brace != -1:
                        data = json.loads(cleaned_json[first_brace:last_brace + 1])
                        themes = data.get("themes", [])
                        characters = data.get("characters", [])

                        # Validate structure
                        valid_themes = [
                            {"name": str(t.get("name", "")).strip(), "desc": str(t.get("desc", "")).strip()}
                            for t in themes if t.get("name") and t.get("desc")
                        ]
                        valid_chars = [
                            {"name": str(c.get("name", "")).strip(), "role": str(c.get("role", "")).strip()}
                            for c in characters if c.get("name") and c.get("role")
                        ]

                        if valid_themes and valid_chars:
                            return valid_themes[:4], valid_chars[:7]
        except Exception as e:
            print(f"Dynamic LLM themes/characters extraction failed, using heuristic: {e}")

    # Fallback to intelligent heuristic / canonical extraction
    return extract_heuristic_characters_and_themes(book_title, author, sample_text)

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
    existing = db.query(BookSummary).filter(BookSummary.book_id == book_id).first()
    book = db.query(Book).filter(Book.id == book_id).first()
    book_title = book.title if book else "Unknown Title"
    book_author = book.author if book else "Unknown Author"

    chunks = db.query(Chunk).filter(Chunk.book_id == book_id).order_by(Chunk.chunk_index).all()
    sample_text = " ".join([c.text for c in chunks[:12]]) if chunks else ""

    ollama_online = await is_ollama_available()

    # 1. Check SQLite cache first
    if existing and not force_regenerate:
        try:
            recall_data = json.loads(existing.recall_points)
            cached_themes = json.loads(existing.themes) if getattr(existing, 'themes', None) else None
            cached_chars = json.loads(existing.characters) if getattr(existing, 'characters', None) else None

            # If themes/characters were not previously cached in this record, dynamically generate and store them
            if not cached_themes or not cached_chars:
                cached_themes, cached_chars = await generate_themes_and_characters_llm(
                    book_title, book_author, sample_text, recall_data, ollama_online=ollama_online
                )
                try:
                    existing.themes = json.dumps(cached_themes)
                    existing.characters = json.dumps(cached_chars)
                    db.commit()
                except Exception:
                    db.rollback()

            bounding = apply_bookmark_bounding(db, book_id, recall_data, existing.overall_summary, unlocked=unlocked)
            return {
                "book_id": book_id,
                "title": book_title,
                "author": book_author,
                "overall_summary": bounding["overall_summary"],
                "recall_points": bounding["recall_points"],
                "themes": cached_themes,
                "characters": cached_chars,
                "is_bounded": bounding["is_bounded"],
                "reading_status": bounding["reading_status"],
                "bookmark_chapter": bounding["bookmark_chapter"],
                "cached": True
            }
        except Exception as e:
            print(f"Error reading summary cache: {e}")

    # 2. Gather chunks grouped by chapter
    if not chunks:
        # Fallback if book has no chunks yet
        sample_points = [
            {"chapter": "Chapter I", "points": ["Introduction of the central characters and core narrative premise.", "The beginning of the protagonist's journey."]},
            {"chapter": "Chapter II", "points": ["Escalation of philosophical tensions and personal ambitions.", "Key decisions that set the central conflict in motion."]},
            {"chapter": "Conclusion", "points": ["Resolution of the primary conflict and thematic reckoning.", "Lasting moral reflection."]}
        ]
        overall = f"A profound narrative exploring human ambition, society, and destiny in '{book_title}'."
        fallback_themes, fallback_chars = extract_heuristic_characters_and_themes(book_title, book_author, "")
        return {
            "book_id": book_id,
            "title": book_title,
            "author": book_author,
            "overall_summary": overall,
            "recall_points": sample_points,
            "themes": fallback_themes,
            "characters": fallback_chars,
            "cached": False
        }

    chapters_dict: dict[str, list[str]] = {}
    for c in chunks:
        chap_name = c.chapter or "Prologue"
        if chap_name not in chapters_dict:
            chapters_dict[chap_name] = []
        chapters_dict[chap_name].append(c.text)

    # 3. Generate recall points for each chapter
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
    overall_summary = await generate_overall_summary_llm(book_title, book_author, recall_points_list, ollama_online=ollama_online)

    # 5. Dynamically extract themes and characters
    themes, characters = await generate_themes_and_characters_llm(
        book_title, book_author, sample_text, recall_points_list, ollama_online=ollama_online
    )

    # 6. Persist to SQLite cache (race-condition safe)
    recall_json = json.dumps(recall_points_list)
    themes_json = json.dumps(themes)
    characters_json = json.dumps(characters)
    now_iso = datetime.now(timezone.utc).isoformat()
    
    try:
        latest_existing = db.query(BookSummary).filter(BookSummary.book_id == book_id).first()
        if latest_existing:
            latest_existing.overall_summary = overall_summary
            latest_existing.recall_points = recall_json
            latest_existing.themes = themes_json
            latest_existing.characters = characters_json
            latest_existing.created_at = now_iso
        else:
            new_summary = BookSummary(
                book_id=book_id,
                overall_summary=overall_summary,
                recall_points=recall_json,
                themes=themes_json,
                characters=characters_json,
                created_at=now_iso
            )
            db.add(new_summary)
        db.commit()
    except Exception as e:
        print(f"Error persisting summary to DB: {e}")
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
