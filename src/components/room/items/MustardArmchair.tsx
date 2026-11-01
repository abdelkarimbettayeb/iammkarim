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
        const squash = Math.sin(bounceRef.current * 25) * 0.04 * bounceRef.current;
        chairGroup.current.scale.set(
          scale * (1 + squash * 0.3),
          scale * (1 - squash),
          scale * (1 + squash * 0.3)
        );
      }
    }
  });

  const handleChairClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    bounceRef.current = 1;
  };

  // Materials Palette
  const mustardMain = (
    <meshStandardMaterial
      color="#E5A700"
      roughness={0.68}
      metalness={0.03}
    />
  );
  const mustardPadded = (
    <meshStandardMaterial
      color="#F0B608"
      roughness={0.62}
      metalness={0.03}
    />
  );
  const mustardShadow = (
    <meshStandardMaterial
      color="#BE8200"
      roughness={0.78}
      metalness={0.04}
    />
  );
  const teakWood = (
    <meshStandardMaterial
      color="#803D0D"
      roughness={0.42}
      metalness={0.06}
    />
  );
  const brassFerrule = (
    <meshStandardMaterial
      color="#F59E0B"
      metalness={0.92}
      roughness={0.18}
    />
  );
  const tealVelvet = (
    <meshStandardMaterial
      color="#0284C7"
      roughness={0.7}
      metalness={0.04}
    />
  );
  const creamTextured = (
    <meshStandardMaterial
      color="#F7F1E6"
      roughness={0.82}
      metalness={0.02}
    />
  );

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
      {/* ========================================================
          1. SOLID TEAK WOOD SUB-FRAME & 4 SPLAYED TAPERED LEGS
         ======================================================== */}
      {/* Horizontal Teak Base Rail */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.14, 0.05, 0.66]} />
        {teakWood}
      </mesh>

      {/* Front and Back Beveled Wood Trim Aprons */}
      <mesh position={[0, 0.20, 0.315]} castShadow>
        <boxGeometry args={[1.14, 0.035, 0.03]} />
        {teakWood}
      </mesh>
      <mesh position={[0, 0.20, -0.315]} castShadow>
        <boxGeometry args={[1.14, 0.035, 0.03]} />
        {teakWood}
      </mesh>

      {/* 4 Mid-Century Splayed Tapered Round Legs with Brass Ferrules */}
      {[
        [-0.48, 0.24, 0.16, -0.18],  // Front Left
        [0.48, 0.24, 0.16, 0.18],    // Front Right
        [-0.46, -0.24, -0.18, -0.18], // Back Left
        [0.46, -0.24, -0.18, 0.18],  // Back Right
      ].map(([lx, lz, rx, rz], i) => (
        <group key={i} position={[lx, 0.20, lz]} rotation={[rx, 0, rz]}>
          {/* Tapered Wood Dowel Leg */}
          <mesh position={[0, -0.10, 0]} castShadow>
            <cylinderGeometry args={[0.024, 0.015, 0.22, 16]} />
            {teakWood}
          </mesh>
          {/* Polished Brass Ferrule Foot */}
          <mesh position={[0, -0.19, 0]}>
            <cylinderGeometry args={[0.016, 0.014, 0.045, 14]} />
            {brassFerrule}
          </mesh>
        </group>
      ))}

      {/* ========================================================
          2. UPHOLSTERED BODY SHELL (Back & Armrest Walls)
         ======================================================== */}
      {/* Lower Seat Deck Tray (Cushions sit on this upholstered deck) */}
      <mesh position={[0, 0.265, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.16, 0.05, 0.68]} />
        {mustardShadow}
      </mesh>

      {/* Rear Structural Shell (Tilted Back at 12°) */}
      <group position={[0, 0.54, -0.27]} rotation={[-0.21, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.16, 0.44, 0.08]} />
          {mustardShadow}
        </mesh>
        {/* Soft Rounded Top Rail */}
        <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.16, 20]} />
          {mustardPadded}
        </mesh>
      </group>

      {/* ========================================================
          3. SCULPTED SLOPING ARMRESTS (Left & Right)
         ======================================================== */}
      {/* Left Armrest */}
      <group position={[-0.54, 0.44, 0.02]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.11, 0.28, 0.64]} />
          {mustardMain}
        </mesh>
        {/* Top Padded Roll */}
        <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.64, 18]} />
          {mustardPadded}
        </mesh>
        {/* Front Rounded Face */}
        <mesh position={[0, 0, 0.32]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.28, 18]} />
          {mustardPadded}
        </mesh>
        {/* Front-Top Corner Sphere */}
        <mesh position={[0, 0.14, 0.32]}>
          <sphereGeometry args={[0.055, 14, 14]} />
          {mustardPadded}
        </mesh>
      </group>

      {/* Right Armrest */}
      <group position={[0.54, 0.44, 0.02]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.11, 0.28, 0.64]} />
          {mustardMain}
        </mesh>
        {/* Top Padded Roll */}
        <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.64, 18]} />
          {mustardPadded}
        </mesh>
        {/* Front Rounded Face */}
        <mesh position={[0, 0, 0.32]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.28, 18]} />
          {mustardPadded}
        </mesh>
        {/* Front-Top Corner Sphere */}
        <mesh position={[0, 0.14, 0.32]}>
          <sphereGeometry args={[0.055, 14, 14]} />
          {mustardPadded}
        </mesh>
      </group>

      {/* ========================================================
          4. TWO PLUSH SEAT CUSHIONS (Left & Right)
         ======================================================== */}
      {[-0.245, 0.245].map((cx, idx) => (
        <group key={idx} position={[cx, 0.34, 0.04]}>
          {/* Main Cushion Block */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.46, 0.13, 0.56]} />
            {mustardMain}
          </mesh>

          {/* Front Bullnose Roll */}
          <mesh position={[0, 0, 0.28]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.46, 16]} />
            {mustardPadded}
          </mesh>

          {/* Front Left & Right Soft Corners */}
          <mesh position={[-0.23, 0, 0.28]}>
            <sphereGeometry args={[0.065, 12, 12]} />
            {mustardPadded}
          </mesh>
          <mesh position={[0.23, 0, 0.28]}>
            <sphereGeometry args={[0.065, 12, 12]} />
            {mustardPadded}
          </mesh>

          {/* Tufted Button Indents */}
          <mesh position={[-0.10, 0.068, 0.02]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            {mustardShadow}
          </mesh>
          <mesh position={[0.10, 0.068, 0.02]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            {mustardShadow}
          </mesh>
        </group>
      ))}

      {/* Center Seam Welt between the two seat cushions */}
      <mesh position={[0, 0.35, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.56, 8]} />
        {mustardShadow}
      </mesh>

      {/* ========================================================
          5. TWO CONTOURED RECLINED BACK CUSHIONS
         ======================================================== */}
      {[-0.245, 0.245].map((bx, idx) => (
        <group key={idx} position={[bx, 0.54, -0.21]} rotation={[-0.21, 0, 0]}>
          {/* Main Back Pillow Block */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.46, 0.38, 0.10]} />
            {mustardPadded}
          </mesh>

          {/* Top Rolled Crest */}
          <mesh position={[0, 0.19, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.46, 16]} />
            {mustardPadded}
          </mesh>

          {/* Left & Right Soft Rounded Sides */}
          <mesh position={[-0.23, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.38, 14]} />
            {mustardPadded}
          </mesh>
          <mesh position={[0.23, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.38, 14]} />
            {mustardPadded}
          </mesh>

          {/* Corner Spheres */}
          <mesh position={[-0.23, 0.19, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            {mustardPadded}
          </mesh>
          <mesh position={[0.23, 0.19, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            {mustardPadded}
          </mesh>

          {/* Tufted Button Indents on Backrest (Top Row & Bottom Row) */}
          <mesh position={[-0.10, 0.07, 0.052]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            {mustardShadow}
          </mesh>
          <mesh position={[0.10, 0.07, 0.052]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            {mustardShadow}
          </mesh>
          <mesh position={[-0.10, -0.07, 0.052]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            {mustardShadow}
          </mesh>
          <mesh position={[0.10, -0.07, 0.052]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            {mustardShadow}
          </mesh>
        </group>
      ))}

      {/* ========================================================
          6. DESIGNER ACCENT PILLOWS (Organic Plump Pillows)
         ======================================================== */}
      {/* Left Pillow: Deep Azure Velvet Pillow tucked into left corner */}
      <group
        position={[-0.37, 0.43, -0.09]}
        rotation={[0.10, 0.44, -0.12]}
      >
        {/* Soft squished organic pillow body */}
        <mesh castShadow receiveShadow scale={[1.1, 1.0, 0.44]}>
          <sphereGeometry args={[0.13, 24, 20]} />
          {tealVelvet}
        </mesh>
        {/* Gold brass tuft center button */}
        <mesh position={[0, 0, 0.052]}>
          <sphereGeometry args={[0.013, 10, 10]} />
          {brassFerrule}
        </mesh>
        <mesh position={[0, 0, -0.052]}>
          <sphereGeometry args={[0.013, 10, 10]} />
          {brassFerrule}
        </mesh>
      </group>

      {/* Right Pillow: Cozy Textured Cream Cushion tucked into right corner */}
      <group
        position={[0.35, 0.41, -0.07]}
        rotation={[0.08, -0.38, 0.10]}
      >
        {/* Soft squished organic pillow body */}
        <mesh castShadow receiveShadow scale={[1.05, 0.95, 0.42]}>
          <sphereGeometry args={[0.12, 24, 20]} />
          {creamTextured}
        </mesh>
        {/* Center button */}
        <mesh position={[0, 0, 0.046]}>
          <sphereGeometry args={[0.012, 10, 10]} />
          {mustardShadow}
        </mesh>
        <mesh position={[0, 0, -0.046]}>
          <sphereGeometry args={[0.012, 10, 10]} />
          {mustardShadow}
        </mesh>
      </group>
    </group>
  );
}
