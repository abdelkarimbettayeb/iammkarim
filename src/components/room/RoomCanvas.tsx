'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Sparkles } from '@react-three/drei';
import { RoomStructure } from './RoomStructure';
import { LightingRig } from './LightingRig';
import { CameraRig } from './CameraRig';
import { DayNightDriver } from './DayNightDriver';
import { DynamicSkyAndWeather } from './DynamicSkyAndWeather';
import { CharacterManager } from './character/CharacterManager';
import { WalkMapDebug } from './WalkMapDebug';
import { useRoomStore, roomStore } from '@/store/useRoomStore';
import type { ActiveStation } from '@/types/room';

interface RoomCanvasProps {
  children?: React.ReactNode;
}

/** True when a modal or drawer is covering the scene */
function isOverlayOpen(): boolean {
  const s = roomStore.getState();
  return s.isDrawerOpen || s.isContactOpen || s.activeCartridge !== null;
}

/** Send the boy back to rest, unless a panel is open that depends on the current station */
function releaseStation() {
  if (roomStore.getState().activeStation !== 'none' && !isOverlayOpen()) {
    roomStore.setActiveStation('none');
  }
}

export function RoomCanvas({ children }: RoomCanvasProps) {
  const isNightMode = useRoomStore((state) => state.isNightMode);

  const handleStationArrival = (station: ActiveStation) => {
    if (station === 'workstation') {
      roomStore.setActiveCartridge('alnurayn');
    } else if (station === 'couch') {
      if (!roomStore.getState().isDrawerOpen) {
        roomStore.toggleDrawer();
      }
    }
  };

  // Escape returns to the overview when nothing else is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') releaseStation();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className={`relative w-full h-screen overflow-hidden transition-colors [transition-duration:1500ms] select-none ${
        isNightMode ? 'bg-[#030712]' : 'bg-[#7DD3FC]'
      }`}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [7.8, 7.2, 8.5],
          fov: 38,
          near: 0.1,
          far: 90,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
        onPointerMissed={releaseStation}
      >
        <Suspense fallback={null}>
          {/* 0. Shared day/night blend (smooth transition between modes) */}
          <DayNightDriver />

          {/* 1. Sky dome, sun/moon, stars, clouds & weather particles */}
          <DynamicSkyAndWeather />

          {/* 2. Isometric camera with wheel / pinch zoom */}
          <CameraRig />

          {/* 3. Lighting */}
          <LightingRig />

          {/* 4. Walls, floor, foundation */}
          <RoomStructure />

          {/* 5. Soft contact shadows on the interior floor */}
          <ContactShadows
            position={[0, 0.004, 0]}
            opacity={0.4}
            scale={6.5}
            blur={2.2}
            far={2.6}
            color="#0B0D13"
          />

          {/* 6. Floating dust motes inside the room */}
          <group position={[0, 1.3, 0]}>
            <Sparkles count={28} scale={[4.6, 2.4, 4]} size={1.8} speed={0.3} opacity={0.3} color="#FDE68A" />
          </group>

          {/* 7. Autonomous character */}
          <CharacterManager onStationArrival={handleStationArrival} />

          {/* 8. Dev aid: ?debug=walkmap draws the lanes and keep-out zones */}
          <WalkMapDebug />

          {/* 9. Injected interior props & outdoors */}
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
