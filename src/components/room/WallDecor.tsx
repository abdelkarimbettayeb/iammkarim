'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Text, Html } from '@react-three/drei';
import { playSound } from '@/lib/audioEngine';

interface Dart {
  id: number;
  offsetY: number;
  offsetZ: number;
  rotationZ: number;
}

export function WallDecor() {
  const wallX = -3.94;
  const [darts, setDarts] = useState<Dart[]>([
    { id: 1, offsetY: 0.02, offsetZ: -0.01, rotationZ: 0.15 },
    { id: 2, offsetY: -0.06, offsetZ: 0.05, rotationZ: -0.2 },
  ]);
  const [showHitBadge, setShowHitBadge] = useState(false);
  const badgeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
      if (typeof document !== 'undefined') {
        document.body.style.cursor = 'auto';
      }
    };
  }, []);

  const handleDartboardClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playSound('dart');

    const newDart: Dart = {
      id: Date.now(),
      offsetY: (Math.random() - 0.5) * 0.14,
      offsetZ: (Math.random() - 0.5) * 0.14,
      rotationZ: (Math.random() - 0.5) * 0.4,
    };

    setDarts((prev) => [...prev.slice(-3), newDart]);
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
      <group position={[wallX, 3.85, -1.05]} rotation={[0, Math.PI / 2, 0]}>
        {/* Soft Drop Shadow Plate */}
        <mesh position={[0, -0.015, -0.015]}>
          <planeGeometry args={[2.8, 0.6]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} />
        </mesh>

        {/* Primary 3D Extruded Lettering */}
        <Text
          position={[0, 0, 0.035]}
          fontSize={0.46}
          letterSpacing={0.14}
          color="#F1F5F9"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.018}
          outlineColor="#64748B"
        >
          BETTAYEB
        </Text>
      </group>

      {/* =========================================
          2. Curved Wall Sconce & Pendant Globe
         ========================================= */}
      <group position={[wallX, 4.35, -2.6]} rotation={[0, Math.PI / 2, 0]}>
        {/* Wall Backplate */}
        <mesh position={[0, 0, 0.018]}>
          <cylinderGeometry args={[0.07, 0.07, 0.025, 16]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Arched Curved Arm */}
        <mesh position={[0.18, -0.12, 0.03]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.012, 0.012, 0.38, 8]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Vertical Cord */}
        <mesh position={[0.3, -0.34, 0.03]}>
          <cylinderGeometry args={[0.005, 0.005, 0.22, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>

        {/* White Frosted Glass Lamp Globe */}
        <mesh position={[0.3, -0.5, 0.03]}>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFBEB"
            emissiveIntensity={0.85}
            roughness={0.2}
          />
        </mesh>

        {/* Sconce Glow Light */}
        <pointLight
          position={[0.3, -0.56, 0.03]}
          intensity={0.5}
          distance={3.5}
          color="#FEF3C7"
        />
      </group>

      {/* =========================================
          3. High-Contrast Interactive Dartboard
         ========================================= */}
      <group
        position={[wallX + 0.025, 2.9, -2.6]}
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
        {/* Outer Warm Wood Rim/Frame */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.44, 0.44, 0.035, 32]} />
          <meshStandardMaterial color="#3E2723" roughness={0.5} />
        </mesh>

        {/* Contrast Alternating Wedge Face (Black & Cream segments) */}
        <mesh position={[0, 0, 0.019]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.008, 32]} />
          <meshStandardMaterial color="#1E2024" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.021]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.07, 0.38, 20]} />
          <meshStandardMaterial color="#F5EEDB" roughness={0.7} />
        </mesh>

        {/* Double Bed Ring (Red) */}
        <mesh position={[0, 0, 0.024]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.33, 0.37, 32]} />
          <meshStandardMaterial color="#DC2626" roughness={0.6} />
        </mesh>

        {/* Triple Bed Ring (Green) */}
        <mesh position={[0, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.19, 0.23, 32]} />
          <meshStandardMaterial color="#16A34A" roughness={0.6} />
        </mesh>

        {/* Outer Bull (Green) */}
        <mesh position={[0, 0, 0.026]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.055, 24]} />
          <meshStandardMaterial color="#16A34A" roughness={0.5} />
        </mesh>

        {/* Inner Bullseye (Vibrant Red) */}
        <mesh position={[0, 0, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.026, 24]} />
          <meshStandardMaterial color="#EF4444" roughness={0.4} />
        </mesh>

        {/* Embedded Darts */}
        {darts.map((dart) => (
          <group
            key={dart.id}
            position={[dart.offsetZ, dart.offsetY, 0.03]}
            rotation={[0, 0, dart.rotationZ]}
          >
            {/* Needle */}
            <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.1, 8]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Brass Barrel */}
            <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.08, 8]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Shaft & Red Flights */}
            <mesh position={[0, 0, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.1, 8]} />
              <meshStandardMaterial color="#1E293B" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.26]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.06, 0.002, 0.07]} />
              <meshStandardMaterial color="#EF4444" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0, 0.26]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.06, 0.002, 0.07]} />
              <meshStandardMaterial color="#EF4444" roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* Celebratory Hit Badge on Click */}
        {showHitBadge && (
          <Html position={[0, 0.55, 0.08]} center pointerEvents="none">
            <div className="bg-amber-500/95 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/50 border border-amber-300 animate-bounce whitespace-nowrap">
              🎯 Bullseye! +50
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
