'use client';

import React from 'react';
import { Text } from '@react-three/drei';
import { TournamentDartboard, WallSconce } from './items';

export function WallDecor() {
  const wallX = -3.94;

  return (
    <group name="wall-decor">
      {/* 1. 3D Wall Branding ("BETTAYEB") */}
      <group position={[wallX, 3.85, -1.05]} rotation={[0, Math.PI / 2, 0]}>
        {/* Soft Drop Shadow Plate */}
        <mesh position={[0, -0.015, -0.015]}>
          <planeGeometry args={[2.8, 0.6]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} />
        </mesh>

        {/* Primary 3D Extruded Lettering */}
        <Text
          position={[0, 0, 0.035]}
          fontSize={0.46}
          letterSpacing={0.14}
          color="#F1F5F9"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.018}
          outlineColor="#64748B"
        >
          BETTAYEB
        </Text>
      </group>

      {/* 2. Curved Wall Sconce & Pendant Globe */}
      <WallSconce
        position={[wallX, 4.35, -2.6]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* 3. High-Contrast Interactive Dartboard */}
      <TournamentDartboard
        position={[wallX + 0.025, 2.9, -2.6]}
        rotation={[0, Math.PI / 2, 0]}
      />
    </group>
  );
}
