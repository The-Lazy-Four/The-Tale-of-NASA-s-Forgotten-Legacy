// Interactive 3D Planet Globe (Moon & Mars) with authentic NASA texture mapping and glowing landing site markers.
import { forwardRef, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { LocationMarker } from '../data/types';

// Converts geographical latitude and longitude coordinates into 3D Cartesian coordinates on a sphere of radius r.
export function latLonToVec(lat: number, lon: number, r = 1): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(lon + 180);
  const theta = THREE.MathUtils.degToRad(90 - lat);
  return new THREE.Vector3(
    -Math.cos(phi) * Math.sin(theta) * r,
    Math.cos(theta) * r,
    Math.sin(phi) * Math.sin(theta) * r
  );
}

// Calculates the Euler angles required to rotate the globe so that the target site faces the camera (+Z).
export function getRotationToFaceSite(lat: number, lon: number) {
  const v = latLonToVec(lat, lon, 1);
  return {
    y: Math.atan2(-v.x, v.z),
    x: THREE.MathUtils.degToRad(lat),
  };
}

// Mars atmospheric glow shader component.
function MarsAtmosphere({ radius }: { radius: number }) {
  const shaderMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: { glowColor: { value: new THREE.Color('#ff8243') } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
            gl_FragColor = vec4(glowColor, intensity * 0.85);
          }
        `,
      }),
    []
  );

  return (
    <mesh material={shaderMat}>
      <sphereGeometry args={[radius * 1.045, 64, 64]} />
    </mesh>
  );
}

interface GlobeProps {
  place: 'moon' | 'mars';
  radius?: number;
  markers?: LocationMarker[];
  activeMarkerId?: string | null;
  onMarkerClick?: (marker: LocationMarker) => void;
  rotationSpeed?: number;
}

// The core 3D Globe with planetary textures and markers.
export const Globe = forwardRef<THREE.Group, GlobeProps>(function Globe(
  { place, radius = 2.2, markers = [], activeMarkerId, onMarkerClick, rotationSpeed = 0.02 },
  ref
) {
  const isMoon = place === 'moon';
  const colorMap = useTexture(isMoon ? '/textures/moon.jpg' : '/textures/mars.jpg');
  const heightMap = useTexture(isMoon ? '/textures/moon-height.jpg' : '/textures/mars.jpg');

  // Pulsing animation for site markers
  const markerPulseRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (markerPulseRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 3.5) * 0.15;
      markerPulseRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={ref}>
      {/* Planetary Sphere */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[radius, 96, 96]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={isMoon ? heightMap : undefined}
          bumpScale={isMoon ? 0.04 : 0}
          roughness={isMoon ? 0.95 : 0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Atmospheric limb glow for Mars */}
      {!isMoon && <MarsAtmosphere radius={radius} />}

      {/* Surface Equipment Location Markers */}
      <group ref={markerPulseRef}>
        {markers.map((marker) => {
          const pos = latLonToVec(marker.lat, marker.lon, radius * 1.006);
          const isActive = marker.id === activeMarkerId;
          const markerColor = isActive ? '#ffdf7a' : isMoon ? '#d4af37' : '#ff6b4a';

          // Orientation of marker normal to the sphere surface
          const normal = pos.clone().normalize();
          const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

          return (
            <group
              key={marker.id}
              position={pos}
              quaternion={quat}
              onClick={(e) => {
                e.stopPropagation();
                onMarkerClick?.(marker);
              }}
              onPointerOver={() => {
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              {/* Outer pulsing ping ring */}
              <mesh position={[0, 0, 0.01]}>
                <ringGeometry args={[0.06, 0.085, 32]} />
                <meshBasicMaterial
                  color={markerColor}
                  side={THREE.DoubleSide}
                  transparent
                  opacity={isActive ? 0.9 : 0.6}
                />
              </mesh>

              {/* Inner glowing beacon dot */}
              <mesh position={[0, 0, 0.02]}>
                <circleGeometry args={[0.035, 24]} />
                <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
              </mesh>

              {/* Point light accent on the surface */}
              {isActive && (
                <pointLight color={markerColor} intensity={1.5} distance={0.8} decay={2} position={[0, 0, 0.08]} />
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
});
