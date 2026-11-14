// 3D Model registry and loaders for GLB assets and procedural HD spacecraft.
import { Component, Suspense, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RetroreflectorHD, LrvHD, SurveyorHD, SojournerHD } from './machines';
import { foilNormal, solarTexture } from './textures';

export type ModelKind = 'retroreflector' | 'lrv' | 'surveyor' | 'sojourner' | 'opportunity' | 'insight';

// Error boundary to gracefully catch any GLTF loading errors and render the fallback model.
export class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}

// Procedural fallback for Opportunity Rover if GLB is loading or unavailable.
export function OpportunityFallback() {
  return (
    <group>
      {/* Central Chassis */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.38, 0.85]} />
        <meshStandardMaterial color="#e9e6df" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Solar Wings */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[1.5, 0.04, 1.05]} />
        <meshStandardMaterial color="#ffffff" map={solarTexture()} roughness={0.25} metalness={0.4} />
      </mesh>
      <mesh position={[-0.55, 0.22, 0.85]} rotation={[0.05, 0, 0]}>
        <boxGeometry args={[1.1, 0.03, 0.65]} />
        <meshStandardMaterial color="#ffffff" map={solarTexture()} roughness={0.25} metalness={0.4} />
      </mesh>
      <mesh position={[-0.55, 0.22, -0.85]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[1.1, 0.03, 0.65]} />
        <meshStandardMaterial color="#ffffff" map={solarTexture()} roughness={0.25} metalness={0.4} />
      </mesh>
      {/* Pancam Mast */}
      <mesh position={[0.45, 0.7, 0.1]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
        <meshStandardMaterial color="#b9bcc2" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.45, 1.17, 0.1]}>
        <boxGeometry args={[0.18, 0.14, 0.42]} />
        <meshStandardMaterial color="#e9e6df" roughness={0.5} />
      </mesh>
      {/* Rocker-Bogie & Wheels */}
      {[-0.55, 0.55].map((z) => (
        <group key={z}>
          {[0.65, -0.05, -0.65].map((x) => (
            <mesh key={x} position={[x, -0.5, z * 1.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.16, 0.15, 16]} />
              <meshStandardMaterial color="#8d8a83" metalness={0.6} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Procedural fallback for InSight Lander.
export function InSightFallback() {
  return (
    <group>
      {/* Hexagonal Deck */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.3, 6]} />
        <meshStandardMaterial color="#e9e6df" roughness={0.6} />
      </mesh>
      {/* Circular Solar Panels */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.45, 0.15, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.03, 16]} />
          <meshStandardMaterial color="#ffffff" map={solarTexture()} roughness={0.25} metalness={0.4} />
        </mesh>
      ))}
      {/* SEIS Wind and Thermal Shield */}
      <mesh position={[1.05, -0.55, 0.75]}>
        <sphereGeometry args={[0.28, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e9e6df" roughness={0.4} />
      </mesh>
      {/* Landing Legs */}
      {[0, 2.09, 4.19].map((a) => (
        <group key={a}>
          <mesh position={[Math.cos(a) * 0.65, -0.52, Math.sin(a) * 0.65]}>
            <cylinderGeometry args={[0.1, 0.1, 0.04, 12]} />
            <meshStandardMaterial color="#b9bcc2" metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// NASA GLTF Loader with material enhancement and auto-centering/scaling.
export function NasaGlbModel({ path, fit = 2.6, kind }: { path: string; fit?: number; kind: ModelKind }) {
  const { scene } = useGLTF(path);

  const normalizedModel = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          const stdMat = m as THREE.MeshStandardMaterial;
          if (stdMat.isMeshStandardMaterial) {
            stdMat.envMapIntensity = 0.9;
            if (/foil|gold|mli/i.test(stdMat.name)) {
              stdMat.metalness = 0.95;
              stdMat.roughness = 0.28;
              stdMat.normalMap = foilNormal();
              stdMat.normalScale = new THREE.Vector2(1.1, 1.1);
            }
          }
          m.side = THREE.DoubleSide;
        });
      }
    });

    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    root.scale.multiplyScalar(fit / (maxDim || 1));
    root.updateMatrixWorld(true);

    const adjustedBox = new THREE.Box3().setFromObject(root);
    const center = adjustedBox.getCenter(new THREE.Vector3());
    root.position.x -= center.x;
    root.position.z -= center.z;
    root.position.y -= adjustedBox.min.y;

    return root;
  }, [scene, fit]);

  return <primitive object={normalizedModel} />;
}

// Master component that renders any model by its kind.
export function EquipmentMesh({ kind, isFocus = false }: { kind: ModelKind; isFocus?: boolean }) {
  switch (kind) {
    case 'lrv':
      return <LrvHD />;
    case 'surveyor':
      return <SurveyorHD />;
    case 'retroreflector':
      return <RetroreflectorHD />;
    case 'sojourner':
      return <SojournerHD />;
    case 'opportunity':
      return (
        <ModelBoundary fallback={<OpportunityFallback />}>
          <Suspense fallback={<OpportunityFallback />}>
            <NasaGlbModel path="/models/opportunity.glb" fit={2.6} kind="opportunity" />
          </Suspense>
        </ModelBoundary>
      );
    case 'insight':
      return (
        <ModelBoundary fallback={<InSightFallback />}>
          <Suspense fallback={<InSightFallback />}>
            <NasaGlbModel path="/models/insight.glb" fit={3.8} kind="insight" />
          </Suspense>
        </ModelBoundary>
      );
    default:
      return null;
  }
}
