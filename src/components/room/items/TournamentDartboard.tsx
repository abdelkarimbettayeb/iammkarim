'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { playSound } from '@/lib/audioEngine';
import { useRoomStore } from '@/store/useRoomStore';

interface Dart {
  id: number;
  offsetY: number;
  offsetZ: number;
  rotationZ: number;
}

interface TournamentDartboardProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const DARTBOARD_NUMBERS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

function createDartboardTexture(): THREE.CanvasTexture {
  if (typeof window === 'undefined') {
    return new THREE.Texture() as THREE.CanvasTexture;
  }

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = size / 2;
  const cy = size / 2;

  // Background
  ctx.fillStyle = '#0F1216';
  ctx.fillRect(0, 0, size, size);

  // Radii in pixels
  const rNumberRingOuter = size * 0.49;
  const rDoubleOuter = size * 0.41;
  const rDoubleInner = size * 0.38;
  const rTripleOuter = size * 0.25;
  const rTripleInner = size * 0.22;
  const rOuterBull = size * 0.045;
  const rBullseye = size * 0.02;

  // 1. Outer Dark Number Ring
  ctx.beginPath();
  ctx.arc(cx, cy, rNumberRingOuter, 0, Math.PI * 2);
  ctx.fillStyle = '#14171C';
  ctx.fill();

  // 2. The 20 Radial Segments
  const step = (Math.PI * 2) / 20;
  // Offset so number 20 is vertically at top (-PI/2)
  const angleOffset = -Math.PI / 2 - step / 2;

  for (let i = 0; i < 20; i++) {
    const a1 = angleOffset + i * step;
    const a2 = a1 + step;
    const isEven = i % 2 === 0;

    // A. Outer Wedge Bed (between Double and Triple)
    ctx.beginPath();
    ctx.arc(cx, cy, rDoubleInner, a1, a2);
    ctx.arc(cx, cy, rTripleOuter, a2, a1, true);
    ctx.closePath();
    ctx.fillStyle = isEven ? '#181B20' : '#F6F1E3';
    ctx.fill();

    // B. Inner Wedge Bed (between Triple and Outer Bull)
    ctx.beginPath();
    ctx.arc(cx, cy, rTripleInner, a1, a2);
    ctx.arc(cx, cy, rOuterBull, a2, a1, true);
    ctx.closePath();
    ctx.fillStyle = isEven ? '#181B20' : '#F6F1E3';
    ctx.fill();

    // C. Double Ring
    ctx.beginPath();
    ctx.arc(cx, cy, rDoubleOuter, a1, a2);
    ctx.arc(cx, cy, rDoubleInner, a2, a1, true);
    ctx.closePath();
    ctx.fillStyle = isEven ? '#DC2626' : '#16A34A';
    ctx.fill();

    // D. Triple Ring
    ctx.beginPath();
    ctx.arc(cx, cy, rTripleOuter, a1, a2);
    ctx.arc(cx, cy, rTripleInner, a2, a1, true);
    ctx.closePath();
    ctx.fillStyle = isEven ? '#DC2626' : '#16A34A';
    ctx.fill();

    // E. Number Typography along Outer Band
    const num = DARTBOARD_NUMBERS[i];
    const midAngle = a1 + step / 2;
    const numRadius = size * 0.445;
    const nx = cx + Math.cos(midAngle) * numRadius;
    const ny = cy + Math.sin(midAngle) * numRadius;

    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.font = 'bold 36px "SF Pro Display", sans-serif';
    ctx.fillStyle = '#FAF5EE';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(num.toString(), 0, 0);
    ctx.restore();
  }

  // 3. Green Outer Bull
  ctx.beginPath();
  ctx.arc(cx, cy, rOuterBull, 0, Math.PI * 2);
  ctx.fillStyle = '#16A34A';
  ctx.fill();

  // 4. Red Inner Bullseye
  ctx.beginPath();
  ctx.arc(cx, cy, rBullseye, 0, Math.PI * 2);
  ctx.fillStyle = '#EF4444';
  ctx.fill();

  // 5. Silver Wire Grid (Radial & Concentric Spider Wires)
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2.5;

  // Concentric wire rings
  [rDoubleOuter, rDoubleInner, rTripleOuter, rTripleInner, rOuterBull, rBullseye].forEach(
    (radius) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  );

  // Radial wire dividers
  for (let i = 0; i < 20; i++) {
    const angle = angleOffset + i * step;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * rOuterBull, cy + Math.sin(angle) * rOuterBull);
    ctx.lineTo(cx + Math.cos(angle) * rDoubleOuter, cy + Math.sin(angle) * rDoubleOuter);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function TournamentDartboard({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: TournamentDartboardProps) {
  const [darts, setDarts] = useState<Dart[]>([
    { id: 1, offsetY: 0.02, offsetZ: -0.01, rotationZ: 0.15 },
    { id: 2, offsetY: -0.06, offsetZ: 0.05, rotationZ: -0.2 },
  ]);
  const [showHitBadge, setShowHitBadge] = useState(false);
  const badgeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const boardGroupRef = useRef<THREE.Group>(null);
  const activeStation = useRoomStore((state) => state.activeStation);
  const setActiveStation = useRoomStore((state) => state.setActiveStation);
  const dartsLeft = useRoomStore((state) => state.dartsLeft);
  const decrementDarts = useRoomStore((state) => state.decrementDarts);
  const resetDarts = useRoomStore((state) => state.resetDarts);

  useEffect(() => {
    if (dartsLeft === 0) {
      // Darts run out -> character collects them from board and resets
      const timer = setTimeout(() => {
        setDarts([]);
        resetDarts();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [dartsLeft, resetDarts]);

  const dartboardTexture = useMemo(() => createDartboardTexture(), []);

  useEffect(() => {
    return () => {
      if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
      if (typeof document !== 'undefined') {
        document.body.style.cursor = 'auto';
      }
    };
  }, []);

    const handleDartboardClick = (e: any) => {
    e.stopPropagation();
    setActiveStation('dartboard');
    playSound('dart');

    let hitX = (Math.random() - 0.5) * 0.05;
    let hitY = (Math.random() - 0.5) * 0.05;

    if (e.point && boardGroupRef.current) {
      const local = boardGroupRef.current.worldToLocal(e.point.clone());
      const dist = Math.hypot(local.x, local.y);
      if (dist < 0.45) {
        hitX = local.x;
        hitY = local.y;
      }
    }

    const newDart: Dart = {
      id: Date.now(),
      offsetY: hitY,
      offsetZ: hitX,
      rotationZ: (Math.random() - 0.5) * 0.35,
    };

    setDarts((prev) => [...prev.slice(-4), newDart]);
    decrementDarts();
    setShowHitBadge(true);

    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = setTimeout(() => {
      setShowHitBadge(false);
    }, 1800);
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleDartboardClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (typeof document !== 'undefined') document.body.style.cursor = 'crosshair';
      }}
      onPointerOut={() => {
        if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Outer Dark Teak / Walnut Rim Cabinet */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.045, 36]} />
        <meshStandardMaterial color="#2B1810" roughness={0.5} />
      </mesh>

      {/* 2. Authentic High-Contrast Tournament Face Disc */}
      <mesh position={[0, 0, 0.024]}>
        <circleGeometry args={[0.455, 48]} />
        <meshStandardMaterial
          map={dartboardTexture}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* 3. Outer Metal Wire Protective Ring */}
      <mesh position={[0, 0, 0.026]}>
        <ringGeometry args={[0.453, 0.459, 48]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 4. Embedded Darts with Brass Barrels & Red Flights */}
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

      {/* 5. Celebratory Hit Badge on Click */}
      {showHitBadge && (
        <Html position={[0, 0.55, 0.08]} center pointerEvents="none">
          <div className="bg-amber-500/95 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/50 border border-amber-300 animate-bounce whitespace-nowrap select-none">
            🎯 Bullseye! +50
          </div>
        </Html>
      )}
    </group>
  );
}
