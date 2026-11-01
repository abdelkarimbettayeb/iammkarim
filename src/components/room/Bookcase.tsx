'use client';

import React from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import {
  CubeBookcase,
  AcousticGuitar,
  WelcomeMatSneakers,
} from './items';

export function Bookcase() {
  const caseX = 0.5;
  const caseZ = -3.58;
  const activeStation = useRoomStore((state) => state.activeStation);

  return (
    <group name="bookcase">
      {/* 1. Main Cube Bookcase Frame & Shelves */}
      <CubeBookcase position={[caseX, 0, caseZ]} />

      {/* 2. Dreadnought Acoustic Guitar Leaning Against Right Side */}
      <AcousticGuitar
        isLeaning
        visible={activeStation !== 'guitar'}
        position={[caseX + 1.42, 1.25, caseZ + 0.32]}
      />

      {/* 3. "Welcome!" Rug & Classic Sneakers at Entrance */}
      <WelcomeMatSneakers position={[1.4, 0.01, 1.25]} />
    </group>
  );
}
