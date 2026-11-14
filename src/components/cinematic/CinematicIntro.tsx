// Cinematic Opening Title and Narration screen.
import React from 'react';
import { ChevronDown, Compass } from 'lucide-react';

interface CinematicIntroProps {
  onExploreClick: () => void;
}

export function CinematicIntro({ onExploreClick }: CinematicIntroProps) {
  return (
    <section className="intro-section" aria-label="Introductory Title and Narration">
      {/* Background radial space glow */}
      <div className="space-glow" aria-hidden="true" />

      <div className="intro-content">
        <div className="intro-badge">
          <Compass className="intro-icon" size={16} />
          <span>NASA HISTORICAL RECONSTRUCTION</span>
        </div>

        <h1 className="cinematic-title">
          THE TALE OF NASA'S<br />
          <span className="gold-shimmer">FORGOTTEN LEGACY</span>
        </h1>

        <p className="cinematic-subtitle">
          A Journey Through the Machines Humanity Left Behind.
        </p>

        <div className="intro-divider" />

        <div className="intro-narration">
          <p>
            For decades, humanity sent machines beyond the boundaries of Earth.
          </p>
          <p>
            They travelled across alien landscapes, explored distant worlds, and uncovered secrets hidden beneath unfamiliar skies.
          </p>
          <p className="narration-pause">
            Their missions eventually came to an end. But their stories did not.
          </p>
          <p>
            Scattered across the Moon and Mars, these silent explorers remain as reminders of our curiosity, courage, and determination to understand the universe.
          </p>
          <p className="narration-final">
            This is their story.
          </p>
        </div>

        <div className="scroll-cue" onClick={onExploreClick} role="button" tabIndex={0}>
          <span className="scroll-cue-text">SCROLL TO BEGIN JOURNEY</span>
          <ChevronDown className="scroll-bounce" size={20} />
        </div>
      </div>
    </section>
  );
}
