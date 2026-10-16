import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Sparkles, BookOpen, Layers, CheckCircle2, RotateCw, ShieldCheck, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { getBookSummary, generateBookSummary, getLibrary } from '../api/client';

export default function SummaryView({ bookId: propBookId, onBackToDeck }) {
  const { bookId: paramBookId } = useParams();
  const navigate = useNavigate();
  const bookId = paramBookId ? Number(paramBookId) : (propBookId || 1);
  const [activeTab, setActiveTab] = useState('synthesis');
  const [remoteSummary, setRemoteSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [bookMeta, setBookMeta] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (bookId) {
      loadSummary(isUnlocked);
    }
  }, [bookId]);

  const loadSummary = async (unlockedState = isUnlocked) => {
    setLoading(true);
    try {
      const libRes = await getLibrary();
      const current = libRes.data?.find((i) => String(i.book.id) === String(bookId));
      if (current) {
        setBookMeta(current.book);
      }

      const res = await getBookSummary(bookId, unlockedState);
      if (res?.data) {
        setRemoteSummary(res.data);
      }
    } catch (err) {
      console.warn("Summary load:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUnlock = async (unlock) => {
    setIsUnlocked(unlock);
    await loadSummary(unlock);
  };

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateBookSummary(bookId);
      if (res?.data) {
        setRemoteSummary(res.data);
      }
    } catch (err) {
      alert("Summary generation in progress or local LLM offline. Please retry shortly.");
    } finally {
      setGenerating(false);
    }
  };

  const title = remoteSummary?.title || bookMeta?.title || "Volume Synthesis";
  const author = remoteSummary?.author || bookMeta?.author || "Author";
  const totalChapters = remoteSummary?.recall_points?.length || 0;
  const isBounded = remoteSummary?.is_bounded;
  const bookmarkChapter = remoteSummary?.bookmark_chapter;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Header / Volume Metadata */}
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#c96442]">
                Recall & Memory Booster
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e8e6dc] text-[#5e5d59] text-[10px] font-['Plus_Jakarta_Sans'] font-bold uppercase">
                <CheckCircle2 size={11} className="text-[#c96442]" />
                Volume Summary
              </span>
              {isBounded && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#faede6] border border-[#f0dfcc] text-[#c96442] text-[10px] font-['Plus_Jakarta_Sans'] font-bold uppercase">
                  <ShieldCheck size={11} />
                  Spoiler Shield Active
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl text-[#141413] leading-tight mt-0.5">
              {title}
            </h1>
            <p className="font-serif italic text-sm text-[#5e5d59]">
              {author} · {totalChapters} {isBounded ? `Chapters Read (Bounded to ${bookmarkChapter})` : 'Chapters Summarized'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/reader/${bookId}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#c96442] hover:bg-[#b35535] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            <BookOpen size={13} />
            <span>Open Reader</span>
          </button>

          <button
            onClick={handleRegenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e8e6dc] bg-[#faf9f5] hover:bg-[#f0eee6] text-xs font-['Plus_Jakarta_Sans'] font-bold uppercase text-[#141413] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RotateCw size={13} className={generating ? "animate-spin text-[#c96442]" : "text-[#c96442]"} />
            <span>{generating ? "Synthesizing..." : "Regenerate Recall"}</span>
          </button>
        </div>
      </div>

      {/* Spoiler Guard Notification Banner */}
      {isBounded ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#faf6f0] border border-[#f0dfcc] text-[#141413]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f7ebe1] border border-[#edd7c2] flex items-center justify-center text-[#c96442] shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-[#c96442]">
                  Bookmark-Bounded Recall
                </span>
                <span className="text-xs text-[#5e5d59]">· Synchronized with {bookmarkChapter || "Active Reading Mark"}</span>
              </div>
              <p className="font-serif text-xs text-[#5e5d59] mt-0.5">
                Recall points past your current bookmark are shielded to preserve suspense and plot discoveries.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggleUnlock(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#e8e6dc] bg-[#faf9f5] hover:bg-[#f0eee6] text-xs font-['Plus_Jakarta_Sans'] font-semibold text-[#5e5d59] hover:text-[#141413] transition-all cursor-pointer shrink-0"
          >
            <Eye size={13} className="text-[#c96442]" />
            <span>Reveal Full Volume (Show Spoilers)</span>
          </button>
        </div>
      ) : isUnlocked ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#faf9f5] border border-[#e8e6dc] text-[#141413]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f0eee6] border border-[#e8e6dc] flex items-center justify-center text-[#5e5d59] shrink-0">
              <ShieldAlert size={18} className="text-[#c96442]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-[#141413]">
                  Full Volume Unlocked
                </span>
                <span className="text-xs text-[#5e5d59]">· All {totalChapters} chapters revealed</span>
              </div>
              <p className="font-serif text-xs text-[#5e5d59] mt-0.5">
                Showing complete volume milestones including chapters beyond your current reading mark.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggleUnlock(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#e8e6dc] bg-[#faf9f5] hover:bg-[#f0eee6] text-xs font-['Plus_Jakarta_Sans'] font-semibold text-[#5e5d59] hover:text-[#141413] transition-all cursor-pointer shrink-0"
          >
            <ShieldCheck size={13} className="text-[#c96442]" />
            <span>Re-enable Spoiler Shield</span>
          </button>
        </div>
      ) : null}

      {/* Mode Selector Tabs (Epilogue) */}
      <div className="flex items-center gap-3 border-b border-[#e8e6dc] pb-2">
        <button
          onClick={() => setActiveTab('synthesis')}
          className={`flex items-center gap-2 pb-2 px-1 text-xs font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'synthesis'
              ? 'border-[#c96442] text-[#c96442]'
              : 'border-transparent text-[#5e5d59] hover:text-[#141413]'
          }`}
        >
          <Sparkles size={14} />
          <span>Synthesis & Themes</span>
        </button>

        <button
          onClick={() => setActiveTab('recall')}
          className={`flex items-center gap-2 pb-2 px-1 text-xs font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'recall'
              ? 'border-[#c96442] text-[#c96442]'
              : 'border-transparent text-[#5e5d59] hover:text-[#141413]'
          }`}
        >
          <Layers size={14} />
          <span>Chapter Recall Points</span>
        </button>

        <button
          onClick={() => setActiveTab('dramatis')}
          className={`flex items-center gap-2 pb-2 px-1 text-xs font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'dramatis'
              ? 'border-[#c96442] text-[#c96442]'
              : 'border-transparent text-[#5e5d59] hover:text-[#141413]'
          }`}
        >
          <span>Dramatis Personae</span>
        </button>
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'synthesis' && (
        <div className="space-y-8">
          <div className="bg-[#faf9f5] rounded-3xl border border-[#e8e6dc] p-8 sm:p-10 space-y-6 shadow-[0_1px_4px_rgba(20,20,19,0.02)]">
            <div className="space-y-1">
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#5e5d59]">
                Core Narrative Arc
              </span>
              <h2 className="font-serif text-2xl text-[#141413]">Plot & Aesthetic Synthesis</h2>
            </div>

            <div className="font-serif text-[18px] leading-[1.8] text-[#141413] whitespace-pre-line space-y-4">
              {loading ? (
                <p className="italic text-[#5e5d59]">Consulting volume archives...</p>
              ) : (
                remoteSummary?.overall_summary || "Volume synthesis is being prepared for this title."
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(remoteSummary?.themes || []).map((th, idx) => (
              <div
                key={idx}
                className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] p-6 space-y-2 hover:border-[#c96442]/50 transition-colors shadow-xs"
              >
                <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#c96442] font-semibold">Theme 0{idx + 1}</span>
                <h3 className="font-serif text-lg text-[#141413]">{th.name}</h3>
                <p className="font-sans text-xs text-[#5e5d59] leading-relaxed">
                  {th.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recall' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#faf9f5] border border-[#e8e6dc] text-xs font-['Plus_Jakarta_Sans'] text-[#5e5d59]">
            <span className="text-[#c96442]">💡 </span>
            <strong>Quick Recall Memory Points:</strong> Review key milestones chapter by chapter to restore memory.
          </div>

          <div className="space-y-4">
            {(remoteSummary?.recall_points || []).length > 0 ? (
              remoteSummary.recall_points.map((pt, idx) => (
                <div
                  key={idx}
                  className="bg-[#faf9f5] rounded-xl border border-[#e8e6dc] p-6 flex flex-col sm:flex-row items-start gap-5 hover:border-[#c96442]/60 transition-all shadow-xs"
                >
                  <div className="shrink-0 font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#c96442] bg-[#f5f4ed] px-3 py-1.5 rounded-lg border border-[#e8e6dc]">
                    {pt.chapter}
                  </div>
                  <div className="space-y-2 flex-1">
                    <ul className="space-y-1.5 list-disc list-inside font-serif text-[15px] text-[#5e5d59] leading-relaxed">
                      {pt.points.map((pText, pIdx) => (
                        <li key={pIdx}>{pText}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-[#faf9f5] border border-[#e8e6dc] rounded-2xl">
                <p className="font-serif italic text-[#5e5d59]">
                  {loading ? "Synthesizing recall points..." : "No recall points generated yet. Tap 'Regenerate Recall' above to synthesize milestones."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'dramatis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(remoteSummary?.characters || []).map((ch, idx) => (
            <div
              key={idx}
              className="bg-[#faf9f5] rounded-xl border border-[#e8e6dc] p-5 flex items-start gap-4 hover:border-[#c96442]/50 transition-colors shadow-xs"
            >
              <div className="w-9 h-9 rounded-lg bg-[#f0eee6] border border-[#e8e6dc] flex items-center justify-center font-serif text-[#c96442] font-bold text-sm shrink-0">
                {ch.name[0]}
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base text-[#141413] font-medium">
                  {ch.name}
                </h3>
                <p className="font-sans text-xs text-[#5e5d59] leading-relaxed">
                  {ch.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
