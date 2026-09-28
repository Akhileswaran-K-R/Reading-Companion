import ebooklib
from ebooklib import epub
import re
from app.config import settings

def parse_epub(file_path: str):
    book = epub.read_epub(file_path)
    pages_data = []
    chapter_num = 1
    for item in book.get_items():
        if item.get_type() == ebooklib.ITEM_DOCUMENT:
            html = item.get_body_content().decode('utf-8', errors='ignore')
            text = re.sub(r'<[^>]+>', ' ', html)
            text = re.sub(r'\s+', ' ', text).strip()
            if not text:
                continue
                
            chapter_title = f"Chapter {chapter_num}"
            words = text.split()
            page_num = 1
            for i in range(0, len(words), settings.WORDS_PER_PAGE):
                page_text = " ".join(words[i:i + settings.WORDS_PER_PAGE])
                pages_data.append({
                    "chapter": chapter_title,
                    "page": page_num,
                    "text": page_text
                })
                page_num += 1
            chapter_num += 1
    return pages_data
