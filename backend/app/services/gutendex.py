import httpx
from fastapi import HTTPException

async def search_gutendex(query: str):
    try:
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True, verify=False) as client:
            response = await client.get(f"https://gutendex.com/books?search={query}")
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Error fetching from Gutendex")
            return response.json()
    except httpx.RequestError as e:
        # Return empty list or graceful fallback if the external API is completely down/timing out
        return {"results": []}

async def get_book_details(gutenberg_id: int):
    try:
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True, verify=False) as client:
            response = await client.get(f"https://gutendex.com/books/{gutenberg_id}")
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Error fetching from Gutendex")
            return response.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail="Gutendex API is currently unreachable. Please try again later.")

async def download_gutenberg_text(text_url: str):
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=60.0, verify=False) as client:
            response = await client.get(text_url)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Error downloading book text")
            return response.text
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail="Failed to download book text from Gutenberg. The server might be down.")
