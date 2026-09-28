from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    EMBEDDING_MODEL: str = "BAAI/bge-base-en-v1.5"
    RERANKER_MODEL: str = "BAAI/bge-reranker-base"
    OLLAMA_URL: str = "http://localhost:11434"
    GENERATION_MODEL: str = "mistral:7b-instruct"
    RETRIEVE_K: int = 10
    RERANK_TOP_N: int = 4
    MAX_NEW_TOKENS: int = 400
    CHUNK_WORDS: int = 200
    CHUNK_OVERLAP_WORDS: int = 30
    WORDS_PER_PAGE: int = 300
    DATA_DIR: str = "./data"

    class Config:
        env_file = ".env"

settings = Settings()
