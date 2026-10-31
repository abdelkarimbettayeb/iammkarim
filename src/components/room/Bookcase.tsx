'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cartridgeProjects, techSkills } from '@/data/resumeData';
import { RetroCartridge } from './RetroCartridge';
import { TechEmblem } from './TechEmblem';
import { playSound } from '@/lib/audioEngine';

export function Bookcase() {
  // Positioned along the right wall (Z = -4.0), to the left of the window (X = 2.4)
  const caseX = 0.5;
  const caseZ = -3.58;

  // Guitar wobble animation ref (zero state re-renders in useFrame)
  const guitarRef = useRef<THREE.Group>(null);
  const guitarWobbleRef = useRef(0);

  const handleGuitarClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playSound('guitar');
    guitarWobbleRef.current = 1;
  };

  React.useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
    };
  }, []);

  useFrame((_, delta) => {
    if (guitarWobbleRef.current > 0) {
      guitarWobbleRef.current = Math.max(0, guitarWobbleRef.current - delta * 3.5);
      if (guitarRef.current) {
        guitarRef.current.rotation.z = -0.16 + Math.sin(guitarWobbleRef.current * 32) * 0.06 * guitarWobbleRef.current;
      }
    }
  });

  return (
    <group name="bookcase">
      {/* =========================================
          1. Main Teak Cube Shelf Frame (2 columns x 4 rows)
         ========================================= */}
      <group position={[caseX, 2.4, caseZ]}>
        {/* Warm Teak Wood Material */}
        {/* Left Side Panel */}
        <mesh position={[-1.12, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 4.3, 0.68]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.52} />
        </mesh>
        {/* Right Side Panel */}
        <mesh position={[1.12, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 4.3, 0.68]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.52} />
        </mesh>
        {/* Center Vertical Divider */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 4.3, 0.68]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.52} />
        </mesh>
        {/* Top Board */}
        <mesh position={[0, 2.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.32, 0.08, 0.7]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.52} />
        </mesh>
        {/* Bottom Board */}
        <mesh position={[0, -2.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.32, 0.08, 0.7]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.52} />
        </mesh>

        {/* 3 Horizontal Shelves (creating 4 equal height compartments) */}
        {[-1.075, 0, 1.075].map((yPos, i) => (
          <mesh key={i} position={[0, yPos, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.24, 0.07, 0.66]} />
            <meshStandardMaterial color="#CF6B2C" roughness={0.52} />
          </mesh>
        ))}

        {/* Back Panel */}
        <mesh position={[0, 0, -0.32]} receiveShadow>
          <boxGeometry args={[2.24, 4.22, 0.03]} />
          <meshStandardMaterial color="#B8591E" roughness={0.65} />
        </mesh>
      </group>

      {/* =========================================
          2. Top of Bookcase: Cyan Blue Art Print (Tilted against wall)
         ========================================= */}
      <group position={[caseX - 0.25, 5.25, caseZ - 0.05]} rotation={[0.16, 0, 0]}>
        {/* Blue Art Canvas */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.6, 0.04]} />
          <meshStandardMaterial color="#0284C7" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Minimalist White Bench / Graphic Silhouette */}
        <mesh position={[0, -0.15, 0.022]}>
          <boxGeometry args={[0.55, 0.05, 0.01]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <mesh position={[-0.18, -0.28, 0.022]}>
          <boxGeometry args={[0.04, 0.22, 0.01]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <mesh position={[0.18, -0.28, 0.022]}>
          <boxGeometry args={[0.04, 0.22, 0.01]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* Text Accent Line */}
        <mesh position={[0, -0.5, 0.022]}>
          <boxGeometry args={[0.4, 0.025, 0.01]} />
          <meshStandardMaterial color="#BAE6FD" roughness={0.4} />
        </mesh>
      </group>

      {/* =========================================
          3. Top Compartment: Retro Cartridges & Books
         ========================================= */}
      {/* Left Cube: Interactive Retro Game Cartridges */}
      <group position={[caseX - 0.56, 3.75, caseZ + 0.08]}>
        <RetroCartridge project={cartridgeProjects.alnurayn} position={[-0.28, 0, 0]} />
        <RetroCartridge project={cartridgeProjects.freelance} position={[0, 0, 0]} />
        <RetroCartridge project={cartridgeProjects.tastytracks} position={[0.28, 0, 0]} />
      </group>

      {/* Right Cube: Vertical Books (Red, White, Blue Spines matching reference) */}
      <group position={[caseX + 0.56, 3.72, caseZ + 0.05]}>
        {[-0.38, -0.28, -0.18, -0.08, 0.02, 0.12, 0.22, 0.32].map((xOffset, i) => (
          <mesh key={i} position={[xOffset, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 0.62, 0.44]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#DC2626' : i % 3 === 1 ? '#F8FAFC' : '#2563EB'}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* =========================================
          4. Second Compartment: 3D Tech Emblems
         ========================================= */}
      <group position={[caseX, 2.65, caseZ + 0.05]}>
        {/* Left Cube Emblems */}
        <TechEmblem skill={techSkills[0]} position={[-0.8, 0, 0]} />
        <TechEmblem skill={techSkills[1]} position={[-0.5, 0, 0]} />
        <TechEmblem skill={techSkills[2]} position={[-0.2, 0, 0]} />

        {/* Right Cube Emblems */}
        <TechEmblem skill={techSkills[3]} position={[0.2, 0, 0]} />
        <TechEmblem skill={techSkills[4]} position={[0.5, 0, 0]} />
        <TechEmblem skill={techSkills[5]} position={[0.8, 0, 0]} />
      </group>

      {/* =========================================
          5. Third Compartment: Office Binders & Folders
         ========================================= */}
      <group position={[caseX, 1.55, caseZ + 0.05]}>
        {/* Blue Dossier Folders on Left */}
        {[-0.8, -0.66, -0.52, -0.38, -0.24].map((xOffset, i) => (
          <mesh key={i} position={[xOffset, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 0.68, 0.48]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.4} />
          </mesh>
        ))}
        {/* Blue Dossier Folders on Right */}
        {[0.24, 0.38, 0.52, 0.66, 0.8].map((xOffset, i) => (
          <mesh key={i} position={[xOffset, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 0.68, 0.48]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* =========================================
          6. Bottom Compartment: Dark Storage Boxes with Pull Holes
         ========================================= */}
      <group position={[caseX, 0.5, caseZ + 0.05]}>
        {/* Left Storage Box */}
        <group position={[-0.55, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.86, 0.68, 0.55]} />
            <meshStandardMaterial color="#1E293B" roughness={0.7} />
          </mesh>
          {/* Finger Pull Hole */}
          <mesh position={[0, 0.12, 0.28]}>
            <circleGeometry args={[0.04, 16]} />
            <meshStandardMaterial color="#0F172A" roughness={0.9} />
          </mesh>
        </group>
        {/* Right Storage Box */}
        <group position={[0.55, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.86, 0.68, 0.55]} />
            <meshStandardMaterial color="#1E293B" roughness={0.7} />
          </mesh>
          {/* Finger Pull Hole */}
          <mesh position={[0, 0.12, 0.28]}>
            <circleGeometry args={[0.04, 16]} />
            <meshStandardMaterial color="#0F172A" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* =========================================
          7. Acoustic Guitar (Proper Dreadnought Shape & Spruce/Mahogany Finish)
         ========================================= */}
      <group
        ref={guitarRef}
        position={[caseX + 1.42, 1.25, caseZ + 0.32]}
        rotation={[0.12, -0.2, -0.16]}
        onClick={handleGuitarClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Mahogany Body Shell (Back & Sides) */}
        <group position={[0, 0, 0]}>
          {/* Lower Bout (Wide round hips) */}
          <mesh position={[0, -0.32, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.36, 0.16, 24]} />
            <meshStandardMaterial color="#7C2D12" roughness={0.4} />
          </mesh>
          {/* Waist (Narrower middle curve) */}
          <mesh position={[0, -0.05, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.28, 0.16, 24]} />
            <meshStandardMaterial color="#7C2D12" roughness={0.4} />
          </mesh>
          {/* Upper Bout (Chest shoulders) */}
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.27, 0.25, 0.16, 24]} />
            <meshStandardMaterial color="#7C2D12" roughness={0.4} />
          </mesh>

          {/* Blonde Natural Spruce Soundboard (Front Face) */}
          <mesh position={[0, -0.32, 0.082]}>
            <circleGeometry args={[0.34, 24]} />
            <meshStandardMaterial color="#F5E5C9" roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.05, 0.082]}>
            <circleGeometry args={[0.26, 24]} />
            <meshStandardMaterial color="#F5E5C9" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.18, 0.082]}>
            <circleGeometry args={[0.26, 24]} />
            <meshStandardMaterial color="#F5E5C9" roughness={0.35} />
          </mesh>

          {/* Dark Soundhole & Ivory Rosette Ring */}
          <mesh position={[0, 0.04, 0.085]}>
            <ringGeometry args={[0.075, 0.09, 24]} />
            <meshStandardMaterial color="#FAF5EE" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.04, 0.084]}>
            <circleGeometry args={[0.075, 24]} />
            <meshStandardMaterial color="#1A1817" roughness={0.9} />
          </mesh>

          {/* Rosewood Bridge & Bone Saddle */}
          <mesh position={[0, -0.35, 0.09]}>
            <boxGeometry args={[0.2, 0.05, 0.018]} />
            <meshStandardMaterial color="#3E1A0A" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.34, 0.098]}>
            <boxGeometry args={[0.15, 0.01, 0.008]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
          </mesh>

          {/* Neck with Dark Fretboard */}
          <mesh position={[0, 0.76, 0.02]} castShadow>
            <boxGeometry args={[0.075, 0.85, 0.045]} />
            <meshStandardMaterial color="#5C2508" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.76, 0.045]}>
            <boxGeometry args={[0.072, 0.85, 0.008]} />
            <meshStandardMaterial color="#2E1408" roughness={0.6} />
          </mesh>

          {/* Headstock & 6 Silver Tuning Pegs */}
          <mesh position={[0, 1.28, 0.015]} castShadow>
            <boxGeometry args={[0.11, 0.24, 0.035]} />
            <meshStandardMaterial color="#451A03" roughness={0.5} />
          </mesh>
          {[-0.07, 0.07].map((xPeg, px) =>
            [1.2, 1.27, 1.34].map((yPeg, py) => (
              <mesh key={`${px}-${py}`} position={[xPeg, yPeg, 0.015]}>
                <sphereGeometry args={[0.016, 8, 8]} />
                <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
              </mesh>
            ))
          )}
        </group>
      </group>

      {/* =========================================
          8. Tennis Racket & Neon Ball (Under the Window)
         ========================================= */}
      <group position={[caseX + 2.1, 0.75, caseZ + 0.4]} rotation={[0.2, 0.1, 0.14]}>
        {/* Oval White Racket Head */}
        <mesh castShadow>
          <torusGeometry args={[0.24, 0.02, 12, 24]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* Translucent Nylon String Mesh */}
        <mesh>
          <circleGeometry args={[0.22, 16]} />
          <meshStandardMaterial
            color="#E2E8F0"
            transparent
            opacity={0.35}
            roughness={0.2}
          />
        </mesh>
        {/* Racket Shaft & Grip */}
        <mesh position={[0, -0.52, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.58, 12]} />
          <meshStandardMaterial color="#1E293B" roughness={0.6} />
        </mesh>
        {/* Neon Yellow Tennis Ball */}
        <mesh position={[0.2, -0.72, 0.08]} castShadow>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#A3E635" roughness={0.8} />
        </mesh>
      </group>

      {/* =========================================
          9. "Welcome!" Doormat & White Sneakers
         ========================================= */}
      <group position={[1.4, 0.01, 1.8]}>
        {/* Rounded Welcome Rug */}
        <mesh receiveShadow>
          <boxGeometry args={[1.35, 0.02, 0.68]} />
          <meshStandardMaterial color="#D1D5DB" roughness={0.95} />
        </mesh>

        {/* Pair of Sleek White Classic Sneakers */}
        {[-0.14, 0.14].map((xPos, idx) => (
          <group key={idx} position={[xPos, 0.06, 0]}>
            {/* White Rubber Outsole */}
            <mesh castShadow>
              <boxGeometry args={[0.13, 0.035, 0.32]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
            </mesh>
            {/* White Leather Shoe Body */}
            <mesh position={[0, 0.045, -0.01]} castShadow>
              <boxGeometry args={[0.12, 0.065, 0.28]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
            </mesh>
            {/* Blue Heel Accent Tab (matching reference) */}
            <mesh position={[0, 0.06, -0.14]}>
              <boxGeometry args={[0.08, 0.03, 0.02]} />
              <meshStandardMaterial color="#0284C7" roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
