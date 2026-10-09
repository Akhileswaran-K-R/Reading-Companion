import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChapters, getBookmark, updateBookmark, askQuestion, getLibrary, getBookContent } from '../api/client';
import { ChevronLeft, Send, Bookmark, Info, Loader, Book, BookOpen, MessageSquare, BookText } from 'lucide-react';


export default function Reader() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [bookmark, setBookmark] = useState(null);
  
  // Left Sidebar State (legacy bookmark slider)
  const [selectedChapter, setSelectedChapter] = useState('');
  const [position, setPosition] = useState(100);
  
  // Tabs: 'chat' or 'read'
  const [activeTab, setActiveTab] = useState('chat');
  
  // Read Tab State
  const [readChapter, setReadChapter] = useState('');
  const [chunks, setChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  
  // Chat Tab State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadBookData();
  }, [bookId]);

  useEffect(() => {
    if (chatEndRef.current && activeTab === 'chat') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  useEffect(() => {
    if (activeTab === 'read' && chapters.length > 0) {
      if (!readChapter) {
        setReadChapter(chapters[0].chapter || '');
      }
    }
  }, [activeTab, chapters]);

  useEffect(() => {
    if (activeTab === 'read' && readChapter !== null) {
      loadChapterContent(readChapter);
    }
  }, [readChapter, activeTab]);

  // Sync the manual sidebar UI whenever the actual bookmark chunk changes
  useEffect(() => {
    if (bookmark !== null && chapters.length > 0) {
      const maxChunk = Math.max(...chapters.map(c => c.end_chunk || 0));
      if (maxChunk > 0) {
        // Prevent division by zero and cap at 100
        setPosition(Math.min(100, Math.round((bookmark / maxChunk) * 100)));
      }
      
      const chap = chapters.find(c => bookmark >= c.start_chunk && bookmark <= c.end_chunk);
      if (chap) {
        setSelectedChapter(chap.chapter);
      }
    }
  }, [bookmark, chapters]);

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

  const loadChapterContent = async (chapter) => {
    setLoadingChunks(true);
    try {
      const { data } = await getBookContent(bookId, chapter);
      setChunks(data);
    } catch (e) {
      console.error("Failed to load chunks", e);
    }
    setLoadingChunks(false);
  };

  const handleSetBookmarkSlider = async () => {
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

  const handleSetBookmarkChunk = async (chunkIndex) => {
    try {
      const { data } = await updateBookmark(bookId, { 
        chunk_index: chunkIndex 
      });
      setBookmark(data.chunk_index);
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
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-auto lg:h-full overflow-y-auto hidden lg:flex">
          <div className="flex items-center gap-2 mb-4 font-bold text-gray-700">
            <Bookmark size={20} className="text-blue-600" />
            Manual Bookmark
          </div>
          <p className="text-sm text-gray-500 mb-6">
            If you are reading elsewhere, estimate your progress here.
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
                  <option key={c.chapter} value={c.chapter}>{c.chapter ? c.chapter.replace(/[\]\[]/g, '') : 'Unknown Chapter'}</option>
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
              onClick={handleSetBookmarkSlider}
              disabled={book.status !== 'ready'}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Update Bookmark
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px] lg:h-full min-h-0">
          <div className="flex border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <button 
              onClick={() => setActiveTab('read')}
              className={`flex-1 p-4 font-bold flex justify-center items-center gap-2 transition ${activeTab === 'read' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <BookText size={18} />
              Read Book
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 p-4 font-bold flex justify-center items-center gap-2 transition ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <MessageSquare size={18} />
              Chat & QA
            </button>
          </div>

          {activeTab === 'read' ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Select Chapter:</span>
                <select 
                  className="p-1.5 border border-gray-300 rounded-lg text-sm outline-none max-w-[300px]"
                  value={readChapter}
                  onChange={e => setReadChapter(e.target.value)}
                >
                  {chapters.map(c => (
                    <option key={c.chapter} value={c.chapter}>{c.chapter ? c.chapter.replace(/[\]\[]/g, '') : 'Unknown Chapter'}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 p-6 overflow-y-auto bg-stone-50">
                {loadingChunks ? (
                  <div className="flex justify-center mt-10"><Loader className="animate-spin text-blue-500" /></div>
                ) : chunks.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10">No content found for this chapter.</div>
                ) : (
                  <div className="max-w-3xl mx-auto bg-[#fbf6e9] text-[#2c241b] p-8 md:p-16 shadow-inner rounded-xl border border-[#e8dfc8]">
                    <div className="text-lg leading-[2.2] font-serif text-justify pb-32">
                      {chunks.map((chunk, i) => {
                        // Create realistic-looking paragraph breaks out of the squashed text
                        let formattedText = "";
                        let lastBreak = 0;
                        for (let j = 0; j < chunk.text.length; j++) {
                          formattedText += chunk.text[j];
                          if ((chunk.text[j] === '.' || chunk.text[j] === '!' || chunk.text[j] === '?') && 
                              j + 1 < chunk.text.length && chunk.text[j+1] === ' ') {
                            // Break paragraph roughly every 250 characters if it's the end of a sentence
                            if (j - lastBreak > 250) {
                              formattedText += "<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                              lastBreak = j;
                              j++; // skip the original space
                            }
                          }
                        }
                        
                        return (
                          <span 
                            key={i} 
                            onClick={() => handleSetBookmarkChunk(chunk.chunk_index)}
                            title="Click to set your bookmark here"
                            className={`transition-colors cursor-pointer rounded px-1 ${
                              bookmark === chunk.chunk_index 
                                ? 'bg-blue-200/60 text-blue-900 font-medium border-b-2 border-blue-400' 
                                : 'hover:bg-[#f0e4cc]'
                            }`}
                            dangerouslySetInnerHTML={{ __html: formattedText + ' ' }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-2 border-b border-gray-100 flex justify-between items-center bg-white">
                <div></div>
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
                        {m.role === 'user' ? m.content : <div className="prose prose-sm max-w-none prose-blue whitespace-pre-wrap">{String(m.content)}</div>}
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
          )}
        </div>
      </div>
    </div>
  );
}
