'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';
import { exploreStore } from '@/store/exploreStore';

interface VintageMailboxProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Creates the classic American tunnel arch cross-section shape
 * (flat base, vertical walls, semicircular dome top).
 */
function createMailboxShape(width: number, wallHeight: number): THREE.Shape {
  const shape = new THREE.Shape();
  const radius = width / 2;

  // Start bottom-left
  shape.moveTo(-radius, 0);
  // Bottom edge
  shape.lineTo(radius, 0);
  // Right vertical wall
  shape.lineTo(radius, wallHeight);
  // Semicircular dome top from right to left
  shape.absarc(0, wallHeight, radius, 0, Math.PI, false);
  // Left vertical wall down
  shape.lineTo(-radius, 0);

  return shape;
}

/**
 * Procedural brass nameplate texture: "42 • BETTAYEB"
 */
function createNameplateTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Brushed Brass Background
    const grad = ctx.createLinearGradient(0, 0, 512, 128);
    grad.addColorStop(0, '#B45309');
    grad.addColorStop(0.5, '#F59E0B');
    grad.addColorStop(1, '#92400E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 128);

    // Dark inset bevel border
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    // Brass screw rivets in 4 corners
    ctx.fillStyle = '#451A03';
    [[20, 20], [492, 20], [20, 108], [492, 108]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Embossed Postal Address Typography
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📮  42 • BETTAYEB', 256, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export function VintageMailbox({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: VintageMailboxProps) {
  const [hovered, setHovered] = useState(false);
  const isContactOpen = useRoomStore((state) => state.isContactOpen);
  const toggleContact = useRoomStore((state) => state.toggleContact);

  const doorRef = useRef<THREE.Group>(null);
  const flagRef = useRef<THREE.Group>(null);

  // Proportions for authentic USPS Curbside Mailbox
  const boxW = 0.36;
  const wallH = 0.18;
  const boxL = 0.62;

  const mailboxOuterGeo = useMemo(() => {
    const shape = createMailboxShape(boxW, wallH);
    return new THREE.ExtrudeGeometry(shape, {
      depth: boxL,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 4,
    });
  }, [boxW, wallH, boxL]);

  const mailboxDoorGeo = useMemo(() => {
    const shape = createMailboxShape(boxW - 0.012, wallH - 0.006);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 3,
    });
  }, [boxW, wallH]);

  const nameplateTex = useMemo(() => createNameplateTexture(), []);

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        exploreStore.setHover(null);
    };
  }, []);

  useFrame((_, delta) => {
    // Smooth magnetic door hinge open/close
    if (doorRef.current) {
      const targetDoorRot = isContactOpen || hovered ? Math.PI * 0.48 : 0;
      doorRef.current.rotation.x = THREE.MathUtils.lerp(
        doorRef.current.rotation.x,
        targetDoorRot,
        Math.min(delta * 9, 1)
      );
    }

    // Smooth flag raise animation
    if (flagRef.current) {
      const targetFlagRot = isContactOpen || hovered ? -Math.PI * 0.5 : 0;
      flagRef.current.rotation.z = THREE.MathUtils.lerp(
        flagRef.current.rotation.z,
        targetFlagRot,
        Math.min(delta * 12, 1)
      );
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playSound('chime');
    toggleContact();
    exploreStore.discover('mailbox');
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        exploreStore.setHover({ title: 'Mailbox', action: 'Send me a message' });
      }}
      onPointerOut={() => {
        setHovered(false);
        if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        exploreStore.setHover(null);
      }}
    >
      {/* ========================================================
          1. FOUNDATION & WOODEN POST (Rich Cedar Wood)
          ======================================================== */}
      {/* Beveled Concrete Footing in Lawn */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.08, 16]} />
        <meshStandardMaterial color="#64748B" roughness={0.9} />
      </mesh>
      {/* Heavy Steel Post Anchor Collar */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.15, 0.06, 0.15]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Main Square Wooden Post (Rich Stained Cedar) */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.11, 1.15, 0.11]} />
        <meshStandardMaterial color="#78350F" roughness={0.7} />
      </mesh>

      {/* Decorative Beveled Wooden Top Cap */}
      <mesh position={[0, 1.24, 0]} castShadow>
        <boxGeometry args={[0.16, 0.04, 0.16]} />
        <meshStandardMaterial color="#92400E" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.28, 0]} castShadow>
        <boxGeometry args={[0.12, 0.04, 0.12]} />
        <meshStandardMaterial color="#92400E" roughness={0.6} />
      </mesh>

      {/* Cantilever Mailbox Platform Bed */}
      <mesh position={[0, 1.28, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.04, 0.58]} />
        <meshStandardMaterial color="#78350F" roughness={0.65} />
      </mesh>

      {/* 45-Degree Wooden Diagonal Support Strut (Front-braced) */}
      <group position={[0, 0.96, 0.18]} rotation={[0.62, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.07, 0.44, 0.07]} />
          <meshStandardMaterial color="#78350F" roughness={0.7} />
        </mesh>
        {/* Metallic Joining Bolts */}
        <mesh position={[0, 0.16, 0.04]}>
          <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ========================================================
          2. SEAMLESS TUNNEL ARCH MAILBOX BODY
          ======================================================== */}
      {/* Powder-Coated Dark Metal Tunnel Shell (Zero Gaps) */}
      <mesh
        geometry={mailboxOuterGeo}
        position={[0, 1.3, -0.06]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#0F172A"
          roughness={0.35}
          metalness={0.7}
        />
      </mesh>

      {/* Back Rear Sealed Faceplate */}
      <mesh position={[0, 1.42, -0.065]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[boxW, wallH + boxW / 2]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Side Brass Nameplate: "42 • BETTAYEB" */}
      <mesh position={[boxW / 2 + 0.016, 1.4, 0.24]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.34, 0.085]} />
        <meshStandardMaterial map={nameplateTex} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Top Roof Spring Latch Clip (Brass catch) */}
      <mesh position={[0, 1.3 + wallH + boxW / 2 + 0.015, 0.54]} castShadow>
        <boxGeometry args={[0.06, 0.025, 0.04]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ========================================================
          3. HINGED FRONT ARCH DOOR & PULL HANDLE
          ======================================================== */}
      {/* Pivot Hinge Group located along bottom edge of opening */}
      <group ref={doorRef} position={[0, 1.3, 0.56]}>
        {/* Door Arched Extrusion */}
        <mesh geometry={mailboxDoorGeo} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial
            color="#1E293B"
            roughness={0.3}
            metalness={0.65}
          />
        </mesh>

        {/* Polished Brass Pull Handle Bar */}
        <mesh position={[0, wallH + 0.04, 0.03]} castShadow>
          <boxGeometry args={[0.11, 0.022, 0.024]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.92} roughness={0.15} />
        </mesh>

        {/* Heavy-Duty Bottom Cylinder Hinge Bar */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.014, 0.014, boxW - 0.04, 12]} />
          <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* ========================================================
          4. INTERIOR LETTERS / MAIL CONTENT (Peeking Inside)
          ======================================================== */}
      <group position={[0.02, 1.33, 0.42]} rotation={[-0.1, 0.12, 0.05]}>
        {/* White Sealed Envelope 1 */}
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.012, 0.15]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
        </mesh>
        {/* Red Wax Seal */}
        <mesh position={[0, 0.008, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.006, 12]} />
          <meshStandardMaterial color="#DC2626" roughness={0.3} />
        </mesh>
        {/* Blue Air Mail Envelope 2 */}
        <mesh position={[-0.04, -0.015, -0.08]} rotation={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.2, 0.01, 0.14]} />
          <meshStandardMaterial color="#E0F2FE" roughness={0.4} />
        </mesh>
      </group>

      {/* ========================================================
          5. ARTICULATED RED POSTAL FLAG (Side-Mounted)
          ======================================================== */}
      <group
        ref={flagRef}
        position={[-boxW / 2 - 0.016, 1.38, 0.16]}
      >
        {/* Brass Mounting Pivot Pin */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.016, 0.016, 0.03, 12]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Metallic Flag Arm */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.008, 0.25, 0.018]} />
          <meshStandardMaterial color="#EF4444" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Distinctive Red Flag Blade */}
        <mesh position={[0, 0.21, 0.04]} castShadow>
          <boxGeometry args={[0.008, 0.08, 0.1]} />
          <meshStandardMaterial color="#EF4444" roughness={0.25} metalness={0.1} />
        </mesh>
      </group>

    </group>
  );
}
