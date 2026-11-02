'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { dayNight, lerp } from '@/store/dayNight';

interface PathwayLampPostProps {
  position?: [number, number, number];
}

export function PathwayLampPost({ position = [0, 0, 0] }: PathwayLampPostProps) {
  const glassMat = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const n = dayNight.blend;
    if (glassMat.current) glassMat.current.emissiveIntensity = lerp(0.75, 2.2, n);
    if (light.current) light.current.intensity = lerp(0.6, 1.8, n);
  });

  return (
    <group position={position} name="pathway-lamp-post">
      {/* Stone Pedestal / Ground Flange */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.09, 0.1, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Fluted Vertical Post (0.95m tall) */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.045, 0.88, 8]} />
        <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Decorative Capital Trim */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.04, 0.06, 8]} />
        <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Hexagonal Glass Lantern Cage */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.1, 0.075, 0.22, 6]} />
        <meshStandardMaterial
          ref={glassMat}
          color="#FEF3C7"
          emissive="#F59E0B"
          emissiveIntensity={0.75}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Pointed Pyramid Roof Cap */}
      <mesh position={[0, 1.28, 0]} castShadow>
        <coneGeometry args={[0.13, 0.12, 6]} />
        <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Warm Ambient Pathway Lantern Glow */}
      <pointLight
        ref={light}
        position={[0, 1.12, 0]}
        color="#FDE68A"
        intensity={0.6}
        distance={4.2}
        decay={2}
      />
    </group>
  );
}

