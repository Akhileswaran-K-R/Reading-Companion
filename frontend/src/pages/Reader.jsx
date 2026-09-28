import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChapters, getBookmark, updateBookmark, askQuestion, getLibrary } from '../api/client';
import { ChevronLeft, Send, Bookmark, Info, Loader, Book, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Reader() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [bookmark, setBookmark] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [position, setPosition] = useState(100);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadBookData();
  }, [bookId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadBookData = async () => {
    try {
      const { data: libData } = await getLibrary();
      const b = libData.find(i => i.book.id === parseInt(bookId));
      if (b) setBook(b.book);

      const { data: chaps } = await getChapters(bookId);
      setChapters(chaps);

      try {
        const { data: bm } = await getBookmark(bookId);
        setBookmark(bm.chunk_index);
      } catch (e) {
        // No bookmark yet
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetBookmark = async () => {
    try {
      const posRatio = position / 100;
      const { data } = await updateBookmark(bookId, { 
        chapter: selectedChapter || null,
        position: posRatio 
      });
      setBookmark(data.chunk_index);
      alert("Bookmark updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to set bookmark");
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!input.trim() || bookmark === null || book?.status !== 'ready') return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoadingAnswer(true);

    try {
      const { data } = await askQuestion(bookId, userMsg.content);
      const asstMsg = { 
        role: 'assistant', 
        content: data.answer,
        citations: data.citations
      };
      setMessages(prev => [...prev, asstMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to get an answer. Is the server running?" }]);
    }
    setLoadingAnswer(false);
  };

  if (!book) return <div className="p-8 text-center text-gray-500">Loading book data...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-blue-600 transition p-2 hover:bg-blue-50 rounded-full">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{book.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${book.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {book.status === 'ready' ? 'Ready for QA' : 'Processing...'}
              </span>
              {bookmark !== null && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                  <Bookmark size={12} />
                  Bookmark Set
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-auto lg:h-full overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 font-bold text-gray-700">
            <Bookmark size={20} className="text-blue-600" />
            Set Bookmark
          </div>
          <p className="text-sm text-gray-500 mb-6">
            The AI will only have context up to your bookmark to avoid spoilers.
          </p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter (Optional)</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedChapter}
                onChange={e => setSelectedChapter(e.target.value)}
              >
                <option value="">-- All / Entire Book --</option>
                {chapters.map(c => (
                  <option key={c.chapter} value={c.chapter}>{c.chapter || 'Unknown Chapter'}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Progress ({position}%)</label>
              <input 
                type="range" 
                min="0" max="100" 
                value={position} 
                onChange={e => setPosition(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-blue-600"
              />
            </div>
            
            <button 
              onClick={handleSetBookmark}
              disabled={book.status !== 'ready'}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Update Bookmark
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px] lg:h-full min-h-0">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
            <div className="font-bold text-gray-700">Reading Companion Chat</div>
            {book.status !== 'ready' || bookmark === null ? (
              <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                <Info size={16} />
                Needs processing and a bookmark to chat
              </div>
            ) : null}
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <BookOpen size={48} className="text-gray-300" />
                <p>Ask anything about the book up to your bookmark!</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'self-end ml-auto' : 'self-start mr-auto'}`}>
                  <div className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                    {m.role === 'user' ? m.content : <ReactMarkdown className="prose prose-sm max-w-none prose-blue">{m.content}</ReactMarkdown>}
                  </div>
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-200 self-start">
                      <div className="font-semibold mb-1 text-gray-700">Citations:</div>
                      <div className="space-y-1">
                        {Array.from(new Set(m.citations.map(c => 
                          `${c.chapter ? c.chapter : ''}${c.chapter && c.page ? ', ' : ''}${c.page ? `p. ${c.page}` : ''}`
                        ))).filter(Boolean).map((cite, j) => (
                          <div key={j} className="flex items-center gap-1.5">
                            <Book size={12} className="text-blue-500" /> {cite}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {loadingAnswer && (
              <div className="self-start mr-auto p-4 rounded-2xl bg-gray-100 text-gray-500 rounded-bl-none flex items-center gap-3 w-fit">
                <Loader className="animate-spin text-blue-500" size={18} />
                Thinking... (This may take 20-60 seconds on CPU)
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl">
            <form onSubmit={handleAsk} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={book.status !== 'ready' ? "Wait for processing to complete..." : bookmark === null ? "Set a bookmark first to chat..." : "Ask a question..."}
                disabled={book.status !== 'ready' || bookmark === null || loadingAnswer}
                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button 
                type="submit" 
                disabled={book.status !== 'ready' || bookmark === null || loadingAnswer || !input.trim()}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center w-14 shadow-sm"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
