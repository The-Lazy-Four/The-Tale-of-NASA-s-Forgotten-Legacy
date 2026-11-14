// Minimalist cinematic Navigation HUD and Web Audio synth for ambient space soundscapes.
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Compass, Moon, Disc } from 'lucide-react';

interface NavigationHUDProps {
  currentSection: string;
  onJumpToSection: (sectionId: string) => void;
}

export function NavigationHUD({ currentSection, onJumpToSection }: NavigationHUDProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  // Toggle ambient space drone using Web Audio API
  const toggleSound = () => {
    if (isMuted) {
      try {
        const ctx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Low frequency space drone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, ctx.currentTime); // A1 note 55Hz

        // Gentle volume level
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        setAudioCtx(ctx);
        setOscillator(osc);
        setGainNode(gain);
        setIsMuted(false);
      } catch (e) {
        console.warn('Web Audio not supported or blocked', e);
      }
    } else {
      if (gainNode && audioCtx) {
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
        setTimeout(() => {
          oscillator?.stop();
          oscillator?.disconnect();
          setOscillator(null);
        }, 850);
      }
      setIsMuted(true);
    }
  };

  // Cleanup audio nodes on unmount
  useEffect(() => {
    return () => {
      try {
        oscillator?.stop();
        audioCtx?.close();
      } catch (e) {}
    };
  }, [audioCtx, oscillator]);

  return (
    <header className="navigation-hud" aria-label="Site Navigation and Audio Controls">
      <div className="hud-left">
        <span className="hud-logo-icon">
          <Compass size={18} />
        </span>
        <span className="hud-brand">THE TALE OF NASA'S FORGOTTEN LEGACY</span>
      </div>

      <nav className="hud-center" aria-label="Chapter Shortcuts">
        <button
          className={`hud-nav-link ${currentSection === 'intro' ? 'active' : ''}`}
          onClick={() => onJumpToSection('intro')}
        >
          PROLOGUE
        </button>
        <button
          className={`hud-nav-link ${currentSection === 'moon' ? 'active' : ''}`}
          onClick={() => onJumpToSection('moon')}
        >
          <Moon size={14} className="hud-link-icon" />
          <span>01 MOON</span>
        </button>
        <button
          className={`hud-nav-link ${currentSection === 'moon-showcase' ? 'active' : ''}`}
          onClick={() => onJumpToSection('moon-showcase')}
        >
          <span>LUNAR SHOWCASE</span>
        </button>
        <button
          className={`hud-nav-link ${currentSection === 'mars' ? 'active' : ''}`}
          onClick={() => onJumpToSection('mars')}
        >
          <Disc size={14} className="hud-link-icon" />
          <span>02 MARS</span>
        </button>
        <button
          className={`hud-nav-link ${currentSection === 'mars-showcase' ? 'active' : ''}`}
          onClick={() => onJumpToSection('mars-showcase')}
        >
          <span>MARTIAN SHOWCASE</span>
        </button>
        <button
          className={`hud-nav-link ${currentSection === 'ending' ? 'active' : ''}`}
          onClick={() => onJumpToSection('ending')}
        >
          <span>EPILOGUE</span>
        </button>
      </nav>

      <div className="hud-right">
        <button
          className={`audio-toggle-btn ${!isMuted ? 'playing' : ''}`}
          onClick={toggleSound}
          title={isMuted ? 'Unmute Ambient Space Drone' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span className="audio-label">{isMuted ? 'SOUND OFF' : 'SOUND ON'}</span>
        </button>
      </div>
    </header>
  );
}
