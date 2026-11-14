// 3D Staggered Equipment Showcase scene.
// Renders three distinct 3D space machines in a staggered spatial depth arrangement:
// - Model 1: Left foreground
// - Model 2: Right middle-ground
// - Model 3: Left background
// Supports smooth camera and position transitions when focusing on an individual model.
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EquipmentData } from '../data/types';
import { EquipmentMesh } from './models';

interface StaggeredShowcaseProps {
  equipmentList: EquipmentData[];
  // activeModelIndex: -1 for 3-model overview; 0, 1, or 2 when focusing on an individual model
  activeModelIndex: number;
  activeComponentIndex?: number;
  rotationSpeed?: number;
}

// Fixed staggered positions for the 3-model spatial composition (Overview Mode)
const OVERVIEW_POSITIONS: [number, number, number][] = [
  [-2.2, -0.6, 1.2],   // Model 1: Left foreground
  [2.4, 0.1, -1.8],    // Model 2: Right middle-ground
  [-1.2, 0.8, -4.5],   // Model 3: Left background
];

const OVERVIEW_SCALES = [1.2, 0.95, 0.85];

// Position when a model is selected for individual storytelling (Left side of viewport)
const FOCUS_POSITION: [number, number, number] = [-1.8, -0.2, 1.2];
const FOCUS_SCALE = 1.35;

export function StaggeredShowcase({
  equipmentList,
  activeModelIndex,
  activeComponentIndex = 0,
  rotationSpeed = 0.35,
}: StaggeredShowcaseProps) {
  // References to the 3 model container groups
  const groupRefs = [
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
  ];

  // Vector caches to avoid GC allocation during useFrame
  const currentPos = useMemo(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], []);
  const targetPos = useMemo(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], []);
  const targetScales = useMemo(() => [1, 1, 1], []);

  useFrame((state, delta) => {
    const isOverview = activeModelIndex < 0;

    // Smoothly calculate target positions and scales for each of the 3 machines
    for (let i = 0; i < 3; i++) {
      const group = groupRefs[i]?.current;
      if (!group) continue;

      if (isOverview) {
        // Staggered 3-model spatial arrangement
        const [ox, oy, oz] = OVERVIEW_POSITIONS[i];
        targetPos[i].set(ox, oy, oz);
        targetScales[i] = OVERVIEW_SCALES[i] * (equipmentList[i]?.scale ?? 1);

        // Continuous gentle idle rotation in overview
        group.rotation.y += delta * 0.15 * (i % 2 === 0 ? 1 : -1);
      } else if (i === activeModelIndex) {
        // The active machine moves to the LEFT of the screen
        const [fx, fy, fz] = FOCUS_POSITION;
        targetPos[i].set(fx, fy, fz);
        targetScales[i] = FOCUS_SCALE * (equipmentList[i]?.scale ?? 1);

        // Responsive continuous rotation on the left side
        group.rotation.y += delta * rotationSpeed;

        // Subtle bobbing motion
        targetPos[i].y += Math.sin(state.clock.getElapsedTime() * 1.5) * 0.05;
      } else {
        // Inactive models step back into the subtle background
        const direction = i < activeModelIndex ? -1 : 1;
        targetPos[i].set(direction * 4.8, 0.6, -6.5);
        targetScales[i] = 0.5;
        group.rotation.y += delta * 0.08;
      }

      // Smooth damp interpolation to avoid jarring camera or model jumps
      group.position.lerp(targetPos[i], delta * 3.5);
      const currentScale = group.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScales[i], delta * 3.5);
      group.scale.set(newScale, newScale, newScale);
    }
  });

  return (
    <group>
      {/* Studio lighting tailored for dark metallic spacecraft materials */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={2.2} castShadow />
      <directionalLight position={[-6, 3, 2]} intensity={1.5} color="#8ab4f8" />
      <pointLight position={[0, -2, 2]} intensity={0.8} color="#e0a96d" />

      {/* Render the 3 3D models */}
      {equipmentList.slice(0, 3).map((equip, idx) => (
        <group
          key={equip.id}
          ref={groupRefs[idx]}
          position={OVERVIEW_POSITIONS[idx]}
          scale={OVERVIEW_SCALES[idx] * equip.scale}
        >
          {/* Subtle pedestal glow disc for each machine */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]}>
            <ringGeometry args={[0.9, 1.3, 32]} />
            <meshBasicMaterial
              color={equip.body === 'moon' ? '#ffe7b0' : '#ff9b63'}
              transparent
              opacity={activeModelIndex === idx ? 0.35 : 0.12}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Actual 3D Geometry */}
          <EquipmentMesh kind={equip.modelKind} isFocus={activeModelIndex === idx} />
        </group>
      ))}
    </group>
  );
}
