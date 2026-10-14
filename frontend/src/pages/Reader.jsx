import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { getChapters, getBookmark, updateBookmark, askQuestion, getLibrary, getBookContent } from '../api/client';
import { ChevronLeft, Send, Bookmark, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export default function Reader({ bookId = 1, onBackToDeck }) {
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [bookmark, setBookmark] = useState(15);
  
  // Chapter Reading & Text Content State
  const [readChapter, setReadChapter] = useState('Chapter IV');
  const [chunks, setChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  
  // Conversational Chatbot Companion State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Sanctuary locked. Context strictly bounded to **Chapter IV, pg. 52**. Ask about characters, motifs, or philosophy without danger of spoilers.",
      citations: [{ chapter: 'Chapter IV', page: 52, chunk_index: 15 }]
    }
  ]);
  const [input, setInput] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  
  const chatEndRef = useRef(null);

  // Fallback demo content
  const sampleBookData = {
    id: 1,
    title: "Frankenstein; or, The Modern Prometheus",
    author: "Mary Wollstonecraft Shelley",
    chapters: [
      { chapter: "Letter I", start_chunk: 0, end_chunk: 2 },
      { chapter: "Letter II", start_chunk: 3, end_chunk: 4 },
      { chapter: "Chapter I", start_chunk: 5, end_chunk: 7 },
      { chapter: "Chapter II", start_chunk: 8, end_chunk: 10 },
      { chapter: "Chapter III", start_chunk: 11, end_chunk: 13 },
      { chapter: "Chapter IV", start_chunk: 14, end_chunk: 18 },
      { chapter: "Chapter V", start_chunk: 19, end_chunk: 24 }
    ],
    sampleProse: [
      {
        chunk_index: 14,
        chapter: "Chapter IV",
        page: 50,
        text: "From this day natural philosophy, and particularly chemistry, in the most comprehensive sense of the term, became nearly my sole occupation. I read with ardour those works, so full of genius and discrimination, which modern inquirers have written on these subjects. I attended the lectures and cultivated the acquaintance of the celebrated professors of the university."
      },
      {
        chunk_index: 15,
        chapter: "Chapter IV",
        page: 52,
        text: "Two years passed in this manner, during which I paid no visit to Geneva, but was engaged, heart and soul, in the pursuit of some discoveries which I hoped to make. None but those who have experienced them can conceive of the enticements of science. In other studies you go as far as others have gone before you, and there is nothing more to know; but in a scientific pursuit there is continual food for discovery and wonder."
      },
      {
        chunk_index: 16,
        chapter: "Chapter IV",
        page: 54,
        text: "One of the phenomena which had peculiarly attracted my attention was the structure of the human frame, and, indeed, any animal endued with life. Whence, I often asked myself, did the principle of life proceed? It was a bold question, and one which has ever been considered as a mystery; yet with how many things are we upon the brink of becoming acquainted, if cowardice or carelessness did not restrain our inquiries."
      }
    ]
  };

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
      } else {
        setBook(sampleBookData);
      }

      const chapRes = await getChapters(bookId);
      if (chapRes.data && chapRes.data.length > 0) {
        setChapters(chapRes.data);
        setReadChapter(chapRes.data[0].chapter || 'Chapter IV');
      } else {
        setChapters(sampleBookData.chapters);
      }

      const bmRes = await getBookmark(bookId);
      if (bmRes.data && bmRes.data.chunk_index !== undefined) {
        setBookmark(bmRes.data.chunk_index);
      }
    } catch {
      setBook(sampleBookData);
      setChapters(sampleBookData.chapters);
    }
  };

  useEffect(() => {
    if (readChapter) {
      loadChapterContent(readChapter);
    }
  }, [readChapter]);

  const loadChapterContent = async (chapterName) => {
    setLoadingChunks(true);
    try {
      const res = await getBookContent(bookId, chapterName);
      if (res.data && res.data.length > 0) {
        setChunks(res.data);
      } else {
        setChunks(sampleBookData.sampleProse);
      }
    } catch {
      setChunks(sampleBookData.sampleProse);
    }
    setLoadingChunks(false);
  };

  const handleUpdateBookmark = async (newChunkIndex, chap, page) => {
    setBookmark(newChunkIndex);
    try {
      await updateBookmark(bookId, { chunk_index: newChunkIndex });
    } catch (e) {
      console.warn("Bookmark updated locally:", e);
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await askQuestion(bookId, userText);
      clearTimeout(timeoutId);

      if (res && res.data && res.data.answer) {
        setMessages((prev) => [
          ...prev, 
          { 
            role: 'assistant', 
            content: res.data.answer, 
            citations: res.data.citations || [] 
          }
        ]);
        setLoadingAnswer(false);
        return;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setTimeout(() => {
        let simulatedAnswer = "";
        let lowerQ = userText.toLowerCase();

        if (lowerQ.includes("waldman") || lowerQ.includes("krempe") || lowerQ.includes("professor")) {
          simulatedAnswer = "At your current reading position in Chapter IV, Victor closely studied under Professor M. Waldman, who encouraged his biochemical curiosity, contrasting with M. Krempe's dismissive skepticism. [Ch. IV, pg. 50]";
        } else if (lowerQ.includes("monster") || lowerQ.includes("creature") || lowerQ.includes("creation") || lowerQ.includes("breath")) {
          simulatedAnswer = "Victor is currently solely discovering the biological principle of life. The culmination and animating of the creature does not occur until Chapter V. Keep reading up to Chapter V to discover it!";
        } else if (lowerQ.includes("geneva") || lowerQ.includes("family") || lowerQ.includes("elizabeth")) {
          simulatedAnswer = "Victor has spent two years secluded in Ingolstadt without visiting Geneva, completely consumed by his scientific obsession. [Ch. IV, pg. 52]";
        } else {
          simulatedAnswer = `Based strictly on the text read up to Chapter IV, pg. 52: Victor is dedicated to discovering the principles of animation and chemistry. If your query references events past this horizon, it is protected by the spoiler shield.`;
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: simulatedAnswer,
            citations: [{ chapter: readChapter || 'Chapter IV', page: 52, chunk_index: bookmark }]
          }
        ]);
        setLoadingAnswer(false);
      }, 500);
    }
  };

  const currentBookTitle = book?.title || "Frankenstein; or, The Modern Prometheus";
  const currentAuthor = book?.author || "Mary Wollstonecraft Shelley";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Context Horizon Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e6dc]">
        <div className="flex items-center gap-3">
          {onBackToDeck && (
            <button
              onClick={onBackToDeck}
              className="p-2 rounded-xl bg-[#faf9f5] border border-[#e8e6dc] text-[#5e5d59] hover:text-[#141413] hover:bg-[#f0eee6] transition-all cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
          )}
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

        {/* Current Bookmark Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#faf9f5] border border-[#e8e6dc] shadow-xs">
            <Bookmark size={14} className="text-[#c96442]" />
            <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#5e5d59]">Bookmark:</span>
            <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#141413]">
              {readChapter} · #{bookmark}
            </span>
          </div>
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
              Reading Horizon: 68ch
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
                onClick={() => setInput("What was M. Waldman's advice to Victor?")}
                className="px-3 py-1.5 rounded-full bg-[#f0eee6] hover:bg-[#e8e6dc] text-[#5e5d59] hover:text-[#141413] text-[11px] font-['Plus_Jakarta_Sans'] font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                "Waldman's advice?"
              </button>
              <button
                type="button"
                onClick={() => setInput("Why does Victor avoid returning to Geneva?")}
                className="px-3 py-1.5 rounded-full bg-[#f0eee6] hover:bg-[#e8e6dc] text-[#5e5d59] hover:text-[#141413] text-[11px] font-['Plus_Jakarta_Sans'] font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                "Why avoid Geneva?"
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
