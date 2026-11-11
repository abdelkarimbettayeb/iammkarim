'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useRoomStore } from '@/store/useRoomStore';
import { dayNight, lerp } from '@/store/dayNight';

const AMBIENT_DAY = new THREE.Color('#FFFBEB');
const AMBIENT_NIGHT = new THREE.Color('#1E293B');
const SUN_DAY = new THREE.Color('#FFFDF5');
const SUN_NIGHT = new THREE.Color('#64748B');
const FILL_DAY = new THREE.Color('#E0F2FE');
const FILL_NIGHT = new THREE.Color('#38BDF8');

const SUN_POS_DAY = new THREE.Vector3(12.5, 16, -8.5);
const SUN_POS_NIGHT = new THREE.Vector3(6.5, 9, -5.5);

/** Sun strength for the weather during the day */
function daySunIntensity(weather: string): number {
  return weather === 'rain' ? 0.75 : weather === 'snow' ? 0.95 : 1.35;
}

export function LightingRig() {
  const weatherState = useRoomStore((state) => state.weatherState);

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  /** Weather changes the day-time sun strength; ease that as well */
  const daySun = useRef(daySunIntensity(weatherState));

  useFrame((_, delta) => {
    const n = dayNight.blend;
    daySun.current = THREE.MathUtils.damp(daySun.current, daySunIntensity(weatherState), 3, delta);

    if (ambientRef.current) {
      ambientRef.current.color.copy(AMBIENT_DAY).lerp(AMBIENT_NIGHT, n);
      ambientRef.current.intensity = lerp(0.72, 0.35, n);
    }
    if (sunRef.current) {
      sunRef.current.color.copy(SUN_DAY).lerp(SUN_NIGHT, n);
      sunRef.current.intensity = lerp(daySun.current, 0.35, n);
      sunRef.current.position.lerpVectors(SUN_POS_DAY, SUN_POS_NIGHT, n);
    }
    if (fillRef.current) {
      fillRef.current.color.copy(FILL_DAY).lerp(FILL_NIGHT, n);
      fillRef.current.intensity = lerp(0.65, 0.25, n);
    }
  });

  return (
    <group name="lighting-rig">
      {/* 1. Ambient diffused fill */}
      <ambientLight ref={ambientRef} color="#FFFBEB" intensity={0.72} />

      {/* 2. Primary sun / moonlight, shadow frustum sized to the room and garden */}
      <directionalLight
        ref={sunRef}
        position={[12.5, 16, -8.5]}
        intensity={1.35}
        color="#FFFDF5"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0003}
      />

      {/* 3. Soft front sky fill */}
      <directionalLight ref={fillRef} position={[6.5, 9, 8.5]} intensity={0.65} color="#E0F2FE" />

      {/* Interior light at night comes only from real fixtures: the wall sconce,
          the desk lamp, the monitor and the moon through the window */}
    </group>
  );
}
