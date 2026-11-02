'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';
import { DAY_NIGHT_RATE, dayNight } from '@/store/dayNight';

/**
 * Eases the shared `dayNight.blend` towards the target mode, so switching
 * between day and night is a smooth ~1.5 s transition instead of a snap.
 * Must be mounted inside the Canvas (it runs in the render loop).
 */
export function DayNightDriver() {
  const isNightMode = useRoomStore((state) => state.isNightMode);

  useFrame((_, delta) => {
    const target = isNightMode ? 1 : 0;
    const next = THREE.MathUtils.damp(dayNight.blend, target, DAY_NIGHT_RATE, delta);
    dayNight.blend = Math.abs(next - target) < 0.001 ? target : next;
  });

  return null;
}
