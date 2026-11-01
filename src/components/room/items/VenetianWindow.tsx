'use client';

import React from 'react';

interface VenetianWindowProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function VenetianWindow({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: VenetianWindowProps) {
  const slatCount = 28;
  const blindSlats = Array.from({ length: slatCount }, (_, i) => i);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* =========================================
          1. Architectural Window Frame & Sill
         ========================================= */}
      {/* Top Outer Lintel */}
      <mesh position={[0, 1.88, 0]} castShadow>
        <boxGeometry args={[2.08, 0.12, 0.16]} />
        <meshStandardMaterial color="#1E293B" roughness={0.35} />
      </mesh>
      {/* Bottom Window Sill (Extending slightly outward) */}
      <mesh position={[0, -1.88, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[2.16, 0.12, 0.24]} />
        <meshStandardMaterial color="#1E293B" roughness={0.35} />
      </mesh>
      {/* Left Outer Jamb */}
      <mesh position={[-1.0, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 3.64, 0.16]} />
        <meshStandardMaterial color="#1E293B" roughness={0.35} />
      </mesh>
      {/* Right Outer Jamb */}
      <mesh position={[1.0, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 3.64, 0.16]} />
        <meshStandardMaterial color="#1E293B" roughness={0.35} />
      </mesh>

      {/* Recessed Glass Pane (Reflecting subtle sky daylight) */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[1.92, 3.64]} />
        <meshStandardMaterial
          color="#94A3B8"
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* =========================================
          2. Venetian Blinds Mechanism (Valance & Strings)
         ========================================= */}
      {/* Top Valance Cassette Box */}
      <mesh position={[0, 1.76, 0.06]} castShadow>
        <boxGeometry args={[1.92, 0.12, 0.1]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} />
      </mesh>

      {/* Bottom Heavy Weight Bar */}
      <mesh position={[0, -1.74, 0.05]} castShadow>
        <boxGeometry args={[1.9, 0.06, 0.06]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} />
      </mesh>

      {/* Vertical Ladder Guide Cords (Left & Right) */}
      {[-0.6, 0.6].map((xCord, idx) => (
        <mesh key={idx} position={[xCord, 0, 0.05]}>
          <cylinderGeometry args={[0.003, 0.003, 3.48, 8]} />
          <meshBasicMaterial color="#64748B" />
        </mesh>
      ))}

      {/* =========================================
          3. 28 Angled Horizontal Slats
         ========================================= */}
      {blindSlats.map((i) => {
        const yPos = 1.66 - (i / (slatCount - 1)) * 3.32;
        return (
          <mesh
            key={i}
            position={[0, yPos, 0.05]}
            rotation={[-0.38, 0, 0]}
            castShadow
          >
            <boxGeometry args={[1.9, 0.085, 0.008]} />
            <meshStandardMaterial color="#1E293B" roughness={0.55} />
          </mesh>
        );
      })}
    </group>
  );
}
