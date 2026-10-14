import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.services.generation import generate_answer

@pytest.mark.asyncio
async def test_qa():
    with patch("app.services.generation.httpx.AsyncClient") as mock_client:
        mock_instance = MagicMock()
        mock_client.return_value.__aenter__.return_value = mock_instance
        
        mock_response = MagicMock()
        mock_response.json.return_value = {"message": {"content": "Mock answer"}}
        mock_response.raise_for_status.return_value = None
        
        # AsyncMock for async methods
        mock_instance.post = AsyncMock(return_value=mock_response)
        
        chunks = [{"chapter": "1", "page": 1, "text": "foo", "chunk_index": 0}]
        answer = await generate_answer("test?", chunks)
        assert answer == "Mock answer"

@pytest.mark.asyncio
async def test_qa_fallback_when_ollama_offline():
    import httpx
    with patch("app.services.generation.httpx.AsyncClient") as mock_client:
        mock_instance = MagicMock()
        mock_client.return_value.__aenter__.return_value = mock_instance
        mock_instance.post = AsyncMock(side_effect=httpx.RequestError("Connection refused"))
        
        chunks = [{
            "chapter": "Chapter II",
            "page": 1,
            "text": "Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him.",
            "chunk_index": 0
        }]
        answer = await generate_answer("Who visited Bingley?", chunks)
        assert "Ollama LLM is offline" in answer
        assert "Mr. Bennet was among the earliest" in answer
        assert not answer.endswith("...")
