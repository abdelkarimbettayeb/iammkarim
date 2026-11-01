'use client';

import React from 'react';

export function RoomStructure() {
  const floorSize = 8.0;
  const wallHeight = 6.6;
  const wallThickness = 0.35;
  const halfSize = floorSize / 2;

  // Venetian blind slats
  const blindSlats = Array.from({ length: 16 }, (_, i) => i);

  return (
    <group name="room-structure">
      {/* 1. Base Plinth & Foundation (Clean dark contrast base) */}
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

      {/* 3. Left Wall (Deep Charcoal Accent Wall) */}
      <mesh
        position={[-halfSize - wallThickness / 2, wallHeight / 2 - 0.08, 0]}
        receiveShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, floorSize]} />
        <meshStandardMaterial
          color="#1D1F23"
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

      {/* 5. Minimal Sleek Skirting Boards (Off-white / cream trim, NOT orange beams) */}
      {/* Left Wall Skirting */}
      <mesh position={[-halfSize + 0.03, 0.08, 0]}>
        <boxGeometry args={[0.05, 0.16, floorSize]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
      </mesh>
      {/* Right Wall Skirting */}
      <mesh position={[0, 0.08, -halfSize + 0.03]}>
        <boxGeometry args={[floorSize, 0.16, 0.05]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
      </mesh>

      {/* 6. Window Frame & Venetian Blinds (Right Wall, to the right of the bookcase) */}
      <group position={[2.4, 3.7, -halfSize + 0.06]}>
        {/* Outer Window Frame */}
        <mesh>
          <boxGeometry args={[2.2, 3.8, 0.1]} />
          <meshStandardMaterial color="#222429" roughness={0.4} />
        </mesh>

        {/* Window Glass Pane (Backing) */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[1.9, 3.5]} />
          <meshStandardMaterial
            color="#8DB4D8"
            roughness={0.15}
            metalness={0.7}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Venetian Blind Headrail & Valance Box */}
        <mesh position={[0, 1.72, 0.07]}>
          <boxGeometry args={[2.0, 0.22, 0.14]} />
          <meshStandardMaterial color="#1E2024" roughness={0.4} />
        </mesh>

        {/* Horizontal Blind Slats */}
        {blindSlats.map((i) => (
          <mesh
            key={i}
            position={[0, 1.5 - i * 0.2, 0.06]}
            rotation={[-0.32, 0, 0]}
          >
            <boxGeometry args={[1.92, 0.11, 0.018]} />
            <meshStandardMaterial color="#282A2F" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
