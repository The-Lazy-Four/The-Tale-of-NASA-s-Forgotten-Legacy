// The Custom Staggered 3D Equipment Showcase Section.
// Implements the requested spatial composition (Left foreground, Right middle-ground, Left background)
// and transitions into the split view (3D Model on LEFT, Narrative Panel on RIGHT).
import React, { useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { StaggeredShowcase } from '../../three/StaggeredShowcase';
import { EquipmentStoryPanel } from './EquipmentStoryPanel';
import { EquipmentData } from '../../data/types';
import { Eye, ArrowRight, RotateCcw, Layers } from 'lucide-react';

interface StaggeredEquipmentSectionProps {
  place: 'moon' | 'mars';
  equipmentList: EquipmentData[];
  onCompleteChapter: () => void;
}

export function StaggeredEquipmentSection({
  place,
  equipmentList,
  onCompleteChapter,
}: StaggeredEquipmentSectionProps) {
  // activeIndex: -1 means Overview Mode (all 3 models shown in staggered spatial depth);
  // 0, 1, or 2 means Focus Mode (model on LEFT, storytelling on RIGHT)
  const [activeModelIndex, setActiveModelIndex] = useState<number>(-1);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [activeComponentIndex, setActiveComponentIndex] = useState<number>(0);

  const isOverview = activeModelIndex === -1;
  const currentEquipment = isOverview ? equipmentList[0] : equipmentList[activeModelIndex];
  const isMoon = place === 'moon';

  // Handler to focus on a machine from overview
  const handleSelectModel = (index: number) => {
    setActiveModelIndex(index);
    setActiveStage(1);
    setActiveComponentIndex(0);
  };

  // Handler to return to the 3-model staggered composition
  const handleReturnToOverview = () => {
    setActiveModelIndex(-1);
    setActiveStage(1);
    setActiveComponentIndex(0);
  };

  // Handler to go to the next machine or finish the chapter
  const handleNextEquipment = () => {
    if (activeModelIndex < equipmentList.length - 1) {
      setActiveModelIndex(activeModelIndex + 1);
      setActiveStage(1);
      setActiveComponentIndex(0);
    } else {
      onCompleteChapter();
    }
  };

  return (
    <section
      className={`staggered-equipment-section ${isOverview ? 'mode-overview' : 'mode-focus'} place-${place}`}
      aria-label={`${isMoon ? 'Moon' : 'Mars'} 3D Equipment Showcase`}
    >
      {/* 3D Scene Viewport */}
      <div className={`showcase-canvas-wrapper ${isOverview ? 'full-width' : 'left-half'}`}>
        <Canvas
          dpr={[1, 1.8]}
          camera={{
            fov: isOverview ? 44 : 38,
            position: isOverview ? [0, 0.4, 6.2] : [-0.8, 0.2, 4.2],
            near: 0.1,
            far: 500,
          }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={['#030308']} />
          <Stars radius={90} depth={40} count={3500} factor={3} saturation={0} fade speed={0.25} />

          <StaggeredShowcase
            equipmentList={equipmentList}
            activeModelIndex={activeModelIndex}
            activeComponentIndex={activeComponentIndex}
            rotationSpeed={0.3}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={!isOverview}
            minDistance={2.5}
            maxDistance={8}
            rotateSpeed={0.5}
          />
        </Canvas>

        {/* 3D Interaction Hint */}
        <div className="canvas-interaction-hint">
          <span>DRAG TO ROTATE 3D PERSPECTIVE</span>
        </div>
      </div>

      {/* OVERVIEW HUD: Appears when all 3 models are spatially showcased together */}
      {isOverview && (
        <div className="overview-narrative-overlay">
          <div className="overview-badge">
            <Layers size={14} className="badge-icon" />
            <span>STAGGERED 3D SPATIAL COMPOSITION</span>
          </div>

          <h2 className="overview-title">
            {isMoon ? 'THE SILENT RELICS OF THE MOON' : 'THE DESERT MONUMENTS OF MARS'}
          </h2>
          <p className="overview-desc">
            Three historic robotic explorers resting across different depths and landing sites.
            Examine their engineering, missions, and lasting legacy.
          </p>

          <div className="overview-cards-picker">
            {equipmentList.map((eq, idx) => (
              <button
                key={eq.id}
                className="overview-picker-btn"
                onClick={() => handleSelectModel(idx)}
              >
                <div className="picker-num">0{idx + 1}</div>
                <div className="picker-info">
                  <span className="picker-name">{eq.shortName}</span>
                  <span className="picker-type">{eq.equipmentType}</span>
                </div>
                <div className="picker-action">
                  <span>EXAMINE</span>
                  <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FOCUS HUD: Appears on the RIGHT SIDE when an individual equipment model is being explored */}
      {!isOverview && (
        <div className="focus-story-wrapper right-half">
          <EquipmentStoryPanel
            equipment={currentEquipment}
            activeStage={activeStage}
            onChangeStage={setActiveStage}
            activeComponentIndex={activeComponentIndex}
            onSelectComponent={setActiveComponentIndex}
            onReturnToOverview={handleReturnToOverview}
            onNextEquipment={handleNextEquipment}
            isLastEquipment={activeModelIndex === equipmentList.length - 1}
          />
        </div>
      )}
    </section>
  );
}
