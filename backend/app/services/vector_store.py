import os
import faiss
import numpy as np
from app.config import settings

def get_index_path(book_id: int) -> str:
    indexes_dir = os.path.join(settings.DATA_DIR, "indexes")
    os.makedirs(indexes_dir, exist_ok=True)
    return os.path.join(indexes_dir, f"{book_id}.faiss")

def create_and_save_index(book_id: int, embeddings: np.ndarray, chunk_indices: list[int]):
    d = embeddings.shape[1]
    # IndexIDMap(IndexFlatIP) for normalized vectors
    index = faiss.IndexIDMap(faiss.IndexFlatIP(d))
    index.add_with_ids(embeddings, np.array(chunk_indices, dtype=np.int64))
    faiss.write_index(index, get_index_path(book_id))

def search_index(book_id: int, query_embedding: np.ndarray, top_k: int, max_chunk_index: int):
    index_path = get_index_path(book_id)
    if not os.path.exists(index_path):
        return []
    
    index = faiss.read_index(index_path)
    
    # IDSelectorRange is [0, max_chunk_index) so we pass max_chunk_index + 1
    sel = faiss.IDSelectorRange(0, max_chunk_index + 1)
    params = faiss.SearchParameters(sel=sel)
    
    # query_embedding should be 2D: (1, d)
    query_2d = np.array([query_embedding], dtype=np.float32)
    distances, indices = index.search(query_2d, top_k, params=params)
    
    return [int(idx) for idx in indices[0] if idx != -1]

def search_index_range(book_id: int, query_embedding: np.ndarray, top_k: int, min_chunk_index: int, max_chunk_index: int):
    index_path = get_index_path(book_id)
    if not os.path.exists(index_path):
        return []
    
    index = faiss.read_index(index_path)
    sel = faiss.IDSelectorRange(int(min_chunk_index), int(max_chunk_index) + 1)
    params = faiss.SearchParameters(sel=sel)
    
    query_2d = np.array([query_embedding], dtype=np.float32)
    distances, indices = index.search(query_2d, top_k, params=params)
    return [int(idx) for idx in indices[0] if idx != -1]
