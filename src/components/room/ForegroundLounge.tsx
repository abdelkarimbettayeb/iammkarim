'use client';

import React from 'react';
import { MustardArmchair, CoffeeTable, PottedCactus } from './items';
import { PLACEMENTS, scaleToNumber } from './layout';

export function ForegroundLounge() {
  const { armchair, coffeeTable, cactus } = PLACEMENTS;

  return (
    <group name="foreground-lounge">
      {/* 1. Mid-Century Mustard Yellow Tub Armchair, turned towards the table */}
      <MustardArmchair
        position={[armchair.x, 0, armchair.z]}
        rotation={[0, armchair.yaw, 0]}
        scale={scaleToNumber(armchair.scale)}
      />

      {/* 2. Low Round Coffee Table (0.3 m clear of the armchair) */}
      <CoffeeTable
        position={[coffeeTable.x, 0, coffeeTable.z]}
        scale={coffeeTable.scale as [number, number, number]}
      />

      {/* 3. Floor Potted Saguaro Cactus in the front-left corner */}
      <PottedCactus position={[cactus.x, 0, cactus.z]} scale={scaleToNumber(cactus.scale)} />
    </group>
  );
}
