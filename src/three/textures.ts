// Procedural textures for 3D spacecraft materials: crinkled foil, brushed metal, wire mesh, solar cells, and regolith.
import * as THREE from 'three';
import { fbm, noise2 } from './noise';

const textureCache = new Map<string, THREE.Texture>();

// Renders an image onto an offscreen canvas and returns a reusable THREE.CanvasTexture.
function createProceduralTexture(
  cacheKey: string,
  resolution: number,
  renderPixelData: (img: ImageData) => void,
  isColor = true,
  repeatCount = 1
): THREE.Texture {
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = resolution;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(resolution, resolution);

  renderPixelData(imageData);
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatCount, repeatCount);
  texture.anisotropy = 8;
  if (isColor) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  textureCache.set(cacheKey, texture);
  return texture;
}

// Generates procedural regolith texture for lunar grey dust or martian rust soil.
export function regolithTexture(place: 'moon' | 'mars'): THREE.Texture {
  const [r0, g0, b0] = place === 'moon' ? [118, 115, 110] : [150, 78, 44];
  const [r1, g1, b1] = place === 'moon' ? [165, 162, 155] : [196, 112, 66];

  return createProceduralTexture(`regolith-${place}`, 512, (img) => {
    const size = img.width;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = fbm(x / 64, y / 64, 5, place === 'moon' ? 3 : 7);
        const grain = noise2(x * 0.9, y * 0.9, 11) * 0.25;
        const t = Math.min(1, Math.max(0, n * 1.1 + grain - 0.15));
        const idx = (y * size + x) * 4;
        img.data[idx] = r0 + (r1 - r0) * t;
        img.data[idx + 1] = g0 + (g1 - g0) * t;
        img.data[idx + 2] = b0 + (b1 - b0) * t;
        img.data[idx + 3] = 255;
      }
    }
  }, true, 6);
}

// Normal map that simulates crinkled multi-layer insulation (MLI) gold and silver thermal foil.
export function foilNormal(): THREE.Texture {
  return createProceduralTexture('foil-normal', 256, (img) => {
    const size = img.width;
    const heightAt = (x: number, y: number) => fbm(x / 18, y / 18, 4, 5) + noise2(x / 5, y / 5, 9) * 0.25;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = heightAt(x + 1, y) - heightAt(x - 1, y);
        const dy = heightAt(x, y + 1) - heightAt(x, y - 1);
        const nx = -dx * 3;
        const ny = -dy * 3;
        const len = Math.hypot(nx, ny, 1);
        const idx = (y * size + x) * 4;
        img.data[idx] = ((nx / len) * 0.5 + 0.5) * 255;
        img.data[idx + 1] = ((ny / len) * 0.5 + 0.5) * 255;
        img.data[idx + 2] = (1 / len) * 0.5 * 255 + 127;
        img.data[idx + 3] = 255;
      }
    }
  }, false, 2);
}

// Roughness map with brushed linear streaks for bare aerospace aluminium.
export function brushedRoughness(): THREE.Texture {
  return createProceduralTexture('brushed', 256, (img) => {
    const size = img.width;
    for (let y = 0; y < size; y++) {
      const rowNoise = noise2(0, y * 0.9, 31) * 60;
      for (let x = 0; x < size; x++) {
        const value = 120 + rowNoise + noise2(x / 60, y * 2, 32) * 40 + fbm(x / 30, y / 30, 3, 33) * 30;
        const idx = (y * size + x) * 4;
        img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = Math.min(255, value);
        img.data[idx + 3] = 255;
      }
    }
  }, false, 2);
}

// Alpha mask texture simulating woven piano-wire mesh for LRV tires.
export function wireMeshTexture(): THREE.Texture {
  return createProceduralTexture('wiremesh', 256, (img) => {
    const size = img.width;
    const cell = 16;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const diagonalA = (x + y) % cell;
        const diagonalB = (x - y + size * 4) % cell;
        const isWire = diagonalA < 3 || diagonalB < 3;
        const shade = isWire ? 200 - (diagonalA < 3 ? diagonalA : diagonalB) * 25 : 0;
        const idx = (y * size + x) * 4;
        img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = shade;
        img.data[idx + 3] = isWire ? 255 : 0;
      }
    }
  }, false, 1);
}

// Surface grime texture to create realistic weathered dust layers on spacecraft paint.
export function grimeTexture(place: 'moon' | 'mars'): THREE.Texture {
  const tint = place === 'mars' ? [214, 150, 112] : [196, 192, 184];
  return createProceduralTexture(`grime-${place}`, 256, (img) => {
    const size = img.width;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = fbm(x / 40, y / 40, 5, 41);
        const t = Math.min(1, Math.max(0, (n - 0.35) * 1.8)) * 0.55 + (y / size) * 0.25;
        const idx = (y * size + x) * 4;
        img.data[idx] = 255 + (tint[0] - 255) * t;
        img.data[idx + 1] = 255 + (tint[1] - 255) * t;
        img.data[idx + 2] = 255 + (tint[2] - 255) * t;
        img.data[idx + 3] = 255;
      }
    }
  }, true, 1);
}

// Blue solar cell grid pattern texture for spacecraft solar panels.
export function solarTexture(): THREE.Texture {
  return createProceduralTexture('solar', 256, (img) => {
    const size = img.width;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const isGridLine = x % 32 < 2 || y % 16 < 1;
        const subtleShade = noise2(x / 40, y / 40, 4) * 18;
        const idx = (y * size + x) * 4;
        img.data[idx] = isGridLine ? 150 : 22 + subtleShade;
        img.data[idx + 1] = isGridLine ? 155 : 34 + subtleShade;
        img.data[idx + 2] = isGridLine ? 165 : 78 + subtleShade * 1.5;
        img.data[idx + 3] = 255;
      }
    }
  }, true, 2);
}
