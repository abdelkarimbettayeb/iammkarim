'use client';

import React from 'react';
import { Text } from '@react-three/drei';
import { TournamentDartboard, WallSconce } from './items';
import { ROOM, WALL_ITEMS } from './layout';

export function WallDecor() {
  const wallX = ROOM.minX;
  const { dartboard, sconce, brand } = WALL_ITEMS;

  return (
    <group name="wall-decor">
      {/* 1. Wall lettering ("BETTAYEB") above the shelf */}
      <group position={[wallX, brand.y, brand.z]} rotation={[0, Math.PI / 2, 0]}>
        <Text
          position={[0, 0, 0.005]}
          fontSize={brand.fontSize}
          letterSpacing={0.14}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.006}
          outlineColor="#94A3B8"
        >
          BETTAYEB
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
