import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getChapters, getBookmark, updateBookmark, askQuestion, getLibrary, getBookContent } from '../api/client';
import { ChevronLeft, Send, Bookmark, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export default function Reader({ bookId: propBookId, onBackToDeck, onOpenSummary, onUpdateBookmark }) {
  const { bookId: paramBookId } = useParams();
  const navigate = useNavigate();
  const bookId = paramBookId ? Number(paramBookId) : (propBookId || 1);
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [bookmark, setBookmark] = useState(0);
  
  // Chapter Reading & Text Content State
  const [readChapter, setReadChapter] = useState('');
  const [chunks, setChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  
  // Conversational Chatbot Companion State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Sanctuary locked. Context strictly bounded to your active bookmark. Ask about characters, motifs, or philosophy without danger of spoilers.",
      citations: []
    }
  ]);
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
      const libRes = await getLibrary();
      const current = libRes.data?.find((i) => String(i.book.id) === String(bookId));
      if (current) {
        setBook(current.book);
      }

      const chapRes = await getChapters(bookId);
      if (chapRes.data && chapRes.data.length > 0) {
        setChapters(chapRes.data);
        if (!readChapter) {
          setReadChapter(chapRes.data[0].chapter);
        }
      }

      const bmRes = await getBookmark(bookId);
      if (bmRes.data && bmRes.data.chunk_index !== undefined) {
        setBookmark(bmRes.data.chunk_index);
        if (bmRes.data.chapter) {
          setReadChapter(bmRes.data.chapter);
        }
        if (onUpdateBookmark && bmRes.data.chapter) {
          onUpdateBookmark(bookId, bmRes.data.chapter, bmRes.data.page || 1);
        }
      }
    } catch (e) {
      console.warn("Failed loading book reader data:", e);
    }
  };

  useEffect(() => {
    if (readChapter && bookId) {
      loadChapterContent(readChapter);
    }
  }, [readChapter, bookId]);

  const loadChapterContent = async (chapterName) => {
    setLoadingChunks(true);
    try {
      const res = await getBookContent(bookId, chapterName);
      if (res.data && res.data.length > 0) {
        setChunks(res.data);
      } else {
        setChunks([]);
      }
    } catch {
      setChunks([]);
    }
    setLoadingChunks(false);
  };

  const handleUpdateBookmark = async (newChunkIndex, chap, page) => {
    setBookmark(newChunkIndex);
    if (chap) setReadChapter(chap);
    try {
      const res = await updateBookmark(bookId, { chunk_index: newChunkIndex });
      const finalChap = res?.data?.chapter || chap;
      const finalPage = res?.data?.page || page;
      if (onUpdateBookmark) {
        onUpdateBookmark(bookId, finalChap, finalPage);
      }
    } catch (e) {
      console.warn("Bookmark updated locally:", e);
      if (onUpdateBookmark) {
        onUpdateBookmark(bookId, chap, page);
      }
    }
  };

  // Robust Context-Safe Q&A Handler
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loadingAnswer) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoadingAnswer(true);

    try {
      const res = await askQuestion(bookId, userText);
      if (res && res.data && res.data.answer) {
        setMessages((prev) => [
          ...prev, 
          { 
            role: 'assistant', 
            content: res.data.answer, 
            citations: res.data.citations || [] 
          }
        ]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Based strictly on the text read up to your bookmark, the assistant is currently unable to generate a response. Please verify that the local LLM is running.",
          citations: []
        }
      ]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const currentBookTitle = book?.title || "Volume Parchment";
  const currentAuthor = book?.author || "Author";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Context Horizon Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e6dc]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onBackToDeck ? onBackToDeck() : navigate('/sanctuary')}
            className="p-2 rounded-xl bg-[#faf9f5] border border-[#e8e6dc] text-[#5e5d59] hover:text-[#141413] hover:bg-[#f0eee6] transition-all cursor-pointer"
            title="Return to Sanctuary Deck"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#c96442]">
              <span>Sanctuary Reading Conduit</span>
            </div>
            <h1 className="font-serif text-2xl text-[#141413] leading-tight">
              {currentBookTitle}
            </h1>
            <p className="font-serif italic text-xs text-[#5e5d59]">
              {currentAuthor}
            </p>
          </div>
        </div>

        {/* Current Bookmark Badge & Recall Points */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#faf9f5] border border-[#e8e6dc] shadow-xs">
            <Bookmark size={14} className="text-[#c96442]" />
            <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#5e5d59]">Bookmark:</span>
            <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#141413]">
              {readChapter} · #{bookmark}
            </span>
          </div>

          <button
            onClick={() => onOpenSummary ? onOpenSummary() : navigate(`/summary/${bookId}`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#faf9f5] border border-[#e8e6dc] hover:border-[#c96442]/60 hover:bg-[#f0eee6] transition-all cursor-pointer text-xs shadow-xs"
            title="View spoiler-guarded recall points"
          >
            <Sparkles size={13} className="text-[#c96442]" />
            <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[#141413]">Recall Points</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Reading Canvas Conduit (Col 7) */}
        <div className="lg:col-span-7 bg-[#faf9f5] rounded-3xl border border-[#e8e6dc] p-8 sm:p-10 space-y-8 shadow-[0_1px_4px_rgba(20,20,19,0.02)]">
          {/* Chapter Selector */}
          <div className="flex items-center justify-between border-b border-[#f0eee6] pb-4">
            <div className="flex items-center gap-2">
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-[#5e5d59]">
                Chapter:
              </span>
              <select
                value={readChapter}
                onChange={(e) => setReadChapter(e.target.value)}
                className="bg-[#f5f4ed] border border-[#e8e6dc] focus:border-[#c96442] rounded-xl px-3 py-1.5 text-xs font-serif text-[#141413] outline-none"
              >
                {chapters.map((c, idx) => (
                  <option key={idx} value={c.chapter}>
                    {c.chapter || `Chapter ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#87867f]">
              Reading Horizon: {chunks.length} chunks
            </span>
          </div>

          {/* Book Prose Reading Conduit */}
          <div className="space-y-6 max-w-[720px] mx-auto text-[#141413]">
            {loadingChunks ? (
              <div className="py-20 text-center font-serif italic text-base text-[#5e5d59]">
                Opening volume parchment...
              </div>
            ) : (
              chunks.map((c) => {
                const isCurrentBookmark = c.chunk_index === bookmark;

                return (
                  <div
                    key={c.chunk_index}
                    className={`relative p-5 rounded-2xl transition-all duration-300 ${
                      isCurrentBookmark
                        ? 'bg-[#f0eee6] ring-1 ring-[#c96442]/30 shadow-xs'
                        : 'hover:bg-[#fbf9f2]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-[#87867f] font-['Plus_Jakarta_Sans'] mb-2">
                      <span>{c.chapter} · pg. {c.page}</span>
                      <button
                        onClick={() => handleUpdateBookmark(c.chunk_index, c.chapter, c.page)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-['Plus_Jakarta_Sans'] font-bold uppercase transition-all cursor-pointer ${
                          isCurrentBookmark
                            ? 'bg-[#c96442] text-white shadow-xs'
                            : 'text-[#5e5d59] hover:text-[#141413] hover:bg-[#e8e6dc]'
                        }`}
                      >
                        <Bookmark size={11} />
                        <span>{isCurrentBookmark ? 'Active Horizon' : 'Set Bookmark'}</span>
                      </button>
                    </div>

                    <p className="font-serif text-[18px] sm:text-[19px] leading-[1.8] text-[#141413]">
                      {c.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Docked Spoiler-Free Marginalia Companion (Col 5) */}
        <div className="lg:col-span-5 bg-[#faf9f5] rounded-3xl border border-[#e8e6dc] shadow-[0_1px_4px_rgba(20,20,19,0.02)] flex flex-col h-[750px] sticky top-24 overflow-hidden">
          {/* Companion Deck Header */}
          <div className="p-5 border-b border-[#f0eee6] bg-[#faf9f5] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c96442]"></span>
                <h2 className="font-serif text-lg text-[#141413] font-normal">
                  Spoiler-Free Marginalia
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdbd0] text-[#7e2c0e] font-['Plus_Jakarta_Sans'] text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck size={12} />
                Guard Active
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#f5f4ed] border border-[#e8e6dc] text-xs font-['Plus_Jakarta_Sans'] text-[#5e5d59]">
              <p>
                <strong className="text-[#141413]">Boundary:</strong> Answers strictly locked up to <span className="text-[#c96442] font-bold">{readChapter} (#{bookmark})</span>.
              </p>
            </div>
          </div>

          {/* Chat Feed Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#faf9f5]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl p-4 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#e8e6dc] text-[#141413] rounded-tr-xs font-sans font-medium'
                      : 'bg-[#f5f4ed] text-[#141413] border border-[#e8e6dc] rounded-tl-xs font-serif text-[15px]'
                  }`}
                >
                  <ReactMarkdown>{m.content}</ReactMarkdown>

                  {/* Marginalia Citation Chips */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[#e8e6dc]/60 flex flex-wrap gap-1.5">
                      {m.citations.map((cit, cIdx) => (
                        <span
                          key={cIdx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#faf9f5] border border-[#e8e6dc] font-['Plus_Jakarta_Sans'] text-[10px] text-[#c96442] font-semibold"
                        >
                          <Bookmark size={9} />
                          {cit.chapter || 'Ref'}, pg. {cit.page || '—'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loadingAnswer && (
              <div className="flex items-center gap-2 text-xs font-['Plus_Jakarta_Sans'] text-[#5e5d59] italic p-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c96442] animate-pulse"></span>
                <span>Consulting verified context prior to bookmark...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Idea Chips & Prompt Composer */}
          <div className="p-4 border-t border-[#f0eee6] bg-[#faf9f5] space-y-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setInput(`Who are the main characters in the story?`)}
                className="px-3 py-1.5 rounded-full bg-[#f0eee6] hover:bg-[#e8e6dc] text-[#5e5d59] hover:text-[#141413] text-[11px] font-['Plus_Jakarta_Sans'] font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                "Key figures here?"
              </button>
              <button
                type="button"
                onClick={() => setInput(`What is the central dilemma in the story?`)}
                className="px-3 py-1.5 rounded-full bg-[#f0eee6] hover:bg-[#e8e6dc] text-[#5e5d59] hover:text-[#141413] text-[11px] font-['Plus_Jakarta_Sans'] font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                "Main conflict so far?"
              </button>
              <button
                type="button"
                onClick={() => setInput("What important developments have happened in the story?")}
                className="px-3 py-1.5 rounded-full bg-[#f0eee6] hover:bg-[#e8e6dc] text-[#5e5d59] hover:text-[#141413] text-[11px] font-['Plus_Jakarta_Sans'] font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                "Recall up to bookmark"
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask a spoiler-safe inquiry..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-[#f5f4ed] border border-[#e8e6dc] focus:border-[#c96442] text-sm text-[#141413] placeholder-[#87867f] rounded-2xl pl-4 pr-12 py-3.5 outline-none font-sans transition-all"
              />
              <button
                type="submit"
                disabled={loadingAnswer || !input.trim()}
                className="absolute right-1.5 p-2 rounded-xl bg-[#c96442] hover:bg-[#b35535] disabled:opacity-40 text-white transition-all cursor-pointer shadow-xs"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
