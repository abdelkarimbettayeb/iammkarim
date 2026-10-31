'use client';

import React from 'react';
import * as THREE from 'three';

export function RoomStructure() {
  const floorSize = 10;
  const wallHeight = 8;
  const wallThickness = 0.4;
  const halfSize = floorSize / 2;

  // Venetian blind slats
  const blindSlats = Array.from({ length: 18 }, (_, i) => i);

  return (
    <group name="room-structure">
      {/* 1. Base Plinth & Foundation */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <boxGeometry args={[floorSize + 0.6, 0.3, floorSize + 0.6]} />
        <meshStandardMaterial color="#121316" roughness={0.8} />
      </mesh>

      {/* 2. Main Floor (Oatmeal Carpet) */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[floorSize, 0.2, floorSize]} />
        <meshStandardMaterial
          color="#F3EFE6"
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>

      {/* 3. Left Wall (Charcoal Accent Wall) */}
      <mesh
        position={[-halfSize - wallThickness / 2, wallHeight / 2 - 0.2, 0]}
        receiveShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, floorSize]} />
        <meshStandardMaterial
          color="#181A1B"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* 4. Right Wall (Clean Plaster Wall with Window) */}
      <mesh
        position={[0, wallHeight / 2 - 0.2, -halfSize - wallThickness / 2]}
        receiveShadow
      >
        <boxGeometry args={[floorSize, wallHeight, wallThickness]} />
        <meshStandardMaterial
          color="#F8F9FA"
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* 5. Wooden Skirting Boards (Baseboards) */}
      {/* Left Wall Baseboard */}
      <mesh position={[-halfSize + 0.05, 0.15, 0]}>
        <boxGeometry args={[0.1, 0.3, floorSize]} />
        <meshStandardMaterial color="#D96B27" roughness={0.6} />
      </mesh>
      {/* Right Wall Baseboard */}
      <mesh position={[0, 0.15, -halfSize + 0.05]}>
        <boxGeometry args={[floorSize, 0.3, 0.1]} />
        <meshStandardMaterial color="#D96B27" roughness={0.6} />
      </mesh>

      {/* 6. Window Frame & Venetian Blinds (Right Wall) */}
      <group position={[1.8, 4.4, -halfSize + 0.08]}>
        {/* Outer Window Frame */}
        <mesh>
          <boxGeometry args={[3.2, 4.8, 0.12]} />
          <meshStandardMaterial color="#2B2D33" roughness={0.5} />
        </mesh>

        {/* Window Glass Pane (Backing) */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[2.8, 4.4]} />
          <meshStandardMaterial
            color="#A7C7E7"
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* Venetian Blind Headrail & Valance */}
        <mesh position={[0, 2.15, 0.08]}>
          <boxGeometry args={[2.9, 0.25, 0.18]} />
          <meshStandardMaterial color="#1E2024" roughness={0.4} />
        </mesh>

        {/* Horizontal Blind Slats */}
        {blindSlats.map((i) => (
          <mesh
            key={i}
            position={[0, 1.9 - i * 0.22, 0.07]}
            rotation={[-0.35, 0, 0]}
          >
            <boxGeometry args={[2.75, 0.12, 0.02]} />
            <meshStandardMaterial color="#282B30" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

