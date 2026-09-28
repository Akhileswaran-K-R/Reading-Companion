from app.services.preprocessing import preprocess_gutenberg

def parse_gutenberg(text: str):
    return preprocess_gutenberg(text)
