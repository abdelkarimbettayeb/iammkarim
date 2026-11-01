'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cartridgeProjects, techSkills } from '@/data/resumeData';
import { RetroCartridge } from './RetroCartridge';
import { TechEmblem } from './TechEmblem';
import { AcousticGuitar } from './items/AcousticGuitar';
import { playSound } from '@/lib/audioEngine';

export function Bookcase() {
  // Bookcase center coordinates
  // Outer frame: width = 2.32, depth = 0.68, height = 4.38
  const caseX = 0.5;
  const caseZ = -3.58;

  // Exact mathematical shelf surface Y coordinates (Room floor = 0.00):
  // Top Board top surface: Y = 4.59
  // Shelf 1 (Divider 3) top surface: Y = 3.51
  // Shelf 2 (Divider 2) top surface: Y = 2.435 (Compartment 2 center Y = 2.94)
  // Shelf 3 (Divider 1) top surface: Y = 1.36
  // Shelf 4 (Bottom Board) top surface: Y = 0.29 (Underside = 0.21)

  // Guitar wobble animation ref
  const guitarRef = useRef<THREE.Group>(null);
  const guitarWobbleRef = useRef(0);
  const baseGuitarRotZ = -0.06;

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
        guitarRef.current.rotation.z =
          baseGuitarRotZ + Math.sin(guitarWobbleRef.current * 32) * 0.06 * guitarWobbleRef.current;
      }
    }
  });

  return (
    <group name="bookcase">
      {/* =========================================
          1. Main Teak Cube Shelf Frame (2 columns x 4 rows)
         ========================================= */}
      <group position={[caseX, 2.4, caseZ]}>
        {/* Left Outer Side Panel */}
        <mesh position={[-1.12, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 4.3, 0.68]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.52} />
        </mesh>
        {/* Right Outer Side Panel */}
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
        {/* Sturdy Plinth Feet Grounding to Floor */}
        <mesh position={[0, -2.295, 0]} receiveShadow>
          <boxGeometry args={[2.18, 0.21, 0.62]} />
          <meshStandardMaterial color="#8F3E10" roughness={0.7} />
        </mesh>

        {/* 3 Horizontal Shelves */}
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
          2. Top of Bookcase: Cyan Blue Art Print (Sitting on Top Board Y = 4.59)
         ========================================= */}
      <group position={[caseX - 0.22, 5.33, caseZ - 0.16]} rotation={[0.14, 0, 0]}>
        {/* Blue Art Canvas (height = 1.5, half-height = 0.75, bottom touches Y = 4.59) */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.5, 0.04]} />
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
        <mesh position={[0, -0.48, 0.022]}>
          <boxGeometry args={[0.4, 0.025, 0.01]} />
          <meshStandardMaterial color="#BAE6FD" roughness={0.4} />
        </mesh>
      </group>

      {/* =========================================
          3. Row 1: Top Compartments (Shelf surface Y = 3.51)
         ========================================= */}
      {/* Left Cube: Interactive Retro Game Cartridges on Sleek Display Dock */}
      <group position={[caseX - 0.56, 3.51, caseZ + 0.06]}>
        {/* Dark Acrylic Cartridge Dock Base */}
        <mesh position={[0, 0.012, 0]} receiveShadow>
          <boxGeometry args={[0.90, 0.024, 0.22]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* 3 Cartridges sitting flush on the dock (Y = 0.024 + 0.18 = 0.204) */}
        <RetroCartridge project={cartridgeProjects.alnurayn} position={[-0.28, 0.204, 0]} />
        <RetroCartridge project={cartridgeProjects.freelance} position={[0, 0.204, 0]} />
        <RetroCartridge project={cartridgeProjects.tastytracks} position={[0.28, 0.204, 0]} />
      </group>

      {/* Right Cube: Curated Architectural & Engineering Hardcover Books */}
      <group position={[caseX + 0.56, 3.51, caseZ + 0.06]}>
        {/* Left Bookend (Matte Gunmetal) */}
        <mesh position={[-0.37, 0.12, 0]} castShadow>
          <boxGeometry args={[0.025, 0.24, 0.28]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[-0.34, 0.01, 0]} receiveShadow>
          <boxGeometry args={[0.08, 0.02, 0.28]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Upright Books with realistic variations in height, width, and color */}
        {[
          { x: -0.30, w: 0.055, h: 0.62, d: 0.42, c: '#DC2626' }, // Crimson
          { x: -0.23, w: 0.065, h: 0.65, d: 0.44, c: '#F8FAFC' }, // Pure White
          { x: -0.16, w: 0.050, h: 0.58, d: 0.40, c: '#1E3A8A' }, // Deep Blue
          { x: -0.09, w: 0.070, h: 0.64, d: 0.43, c: '#DC2626' }, // Crimson
          { x: -0.02, w: 0.055, h: 0.60, d: 0.41, c: '#F1F5F9' }, // Warm White
          { x: 0.05,  w: 0.065, h: 0.66, d: 0.44, c: '#2563EB' }, // Royal Blue
          { x: 0.12,  w: 0.050, h: 0.57, d: 0.39, c: '#DC2626' }, // Crimson
          { x: 0.19,  w: 0.065, h: 0.62, d: 0.42, c: '#0F172A' }, // Slate Black
          { x: 0.26,  w: 0.055, h: 0.59, d: 0.40, c: '#F8FAFC' }, // White
        ].map((b, i) => (
          <group key={i} position={[b.x, b.h / 2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshStandardMaterial color={b.c} roughness={0.45} />
            </mesh>
            {/* Gold/Silver Embossed Spine Foil Accent */}
            <mesh position={[0, 0, b.d / 2 + 0.002]}>
              <boxGeometry args={[b.w * 0.7, 0.035, 0.002]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Right Bookend (Matte Gunmetal) */}
        <mesh position={[0.31, 0.12, 0]} castShadow>
          <boxGeometry args={[0.025, 0.24, 0.28]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0.28, 0.01, 0]} receiveShadow>
          <boxGeometry args={[0.08, 0.02, 0.28]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* =========================================
          4. Row 2: Tech Skills Emblems (Compartment Center Y = 2.94, Shelf Y = 2.435)
         ========================================= */}
      {/* Left Cube Emblems (Fullstack & Core) */}
      <group position={[caseX - 0.56, 2.94, caseZ + 0.06]}>
        {/* Museum Exhibition Plinth on Shelf (sitting flush on Y = 2.435) */}
        <mesh position={[0, -0.485, 0]} receiveShadow>
          <boxGeometry args={[0.88, 0.04, 0.24]} />
          <meshStandardMaterial color="#090D16" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Glow Accent Stripe on Plinth */}
        <mesh position={[0, -0.465, 0.121]}>
          <boxGeometry args={[0.84, 0.006, 0.002]} />
          <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.6} />
        </mesh>

        {/* 3 Perfectly Centered Emblems */}
        <TechEmblem skill={techSkills[0]} position={[-0.28, 0, 0]} />
        <TechEmblem skill={techSkills[1]} position={[0, 0, 0]} />
        <TechEmblem skill={techSkills[2]} position={[0.28, 0, 0]} />
      </group>

      {/* Right Cube Emblems (Cloud, Data & Engineering) */}
      <group position={[caseX + 0.56, 2.94, caseZ + 0.06]}>
        {/* Museum Exhibition Plinth on Shelf (sitting flush on Y = 2.435) */}
        <mesh position={[0, -0.485, 0]} receiveShadow>
          <boxGeometry args={[0.88, 0.04, 0.24]} />
          <meshStandardMaterial color="#090D16" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Glow Accent Stripe on Plinth */}
        <mesh position={[0, -0.465, 0.121]}>
          <boxGeometry args={[0.84, 0.006, 0.002]} />
          <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.6} />
        </mesh>

        {/* 3 Perfectly Centered Emblems */}
        <TechEmblem skill={techSkills[3]} position={[-0.28, 0, 0]} />
        <TechEmblem skill={techSkills[4]} position={[0, 0, 0]} />
        <TechEmblem skill={techSkills[5]} position={[0.28, 0, 0]} />
      </group>

      {/* =========================================
          5. Row 3: Office Binders & Curated Monographs (Shelf surface Y = 1.36)
         ========================================= */}
      {/* Left Cube: Heavy Archival Project Dossier Binders */}
      <group position={[caseX - 0.56, 1.36, caseZ + 0.06]}>
        {[
          { x: -0.36, c: '#1E3A8A' }, // Deep Blue
          { x: -0.24, c: '#1E293B' }, // Slate Navy
          { x: -0.12, c: '#334155' }, // Charcoal Steel
          { x: 0.00,  c: '#1E3A8A' }, // Deep Blue
          { x: 0.12,  c: '#0F766E' }, // Dark Teal
          { x: 0.24,  c: '#1E293B' }, // Slate Navy
          { x: 0.36,  c: '#334155' }, // Charcoal Steel
        ].map((binder, i) => (
          <group key={i} position={[binder.x, 0.33, 0]}>
            {/* Binder Body */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.095, 0.66, 0.48]} />
              <meshStandardMaterial color={binder.c} roughness={0.4} />
            </mesh>
            {/* White Spine Label Strip */}
            <mesh position={[0, 0.08, 0.242]}>
              <planeGeometry args={[0.065, 0.20]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
            </mesh>
            {/* Metal Spine Pull Ring */}
            <mesh position={[0, -0.14, 0.242]}>
              <ringGeometry args={[0.015, 0.024, 16]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Right Cube: Stack of Art Monographs & Brass Polyhedron */}
      <group position={[caseX + 0.56, 1.36, caseZ + 0.06]}>
        {/* Horizontal Stack of 3 Art & Design Monographs */}
        <group position={[0.16, 0, 0]}>
          {/* Book 1 (Bottom) */}
          <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.46, 0.05, 0.38]} />
            <meshStandardMaterial color="#9A3412" roughness={0.5} />
          </mesh>
          {/* Book 2 (Middle) */}
          <mesh position={[0, 0.075, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.05, 0.36]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
          </mesh>
          {/* Book 3 (Top) */}
          <mesh position={[0, 0.120, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.38, 0.04, 0.34]} />
            <meshStandardMaterial color="#1E40AF" roughness={0.45} />
          </mesh>
          {/* Polished Brass Minimalist Polyhedral Sculpture on Stack */}
          <mesh position={[0, 0.205, 0]} castShadow>
            <dodecahedronGeometry args={[0.065]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>

        {/* Upright Leaning Books on Left Side */}
        <mesh position={[-0.38, 0.12, 0]} castShadow>
          <boxGeometry args={[0.025, 0.24, 0.28]} />
          <meshStandardMaterial color="#D97706" metalness={0.8} roughness={0.25} />
        </mesh>
        {[
          { x: -0.32, w: 0.06, h: 0.58, d: 0.40, c: '#475569' },
          { x: -0.25, w: 0.07, h: 0.62, d: 0.42, c: '#1E293B' },
          { x: -0.17, w: 0.06, h: 0.59, d: 0.41, c: '#B45309' },
          { x: -0.10, w: 0.05, h: 0.55, d: 0.38, c: '#0F766E' },
        ].map((bk, i) => (
          <group key={i} position={[bk.x, bk.h / 2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[bk.w, bk.h, bk.d]} />
              <meshStandardMaterial color={bk.c} roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* =========================================
          6. Row 4: Storage Boxes (Shelf surface Y = 0.29)
         ========================================= */}
      {/* Left Storage Box */}
      <group position={[caseX - 0.56, 0.29, caseZ + 0.05]}>
        <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.88, 0.64, 0.54]} />
          <meshStandardMaterial color="#1E293B" roughness={0.75} />
        </mesh>
        {/* Recessed Grip Cutout with Metallic Interior */}
        <mesh position={[0, 0.40, 0.272]}>
          <circleGeometry args={[0.042, 24]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.40, 0.273]}>
          <ringGeometry args={[0.042, 0.048, 24]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Right Storage Box */}
      <group position={[caseX + 0.56, 0.29, caseZ + 0.05]}>
        <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.88, 0.64, 0.54]} />
          <meshStandardMaterial color="#1E293B" roughness={0.75} />
        </mesh>
        {/* Recessed Grip Cutout with Metallic Interior */}
        <mesh position={[0, 0.40, 0.272]}>
          <circleGeometry args={[0.042, 24]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.40, 0.273]}>
          <ringGeometry args={[0.042, 0.048, 24]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* =========================================
          7. Acoustic Guitar on Stand (Resting solidly on floor Y = 0.00)
         ========================================= */}
      <group position={[caseX + 1.34, 0.0, caseZ + 0.34]}>
        {/* Matte Black Tubular Guitar Stand */}
        <group>
          {/* Base Tri-feet resting directly on floor Y = 0.00 */}
          <mesh position={[0, 0.015, -0.06]} receiveShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.32, 12]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[-0.14, 0.015, 0.08]} rotation={[0, 0.6, 0]} receiveShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.28, 12]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0.14, 0.015, 0.08]} rotation={[0, -0.6, 0]} receiveShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.28, 12]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Vertical Main Stem */}
          <mesh position={[0, 0.36, -0.08]} rotation={[0.08, 0, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.70, 12]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Lower Body Cradle Prongs (Foam Padded) */}
          <mesh position={[0, 0.16, 0.02]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 0.24, 12]} />
            <meshStandardMaterial color="#0F172A" roughness={0.8} />
          </mesh>
          {/* Upper Neck Cradle Bracket */}
          <mesh position={[0, 0.68, -0.06]}>
            <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#0F172A" roughness={0.8} />
          </mesh>
        </group>

        {/* Dreadnought Acoustic Guitar in Stand */}
        <group
          ref={guitarRef}
          position={[0, 0.68, 0.04]}
          rotation={[0.10, -0.22, baseGuitarRotZ]}
          onClick={handleGuitarClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
          }}
        >
          <AcousticGuitar />
        </group>
      </group>

      {/* =========================================
          8. Tennis Racket & Neon Ball (Resting on floor Y = 0.00 under the window)
         ========================================= */}
      <group position={[caseX + 2.05, 0.0, caseZ + 0.32]}>
        {/* Tennis Racket leaning against wall */}
        <group position={[0, 0.62, 0]} rotation={[0.18, 0.08, 0.12]}>
          {/* Oval White Racket Head */}
          <mesh position={[0, 0.24, 0]} castShadow>
            <torusGeometry args={[0.22, 0.018, 12, 24]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
          </mesh>
          {/* Translucent Nylon String Mesh */}
          <mesh position={[0, 0.24, 0]}>
            <circleGeometry args={[0.20, 16]} />
            <meshStandardMaterial
              color="#E2E8F0"
              transparent
              opacity={0.35}
              roughness={0.2}
            />
          </mesh>
          {/* Racket Shaft & Grip touching floor */}
          <mesh position={[0, -0.30, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.62, 12]} />
            <meshStandardMaterial color="#1E293B" roughness={0.6} />
          </mesh>
        </group>

        {/* Neon Yellow Tennis Ball resting on floor (radius 0.045, center Y = 0.045) */}
        <mesh position={[0.22, 0.045, 0.12]} castShadow receiveShadow>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#A3E635" roughness={0.8} />
        </mesh>
      </group>

      {/* =========================================
          9. "Welcome!" Doormat & White Classic Sneakers (Floor Y = 0.00)
         ========================================= */}
      <group position={[1.4, 0.0, 1.8]}>
        {/* Rounded Welcome Rug (Top surface at Y = 0.02) */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[1.35, 0.02, 0.68]} />
          <meshStandardMaterial color="#D1D5DB" roughness={0.95} />
        </mesh>

        {/* Pair of Sleek White Classic Sneakers sitting flush on top of rug */}
        {[-0.14, 0.14].map((xPos, idx) => (
          <group key={idx} position={[xPos, 0.02, 0]}>
            {/* White Rubber Outsole (Bottom at Y = 0.00 relative to rug surface) */}
            <mesh position={[0, 0.0175, 0]} castShadow>
              <boxGeometry args={[0.13, 0.035, 0.32]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
            </mesh>
            {/* White Leather Shoe Body */}
            <mesh position={[0, 0.0625, -0.01]} castShadow>
              <boxGeometry args={[0.12, 0.065, 0.28]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
            </mesh>
            {/* Blue Heel Accent Tab */}
            <mesh position={[0, 0.08, -0.14]}>
              <boxGeometry args={[0.08, 0.03, 0.02]} />
              <meshStandardMaterial color="#0284C7" roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
