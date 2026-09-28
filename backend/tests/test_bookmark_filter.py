import pytest
from unittest.mock import patch, MagicMock
from app.services.retrieval import retrieve_and_rerank_chunks

def test_bookmark_filter():
    db_mock = MagicMock()
    bookmark_mock = MagicMock()
    bookmark_mock.chunk_index = 5
    db_mock.query().filter().first.return_value = bookmark_mock
    
    with patch("app.services.retrieval.get_query_embedding") as mock_embed, \
         patch("app.services.retrieval.search_index") as mock_search, \
         patch("app.services.retrieval.rerank") as mock_rerank:
        
        mock_embed.return_value = [0.1] * 768
        mock_search.return_value = [2, 4]
        
        chunk1 = MagicMock(chunk_index=2, text="text2")
        chunk2 = MagicMock(chunk_index=4, text="text4")
        
        db_mock.query().filter().all.return_value = [chunk1, chunk2]
        mock_rerank.return_value = [0.9, 0.8]
        
        chunks = retrieve_and_rerank_chunks(db_mock, 1, 1, "test")
        
        assert len(chunks) == 2
        for c in chunks:
            assert c.chunk_index <= 5
