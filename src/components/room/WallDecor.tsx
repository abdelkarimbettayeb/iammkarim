'use client';

import React from 'react';
import { Text } from '@react-three/drei';
import { TournamentDartboard, WallSconce } from './items';
import { ROOM, WALL_ITEMS } from './layout';
import { personalInfo } from '@/data/resumeData';

const NAME = personalInfo.name.toUpperCase();
const ROLE = personalInfo.role.toUpperCase();

export function WallDecor() {
  const wallX = ROOM.minX;
  const { dartboard, sconce, brand } = WALL_ITEMS;

  return (
    <group name="wall-decor">
      {/* 1. Name lettering above the shelf: dark vinyl letters with a soft drop shadow so
          they read on the white wall by day and under the lamps at night */}
      <group position={[wallX + 0.004, brand.y, brand.z]} rotation={[0, Math.PI / 2, 0]}>
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
        {/* Amber rule + role underneath */}
        <mesh position={[0, -brand.fontSize * 0.78, 0.003]}>
          <planeGeometry args={[0.5, 0.012]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.4} />
        </mesh>
        <Text
          position={[0, -brand.fontSize * 1.2, 0.004]}
          fontSize={brand.fontSize * 0.36}
          letterSpacing={0.22}
          color="#B45309"
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
