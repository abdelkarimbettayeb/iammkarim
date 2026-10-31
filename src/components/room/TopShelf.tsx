'use client';

import React from 'react';
import { languages } from '@/data/resumeData';
import { WavingFlag } from './WavingFlag';

export function TopShelf() {
  const shelfX = -4.65;
  const shelfY = 6.2;

  // Frond angles for the potted fern
  const leafAngles = [
    { rotZ: 0.4, rotY: 0, scale: 1 },
    { rotZ: -0.4, rotY: Math.PI / 3, scale: 0.9 },
    { rotZ: 0.5, rotY: (Math.PI * 2) / 3, scale: 1.1 },
    { rotZ: -0.5, rotY: Math.PI, scale: 0.95 },
    { rotZ: 0.35, rotY: (Math.PI * 4) / 3, scale: 1.05 },
    { rotZ: -0.38, rotY: (Math.PI * 5) / 3, scale: 0.85 },
    { rotZ: 0.2, rotY: Math.PI / 4, scale: 1.15 },
  ];

  return (
    <group name="top-shelf">
      {/* 1. Teak Floating Shelf Plank */}
      <mesh position={[shelfX, shelfY, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.1, 5.6]} />
        <meshStandardMaterial color="#D96B27" roughness={0.55} />
      </mesh>

      {/* 2. Metal Shelf Support Brackets */}
      {[-1.8, 2.6].map((zPos, idx) => (
        <group key={idx} position={[shelfX - 0.15, shelfY - 0.22, zPos]}>
          {/* Vertical leg against wall */}
          <mesh position={[-0.12, 0, 0]}>
            <boxGeometry args={[0.04, 0.4, 0.06]} />
            <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Horizontal leg supporting shelf */}
          <mesh position={[0.1, 0.16, 0]}>
            <boxGeometry args={[0.4, 0.04, 0.06]} />
            <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 3. Spoken Language Flags */}
      {languages.map((flag, idx) => {
        // Space flags along Z axis
        const zOffset = -1.8 + idx * 0.62;
        return (
          <WavingFlag
            key={flag.name}
            flag={flag}
            position={[shelfX + 0.05, shelfY + 0.05, zOffset]}
          />
        );
      })}

      {/* 4. Framed Portrait Photo (Angled on shelf) */}
      <group position={[shelfX + 0.02, shelfY + 0.48, 0.45]} rotation={[0, 0.25, -0.06]}>
        {/* Wooden Frame */}
        <mesh castShadow>
          <boxGeometry args={[0.06, 0.82, 0.65]} />
          <meshStandardMaterial color="#2B2019" roughness={0.6} />
        </mesh>
        {/* Photo Canvas Mat */}
        <mesh position={[0.035, 0, 0]}>
          <planeGeometry args={[0.55, 0.72]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} />
        </mesh>
        {/* Stylized Avatar Silhouette */}
        <mesh position={[0.038, 0.08, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.3} />
        </mesh>
        <mesh position={[0.038, -0.16, 0]}>
          <cylinderGeometry args={[0.12, 0.2, 0.24, 16]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.4} />
        </mesh>
      </group>

      {/* 5. Ceramic Potted Plant with Cascading Leaves */}
      <group position={[shelfX + 0.05, shelfY + 0.05, 1.8]}>
        {/* White Ceramic Pot with Charcoal Band */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.16, 0.36, 20]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.222, 0.222, 0.08, 20]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} />
        </mesh>
        {/* Soil */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.03, 16]} />
          <meshStandardMaterial color="#382419" roughness={0.9} />
        </mesh>

        {/* Botanical Fronds */}
        {leafAngles.map((leaf, idx) => (
          <group
            key={idx}
            position={[0, 0.36, 0]}
            rotation={[0, leaf.rotY, leaf.rotZ]}
            scale={leaf.scale}
          >
            <mesh position={[0.25, 0.1, 0]} rotation={[0, 0, -0.3]} castShadow>
              <boxGeometry args={[0.45, 0.02, 0.12]} />
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

