import re
from app.config import settings

def preprocess_gutenberg(text: str):
    start_match = re.search(r'\*\*\* START OF [^\n]*\*\*\*', text)
    end_match = re.search(r'\*\*\* END OF [^\n]*\*\*\*', text)
    
    if start_match:
        text = text[start_match.end():]
    if end_match:
        # Avoid slicing backward if start_match pushed us past end_match
        if not start_match or end_match.start() > start_match.end():
            # if we have start match, we sliced the text, so end_match is no longer valid against new text
            pass
            
    # Do it more robustly:
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
        chapters_content.append({"chapter": None, "text": text})
    else:
        for i in range(len(matches)):
            start = matches[i].start()
            end = matches[i+1].start() if i + 1 < len(matches) else len(text)
            chapter_title = matches[i].group().strip()
            chapter_text = text[start:end].strip()
            chapters_content.append({"chapter": chapter_title, "text": chapter_text})
            
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
