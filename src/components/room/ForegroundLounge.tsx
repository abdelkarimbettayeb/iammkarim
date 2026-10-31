'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VintageMailbox } from './VintageMailbox';

export function ForegroundLounge() {
  const chairX = -0.35;
  const chairZ = 2.3;

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
      bounceRef.current = Math.max(0, bounceRef.current - delta * 4);
      if (chairGroup.current) {
        const squash = Math.sin(bounceRef.current * 25) * 0.06 * bounceRef.current;
        chairGroup.current.scale.set(1 + squash * 0.5, 1 - squash, 1 + squash * 0.5);
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
          1. Vintage Mailbox
         ========================================= */}
      <VintageMailbox position={[-3.4, 0, 0.6]} />

      {/* =========================================
          2. Mid-Century Mustard Yellow Armchair
         ========================================= */}
      <group
        ref={chairGroup}
        position={[chairX, 0, chairZ]}
        rotation={[0, -Math.PI / 4.4, 0]}
        onClick={handleChairClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        {/* Plump Seat Cushion */}
        <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.26, 0.95]} />
          <meshStandardMaterial color="#EAB308" roughness={0.7} />
        </mesh>

        {/* Curved Backrest Bucket */}
        <mesh position={[0, 0.88, -0.38]} rotation={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[1.05, 0.68, 0.22]} />
          <meshStandardMaterial color="#EAB308" roughness={0.7} />
        </mesh>

        {/* Left Armrest */}
        <mesh position={[-0.48, 0.72, 0]} castShadow>
          <boxGeometry args={[0.18, 0.38, 0.95]} />
          <meshStandardMaterial color="#EAB308" roughness={0.7} />
        </mesh>

        {/* Right Armrest */}
        <mesh position={[0.48, 0.72, 0]} castShadow>
          <boxGeometry args={[0.18, 0.38, 0.95]} />
          <meshStandardMaterial color="#EAB308" roughness={0.7} />
        </mesh>

        {/* 4 Tapered Light Oak Legs */}
        {[
          [-0.38, 0.2, -0.35, 0.18, -0.18],
          [0.38, 0.2, -0.35, 0.18, 0.18],
          [-0.38, 0.2, 0.35, -0.18, -0.18],
          [0.38, 0.2, 0.35, -0.18, 0.18],
        ].map(([lx, ly, lz, rx, rz], i) => (
          <mesh key={i} position={[lx, ly, lz]} rotation={[rx, 0, rz]} castShadow>
            <cylinderGeometry args={[0.03, 0.018, 0.44, 12]} />
            <meshStandardMaterial color="#D97706" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* =========================================
          3. Round Coffee Table & Potted Cactus
         ========================================= */}
      <group position={[-1.5, 0, 2.3]}>
        {/* Table Top Disc */}
        <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.04, 32]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.25} />
        </mesh>

        {/* 3 Wooden Dowel Legs (Tri-pod layout) */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => {
          const legRadius = 0.38;
          const x = Math.sin(angle) * legRadius;
          const z = Math.cos(angle) * legRadius;
          return (
            <mesh
              key={i}
              position={[x, 0.18, z]}
              rotation={[Math.sin(angle) * 0.15, 0, Math.cos(angle) * 0.15]}
              castShadow
            >
              <cylinderGeometry args={[0.02, 0.016, 0.38, 10]} />
              <meshStandardMaterial color="#D97706" roughness={0.6} />
            </mesh>
          );
        })}

        {/* Potted Cactus (Click to Wobble) */}
        <group
          ref={cactusRef}
          position={[0, 0.4, 0]}
          onClick={handleCactusClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
          }}
        >
          {/* Ceramic Pot */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.09, 0.18, 20]} />
            <meshStandardMaterial color="#1E293B" roughness={0.4} />
          </mesh>

          {/* Pot Base Band */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.105, 0.105, 0.04, 20]} />
            <meshStandardMaterial color="#C2410C" roughness={0.6} />
          </mesh>

          {/* Soil */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
            <meshStandardMaterial color="#382419" roughness={0.9} />
          </mesh>

          {/* Main Saguaro Stem */}
          <mesh position={[0, 0.36, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.36, 16]} />
            <meshStandardMaterial color="#16A34A" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.54, 0]}>
            <sphereGeometry args={[0.064, 16, 16]} />
            <meshStandardMaterial color="#16A34A" roughness={0.5} />
          </mesh>

          {/* Left Cactus Arm */}
          <group position={[-0.08, 0.38, 0]}>
            <mesh position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 0.09, 12]} />
              <meshStandardMaterial color="#16A34A" roughness={0.5} />
            </mesh>
            <mesh position={[-0.08, 0.06, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.12, 12]} />
              <meshStandardMaterial color="#16A34A" roughness={0.5} />
            </mesh>
          </group>

          {/* Right Cactus Arm */}
          <group position={[0.08, 0.42, 0]}>
            <mesh position={[0.04, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 0.08, 12]} />
              <meshStandardMaterial color="#16A34A" roughness={0.5} />
            </mesh>
            <mesh position={[0.08, 0.07, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.14, 12]} />
              <meshStandardMaterial color="#16A34A" roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

