'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';

interface VintageMailboxProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Creates the continuous extruded American tunnel mailbox shape
 */
function createMailboxShape(width: number, wallHeight: number, domeRadius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const halfW = width / 2;

  // Start bottom left
  shape.moveTo(-halfW, 0);
  // Bottom edge
  shape.lineTo(halfW, 0);
  // Right vertical wall
  shape.lineTo(halfW, wallHeight);
  // Semicircular dome top
  shape.absarc(0, wallHeight, domeRadius, 0, Math.PI, false);
  // Left vertical wall
  shape.lineTo(-halfW, 0);

  return shape;
}

export function VintageMailbox({
  position = [-2.7, 0, 1.2],
  rotation = [0, 0, 0],
}: VintageMailboxProps) {
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
      const targetDoorRot = isContactOpen ? Math.PI / 2.2 : 0;
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

  const mailboxShape = useMemo(() => createMailboxShape(0.32, 0.14, 0.16), []);
  const doorShape = useMemo(() => createMailboxShape(0.31, 0.135, 0.155), []);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.52,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    }),
    []
  );

  const doorExtrudeSettings = useMemo(
    () => ({
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.005,
      bevelThickness: 0.005,
    }),
    []
  );

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
      {/* =========================================
          1. White Wooden Post & Beveled Capital
         ========================================= */}
      {/* Floor Flange Base */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[0.22, 0.06, 0.22]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.35} />
      </mesh>

      {/* Main Square Post */}
      <mesh position={[0, 0.58, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.11, 1.1, 0.11]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.35} />
      </mesh>

      {/* Decorative Beveled Cap */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.18, 0.04, 0.18]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.19, 0]} castShadow>
        <boxGeometry args={[0.13, 0.04, 0.13]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </mesh>

      {/* Horizontal Post Mounting Arm */}
      <mesh position={[0, 1.18, 0.08]} castShadow>
        <boxGeometry args={[0.09, 0.05, 0.36]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.14, 0.02]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.07, 0.04, 0.2]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.35} />
      </mesh>

      {/* =========================================
          2. Continuous Domed American Mailbox Body
         ========================================= */}
      <group position={[0, 1.21, -0.2]}>
        {/* Solid Extruded Tunnel Mailbox */}
        <mesh castShadow receiveShadow>
          <extrudeGeometry args={[mailboxShape, extrudeSettings]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* =========================================
            3. Hinged Front Drop Door Flap
           ========================================= */}
        <group ref={doorRef} position={[0, 0, 0.53]}>
          <mesh castShadow position={[0, 0, 0]}>
            <extrudeGeometry args={[doorShape, doorExtrudeSettings]} />
            <meshStandardMaterial color="#0F172A" roughness={0.35} metalness={0.65} />
          </mesh>
          {/* Polished Brass Pull Handle */}
          <mesh position={[0, 0.24, 0.03]} castShadow>
            <boxGeometry args={[0.08, 0.016, 0.02]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* Brass Latch Catch */}
          <mesh position={[0, 0.28, 0.02]}>
            <boxGeometry args={[0.03, 0.02, 0.015]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>

        {/* =========================================
            4. Red Postal Flag (Pivoting on Side)
           ========================================= */}
        <group ref={flagRef} position={[0.165, 0.12, 0.38]}>
          {/* Brass Pivot Bolt */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.014, 0.014, 0.02, 16]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.3} />
          </mesh>

          {/* Red Flag Arm */}
          <mesh position={[0.008, 0.1, 0]}>
            <boxGeometry args={[0.006, 0.22, 0.018]} />
            <meshStandardMaterial color="#DC2626" roughness={0.4} />
          </mesh>

          {/* Red Flag Blade */}
          <mesh position={[0.008, 0.18, -0.04]}>
            <boxGeometry args={[0.006, 0.08, 0.09]} />
            <meshStandardMaterial color="#DC2626" roughness={0.35} />
          </mesh>
        </group>
      </group>

      {/* =========================================
          5. Hover Tooltip
         ========================================= */}
      {hovered && (
        <Html position={[0, 1.82, 0]} center distanceFactor={7} pointerEvents="none">
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
