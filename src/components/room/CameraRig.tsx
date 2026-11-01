'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';
import type { RoomZone } from '@/types/room';

interface CameraPreset {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

const ZONE_PRESETS: Record<RoomZone, CameraPreset> = {
  overview: {
    position: new THREE.Vector3(8.5, 7.2, 8.5),
    target: new THREE.Vector3(0, 1.5, 0),
  },
  skills: {
    position: new THREE.Vector3(3.8, 4.2, 0.4),
    target: new THREE.Vector3(0.5, 2.6, -3.4),
  },
  experience: {
    position: new THREE.Vector3(3.4, 4.8, 0.2),
    target: new THREE.Vector3(0.3, 3.8, -3.4),
  },
  workstation: {
    position: new THREE.Vector3(0.6, 3.2, 1.4),
    target: new THREE.Vector3(-2.1, 2.1, -1.1),
  },
  contact: {
    position: new THREE.Vector3(1.0, 3.0, 4.2),
    target: new THREE.Vector3(-2.2, 1.1, 1.2),
  },
};

export function CameraRig() {
  const activeZone = useRoomStore((state) => state.activeZone);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const desiredPos = useRef(ZONE_PRESETS.overview.position.clone());
  const desiredTarget = useRef(ZONE_PRESETS.overview.target.clone());
  const isTransitioning = useRef(false);

  // Update target coordinates when active zone changes
  useEffect(() => {
    const preset = ZONE_PRESETS[activeZone] || ZONE_PRESETS.overview;
    desiredPos.current.copy(preset.position);
    desiredTarget.current.copy(preset.target);
    isTransitioning.current = true;
  }, [activeZone]);

  // If user manually drags or zooms, hand off full control to OrbitControls
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onStart = () => {
      isTransitioning.current = false;
    };

    controls.addEventListener('start', onStart);
    return () => {
      controls.removeEventListener('start', onStart);
    };
  }, []);

  useFrame(({ pointer }, delta) => {
    if (!controlsRef.current) return;

    // Smooth camera transition to zone presets
    if (isTransitioning.current) {
      const lerpFactor = Math.min(delta * 4.2, 1);
      camera.position.lerp(desiredPos.current, lerpFactor);
      controlsRef.current.target.lerp(desiredTarget.current, lerpFactor);

      // Transition completes when close enough
      if (
        camera.position.distanceTo(desiredPos.current) < 0.03 &&
        controlsRef.current.target.distanceTo(desiredTarget.current) < 0.03
      ) {
        isTransitioning.current = false;
      }
    } else if (activeZone === 'overview') {
      // Subtle organic mouse parallax when resting in overview
      const parallaxX = pointer.x * 0.28;
      const parallaxY = pointer.y * 0.2;
      camera.position.x += (desiredPos.current.x + parallaxX - camera.position.x) * 0.04;
      camera.position.y += (desiredPos.current.y + parallaxY - camera.position.y) * 0.04;
    }

    // Hard barrier clamp: Camera cannot cross into negative space behind walls
    camera.position.x = Math.max(camera.position.x, 0.2);
    camera.position.z = Math.max(camera.position.z, 0.2);
    camera.position.y = Math.max(camera.position.y, 0.8);

    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      enablePan={false}
      minDistance={4.5}
      maxDistance={14.5}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.35}
      minAzimuthAngle={Math.PI / 4 - 0.42}
      maxAzimuthAngle={Math.PI / 4 + 0.42}
    />
  );
}
