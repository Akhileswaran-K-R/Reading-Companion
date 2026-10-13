import React, { useState, useEffect } from 'react';
import { ChevronLeft, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { getBookSummary } from '../api/client';

export default function SummaryView({ bookId = 2, onBackToDeck }) {
  const [activeTab, setActiveTab] = useState('synthesis');
  const [remoteSummary, setRemoteSummary] = useState(null);

  useEffect(() => {
    if (bookId) {
      getBookSummary(bookId)
        .then(res => {
          if (res?.data) {
            setRemoteSummary(res.data);
          }
        })
        .catch(() => {});
    }
  }, [bookId]);

  const summaryData = {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    status: "Completed",
    totalChapters: 61,
    overallSynthesis: `
*Pride and Prejudice* charts the emotional and moral maturation of Elizabeth Bennet and Fitzwilliam Darcy. Set within the socially stratified world of Regency England, the novel scrutinizes how superficial first impressions, class posturing, and unchecked pride distort true perception. 

Through their turbulent journey—from Darcy’s haughty disdain at the Meryton ball to Elizabeth’s misjudged trust in George Wickham—both protagonists must dismantle their own flaws before achieving genuine harmony. The work remains an indelible celebration of psychological realism, domestic wit, and egalitarian affection.
    `,
    themes: [
      { name: "First Impressions & Perception", desc: "How premature judgments cloud moral and relational clarity." },
      { name: "Class, Wealth & Matrimony", desc: "The delicate balance between economic survival and romantic authenticity." },
      { name: "Individual Pride vs. Humility", desc: "Darcy’s aristocratic hauteur and Elizabeth’s self-righteous prejudice." }
    ],
    chapterRecallPoints: [
      {
        chapter: "Chapter I",
        subtitle: "The Proposition of Netherfield Park",
        takeaway: "Establishes the immortal premise that 'a single man in possession of a good fortune, must be in want of a wife.' Mrs. Bennet relentlessly lobbies Mr. Bennet to call upon the wealthy new tenant, Charles Bingley."
      },
      {
        chapter: "Chapter II",
        subtitle: "The Surprise Visit",
        takeaway: "Mr. Bennet secretly visits Bingley without informing his wife, revealing his dry satirical character while delighting the family."
      },
      {
        chapter: "Chapter III",
        subtitle: "The Meryton Assembly",
        takeaway: "The town ball introduces Darcy, whose initial haughtiness sparks town-wide outrage when he rebuffs Elizabeth as merely 'tolerable, but not handsome enough to tempt me.'"
      },
      {
        chapter: "Chapter IV",
        subtitle: "Sisters in Confidence",
        takeaway: "Jane’s unreserved optimism contrasts with Elizabeth’s sharper skepticism as they privately dissect the dance and Bingley’s amiability."
      },
      {
        chapter: "Chapter V",
        subtitle: "Lucas Lodge Deliberations",
        takeaway: "Charlotte Lucas distinguishes between vanity (what others think) and pride (what one thinks of oneself), foreshadowing future decisions."
      }
    ],
    characters: [
      { name: "Elizabeth Bennet", role: "Protagonist, keen-witted second daughter with sharp perception." },
      { name: "Fitzwilliam Darcy", role: "Wealthy estate owner of Pemberley, struggling with aristocratic pride." },
      { name: "Jane Bennet", role: "Eldest sister, consistently charitable in judgment." },
      { name: "Charles Bingley", role: "Easygoing and affable gentleman tenant of Netherfield." },
      { name: "Mr. Wickham", role: "Charming militia officer whose outward polish masks dishonesty." }
    ]
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Header / Volume Metadata */}
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
            <div className="flex items-center gap-2">
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#c96442]">
                Recall & Memory Booster
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e8e6dc] text-[#5e5d59] text-[10px] font-['Plus_Jakarta_Sans'] font-bold uppercase">
                <CheckCircle2 size={11} className="text-[#c96442]" />
                Volume Completed
              </span>
            </div>
            <h1 className="font-serif text-3xl text-[#141413] leading-tight mt-0.5">
              {summaryData.title}
            </h1>
            <p className="font-serif italic text-sm text-[#5e5d59]">
              {summaryData.author} · {summaryData.totalChapters} Chapters Summarized
            </p>
          </div>
        </div>
      </div>

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
              {remoteSummary?.overall_summary || summaryData.overallSynthesis}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {summaryData.themes.map((th, idx) => (
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
            {remoteSummary?.recall_points && remoteSummary.recall_points.length > 0 ? (
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
              summaryData.chapterRecallPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="bg-[#faf9f5] rounded-xl border border-[#e8e6dc] p-6 flex flex-col sm:flex-row items-start gap-5 hover:border-[#c96442]/60 transition-all shadow-xs"
                >
                  <div className="shrink-0 font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#c96442] bg-[#f5f4ed] px-3 py-1.5 rounded-lg border border-[#e8e6dc]">
                    {pt.chapter}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-serif text-lg text-[#141413] font-medium">
                      {pt.subtitle}
                    </h3>
                    <p className="font-serif text-[15px] text-[#5e5d59] leading-relaxed">
                      {pt.takeaway}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'dramatis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summaryData.characters.map((ch, idx) => (
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
