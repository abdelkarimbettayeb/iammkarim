'use client';

import React from 'react';
import { FoldedPrism3D } from '@/components/cv/FoldedPrism3D';

interface CoffeeTableProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

export function CoffeeTable({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: CoffeeTableProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* =========================================
          1. Tabletop (Beveled Soft Rim Disc + Architectural Prism Inlay)
         ========================================= */}
      <group position={[0, 0.34, 0]}>
        {/* Main Disc Body */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.54, 0.52, 0.036, 40]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.05} />
        </mesh>
        {/* Flush Folded Prism Tabletop Marquetry Inlay */}
        <FoldedPrism3D
          position={[0, 0.0182, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI * 0.22]}
          scale={0.48}
          depth={0.008}
          bevel={0.0015}
          primaryColor="#111113"
          secondaryColor="#475569"
          accentColor="#E0441B"
          metalness={0.38}
          roughness={0.22}
          accentEmissive={0.14}
        />
        {/* Concentric Hairline Brass-Steel Inlay Ring */}
        <mesh position={[0, 0.018, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, 0.0028, 10, 64]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Soft Rounded Perimeter Bevel (Torus Rim) */}
        <mesh position={[0, 0.016, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.536, 0.01, 16, 48]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>
        {/* Tabletop Under-mount Plate */}
        <mesh position={[0, -0.022, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.015, 24]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
        </mesh>
      </group>

      {/* =========================================
          2. 3 Mid-Century Splayed Wooden Tripod Legs
         ========================================= */}
      {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => {
        const legRadius = 0.28;
        const x = Math.sin(angle) * legRadius;
        const z = Math.cos(angle) * legRadius;
        // Splay angles: lean outward radially from center
        const splayAngle = 0.22;
        const rotX = Math.cos(angle) * splayAngle;
        const rotZ = -Math.sin(angle) * splayAngle;

        return (
          <group key={i} position={[x, 0.16, z]}>
            {/* Wooden Leg Mounting Plate */}
            <mesh position={[0, 0.155, 0]} castShadow>
              <boxGeometry args={[0.06, 0.015, 0.06]} />
              <meshStandardMaterial color="#334155" roughness={0.6} />
            </mesh>

            {/* Splayed Round Wooden Tapered Leg */}
            <group rotation={[rotX, 0, rotZ]}>
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.022, 0.014, 0.34, 16]} />
                <meshStandardMaterial color="#CF6B2C" roughness={0.5} />
              </mesh>
              {/* Floor Glide Foot */}
              <mesh position={[0, -0.165, 0]} receiveShadow>
                <sphereGeometry args={[0.014, 12, 12]} />
                <meshStandardMaterial color="#1E293B" roughness={0.4} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}
