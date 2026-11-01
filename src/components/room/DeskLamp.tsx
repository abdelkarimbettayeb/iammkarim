'use client';

import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';
import { useRoomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';

interface DeskLampProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export function DeskLamp({ position, rotation = [0, 0, 0] }: DeskLampProps) {
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
      {/* 1. Lamp Weighted Circular Base */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.11, 0.12, 0.03, 24]} />
        <meshStandardMaterial
          color={hovered ? '#334155' : '#1E293B'}
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>
      {/* Base Stem Collar */}
      <mesh position={[0, 0.035, 0]} castShadow>
        <cylinderGeometry args={[0.024, 0.028, 0.02, 16]} />
        <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 2. Lower Twin Articulated Arms */}
      <group position={[0, 0.05, 0]}>
        {/* Base swivel joint */}
        <mesh castShadow>
          <sphereGeometry args={[0.022, 16, 16]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Lower twin bars angling forward-right (towards desk center) */}
        <group rotation={[0.2, 0, -0.55]}>
          <mesh position={[-0.014, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.007, 0.007, 0.44, 8]} />
            <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0.014, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.007, 0.007, 0.44, 8]} />
            <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Tension springs */}
          <mesh position={[0, 0.16, 0.012]}>
            <cylinderGeometry args={[0.005, 0.005, 0.22, 8]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.2} metalness={0.9} />
          </mesh>

          {/* Elbow Joint at tip of lower arm */}
          <group position={[0, 0.44, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.024, 16, 16]} />
              <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
            </mesh>
            <mesh position={[0, 0, 0.024]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.01, 12]} />
              <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
            </mesh>

            {/* Upper Arm angling down-forward over the desk */}
            <group rotation={[-0.1, 0, -0.65]}>
              <mesh position={[-0.012, 0.18, 0]} castShadow>
                <cylinderGeometry args={[0.007, 0.007, 0.36, 8]} />
                <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.7} />
              </mesh>
              <mesh position={[0.012, 0.18, 0]} castShadow>
                <cylinderGeometry args={[0.007, 0.007, 0.36, 8]} />
                <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.7} />
              </mesh>

              {/* Shade Socket Joint */}
              <group position={[0, 0.36, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.022, 16, 16]} />
                  <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
                </mesh>

                {/* Lamp Shade pointing downward towards desk */}
                <group rotation={[0.4, 0, -0.8]}>
                  {/* Flared shade cone */}
                  <mesh position={[0, -0.06, 0]} castShadow>
                    <cylinderGeometry args={[0.035, 0.11, 0.15, 24, 1, true]} />
                    <meshStandardMaterial
                      color="#1E293B"
                      roughness={0.35}
                      metalness={0.7}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                  {/* Shade rounded dome top */}
                  <mesh position={[0, 0.015, 0]} castShadow>
                    <sphereGeometry args={[0.038, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.7} />
                  </mesh>
                  {/* Brass shade trim ring */}
                  <mesh position={[0, -0.135, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.11, 0.005, 12, 24]} />
                    <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
                  </mesh>

                  {/* Interior glowing warm light bulb */}
                  <mesh position={[0, -0.04, 0]}>
                    <sphereGeometry args={[0.032, 16, 16]} />
                    <meshStandardMaterial
                      color="#FFFBEB"
                      emissive="#FBBF24"
                      emissiveIntensity={isNightMode ? 3.5 : 1.2}
                      roughness={0.2}
                    />
                  </mesh>

                  {/* Focused warm pool of light */}
                  <pointLight
                    position={[0, -0.1, 0]}
                    color="#FEF3C7"
                    intensity={isNightMode ? 3.0 : 1.0}
                    distance={3.5}
                    decay={2}
                    castShadow
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
