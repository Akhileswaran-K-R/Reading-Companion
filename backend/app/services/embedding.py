import os
from sentence_transformers import SentenceTransformer, CrossEncoder
from app.config import settings

_embedding_model = None
_reranker_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _embedding_model

def get_reranker_model():
    global _reranker_model
    if _reranker_model is None:
        _reranker_model = CrossEncoder(settings.RERANKER_MODEL)
    return _reranker_model

def get_embeddings(texts: list[str]):
    # batch-encode chunk texts, normalize
    model = get_embedding_model()
    embeddings = model.encode(texts, normalize_embeddings=True)
    return embeddings

def get_query_embedding(text: str):
    model = get_embedding_model()
    return model.encode([text], normalize_embeddings=True)[0]

def rerank(query: str, texts: list[str]):
    if not texts:
        return []
    model = get_reranker_model()
    pairs = [[query, text] for text in texts]
    scores = model.predict(pairs)
    return scores
