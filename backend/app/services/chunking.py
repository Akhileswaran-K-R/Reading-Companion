from app.config import settings

def chunk_text(text: str, chapter: str, page: int, start_index: int):
    words = text.split()
    chunks = []
    chunk_idx = start_index
    
    if not words:
        return chunks
        
    i = 0
    while i < len(words):
        end = i + settings.CHUNK_WORDS
        chunk_words = words[i:end]
        chunk_text = " ".join(chunk_words)
        
        chunks.append({
            "chunk_index": chunk_idx,
            "chapter": chapter,
            "page": page,
            "text": chunk_text
        })
        
        chunk_idx += 1
        i += (settings.CHUNK_WORDS - settings.CHUNK_OVERLAP_WORDS)
        
    return chunks
