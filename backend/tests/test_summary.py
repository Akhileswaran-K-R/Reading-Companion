import pytest
from unittest.mock import patch, MagicMock
from app.services.summary import get_or_generate_summary

@pytest.mark.asyncio
async def test_summary_generation_and_caching():
    db_mock = MagicMock()
    # First call: no cached summary
    db_mock.query().filter().first.return_value = None
    
    # Mock chunks in book
    chunk1 = MagicMock(chunk_index=0, chapter="Chapter I", text="Victor was born in Geneva and had loving parents.")
    chunk2 = MagicMock(chunk_index=1, chapter="Chapter I", text="He studied natural philosophy with fierce obsession.")
    chunk3 = MagicMock(chunk_index=2, chapter="Chapter II", text="At Ingolstadt, Victor unlocked the secrets of vitality.")
    
    db_mock.query().filter().order_by().all.return_value = [chunk1, chunk2, chunk3]
    
    result = await get_or_generate_summary(db_mock, book_id=1, force_regenerate=True)
    
    assert result["book_id"] == 1
    assert "overall_summary" in result
    assert len(result["recall_points"]) >= 2
    assert result["recall_points"][0]["chapter"] == "Chapter I"
    assert len(result["recall_points"][0]["points"]) > 0
    # Verifies db.add was called to cache summary
    assert db_mock.add.called
    assert db_mock.commit.called
