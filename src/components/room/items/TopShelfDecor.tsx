'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { roomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';

/**
 * Makes a shelf item clickable: it lifts a touch on hover and wobbles on a
 * damped spring when clicked, like nudging a real pot or frame.
 */
function ShelfItem({
  position,
  onActivate,
  children,
}: {
  position: [number, number, number];
  onActivate?: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const wobble = useRef({ angle: 0, vel: 0, lift: 0, hover: false });

  useFrame((_, delta) => {
    const w = wobble.current;
    const dt = Math.min(delta, 0.05);
    // Damped spring back to rest
    w.vel += (-w.angle * 120 - w.vel * 7) * dt;
    w.angle += w.vel * dt;
    w.lift = THREE.MathUtils.damp(w.lift, w.hover ? 0.03 : 0, 12, dt);
    if (ref.current) {
      ref.current.rotation.z = w.angle;
      ref.current.rotation.x = w.angle * 0.5;
      ref.current.position.y = position[1] + w.lift;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        wobble.current.vel += 2.6;
        onActivate?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        wobble.current.hover = true;
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        wobble.current.hover = false;
        document.body.style.cursor = 'auto';
      }}
    >
      {children}
    </group>
  );
}

/** The framed portrait opens the full resume */
const openResume = () => {
  playSound('cartridge');
  if (!roomStore.getState().isDrawerOpen) roomStore.toggleDrawer();
};
const rustle = () => playSound('chime');

interface TopShelfDecorProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Procedural canvas texture for the framed portrait photograph
 */
function createPortraitTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Elegant deep navy gradient studio background
    const bgGrad = ctx.createLinearGradient(0, 0, 256, 340);
    bgGrad.addColorStop(0, '#1E3A8A');
    bgGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 256, 340);

    // Warm studio spotlight vignette
    const spot = ctx.createRadialGradient(128, 140, 10, 128, 140, 140);
    spot.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    spot.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, 256, 340);

    // Shoulders / Torso (Crisp white collared shirt & dark jacket)
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.ellipse(128, 310, 85, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // White shirt collar
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.moveTo(100, 260);
    ctx.lineTo(128, 290);
    ctx.lineTo(156, 260);
    ctx.lineTo(142, 245);
    ctx.lineTo(114, 245);
    ctx.closePath();
    ctx.fill();

    // Neck
    ctx.fillStyle = '#FDBA74';
    ctx.fillRect(116, 215, 24, 35);

    // Face Oval
    ctx.fillStyle = '#FDBA74';
    ctx.beginPath();
    ctx.ellipse(128, 165, 38, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Friendly Smile
    ctx.strokeStyle = '#9A3412';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(128, 175, 14, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(114, 155, 4, 0, Math.PI * 2);
    ctx.arc(142, 155, 4, 0, Math.PI * 2);
    ctx.fill();

    // Voluminous Curly Dark Hair
    ctx.fillStyle = '#1C1917';
    const curls = [
      [128, 115, 32],
      [105, 122, 26],
      [151, 122, 26],
      [88, 140, 22],
      [168, 140, 22],
      [85, 165, 18],
      [171, 165, 18],
      [118, 102, 22],
      [138, 102, 22],
    ];
    curls.forEach(([cx, cy, cr]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    });

    // White photo matte border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 246, 330);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function TopShelfDecor({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: TopShelfDecorProps) {
  const portraitTexture = useMemo(() => createPortraitTexture(), []);

  // Generate a lush cascading Boston fern frond set with graceful downward arches
  const fernFronds = useMemo(() => {
    const fronds = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.12;
      const tier = i % 3; // 0 = inner fountain, 1 = mid arch, 2 = low cascade
      let initialUp: number;
      let droopDown: number;
      let len1: number;
      let len2: number;

      if (tier === 0) {
        initialUp = 0.6; // arch slightly up from soil
        droopDown = -0.85; // curve gracefully over
        len1 = 0.22;
        len2 = 0.24;
      } else if (tier === 1) {
        initialUp = 0.35;
        droopDown = -1.15; // cascade outward
        len1 = 0.28;
        len2 = 0.32;
      } else {
        initialUp = 0.15;
        droopDown = -1.45; // steep downward spill over pot rim
        len1 = 0.32;
        len2 = 0.38;
      }

      fronds.push({
        rotY: angle,
        initialUp,
        droopDown,
        len1,
        len2,
        color: i % 2 === 0 ? '#16A34A' : i % 3 === 0 ? '#15803D' : '#22C55E',
      });
    }
    return fronds;
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* =========================================
          1. Teak Floating Shelf Plank & Support Brackets
         ========================================= */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.08, 4.4]} />
        <meshStandardMaterial color="#CF6B2C" roughness={0.48} />
      </mesh>

      {/* Metal Wall Support Brackets */}
      {[-1.6, 1.6].map((zPos, idx) => (
        <group key={idx} position={[-0.14, -0.18, zPos]}>
          <mesh position={[-0.1, 0, 0]}>
            <boxGeometry args={[0.035, 0.35, 0.05]} />
            <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0.08, 0.14, 0]}>
            <boxGeometry args={[0.32, 0.035, 0.05]} />
            <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* =========================================
          2. Framed Portrait Photo (Center Shelf)
         ========================================= */}
      <ShelfItem position={[0.04, 0.04, 0.05]} onActivate={openResume}>
      <group position={[0, 0.4, 0]} rotation={[0, 0.18, -0.06]}>
        {/* Dark Walnut Picture Frame */}
        <mesh castShadow>
          <boxGeometry args={[0.04, 0.78, 0.6]} />
          <meshStandardMaterial color="#1C1917" roughness={0.5} />
        </mesh>
        {/* Framed Canvas Photo Art */}
        <mesh position={[0.022, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.52, 0.7]} />
          <meshStandardMaterial map={portraitTexture} roughness={0.2} />
        </mesh>
        {/* Rear easel prop */}
        <mesh position={[-0.08, -0.18, 0]} rotation={[0, 0, 0.28]}>
          <boxGeometry args={[0.02, 0.38, 0.06]} />
          <meshStandardMaterial color="#292524" roughness={0.7} />
        </mesh>
      </group>
      </ShelfItem>

      {/* =========================================
          3. Small Middle Houseplant (Spade Leaves)
         ========================================= */}
      <ShelfItem position={[0.04, 0.04, 0.72]} onActivate={rustle}>
        {/* Two-Tone Ceramic Pot: Charcoal Lower Base */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.115, 0.12, 24]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} />
        </mesh>
        {/* Two-Tone Ceramic Pot: Glazed White Upper Body */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.13, 0.16, 24]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.25} />
        </mesh>
        {/* Soil Bed */}
        <mesh position={[0, 0.278, 0]}>
          <cylinderGeometry args={[0.146, 0.146, 0.015, 20]} />
          <meshStandardMaterial color="#291811" roughness={0.9} />
        </mesh>
        {/* Broad Upright Spade Leaves */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const rotY = (i / 8) * Math.PI * 2;
          return (
            <group key={i} position={[0, 0.28, 0]} rotation={[0, rotY, 0.72]}>
              <mesh position={[0.12, 0, 0]} castShadow>
                <boxGeometry args={[0.24, 0.012, 0.09]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? '#15803D' : '#16A34A'}
                  roughness={0.4}
                />
              </mesh>
            </group>
          );
        })}
      </ShelfItem>

      {/* =========================================
          4. Lush Cascading Boston Fern (Right Shelf)
         ========================================= */}
      <ShelfItem position={[0.04, 0.04, 1.52]} onActivate={rustle}>
        {/* Two-Tone Ceramic Pot: Charcoal Lower Base */}
        <mesh position={[0, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.165, 0.145, 0.14, 24]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} />
        </mesh>
        {/* Two-Tone Ceramic Pot: Glazed White Upper Body */}
        <mesh position={[0, 0.23, 0]} castShadow>
          <cylinderGeometry args={[0.19, 0.165, 0.18, 24]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.25} />
        </mesh>
        {/* Soil Bed */}
        <mesh position={[0, 0.31, 0]}>
          <cylinderGeometry args={[0.175, 0.175, 0.02, 20]} />
          <meshStandardMaterial color="#291811" roughness={0.9} />
        </mesh>

        {/* 36 Cascading Arched Fern Fronds with Natural Spill */}
        {fernFronds.map((frond, idx) => (
          <group
            key={idx}
            position={[0, 0.315, 0]}
            rotation={[0, frond.rotY, 0]}
          >
            {/* Initial Arch Emerging Out of Soil */}
            <group rotation={[0, 0, frond.initialUp]}>
              <mesh position={[frond.len1 * 0.5, 0, 0]} castShadow>
                <boxGeometry args={[frond.len1, 0.008, 0.05]} />
                <meshStandardMaterial color={frond.color} roughness={0.45} />
              </mesh>
              {/* Drooping Cascade Section Falling Down Over Pot Rim */}
              <group position={[frond.len1, 0, 0]} rotation={[0, 0, frond.droopDown]}>
                <mesh position={[frond.len2 * 0.5, 0, 0]} castShadow>
                  <boxGeometry args={[frond.len2, 0.006, 0.042]} />
                  <meshStandardMaterial color={frond.color} roughness={0.45} />
                </mesh>
              </group>
            </group>
          </group>
        ))}
      </ShelfItem>
    </group>
  );
}
