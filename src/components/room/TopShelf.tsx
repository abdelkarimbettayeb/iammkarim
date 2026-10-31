'use client';

import React from 'react';
import { languages } from '@/data/resumeData';
import { WavingFlag } from './WavingFlag';

export function TopShelf() {
  // Mounted on the dark charcoal left wall (X = -4.0) at comfortable mid-wall height
  const shelfX = -3.75;
  const shelfY = 4.9;

  // Frond angles for the cascading lush fern
  const leafAngles = [
    { rotZ: 0.45, rotY: 0, scale: 1.1 },
    { rotZ: -0.45, rotY: Math.PI / 3, scale: 1.0 },
    { rotZ: 0.55, rotY: (Math.PI * 2) / 3, scale: 1.2 },
    { rotZ: -0.55, rotY: Math.PI, scale: 1.05 },
    { rotZ: 0.4, rotY: (Math.PI * 4) / 3, scale: 1.15 },
    { rotZ: -0.42, rotY: (Math.PI * 5) / 3, scale: 0.95 },
    { rotZ: 0.25, rotY: Math.PI / 4, scale: 1.25 },
    { rotZ: -0.25, rotY: (Math.PI * 3) / 4, scale: 1.1 },
  ];

  return (
    <group name="top-shelf">
      {/* 1. Teak Floating Shelf Plank */}
      <mesh position={[shelfX, shelfY, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.08, 4.4]} />
        <meshStandardMaterial color="#CF6B2C" roughness={0.52} />
      </mesh>

      {/* 2. Metal Shelf Support Brackets */}
      {[-2.2, 1.0].map((zPos, idx) => (
        <group key={idx} position={[shelfX - 0.12, shelfY - 0.18, zPos]}>
          {/* Vertical leg against wall */}
          <mesh position={[-0.1, 0, 0]}>
            <boxGeometry args={[0.035, 0.35, 0.05]} />
            <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Horizontal leg supporting shelf */}
          <mesh position={[0.08, 0.14, 0]}>
            <boxGeometry args={[0.32, 0.035, 0.05]} />
            <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 3. Spoken Language Flags (Positioned on the left side of the shelf) */}
      {languages.map((flag, idx) => {
        const zOffset = -2.2 + idx * 0.55;
        return (
          <WavingFlag
            key={flag.name}
            flag={flag}
            position={[shelfX + 0.04, shelfY + 0.04, zOffset]}
          />
        );
      })}

      {/* 4. Framed Portrait Photo (Angled on shelf against wall) */}
      <group position={[shelfX + 0.02, shelfY + 0.42, -0.5]} rotation={[0, 0.2, -0.06]}>
        {/* Wooden Frame */}
        <mesh castShadow>
          <boxGeometry args={[0.05, 0.76, 0.58]} />
          <meshStandardMaterial color="#2B2019" roughness={0.6} />
        </mesh>
        {/* Photo Canvas Mat */}
        <mesh position={[0.028, 0, 0]}>
          <planeGeometry args={[0.48, 0.66]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} />
        </mesh>
        {/* Stylized Avatar Silhouette */}
        <mesh position={[0.032, 0.07, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.3} />
        </mesh>
        <mesh position={[0.032, -0.15, 0]}>
          <cylinderGeometry args={[0.11, 0.18, 0.22, 16]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.4} />
        </mesh>
      </group>

      {/* 5. Ceramic Potted Fern (Lush Green Cascading Foliage on Right) */}
      <group position={[shelfX + 0.04, shelfY + 0.04, 0.7]}>
        {/* White Ceramic Pot with Charcoal Band */}
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.19, 0.14, 0.32, 20]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.192, 0.192, 0.07, 20]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} />
        </mesh>
        {/* Rich Dark Soil */}
        <mesh position={[0, 0.31, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.025, 16]} />
          <meshStandardMaterial color="#382419" roughness={0.9} />
        </mesh>

        {/* Botanical Fern Fronds */}
        {leafAngles.map((leaf, idx) => (
          <group
            key={idx}
            position={[0, 0.32, 0]}
            rotation={[0, leaf.rotY, leaf.rotZ]}
            scale={leaf.scale}
          >
            <mesh position={[0.26, 0.1, 0]} rotation={[0, 0, -0.32]} castShadow>
              <boxGeometry args={[0.48, 0.018, 0.12]} />
              <meshStandardMaterial
                color={idx % 2 === 0 ? '#22C55E' : '#15803D'}
                roughness={0.5}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
