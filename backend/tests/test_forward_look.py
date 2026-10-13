import pytest
from unittest.mock import patch, MagicMock
from app.services.retrieval import check_forward_look_hint

def test_forward_look_hint_found():
    db_mock = MagicMock()
    
    with patch("app.services.retrieval.get_query_embedding") as mock_embed, \
         patch("app.services.retrieval.search_index_range") as mock_search_range, \
         patch("app.services.retrieval.rerank") as mock_rerank:
         
        mock_embed.return_value = [0.1] * 768
        mock_search_range.return_value = [18, 19]
        
        future_chunk1 = MagicMock(chunk_index=18, chapter="Chapter V", page=58, text="It was on a dreary night of November that I beheld the accomplishment of my toils.")
        future_chunk2 = MagicMock(chunk_index=19, chapter="Chapter V", page=59, text="With an anxiety that almost amounted to agony, I infused a spark of being.")
        
        db_mock.query().filter().all.return_value = [future_chunk1, future_chunk2]
        mock_rerank.return_value = [-1.5, -2.8] # Strong topical match in Chapter V
        
        hint = check_forward_look_hint(db_mock, book_id=1, bookmark_chunk_index=14, question="Does Victor animate the creature?")
        
        assert hint["found"] is True
        assert hint["chapter"] == "Chapter V"
        assert "Chapter V" in hint["nudge"]
        assert "Keep reading to discover it!" in hint["nudge"]

def test_forward_look_out_of_scope():
    db_mock = MagicMock()
    
    with patch("app.services.retrieval.get_query_embedding") as mock_embed, \
         patch("app.services.retrieval.search_index_range") as mock_search_range, \
         patch("app.services.retrieval.rerank") as mock_rerank:
         
        mock_embed.return_value = [0.1] * 768
        mock_search_range.return_value = []
        
        hint = check_forward_look_hint(db_mock, book_id=1, bookmark_chunk_index=14, question="What is the stock price of Apple?")
        
        assert hint["found"] is False
        assert hint["out_of_scope"] is True
