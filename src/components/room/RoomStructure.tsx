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

      {/* 3. Left Wall (Deep Charcoal Accent Wall) */}
      <mesh
        position={[-halfWidth - wallThickness / 2, wallHeight / 2 - 0.08, interiorCenterZ]}
        receiveShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, interiorDepth]} />
        <meshStandardMaterial
          color="#1D1F23"
          roughness={0.88}
          metalness={0.08}
        />
      </mesh>

      {/* 4. Right Wall (Light Warm Plaster) */}
      <mesh
        position={[0, wallHeight / 2 - 0.08, -halfWidth - wallThickness / 2]}
        receiveShadow
      >
        <boxGeometry args={[floorWidth, wallHeight, wallThickness]} />
        <meshStandardMaterial
          color="#F4F4F6"
          roughness={0.8}
          metalness={0.04}
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

      {/* 6. Window Frame & Venetian Blinds */}
      <VenetianWindow position={[2.4, 3.7, -halfWidth + 0.06]} />
    </group>
  );
}
