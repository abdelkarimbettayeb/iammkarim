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
    position: new THREE.Vector3(12, 10, 12),
    target: new THREE.Vector3(0, 1.8, 0),
  },
  skills: {
    position: new THREE.Vector3(6.8, 5.2, 0.2),
    target: new THREE.Vector3(2.8, 3.2, -3.2),
  },
  experience: {
    position: new THREE.Vector3(6.5, 6.2, 0.2),
    target: new THREE.Vector3(2.8, 4.8, -3.2),
  },
  workstation: {
    position: new THREE.Vector3(3.2, 4.4, 3.4),
    target: new THREE.Vector3(-1.4, 2.6, -2),
  },
  contact: {
    position: new THREE.Vector3(4, 4.5, 7.5),
    target: new THREE.Vector3(-3.2, 1.4, 2),
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
      const lerpFactor = Math.min(delta * 4.0, 1);
      camera.position.lerp(desiredPos.current, lerpFactor);
      controlsRef.current.target.lerp(desiredTarget.current, lerpFactor);

      // Transition completes when close enough
      if (
        camera.position.distanceTo(desiredPos.current) < 0.04 &&
        controlsRef.current.target.distanceTo(desiredTarget.current) < 0.04
      ) {
        isTransitioning.current = false;
      }
    } else if (activeZone === 'overview') {
      // Subtle organic mouse parallax when resting in overview
      const parallaxX = pointer.x * 0.35;
      const parallaxY = pointer.y * 0.25;
      camera.position.x += (desiredPos.current.x + parallaxX - camera.position.x) * 0.03;
      camera.position.y += (desiredPos.current.y + parallaxY - camera.position.y) * 0.03;
    }

    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={6}
      maxDistance={22}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.3}
      minAzimuthAngle={-Math.PI / 4.5}
      maxAzimuthAngle={Math.PI / 2.2}
    />
  );
}

