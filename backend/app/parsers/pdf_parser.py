import fitz # PyMuPDF
import re
from app.config import settings

def parse_pdf(file_path: str):
    doc = fitz.open(file_path)
    pages_data = []
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text()
        text = re.sub(r'\s+', ' ', text).strip()
        
        if not text:
            continue
            
        pages_data.append({
            "chapter": None,
            "page": page_num + 1,
            "text": text
        })
        
    return pages_data
