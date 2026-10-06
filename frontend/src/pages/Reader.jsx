import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { askQuestion, getLibrary } from '../api/client';
import { ArrowLeft, Loader, MessageSquare, Save, Settings, BookOpen } from 'lucide-react';

export default function Reader() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // If bookId is 'none' or missing, we just load a mock book for visual demonstration
    if (bookId === 'none' || !bookId) {
       setBook({
           id: 'mock',
           title: "Tomorrow, and Tomorrow, and Tomorrow",
           author: "Gabrielle Zevin",
           description: "A novel about love, art, and video games.",
           total_pages: 416
       });
       setLoading(false);
       return;
    }

    getLibrary()
      .then(res => {
        setLibrary(res.data || []);
        const found = res.data.find(b => b.id.toString() === bookId.toString());
        if (found) {
            setBook(found);
        } else {
            setBook({
                id: bookId,
                title: "Tomorrow, and Tomorrow, and Tomorrow",
                author: "Gabrielle Zevin",
                description: "A novel about love, art, and video games.",
                total_pages: 416
            });
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [bookId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !bookId || bookId === 'mock') return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setChatLoading(true);

    try {
      const res = await askQuestion(bookId, userMessage.content);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
        <Loader className="animate-spin mb-4" size={32} />
        <p className="font-label-md text-label-md">Opening your book...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-error-container text-on-error-container p-4 rounded text-sm shadow-sm">
          Failed to load book: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Desktop Reading Studio Workspace */}
      <div className="max-w-[1440px] w-full mx-auto px-space-md sm:px-margin-desktop py-space-lg flex flex-col gap-space-lg">
        {/* Atmospheric Subheader / Studio Header Ribbon */}
        <div className="w-full bg-surface-container-low rounded-xl px-space-lg py-space-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary font-label-eyebrow text-label-eyebrow uppercase tracking-widest shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Currently Reading
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[15px]" style={{fontVariationSettings: "'FILL' 1"}}>shield_lock</span>
              <span>Spoiler-Safe up to Ch. 14 (p. 214)</span>
            </div>
            <span className="text-outline text-body-sm hidden sm:inline">•</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant italic">Vol. IX • Cambridge & Venice Arc</span>
          </div>
          {/* Studio Layout View Switcher */}
          <div className="flex items-center bg-surface-container rounded-lg p-1">
            <button className="flex items-center gap-1 px-3 py-1 rounded bg-surface-container-lowest text-primary shadow-sm font-label-sm text-label-sm transition-all" type="button">
              <span className="material-symbols-outlined text-[16px]">view_column</span>
              <span>Triptych Folio</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 rounded text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-all" type="button">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Focus Reader</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 rounded text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-all" type="button">
              <span className="material-symbols-outlined text-[16px]">history_edu</span>
              <span>Dual Marginalia</span>
            </button>
          </div>
        </div>

        {/* Main 3-Column Editorial Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: Book Identity & Reading Ledger (4 Cols) */}
          <section className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Hero Book Spreading Card */}
            <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md relative overflow-hidden">
              {/* Subtle Editorial Background Stamp */}
              <div className="absolute -right-8 -bottom-8 pointer-events-none opacity-5 text-on-surface">
                <span className="material-symbols-outlined text-[180px]">auto_stories</span>
              </div>
              {/* Book Jacket Display with Realistic Shadow */}
              <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-surface-container shadow-md flex items-center justify-center p-3">
                <BookOpen size={48} className="text-primary opacity-60" strokeWidth={1} />
                <div className="absolute top-5 right-5 px-2.5 py-1 rounded-full bg-surface/90 backdrop-blur-sm text-primary font-label-sm text-label-sm shadow-sm">
                  51% Read
                </div>
              </div>
              {/* Title & Meta */}
              <div className="flex flex-col gap-1">
                <span className="font-label-eyebrow text-label-eyebrow text-primary uppercase tracking-widest">Selected Spine</span>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight leading-snug">
                  {book.title}
                </h1>
                <p className="font-title-editorial text-title-editorial text-on-surface-variant italic">
                  {book.author}
                </p>
              </div>
              {/* Quotation Plate */}
              <blockquote className="bg-surface-container rounded-lg p-space-md text-on-surface font-headline-sm text-headline-sm italic leading-relaxed">
                “There is a time for any work of art when it is just an idea and it is perfect.”
                <span className="block mt-1 font-label-sm text-label-sm not-italic text-outline">— Act II, The Winter at Harvard</span>
              </blockquote>
              {/* Progression Meter & Pace Metrics */}
              <div className="flex flex-col gap-2 pt-space-xs">
                <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface">
                  <span className="font-label-md text-label-md text-on-surface font-medium">Chapter 14</span>
                  <span className="text-on-surface-variant">p. 214 of {book.total_pages || 416}</span>
                </div>
                {/* Dual Terracotta Trench Progress Bar */}
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full transition-all duration-700" style={{width: '51%'}}></div>
                </div>
                <div className="flex items-center justify-between font-label-sm text-label-sm text-outline pt-1">
                  <span className="flex items-center gap-1 text-secondary">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    ~2.5 hrs remaining
                  </span>
                  <span className="italic font-title-editorial text-body-sm text-on-surface-variant">42 pages / session</span>
                </div>
              </div>
              {/* Reader Insights / Pace Ribbon */}
              <div className="bg-surface-container-highest rounded-lg p-space-md flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px] shrink-0">spa</span>
                <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                  <strong className="font-label-md text-label-md">Pacing Journal:</strong> A quiet pace yields deep roots. You have maintained a reflective streak for 6 consecutive evenings.
                </p>
              </div>
              {/* Quick Action Buttons */}
              <div className="flex items-center gap-space-sm pt-space-xs">
                <button className="flex-1 flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-md bg-primary-container text-on-primary hover:bg-primary transition-colors shadow-sm font-label-md text-label-md" type="button">
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  Continue Reading
                </button>
                <button className="px-space-md py-2.5 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-label-md text-label-md flex items-center justify-center" type="button">
                  <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                </button>
              </div>
            </div>
            
            {/* Archival Ledger Card */}
            <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-eyebrow text-label-eyebrow text-outline uppercase tracking-wider">Session Statistics</span>
                <span className="font-label-sm text-label-sm text-primary">In Folio</span>
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="bg-surface-container rounded-lg p-3 flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline">Current Velocity</span>
                  <span className="font-headline-md text-headline-md text-on-surface mt-0.5">38 wpm</span>
                  <span className="font-body-sm text-body-sm text-secondary">Contemplative mode</span>
                </div>
                <div className="bg-surface-container rounded-lg p-3 flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline">Marginalia Count</span>
                  <span className="font-headline-md text-headline-md text-on-surface mt-0.5">19 entries</span>
                  <span className="font-body-sm text-body-sm text-primary">4 cited in inquiry</span>
                </div>
              </div>
            </div>
          </section>

          {/* CENTER COLUMN: Spoiler-Safe Companion & Verified Inquiries (5 Cols) */}
          <section className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* The AI Companion Console */}
            <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              {/* Column Header with Safety Guarantee */}
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">psychology_alt</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Reflective Companion</h2>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Milestone Locked
                </div>
              </div>
              
              {/* Suggested Prompt Chips */}
              <div className="flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm text-outline">Pondered questions for Chapter 14:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button className="prompt-chip px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors text-left shadow-sm" type="button" onClick={() => setInput("Who is Marx to Sam?")}>
                    “Who is Marx to Sam?”
                  </button>
                  <button className="prompt-chip px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors text-left shadow-sm" type="button" onClick={() => setInput("Recap Sadie in Ch. 13")}>
                    “Recap Sadie in Ch. 13”
                  </button>
                  <button className="prompt-chip px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors text-left shadow-sm" type="button" onClick={() => setInput("Themes of play & grief")}>
                    “Themes of play & grief”
                  </button>
                </div>
              </div>
              
              {/* Interactive Inquiry Prompt Bar */}
              <form onSubmit={handleSendMessage} className="relative w-full flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">chat_bubble_outline</span>
                <input 
                  className="w-full h-12 pl-11 pr-12 rounded-xl bg-surface-container-lowest font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none shadow-sm transition-all disabled:opacity-50" 
                  id="companion-input" 
                  placeholder="Ask about Chapter 14 or previous events..." 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={chatLoading}
                />
                <button 
                  className="absolute right-2 w-8 h-8 rounded-full bg-primary-container hover:bg-primary text-on-primary flex items-center justify-center shadow-sm transition-transform active:scale-95 disabled:opacity-50" 
                  id="send-btn" 
                  type="submit"
                  disabled={chatLoading}
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                </button>
              </form>
              
              <p className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-secondary">verified</span>
                Strictly guarded against content beyond page 214.
              </p>
              
              {/* Conversation Thread Display */}
              <div className="flex flex-col gap-space-md pt-2 max-h-[600px] overflow-y-auto">
                {messages.length === 0 && (
                   <>
                    {/* Pre-populated Mock Thread (only shows if no real messages yet) */}
                    <div className="flex items-start justify-end gap-space-sm">
                      <div className="bg-primary text-on-primary rounded-xl rounded-tr-none px-4 py-2.5 max-w-[85%] shadow-sm">
                        <p className="font-body-md text-body-md leading-relaxed">
                          What role does Marx play during the crunch period?
                        </p>
                      </div>
                    </div>
                    <div className="bg-surface-container rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-eyebrow text-label-eyebrow text-primary uppercase">Chapter 12 Safe</span>
                          <span className="font-label-sm text-label-sm text-outline">Verified Context</span>
                        </div>
                        <button className="text-outline hover:text-on-surface transition-colors" title="Save to Marginalia" type="button">
                          <span className="material-symbols-outlined text-[16px]">bookmark</span>
                        </button>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                        Marx acts as the diplomatic and emotional buffer between Sam and Sadie. While they are engulfed in the volatile architecture of <em>Ichigo</em>, Marx handles the mundane yet vital realities—ordering food, soothing publisher tempers, and managing their physical isolation in the Cambridge apartment so their joint creative frequency remains uninterrupted.
                      </p>
                      <div className="bg-surface-container-lowest rounded-lg p-3 flex flex-col gap-1 shadow-sm">
                        <span className="font-label-eyebrow text-label-eyebrow text-secondary uppercase tracking-widest">Text Citation • p. 182</span>
                        <p className="font-headline-sm text-headline-sm text-on-surface italic">
                          “Marx was the tamer of wild inventors, the quiet producer who believed their genius was worth the domestic ruin.”
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-1 font-label-sm text-label-sm text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                          Archival synthesis from Ch. 7, 10, 12
                        </span>
                        <div className="flex items-center gap-2">
                          <button className="hover:text-primary transition-colors" type="button">Copy excerpt</button>
                          <span>•</span>
                          <button className="hover:text-primary transition-colors" type="button">Refine query</button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-surface-container rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm opacity-90">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-eyebrow text-label-eyebrow text-outline uppercase">Chapter 7 Verified</span>
                          <span className="font-label-sm text-label-sm text-outline">Retrospective</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-outline">Yesterday</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">Why does Sam hesitate to show Sadie the floppy disk?</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        Sam carries deep vulnerability about his self-taught code and fears losing Sadie’s respect before their artistic partnership can be rekindled.
                      </p>
                    </div>
                   </>
                )}

                {/* Real Dynamic Messages */}
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-space-sm`}>
                    {msg.role === 'user' ? (
                      <div className="bg-primary text-on-primary rounded-xl rounded-tr-none px-4 py-2.5 max-w-[85%] shadow-sm">
                        <p className="font-body-md text-body-md leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ) : (
                      <div className="bg-surface-container rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-eyebrow text-label-eyebrow text-primary uppercase">Context Safe</span>
                            <span className="font-label-sm text-label-sm text-outline">Verified</span>
                          </div>
                          <button className="text-outline hover:text-on-surface transition-colors" title="Save to Marginalia" type="button">
                            <span className="material-symbols-outlined text-[16px]">bookmark</span>
                          </button>
                        </div>
                        <div className="font-body-md text-body-md text-on-surface leading-relaxed markdown-content">
                            {msg.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="bg-surface-container rounded-xl p-space-md shadow-sm w-full">
                    <Loader className="animate-spin text-primary" size={20} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Entity Recall & Marginalia Archive (3 Cols) */}
          <section className="lg:col-span-3 flex flex-col gap-space-lg">
            {/* Entity Recall Box */}
            <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[18px]">hub</span>
                  <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Entity Recall</h3>
                </div>
                <span className="font-label-sm text-label-sm text-outline">Tap to review</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Key concepts & characters known up to current page:
              </p>
              {/* Interactive Entity Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Ichigo Engine', 'Marx Watanabe', 'Sam Masur', 'Sadie Green', 'Daedalus', 'Map of Venice'].map((entity, i) => (
                    <button key={i} className="entity-badge px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary-container hover:text-on-primary text-on-surface font-label-sm text-label-sm transition-all shadow-sm" type="button">
                        {entity}
                    </button>
                ))}
              </div>
              {/* Entity Detail Preview Drawer (Dynamic Mockup) */}
              <div className="bg-surface-container rounded-lg p-3 mt-1 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-primary">Ichigo Engine</span>
                  <span className="font-label-sm text-label-sm text-outline">Software</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  The proprietary game framework built in the Cambridge flat. First conceived under Sadie’s design principles.
                </p>
              </div>
            </div>
            
            {/* Recent Marginalia & Pinned Reflections */}
            <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">draw</span>
                  <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Marginalia</h3>
                </div>
                <span className="font-label-sm text-label-sm text-primary cursor-pointer hover:underline">View all (19)</span>
              </div>
              {/* Note Items Stack */}
              <div className="flex flex-col gap-2 pt-1">
                {/* Note 1 */}
                <div className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center justify-between font-label-sm text-label-sm">
                    <span className="text-primary font-medium">Page 198 • Ch. 13</span>
                    <span className="text-outline">Oct 14</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                    The tension between commercial viability and artistic purity in Sadie’s game mechanics.
                  </p>
                </div>
                {/* Note 2 */}
                <div className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center justify-between font-label-sm text-label-sm">
                    <span className="text-primary font-medium">Page 142 • Ch. 9</span>
                    <span className="text-outline">Oct 11</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                    Sam’s foot pain as a manifestation of unexpressed childhood grief and vulnerability.
                  </p>
                </div>
                {/* Note 3 */}
                <div className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center justify-between font-label-sm text-label-sm">
                    <span className="text-secondary font-medium">Anchor Point • Act II</span>
                    <span className="text-outline">Act Review</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface leading-snug italic">
                    “Sadie constructs the architecture of Ichigo while Marx feeds the collective flame.”
                  </p>
                </div>
              </div>
              {/* Quick Log Marginalia Action */}
              <button className="w-full mt-1 py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-1.5 transition-colors" type="button">
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                Add Marginalia Entry
              </button>
            </div>
            
            {/* Archival Companion Bookmark Widget */}
            <div className="bg-surface-container-highest rounded-xl p-space-md shadow-sm flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0 text-primary shadow-sm">
                <span className="material-symbols-outlined text-[20px]">local_library</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface">Bookie Physical Sync</span>
                <span className="font-body-sm text-body-sm text-outline">Smart bookmark connected</span>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Contextual Shelf: Recently Closed Volumes */}
        <section className="mt-space-md pt-space-lg border-t border-surface-container-high">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex flex-col">
              <span className="font-label-eyebrow text-label-eyebrow text-primary uppercase tracking-widest">Other Volumes</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Archive & Queue</h2>
            </div>
            <a className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1" href="/">
              Full Archival Ledger
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
             {library.filter(b => b.id.toString() !== bookId.toString()).slice(0, 4).map(otherBook => (
                 <div key={otherBook.id} className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-space-sm h-full">
                        <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container flex items-center justify-center">
                            <BookOpen size={24} className="text-primary opacity-50" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-2">{otherBook.title}</h4>
                            <span className="font-body-sm text-body-sm text-outline truncate">{otherBook.author}</span>
                        </div>
                    </div>
                    <button onClick={() => navigate(`/reader/${otherBook.id}`)} className="w-full mt-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors flex items-center justify-center gap-1" type="button">
                        <span className="material-symbols-outlined text-[14px]">play_circle</span>
                        Switch Volume
                    </button>
                </div>
             ))}
             {library.length <= 1 && (
                 <div className="col-span-2 md:col-span-4 text-center p-space-lg bg-surface-container-lowest rounded-lg border border-dashed border-outline-variant text-outline">
                    No other volumes found in your archive.
                 </div>
             )}
          </div>
        </section>
      </div>
    </div>
  );
}
