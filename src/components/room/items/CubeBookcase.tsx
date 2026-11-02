'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { cartridgeProjects, techSkills } from '@/data/resumeData';
import { RetroCartridge } from '../RetroCartridge';
import { TechEmblem } from '../TechEmblem';

interface CubeBookcaseProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Procedural texture for the iconic Cyan "Forrest Gump" minimal movie poster
 */
function createForrestGumpPosterTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Vibrant Sky / Cyan Blue Poster Background
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(0, 0, 512, 768);

    // Subtle white border margin
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 12;
    ctx.strokeRect(18, 18, 476, 732);

    // Floating White Feather
    ctx.save();
    ctx.translate(256, 320);
    ctx.rotate(-0.35);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Feather quill stem
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-45, 8);
    ctx.quadraticCurveTo(0, 0, 45, -8);
    ctx.stroke();
    ctx.restore();

    // White Park Bench (Minimalist silhouette)
    ctx.fillStyle = '#FFFFFF';
    // Bench back slats
    ctx.fillRect(166, 420, 180, 10);
    ctx.fillRect(166, 436, 180, 10);
    // Bench seat
    ctx.fillRect(160, 452, 192, 12);
    // Bench legs
    ctx.fillRect(174, 464, 12, 54);
    ctx.fillRect(326, 464, 12, 54);
    // Cross brace
    ctx.fillRect(186, 488, 140, 6);

    // Clean White Typography: "Forrest Gump"
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 34px "Trebuchet MS", system-ui, sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('Forrest Gump', 256, 575);

    // Subtitle tagline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '14px system-ui, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('LIFE IS LIKE A BOX OF CHOCOLATES', 256, 615);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function CubeBookcase({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: CubeBookcaseProps) {
  const posterTexture = useMemo(() => createForrestGumpPosterTexture(), []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* =========================================
          1. Main Teak Cube Shelf Frame (2 columns x 4 rows)
         ========================================= */}
      <group position={[0, 2.4, 0]}>
        {/* Left Side Panel */}
        <mesh position={[-1.12, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 4.3, 0.68]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.48} />
        </mesh>
        {/* Right Side Panel */}
        <mesh position={[1.12, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 4.3, 0.68]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.48} />
        </mesh>
        {/* Center Vertical Divider */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 4.3, 0.68]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.48} />
        </mesh>
        {/* Top Board */}
        <mesh position={[0, 2.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.32, 0.08, 0.7]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.48} />
        </mesh>
        {/* Bottom Board */}
        <mesh position={[0, -2.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.32, 0.08, 0.7]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.48} />
        </mesh>

        {/* 3 Horizontal Shelves */}
        {[-1.075, 0, 1.075].map((yPos, i) => (
          <mesh key={i} position={[0, yPos, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.24, 0.07, 0.66]} />
            <meshStandardMaterial color="#CF6B2C" roughness={0.48} />
          </mesh>
        ))}

        {/* Back Panel */}
        <mesh position={[0, 0, -0.32]} receiveShadow>
          <boxGeometry args={[2.24, 4.22, 0.03]} />
          <meshStandardMaterial color="#B8591E" roughness={0.65} />
        </mesh>
      </group>

      {/* =========================================
          2. Top of Bookcase: Tilted Cyan Blue Poster Frame
         ========================================= */}
      <group position={[-0.2, 5.25, -0.08]} rotation={[-0.14, 0, 0]}>
        {/* White Picture Frame Border */}
        <mesh castShadow>
          <boxGeometry args={[1.24, 1.64, 0.04]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* High-Resolution Printed Poster Art Canvas */}
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[1.18, 1.58]} />
          <meshStandardMaterial map={posterTexture} roughness={0.25} />
        </mesh>
      </group>

      {/* =========================================
          3. Top Compartment: Retro Cartridges & Books
         ========================================= */}
      {/* Left Cube: Interactive Retro Game Cartridges */}
      <group position={[-0.56, 3.82, 0.08]}>
        <RetroCartridge project={cartridgeProjects.jud} position={[-0.28, 0, 0]} />
        <RetroCartridge project={cartridgeProjects.alnurayn} position={[0, 0, 0]} />
        <RetroCartridge project={cartridgeProjects.freelance} position={[0.28, 0, 0]} />
      </group>

      {/* Right Cube: Vertical Books (Red, White, Blue Spines) */}
      <group position={[0.56, 3.82, 0.05]}>
        {[-0.38, -0.28, -0.18, -0.08, 0.02, 0.12, 0.22, 0.32].map((xOffset, i) => (
          <group key={i} position={[xOffset, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.078, 0.68, 0.46]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? '#DC2626' : i % 3 === 1 ? '#F8FAFC' : '#1D4ED8'}
                roughness={0.4}
              />
            </mesh>
            {/* Paper pages subtle texture on edge */}
            <mesh position={[0, 0, -0.02]}>
              <boxGeometry args={[0.065, 0.64, 0.42]} />
              <meshStandardMaterial color="#FEF3C7" roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* =========================================
          4. Second Compartment: 3D Tech Emblems
         ========================================= */}
      <group position={[0, 2.75, 0.05]}>
        <TechEmblem skill={techSkills[0]} position={[-0.8, 0, 0]} />
        <TechEmblem skill={techSkills[1]} position={[-0.5, 0, 0]} />
        <TechEmblem skill={techSkills[2]} position={[-0.2, 0, 0]} />

        <TechEmblem skill={techSkills[3]} position={[0.2, 0, 0]} />
        <TechEmblem skill={techSkills[4]} position={[0.5, 0, 0]} />
        <TechEmblem skill={techSkills[5]} position={[0.8, 0, 0]} />
      </group>

      {/* =========================================
          5. Third Compartment: Office Binders & Folders
         ========================================= */}
      <group position={[0, 1.68, 0.05]}>
        {/* Blue Dossier Folders on Left with Spine Finger Holes */}
        {[-0.8, -0.66, -0.52, -0.38, -0.24].map((xOffset, i) => (
          <group key={i} position={[xOffset, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.1, 0.68, 0.48]} />
              <meshStandardMaterial color="#1E3A8A" roughness={0.4} />
            </mesh>
            {/* White Spine Label */}
            <mesh position={[0, 0.12, 0.242]}>
              <boxGeometry args={[0.07, 0.16, 0.002]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Blue Dossier Folders on Right */}
        {[0.24, 0.38, 0.52, 0.66, 0.8].map((xOffset, i) => (
          <group key={i} position={[xOffset, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.1, 0.68, 0.48]} />
              <meshStandardMaterial color="#1E3A8A" roughness={0.4} />
            </mesh>
            {/* White Spine Label */}
            <mesh position={[0, 0.12, 0.242]}>
              <boxGeometry args={[0.07, 0.16, 0.002]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* =========================================
          6. Bottom Compartment: Dark Storage Boxes with Silver Grommets
         ========================================= */}
      <group position={[0, 0.6, 0.05]}>
        <group position={[-0.55, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.88, 0.68, 0.55]} />
            <meshStandardMaterial color="#1E293B" roughness={0.6} />
          </mesh>
          {/* Metal Pull Hole Ring & Dark Hole */}
          <mesh position={[0, 0.12, 0.28]} rotation={[0, 0, 0]}>
            <ringGeometry args={[0.032, 0.05, 24]} />
            <meshStandardMaterial color="#F1F5F9" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.12, 0.278]}>
            <circleGeometry args={[0.032, 24]} />
            <meshBasicMaterial color="#0B0F19" />
          </mesh>
        </group>

        <group position={[0.55, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.88, 0.68, 0.55]} />
            <meshStandardMaterial color="#1E293B" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.12, 0.28]} rotation={[0, 0, 0]}>
            <ringGeometry args={[0.032, 0.05, 24]} />
            <meshStandardMaterial color="#F1F5F9" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.12, 0.278]}>
            <circleGeometry args={[0.032, 24]} />
            <meshBasicMaterial color="#0B0F19" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
