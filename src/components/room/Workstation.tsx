'use client';

import React from 'react';
import { WorkstationDesk, EamesChair } from './items';

export function Workstation() {
  const deskX = -2.1;
  const deskZ = -1.1;

  return (
    <group name="workstation">
      {/* 1. Mid-Century Modern Teak Desk & Equipment */}
      <WorkstationDesk position={[deskX, 0, deskZ]} />

      {/* 2. Eames-Style Eiffel Desk Chair */}
      <EamesChair
        position={[deskX, 0, deskZ + 0.95]}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  );
}
