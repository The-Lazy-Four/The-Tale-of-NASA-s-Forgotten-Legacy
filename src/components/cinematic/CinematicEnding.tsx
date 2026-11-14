// Atmospheric closing screen and narrative reflection.
import React from 'react';
import { Compass, RotateCcw } from 'lucide-react';

interface CinematicEndingProps {
  onRestart: () => void;
}

export function CinematicEnding({ onRestart }: CinematicEndingProps) {
  return (
    <section className="cinematic-ending-section" aria-label="Cinematic Ending Reflection">
      <div className="ending-content">
        <div className="intro-badge">
          <Compass className="intro-icon" size={16} />
          <span>IN MEMORIAM OF EXPLORATION</span>
        </div>

        <div className="ending-narration">
          <p>Across the Moon and Mars, they remain.</p>
          <p>Some have fallen silent. Others continue their quiet work.</p>
          <p>
            Some rest beneath alien dust, while others still carry the legacy of the missions that brought them there.
          </p>
          <p className="ending-highlight">
            They were never just machines.
          </p>
          <p>
            They were humanity's eyes, hands, and instruments in worlds we could only dream of reaching.
          </p>
          <p>Their missions ended.</p>
          <p>Their discoveries remain.</p>
          <p className="ending-pause">
            And somewhere, beyond the horizons we have already explored, another machine is waiting to tell its story.
          </p>
        </div>

        <div className="final-screen-banner">
          <div className="final-screen-box">
            <h2>THEIR MISSIONS ENDED.</h2>
            <h2>THEIR LEGACY LIVES ON.</h2>
            <p className="the-end-text">THE END</p>
          </div>
        </div>

        <button className="restart-btn" onClick={onRestart}>
          <RotateCcw size={16} />
          <span>BEGIN THE JOURNEY AGAIN</span>
        </button>
      </div>
    </section>
  );
}
