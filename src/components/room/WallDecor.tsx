'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { playSound } from '@/lib/audioEngine';

interface Dart {
  id: number;
  offsetY: number;
  offsetZ: number;
  rotationZ: number;
}

export function WallDecor() {
  const wallX = -4.92;
  const [darts, setDarts] = useState<Dart[]>([
    { id: 1, offsetY: 0.02, offsetZ: -0.01, rotationZ: 0.15 },
  ]);
  const [showHitBadge, setShowHitBadge] = useState(false);
  const badgeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDartboardClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playSound('dart');

    // Add new stuck dart with subtle random scatter around bullseye
    const newDart: Dart = {
      id: Date.now(),
      offsetY: (Math.random() - 0.5) * 0.16,
      offsetZ: (Math.random() - 0.5) * 0.16,
      rotationZ: (Math.random() - 0.5) * 0.4,
    };

    setDarts((prev) => [...prev.slice(-3), newDart]); // keep up to 4 darts
    setShowHitBadge(true);

    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = setTimeout(() => {
      setShowHitBadge(false);
    }, 1800);
  };

  return (
    <group name="wall-decor">
      {/* =========================================
          1. 3D Wall Branding ("BETTAYEB")
         ========================================= */}
      <group position={[wallX, 5.0, 0.4]} rotation={[0, Math.PI / 2, 0]}>
        {/* Soft Drop Shadow Plate */}
        <mesh position={[0, -0.02, -0.02]}>
          <planeGeometry args={[3.2, 0.7]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.3} />
        </mesh>

        {/* Primary 3D Extruded Lettering */}
        <Text
          position={[0, 0, 0.04]}
          fontSize={0.52}
          letterSpacing={0.16}
          color="#F8FAFC"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#94A3B8"
        >
          BETTAYEB
        </Text>
      </group>

      {/* =========================================
          2. Curved Wall Sconce & Pendant Globe
         ========================================= */}
      <group position={[wallX, 5.7, -2.4]} rotation={[0, Math.PI / 2, 0]}>
        {/* Wall Backplate */}
        <mesh position={[0, 0, 0.02]}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Arched Curved Arm */}
        <mesh position={[0.22, -0.15, 0.04]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.015, 0.015, 0.45, 8]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Vertical Cord */}
        <mesh position={[0.36, -0.42, 0.04]}>
          <cylinderGeometry args={[0.006, 0.006, 0.28, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>

        {/* White Glass Lamp Globe */}
        <mesh position={[0.36, -0.62, 0.04]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFBEB"
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Downward Sconce Glow */}
        <pointLight
          position={[0.36, -0.7, 0.04]}
          intensity={0.6}
          distance={4}
          color="#FEF3C7"
        />
      </group>

      {/* =========================================
          3. Interactive Dartboard
         ========================================= */}
      <group
        position={[wallX + 0.03, 4.0, -2.4]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={handleDartboardClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'crosshair';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Outer Wooden Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.04, 32]} />
          <meshStandardMaterial color="#1E2024" roughness={0.6} />
        </mesh>

        {/* Dark Cork Board Face */}
        <mesh position={[0, 0, 0.022]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.01, 32]} />
          <meshStandardMaterial color="#0F172A" roughness={0.9} />
        </mesh>

        {/* Double/Triple Bed Green & Red Rings */}
        <mesh position={[0, 0, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.44, 32]} />
          <meshStandardMaterial color="#DC2626" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.28, 32]} />
          <meshStandardMaterial color="#16A34A" roughness={0.7} />
        </mesh>

        {/* Outer Bull (Green) */}
        <mesh position={[0, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.07, 24]} />
          <meshStandardMaterial color="#16A34A" roughness={0.6} />
        </mesh>

        {/* Inner Bullseye (Red) */}
        <mesh position={[0, 0, 0.034]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.032, 24]} />
          <meshStandardMaterial color="#EF4444" roughness={0.5} />
        </mesh>

        {/* Embedded Darts */}
        {darts.map((dart) => (
          <group
            key={dart.id}
            position={[dart.offsetZ, dart.offsetY, 0.035]}
            rotation={[0, 0, dart.rotationZ]}
          >
            {/* Needle embedded in board */}
            <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 0.12, 8]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Brass Barrel */}
            <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.1, 8]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Shaft & Red Flights */}
            <mesh position={[0, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
              <meshStandardMaterial color="#1E293B" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.32]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.07, 0.002, 0.08]} />
              <meshStandardMaterial color="#EF4444" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0, 0.32]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.07, 0.002, 0.08]} />
              <meshStandardMaterial color="#EF4444" roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* Celebratory Hit Badge on Click */}
        {showHitBadge && (
          <Html position={[0, 0.68, 0.1]} center pointerEvents="none">
            <div className="bg-amber-500/90 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/40 border border-amber-300 animate-bounce whitespace-nowrap">
              🎯 Bullseye! +50
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
