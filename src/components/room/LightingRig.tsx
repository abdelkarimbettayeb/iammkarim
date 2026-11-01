'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';

export function LightingRig() {
  const isNightMode = useRoomStore((state) => state.isNightMode);
  const weatherState = useRoomStore((state) => state.weatherState);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  // Modulate sun intensity when cloudy / raining
  const sunIntensity = isNightMode
    ? 0.35
    : weatherState === 'rain'
    ? 0.75
    : weatherState === 'snow'
    ? 0.95
    : 1.35;

  return (
    <group name="lighting-rig">
      {/* 1. Ambient Warm Diffused Fill (Softens harsh contrast without bleaching) */}
      <ambientLight
        color={isNightMode ? '#1E293B' : '#FFFBEB'}
        intensity={isNightMode ? 0.35 : 0.72}
      />

      {/* 2. Primary Sunlight with Expanded Frustum */}
      <directionalLight
        ref={dirLightRef}
        position={isNightMode ? [6.5, 9, -5.5] : [12.5, 16.0, -8.5]}
        intensity={sunIntensity}
        color={isNightMode ? '#64748B' : '#FFFDF5'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0003}
      />

      {/* 3. Soft Front-Left Bounce / Sky Light */}
      <directionalLight
        position={[6.5, 9, 8.5]}
        intensity={isNightMode ? 0.25 : 0.65}
        color={isNightMode ? '#38BDF8' : '#E0F2FE'}
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
