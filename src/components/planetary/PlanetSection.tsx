// Interactive 3D Planet Section (Moon & Mars) with camera navigation across 3 landing site markers.
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { Globe, getRotationToFaceSite } from '../../three/Globe';
import { LocationMarker } from '../../data/types';
import { MapPin, ArrowRight, Compass } from 'lucide-react';

interface PlanetSectionProps {
  place: 'moon' | 'mars';
  markers: LocationMarker[];
  onFinishLocations: () => void;
}

// Inner 3D globe controller that smoothly rotates the planet to face the active site marker.
function GlobeController({
  place,
  markers,
  activeMarker,
  onPickMarker,
}: {
  place: 'moon' | 'mars';
  markers: LocationMarker[];
  activeMarker: LocationMarker | null;
  onPickMarker: (marker: LocationMarker) => void;
}) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0.15, y: 0 });

  // When activeMarker changes, compute target rotation to center the marker facing +Z
  useEffect(() => {
    if (activeMarker) {
      const { x, y } = getRotationToFaceSite(activeMarker.lat, activeMarker.lon);
      targetRotation.current = { x, y };
    }
  }, [activeMarker]);

  useFrame((_, delta) => {
    if (globeGroupRef.current) {
      if (!activeMarker) {
        // Slow idle planetary rotation when no marker is selected
        globeGroupRef.current.rotation.y += delta * 0.04;
      } else {
        // Smoothly interpolate towards the target site orientation
        globeGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          globeGroupRef.current.rotation.x,
          targetRotation.current.x,
          delta * 2.5
        );
        globeGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          globeGroupRef.current.rotation.y,
          targetRotation.current.y,
          delta * 2.5
        );
      }
    }
  });

  return (
    <Globe
      ref={globeGroupRef}
      place={place}
      radius={2.1}
      markers={markers}
      activeMarkerId={activeMarker?.id}
      onMarkerClick={onPickMarker}
    />
  );
}

export function PlanetSection({ place, markers, onFinishLocations }: PlanetSectionProps) {
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);
  const isMoon = place === 'moon';
  const currentMarker = markers[activeLocationIndex] || markers[0];

  const handleNextLocation = () => {
    if (activeLocationIndex < markers.length - 1) {
      setActiveLocationIndex(activeLocationIndex + 1);
    } else {
      onFinishLocations();
    }
  };

  const handlePrevLocation = () => {
    if (activeLocationIndex > 0) {
      setActiveLocationIndex(activeLocationIndex - 1);
    }
  };

  return (
    <div className={`planet-exploration-section planet-${place}`} aria-label={`3D ${isMoon ? 'Moon' : 'Mars'} Exploration`}>
      {/* 3D Canvas Background */}
      <div className="planet-canvas-container">
        <Canvas
          dpr={[1, 1.8]}
          camera={{ fov: 38, position: [0, 0.5, 5.8], near: 0.1, far: 500 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={['#020207']} />
          <ambientLight intensity={0.15} />
          <directionalLight
            position={isMoon ? [-8, 4, 6] : [7, 5, 5]}
            intensity={2.8}
            color={isMoon ? '#ffffff' : '#ffd5bd'}
          />
          <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={0.4} />

          <GlobeController
            place={place}
            markers={markers}
            activeMarker={currentMarker}
            onPickMarker={(m) => {
              const idx = markers.findIndex((item) => item.id === m.id);
              if (idx !== -1) setActiveLocationIndex(idx);
            }}
          />
          <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.4} />
        </Canvas>
      </div>

      {/* Floating Story Card for Active Landing Site */}
      <div className="location-story-overlay">
        <div className="location-nav-tabs">
          {markers.map((m, idx) => (
            <button
              key={m.id}
              className={`location-tab-btn ${idx === activeLocationIndex ? 'active' : ''}`}
              onClick={() => setActiveLocationIndex(idx)}
            >
              <span className="tab-idx">0{idx + 1}</span>
              <span className="tab-name">{m.shortName}</span>
            </button>
          ))}
        </div>

        <div className="location-card">
          <div className="location-card-header">
            <span className="location-tag">
              <MapPin size={14} className="tag-icon" />
              <span>
                {currentMarker.lat >= 0 ? `${currentMarker.lat.toFixed(2)}°N` : `${Math.abs(currentMarker.lat).toFixed(2)}°S`},{' '}
                {currentMarker.lon >= 0 ? `${currentMarker.lon.toFixed(2)}°E` : `${Math.abs(currentMarker.lon).toFixed(2)}°W`}
              </span>
            </span>
            <span className="location-year">{currentMarker.year}</span>
          </div>

          <h3 className="location-card-title">{currentMarker.name}</h3>
          <p className="location-card-brief">{currentMarker.brief}</p>

          <div className="location-card-actions">
            {activeLocationIndex > 0 && (
              <button className="location-action-btn secondary" onClick={handlePrevLocation}>
                PREVIOUS SITE
              </button>
            )}

            <button className="location-action-btn primary" onClick={handleNextLocation}>
              <span>
                {activeLocationIndex === markers.length - 1
                  ? `ENTER ${isMoon ? 'LUNAR' : 'MARTIAN'} EQUIPMENT SHOWCASE`
                  : 'EXPLORE NEXT LOCATION'}
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
