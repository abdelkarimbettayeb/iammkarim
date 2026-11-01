'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MustardArmchairProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function MustardArmchair({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: MustardArmchairProps) {
  const bounceRef = useRef(0);
  const chairGroup = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (bounceRef.current > 0) {
      bounceRef.current = Math.max(0, bounceRef.current - delta * 4.2);
      if (chairGroup.current) {
        const squash = Math.sin(bounceRef.current * 25) * 0.05 * bounceRef.current;
        chairGroup.current.scale.set(
          scale * (1 + squash * 0.4),
          scale * (1 - squash),
          scale * (1 + squash * 0.4)
        );
      }
    }
  });

  const handleChairClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    bounceRef.current = 1;
  };

  return (
    <group
      ref={chairGroup}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleChairClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
      }}
    >
      <group position={[0, 0.35, 0]}>
        {/* =========================================
            1. Wraparound Tub Backrest & Arms
           ========================================= */}
        {/* Solid continuous curved back shell */}
        <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
          <cylinderGeometry
            args={[0.54, 0.46, 0.64, 36, 1, false, -Math.PI * 0.38, Math.PI * 1.76]}
          />
          <meshStandardMaterial
            color="#E5A800"
            roughness={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Soft Padded Top Rolled Rim along Backrest & Arms */}
        <mesh position={[0, 0.69, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.53, 0.045, 14, 36, Math.PI * 1.76]} />
          <meshStandardMaterial color="#EAB308" roughness={0.6} />
        </mesh>

        {/* Inner Backrest Cushion (Tufted/padded inner surface) */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry
            args={[0.48, 0.42, 0.54, 32, 1, false, -Math.PI * 0.32, Math.PI * 1.64]}
          />
          <meshStandardMaterial color="#F0B505" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>

        {/* =========================================
            2. Plump Seat Cushion
           ========================================= */}
        <mesh position={[0, 0.18, 0.04]} castShadow receiveShadow>
          <cylinderGeometry args={[0.44, 0.42, 0.22, 32]} />
          <meshStandardMaterial color="#EAB308" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.28, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.41, 0.035, 12, 32]} />
          <meshStandardMaterial color="#F0B505" roughness={0.55} />
        </mesh>

        {/* =========================================
            3. Under-Seat Base & 4 Splayed Wooden Legs
           ========================================= */}
        {/* Under-Seat Wooden Swivel Mounting Plate */}
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.04, 24]} />
          <meshStandardMaterial color="#3E1A0A" roughness={0.6} />
        </mesh>

        {/* 4 Mid-Century Tapered Light Oak Legs (Splayed Outward) */}
        {[
          [-0.24, -0.16, -0.22, 0.22, -0.22],
          [0.24, -0.16, -0.22, 0.22, 0.22],
          [-0.24, -0.16, 0.22, -0.22, -0.22],
          [0.24, -0.16, 0.22, -0.22, 0.22],
        ].map(([lx, ly, lz, rx, rz], i) => (
          <group key={i} position={[lx, ly, lz]} rotation={[rx, 0, rz]}>
            {/* Round Tapered Oak Leg */}
            <mesh castShadow>
              <cylinderGeometry args={[0.026, 0.016, 0.44, 16]} />
              <meshStandardMaterial color="#D97706" roughness={0.55} />
            </mesh>
            {/* Polished Brass Ferrule Tip */}
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.017, 0.015, 0.05, 14]} />
              <meshStandardMaterial color="#EAB308" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
