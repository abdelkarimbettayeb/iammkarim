'use client';

import React from 'react';
import { VenetianWindow } from './items';

export function RoomStructure() {
  const floorWidth = 8.0;
  const interiorDepth = 5.6; // From Z = -4.0 to Z = +1.6 (Interior living area)
  const wallHeight = 6.6;
  const wallThickness = 0.35;
  const halfWidth = floorWidth / 2;

  // Center of interior floor in Z (from -4.0 to +1.6 -> center is -1.2)
  const interiorCenterZ = -1.2;

  return (
    <group name="room-structure">
      {/* 1. Master Base Plinth & Foundation (Encompassing room + outdoor garden apron) */}
      <mesh position={[0, -0.28, 0.4]} receiveShadow>
        <boxGeometry args={[floorWidth + 0.6, 0.25, 9.6]} />
        <meshStandardMaterial color="#141619" roughness={0.85} />
      </mesh>

      {/* 2. Interior Floor (Warm Oatmeal Carpet - extends to doorway threshold at Z = +2.2) */}
      <mesh position={[0, -0.08, interiorCenterZ]} receiveShadow>
        <boxGeometry args={[floorWidth, 0.16, interiorDepth]} />
        <meshStandardMaterial
          color="#EAE5DC"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {/* 3. Left Wall (Pure Crisp White Plaster) */}
      <mesh
        position={[-halfWidth - wallThickness / 2, wallHeight / 2 - 0.08, interiorCenterZ]}
        receiveShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, interiorDepth]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.9}
          metalness={0.01}
        />
      </mesh>

      {/* 4. Right/Back Wall (Pure Crisp White Plaster) */}
      <mesh
        position={[0, wallHeight / 2 - 0.08, -halfWidth - wallThickness / 2]}
        receiveShadow
      >
        <boxGeometry args={[floorWidth, wallHeight, wallThickness]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.9}
          metalness={0.01}
        />
      </mesh>

      {/* 5. Minimal Sleek Skirting Boards (Off-white / cream trim along interior walls) */}
      {/* Left Wall Skirting (Ending at doorway threshold) */}
      <mesh position={[-halfWidth + 0.03, 0.08, interiorCenterZ]}>
        <boxGeometry args={[0.05, 0.16, interiorDepth]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
      </mesh>
      {/* Back Wall Skirting */}
      <mesh position={[0, 0.08, -halfWidth + 0.03]}>
        <boxGeometry args={[floorWidth, 0.16, 0.05]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
      </mesh>

      {/* 6. Window Frame & Venetian Blinds - Shifted to x=2.8 to clear bookcase and closet */}
      <VenetianWindow position={[2.8, 3.6, -halfWidth + 0.06]} />
    </group>
  );
}
