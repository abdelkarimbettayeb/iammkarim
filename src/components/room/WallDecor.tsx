'use client';

import React from 'react';
import { Text } from '@react-three/drei';
import { TournamentDartboard, WallSconce } from './items';
import { ROOM, WALL_ITEMS } from './layout';
import { personalInfo } from '@/data/resumeData';
import { FoldedPrism3D } from '@/components/cv/FoldedPrism3D';

const NAME = personalInfo.name.toUpperCase();
const ROLE = personalInfo.role.toUpperCase();

export function WallDecor() {
  const wallX = ROOM.minX;
  const { dartboard, sconce, brand } = WALL_ITEMS;

  return (
    <group name="wall-decor">
      {/* 1. Sculpted Folded Prism emblem + name lettering above the shelf */}
      <group position={[wallX + 0.004, brand.y, brand.z]} rotation={[0, Math.PI / 2, 0]}>
        <FoldedPrism3D
          position={[0, 0.24, 0.002]}
          scale={0.26}
          depth={0.05}
          bevel={0.004}
          primaryColor="#111113"
          secondaryColor="#475569"
          accentColor="#E0441B"
          metalness={0.35}
          roughness={0.28}
          accentEmissive={0.22}
          castShadow
        />
        <Text
          position={[0.006, -0.008, 0.001]}
          fontSize={brand.fontSize}
          letterSpacing={0.08}
          color="#0F172A"
          fillOpacity={0.12}
          anchorX="center"
          anchorY="middle"
        >
          {NAME}
        </Text>
        <Text
          position={[0, 0, 0.004]}
          fontSize={brand.fontSize}
          letterSpacing={0.08}
          color="#1E293B"
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
        >
          {NAME}
        </Text>
        {/* Signal Vermilion rule + role underneath */}
        <mesh position={[0, -brand.fontSize * 0.78, 0.003]}>
          <planeGeometry args={[0.5, 0.012]} />
          <meshStandardMaterial color="#E0441B" roughness={0.35} />
        </mesh>
        <Text
          position={[0, -brand.fontSize * 1.2, 0.004]}
          fontSize={brand.fontSize * 0.36}
          letterSpacing={0.22}
          color="#C23714"
          anchorX="center"
          anchorY="middle"
        >
          {ROLE}
        </Text>
      </group>

      {/* 2. Wall sconce above the dartboard */}
      <WallSconce
        position={[wallX, sconce.y, sconce.z]}
        rotation={[0, Math.PI / 2, 0]}
        scale={sconce.scale}
      />

      {/* 3. Regulation-size dartboard (Ø0.45 m, bullseye at 1.73 m) */}
      <TournamentDartboard
        position={[wallX + 0.012, dartboard.y, dartboard.z]}
        rotation={[0, Math.PI / 2, 0]}
        scale={dartboard.scale}
      />
    </group>
  );
}
