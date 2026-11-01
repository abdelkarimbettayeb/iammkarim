'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useRoomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';

interface VenetianWindowProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function VenetianWindow({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: VenetianWindowProps) {
  const isNightMode = useRoomStore((state) => state.isNightMode);
  const weatherState = useRoomStore((state) => state.weatherState);
  const isWindowOpen = useRoomStore((state) => state.isWindowOpen);
  const toggleWindow = useRoomStore((state) => state.toggleWindow);
  const setActiveStation = useRoomStore((state) => state.setActiveStation);

  const slatsGroupRef = useRef<THREE.Group>(null);
  const slatAngleRef = useRef(isWindowOpen ? 0 : -1.2);

  const slatCount = 28;
  const blindSlats = Array.from({ length: slatCount }, (_, i) => i);

  // Auto-close at night or during cold snow if not manually opened
  React.useEffect(() => {
    if (isNightMode || weatherState === 'snow') {
      toggleWindow(false);
    }
  }, [isNightMode, weatherState, toggleWindow]);

  useFrame((_, delta) => {
    // Open slat angle = 0 (horizontal, letting light through); Closed = -1.2 (slanted shut)
    const targetAngle = isWindowOpen ? 0.05 : -1.25;
    slatAngleRef.current = THREE.MathUtils.damp(slatAngleRef.current, targetAngle, 6, delta);

    if (slatsGroupRef.current) {
      slatsGroupRef.current.children.forEach((child) => {
        child.rotation.x = slatAngleRef.current;
      });
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playSound('window');
    setActiveStation('window');
    toggleWindow();
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
      }}
    >
      {/* =========================================
          1. Architectural Window Frame & Sill
         ========================================= */}
      {/* Top Outer Lintel */}
      <mesh position={[0, 1.88, 0]} castShadow>
        <boxGeometry args={[2.08, 0.12, 0.16]} />
        <meshStandardMaterial color="#1E293B" roughness={0.35} />
      </mesh>
      {/* Bottom Window Sill (Extending slightly outward) */}
      <mesh position={[0, -1.88, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[2.16, 0.12, 0.24]} />
        <meshStandardMaterial color="#1E293B" roughness={0.35} />
      </mesh>
      {/* Left Outer Jamb */}
      <mesh position={[-1.0, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 3.64, 0.16]} />
        <meshStandardMaterial color="#1E293B" roughness={0.35} />
      </mesh>
      {/* Right Outer Jamb */}
      <mesh position={[1.0, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 3.64, 0.16]} />
        <meshStandardMaterial color="#1E293B" roughness={0.35} />
      </mesh>

      {/* Recessed Glass Pane (Reflecting subtle sky daylight) */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[1.92, 3.64]} />
        <meshStandardMaterial
          color="#94A3B8"
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* =========================================
          2. Venetian Blinds Mechanism (Valance & Strings)
         ========================================= */}
      {/* Top Valance Cassette Box */}
      <mesh position={[0, 1.76, 0.06]} castShadow>
        <boxGeometry args={[1.92, 0.12, 0.1]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} />
      </mesh>

      {/* Bottom Heavy Weight Bar */}
      <mesh position={[0, -1.74, 0.05]} castShadow>
        <boxGeometry args={[1.9, 0.06, 0.06]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} />
      </mesh>

      {/* Vertical Ladder Guide Cords (Left & Right) */}
      {[-0.6, 0.6].map((xCord, idx) => (
        <mesh key={idx} position={[xCord, 0, 0.05]}>
          <cylinderGeometry args={[0.003, 0.003, 3.48, 8]} />
          <meshBasicMaterial color="#64748B" />
        </mesh>
      ))}

      {/* =========================================
          3. 28 Angled Horizontal Slats (Animated Tilt)
         ========================================= */}
      <group ref={slatsGroupRef}>
        {blindSlats.map((i) => {
          const yPos = 1.66 - (i / (slatCount - 1)) * 3.32;
          return (
            <mesh
              key={i}
              position={[0, yPos, 0.05]}
              rotation={[slatAngleRef.current, 0, 0]}
              castShadow
            >
              <boxGeometry args={[1.9, 0.085, 0.008]} />
              <meshStandardMaterial color="#1E293B" roughness={0.55} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
