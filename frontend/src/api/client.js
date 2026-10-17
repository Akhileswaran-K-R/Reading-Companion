const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchApi(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set default headers if not provided
  const headers = { ...options.headers };
  // If the body is not FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `API error: ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(errorDetail);
  }

  // To prevent rewriting all the React components, we mimic the Axios response signature
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    return { data };
  }
  return { data: null };
}

export const searchBooks = (query) => fetchApi(`/books/search?q=${encodeURIComponent(query)}`);

export const addBook = (gutenbergId) => fetchApi('/books/add', {
  method: 'POST',
  body: JSON.stringify({ gutenberg_id: gutenbergId }),
});

export const uploadBook = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return fetchApi('/books/upload', {
    method: 'POST',
    body: formData,
  });
};

export const getLibrary = () => fetchApi('/library/');

export const updateLibrary = (bookId, status) => fetchApi('/library/', {
  method: 'POST',
  body: JSON.stringify({ book_id: bookId, status }),
});

export const setActiveBook = (bookId) => fetchApi(`/library/active/${bookId}`, {
  method: 'PUT',
});

export const getChapters = (bookId) => fetchApi(`/books/${bookId}/chapters`);

export const getBookContent = (bookId, chapter) => 
  fetchApi(`/books/${bookId}/content` + (chapter ? `?chapter=${encodeURIComponent(chapter)}` : ''));

export const getBookmark = (bookId) => fetchApi(`/bookmarks/${bookId}`);

export const updateBookmark = (bookId, data) => fetchApi(`/bookmarks/${bookId}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const askQuestion = (bookId, question) => fetchApi(`/qa/${bookId}`, {
  method: 'POST',
  body: JSON.stringify({ question }),
});

export const getBookSummary = (bookId, unlocked = false) => 
  fetchApi(`/books/${bookId}/summary${unlocked ? '?unlocked=true' : ''}`);

export const generateBookSummary = (bookId) => fetchApi(`/books/${bookId}/summary`, {
  method: 'POST',
});
