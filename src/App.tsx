// Master Application component orchestrating the complete cinematic storytelling experience.
import React, { useState, useEffect, useRef } from 'react';
import { NavigationHUD } from './components/ui/NavigationHUD';
import { CinematicIntro } from './components/cinematic/CinematicIntro';
import { ChapterTransition } from './components/cinematic/ChapterTransition';
import { PlanetSection } from './components/planetary/PlanetSection';
import { StaggeredEquipmentSection } from './components/equipment/StaggeredEquipmentSection';
import { CinematicEnding } from './components/cinematic/CinematicEnding';
import { MOON_EQUIPMENT, MARS_EQUIPMENT, MOON_MARKERS, MARS_MARKERS } from './data/equipmentData';
import './styles/main.css';

export default function App() {
  const [currentSection, setCurrentSection] = useState('intro');

  // References to section DOM nodes for programmatic scrolling
  const introRef = useRef<HTMLDivElement>(null);
  const moonIntroRef = useRef<HTMLDivElement>(null);
  const moonSectionRef = useRef<HTMLDivElement>(null);
  const moonShowcaseRef = useRef<HTMLDivElement>(null);
  const marsIntroRef = useRef<HTMLDivElement>(null);
  const marsSectionRef = useRef<HTMLDivElement>(null);
  const marsShowcaseRef = useRef<HTMLDivElement>(null);
  const endingRef = useRef<HTMLDivElement>(null);

  // Smooth scroll helper to navigate between narrative checkpoints
  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Jump to section by ID from the navigation HUD
  const handleJumpToSection = (sectionId: string) => {
    switch (sectionId) {
      case 'intro':
        scrollTo(introRef);
        break;
      case 'moon':
        scrollTo(moonSectionRef);
        break;
      case 'moon-showcase':
        scrollTo(moonShowcaseRef);
        break;
      case 'mars':
        scrollTo(marsSectionRef);
        break;
      case 'mars-showcase':
        scrollTo(marsShowcaseRef);
        break;
      case 'ending':
        scrollTo(endingRef);
        break;
    }
  };

  // Intersection observer to automatically update active section in Navigation HUD
  useEffect(() => {
    const sections = [
      { id: 'intro', ref: introRef },
      { id: 'moon', ref: moonSectionRef },
      { id: 'moon-showcase', ref: moonShowcaseRef },
      { id: 'mars', ref: marsSectionRef },
      { id: 'mars-showcase', ref: marsShowcaseRef },
      { id: 'ending', ref: endingRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const match = sections.find((s) => s.ref.current === entry.target);
            if (match) setCurrentSection(match.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((s) => {
      if (s.ref.current) observer.observe(s.ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="cinematic-experience-root">
      {/* Top HUD with brand, chapter links and sound toggle */}
      <NavigationHUD currentSection={currentSection} onJumpToSection={handleJumpToSection} />

      {/* 1. Cinematic Opening Title and Narration */}
      <div ref={introRef} id="section-intro">
        <CinematicIntro onExploreClick={() => scrollTo(moonIntroRef)} />
      </div>

      {/* 2. Chapter 01 Transition: The Moon */}
      <div ref={moonIntroRef} id="section-moon-intro">
        <ChapterTransition
          chapterNumber="CHAPTER 01"
          chapterTitle="THE MOON"
          subtitle="Quiet shores and ancient craters of our celestial companion"
        />
      </div>

      {/* 3. Interactive 3D Moon & 3 Equipment Locations */}
      <div ref={moonSectionRef} id="section-moon">
        <PlanetSection
          place="moon"
          markers={MOON_MARKERS}
          onFinishLocations={() => scrollTo(moonShowcaseRef)}
        />
      </div>

      {/* 4. Staggered 3-Model Lunar Equipment Showcase & Individual Storytelling */}
      <div ref={moonShowcaseRef} id="section-moon-showcase">
        <StaggeredEquipmentSection
          place="moon"
          equipmentList={MOON_EQUIPMENT}
          onCompleteChapter={() => scrollTo(marsIntroRef)}
        />
      </div>

      {/* 5. Chapter 02 Transition: Mars */}
      <div ref={marsIntroRef} id="section-mars-intro">
        <ChapterTransition
          chapterNumber="CHAPTER 02"
          chapterTitle="MARS"
          subtitle="The rust-red dunes and windswept plains of the fourth world"
        />
      </div>

      {/* 6. Interactive 3D Mars & 3 Equipment Locations */}
      <div ref={marsSectionRef} id="section-mars">
        <PlanetSection
          place="mars"
          markers={MARS_MARKERS}
          onFinishLocations={() => scrollTo(marsShowcaseRef)}
        />
      </div>

      {/* 7. Staggered 3-Model Martian Equipment Showcase & Individual Storytelling */}
      <div ref={marsShowcaseRef} id="section-mars-showcase">
        <StaggeredEquipmentSection
          place="mars"
          equipmentList={MARS_EQUIPMENT}
          onCompleteChapter={() => scrollTo(endingRef)}
        />
      </div>

      {/* 8. Cinematic Ending */}
      <div ref={endingRef} id="section-ending">
        <CinematicEnding onRestart={() => scrollTo(introRef)} />
      </div>
    </div>
  );
}
