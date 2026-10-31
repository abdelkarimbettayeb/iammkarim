'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cartridgeProjects, techSkills } from '@/data/resumeData';
import { RetroCartridge } from './RetroCartridge';
import { TechEmblem } from './TechEmblem';
import { playSound } from '@/lib/audioEngine';

export function Bookcase() {
  const caseX = 2.2;
  const caseZ = -4.2;

  // Guitar wobble animation state
  const guitarRef = useRef<THREE.Group>(null);
  const [guitarWobble, setGuitarWobble] = useState(0);

  const handleGuitarClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playSound('guitar');
    setGuitarWobble(1);
  };

  React.useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
    };
  }, []);

  useFrame((_, delta) => {
    if (guitarWobble > 0) {
      setGuitarWobble((prev) => Math.max(0, prev - delta * 3));
      if (guitarRef.current) {
        guitarRef.current.rotation.z = -0.18 + Math.sin(guitarWobble * 35) * 0.05 * guitarWobble;
      }
    }
  });

  return (
    <group name="bookcase">
      {/* =========================================
          1. Main Teak Cube Shelf Frame
         ========================================= */}
      <group position={[caseX, 2.7, caseZ]}>
        {/* Outer Frame (Top, Bottom, Sides) */}
        {/* Left Side */}
        <mesh position={[-1.25, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 4.8, 0.75]} />
          <meshStandardMaterial color="#D96B27" roughness={0.55} />
        </mesh>
        {/* Right Side */}
        <mesh position={[1.25, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 4.8, 0.75]} />
          <meshStandardMaterial color="#D96B27" roughness={0.55} />
        </mesh>
        {/* Center Vertical Divider */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 4.8, 0.75]} />
          <meshStandardMaterial color="#D96B27" roughness={0.55} />
        </mesh>
        {/* Top Board */}
        <mesh position={[0, 2.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.58, 0.08, 0.78]} />
          <meshStandardMaterial color="#D96B27" roughness={0.55} />
        </mesh>
        {/* Bottom Board */}
        <mesh position={[0, -2.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.58, 0.08, 0.78]} />
          <meshStandardMaterial color="#D96B27" roughness={0.55} />
        </mesh>

        {/* Horizontal Shelves (3 dividers creating 4 rows) */}
        {[-1.2, 0, 1.2].map((yPos, i) => (
          <mesh key={i} position={[0, yPos, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.5, 0.07, 0.75]} />
            <meshStandardMaterial color="#D96B27" roughness={0.55} />
          </mesh>
        ))}

        {/* Back Panel */}
        <mesh position={[0, 0, -0.36]} receiveShadow>
          <boxGeometry args={[2.5, 4.7, 0.04]} />
          <meshStandardMaterial color="#C85A17" roughness={0.65} />
        </mesh>
      </group>

      {/* =========================================
          2. Top of Bookcase: Blue Poster Frame
         ========================================= */}
      <group position={[caseX - 0.4, 5.85, caseZ - 0.1]} rotation={[0.08, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.3, 1.8, 0.06]} />
          <meshStandardMaterial color="#0284C7" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[1.15, 1.6]} />
          <meshStandardMaterial color="#0284C7" emissive="#0369A1" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* =========================================
          3. Top Compartment: Retro Cartridges & Books
         ========================================= */}
      {/* Left Cube: Retro Game Cartridges */}
      <group position={[caseX - 0.62, 4.15, caseZ + 0.1]}>
        <RetroCartridge project={cartridgeProjects.alnurayn} position={[-0.32, 0, 0]} />
        <RetroCartridge project={cartridgeProjects.freelance} position={[0, 0, 0]} />
        <RetroCartridge project={cartridgeProjects.tastytracks} position={[0.32, 0, 0]} />
      </group>

      {/* Right Cube: Office Binders & Tech Books */}
      <group position={[caseX + 0.62, 4.1, caseZ + 0.05]}>
        {[-0.4, -0.28, -0.16, -0.04, 0.08, 0.2, 0.32].map((xOffset, i) => (
          <mesh key={i} position={[xOffset, 0, 0]} castShadow>
            <boxGeometry args={[0.09, 0.65, 0.5]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#DC2626' : i % 3 === 1 ? '#F8FAFC' : '#1D4ED8'}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* =========================================
          4. Second Compartment: 3D Tech Emblems
         ========================================= */}
      <group position={[caseX, 2.9, caseZ + 0.05]}>
        {/* Left Cube Emblems */}
        <TechEmblem skill={techSkills[0]} position={[-0.9, 0, 0]} />
        <TechEmblem skill={techSkills[1]} position={[-0.55, 0, 0]} />
        <TechEmblem skill={techSkills[2]} position={[-0.2, 0, 0]} />

        {/* Right Cube Emblems */}
        <TechEmblem skill={techSkills[3]} position={[0.2, 0, 0]} />
        <TechEmblem skill={techSkills[4]} position={[0.55, 0, 0]} />
        <TechEmblem skill={techSkills[5]} position={[0.9, 0, 0]} />
      </group>

      {/* =========================================
          5. Third Compartment: Folders & Decorative Bins
         ========================================= */}
      <group position={[caseX, 1.7, caseZ + 0.05]}>
        {/* Blue Dossier Folders on Left */}
        {[-0.9, -0.75, -0.6, -0.45, -0.3].map((xOffset, i) => (
          <mesh key={i} position={[xOffset, 0, 0]} castShadow>
            <boxGeometry args={[0.11, 0.72, 0.52]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.4} />
          </mesh>
        ))}
        {/* Blue Dossier Folders on Right */}
        {[0.3, 0.45, 0.6, 0.75, 0.9].map((xOffset, i) => (
          <mesh key={i} position={[xOffset, 0, 0]} castShadow>
            <boxGeometry args={[0.11, 0.72, 0.52]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* =========================================
          6. Bottom Compartment: Storage Bins
         ========================================= */}
      <group position={[caseX, 0.55, caseZ + 0.05]}>
        {/* Left Storage Box */}
        <mesh position={[-0.6, 0, 0]} castShadow>
          <boxGeometry args={[0.95, 0.75, 0.6]} />
          <meshStandardMaterial color="#1E293B" roughness={0.7} />
        </mesh>
        {/* Right Storage Box */}
        <mesh position={[0.6, 0, 0]} castShadow>
          <boxGeometry args={[0.95, 0.75, 0.6]} />
          <meshStandardMaterial color="#1E293B" roughness={0.7} />
        </mesh>
      </group>

      {/* =========================================
          7. Acoustic Guitar (Leaning on Right Side)
         ========================================= */}
      <group
        ref={guitarRef}
        position={[caseX + 1.6, 1.35, caseZ + 0.3]}
        rotation={[0.12, -0.15, -0.18]}
        onClick={handleGuitarClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Lower Bout Body */}
        <mesh position={[0, -0.4, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.44, 0.22, 24]} />
          <meshStandardMaterial color="#FDE047" roughness={0.4} />
        </mesh>
        {/* Upper Bout Body */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.35, 0.22, 24]} />
          <meshStandardMaterial color="#FDE047" roughness={0.4} />
        </mesh>
        {/* Soundhole */}
        <mesh position={[0, -0.05, 0.112]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.12, 24]} />
          <meshStandardMaterial color="#1E1E1E" roughness={0.9} />
        </mesh>
        {/* Wooden Bridge */}
        <mesh position={[0, -0.45, 0.115]}>
          <boxGeometry args={[0.22, 0.05, 0.02]} />
          <meshStandardMaterial color="#451A03" roughness={0.6} />
        </mesh>
        {/* Guitar Neck */}
        <mesh position={[0, 0.7, 0.05]} castShadow>
          <boxGeometry args={[0.09, 1.0, 0.05]} />
          <meshStandardMaterial color="#78350F" roughness={0.5} />
        </mesh>
        {/* Headstock & Tuning Pegs */}
        <mesh position={[0, 1.32, 0.04]} castShadow>
          <boxGeometry args={[0.13, 0.28, 0.04]} />
          <meshStandardMaterial color="#451A03" roughness={0.5} />
        </mesh>
      </group>

      {/* =========================================
          8. Tennis Racket & Ball
         ========================================= */}
      <group position={[caseX + 2.4, 0.9, caseZ + 0.6]} rotation={[0.2, 0.1, 0.15]}>
        {/* Oval Racket Head */}
        <mesh castShadow>
          <torusGeometry args={[0.3, 0.025, 12, 24]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* Racket Strings */}
        <mesh>
          <circleGeometry args={[0.28, 16]} />
          <meshStandardMaterial
            color="#E2E8F0"
            transparent
            opacity={0.3}
            roughness={0.1}
          />
        </mesh>
        {/* Handle Shaft */}
        <mesh position={[0, -0.65, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.7, 12]} />
          <meshStandardMaterial color="#1E293B" roughness={0.6} />
        </mesh>
        {/* Neon Tennis Ball */}
        <mesh position={[0.25, -0.9, 0.1]} castShadow>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#A3E635" roughness={0.8} />
        </mesh>
      </group>

      {/* =========================================
          9. "Welcome!" Doormat & Sneakers
         ========================================= */}
      <group position={[caseX + 0.8, 0.01, caseZ + 2.2]}>
        {/* Rounded Mat */}
        <mesh receiveShadow>
          <boxGeometry args={[1.6, 0.02, 0.75]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
        </mesh>

        {/* Pair of Sneakers */}
        {[-0.18, 0.18].map((xPos, idx) => (
          <group key={idx} position={[xPos, 0.08, 0]}>
            {/* Sneaker Sole */}
            <mesh castShadow>
              <boxGeometry args={[0.16, 0.06, 0.36]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
            </mesh>
            {/* Upper Fabric */}
            <mesh position={[0, 0.06, -0.02]} castShadow>
              <boxGeometry args={[0.15, 0.08, 0.32]} />
              <meshStandardMaterial color="#38BDF8" roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
