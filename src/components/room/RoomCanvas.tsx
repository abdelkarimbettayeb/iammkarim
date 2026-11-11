'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, PerformanceMonitor } from '@react-three/drei';
import { RoomStructure } from './RoomStructure';
import { LightingRig } from './LightingRig';
import { CameraRig } from './CameraRig';
import { DayNightDriver } from './DayNightDriver';
import { DynamicSkyAndWeather } from './DynamicSkyAndWeather';
import { CharacterManager } from './character/CharacterManager';
import { WalkMapDebug } from './WalkMapDebug';
import { TopShelf } from './TopShelf';
import { WallDecor } from './WallDecor';
import { Bookcase } from './Bookcase';
import { Workstation } from './Workstation';
import { ForegroundLounge } from './ForegroundLounge';
import { OutdoorPathway } from './OutdoorPathway';
import { useRoomStore, roomStore } from '@/store/useRoomStore';
import type { ActiveStation } from '@/types/room';
import { exploreStore } from '@/store/exploreStore';
import { DISCOVERY_BY_ID, STATION_DISCOVERY } from '@/data/discoveries';

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

export function RoomCanvas() {
  const isNightMode = useRoomStore((state) => state.isNightMode);
  // Retina screens get 1.5x at most; drop to 1x if the device can't hold the frame rate
  const [dpr, setDpr] = useState(1.5);

  const handleStationArrival = (station: ActiveStation) => {
    const line = DISCOVERY_BY_ID[STATION_DISCOVERY[station] ?? '']?.line;
    if (line) exploreStore.say(line);
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
        dpr={[1, dpr]}
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
        <PerformanceMonitor onDecline={() => setDpr(1)} />
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

          {/* 7. Autonomous character */}
          <CharacterManager onStationArrival={handleStationArrival} />

          {/* 8. Dev aid: ?debug=walkmap draws the lanes and keep-out zones */}
          <WalkMapDebug />

          {/* 9. Interior props & outdoors */}
          <TopShelf />
          <WallDecor />
          <Bookcase />
          <Workstation />
          <ForegroundLounge />
          <OutdoorPathway />
        </Suspense>
      </Canvas>
    </div>
  );
}
