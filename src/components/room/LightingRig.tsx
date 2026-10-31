'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';

export function LightingRig() {
  const isNightMode = useRoomStore((state) => state.isNightMode);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <group name="lighting-rig">
      {/* 1. Ambient Lighting */}
      <ambientLight
        color={isNightMode ? '#1E293B' : '#FFF9F0'}
        intensity={isNightMode ? 0.45 : 1.35}
      />

      {/* 2. Primary Sunlight (Streaming through window on the right) */}
      <directionalLight
        ref={dirLightRef}
        position={isNightMode ? [4, 6, -3] : [7, 10, -4]}
        intensity={isNightMode ? 0.3 : 2.2}
        color={isNightMode ? '#64748B' : '#FFF5E4'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0005}
      />

      {/* 3. Soft Fill Light (Open Front View) */}
      <directionalLight
        position={[6, 8, 8]}
        intensity={isNightMode ? 0.2 : 0.65}
        color={isNightMode ? '#38BDF8' : '#F1F5F9'}
      />

      {/* 4. Desk Lamp Spot / Atmosphere (Enhanced in Night Mode) */}
      <pointLight
        position={[-1.5, 3.8, -2]}
        intensity={isNightMode ? 2.8 : 0.8}
        color="#F59E0B"
        distance={9}
        decay={2}
      />

      {/* 5. Cyberpunk Rim Light in Night Mode */}
      {isNightMode && (
        <>
          <pointLight
            position={[-4.5, 5, 2]}
            intensity={1.6}
            color="#38BDF8"
            distance={8}
          />
          <pointLight
            position={[3, 2, -4]}
            intensity={1.2}
            color="#A855F7"
            distance={7}
          />
        </>
      )}
    </group>
  );
}

