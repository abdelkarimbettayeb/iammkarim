'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';
import type { ActiveStation } from '@/types/room';

// Subtle cinematic framing offsets per station in signature Dancing Line isometric angle
const STATION_CAMERA_TARGETS: Record<ActiveStation, [number, number, number]> = {
  none: [0, 1.2, 0],
  workstation: [-0.65, 1.4, -0.6],
  couch: [-0.6, 1.1, 0.2],
  guitar: [0.6, 1.3, -0.7],
  window: [0.7, 1.8, -0.9],
  dartboard: [-0.8, 1.4, 0.4],
  volleyball: [0.6, 0.8, 0.8],
  flags: [-0.4, 1.3, -0.6],
};

export function CameraRig() {
  const activeStation = useRoomStore((state) => state.activeStation);
  const { camera } = useThree();

  const basePos = useRef(new THREE.Vector3(8.5, 7.2, 8.5));
  const currentTarget = useRef(new THREE.Vector3(0, 1.2, 0));
  const desiredTarget = useRef(new THREE.Vector3(0, 1.2, 0));

  useFrame((_, delta) => {
    const targetOffset = STATION_CAMERA_TARGETS[activeStation] || STATION_CAMERA_TARGETS.none;
    desiredTarget.current.set(targetOffset[0], targetOffset[1], targetOffset[2]);

    // Smooth subtle cinematic target damping
    currentTarget.current.x = THREE.MathUtils.damp(currentTarget.current.x, desiredTarget.current.x, 3.5, delta);
    currentTarget.current.y = THREE.MathUtils.damp(currentTarget.current.y, desiredTarget.current.y, 3.5, delta);
    currentTarget.current.z = THREE.MathUtils.damp(currentTarget.current.z, desiredTarget.current.z, 3.5, delta);

    // Keep camera locked to isometric signature angle, following subtle center offset
    camera.position.x = THREE.MathUtils.damp(camera.position.x, basePos.current.x + currentTarget.current.x * 0.4, 3.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, basePos.current.y + (currentTarget.current.y - 1.2) * 0.3, 3.5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, basePos.current.z + currentTarget.current.z * 0.4, 3.5, delta);

    camera.lookAt(currentTarget.current);
  });

  return null;
}
