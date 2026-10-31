'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';

interface VintageMailboxProps {
  position?: [number, number, number];
}

export function VintageMailbox({ position = [-2.7, 0, 1.2] }: VintageMailboxProps) {
  const [hovered, setHovered] = useState(false);
  const isContactOpen = useRoomStore((state) => state.isContactOpen);
  const toggleContact = useRoomStore((state) => state.toggleContact);

  const doorRef = useRef<THREE.Group>(null);
  const flagRef = useRef<THREE.Group>(null);

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
    };
  }, []);

  useFrame((_, delta) => {
    // Smooth door hinge rotation
    if (doorRef.current) {
      const targetDoorRot = isContactOpen ? -Math.PI / 2.2 : 0;
      doorRef.current.rotation.x = THREE.MathUtils.lerp(
        doorRef.current.rotation.x,
        targetDoorRot,
        Math.min(delta * 8, 1)
      );
    }

    // Smooth flag raise rotation (pivoting on screw axis X)
    if (flagRef.current) {
      const targetFlagRot = isContactOpen ? -Math.PI / 2 : 0;
      flagRef.current.rotation.x = THREE.MathUtils.lerp(
        flagRef.current.rotation.x,
        targetFlagRot,
        Math.min(delta * 10, 1)
      );
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    toggleContact();
  };

  return (
    <group
      position={position}
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
      {/* =========================================
          1. White Wooden Post & Base
         ========================================= */}
      {/* Floor Flange Base */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[0.22, 0.06, 0.22]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
      </mesh>

      {/* Main Square Post */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.11, 1.15, 0.11]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
      </mesh>

      {/* Decorative Beveled Cap */}
      <mesh position={[0, 1.19, 0]} castShadow>
        <boxGeometry args={[0.17, 0.05, 0.17]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.24, 0]} castShadow>
        <boxGeometry args={[0.12, 0.05, 0.12]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </mesh>

      {/* =========================================
          2. Domed Mailbox Body
         ========================================= */}
      <group position={[0, 1.35, 0.04]}>
        {/* Lower Rectangular Box */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.18, 0.5]} />
          <meshStandardMaterial color="#1E2024" roughness={0.5} metalness={0.4} />
        </mesh>

        {/* Upper Semicircular Dome */}
        <mesh
          position={[0, 0.09, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.15, 0.15, 0.5, 24, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#1E2024" roughness={0.5} metalness={0.4} />
        </mesh>

        {/* Back Sealed Wall */}
        <mesh position={[0, 0.04, -0.25]}>
          <planeGeometry args={[0.3, 0.26]} />
          <meshStandardMaterial color="#1E2024" roughness={0.6} />
        </mesh>

        {/* =========================================
            3. Hinged Front Door Flap
           ========================================= */}
        <group ref={doorRef} position={[0, -0.09, 0.25]}>
          <mesh position={[0, 0.13, 0]} castShadow>
            <boxGeometry args={[0.29, 0.26, 0.02]} />
            <meshStandardMaterial color="#2B2D33" roughness={0.5} metalness={0.3} />
          </mesh>
          {/* Small Metal Pull Handle */}
          <mesh position={[0, 0.22, 0.02]} castShadow>
            <boxGeometry args={[0.07, 0.018, 0.02]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>

        {/* =========================================
            4. Red Postal Flag (Pivoting on Side)
           ========================================= */}
        <group ref={flagRef} position={[-0.16, 0, -0.12]}>
          {/* Pivot Screw */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 0.025, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>

          {/* Flag Metal Arm */}
          <mesh position={[0.012, 0, 0.12]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.008, 0.016, 0.24]} />
            <meshStandardMaterial color="#EF4444" roughness={0.4} />
          </mesh>

          {/* Red Flag Blade */}
          <mesh position={[0.012, 0.035, 0.22]}>
            <boxGeometry args={[0.008, 0.07, 0.08]} />
            <meshStandardMaterial color="#EF4444" roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* =========================================
          5. Hover Tooltip
         ========================================= */}
      {hovered && (
        <Html position={[0, 1.78, 0]} center distanceFactor={7} pointerEvents="none">
          <div className="bg-[#0F172A]/95 backdrop-blur-md border border-amber-400/50 shadow-2xl px-3 py-1.5 rounded-lg whitespace-nowrap text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
              <span>📮</span> Contact & Resume
            </div>
            <div className="text-[9px] text-amber-300 font-medium mt-0.5">
              Click to open direct message & CV
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
