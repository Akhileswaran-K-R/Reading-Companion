import httpx
from fastapi import HTTPException
from app.config import settings
from typing import List

async def generate_answer(question: str, context_chunks: List[dict]):
    system_prompt = (
        "Answer the question only from the provided context. "
        "If the answer is not in the context, say so. "
        "Do not use outside knowledge of the book."
    )
    
    context_text = ""
    for chunk in context_chunks:
        chap_val = str(chunk['chapter']).strip() if chunk.get('chapter') else ""
        chap_label = chap_val if chap_val.lower().startswith("chapter") else (f"Chapter {chap_val}" if chap_val else "")
        page_label = f"pg. {chunk['page']}" if chunk.get('page') else ""
        label = ", ".join(filter(None, [chap_label, page_label]))
        if label:
            context_text += f"[{label}]\n{chunk['text']}\n\n"
        else:
            context_text += f"{chunk['text']}\n\n"
    
    user_prompt = f"Context:\n{context_text}\nQuestion: {question}"

    payload = {
        "model": settings.GENERATION_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": min(settings.MAX_NEW_TOKENS, 150)
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(f"{settings.OLLAMA_URL}/api/chat", json=payload)
            if response.status_code == 200:
                data = response.json()
                content = data.get("message", {}).get("content", "").strip()
                if content:
                    return content
    except Exception:
        pass

    # Graceful fallback when Ollama LLM is offline or timed out
    if context_chunks:
        primary_chunk = context_chunks[0]
        chap_str = f" in {primary_chunk['chapter']}" if primary_chunk.get("chapter") else ""
        pg_str = f", pg. {primary_chunk['page']}" if primary_chunk.get("page") else ""
        
        # Clean illustrations or brackets and extract complete sentences
        cleaned_text = primary_chunk["text"].replace("[Illustration]", "").strip()
        sentences = [s.strip() for s in cleaned_text.replace("\n", " ").split(".") if s.strip()]
        
        if sentences:
            selected = []
            total_len = 0
            for s in sentences:
                if total_len + len(s) > 350 and selected:
                    break
                selected.append(s)
                total_len += len(s)
            excerpt = ". ".join(selected) + "."
        else:
            excerpt = cleaned_text[:280].rsplit(" ", 1)[0] + "..."

        return (
            f"*(Note: Ollama LLM is offline; showing grounded excerpt)*\n\n"
            f"Based on the text{chap_str}{pg_str}:\n\n> \"{excerpt}\""
        )
    return "Based strictly on the text read up to your bookmark, this detail does not appear in the narrative."
