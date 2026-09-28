# Reading Companion

A full-stack web application that allows users to add books to a reading list, set a bookmark in the book they're reading, and ask questions answered ONLY from content at or before the bookmark (spoiler-safe). 

## Architecture

The system operates strictly locally, without external LLM APIs, and is optimized for CPU-only environments. It consists of two main pipelines:

### 1. Ingestion Pipeline
1. **Load**: Books are added via Gutendex API search or direct upload (EPUB/PDF). Text is fetched or extracted.
2. **Preprocess**: Project Gutenberg boilerplate is removed. Books are parsed into chapters and paginated (synthetic pages for text/epub, real pages for PDF).
3. **Chunking**: Text is chunked (default 200 words, 30 words overlap) strictly within chapter boundaries to prevent bleeding context. Each chunk is assigned a monotonically increasing `chunk_index` which represents the reading order.
4. **Embedding**: Chunk texts are embedded using the local `sentence-transformers` model (`BAAI/bge-base-en-v1.5`) running on CPU.
5. **Storage**: The chunks and metadata (chapter, page, text) are stored in SQLite. The embeddings are stored in a FAISS vector index (using `IndexIDMap(IndexFlatIP)` with normalized vectors) where the FAISS ID perfectly matches the SQLite `chunk_index`.

### 2. Question-Answering (QA) Pipeline
1. **Embedding**: The user's question is embedded using the same model.
2. **Bookmark Enforcement**: The current user's bookmark (representing a `chunk_index`) is loaded.
3. **Filtered Retrieval**: We search the FAISS index by passing `faiss.SearchParameters(sel=faiss.IDSelectorRange(0, bookmark + 1))`. This mathematically guarantees that no chunk past the bookmark is ever retrieved or seen by the generation model (preventing spoilers).
4. **Reranking**: The retrieved chunks are fetched from SQLite and reranked using a CrossEncoder (`BAAI/bge-reranker-base`) for optimal context selection.
5. **Generation**: The top reranked chunks (ordered by `chunk_index` for coherence) are sent to an Ollama instance (default `mistral:7b-instruct`) over HTTP. The prompt instructs the model to answer *only* from the context.
6. **Citation**: The system returns the generated answer alongside deterministic citations (chapter and page) derived from the SQLite metadata of the retrieved chunks.

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.com/)

### 1. Start Ollama and Pull the Model
Ensure your Ollama instance is running. If it's on a separate GPU machine, configure `OLLAMA_URL` in the `.env` file later.
```bash
ollama pull mistral:7b-instruct
```
*(If you want to use the alternative model from the prompt, use `llama3.2:3b-instruct-q4_K_M` and update `.env`)*

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Unix/MacOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Start the server (runs on http://localhost:8000)
uvicorn app.main:app --reload
```

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.
