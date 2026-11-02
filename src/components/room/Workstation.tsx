'use client';

import React from 'react';
import { WorkstationDesk, EamesChair } from './items';
import { PLACEMENTS, scaleToNumber } from './layout';

export function Workstation() {
  const { desk, deskChair } = PLACEMENTS;

  return (
    <group name="workstation">
      {/* 1. Mid-Century Modern Teak Desk & Ultrawide Monitor (against the back wall) */}
      <WorkstationDesk
        position={[desk.x, 0, desk.z]}
        rotation={[0, desk.yaw, 0]}
        scale={scaleToNumber(desk.scale)}
      />

      {/* 2. Eames-style Eiffel desk chair, pulled out and facing the monitor */}
      <EamesChair
        position={[deskChair.x, 0, deskChair.z]}
        rotation={[0, deskChair.yaw, 0]}
        scale={scaleToNumber(deskChair.scale)}
      />
    </group>
  );
}
