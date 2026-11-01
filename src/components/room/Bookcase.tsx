'use client';

import React from 'react';
import {
  CubeBookcase,
  AcousticGuitar,
  TennisRacket,
  WelcomeMatSneakers,
} from './items';

export function Bookcase() {
  const caseX = 0.5;
  const caseZ = -3.58;

  return (
    <group name="bookcase">
      {/* 1. Main Cube Bookcase Frame & Shelves */}
      <CubeBookcase position={[caseX, 0, caseZ]} />

      {/* 2. Dreadnought Acoustic Guitar Leaning Against Right Side */}
      <AcousticGuitar
        isLeaning
        position={[caseX + 1.42, 1.25, caseZ + 0.32]}
      />

      {/* 3. Tennis Racket & Neon Ball Under Window */}
      <TennisRacket
        isLeaning
        position={[caseX + 2.1, 0, caseZ + 0.5]}
      />

      {/* 4. "Welcome!" Rug & Classic Sneakers at Entrance */}
      <WelcomeMatSneakers position={[1.4, 0.01, 1.25]} />
    </group>
  );
}
