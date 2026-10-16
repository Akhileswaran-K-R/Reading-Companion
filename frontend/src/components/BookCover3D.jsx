import React, { useState } from 'react';

/**
 * Cloth-bound 3D Physical Book Cover Component
 * Restored to Warm Editorial linen binding with gold foil lettering, paper edge stacks, and mouse-follow 3D perspective.
 */
export default function BookCover3D({ 
  title, 
  author, 
  chapter, 
  page, 
  totalPages,
  chapterPage,
  chapterPages,
  bookPage,
  coverColor = "#2b2a27",
  accentColor = "#c89d36",
  coverImage = null,
  onClick
}) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 14;
    const rotateX = -((y - centerY) / centerY) * 11;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const displayBookPage = bookPage || page || 1;
  const displayTotalPages = totalPages || 100;

  return (
    <div 
      className="perspective-book cursor-pointer select-none group"
      onMouseMove={(e) => { setIsHovered(true); handleMouseMove(e); }}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div 
        className="relative w-64 h-96 rounded-r-xl rounded-l-xs transition-transform duration-300 ease-out"
        style={{
          transform: isHovered 
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(-8px)` 
            : 'rotateX(0deg) rotateY(0deg) translateY(0px)',
          transformStyle: 'preserve-3d',
          boxShadow: isHovered
            ? '-18px 24px 38px -8px rgba(20, 20, 19, 0.22), -4px 6px 14px -2px rgba(20, 20, 19, 0.08)'
            : '-8px 12px 24px -4px rgba(20, 20, 19, 0.12), -2px 3px 8px -1px rgba(20, 20, 19, 0.05)'
        }}
      >
        {/* Book Spine Edge (Simulated 3D side) */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-5 rounded-l-xs bg-black/25 book-spine-crease z-20 pointer-events-none"
        />

        {/* Paper Pages Stack Thickness */}
        <div 
          className="absolute -right-3 top-2 bottom-2 w-3 rounded-r-xs book-pages-edge shadow-xs border-y border-[#dbdad3] z-0"
        />

        {/* Main Cover Plane */}
        <div 
          className="relative w-full h-full rounded-r-xl rounded-l-xs overflow-hidden flex flex-col justify-between p-6 z-10 border border-[#141413]/15"
          style={{ 
            backgroundColor: coverColor,
            backgroundImage: `radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.08), transparent 70%)` 
          }}
        >
          {/* Subtle Linen / Texture Overlay */}
          <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />

          {/* Cover Art Image */}
          {coverImage && (
            <div className="absolute inset-0 z-0 opacity-30 mix-blend-luminosity overflow-hidden">
              <img src={coverImage} alt={title} className="w-full h-full object-cover grayscale contrast-125" />
            </div>
          )}

          {/* Top Foil Framing */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-3">
            <span className="font-serif italic text-xs tracking-wider" style={{ color: accentColor }}>
              Classic Volume
            </span>
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-white/70 font-semibold uppercase tracking-wider truncate max-w-[140px]" title={chapter}>
              {chapter}{chapterPage ? ` · pg. ${chapterPage}` : ''}
            </span>
          </div>

          {/* Central Title */}
          <div className="relative z-10 my-auto text-center px-2 py-4">
            <h3 className="font-serif text-2xl text-white font-normal leading-snug tracking-tight drop-shadow-xs">
              {title}
            </h3>
            <p className="font-serif italic text-sm text-white/80 mt-2" style={{ color: accentColor }}>
              {author}
            </p>
          </div>

          {/* Bottom Coordinates & Bookmark Indicator */}
          <div className="relative z-10 border-t border-white/20 pt-3 flex items-center justify-between text-xs text-white/75 font-['Plus_Jakarta_Sans'] font-medium">
            <span>pg. {displayBookPage} of {displayTotalPages}</span>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span>
          </div>

          {/* Terracotta Bookmark Ribbon */}
          <div 
            className="absolute -top-3 left-10 w-4 h-12 shadow-sm z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-top-1 group-hover:h-14"
            style={{ 
              backgroundColor: '#c96442',
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
