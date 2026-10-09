import os
from sentence_transformers import SentenceTransformer, CrossEncoder
from app.config import settings

# Load model once at startup
embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
reranker_model = CrossEncoder(settings.RERANKER_MODEL)

def get_embeddings(texts: list[str]):
    # batch-encode chunk texts, normalize
    embeddings = embedding_model.encode(texts, normalize_embeddings=True)
    return embeddings

def get_query_embedding(text: str):
    return embedding_model.encode([text], normalize_embeddings=True)[0]

def rerank(query: str, texts: list[str]):
    # returns list of scores
    pairs = [[query, text] for text in texts]
    scores = reranker_model.predict(pairs)
    return scores
