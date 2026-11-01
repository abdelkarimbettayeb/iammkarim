'use client';

import React from 'react';
import { VenetianWindow } from './items';

export function RoomStructure() {
  const floorSize = 8.0;
  const wallHeight = 6.6;
  const wallThickness = 0.35;
  const halfSize = floorSize / 2;

  return (
    <group name="room-structure">
      {/* 1. Base Plinth & Foundation */}
      <mesh position={[0, -0.28, 0]} receiveShadow>
        <boxGeometry args={[floorSize + 0.5, 0.25, floorSize + 0.5]} />
        <meshStandardMaterial color="#141619" roughness={0.85} />
      </mesh>

      {/* 2. Main Floor (Warm Oatmeal Carpet matching reference) */}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[floorSize, 0.16, floorSize]} />
        <meshStandardMaterial
          color="#EAE5DC"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {/* 3. Left Wall (Clean Gallery White Plaster) */}
      <mesh
        position={[-halfSize - wallThickness / 2, wallHeight / 2 - 0.08, 0]}
        receiveShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, floorSize]} />
        <meshStandardMaterial
          color="#F4F4F6"
          roughness={0.88}
          metalness={0.08}
        />
      </mesh>

      {/* 4. Right Wall (Light Warm Plaster) */}
      <mesh
        position={[0, wallHeight / 2 - 0.08, -halfSize - wallThickness / 2]}
        receiveShadow
      >
        <boxGeometry args={[floorSize, wallHeight, wallThickness]} />
        <meshStandardMaterial
          color="#F4F4F6"
          roughness={0.8}
          metalness={0.04}
        />
      </mesh>

      {/* 5. Minimal Sleek Skirting Boards (Off-white / cream trim) */}
      <mesh position={[-halfSize + 0.03, 0.08, 0]}>
        <boxGeometry args={[0.05, 0.16, floorSize]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.08, -halfSize + 0.03]}>
        <boxGeometry args={[floorSize, 0.16, 0.05]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
      </mesh>

      {/* 6. Window Frame & Venetian Blinds */}
      <VenetianWindow position={[2.4, 3.7, -halfSize + 0.06]} />
    </group>
  );
}
