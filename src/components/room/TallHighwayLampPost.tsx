'use client';

import React from 'react';
import { useRoomStore } from '@/store/useRoomStore';

interface TallHighwayLampPostProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function TallHighwayLampPost({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: TallHighwayLampPostProps) {
  const isNightMode = useRoomStore((state) => state.isNightMode);

  return (
    <group position={position} rotation={rotation} name="tall-highway-lamp-post">
      {/* Heavy Base Collar */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.2, 8]} />
        <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Main Steel Mast (3.4m tall) */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.085, 3.4, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.8} />
      </mesh>

      {/* Modern Angled Luminaire Arm Overhanging the Road */}
      <group position={[0, 3.4, 0]} rotation={[0, 0, -0.42]}>
        <mesh position={[0.42, 0, 0]} castShadow>
          <boxGeometry args={[0.85, 0.07, 0.09]} />
          <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Faceted Rectangular Luminaire Head */}
        <group position={[0.82, -0.05, 0]} rotation={[0, 0, 0.42]}>
          <mesh castShadow>
            <boxGeometry args={[0.48, 0.1, 0.22]} />
            <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.9} />
          </mesh>

          {/* Glowing LED Diffuser Panel Underneath */}
          <mesh position={[0, -0.052, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.44, 0.18]} />
            <meshStandardMaterial
              color="#FEF3C7"
              emissive="#FDE68A"
              emissiveIntensity={isNightMode ? 2.5 : 0.8}
              roughness={0.1}
            />
          </mesh>

          {/* Streetlight Downlight Beam */}
          <pointLight
            position={[0, -0.2, 0]}
            color="#FEF3C7"
            intensity={isNightMode ? 3.5 : 1.2}
            distance={8.5}
            decay={2}
            />
        </group>
      </group>
    </group>
  );
}

