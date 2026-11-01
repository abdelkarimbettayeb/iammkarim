'use client';

import React from 'react';
import { VintageMailbox } from './VintageMailbox';
import { MustardArmchair, CoffeeTable, PottedCactus } from './items';

export function ForegroundLounge() {
  const chairX = 0.35;
  const chairZ = 1.45;

  return (
    <group name="foreground-lounge">
      {/* 1. Vintage Mailbox (Standing near entrance) */}
      <VintageMailbox position={[-2.7, 0, 1.2]} />

      {/* 2. Mid-Century Mustard Yellow Tub Armchair */}
      <MustardArmchair
        position={[chairX, 0, chairZ]}
        rotation={[0, -Math.PI * 0.35, 0]}
      />

      {/* 3. Low Round Coffee Table (Beside chair, clearly visible in lounge) */}
      <CoffeeTable position={[-0.65, 0, 1.45]} />

      {/* 4. Floor Potted Saguaro Cactus (Beside Coffee Table) */}
      <PottedCactus position={[-1.35, 0, 1.95]} />
    </group>
  );
}
