'use client';

import React from 'react';
import { TopShelfDecor } from './items';
import { ROOM, WALL_ITEMS } from './layout';

/** Half of the shelf board depth at scale 1 (board is 0.55 deep) */
const SHELF_HALF_DEPTH = 0.275;

export function TopShelf() {
  const { shelf } = WALL_ITEMS;

  return (
    <group name="top-shelf">
      <TopShelfDecor
        position={[ROOM.minX + SHELF_HALF_DEPTH * shelf.scale, shelf.y, shelf.z]}
        scale={shelf.scale}
      />
    </group>
  );
}
