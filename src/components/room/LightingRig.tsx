'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';

export function LightingRig() {
  const isNightMode = useRoomStore((state) => state.isNightMode);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <group name="lighting-rig">
      {/* 1. Ambient Warm Diffused Fill (Softens harsh contrast) */}
      <ambientLight
        color={isNightMode ? '#1E293B' : '#FFF7ED'}
        intensity={isNightMode ? 0.45 : 1.55}
      />

      {/* 2. Primary Sunlight (Streaming through the window on the right wall) */}
      <directionalLight
        ref={dirLightRef}
        position={isNightMode ? [3.5, 5, -2.5] : [5.2, 7.5, -4.2]}
        intensity={isNightMode ? 0.3 : 1.85}
        color={isNightMode ? '#64748B' : '#FFF6EA'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-5.5}
        shadow-camera-right={5.5}
        shadow-camera-top={5.5}
        shadow-camera-bottom={-5.5}
        shadow-bias={-0.0004}
      />

      {/* 3. Soft Front-Left Bounce / Fill Light */}
      <directionalLight
        position={[4.5, 6, 5.5]}
        intensity={isNightMode ? 0.2 : 0.75}
        color={isNightMode ? '#38BDF8' : '#FAF8F5'}
      />

      {/* 4. Desk Lamp Spot / Atmosphere (Enhanced in Night Mode) */}
      <pointLight
        position={[-2.1, 3.2, -1.1]}
        intensity={isNightMode ? 2.6 : 0.7}
        color="#F59E0B"
        distance={7.5}
        decay={2}
      />

      {/* 5. Cyberpunk Rim Light in Night Mode */}
      {isNightMode && (
        <>
          <pointLight
            position={[-3.8, 4.2, 1.8]}
            intensity={1.5}
            color="#38BDF8"
            distance={7}
          />
          <pointLight
            position={[2.4, 2, -3.2]}
            intensity={1.1}
            color="#A855F7"
            distance={6}
          />
        </>
      )}
    </group>
  );
}
