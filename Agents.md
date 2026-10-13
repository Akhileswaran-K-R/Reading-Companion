# Bookie - Agent & System Specification (`Agents.md`)

## 1. Project Overview
**Bookie** is an NLP-powered reading companion tailored for new and developing readers to encourage healthy reading habits. It tracks reading lists ("Currently Reading" vs "Readlist / Completed") and enhances the experience through two core NLP capabilities:
1. **The Summariser:** Produces an overall book summary and structured chapter-by-chapter points of recall for completed books.
2. **The Spoiler-Free Chatbot:** Answers reader questions strictly using context read up to their current bookmark. It guards against hallucinations and spoiler leaks. When questions reference future events, it guides the reader forward (e.g., *"Keep reading up to Chapter X to find out!"*) without disclosing plot details.

---

## 2. Architecture & Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Server:** Uvicorn
- **Database / ORM:** SQLite via SQLAlchemy 2.0
- **Vector Search / Indexing:** FAISS (`faiss-cpu`)
- **Embeddings:** `sentence-transformers` (`BAAI/bge-base-en-v1.5`)
- **Reranker:** `BAAI/bge-reranker-base`
- **LLM / Generation:** Local LLM via Ollama (`mistral:7b-instruct`)
- **Book Ingestion & Parsing:** PyMuPDF (PDF), EbookLib (EPUB), Gutendex API (Project Gutenberg)

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Markdown Rendering:** `react-markdown`

---

## 3. Agent & Module Breakdown

### Agent 1: Book Ingestion & Indexing Pipeline
- **Role:** Parse uploaded files (EPUB/PDF) or fetched Gutenberg texts into structured chapters and chunks.
- **Responsibilities:**
  - Clean and normalize raw text.
  - Split text into sliding-window chunks (e.g., ~200 words with 30-word overlap) preserving chapter and page metadata.
  - Compute embeddings using `sentence-transformers` and build FAISS index files (`data/indexes/{book_id}.index`).
  - Store chunk records in the database (`Chunk` model).

### Agent 2: Spoiler-Free Chatbot Agent
- **Role:** Context-scoped conversational companion.
- **Policy & Constraints:**
  - **Spoiler Guard:** Retrieves candidate chunks constrained to `chunk_index <= bookmark.chunk_index`.
  - **Forward-Look Hinting:** If no confident match is found before the bookmark, inspects post-bookmark chunks. If a strong match exists further ahead, returns a spoiler-free nudge (e.g., *"This is revealed further along in Chapter X. Keep reading to discover it!"*).
  - **No Hallucination:** If the query is outside the context or scope of the book entirely, explicitly declares that the answer is not in the text, refusing to use external world knowledge about the book.
  - **Grounding & Citations:** Includes citations referencing the chapter and page numbers of the context used.

### Agent 3: Book Summariser & Recall Agent
- **Role:** Recall memory-booster for completed books.
- **Capabilities:**
  - **Overall Summary:** Synthesizes the core plot/themes of the book.
  - **Chapter-by-Chapter Recall Points:** Provides quick bullet-point takeaways and key moments per chapter.
  - **Target Audience:** Readers who finished a book and want to refresh their memory or reflect on key plot milestones.

### Agent 4: Library & Reading Habit Tracker
- **Role:** Manages reader state and progress.
- **State Machine:**
  - `to_read` → `currently_reading` → `completed`
  - Maintains `Bookmark` tracking current `chunk_index`, chapter, and page.
  - Triggers Summariser availability once a book status transitions to `completed`.

---

## 4. API Specification

| Endpoint | Method | Description |
|---|---|---|
| `/api/books/search?q={query}` | GET | Search Project Gutenberg catalog via Gutendex |
| `/api/books/add` | POST | Ingest a Gutenberg book by ID |
| `/api/books/upload` | POST | Upload and ingest local EPUB/PDF file |
| `/api/library/` | GET | List user's reading list and books |
| `/api/library/` | POST | Update status (`currently_reading`, `completed`) |
| `/api/bookmarks/{book_id}` | GET/POST | Get or update reader bookmark position |
| `/api/qa/{book_id}` | POST | Ask spoiler-free question to the Chatbot |
| `/api/books/{book_id}/summary` | GET/POST | Retrieve or generate overall summary & recall points |

---

## 5. Development Roadmap & Milestones

1. **Milestone 1 - Ingestion & Vector Storage Verification**
   - Ensure clean chunking, embedding generation, and FAISS indexing for Gutenberg, EPUB, and PDF sources.
2. **Milestone 2 - Spoiler-Free QA & Hint Pipeline**
   - Implement dual-stage retrieval (pre-bookmark context check followed by post-bookmark existence check).
   - Enforce anti-hallucination system prompt in Ollama generation.
3. **Milestone 3 - Summariser Service**
   - Build chapter summarization pipeline and overall summary synthesis.
   - Cache generated summaries in SQLite to avoid redundant LLM passes.
4. **Milestone 4 - Frontend Integration**
   - Wire up reading status controls in `Library.jsx`.
   - Add Summary & Recall view for completed books.
   - Integrate spoiler-free Chatbot sidebar in `Reader.jsx`.
