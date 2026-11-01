'use client';

import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useRoomStore } from '@/store/useRoomStore';
import { cartridgeProjects } from '@/data/resumeData';
import { DeskLamp } from '../DeskLamp';

interface WorkstationDeskProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Creates a canvas texture for the "W / Premium Partner" standing book
 */
function createPartnerSpineTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Jet black matte cover
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 128, 512);

    // Subtle blue accent square at top
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(24, 40, 80, 80);

    // "W" Logo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('W', 64, 80);

    // Vertical text "Premium Partner"
    ctx.save();
    ctx.translate(64, 300);
    ctx.rotate(Math.PI / 2);
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('PREMIUM PARTNER', 0, 0);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function WorkstationDesk({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: WorkstationDeskProps) {
  const [screenHovered, setScreenHovered] = useState(false);
  const activeCartridge = useRoomStore((state) => state.activeCartridge);
  const setActiveZone = useRoomStore((state) => state.setActiveZone);

  const activeProject = activeCartridge ? cartridgeProjects[activeCartridge] : null;

  const partnerSpineTexture = useMemo(() => createPartnerSpineTexture(), []);

  const handleMonitorClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setActiveZone('workstation');
  };

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* =========================================
          1. Mid-Century Modern Teak Desk
         ========================================= */}
      <group position={[0, 1.4, 0]}>
        {/* Warm Teak Tabletop (Smooth Chamfered Finish) */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.35, 0.07, 1.15]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.45} />
        </mesh>
        {/* Tabletop Apron / Under-frame */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <boxGeometry args={[2.15, 0.04, 0.98]} />
          <meshStandardMaterial color="#B45309" roughness={0.5} />
        </mesh>

        {/* 4 Mid-Century Tapered Round Wooden Legs with Brass Ferrules */}
        {[
          [-0.98, -0.68, -0.44, 0.12, -0.12],
          [0.98, -0.68, -0.44, 0.12, 0.12],
          [-0.98, -0.68, 0.44, -0.12, -0.12],
          [0.98, -0.68, 0.44, -0.12, 0.12],
        ].map(([lx, ly, lz, rx, rz], i) => (
          <group key={i} position={[lx, ly, lz]} rotation={[rx, 0, rz]}>
            {/* Tapered Wood Leg */}
            <mesh castShadow>
              <cylinderGeometry args={[0.026, 0.016, 1.34, 16]} />
              <meshStandardMaterial color="#B45309" roughness={0.5} />
            </mesh>
            {/* Brass Cap / Ferrule at foot */}
            <mesh position={[0, -0.62, 0]} castShadow>
              <cylinderGeometry args={[0.017, 0.015, 0.08, 16]} />
              <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Vertical Black Spine Book / Partner Showcase on Right Side */}
        <group position={[0.92, 0.3, -0.05]} rotation={[0, 0.25, 0]} castShadow>
          <mesh castShadow>
            <boxGeometry args={[0.07, 0.54, 0.34]} />
            <meshStandardMaterial color="#0F172A" roughness={0.35} />
          </mesh>
          {/* Spine Face with W / Premium Partner texture */}
          <mesh position={[-0.036, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.34, 0.54]} />
            <meshBasicMaterial map={partnerSpineTexture} />
          </mesh>
        </group>
      </group>

      {/* =========================================
          2. Under-Desk Gaming Console (White PS5 Vertical)
         ========================================= */}
      <group position={[-0.72, 0.38, 0.15]} rotation={[0, -0.08, 0]}>
        {/* Black Glossy Core Body */}
        <mesh castShadow>
          <boxGeometry args={[0.09, 0.65, 0.34]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Left Curved White Wing Faceplate */}
        <mesh position={[-0.055, 0.01, 0]} rotation={[0, 0, -0.04]} castShadow>
          <boxGeometry args={[0.014, 0.69, 0.36]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* Right Curved White Wing Faceplate */}
        <mesh position={[0.055, 0.01, 0]} rotation={[0, 0, 0.04]} castShadow>
          <boxGeometry args={[0.014, 0.69, 0.36]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* PS5 Blue LED Accent Strip */}
        <mesh position={[0, 0.31, 0.171]}>
          <planeGeometry args={[0.06, 0.01]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
        {/* PS5 Circular Stand Base */}
        <mesh position={[0, -0.34, 0]} receiveShadow>
          <cylinderGeometry args={[0.11, 0.12, 0.02, 20]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} />
        </mesh>
      </group>

      {/* =========================================
          3. Sleek Ultrawide Display (Silver Stand & Slim Bezel)
         ========================================= */}
      <group
        position={[0, 2.15, -0.18]}
        onClick={handleMonitorClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setScreenHovered(true);
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setScreenHovered(false);
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        {/* Aluminum Stand Base (Sleek Rectangular) */}
        <mesh position={[0, -0.73, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.016, 0.22]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Aluminum Vertical Stem */}
        <mesh position={[0, -0.38, -0.04]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.03]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Monitor Rear Chassis */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.82, 0.86, 0.04]} />
          <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Lower Silver Chin Bar (iMac / Studio Display Aesthetic) */}
        <mesh position={[0, -0.4, 0.022]} castShadow>
          <boxGeometry args={[1.82, 0.06, 0.015]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* OLED Display Surface */}
        <mesh position={[0, 0.03, 0.022]}>
          <planeGeometry args={[1.78, 0.78]} />
          <meshStandardMaterial
            color={activeProject ? activeProject.color : '#0B0F19'}
            emissive={activeProject ? activeProject.color : '#0B132B'}
            emissiveIntensity={screenHovered ? 0.6 : 0.25}
            roughness={0.2}
          />
        </mesh>

        {/* Interactive UI Overlay */}
        <Html position={[0, 0.03, 0.03]} center distanceFactor={6} pointerEvents="none">
          <div className="flex flex-col items-center justify-center p-2 text-center w-[190px] select-none">
            {activeProject ? (
              <div className="bg-black/85 backdrop-blur-md border border-white/20 p-2.5 rounded-lg shadow-2xl w-full">
                <div className="text-[10px] uppercase font-bold tracking-widest text-sky-400">
                  SYSTEM READY
                </div>
                <div className="text-xs font-black text-white mt-0.5 line-clamp-1">
                  {activeProject.title}
                </div>
                <div className="text-[9px] text-amber-300 font-semibold mt-1">
                  {activeProject.metrics}
                </div>
                <div className="text-[8px] text-slate-300 mt-1 uppercase tracking-wider">
                  Click to open full case study ▶
                </div>
              </div>
            ) : (
              <div className="bg-black/75 backdrop-blur-sm border border-slate-700/60 p-2 rounded-lg text-slate-400">
                <div className="text-[10px] font-mono text-emerald-400">
                  &gt; BETTAYEB_OS v9.2
                </div>
                <div className="text-[9px] text-slate-300 mt-1">
                  Insert a retro cartridge on the shelf to boot project
                </div>
              </div>
            )}
          </div>
        </Html>
      </group>

      {/* =========================================
          4. Slim Keyboard & Apple-Style White Mouse
         ========================================= */}
      {/* Keyboard Base */}
      <group position={[0, 1.45, 0.14]}>
        <mesh castShadow>
          <boxGeometry args={[0.66, 0.016, 0.2]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Keyboard Keycap Surface */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.63, 0.008, 0.17]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
      </group>

      {/* Minimalist White Wireless Mouse (Directly on Desk, No Bulky Pad) */}
      <group position={[0.48, 1.455, 0.14]}>
        <mesh castShadow>
          <boxGeometry args={[0.075, 0.022, 0.13]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
        </mesh>
      </group>

      {/* =========================================
          5. Forest Green Water Flask
         ========================================= */}
      <group position={[-0.52, 1.57, 0.14]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.048, 0.048, 0.26, 20]} />
          <meshStandardMaterial color="#166534" roughness={0.35} />
        </mesh>
        {/* Silver Neck & Cap */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.032, 0.036, 0.04, 16]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Cap Loop */}
        <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.018, 0.005, 8, 16]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* =========================================
          6. Interactive Desk Lamp
         ========================================= */}
      <DeskLamp position={[-0.86, 1.44, 0.08]} rotation={[0, 0.3, 0]} />
    </group>
  );
}
