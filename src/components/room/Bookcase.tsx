'use client';

import React from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import { CubeBookcase, AcousticGuitar, WelcomeMatSneakers } from './items';
import { GUITAR_LEAN, PLACEMENTS, scaleToNumber } from './layout';

/** Local y of the guitar's lowest point (body bottom edge) at scale 1 */
const GUITAR_BOTTOM = 0.56;

export function Bookcase() {
  const { bookcase, guitar, mat } = PLACEMENTS;
  const activeStation = useRoomStore((state) => state.activeStation);
  const guitarScale = scaleToNumber(guitar.scale);

  return (
    <group name="bookcase">
      {/* 1. Main Cube Bookcase Frame & Shelves */}
      <CubeBookcase
        position={[bookcase.x, 0, bookcase.z]}
        rotation={[0, bookcase.yaw, 0]}
        scale={scaleToNumber(bookcase.scale)}
      />

      {/* 2. Dreadnought guitar standing on the floor, leaning back against the wall.
          The outer group pivots at the guitar's lowest edge so it rests on the floor. */}
      <group position={[guitar.x, 0, guitar.z]} rotation={[-GUITAR_LEAN, 0, 0]}>
        <AcousticGuitar
          isLeaning
          visible={activeStation !== 'guitar'}
          position={[0, GUITAR_BOTTOM * guitarScale, 0]}
          scale={guitarScale}
        />
      </group>

      {/* 3. "Welcome!" Rug & Classic Sneakers at the Entrance */}
      <WelcomeMatSneakers
        position={[mat.x, 0.005, mat.z]}
        scale={scaleToNumber(mat.scale)}
      />
    </group>
  );
}
