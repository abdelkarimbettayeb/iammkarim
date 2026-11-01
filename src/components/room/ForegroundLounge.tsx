'use client';

import React from 'react';
import { MustardArmchair, CoffeeTable, PottedCactus } from './items';

export function ForegroundLounge() {
  const chairX = 0.25;
  const chairZ = 0.75;

  return (
    <group name="foreground-lounge">
      {/* 1. Mid-Century Mustard Yellow Tub Armchair */}
      <MustardArmchair
        position={[chairX, 0, chairZ]}
        rotation={[0, -Math.PI * 0.35, 0]}
      />

      {/* 2. Low Round Coffee Table */}
      <CoffeeTable position={[-0.7, 0, 0.75]} />

      {/* 3. Floor Potted Saguaro Cactus */}
      <PottedCactus position={[-1.4, 0, 1.1]} />
    </group>
  );
}
