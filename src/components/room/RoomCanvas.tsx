'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Sparkles } from '@react-three/drei';
import { RoomStructure } from './RoomStructure';
import { LightingRig } from './LightingRig';
import { CameraRig } from './CameraRig';
import { useRoomStore } from '@/store/useRoomStore';

interface RoomCanvasProps {
  children?: React.ReactNode;
}

export function RoomCanvas({ children }: RoomCanvasProps) {
  const isNightMode = useRoomStore((state) => state.isNightMode);

  return (
    <div
      className={`relative w-full h-screen overflow-hidden transition-colors duration-700 select-none ${
        isNightMode ? 'bg-[#0B0F19]' : 'bg-[#121418]'
      }`}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [8.5, 7.2, 8.5],
          fov: 38,
          near: 0.1,
          far: 50,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          {/* 1. Camera & Navigation Controls */}
          <CameraRig />

          {/* 2. Room Lighting Rig */}
          <LightingRig />

          {/* 3. Base Architecture & Cutaway Walls */}
          <RoomStructure />

          {/* 4. Floor Soft Contact Shadows */}
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.55}
            scale={10.5}
            blur={2.2}
            far={3.5}
            color="#0B0D13"
          />

          {/* 5. Ambient Floating Dust Motes / Sparkles */}
          <Sparkles
            count={36}
            scale={[8, 6.5, 8]}
            size={2.5}
            speed={0.3}
            opacity={0.35}
            color={isNightMode ? '#38BDF8' : '#FDE68A'}
          />

          {/* 6. Injected Interior Props & Shelving */}
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
