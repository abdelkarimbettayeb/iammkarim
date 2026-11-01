'use client';

import React from 'react';
import { VintageMailbox } from './VintageMailbox';

interface OutdoorPathwayProps {
  position?: [number, number, number];
}

/**
 * Procedural flagstone / cobblestone paver pattern
 * Leading from the outdoor garden curb (Z = 4.7, X = 1.65)
 * curving gently to the interior doorway threshold (Z = 1.6, X = 1.4).
 */
const PAVERS = [
  // Curb entrance stone
  { x: 1.65, z: 4.65, w: 1.15, l: 0.44, rot: 0.04, color: '#64748B' },
  { x: 1.6, z: 4.18, w: 1.08, l: 0.42, rot: -0.02, color: '#94A3B8' },
  { x: 1.54, z: 3.7, w: 1.12, l: 0.45, rot: 0.03, color: '#475569' },
  { x: 1.48, z: 3.22, w: 1.05, l: 0.42, rot: -0.01, color: '#78716C' },
  { x: 1.44, z: 2.74, w: 1.1, l: 0.44, rot: 0.02, color: '#94A3B8' },
  { x: 1.41, z: 2.26, w: 1.06, l: 0.42, rot: -0.02, color: '#64748B' },
  { x: 1.4, z: 1.8, w: 1.14, l: 0.4, rot: 0.01, color: '#CBD5E1' },
];

/**
 * Clustered natural grass tufts across the garden lawn
 */
const GRASS_TUFTS = [
  { x: -3.4, z: 2.2, scale: 0.95, rot: 0.3 },
  { x: -2.8, z: 3.1, scale: 1.1, rot: -0.2 },
  { x: -2.1, z: 2.4, scale: 0.85, rot: 0.5 },
  { x: -1.4, z: 3.8, scale: 1.0, rot: -0.4 },
  { x: -0.6, z: 2.6, scale: 0.9, rot: 0.2 },
  { x: 0.4, z: 3.6, scale: 1.05, rot: -0.1 },
  { x: 0.5, z: 2.2, scale: 0.8, rot: 0.4 },
  { x: 0.6, z: 4.4, scale: 0.9, rot: -0.3 },
  { x: 2.7, z: 4.3, scale: 1.05, rot: 0.2 },
  { x: 3.3, z: 2.3, scale: 0.85, rot: -0.5 },
  { x: 3.5, z: 3.5, scale: 1.15, rot: 0.4 },
  { x: 3.2, z: 4.4, scale: 0.9, rot: -0.2 },
];

/**
 * Smooth river pebbles along the pathway edges
 */
const PEBBLES = [
  [0.82, -0.01, 3.4],
  [0.78, -0.01, 3.9],
  [0.85, -0.01, 4.4],
  [2.15, -0.01, 2.5],
  [2.18, -0.01, 3.1],
  [2.22, -0.01, 4.2],
  [0.76, -0.01, 2.8],
  [0.74, -0.01, 2.1],
];

export function OutdoorPathway({ position = [0, 0, 0] }: OutdoorPathwayProps) {
  return (
    <group name="outdoor-pathway" position={position}>
      {/* ========================================================
          1. OUTSIDE GRASS FIELD / LAWN (Spans front of diorama)
          ======================================================== */}
      {/* Main Outdoor Grass Turf (from Z = 1.6 to Z = 4.8, width 8.0, depth 3.2) */}
      <mesh position={[0, -0.06, 3.2]} receiveShadow>
        <boxGeometry args={[8.0, 0.12, 3.2]} />
        <meshStandardMaterial
          color="#2D6A28"
          roughness={0.88}
          metalness={0.02}
        />
      </mesh>

      {/* Sub-base Soil Foundation */}
      <mesh position={[0, -0.18, 3.2]} receiveShadow>
        <boxGeometry args={[8.15, 0.12, 3.25]} />
        <meshStandardMaterial color="#1C1917" roughness={0.96} />
      </mesh>

      {/* ========================================================
          2. ARCHITECTURAL DOORWAY THRESHOLD AT Z = 1.6
          ======================================================== */}
      {/* Dark Slate Threshold Curb spanning the front of the room */}
      <mesh position={[0, 0.01, 1.6]} receiveShadow castShadow>
        <boxGeometry args={[8.0, 0.06, 0.12]} />
        <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Polished Brass Inset Weatherstrip Trim at the Doorway */}
      <mesh position={[1.4, 0.042, 1.6]}>
        <boxGeometry args={[1.35, 0.01, 0.03]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.92} roughness={0.15} />
      </mesh>

      {/* ========================================================
          3. SMALL PAVED ROAD / STONE WALKWAY LEADING INSIDE
          ======================================================== */}
      {/* Pathway Mortar / Gravel Sub-bed */}
      <mesh position={[1.5, -0.03, 3.2]} receiveShadow>
        <boxGeometry args={[1.25, 0.04, 3.1]} />
        <meshStandardMaterial color="#57534E" roughness={0.94} />
      </mesh>

      {/* Handcrafted Flagstone Pavers */}
      {PAVERS.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, 0.015, p.z]}
          rotation={[0, p.rot, 0]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[p.w, 0.035, p.l]} />
          <meshStandardMaterial
            color={p.color}
            roughness={0.8}
            metalness={0.06}
          />
        </mesh>
      ))}

      {/* ========================================================
          4. SCULPTED LOW-POLY GRASS TUFTS ON LAWN
          ======================================================== */}
      {GRASS_TUFTS.map((g, i) => (
        <group key={i} position={[g.x, 0.0, g.z]} rotation={[0, g.rot, 0]} scale={g.scale}>
          <mesh position={[-0.03, 0.08, 0]} rotation={[0, 0, 0.22]} castShadow>
            <coneGeometry args={[0.02, 0.16, 4]} />
            <meshStandardMaterial color="#4ADE80" roughness={0.7} />
          </mesh>
          <mesh position={[0.03, 0.09, 0]} rotation={[0, 0, -0.24]} castShadow>
            <coneGeometry args={[0.022, 0.18, 4]} />
            <meshStandardMaterial color="#22C55E" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0.02]} rotation={[0.2, 0, 0]} castShadow>
            <coneGeometry args={[0.018, 0.2, 4]} />
            <meshStandardMaterial color="#16A34A" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Smooth Garden River Pebbles along the walkway border */}
      {PEBBLES.map(([px, py, pz], i) => (
        <mesh key={i} position={[px, 0.01, pz]} castShadow receiveShadow>
          <sphereGeometry args={[0.038, 8, 8]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.65} />
        </mesh>
      ))}

      {/* ========================================================
          5. LOW-POLY GARDEN BUSHES / SHRUBS (Corner Landscaping)
          ======================================================== */}
      <group position={[-3.1, 0.0, 2.7]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <dodecahedronGeometry args={[0.26, 1]} />
          <meshStandardMaterial color="#15803D" roughness={0.8} />
        </mesh>
        <mesh position={[0.18, 0.12, 0.14]} castShadow>
          <dodecahedronGeometry args={[0.18, 1]} />
          <meshStandardMaterial color="#16A34A" roughness={0.8} />
        </mesh>
        {/* Little White Blossom Petals */}
        <mesh position={[0.06, 0.32, 0.08]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
        <mesh position={[-0.14, 0.24, 0.12]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#FEF08A" roughness={0.4} />
        </mesh>
      </group>

      {/* ========================================================
          6. VINTAGE MAILBOX (OUTSIDE ON THE GRASS LAWN)
          ======================================================== */}
      {/* Mounted on the outside lawn beside the paved stone path */}
      <VintageMailbox
        position={[2.45, 0.0, 3.4]}
        rotation={[0, -Math.PI * 0.25, 0]}
      />

      {/* ========================================================
          7. MODERN SOLAR GARDEN STAKE LIGHT
          ======================================================== */}
      <group position={[0.85, 0.0, 2.6]}>
        {/* Stake Pole */}
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.32, 12]} />
          <meshStandardMaterial color="#1E2024" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Lamp Hood */}
        <mesh position={[0, 0.34, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.035, 0.06, 16]} />
          <meshStandardMaterial color="#1E2024" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Illuminated Glass Lens */}
        <mesh position={[0, 0.29, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.04, 16]} />
          <meshStandardMaterial
            color="#FEF3C7"
            emissive="#FDE68A"
            emissiveIntensity={0.85}
            roughness={0.2}
          />
        </mesh>
        {/* Solar Panel Cap */}
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.015, 16]} />
          <meshStandardMaterial color="#0F172A" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Warm Ambient Lawn Light */}
        <pointLight position={[0, 0.28, 0]} color="#FEF3C7" intensity={0.5} distance={2.5} />
      </group>
    </group>
  );
}
