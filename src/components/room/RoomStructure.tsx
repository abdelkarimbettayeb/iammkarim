'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { VenetianWindow } from './items';
import { ROOM, WINDOW, PATH_X } from './layout';

/** Seeded pseudo-random so the planks look the same on every render */
function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 1m x 1m tile of oak floor boards (8 boards of 12.5cm) */
function createOakTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const rand = mulberry(7);
  const rows = 8;
  const rowH = size / rows;
  for (let r = 0; r < rows; r++) {
    // Each row is split into 1-2 boards with a staggered butt joint
    const joint = rand() > 0.5 ? Math.floor(size * (0.25 + rand() * 0.5)) : size;
    const segments: [number, number][] = joint < size ? [[0, joint], [joint, size]] : [[0, size]];
    for (const [x0, x1] of segments) {
      const l = 62 + rand() * 6;
      const hue = 33 + rand() * 4;
      ctx.fillStyle = `hsl(${hue}, 42%, ${l}%)`;
      ctx.fillRect(x0, r * rowH, x1 - x0, rowH);
      // faint grain streaks
      ctx.strokeStyle = `rgba(120, 80, 40, ${0.05 + rand() * 0.06})`;
      ctx.lineWidth = 1;
      for (let g = 0; g < 5; g++) {
        const y = r * rowH + rand() * rowH;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y + (rand() - 0.5) * 3);
        ctx.stroke();
      }
      // vertical joint
      ctx.fillStyle = 'rgba(70, 45, 20, 0.35)';
      ctx.fillRect(x0, r * rowH, 1.5, rowH);
    }
    // horizontal seam
    ctx.fillStyle = 'rgba(70, 45, 20, 0.4)';
    ctx.fillRect(0, r * rowH, size, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function RoomStructure() {
  const { minX, maxX, minZ, maxZ, wallHeight: H, wallThickness: T } = ROOM;
  const width = maxX - minX;
  const depth = maxZ - minZ;
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  const floorTexture = useMemo(() => {
    const tex = createOakTexture();
    tex.repeat.set(width, depth);
    return tex;
  }, [width, depth]);

  // Back wall is built in pieces around the window opening
  const openLeft = WINDOW.cx - WINDOW.width / 2;
  const openRight = WINDOW.cx + WINDOW.width / 2;
  const openTop = WINDOW.sill + WINDOW.height;
  const backMinX = minX - T; // overlaps the left wall corner
  const backZ = minZ - T / 2;

  const wallMat = <meshStandardMaterial color="#FFFFFF" roughness={0.9} metalness={0.01} />;
  const trimMat = <meshStandardMaterial color="#E7E5E4" roughness={0.6} />;

  return (
    <group name="room-structure">
      {/* 1. Concrete foundation: a ledge around the open (right/front) sides */}
      <mesh position={[centerX + 0.075, -0.16, centerZ + 0.2]} receiveShadow>
        <boxGeometry args={[width + 0.45, 0.3, depth + 0.7]} />
        <meshStandardMaterial color="#B7B1A6" roughness={0.9} />
      </mesh>

      {/* 2. Entrance step lined up with the garden walkway */}
      <mesh position={[PATH_X, -0.1, maxZ + 0.42]} receiveShadow castShadow>
        <boxGeometry args={[1.25, 0.2, 0.34]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.85} />
      </mesh>

      {/* 3. Interior oak plank floor (top at y = 0) */}
      <mesh position={[centerX, -0.06, centerZ]} receiveShadow>
        <boxGeometry args={[width, 0.12, depth]} />
        <meshStandardMaterial map={floorTexture} roughness={0.7} metalness={0.02} />
      </mesh>

      {/* 4. Area rug under the lounge set */}
      <mesh position={[1.15, 0.006, 0.45]} receiveShadow>
        <boxGeometry args={[2.7, 0.012, 1.9]} />
        <meshStandardMaterial color="#D6CFC2" roughness={1} />
      </mesh>
      <mesh position={[1.15, 0.0125, 0.45]} receiveShadow>
        <boxGeometry args={[2.5, 0.012, 1.7]} />
        <meshStandardMaterial color="#E7E1D6" roughness={1} />
      </mesh>

      {/* 5. Left wall */}
      <mesh position={[minX - T / 2, H / 2, centerZ - T / 2]} receiveShadow>
        <boxGeometry args={[T, H, depth + T]} />
        {wallMat}
      </mesh>

      {/* 6. Back wall, in four pieces around the window opening */}
      {/* left of window */}
      <mesh position={[(backMinX + openLeft) / 2, H / 2, backZ]} receiveShadow>
        <boxGeometry args={[openLeft - backMinX, H, T]} />
        {wallMat}
      </mesh>
      {/* right of window */}
      <mesh position={[(openRight + maxX) / 2, H / 2, backZ]} receiveShadow>
        <boxGeometry args={[maxX - openRight, H, T]} />
        {wallMat}
      </mesh>
      {/* below window */}
      <mesh position={[WINDOW.cx, WINDOW.sill / 2, backZ]} receiveShadow>
        <boxGeometry args={[WINDOW.width, WINDOW.sill, T]} />
        {wallMat}
      </mesh>
      {/* above window */}
      <mesh position={[WINDOW.cx, (openTop + H) / 2, backZ]} receiveShadow>
        <boxGeometry args={[WINDOW.width, H - openTop, T]} />
        {wallMat}
      </mesh>

      {/* 7. Skirting boards */}
      <mesh position={[minX + 0.01, 0.05, centerZ]}>
        <boxGeometry args={[0.02, 0.1, depth]} />
        {trimMat}
      </mesh>
      <mesh position={[(minX + openLeft) / 2, 0.05, minZ + 0.01]}>
        <boxGeometry args={[openLeft - minX, 0.1, 0.02]} />
        {trimMat}
      </mesh>
      <mesh position={[(openRight + maxX) / 2, 0.05, minZ + 0.01]}>
        <boxGeometry args={[maxX - openRight, 0.1, 0.02]} />
        {trimMat}
      </mesh>
      <mesh position={[WINDOW.cx, 0.05, minZ + 0.01]}>
        <boxGeometry args={[WINDOW.width, 0.1, 0.02]} />
        {trimMat}
      </mesh>

      {/* 7b. Crown molding where the walls meet the (cut-away) ceiling */}
      <mesh position={[minX + 0.02, H - 0.035, centerZ]}>
        <boxGeometry args={[0.04, 0.07, depth]} />
        {trimMat}
      </mesh>
      <mesh position={[centerX, H - 0.035, minZ + 0.02]}>
        <boxGeometry args={[width, 0.07, 0.04]} />
        {trimMat}
      </mesh>

      {/* 7c. Cut-away caps: dark tops show the wall thickness like an architectural model */}
      <mesh position={[minX - T / 2, H + 0.012, centerZ - T / 2]} castShadow>
        <boxGeometry args={[T + 0.02, 0.024, depth + T + 0.02]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <mesh position={[(backMinX + maxX) / 2, H + 0.012, backZ]} castShadow>
        <boxGeometry args={[maxX - backMinX + 0.02, 0.024, T + 0.02]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* Wall ends on the open sides get the same dark edge */}
      <mesh position={[minX - T / 2, H / 2, maxZ + 0.006]}>
        <boxGeometry args={[T + 0.02, H + 0.02, 0.012]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <mesh position={[maxX + 0.006, H / 2, backZ]}>
        <boxGeometry args={[0.012, H + 0.02, T + 0.02]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>

      {/* 7d. Finished floor edge along the open sides (walnut nosing over the slab) */}
      <mesh position={[centerX, -0.06, maxZ + 0.008]} receiveShadow>
        <boxGeometry args={[width, 0.12, 0.016]} />
        <meshStandardMaterial color="#6B4426" roughness={0.6} />
      </mesh>
      <mesh position={[maxX + 0.008, -0.06, centerZ]} receiveShadow>
        <boxGeometry args={[0.016, 0.12, depth + 0.016]} />
        <meshStandardMaterial color="#6B4426" roughness={0.6} />
      </mesh>

      {/* 7e. Stone plinth around the outside foot of the walls */}
      <mesh position={[minX - T - 0.02, 0.12, centerZ - T / 2]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.3, depth + T + 0.04]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.9} />
      </mesh>
      <mesh position={[(backMinX + maxX) / 2, 0.12, minZ - T - 0.02]} castShadow receiveShadow>
        <boxGeometry args={[maxX - backMinX + 0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.9} />
      </mesh>

      {/* 8. Window frame, sash and venetian blind (centred in the opening) */}
      <VenetianWindow
        position={[WINDOW.cx, WINDOW.sill + WINDOW.height / 2, minZ - T / 2]}
        width={WINDOW.width}
        height={WINDOW.height}
        depth={T}
      />
    </group>
  );
}
