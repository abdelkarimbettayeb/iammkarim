'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface EamesChairProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function EamesChair({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: EamesChairProps) {
  // Smooth contoured backrest geometry using Shape
  const backrestGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Start at bottom waist of backrest
    shape.moveTo(-0.24, 0);
    // Left waist up to shoulder
    shape.bezierCurveTo(-0.26, 0.2, -0.28, 0.35, -0.25, 0.48);
    // Rounded top edge
    shape.bezierCurveTo(-0.2, 0.56, 0.2, 0.56, 0.25, 0.48);
    // Right shoulder down to waist
    shape.bezierCurveTo(0.28, 0.35, 0.26, 0.2, 0.24, 0);
    // Bottom scoop curve
    shape.bezierCurveTo(0.15, -0.04, -0.15, -0.04, -0.24, 0);

    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: 0.024,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 4,
    });
    extrude.center();
    return extrude;
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, 0.1, 0]}>
        {/* =========================================
            1. Molded White Scoop Seat & Back
           ========================================= */}
        {/* Contoured Seat Pan (Dish indentation) */}
        <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.34, 0.32, 0.038, 32]} />
          <meshStandardMaterial
            color="#FAF5EE"
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>
        <mesh position={[0, 0.64, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.02, 12, 32]} />
          <meshStandardMaterial color="#FAF5EE" roughness={0.35} />
        </mesh>

        {/* Ergonomic Curved Backrest Scoop */}
        <mesh
          geometry={backrestGeometry}
          position={[0, 0.88, -0.22]}
          rotation={[0.18, 0, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#FAF5EE"
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>

        {/* =========================================
            2. Black Metal Eiffel Tower Wire Lattice
           ========================================= */}
        {/* Center Metal Mounting Hub */}
        <mesh position={[0, 0.58, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
          <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Diagonal Eiffel Wire Struts */}
        {[
          [-0.18, 0.45, -0.16, 0.18, 0.58, 0.16],
          [0.18, 0.45, -0.16, -0.18, 0.58, 0.16],
          [-0.18, 0.45, 0.16, 0.18, 0.58, -0.16],
          [0.18, 0.45, 0.16, -0.18, 0.58, -0.16],
        ].map(([x1, y1, z1, x2, y2, z2], i) => {
          const v1 = new THREE.Vector3(x1, y1, z1);
          const v2 = new THREE.Vector3(x2, y2, z2);
          const dist = v1.distanceTo(v2);
          const mid = v1.clone().add(v2).multiplyScalar(0.5);
          return (
            <mesh
              key={`diag-${i}`}
              position={[mid.x, mid.y, mid.z]}
              rotation={[
                Math.atan2(z2 - z1, y2 - y1),
                0,
                -Math.atan2(x2 - x1, y2 - y1),
              ]}
              castShadow
            >
              <cylinderGeometry args={[0.0035, 0.0035, dist, 8]} />
              <meshStandardMaterial color="#1E2024" roughness={0.3} metalness={0.85} />
            </mesh>
          );
        })}

        {/* Horizontal Eiffel Cross-Wire Ring */}
        <mesh position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.004, 8, 24]} />
          <meshStandardMaterial color="#1E2024" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* =========================================
            3. 4 Splayed Wooden Dowel Legs
           ========================================= */}
        {[
          [-0.18, 0.28, -0.16, 0.2, -0.2],
          [0.18, 0.28, -0.16, 0.2, 0.2],
          [-0.18, 0.28, 0.16, -0.2, -0.2],
          [0.18, 0.28, 0.16, -0.2, 0.2],
        ].map(([lx, ly, lz, rx, rz], i) => (
          <group key={i} position={[lx, ly, lz]} rotation={[rx, 0, rz]}>
            {/* Wooden Dowel Leg */}
            <mesh castShadow>
              <cylinderGeometry args={[0.019, 0.013, 0.62, 14]} />
              <meshStandardMaterial color="#854D0E" roughness={0.55} />
            </mesh>
            {/* Black Rubber Glide Foot at Bottom */}
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.014, 0.016, 0.024, 12]} />
              <meshStandardMaterial color="#111827" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
