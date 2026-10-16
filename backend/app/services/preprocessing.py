import re
from app.config import settings

def clean_chapter_title(raw_title: str) -> str:
    """
    Normalizes raw Gutenberg chapter headings.
    Removes inline illustration tags, trailing punctuation, brackets, and quotes.
    Examples:
      'Chapter I.]' -> 'CHAPTER I'
      'CHAPTER II.' -> 'CHAPTER II'
      'CHAPTER V.' -> 'CHAPTER V'
      'CHAPTER I. Down the Rabbit-Hole' -> 'CHAPTER I: Down the Rabbit-Hole'
    """
    t = re.sub(r'\[Illustration[^\]]*\]', '', raw_title, flags=re.IGNORECASE).strip()
    t = t.strip("[] \t\r\n")
    m = re.match(r'^(CHAPTER|Chapter)\s+([IVXLCDM\d]+)\.?(?:\s*[-—:]?\s*(.*))?$', t, re.IGNORECASE)
    if m:
        num = m.group(2).upper()
        subtitle = m.group(3).strip(".:;, \t[]") if m.group(3) else ""
        if subtitle:
            return f"CHAPTER {num}: {subtitle}"
        return f"CHAPTER {num}"
    return t.rstrip(".:;, ]")

def clean_body_text(text: str) -> str:
    """
    Cleans raw Gutenberg text artifacts:
    - Removes [Illustration] and [Illustration: caption] placeholders
    - Removes [Transcriber's Note: ...] and [Footnote...] blocks
    - Converts ASCII italics markup (_word_) into clean text (word)
    - Replaces ASCII double hyphens (--) with typographic em-dashes (—)
    - Fixes corrupted apostrophes / quotes
    - Normalizes excessive whitespace
    """
    # 1. Remove illustration tags
    text = re.sub(r'\[Illustration(?::[^\]]*?)?\]', '', text, flags=re.IGNORECASE)
    # 2. Remove transcriber notes and footnotes
    text = re.sub(r'\[Transcriber\'?s?\s*Note:[^\]]*?\]', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\[Footnote(?::|\s+\d+:)[^\]]*?\]', '', text, flags=re.IGNORECASE)
    # 3. Clean italics underscores: _word_ -> word (handles curly/straight quotes and punctuation)
    text = re.sub(r'(?<![A-Za-z0-9])_([^_]+?)_(?![A-Za-z0-9])', r'\1', text)
    # 4. Convert ASCII double dashes to em-dash
    text = text.replace('--', '—')
    # 5. Fix corrupted unicode characters / replacement characters if present
    text = text.replace('\ufffd', "'")
    # 6. Normalize multiple horizontal spaces
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def preprocess_gutenberg(text: str):
    start_match = re.search(r'\*\*\* START OF [^\n]*\*\*\*', text)
    if start_match:
        text = text[start_match.end():]
        
    end_match = re.search(r'\*\*\* END OF [^\n]*\*\*\*', text)
    if end_match:
        text = text[:end_match.start()]
        
    text = re.sub(r'\r\n', '\n', text)
    
    chapters_content = []
    chapter_pattern = re.compile(r'^(?:CHAPTER|Chapter)\s+[IVXLCDM\d]+[^\n]*', re.MULTILINE)
    
    matches = list(chapter_pattern.finditer(text))
    if not matches:
        cleaned = clean_body_text(text)
        chapters_content.append({"chapter": None, "text": cleaned})
    else:
        for i in range(len(matches)):
            start = matches[i].start()
            end = matches[i+1].start() if i + 1 < len(matches) else len(text)
            raw_title = matches[i].group().strip()
            chapter_title = clean_chapter_title(raw_title)
            
            raw_text = text[matches[i].end():end].strip()
            cleaned_text = clean_body_text(raw_text)
            chapters_content.append({"chapter": chapter_title, "text": cleaned_text})
            
    pages_data = []
    for chap in chapters_content:
        words = chap["text"].split()
        if not words:
            continue
        page_num = 1
        for i in range(0, len(words), settings.WORDS_PER_PAGE):
            page_text = " ".join(words[i:i + settings.WORDS_PER_PAGE])
            pages_data.append({
                "chapter": chap["chapter"],
                "page": page_num,
                "text": page_text
            })
            page_num += 1
            
    return pages_data
