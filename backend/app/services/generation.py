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
        chap_label = f"Chapter {chunk['chapter']}" if chunk['chapter'] else ""
        page_label = f"p. {chunk['page']}" if chunk['page'] else ""
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
            "num_predict": settings.MAX_NEW_TOKENS
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(f"{settings.OLLAMA_URL}/api/chat", json=payload)
            response.raise_for_status()
            data = response.json()
            return data["message"]["content"]
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Ollama generation failed: {str(exc)}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(exc)}")
