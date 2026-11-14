// Full-screen black cinematic chapter transition divider.
import React from 'react';

interface ChapterTransitionProps {
  chapterNumber: string;
  chapterTitle: string;
  subtitle?: string;
}

export function ChapterTransition({ chapterNumber, chapterTitle, subtitle }: ChapterTransitionProps) {
  return (
    <section className="chapter-transition-screen" aria-label={`Chapter ${chapterNumber}: ${chapterTitle}`}>
      <div className="chapter-transition-inner">
        <span className="chapter-num-tag">{chapterNumber}</span>
        <h2 className="chapter-main-title">{chapterTitle}</h2>
        {subtitle && <p className="chapter-subtext">{subtitle}</p>}
        <div className="chapter-accent-line" />
      </div>
    </section>
  );
}
