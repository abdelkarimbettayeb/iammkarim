'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VintageMailbox } from './VintageMailbox';

export function ForegroundLounge() {
  // Proportional foreground placement matching reference photo
  const chairX = -0.15;
  const chairZ = 1.35;

  // Armchair bounce spring ref (no state re-renders in useFrame)
  const bounceRef = useRef(0);
  const chairGroup = useRef<THREE.Group>(null);

  // Cactus wobble ref
  const cactusWobbleRef = useRef(0);
  const cactusRef = useRef<THREE.Group>(null);

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
    };
  }, []);

  useFrame((_, delta) => {
    // Cushion bounce decaying spring
    if (bounceRef.current > 0) {
      bounceRef.current = Math.max(0, bounceRef.current - delta * 4.2);
      if (chairGroup.current) {
        const squash = Math.sin(bounceRef.current * 25) * 0.05 * bounceRef.current;
        chairGroup.current.scale.set(1 + squash * 0.4, 1 - squash, 1 + squash * 0.4);
      }
    }

    // Cactus wobble decaying spring
    if (cactusWobbleRef.current > 0) {
      cactusWobbleRef.current = Math.max(0, cactusWobbleRef.current - delta * 4.5);
      if (cactusRef.current) {
        cactusRef.current.rotation.z = Math.sin(cactusWobbleRef.current * 30) * 0.12 * cactusWobbleRef.current;
      }
    }
  });

  const handleChairClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    bounceRef.current = 1;
  };

  const handleCactusClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    cactusWobbleRef.current = 1;
  };

  return (
    <group name="foreground-lounge">
      {/* =========================================
          1. Vintage Mailbox (Standing tall near entrance)
         ========================================= */}
      <VintageMailbox position={[-2.7, 0, 1.2]} />

      {/* =========================================
          2. Mid-Century Mustard Yellow Tub Armchair
         ========================================= */}
      <group
        ref={chairGroup}
        position={[chairX, 0, chairZ]}
        rotation={[0, -Math.PI / 4.2, 0]}
        onClick={handleChairClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        {/* Plump Rounded Seat Cushion */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.52, 0.48, 0.24, 24]} />
          <meshStandardMaterial color="#EAB308" roughness={0.65} />
        </mesh>

        {/* Curved Wraparound Tub Backrest */}
        <mesh position={[0, 0.72, -0.16]} rotation={[0.15, 0, 0]} castShadow>
          <cylinderGeometry
            args={[0.54, 0.52, 0.56, 24, 1, false, Math.PI * 0.7, Math.PI * 1.6]}
          />
          <meshStandardMaterial color="#EAB308" roughness={0.65} side={THREE.DoubleSide} />
        </mesh>

        {/* Left & Right Curved Arm Cushions */}
        <mesh position={[-0.42, 0.62, 0.05]} castShadow>
          <boxGeometry args={[0.14, 0.28, 0.56]} />
          <meshStandardMaterial color="#EAB308" roughness={0.65} />
        </mesh>
        <mesh position={[0.42, 0.62, 0.05]} castShadow>
          <boxGeometry args={[0.14, 0.28, 0.56]} />
          <meshStandardMaterial color="#EAB308" roughness={0.65} />
        </mesh>

        {/* 4 Tapered Light Oak Splayed Legs */}
        {[
          [-0.32, 0.18, -0.28, 0.16, -0.16],
          [0.32, 0.18, -0.28, 0.16, 0.16],
          [-0.32, 0.18, 0.28, -0.16, -0.16],
          [0.32, 0.18, 0.28, -0.16, 0.16],
        ].map(([lx, ly, lz, rx, rz], i) => (
          <mesh key={i} position={[lx, ly, lz]} rotation={[rx, 0, rz]} castShadow>
            <cylinderGeometry args={[0.024, 0.015, 0.38, 12]} />
            <meshStandardMaterial color="#D97706" roughness={0.55} />
          </mesh>
        ))}
      </group>

      {/* =========================================
          3. Low Round Coffee Table
         ========================================= */}
      <group position={[-1.15, 0, 1.45]}>
        {/* Table Top Disc */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.46, 0.46, 0.035, 32]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.25} />
        </mesh>

        {/* 3 Wooden Tapered Legs (Tri-pod layout) */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => {
          const legRadius = 0.32;
          const x = Math.sin(angle) * legRadius;
          const z = Math.cos(angle) * legRadius;
          return (
            <mesh
              key={i}
              position={[x, 0.16, z]}
              rotation={[Math.sin(angle) * 0.14, 0, Math.cos(angle) * 0.14]}
              castShadow
            >
              <cylinderGeometry args={[0.018, 0.013, 0.34, 10]} />
              <meshStandardMaterial color="#D97706" roughness={0.55} />
            </mesh>
          );
        })}
      </group>

      {/* =========================================
          4. Floor Potted Saguaro Cactus (Beside Chair)
         ========================================= */}
      <group
        ref={cactusRef}
        position={[-1.25, 0, 2.15]}
        onClick={handleCactusClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        {/* Dark Ceramic Pot */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.13, 0.28, 20]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} />
        </mesh>

        {/* Terracotta Pot Base Band */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.145, 0.145, 0.06, 20]} />
          <meshStandardMaterial color="#C2410C" roughness={0.6} />
        </mesh>

        {/* Pot Soil */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.165, 0.165, 0.03, 16]} />
          <meshStandardMaterial color="#382419" roughness={0.9} />
        </mesh>

        {/* Main Saguaro Cactus Stem */}
        <mesh position={[0, 0.58, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.52, 16]} />
          <meshStandardMaterial color="#16A34A" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.84, 0]}>
          <sphereGeometry args={[0.079, 16, 16]} />
          <meshStandardMaterial color="#16A34A" roughness={0.5} />
        </mesh>

        {/* Left Cactus Arm */}
        <group position={[-0.1, 0.6, 0]}>
          <mesh position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.12, 12]} />
            <meshStandardMaterial color="#16A34A" roughness={0.5} />
          </mesh>
          <mesh position={[-0.11, 0.08, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.16, 12]} />
            <meshStandardMaterial color="#16A34A" roughness={0.5} />
          </mesh>
          <mesh position={[-0.11, 0.16, 0]}>
            <sphereGeometry args={[0.044, 12, 12]} />
            <meshStandardMaterial color="#16A34A" roughness={0.5} />
          </mesh>
        </group>

        {/* Right Cactus Arm */}
        <group position={[0.1, 0.66, 0]}>
          <mesh position={[0.05, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.11, 12]} />
            <meshStandardMaterial color="#16A34A" roughness={0.5} />
          </mesh>
          <mesh position={[0.11, 0.09, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.18, 12]} />
            <meshStandardMaterial color="#16A34A" roughness={0.5} />
          </mesh>
          <mesh position={[0.11, 0.18, 0]}>
            <sphereGeometry args={[0.044, 12, 12]} />
            <meshStandardMaterial color="#16A34A" roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
