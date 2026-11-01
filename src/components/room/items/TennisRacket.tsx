'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface TennisRacketProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isLeaning?: boolean;
}

/**
 * Procedural texture for transparent nylon tennis racket strings
 */
function createTennisStringsTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);

    // Clip strictly to oval hoop interior so no strings poke outside
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(128, 128, 120, 120, 0, 0, Math.PI * 2);
    ctx.clip();

    // Cross-grid strings
    ctx.strokeStyle = 'rgba(240, 248, 255, 0.45)';
    ctx.lineWidth = 1.5;

    const spacing = 16;
    for (let x = spacing; x < 256; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = spacing; y < 256; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Classic red stencil "W" logo in sweet spot
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.65)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(96, 100);
    ctx.lineTo(112, 150);
    ctx.lineTo(128, 115);
    ctx.lineTo(144, 150);
    ctx.lineTo(160, 100);
    ctx.stroke();

    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function TennisRacket({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  isLeaning = false,
}: TennisRacketProps) {
  const stringsTexture = useMemo(() => createTennisStringsTexture(), []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Racket Group (Supports leaning against wall) */}
      <group
        position={isLeaning ? [0, 0.2, 0] : [0, 0, 0]}
        rotation={isLeaning ? [-0.28, 0.15, -0.12] : [0, 0, 0]}
      >
        {/* =========================================
            1. Tennis Racket Frame (Oval Hoop & Y-Throat)
           ========================================= */}
        {/* Oval Aerodynamic Racket Head */}
        <group position={[0, 0.62, 0]} scale={[0.82, 1.15, 1]}>
          {/* Graphite Frame Rim */}
          <mesh castShadow receiveShadow>
            <torusGeometry args={[0.26, 0.018, 16, 40]} />
            <meshStandardMaterial color="#0F172A" roughness={0.35} metalness={0.5} />
          </mesh>
          {/* Translucent Cross-String Grid */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial
              map={stringsTexture}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Aerodynamic Y-Throat connecting Head to Handle */}
        <group position={[0, 0.28, 0]}>
          {/* Left Throat Strut */}
          <mesh position={[-0.05, 0.05, 0]} rotation={[0, 0, 0.28]} castShadow>
            <cylinderGeometry args={[0.012, 0.014, 0.16, 12]} />
            <meshStandardMaterial color="#0F172A" roughness={0.35} metalness={0.5} />
          </mesh>
          {/* Right Throat Strut */}
          <mesh position={[0.05, 0.05, 0]} rotation={[0, 0, -0.28]} castShadow>
            <cylinderGeometry args={[0.012, 0.014, 0.16, 12]} />
            <meshStandardMaterial color="#0F172A" roughness={0.35} metalness={0.5} />
          </mesh>
          {/* Throat Bridge Cushion */}
          <mesh position={[0, 0.11, 0]} castShadow>
            <boxGeometry args={[0.13, 0.015, 0.02]} />
            <meshStandardMaterial color="#DC2626" roughness={0.4} />
          </mesh>
        </group>

        {/* =========================================
            2. Racket Handle & Grip Wrap
           ========================================= */}
        <group position={[0, 0.08, 0]}>
          {/* White Cushion Grip Tape */}
          <mesh castShadow>
            <cylinderGeometry args={[0.022, 0.024, 0.34, 16]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.65} />
          </mesh>
          {/* Black Finishing Tape Ring at top of grip */}
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.02, 16]} />
            <meshStandardMaterial color="#0F172A" roughness={0.4} />
          </mesh>
          {/* Flared Octagonal Butt Cap with Red Logo */}
          <mesh position={[0, -0.175, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.028, 0.03, 8]} />
            <meshStandardMaterial color="#DC2626" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* =========================================
          3. Neon Yellow/Green Tennis Ball (Resting on floor)
         ========================================= */}
      <group position={[0.34, 0.065, 0.1]} castShadow>
        {/* Fuzzy Felt Body */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.065, 24, 24]} />
          <meshStandardMaterial color="#CCFF00" roughness={0.88} />
        </mesh>
        {/* Curved White Rubber Seam */}
        <mesh rotation={[0.4, 0.6, 0]}>
          <torusGeometry args={[0.063, 0.003, 8, 32]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
