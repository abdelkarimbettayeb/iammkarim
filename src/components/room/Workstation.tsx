'use client';

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { useRoomStore } from '@/store/useRoomStore';
import { cartridgeProjects } from '@/data/resumeData';
import { DeskLamp } from './DeskLamp';

export function Workstation() {
  const deskX = -1.8;
  const deskY = 1.55;
  const deskZ = -2.2;

  const [screenHovered, setScreenHovered] = useState(false);
  const activeCartridge = useRoomStore((state) => state.activeCartridge);
  const setActiveZone = useRoomStore((state) => state.setActiveZone);

  const activeProject = activeCartridge ? cartridgeProjects[activeCartridge] : null;

  const handleMonitorClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setActiveZone('workstation');
  };

  return (
    <group name="workstation">
      {/* =========================================
          1. Teak Desk Surface & Metal Legs
         ========================================= */}
      <group position={[deskX, deskY, deskZ]}>
        {/* Teak Tabletop Plank */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.08, 1.35]} />
          <meshStandardMaterial color="#D96B27" roughness={0.55} />
        </mesh>

        {/* 4 Tapered Metal Legs */}
        {[
          [-1.25, -0.75, -0.55],
          [1.25, -0.75, -0.55],
          [-1.25, -0.75, 0.55],
          [1.25, -0.75, 0.55],
        ].map(([lx, ly, lz], i) => (
          <mesh key={i} position={[lx, ly, lz]} castShadow>
            <cylinderGeometry args={[0.025, 0.018, 1.45, 12]} />
            <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.8} />
          </mesh>
        ))}

        {/* Small Under-Desk Cable Management Box */}
        <mesh position={[0.4, -0.12, -0.3]}>
          <boxGeometry args={[0.9, 0.12, 0.25]} />
          <meshStandardMaterial color="#1E2024" roughness={0.7} />
        </mesh>
      </group>

      {/* =========================================
          2. Under-Desk Gaming Console (PS5 Style)
         ========================================= */}
      <group position={[deskX - 0.95, 0.45, deskZ + 0.1]} rotation={[0, -0.15, 0]}>
        {/* Dark Core Body */}
        <mesh castShadow>
          <boxGeometry args={[0.14, 0.72, 0.42]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.5} />
        </mesh>
        {/* Left Curved White Wing */}
        <mesh position={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.02, 0.76, 0.44]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* Right Curved White Wing */}
        <mesh position={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.02, 0.76, 0.44]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* Power LED Slit */}
        <mesh position={[0, 0.32, 0.215]}>
          <planeGeometry args={[0.08, 0.015]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      </group>

      {/* =========================================
          3. Ultrawide Interactive Monitor
         ========================================= */}
      <group
        position={[deskX, deskY + 0.88, deskZ - 0.22]}
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
        {/* Metallic Stand Base */}
        <mesh position={[0, -0.84, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.24, 0.025, 20]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.25} metalness={0.9} />
        </mesh>
        {/* Vertical Stand Column */}
        <mesh position={[0, -0.42, -0.05]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.82, 12]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* Outer Monitor Enclosure (Bezel) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.95, 0.06]} />
          <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Active Emissive Display Screen */}
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[1.92, 0.87]} />
          <meshStandardMaterial
            color={activeProject ? activeProject.color : '#0F172A'}
            emissive={activeProject ? activeProject.color : '#0284C7'}
            emissiveIntensity={screenHovered ? 0.75 : 0.45}
            roughness={0.2}
          />
        </mesh>

        {/* Floating Screen Overlay Label */}
        <Html position={[0, 0, 0.04]} center distanceFactor={6} pointerEvents="none">
          <div className="flex flex-col items-center justify-center p-2 text-center w-[210px] select-none">
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
          4. Mechanical Keyboard & Mouse
         ========================================= */}
      {/* Keyboard */}
      <group position={[deskX, deskY + 0.06, deskZ + 0.18]}>
        <mesh castShadow>
          <boxGeometry args={[0.74, 0.03, 0.26]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} />
        </mesh>
        {/* Keycaps Matrix Surface */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.68, 0.015, 0.22]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
      </group>

      {/* Mouse & Mousepad */}
      <group position={[deskX + 0.62, deskY + 0.05, deskZ + 0.18]}>
        {/* Mousepad */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[0.34, 0.005, 0.38]} />
          <meshStandardMaterial color="#0F172A" roughness={0.8} />
        </mesh>
        {/* Ergonomic White Mouse */}
        <mesh position={[0, 0.025, 0]} castShadow>
          <boxGeometry args={[0.11, 0.035, 0.18]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
      </group>

      {/* =========================================
          5. Thermos Water Bottle (Green)
         ========================================= */}
      <group position={[deskX - 0.65, deskY + 0.2, deskZ + 0.15]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.32, 16]} />
          <meshStandardMaterial color="#15803D" roughness={0.4} />
        </mesh>
        {/* Silver Cap */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.06, 16]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* =========================================
          6. Interactive Desk Lamp
         ========================================= */}
      <DeskLamp position={[deskX - 1.15, deskY + 0.04, deskZ - 0.2]} />

      {/* =========================================
          7. Modern Eames-Style Desk Chair
         ========================================= */}
      <group position={[deskX, 0, deskZ + 1.15]} rotation={[0, Math.PI, 0]}>
        {/* Molded White Shell Seat */}
        <mesh position={[0, 0.82, 0]} castShadow>
          <boxGeometry args={[0.68, 0.06, 0.62]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
        </mesh>
        {/* Curved Backrest */}
        <mesh position={[0, 1.15, 0.26]} rotation={[-0.18, 0, 0]} castShadow>
          <boxGeometry args={[0.62, 0.65, 0.05]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
        </mesh>

        {/* 4 Wooden Dowel Legs (Angled Outward) */}
        {[
          [-0.24, 0.4, -0.22, 0.18, -0.18],
          [0.24, 0.4, -0.22, 0.18, 0.18],
          [-0.24, 0.4, 0.22, -0.18, -0.18],
          [0.24, 0.4, 0.22, -0.18, 0.18],
        ].map(([lx, ly, lz, rx, rz], i) => (
          <mesh key={i} position={[lx, ly, lz]} rotation={[rx, 0, rz]} castShadow>
            <cylinderGeometry args={[0.02, 0.014, 0.82, 10]} />
            <meshStandardMaterial color="#78350F" roughness={0.6} />
          </mesh>
        ))}

        {/* Black Metal Criss-Cross Frame Struts */}
        <mesh position={[0, 0.76, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.03, 8]} />
          <meshStandardMaterial color="#1E2024" roughness={0.5} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
