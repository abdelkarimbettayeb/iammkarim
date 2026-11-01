'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRoomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';

interface DeskLampProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export function DeskLamp({ position, rotation }: DeskLampProps) {
  const [hovered, setHovered] = useState(false);
  const isNightMode = useRoomStore((state) => state.isNightMode);
  const toggleNightMode = useRoomStore((state) => state.toggleNightMode);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
    };
  }, []);

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playSound('lamp');
    toggleNightMode();

    if (setTheme) {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Lamp Weighted Base */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.16, 0.04, 20]} />
        <meshStandardMaterial
          color="#1E2024"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* 2. Lower Articulated Arm (Angled) */}
      <mesh
        position={[0.08, 0.28, 0]}
        rotation={[0, 0, -0.32]}
        castShadow
      >
        <cylinderGeometry args={[0.016, 0.016, 0.55, 8]} />
        <meshStandardMaterial color="#1E2024" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Elbow Joint Pivot */}
      <mesh position={[0.16, 0.52, 0]} castShadow>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* 3. Upper Articulated Arm (Angled Down toward desk) */}
      <mesh
        position={[0.04, 0.68, 0]}
        rotation={[0, 0, 0.48]}
        castShadow
      >
        <cylinderGeometry args={[0.016, 0.016, 0.45, 8]} />
        <meshStandardMaterial color="#1E2024" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Shade Pivot Joint */}
      <mesh position={[-0.08, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.032, 12, 12]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* 4. Conical Lamp Shade */}
      <group position={[-0.14, 0.82, 0]} rotation={[0, 0, 0.65]}>
        <mesh castShadow>
          <coneGeometry args={[0.16, 0.24, 20, 1, true]} />
          <meshStandardMaterial
            color="#1E2024"
            roughness={0.3}
            metalness={0.8}
            side={2}
          />
        </mesh>

        {/* Interior Light Bulb */}
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial
            color="#FFFBEB"
            emissive="#F59E0B"
            emissiveIntensity={isNightMode ? 2.5 : 0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Focused Desk Spotlight Cone */}
        <spotLight
          position={[0, -0.08, 0]}
          target-position={[0, -2, 0]}
          color="#FEF3C7"
          intensity={isNightMode ? 3.2 : 0.9}
          angle={0.65}
          penumbra={0.4}
          distance={6}
          castShadow
        />
      </group>
    </group>
  );
}
