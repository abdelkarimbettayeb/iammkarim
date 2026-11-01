'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface WelcomeMatSneakersProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

function createWelcomeMatTexture(): THREE.CanvasTexture {
  if (typeof window === 'undefined') {
    return new THREE.Texture() as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background: Light Heather Gray Felt Rug
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle felt texture
  ctx.fillStyle = '#D1D5DB';
  for (let i = 0; i < 3000; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 512;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Rounded Border
  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.roundRect(36, 36, 952, 440, 100);
  ctx.stroke();

  // "Welcome!" Debossed Script
  ctx.font = 'italic bold 100px "Georgia", "Times New Roman", serif';
  ctx.fillStyle = '#374151';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Welcome!', 512, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function WelcomeMatSneakers({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: WelcomeMatSneakersProps) {
  const matTexture = useMemo(() => createWelcomeMatTexture(), []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 1. Rounded "Welcome!" Entrance Mat */}
      {/* Base cushion pad */}
      <mesh position={[-0.2, 0.008, 0]} receiveShadow>
        <boxGeometry args={[1.36, 0.016, 0.74]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.9} />
      </mesh>
      {/* Printed Carpet Face */}
      <mesh
        position={[-0.2, 0.017, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[1.34, 0.72]} />
        <meshStandardMaterial
          map={matTexture}
          roughness={0.9}
          metalness={0.02}
        />
      </mesh>

      {/* 2. Pair of Sleek Low-Top Retro Sneakers */}
      {[0.64, 0.88].map((xShoe, idx) => (
        <group
          key={idx}
          position={[xShoe, 0, 0.02]}
          rotation={[0, idx === 0 ? -0.06 : 0.06, 0]}
        >
          {/* White Rubber Outsole */}
          <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.13, 0.038, 0.35]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
          {/* Rounded Front Toe Cap */}
          <mesh position={[0, 0.028, 0.16]} castShadow>
            <cylinderGeometry
              args={[0.065, 0.065, 0.036, 16, 1, false, 0, Math.PI]}
            />
            <meshStandardMaterial color="#F1F5F9" roughness={0.3} />
          </mesh>

          {/* Main Leather Shoe Upper Body */}
          <mesh position={[0, 0.058, 0]} castShadow>
            <boxGeometry args={[0.12, 0.058, 0.32]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.45} />
          </mesh>

          {/* Heel Collar */}
          <mesh position={[0, 0.09, -0.1]} castShadow>
            <boxGeometry args={[0.118, 0.045, 0.12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>

          {/* Dark Foot Opening / Cavity */}
          <mesh position={[0, 0.114, -0.07]}>
            <boxGeometry args={[0.078, 0.002, 0.09]} />
            <meshStandardMaterial color="#1E293B" roughness={0.8} />
          </mesh>

          {/* Angled Padded Tongue */}
          <mesh
            position={[0, 0.1, 0.02]}
            rotation={[0.26, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.078, 0.02, 0.11]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
          </mesh>

          {/* Retro Cyan/Blue Heel Tab */}
          <mesh position={[0, 0.088, -0.162]} castShadow>
            <boxGeometry args={[0.08, 0.032, 0.012]} />
            <meshStandardMaterial color="#0284C7" roughness={0.3} metalness={0.1} />
          </mesh>

          {/* Retro Blue Side Accent Stripes */}
          <mesh position={[0.061, 0.055, 0.01]}>
            <boxGeometry args={[0.004, 0.018, 0.14]} />
            <meshStandardMaterial color="#0284C7" roughness={0.3} />
          </mesh>
          <mesh position={[-0.061, 0.055, 0.01]}>
            <boxGeometry args={[0.004, 0.018, 0.14]} />
            <meshStandardMaterial color="#0284C7" roughness={0.3} />
          </mesh>

          {/* Criss-Cross White Shoelaces */}
          {[-0.01, 0.02, 0.05, 0.08].map((laceZ, lIdx) => (
            <mesh key={lIdx} position={[0, 0.09 + lIdx * 0.006, laceZ]}>
              <boxGeometry args={[0.072, 0.004, 0.009]} />
              <meshStandardMaterial color="#FAF5EE" roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
