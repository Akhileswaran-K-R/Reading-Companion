import httpx
from fastapi import HTTPException

async def search_gutendex(query: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://gutendex.com/books/?search={query}")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching from Gutendex")
        return response.json()

async def get_book_details(gutenberg_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://gutendex.com/books/{gutenberg_id}")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching from Gutendex")
        return response.json()

async def download_gutenberg_text(text_url: str):
    async with httpx.AsyncClient(follow_redirects=True) as client:
        response = await client.get(text_url)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error downloading book text")
        return response.text
