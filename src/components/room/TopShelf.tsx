'use client';

import React from 'react';
import { TopShelfDecor } from './items';

export function TopShelf() {
  const shelfX = -3.75;
  const shelfY = 4.9;

  return (
    <group name="top-shelf">
      <TopShelfDecor position={[shelfX, shelfY, -0.6]} />
    </group>
  );
}
