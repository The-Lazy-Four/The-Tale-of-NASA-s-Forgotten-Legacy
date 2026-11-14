// High-fidelity 3D models for the space machines:
// - Apollo 11 Laser Ranging Retroreflector (RetroreflectorHD)
// - Apollo Lunar Roving Vehicle (LrvHD)
// - Surveyor 3 Lunar Soft-Lander (SurveyorHD)
// - Sojourner Mars Rover (SojournerHD)
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { brushedRoughness, foilNormal, grimeTexture, solarTexture, wireMeshTexture } from './textures';

type V3 = [number, number, number];

// Hook to instantiate authentic PBR aerospace materials based on the celestial environment.
function useMats(place: 'moon' | 'mars') {
  return useMemo(() => {
    const grime = grimeTexture(place);
    const brushed = brushedRoughness();
    const foil = foilNormal();
    const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
    const wire = wireMeshTexture().clone();
    wire.needsUpdate = true;
    wire.repeat.set(8, 1);

    return {
      alu: std({ color: '#c8ccd2', metalness: 0.92, roughness: 0.38, roughnessMap: brushed, map: grime }),
      aluDark: std({ color: '#5a5e66', metalness: 0.75, roughness: 0.45, roughnessMap: brushed }),
      anodized: std({ color: '#8b9097', metalness: 0.6, roughness: 0.5, map: grime }),
      paint: std({ color: '#ece9e1', metalness: 0.05, roughness: 0.72, map: grime }),
      paintTan: std({ color: '#d8ccb2', metalness: 0.05, roughness: 0.78, map: grime }),
      gold: std({ color: '#d6a84a', metalness: 1, roughness: 0.3, normalMap: foil, normalScale: new THREE.Vector2(1.4, 1.4) }),
      silverFoil: std({ color: '#dcdde2', metalness: 1, roughness: 0.22, normalMap: foil, normalScale: new THREE.Vector2(1.2, 1.2) }),
      black: std({ color: '#141518', metalness: 0.2, roughness: 0.75 }),
      rubber: std({ color: '#25262a', metalness: 0, roughness: 0.9 }),
      solar: new THREE.MeshPhysicalMaterial({ color: '#ffffff', map: solarTexture(), metalness: 0.4, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }),
      mirror: std({ color: '#e8ecf2', metalness: 1, roughness: 0.06 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#cfe4ef', metalness: 0.9, roughness: 0.04, clearcoat: 1, envMapIntensity: 2 }),
      lens: new THREE.MeshPhysicalMaterial({ color: '#1a2230', metalness: 0.6, roughness: 0.05, clearcoat: 1 }),
      titanium: std({ color: '#9da1a8', metalness: 0.9, roughness: 0.42, roughnessMap: brushed }),
      wireMesh: std({ color: '#b9bcc0', metalness: 0.9, roughness: 0.35, alphaMap: wire, alphaTest: 0.5, side: THREE.DoubleSide }),
      fender: std({ color: '#9aa4ae', metalness: 0.25, roughness: 0.6, map: grime, side: THREE.DoubleSide }),
      webbing: std({ color: '#6c7682', metalness: 0, roughness: 0.95 }),
      dial: std({ color: '#2a2d33', metalness: 0.3, roughness: 0.4 }),
      orange: std({ color: '#c5652d', metalness: 0.1, roughness: 0.6 }),
    };
  }, [place]);
}

type Mats = ReturnType<typeof useMats>;

// Helper component that constructs a cylindrical tube between two 3D vectors.
function Tube({ a, b, r = 0.02, m }: { a: V3; b: V3; r?: number; m: THREE.Material }) {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const d = vb.clone().sub(va);
    return {
      pos: va.clone().add(vb).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()),
      len: d.length(),
    };
  }, [a, b]);

  return (
    <mesh position={pos} quaternion={quat} castShadow receiveShadow material={m}>
      <cylinderGeometry args={[r, r, len, 10]} />
    </mesh>
  );
}

// Helper component that renders an oriented box or rounded box.
function Box({ p, s, m, r, round = 0 }: { p: V3; s: V3; m: THREE.Material; r?: V3; round?: number }) {
  if (round > 0) {
    return (
      <RoundedBox args={s} radius={round} smoothness={3} position={p} rotation={r} castShadow receiveShadow material={m} />
    );
  }
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow material={m}>
      <boxGeometry args={s} />
    </mesh>
  );
}

// Helper component that renders an oriented cylinder.
function Cyl({ p, r, h, m, rot, seg = 24, open = false }: { p: V3; r: number | [number, number]; h: number; m: THREE.Material; rot?: V3; seg?: number; open?: boolean }) {
  const [rt, rb] = Array.isArray(r) ? r : [r, r];
  return (
    <mesh position={p} rotation={rot} castShadow receiveShadow material={m}>
      <cylinderGeometry args={[rt, rb, h, seg, 1, open]} />
    </mesh>
  );
}

// Helper component for instanced copies of identical geometry positioned by transformation matrices.
function Instances({ geo, m, mats }: { geo: THREE.BufferGeometry; m: THREE.Material; mats: THREE.Matrix4[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    mats.forEach((mx, i) => ref.current?.setMatrixAt(i, mx));
    if (ref.current) {
      ref.current.instanceMatrix.needsUpdate = true;
    }
  }, [mats]);
  return <instancedMesh ref={ref} args={[geo, m, mats.length]} castShadow receiveShadow />;
}

const M4 = (p: V3, r: V3 = [0, 0, 0], s: V3 = [1, 1, 1]) =>
  new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));

// =====================================================================================
// Apollo 11 Laser Ranging Retroreflector (LRRR)
// =====================================================================================
export function RetroreflectorHD() {
  const m = useMats('moon');
  const G = -0.62;
  const cubes = useMemo(() => {
    const prism: THREE.Matrix4[] = [];
    const ring: THREE.Matrix4[] = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const x = -0.585 + i * 0.13;
        const z = -0.585 + j * 0.13;
        prism.push(M4([x, 0.035, z], [Math.PI, (i * 7 + j * 3) * 0.35, 0]));
        ring.push(M4([x, 0.05, z]));
      }
    }
    return { prism, ring };
  }, []);

  const prismGeo = useMemo(() => new THREE.ConeGeometry(0.052, 0.05, 3), []);
  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.056, 0.008, 6, 24).rotateX(Math.PI / 2), []);
  const pocketGeo = useMemo(() => new THREE.CylinderGeometry(0.056, 0.056, 0.02, 24), []);

  return (
    <group>
      {/* Base pallet sitting on the lunar regolith */}
      <Box p={[0, G + 0.05, 0.05]} s={[1.7, 0.1, 1.5]} m={m.alu} round={0.02} />
      <Box p={[0, G + 0.105, 0.05]} s={[1.6, 0.012, 1.4]} m={m.anodized} />
      {/* Leveling feet */}
      {[-0.75, 0.75].flatMap((x) =>
        [-0.6, 0.7].map((z) => <Cyl key={`${x}${z}`} p={[x, G + 0.015, z]} r={0.05} h={0.03} m={m.aluDark} />)
      )}

      {/* Hinged array panel tilted up to face Earth */}
      <group position={[0, G + 0.12, 0.72]} rotation={[0.62, 0, 0]}>
        <group position={[0, 0, -0.72]}>
          <Box p={[0, 0, 0]} s={[1.42, 0.08, 1.42]} m={m.alu} round={0.015} />
          <Box p={[0, 0.042, 0]} s={[1.36, 0.004, 1.36]} m={m.anodized} />
          <Instances geo={pocketGeo} m={m.black} mats={cubes.ring} />
          <Instances geo={prismGeo} m={m.glass} mats={cubes.prism} />
          <Instances geo={ringGeo} m={m.alu} mats={cubes.ring} />
          {[-0.71, 0.71].map((x) => <Box key={x} p={[x, 0.05, 0]} s={[0.03, 0.05, 1.44]} m={m.aluDark} />)}
          {[-0.71, 0.71].map((z) => <Box key={z} p={[0, 0.05, z]} s={[1.44, 0.05, 0.03]} m={m.aluDark} />)}
          <Tube a={[-0.45, 0.05, -0.74]} b={[-0.45, 0.16, -0.8]} r={0.012} m={m.alu} />
          <Tube a={[0.45, 0.05, -0.74]} b={[0.45, 0.16, -0.8]} r={0.012} m={m.alu} />
          <Tube a={[-0.45, 0.16, -0.8]} b={[0.45, 0.16, -0.8]} r={0.012} m={m.alu} />
        </group>
      </group>

      {/* Rear support legs holding the 26-degree tilt */}
      <Tube a={[-0.6, G + 0.11, -0.55]} b={[-0.6, G + 0.62, -0.42]} r={0.022} m={m.alu} />
      <Tube a={[0.6, G + 0.11, -0.55]} b={[0.6, G + 0.62, -0.42]} r={0.022} m={m.alu} />
      <Tube a={[-0.6, G + 0.62, -0.42]} b={[0.6, G + 0.62, -0.42]} r={0.015} m={m.alu} />

      {/* Sun compass (gnomon) and bubble level used by Neil and Buzz to align the panel */}
      <Box p={[0.62, G + 0.13, 0.55]} s={[0.26, 0.02, 0.18]} m={m.paint} />
      <Tube a={[0.62, G + 0.14, 0.55]} b={[0.62, G + 0.3, 0.55]} r={0.006} m={m.black} />
      <mesh position={[0.4, G + 0.13, 0.62]} castShadow material={m.glass}>
        <sphereGeometry args={[0.035, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  );
}

// =====================================================================================
// Apollo Lunar Roving Vehicle (LRV)
// =====================================================================================
function LrvWheel({ p, m, side }: { p: V3; m: Mats; side: 1 | -1 }) {
  const R = 0.33;
  const W = 0.23;
  const chevrons = useMemo(() => {
    const out: THREE.Matrix4[] = [];
    const n = 24;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      for (const s of [-1, 1]) {
        out.push(
          M4([Math.cos(a) * (R + 0.006), Math.sin(a) * (R + 0.006), s * W * 0.25], [0, 0, a], [1, 1, 1]).multiply(
            new THREE.Matrix4().makeRotationX(s * 0.5)
          )
        );
      }
    }
    return out;
  }, []);

  const chevGeo = useMemo(() => new THREE.BoxGeometry(0.012, 0.035, W * 0.55), []);

  return (
    <group position={p}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={m.wireMesh}>
        <cylinderGeometry args={[R, R, W, 48, 1, true]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={m.titanium}>
        <torusGeometry args={[R * 0.8, 0.012, 8, 32]} />
      </mesh>
      <Instances geo={chevGeo} m={m.titanium} mats={chevrons} />
      {[-W / 2, W / 2].map((z) => (
        <mesh key={z} position={[0, 0, z]} material={m.alu}>
          <torusGeometry args={[R - 0.01, 0.012, 8, 40]} />
        </mesh>
      ))}
      <Cyl p={[0, 0, side * W * 0.15]} r={0.16} h={0.04} m={m.alu} rot={[Math.PI / 2, 0, 0]} seg={32} />
      <Cyl p={[0, 0, side * W * 0.3]} r={0.07} h={0.08} m={m.aluDark} rot={[Math.PI / 2, 0, 0]} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <Tube
            key={i}
            a={[Math.cos(a) * 0.15, Math.sin(a) * 0.15, side * W * 0.15]}
            b={[Math.cos(a) * R * 0.97, Math.sin(a) * R * 0.97, side * W * 0.05]}
            r={0.008}
            m={m.alu}
          />
        );
      })}
    </group>
  );
}

export function LrvHD() {
  const m = useMats('moon');
  const G = -0.64;
  const wy = G + 0.33;
  const wheels: [number, number][] = [
    [0.98, 0.78],
    [0.98, -0.78],
    [-0.98, 0.78],
    [-0.98, -0.78],
  ];

  return (
    <group>
      {/* Chassis: aluminium tubular spaceframe */}
      {[-0.42, 0.42].map((z) => <Tube key={z} a={[-1.15, -0.05, z]} b={[1.15, -0.05, z]} r={0.028} m={m.alu} />)}
      {[-1.15, -0.4, 0.4, 1.15].map((x) => <Tube key={x} a={[x, -0.05, -0.42]} b={[x, -0.05, 0.42]} r={0.024} m={m.alu} />)}
      <Box p={[0, -0.07, 0]} s={[1.6, 0.012, 0.82]} m={m.anodized} />

      {/* Suspension arms and wheels */}
      {wheels.map(([x, z]) => (
        <group key={`${x}${z}`}>
          <Tube a={[x * 0.62, -0.03, Math.sign(z) * 0.42]} b={[x, wy + 0.06, z * 0.82]} r={0.02} m={m.alu} />
          <Tube a={[x * 0.62, -0.1, Math.sign(z) * 0.42]} b={[x, wy - 0.04, z * 0.82]} r={0.02} m={m.alu} />
          <Tube a={[x * 0.75, 0.06, Math.sign(z) * 0.42]} b={[x, wy + 0.04, z * 0.85]} r={0.03} m={m.aluDark} />
          <LrvWheel p={[x, wy, z]} m={m} side={z > 0 ? 1 : -1} />
          <mesh position={[x, wy, z]} rotation={[Math.PI / 2, 0, 0]} castShadow material={m.fender}>
            <cylinderGeometry args={[0.39, 0.39, 0.27, 32, 1, true, Math.PI * 0.62, Math.PI * 0.76]} />
          </mesh>
        </group>
      ))}

      {/* Astronaut nylon webbing seats */}
      {[-0.27, 0.27].map((z) => (
        <group key={z} position={[-0.2, 0, z]}>
          <Box p={[0, 0.06, 0]} s={[0.48, 0.03, 0.4]} m={m.webbing} round={0.01} />
          <group position={[-0.24, 0.05, 0]} rotation={[0, 0, 0.32]}>
            <Box p={[0, 0.24, 0]} s={[0.035, 0.48, 0.4]} m={m.webbing} round={0.01} />
          </group>
          <Tube a={[0.22, -0.05, -0.2]} b={[0.22, 0.06, -0.2]} r={0.015} m={m.alu} />
          <Tube a={[0.22, -0.05, 0.2]} b={[0.22, 0.06, 0.2]} r={0.015} m={m.alu} />
          <Tube a={[-0.24, 0.06, z > 0 ? 0.21 : -0.21]} b={[0.12, 0.2, z > 0 ? 0.21 : -0.21]} r={0.014} m={m.alu} />
          <Tube a={[0.42, -0.06, -0.15]} b={[0.42, -0.06, 0.15]} r={0.016} m={m.alu} />
        </group>
      ))}

      {/* Central T-handle hand controller */}
      <Tube a={[0.08, -0.05, 0]} b={[0.08, 0.2, 0]} r={0.018} m={m.black} />
      <Tube a={[0.08, 0.2, -0.05]} b={[0.08, 0.2, 0.05]} r={0.016} m={m.black} />

      {/* Control console with dials */}
      <Tube a={[0.5, -0.05, 0]} b={[0.5, 0.32, 0]} r={0.025} m={m.alu} />
      <group position={[0.5, 0.4, 0]} rotation={[0, 0, 0.45]}>
        <Box p={[0, 0, 0]} s={[0.07, 0.22, 0.36]} m={m.aluDark} round={0.01} />
        {[-0.1, 0, 0.1].flatMap((zz) =>
          [0.04, -0.05].map((yy) => (
            <Cyl key={`${zz}${yy}`} p={[-0.04, yy, zz]} r={0.025} h={0.012} m={m.dial} rot={[0, 0, Math.PI / 2]} />
          ))
        )}
        <Box p={[-0.04, 0.0, 0]} s={[0.005, 0.2, 0.33]} m={m.black} />
      </group>

      {/* Forward electronics, batteries and mirrors */}
      <Box p={[0.88, 0.04, 0.12]} s={[0.36, 0.14, 0.3]} m={m.paint} round={0.015} />
      <Box p={[0.88, 0.04, -0.22]} s={[0.36, 0.14, 0.3]} m={m.paint} round={0.015} />
      <Box p={[0.88, 0.12, 0.12]} s={[0.37, 0.012, 0.31]} m={m.mirror} r={[0, 0, -0.08]} />
      <Box p={[1.08, 0.24, 0.18]} s={[0.22, 0.26, 0.3]} m={m.silverFoil} round={0.01} />
      <Box p={[1.08, 0.38, 0.18]} s={[0.22, 0.012, 0.3]} m={m.mirror} />

      {/* High-gain umbrella antenna on mast */}
      <Tube a={[1.0, 0.08, -0.32]} b={[1.0, 0.95, -0.32]} r={0.016} m={m.alu} />
      <group position={[1.0, 1.0, -0.32]} rotation={[0.25, 0, -0.55]}>
        <mesh castShadow material={m.wireMesh}>
          <coneGeometry args={[0.38, 0.16, 32, 1, true]} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <Tube key={i} a={[0, 0.08, 0]} b={[Math.cos(a) * 0.38, -0.08, Math.sin(a) * 0.38]} r={0.005} m={m.alu} />;
        })}
        <Tube a={[0, 0.08, 0]} b={[0, -0.12, 0]} r={0.01} m={m.alu} />
      </group>

      {/* Low-gain helical antenna */}
      <Tube a={[1.12, 0.08, -0.05]} b={[1.12, 0.62, -0.05]} r={0.012} m={m.alu} />
      <mesh position={[1.12, 0.74, -0.05]} material={m.alu}>
        <torusKnotGeometry args={[0.03, 0.006, 64, 6, 1, 8]} />
      </mesh>

      {/* Ground-controlled RCA color TV camera */}
      <Tube a={[1.05, 0.38, 0.32]} b={[1.05, 0.7, 0.32]} r={0.016} m={m.alu} />
      <group position={[1.07, 0.76, 0.32]}>
        <Box p={[0, 0, 0]} s={[0.16, 0.12, 0.14]} m={m.silverFoil} round={0.01} />
        <Cyl p={[0.1, 0, 0]} r={0.035} h={0.07} m={m.black} rot={[0, 0, Math.PI / 2]} />
        <Cyl p={[0.135, 0, 0]} r={0.028} h={0.005} m={m.lens} rot={[0, 0, Math.PI / 2]} />
      </group>

      {/* Aft geology tool carrier pallet */}
      <Box p={[-1.12, 0.08, 0]} s={[0.24, 0.28, 0.72]} m={m.anodized} round={0.015} />
      <Box p={[-1.12, 0.26, -0.15]} s={[0.2, 0.1, 0.3]} m={m.paint} round={0.03} />
      <Tube a={[-1.22, 0.1, 0.2]} b={[-1.05, 0.62, 0.2]} r={0.012} m={m.alu} />
      <Tube a={[-1.22, 0.1, 0.28]} b={[-1.08, 0.58, 0.3]} r={0.012} m={m.alu} />
      <Box p={[-1.02, 0.64, 0.2]} s={[0.05, 0.03, 0.08]} m={m.alu} />
    </group>
  );
}

// =====================================================================================
// Surveyor 3 Soft-Lander
// =====================================================================================
export function SurveyorHD() {
  const m = useMats('moon');
  const G = -0.7;
  const legA = [Math.PI / 6, (5 * Math.PI) / 6, (3 * Math.PI) / 2];
  const at = (a: number, r: number, y: number): V3 => [Math.cos(a) * r, y, Math.sin(a) * r];

  return (
    <group>
      {/* Triangular open truss spaceframe */}
      {legA.map((a, i) => {
        const b = legA[(i + 1) % 3];
        return (
          <group key={i}>
            <Tube a={at(a, 0.62, -0.12)} b={at(b, 0.62, -0.12)} r={0.026} m={m.alu} />
            <Tube a={at(a, 0.62, -0.12)} b={[0, 0.55, 0]} r={0.02} m={m.alu} />
            <Tube a={at(a, 0.62, -0.12)} b={at(b, 0.35, 0.2)} r={0.014} m={m.alu} />
          </group>
        );
      })}

      {/* Three landing legs with crushable honeycomb footpads */}
      {legA.map((a, i) => (
        <group key={`leg${i}`}>
          <Tube a={at(a, 0.62, -0.12)} b={at(a, 1.18, G + 0.1)} r={0.03} m={m.alu} />
          <Tube a={at(a, 0.72, -0.2)} b={at(a, 0.98, G + 0.3)} r={0.045} m={m.aluDark} />
          <Tube a={at(a + 0.25, 0.5, -0.12)} b={at(a, 1.05, G + 0.18)} r={0.018} m={m.alu} />
          <Tube a={at(a - 0.25, 0.5, -0.12)} b={at(a, 1.05, G + 0.18)} r={0.018} m={m.alu} />
          <Cyl p={at(a, 1.2, G + 0.06)} r={[0.15, 0.17]} h={0.1} m={m.paintTan} seg={28} />
          <Cyl p={at(a, 1.2, G + 0.115)} r={0.07} h={0.03} m={m.alu} />
          <Box p={at(a, 0.62, -0.22)} s={[0.12, 0.1, 0.12]} m={m.paintTan} round={0.01} />
          <Cyl p={at(a + 0.6, 0.48, -0.28)} r={[0.035, 0.07]} h={0.16} m={m.aluDark} />
        </group>
      ))}

      {/* Electronics compartments A & B */}
      {[
        [0.52, 0.04, 0.0],
        [-0.36, 0.04, -0.34],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, i ? 0.8 : -0.3, 0]}>
          <Box p={[0, 0, 0]} s={[0.36, 0.3, 0.3]} m={m.paintTan} round={0.02} />
          <Box p={[0, 0.16, 0]} s={[0.34, 0.012, 0.28]} m={m.mirror} />
        </group>
      ))}

      {/* Spherical propellant and helium tanks */}
      {legA.map((a, i) => (
        <mesh key={`t${i}`} position={at(a + Math.PI / 3, 0.3, -0.05)} castShadow material={m.silverFoil}>
          <sphereGeometry args={[0.1, 20, 14]} />
        </mesh>
      ))}

      {/* Central mast with planar array antenna and solar panel */}
      <Tube a={[0, -0.12, 0]} b={[0, 1.38, 0]} r={0.03} m={m.alu} />
      <group position={[0, 1.36, 0]}>
        <group rotation={[0.55, 0, 0]} position={[0, 0, -0.08]}>
          <Box p={[0, 0, -0.32]} s={[0.92, 0.025, 0.62]} m={m.solar} />
          <Box p={[0, -0.016, -0.32]} s={[0.94, 0.008, 0.64]} m={m.aluDark} />
        </group>
        <group rotation={[-0.75, 0, 0]} position={[0, 0.06, 0.08]}>
          <Box p={[0, 0, 0.27]} s={[0.56, 0.03, 0.56]} m={m.paint} />
          <Box p={[0, 0.017, 0.27]} s={[0.5, 0.004, 0.5]} m={m.silverFoil} />
        </group>
      </group>

      {/* Vidicon TV camera under tilted mirror hood */}
      <group position={[0.16, 0.38, 0.42]}>
        <Cyl p={[0, 0, 0]} r={0.075} h={0.5} m={m.paintTan} seg={28} />
        <Cyl p={[0, -0.27, 0]} r={0.085} h={0.04} m={m.aluDark} seg={28} />
        <group position={[0, 0.29, 0]} rotation={[-0.6, 0, 0]}>
          <Box p={[0, 0, 0]} s={[0.17, 0.12, 0.17]} m={m.paintTan} round={0.01} />
          <Box p={[0, -0.01, 0.09]} s={[0.13, 0.09, 0.005]} m={m.mirror} />
        </group>
      </group>

      {/* Soil surface sampler pantograph arm and digging scoop */}
      <Tube a={[0.42, -0.1, 0.32]} b={[0.72, 0.05, 0.5]} r={0.018} m={m.alu} />
      <Tube a={[0.42, -0.16, 0.36]} b={[0.72, 0.0, 0.54]} r={0.012} m={m.alu} />
      <Tube a={[0.72, 0.03, 0.52]} b={[1.02, G + 0.2, 0.62]} r={0.016} m={m.alu} />
      <group position={[1.04, G + 0.14, 0.63]} rotation={[0, -0.5, 0.4]}>
        <Box p={[0, 0, 0]} s={[0.12, 0.08, 0.07]} m={m.aluDark} round={0.01} />
        <Box p={[0.07, -0.04, 0]} s={[0.04, 0.05, 0.07]} m={m.alu} />
      </group>
    </group>
  );
}

// =====================================================================================
// Sojourner Mars Rover
// =====================================================================================
function SojWheel({ p, m, flip }: { p: V3; m: Mats; flip: boolean }) {
  const cleats = useMemo(
    () => Array.from({ length: 14 }, (_, i) => M4([0, 0, 0], [0, 0, (i / 14) * Math.PI * 2]).multiply(M4([0.135, 0, 0]))),
    []
  );
  const cleatGeo = useMemo(() => new THREE.BoxGeometry(0.03, 0.016, 0.11), []);

  return (
    <group position={p} rotation={[0, flip ? Math.PI : 0, 0]}>
      <Cyl p={[0, 0, 0]} r={0.13} h={0.1} m={m.alu} rot={[Math.PI / 2, 0, 0]} seg={32} />
      <Cyl p={[0, 0, 0.051]} r={0.11} h={0.004} m={m.aluDark} rot={[Math.PI / 2, 0, 0]} seg={32} />
      <Cyl p={[0, 0, 0.06]} r={0.04} h={0.03} m={m.aluDark} rot={[Math.PI / 2, 0, 0]} />
      <Instances geo={cleatGeo} m={m.titanium} mats={cleats} />
    </group>
  );
}

export function SojournerHD() {
  const m = useMats('mars');
  const G = -0.6;
  const wy = G + 0.13;

  return (
    <group>
      {/* Warm Electronics Box (WEB) */}
      <Box p={[0, -0.13, 0]} s={[0.96, 0.24, 0.66]} m={m.anodized} round={0.02} />
      <Box p={[0, -0.13, 0.335]} s={[0.9, 0.2, 0.01]} m={m.gold} />
      <Box p={[0, -0.13, -0.335]} s={[0.9, 0.2, 0.01]} m={m.gold} />

      {/* Solar panel roof deck */}
      <Box p={[0, 0.0, 0]} s={[1.1, 0.025, 0.76]} m={m.solar} />
      <Box p={[0, -0.018, 0]} s={[1.12, 0.012, 0.78]} m={m.alu} />

      {/* Front stereo cameras and laser stripers */}
      <Box p={[0.5, -0.1, 0]} s={[0.04, 0.12, 0.5]} m={m.black} />
      {[-0.13, 0.13].map((z) => (
        <Cyl key={z} p={[0.53, -0.08, z]} r={0.022} h={0.03} m={m.lens} rot={[0, 0, Math.PI / 2]} />
      ))}
      {[-0.2, -0.05, 0.05, 0.2].map((z) => (
        <Box key={z} p={[0.53, -0.16, z]} s={[0.025, 0.025, 0.025]} m={m.orange} />
      ))}

      {/* Rear color camera */}
      <Cyl p={[-0.5, -0.06, 0.18]} r={0.02} h={0.03} m={m.lens} rot={[0, 0, Math.PI / 2]} />

      {/* APXS spectrometer deployment arm */}
      <Tube a={[-0.48, -0.2, 0]} b={[-0.66, -0.3, 0]} r={0.018} m={m.alu} />
      <Tube a={[-0.66, -0.3, 0]} b={[-0.74, -0.42, 0]} r={0.018} m={m.alu} />
      <Cyl p={[-0.78, -0.47, 0]} r={0.06} h={0.1} m={m.paint} rot={[0, 0, 0.5]} seg={20} />
      <Cyl p={[-0.81, -0.52, 0]} r={0.045} h={0.01} m={m.gold} rot={[0, 0, 0.5]} seg={20} />

      {/* Whip radio antenna */}
      <Cyl p={[-0.38, 0.02, -0.28]} r={0.025} h={0.02} m={m.aluDark} />
      <Tube a={[-0.38, 0.02, -0.28]} b={[-0.38, 0.62, -0.28]} r={0.006} m={m.black} />

      {/* Rocker-bogie 6-wheel mobility suspension */}
      {[-1, 1].map((s) => {
        const z = s * 0.46;
        return (
          <group key={s}>
            <Cyl p={[0.05, -0.2, s * 0.36]} r={0.035} h={0.08} m={m.aluDark} rot={[Math.PI / 2, 0, 0]} />
            <Tube a={[0.05, -0.2, z]} b={[0.45, wy, z]} r={0.018} m={m.alu} />
            <Tube a={[0.05, -0.2, z]} b={[-0.22, -0.3, z]} r={0.018} m={m.alu} />
            <Tube a={[-0.22, -0.3, z]} b={[-0.02, wy, z]} r={0.016} m={m.alu} />
            <Tube a={[-0.22, -0.3, z]} b={[-0.45, wy, z]} r={0.016} m={m.alu} />
            <Tube a={[0.05, -0.2, s * 0.34]} b={[0.05, -0.2, z]} r={0.018} m={m.alu} />
            {[0.45, -0.02, -0.45].map((x) => (
              <SojWheel key={x} p={[x, wy, s * 0.52]} m={m} flip={s < 0} />
            ))}
          </group>
        );
      })}
    </group>
  );
}
