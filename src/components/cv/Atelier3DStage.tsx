'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { cartridgeProjects, personalInfo } from '@/data/resumeData';
import { playSound } from '@/lib/audioEngine';
import type { CartridgeId, CartridgeProject } from '@/types/room';
import { FoldedPrism3D } from './FoldedPrism3D';

export type AtelierMode = 'atelier' | 'core';

export interface Atelier3DStageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  activeProjectId: CartridgeId | null;
  onSelectProject: (id: CartridgeId | null) => void;
  onOpenCaseStudy: (id: CartridgeId) => void;
}

const PROJECT_ORDER: CartridgeId[] = ['jud', 'alnurayn', 'freelance', 'mouser', 'meuble', 'algmath'];

const PROJECT_CARD_META: Record<CartridgeId, { name: string; tag: string }> = {
  jud: { name: 'Jud Enterprise', tag: 'Lead · NestJS' },
  alnurayn: { name: 'Alnurayn Library', tag: 'C++ Search · RAG' },
  freelance: { name: 'Mostaql · 32 Apps', tag: '5.0★ · 30 Reviews' },
  mouser: { name: 'Mouser KVM', tag: 'Open Source · LAN' },
  meuble: { name: 'Meuble SaaS', tag: 'Commerce · 10-Step' },
  algmath: { name: 'BAC 3AS Maths', tag: 'PWA · AR/FR/EN' },
};

const PROJECT_SHORT_LABELS: Record<CartridgeId, string> = {
  jud: PROJECT_CARD_META.jud.name,
  alnurayn: PROJECT_CARD_META.alnurayn.name,
  freelance: PROJECT_CARD_META.freelance.name,
  mouser: PROJECT_CARD_META.mouser.name,
  meuble: PROJECT_CARD_META.meuble.name,
  algmath: PROJECT_CARD_META.algmath.name,
};

interface StackLayerSpec {
  code: string;
  shortLabel: string;
  title: string;
  stack: string;
  color: string;
  yBase: number;
  width: number;
  depth: number;
}

const STACK_LAYERS: StackLayerSpec[] = [
  {
    code: 'L1',
    shortLabel: 'Infra',
    title: 'Infrastructure',
    stack: 'PostgreSQL · Redis · Docker · Caddy CI/CD',
    color: '#F59E0B',
    yBase: -0.52,
    width: 1.92,
    depth: 1.48,
  },
  {
    code: 'L2',
    shortLabel: 'Systems',
    title: 'Systems & Native',
    stack: 'C++ N-API · C# .NET 8 · AES-GCM · RSA',
    color: '#E0441B',
    yBase: -0.26,
    width: 1.72,
    depth: 1.32,
  },
  {
    code: 'L3',
    shortLabel: 'Backend',
    title: 'Backend & AI',
    stack: 'Node.js · NestJS · BullMQ · pgvector RAG',
    color: '#22C55E',
    yBase: 0.0,
    width: 1.54,
    depth: 1.18,
  },
  {
    code: 'L4',
    shortLabel: 'API',
    title: 'API & Realtime',
    stack: 'GraphQL · Prisma · REST · Socket.IO',
    color: '#A855F7',
    yBase: 0.26,
    width: 1.36,
    depth: 1.04,
  },
  {
    code: 'L5',
    shortLabel: 'Frontend',
    title: 'Web & Mobile',
    stack: 'React 19 · Next.js 16 · TypeScript · Expo',
    color: '#0EA5E9',
    yBase: 0.52,
    width: 1.18,
    depth: 0.9,
  },
];

const PALETTE = {
  ringLight: new THREE.Color('#CBD5E1'),
  ringDark: new THREE.Color('#475569'),
  slabLight: new THREE.Color('#F5F5F2'),
  slabDark: new THREE.Color('#222229'),
};

/**
 * Reusable meshStandardMaterial that smoothly morphs between Light and Dark theme colors.
 */
function MorphedMaterial({
  lightColor,
  darkColor,
  lightRoughness = 0.3,
  darkRoughness,
  metalness = 0.1,
  blendRef,
}: {
  lightColor: string;
  darkColor: string;
  lightRoughness?: number;
  darkRoughness?: number;
  metalness?: number;
  blendRef: React.MutableRefObject<number>;
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const cLight = useMemo(() => new THREE.Color(lightColor), [lightColor]);
  const cDark = useMemo(() => new THREE.Color(darkColor), [darkColor]);

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;
    const b = blendRef.current;
    mat.color.lerpColors(cLight, cDark, b);
    if (darkRoughness !== undefined) {
      mat.roughness = THREE.MathUtils.lerp(lightRoughness, darkRoughness, b);
    }
  });

  return (
    <meshStandardMaterial
      ref={matRef}
      color={lightColor}
      roughness={lightRoughness}
      metalness={metalness}
    />
  );
}

/**
 * Builds a clean chamfered rounded-rectangle slab centered on origin in XZ, lying flat along Y.
 */
function createRoundedSlabGeometry(
  width: number,
  depth: number,
  height: number,
  radius: number,
  bevelSize = 0.012
): THREE.ExtrudeGeometry {
  const hw = width / 2 - radius;
  const hd = depth / 2 - radius;
  const shape = new THREE.Shape();

  shape.moveTo(-hw, -depth / 2);
  shape.lineTo(hw, -depth / 2);
  shape.quadraticCurveTo(width / 2, -depth / 2, width / 2, -hd);
  shape.lineTo(width / 2, hd);
  shape.quadraticCurveTo(width / 2, depth / 2, hw, depth / 2);
  shape.lineTo(-hw, depth / 2);
  shape.quadraticCurveTo(-width / 2, depth / 2, -width / 2, hd);
  shape.lineTo(-width / 2, -hd);
  shape.quadraticCurveTo(-width / 2, -depth / 2, -hw, -depth / 2);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.005, height - bevelSize * 2),
    bevelEnabled: true,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 3,
    curveSegments: 12,
  });

  geo.rotateX(-Math.PI / 2);
  geo.center();
  return geo;
}

/**
 * Renders a sharp 2048x1024 adaptive Light/Dark editorial UI screen texture for the 3D Studio Display.
 */
function drawStudioScreenTexture(
  project: CartridgeProject | null,
  isDark: boolean,
  isHovered: boolean
): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const W = 2048;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const bg = isDark ? '#18181C' : '#FFFFFF';
  const surface = isDark ? '#202026' : '#F6F6F4';
  const surfaceAlt = isDark ? '#282830' : '#EEEEEA';
  const ink = isDark ? '#EDEDF0' : '#111113';
  const inkMuted = isDark ? '#9494A0' : '#64646D';
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(17,17,19,0.1)';
  const accent = project ? project.color : isDark ? '#FF572E' : '#E0441B';

  const roundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill?: string,
    stroke?: string,
    lw = 2
  ) => {
    ctx.beginPath();
    const rad = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.stroke();
    }
  };

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,17,19,0.06)';
  for (let x = 48; x < W; x += 48) {
    for (let y = 96; y < H; y += 48) {
      ctx.fillRect(x, y, 3, 3);
    }
  }

  ctx.fillStyle = surface;
  ctx.fillRect(0, 0, W, 82);
  ctx.fillStyle = border;
  ctx.fillRect(0, 81, W, 2);

  // Folded Prism Mark 07 (unboxed, bold directly on display bar)
  ctx.save();
  ctx.translate(42, 17);
  ctx.scale(48 / 44, 48 / 44);
  ctx.translate(-10, -10);

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(11, 52);
  ctx.lineTo(27.5, 11);
  ctx.lineTo(36.5, 11);
  ctx.lineTo(21, 52);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.72;
  ctx.beginPath();
  ctx.moveTo(27.5, 11);
  ctx.lineTo(36.5, 11);
  ctx.lineTo(53, 52);
  ctx.lineTo(43, 52);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(32, 27.5);
  ctx.lineTo(39.56, 47.5);
  ctx.lineTo(24.44, 47.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = ink;
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(
    project ? `MODULE // ${project.title.toUpperCase()}` : 'ATELIER_OS // SYSTEMS ARCHITECTURE',
    108,
    42
  );

  roundRect(W - 350, 21, 304, 40, 20, surfaceAlt, border, 2);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(W - 322, 41, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.font = 'bold 17px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(project ? 'CARTRIDGE MOUNTED' : '30+ APPS SHIPPED', W - 304, 42);

  if (!project) {
    roundRect(54, 128, 880, 820, 24, surface, border, 2);

    roundRect(96, 174, 240, 42, 21, isDark ? 'rgba(255,87,46,0.16)' : 'rgba(224,68,27,0.1)');
    ctx.fillStyle = accent;
    ctx.font = 'bold 18px monospace';
    ctx.fillText('DOSSIER // 01', 120, 196);

    ctx.fillStyle = ink;
    ctx.font = 'bold 64px system-ui, sans-serif';
    ctx.fillText(personalInfo.name, 96, 286);

    ctx.fillStyle = inkMuted;
    ctx.font = '500 32px system-ui, sans-serif';
    ctx.fillText(personalInfo.role, 96, 352);

    const metrics = [
      { v: '9+ Yrs', l: 'EXPERIENCE' },
      { v: '30+', l: 'PLATFORMS' },
      { v: '5.0 / 5', l: 'RATING' },
    ];
    metrics.forEach((m, idx) => {
      const mx = 96 + idx * 268;
      roundRect(mx, 428, 248, 170, 16, bg, border, 2);
      ctx.fillStyle = idx === 1 ? accent : ink;
      ctx.font = 'bold 50px system-ui, sans-serif';
      ctx.fillText(m.v, mx + 24, 502);
      ctx.fillStyle = inkMuted;
      ctx.font = 'bold 17px monospace';
      ctx.fillText(m.l, mx + 24, 558);
    });

    roundRect(96, 650, 796, 240, 18, bg, isHovered ? accent : border, isHovered ? 3 : 2);
    ctx.fillStyle = accent;
    ctx.font = 'bold 20px monospace';
    ctx.fillText('TACTILE HARDWARE CONTROLS', 132, 706);
    ctx.fillStyle = ink;
    ctx.font = '500 28px system-ui, sans-serif';
    ctx.fillText('• Click any right-side blade to load a project', 132, 766);
    ctx.fillText('• Click the studio lamp switch to toggle Light / Dark', 132, 818);
    ctx.fillStyle = inkMuted;
    ctx.font = '500 24px system-ui, sans-serif';
    ctx.fillText('• Turn the vermilion rotary knob to cycle modules', 132, 864);

    roundRect(974, 128, 1020, 820, 24, surface, border, 2);
    roundRect(974, 128, 1020, 68, 24, surfaceAlt);
    ctx.fillStyle = inkMuted;
    ctx.font = 'bold 20px monospace';
    ctx.fillText('engineer.config.ts', 1022, 164);

    const codeLines: Array<[string, string][]> = [
      [
        ['export const ', accent],
        ['architect ', ink],
        ['= {', inkMuted],
      ],
      [
        ['  name: ', inkMuted],
        ['"Abdelkarim Bettayeb"', isDark ? '#4ADE80' : '#15803D'],
        [',', inkMuted],
      ],
      [
        ['  standing: ', inkMuted],
        ['"Top 5% M.Sc. Computer Science"', isDark ? '#4ADE80' : '#15803D'],
        [',', inkMuted],
      ],
      [
        ['  core: [', inkMuted],
        ['"TypeScript"', accent],
        [', ', inkMuted],
        ['"React / Next.js"', accent],
        ['],', inkMuted],
      ],
      [
        ['  backend: [', inkMuted],
        ['"Node.js"', isDark ? '#38BDF8' : '#0284C7'],
        [', ', inkMuted],
        ['"NestJS"', isDark ? '#38BDF8' : '#0284C7'],
        [', ', inkMuted],
        ['"PostgreSQL"', isDark ? '#38BDF8' : '#0284C7'],
        ['],', inkMuted],
      ],
      [
        ['  native: [', inkMuted],
        ['"C++ Addons"', isDark ? '#FBBF24' : '#B45309'],
        [', ', inkMuted],
        ['"C# .NET WPF"', isDark ? '#FBBF24' : '#B45309'],
        ['],', inkMuted],
      ],
      [
        ['  workflow: ', inkMuted],
        ['"AI-Accelerated Production"', ink],
        [',', inkMuted],
      ],
      [
        ['  status: ', inkMuted],
        ['"OPEN_TO_OPPORTUNITIES"', isDark ? '#4ADE80' : '#15803D'],
      ],
      [['};', inkMuted]],
    ];

    let cy = 266;
    ctx.font = '27px monospace';
    codeLines.forEach((tokens, lineIdx) => {
      ctx.fillStyle = inkMuted;
      ctx.textAlign = 'right';
      ctx.fillText(String(lineIdx + 1).padStart(2, '0'), 1030, cy);
      ctx.textAlign = 'left';
      let tx = 1064;
      tokens.forEach(([txt, col]) => {
        ctx.fillStyle = col;
        ctx.fillText(txt, tx, cy);
        tx += ctx.measureText(txt).width;
      });
      cy += 64;
    });
  } else {
    const idx = PROJECT_ORDER.indexOf(project.id) + 1;
    roundRect(54, 128, 1940, 820, 24, surface, border, 2);

    roundRect(104, 180, 290, 46, 23, `${accent}24`, accent, 2);
    ctx.fillStyle = accent;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`BLADE 0${idx} // LOADED`, 132, 204);

    ctx.fillStyle = ink;
    ctx.font = 'bold 68px system-ui, sans-serif';
    ctx.fillText(project.title, 104, 296);

    ctx.fillStyle = inkMuted;
    ctx.font = '500 30px system-ui, sans-serif';
    ctx.fillText(project.subtitle, 104, 360);

    roundRect(104, 422, 1840, 126, 18, bg, border, 2);
    ctx.fillStyle = accent;
    ctx.fillRect(104, 422, 10, 126);
    ctx.font = 'bold 18px monospace';
    ctx.fillText('VERIFIED OUTCOME', 146, 462);
    ctx.fillStyle = ink;
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.fillText(project.metrics, 146, 510);

    ctx.fillStyle = ink;
    ctx.font = '500 28px system-ui, sans-serif';
    const desc = project.description[0] || '';
    const words = desc.split(' ');
    let line = '';
    let ly = 612;
    words.forEach((w) => {
      const test = `${line}${w} `;
      if (ctx.measureText(test).width > 1800) {
        ctx.fillText(line, 104, ly);
        line = `${w} `;
        ly += 42;
      } else {
        line = test;
      }
    });
    ctx.fillText(line, 104, ly);

    let sx = 104;
    const chipY = 742;
    ctx.font = 'bold 20px monospace';
    project.stack.slice(0, 6).forEach((tech) => {
      const label = tech.toUpperCase();
      const cw = ctx.measureText(label).width + 44;
      roundRect(sx, chipY, cw, 50, 12, bg, border, 2);
      ctx.fillStyle = ink;
      ctx.fillText(label, sx + 22, chipY + 26);
      sx += cw + 16;
    });

    roundRect(104, 836, 1840, 74, 16, isHovered ? accent : ink);
    ctx.fillStyle = isHovered ? '#FFFFFF' : bg;
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLICK 3D DISPLAY TO OPEN FULL CASE STUDY ↗', 1024, 874);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Mode 1: Sculptural Mini Industrial Workstation ("Atelier Desk-01")
 */
function AtelierWorkstation({
  isDark,
  themeBlendRef,
  activeProjectId,
  onSelectProject,
  onOpenCaseStudy,
  onToggleTheme,
  onHoverHint,
}: {
  isDark: boolean;
  themeBlendRef: React.MutableRefObject<number>;
  activeProjectId: CartridgeId | null;
  onSelectProject: (id: CartridgeId | null) => void;
  onOpenCaseStudy: (id: CartridgeId) => void;
  onToggleTheme: () => void;
  onHoverHint: (hint: string | null) => void;
}) {
  const [hoveredBlade, setHoveredBlade] = useState<CartridgeId | null>(null);
  const [screenHovered, setScreenHovered] = useState(false);
  const [knobPressed, setKnobPressed] = useState(false);
  const [lampHovered, setLampHovered] = useState(false);

  const knobGroupRef = useRef<THREE.Group>(null);
  const rockerRef = useRef<THREE.Mesh>(null);
  const lampBulbMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const lampSpotRef = useRef<THREE.SpotLight>(null);
  const prismGroupRef = useRef<THREE.Group>(null);
  const bladeRefs = useRef<Record<string, THREE.Group | null>>({});

  // Custom chamfered geometries (memoized + disposed cleanly)
  const deskSlabGeo = useMemo(() => createRoundedSlabGeometry(3.45, 1.44, 0.085, 0.14, 0.014), []);
  const trimSlabGeo = useMemo(() => createRoundedSlabGeometry(3.22, 1.24, 0.032, 0.11, 0.008), []);
  const keyboardChassisGeo = useMemo(() => createRoundedSlabGeometry(0.92, 0.34, 0.032, 0.04, 0.006), []);
  const bladeDockGeo = useMemo(() => createRoundedSlabGeometry(0.68, 0.42, 0.055, 0.04, 0.008), []);
  const bladeBodyGeo = useMemo(() => createRoundedSlabGeometry(0.065, 0.28, 0.28, 0.015, 0.006), []);

  useEffect(() => {
    return () => {
      deskSlabGeo.dispose();
      trimSlabGeo.dispose();
      keyboardChassisGeo.dispose();
      bladeDockGeo.dispose();
      bladeBodyGeo.dispose();
    };
  }, [deskSlabGeo, trimSlabGeo, keyboardChassisGeo, bladeDockGeo, bladeBodyGeo]);

  // Adaptive 2K screen texture
  const activeProject = activeProjectId ? cartridgeProjects[activeProjectId] : null;
  const screenTexture = useMemo(
    () => drawStudioScreenTexture(activeProject, isDark, screenHovered),
    [activeProject, isDark, screenHovered]
  );

  useEffect(() => {
    return () => {
      screenTexture.dispose();
    };
  }, [screenTexture]);

  useFrame((state, delta) => {
    const b = themeBlendRef.current;

    if (lampBulbMatRef.current) {
      lampBulbMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(0.9, 2.4, b);
    }
    if (lampSpotRef.current) {
      lampSpotRef.current.intensity = THREE.MathUtils.lerp(0.75, 3.6, b);
    }
    if (rockerRef.current) {
      const targetTilt = isDark ? -0.28 : 0.28;
      rockerRef.current.rotation.z = THREE.MathUtils.damp(rockerRef.current.rotation.z, targetTilt, 14, delta);
    }
    if (knobGroupRef.current) {
      const targetY = knobPressed ? 0.015 : 0.028;
      knobGroupRef.current.position.y = THREE.MathUtils.damp(knobGroupRef.current.position.y, targetY, 18, delta);
      const activeIdx = activeProjectId ? PROJECT_ORDER.indexOf(activeProjectId) : 0;
      const targetRotY = activeIdx * ((Math.PI * 2) / PROJECT_ORDER.length);
      knobGroupRef.current.rotation.y = THREE.MathUtils.damp(knobGroupRef.current.rotation.y, targetRotY, 10, delta);
    }
    if (prismGroupRef.current) {
      prismGroupRef.current.rotation.y += delta * 0.55;
      prismGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.18;
    }

    PROJECT_ORDER.forEach((id) => {
      const grp = bladeRefs.current[id];
      if (!grp) return;
      const isActive = activeProjectId === id;
      const isHov = hoveredBlade === id;
      const targetY = isActive ? 0.24 : isHov ? 0.16 : 0.095;
      const targetZ = isActive ? 0.04 : 0;
      grp.position.y = THREE.MathUtils.damp(grp.position.y, targetY, 12, delta);
      grp.position.z = THREE.MathUtils.damp(grp.position.z, targetZ, 12, delta);
    });
  });

  const cycleNextProject = () => {
    playSound('cartridge');
    setKnobPressed(true);
    window.setTimeout(() => setKnobPressed(false), 160);
    if (!activeProjectId) {
      onSelectProject(PROJECT_ORDER[0]);
      return;
    }
    const next = (PROJECT_ORDER.indexOf(activeProjectId) + 1) % PROJECT_ORDER.length;
    onSelectProject(PROJECT_ORDER[next]);
  };

  return (
    <group position={[0, -0.68, 0]}>
      {/* 1. CHAMFERED FLOATING DESK SLAB + MILLED SUBFRAME + 4 TAPERED LEGS */}
      <group position={[0, 0.72, 0]}>
        <mesh geometry={deskSlabGeo} castShadow receiveShadow>
          <MorphedMaterial
            lightColor="#FAF9F6"
            darkColor="#24242C"
            lightRoughness={0.32}
            darkRoughness={0.46}
            metalness={0.08}
            blendRef={themeBlendRef}
          />
        </mesh>
        <mesh geometry={trimSlabGeo} position={[0, -0.046, 0]} castShadow>
          <MorphedMaterial
            lightColor="#DFE2E8"
            darkColor="#2B2D36"
            lightRoughness={0.25}
            metalness={0.82}
            blendRef={themeBlendRef}
          />
        </mesh>

        {/* 4 Precision Tapered Legs */}
        {[
          [-1.42, -0.39, -0.52, 0.09, -0.09],
          [1.42, -0.39, -0.52, 0.09, 0.09],
          [-1.42, -0.39, 0.52, -0.09, -0.09],
          [1.42, -0.39, 0.52, -0.09, 0.09],
        ].map(([lx, ly, lz, rx, rz], i) => (
          <group key={i} position={[lx, ly, lz]} rotation={[rx, 0, rz]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.026, 0.015, 0.74, 20]} />
              <MorphedMaterial
                lightColor="#C8CBD2"
                darkColor="#272932"
                lightRoughness={0.25}
                metalness={0.85}
                blendRef={themeBlendRef}
              />
            </mesh>
            <mesh position={[0, -0.355, 0]}>
              <cylinderGeometry args={[0.017, 0.019, 0.03, 18]} />
              <meshStandardMaterial color="#E0441B" roughness={0.35} metalness={0.45} />
            </mesh>
          </group>
        ))}

        {/* Flush Machined Desk Marquetry Inlay (Front-Left Tabletop) */}
        <FoldedPrism3D
          position={[-1.12, 0.043, 0.41]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.36}
          depth={0.012}
          bevel={0.002}
          primaryColor="#18181D"
          primaryDarkColor="#E4E4EA"
          secondaryColor="#52525B"
          secondaryDarkColor="#94A3B8"
          accentColor="#E0441B"
          accentDarkColor="#FF572E"
          blendRef={themeBlendRef}
          metalness={0.55}
          roughness={0.24}
          accentEmissive={isDark ? 0.55 : 0.1}
        />
        <mesh position={[-1.12, 0.0435, 0.62]} receiveShadow>
          <boxGeometry args={[0.32, 0.004, 0.008]} />
          <MorphedMaterial
            lightColor="#E0441B"
            darkColor="#FF572E"
            lightRoughness={0.28}
            metalness={0.45}
            blendRef={themeBlendRef}
          />
        </mesh>

        {/* 2. CANTILEVERED ULTRA-THIN STUDIO DISPLAY */}
        <group
          position={[-0.14, 0.62, -0.24]}
          onClick={(e) => {
            e.stopPropagation();
            if (activeProjectId) {
              onOpenCaseStudy(activeProjectId);
            } else {
              playSound('cartridge');
              onSelectProject('jud');
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setScreenHovered(true);
            if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
            onHoverHint(
              activeProjectId
                ? `STUDIO DISPLAY · Click to open ${PROJECT_SHORT_LABELS[activeProjectId]} case study`
                : 'STUDIO DISPLAY · Click to load project module'
            );
          }}
          onPointerOut={() => {
            setScreenHovered(false);
            if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
            onHoverHint(null);
          }}
        >
          <mesh position={[0, -0.568, -0.06]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.018, 0.26]} />
            <MorphedMaterial
              lightColor="#DFE2E8"
              darkColor="#2B2D36"
              lightRoughness={0.24}
              metalness={0.85}
              blendRef={themeBlendRef}
            />
          </mesh>
          <mesh position={[0, -0.28, -0.11]} rotation={[-0.08, 0, 0]} castShadow>
            <boxGeometry args={[0.085, 0.58, 0.028]} />
            <MorphedMaterial
              lightColor="#DFE2E8"
              darkColor="#2B2D36"
              lightRoughness={0.24}
              metalness={0.85}
              blendRef={themeBlendRef}
            />
          </mesh>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.94, 0.99, 0.036]} />
            <MorphedMaterial
              lightColor="#DFE2E8"
              darkColor="#2B2D36"
              lightRoughness={0.22}
              metalness={0.88}
              blendRef={themeBlendRef}
            />
          </mesh>
          <mesh position={[0, 0, 0.016]}>
            <boxGeometry args={[1.88, 0.93, 0.01]} />
            <meshStandardMaterial color="#0A0A0E" roughness={0.2} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={[1.82, 0.91]} />
            <meshStandardMaterial
              map={screenTexture}
              emissiveMap={screenTexture}
              emissive="#FFFFFF"
              emissiveIntensity={isDark ? (screenHovered ? 0.92 : 0.78) : screenHovered ? 0.42 : 0.28}
              roughness={0.18}
              metalness={0.04}
            />
          </mesh>
        </group>

        {/* 3. 65% MECHANICAL ALUMINUM KEYBOARD + ROTARY ENCODER KNOB */}
        <group position={[-0.14, 0.058, 0.34]} rotation={[0.065, 0, 0]}>
          <mesh geometry={keyboardChassisGeo} castShadow receiveShadow>
            <MorphedMaterial
              lightColor="#EDECE8"
              darkColor="#1F2028"
              lightRoughness={0.3}
              metalness={0.72}
              blendRef={themeBlendRef}
            />
          </mesh>

          {[-0.095, -0.032, 0.031, 0.094].map((rz, rowIdx) =>
            Array.from({ length: 11 }).map((_, colIdx) => {
              const isEsc = rowIdx === 0 && colIdx === 0;
              const isEnter = rowIdx === 2 && colIdx === 10;
              const isSpace = rowIdx === 3 && colIdx >= 3 && colIdx <= 7;
              if (rowIdx === 3 && colIdx > 3 && colIdx <= 7) return null;

              const kx = isSpace ? -0.02 : -0.375 + colIdx * 0.066;
              const kw = isSpace ? 0.31 : isEnter ? 0.075 : 0.052;
              return (
                <mesh key={`${rowIdx}-${colIdx}`} position={[kx, 0.024, rz]} castShadow>
                  <boxGeometry args={[kw, 0.018, 0.048]} />
                  {isEsc ? (
                    <meshStandardMaterial color="#E0441B" roughness={0.35} metalness={0.1} />
                  ) : isEnter ? (
                    <meshStandardMaterial color="#111113" roughness={0.35} metalness={0.2} />
                  ) : (
                    <MorphedMaterial
                      lightColor="#FFFFFF"
                      darkColor="#2D2F3A"
                      lightRoughness={0.4}
                      metalness={0.05}
                      blendRef={themeBlendRef}
                    />
                  )}
                </mesh>
              );
            })
          )}

          {/* Tactile Knurled Rotary Encoder Knob */}
          <group
            ref={knobGroupRef}
            position={[0.375, 0.028, -0.092]}
            onClick={(e) => {
              e.stopPropagation();
              cycleNextProject();
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
              onHoverHint('ROTARY KNOB · Click to cycle project blades');
            }}
            onPointerOut={() => {
              if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
              onHoverHint(null);
            }}
          >
            <mesh castShadow>
              <cylinderGeometry args={[0.042, 0.046, 0.034, 24]} />
              <meshStandardMaterial color="#E0441B" roughness={0.28} metalness={0.65} />
            </mesh>
            <mesh position={[0, 0.019, -0.022]}>
              <boxGeometry args={[0.008, 0.005, 0.016]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
            </mesh>
          </group>
        </group>

        {/* 4. 4-SLOT VERTICAL COMPUTE CARTRIDGE BAY (Right Side) */}
        <group position={[1.18, 0.068, 0.06]} rotation={[0, -0.26, 0]}>
          <mesh geometry={bladeDockGeo} castShadow receiveShadow>
            <MorphedMaterial
              lightColor="#DFE2E8"
              darkColor="#2B2D36"
              lightRoughness={0.26}
              metalness={0.82}
              blendRef={themeBlendRef}
            />
          </mesh>

          {PROJECT_ORDER.map((id, idx) => {
            const proj = cartridgeProjects[id];
            const isSelected = activeProjectId === id;
            const isHov = hoveredBlade === id;
            const spacing = PROJECT_ORDER.length > 5 ? 0.104 : 0.125;
            const bx = (idx - (PROJECT_ORDER.length - 1) / 2) * spacing;

            return (
              <group
                key={id}
                ref={(el) => {
                  bladeRefs.current[id] = el;
                }}
                position={[bx, 0.095, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  playSound('cartridge');
                  onSelectProject(isSelected ? null : id);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredBlade(id);
                  if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
                  onHoverHint(`BLADE 0${idx + 1} · ${proj.title} (Click to ${isSelected ? 'eject' : 'load'})`);
                }}
                onPointerOut={() => {
                  setHoveredBlade(null);
                  if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
                  onHoverHint(null);
                }}
              >
                <mesh geometry={bladeBodyGeo} castShadow receiveShadow>
                  <meshStandardMaterial
                    color={isSelected ? '#18181D' : isDark ? '#272933' : '#F4F4F0'}
                    roughness={0.32}
                    metalness={0.45}
                  />
                </mesh>

                <mesh position={[0, 0.02, 0.142]}>
                  <boxGeometry args={[0.028, 0.2, 0.008]} />
                  <meshStandardMaterial
                    color={proj.color}
                    emissive={proj.color}
                    emissiveIntensity={isSelected ? 0.95 : isHov ? 0.55 : 0.18}
                    roughness={0.25}
                  />
                </mesh>

                <mesh position={[0, 0.144, 0.08]}>
                  <cylinderGeometry args={[0.01, 0.01, 0.008, 12]} />
                  <meshStandardMaterial
                    color={proj.color}
                    emissive={proj.color}
                    emissiveIntensity={isSelected ? 1.5 : 0.25}
                  />
                </mesh>
              </group>
            );
          })}

          <Float speed={1.6} rotationIntensity={0.12} floatIntensity={0.16}>
            <group ref={prismGroupRef} position={[0, 0.72, -0.05]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.21, 0.008, 12, 64]} />
                <meshStandardMaterial color="#E0441B" metalness={0.85} roughness={0.2} />
              </mesh>
              <mesh rotation={[0.4, 0.5, 0]}>
                <torusGeometry args={[0.16, 0.006, 12, 48]} />
                <MorphedMaterial
                  lightColor="#DFE2E8"
                  darkColor="#64748B"
                  lightRoughness={0.18}
                  metalness={0.9}
                  blendRef={themeBlendRef}
                />
              </mesh>
              <FoldedPrism3D
                scale={0.2}
                depth={0.22}
                bevel={0.012}
                centerZ
                primaryColor="#18181D"
                primaryDarkColor="#F5F5F7"
                secondaryColor="#52525B"
                secondaryDarkColor="#94A3B8"
                accentColor={activeProject ? activeProject.color : '#E0441B'}
                accentDarkColor={activeProject ? activeProject.color : '#FF572E'}
                blendRef={themeBlendRef}
                metalness={0.6}
                roughness={0.2}
                accentEmissive={isDark ? 0.95 : 0.38}
              />
            </group>
          </Float>
        </group>

        {/* 5. INTERACTIVE ARCHITECTURAL STUDIO LAMP (Left Side — Switches Whole Site Theme) */}
        <group
          position={[-1.28, 0.045, -0.02]}
          rotation={[0, 0.42, 0]}
          onClick={(e) => {
            e.stopPropagation();
            playSound('lamp');
            onToggleTheme();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setLampHovered(true);
            if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
            onHoverHint(`STUDIO LAMP · Click to switch to ${isDark ? 'White Light' : 'Carbon Dark'} mode`);
          }}
          onPointerOut={() => {
            setLampHovered(false);
            if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
            onHoverHint(null);
          }}
        >
          <mesh position={[0, 0.024, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.17, 0.19, 0.048, 32]} />
            <MorphedMaterial
              lightColor="#EDECE8"
              darkColor="#1F2028"
              lightRoughness={0.28}
              metalness={0.75}
              blendRef={themeBlendRef}
            />
          </mesh>

          <mesh ref={rockerRef} position={[0.075, 0.056, 0.06]} castShadow>
            <boxGeometry args={[0.055, 0.018, 0.032]} />
            <meshStandardMaterial color="#E0441B" roughness={0.3} metalness={0.2} />
          </mesh>

          <mesh position={[-0.04, 0.28, 0]} rotation={[0, 0, 0.22]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.54, 14]} />
            <MorphedMaterial
              lightColor="#DFE2E8"
              darkColor="#2B2D36"
              lightRoughness={0.22}
              metalness={0.88}
              blendRef={themeBlendRef}
            />
          </mesh>

          <mesh position={[-0.1, 0.54, 0]} castShadow>
            <sphereGeometry args={[0.032, 16, 16]} />
            <meshStandardMaterial color="#E0441B" roughness={0.28} metalness={0.5} />
          </mesh>

          <mesh position={[0.05, 0.67, 0]} rotation={[0, 0, -0.78]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.44, 14]} />
            <MorphedMaterial
              lightColor="#DFE2E8"
              darkColor="#2B2D36"
              lightRoughness={0.22}
              metalness={0.88}
              blendRef={themeBlendRef}
            />
          </mesh>

          <group position={[0.22, 0.76, 0]} rotation={[0, 0, -0.42]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.085, 0.165, 0.19, 28]} />
              <meshStandardMaterial
                color={lampHovered ? '#E0441B' : isDark ? '#272933' : '#18181D'}
                roughness={0.35}
                metalness={0.4}
              />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <sphereGeometry args={[0.06, 20, 20]} />
              <meshStandardMaterial
                ref={lampBulbMatRef}
                color="#FFF7ED"
                emissive="#FFB547"
                emissiveIntensity={1.2}
                roughness={0.2}
              />
            </mesh>
            <spotLight
              ref={lampSpotRef}
              position={[0, -0.1, 0]}
              color="#FFE4B5"
              intensity={1.5}
              angle={0.72}
              penumbra={0.55}
              distance={5}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

/**
 * Mode 2: Exploded Stack Core ("Kinetic Architecture Stack")
 */
function ExplodedStackCore({
  isDark,
  themeBlendRef,
  exploded,
  selectedLayer,
  onSelectLayer,
  onToggleExplode,
  onHoverHint,
}: {
  isDark: boolean;
  themeBlendRef: React.MutableRefObject<number>;
  exploded: boolean;
  selectedLayer: number;
  onSelectLayer: (idx: number) => void;
  onToggleExplode: () => void;
  onHoverHint: (hint: string | null) => void;
}) {
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);

  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const ringMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const slabMatsRef = useRef<Array<THREE.MeshStandardMaterial | null>>([]);
  const slabGroupsRef = useRef<Array<THREE.Group | null>>([]);

  const slabGeometries = useMemo(
    () => STACK_LAYERS.map((layer) => createRoundedSlabGeometry(layer.width, layer.depth, 0.085, 0.11, 0.012)),
    []
  );

  useEffect(() => {
    return () => {
      slabGeometries.forEach((g) => g.dispose());
    };
  }, [slabGeometries]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const b = themeBlendRef.current;

    if (ringMatRef.current) {
      ringMatRef.current.color.lerpColors(PALETTE.ringLight, PALETTE.ringDark, b);
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.y += delta * 0.28;
      outerRingRef.current.rotation.x = Math.sin(t * 0.35) * 0.22;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y -= delta * 0.42;
      innerRingRef.current.rotation.z = Math.cos(t * 0.45) * 0.26;
    }

    const spread = exploded ? 1.72 : 1.0;

    STACK_LAYERS.forEach((layer, idx) => {
      const grp = slabGroupsRef.current[idx];
      const mat = slabMatsRef.current[idx];
      if (mat) {
        mat.color.lerpColors(PALETTE.slabLight, PALETTE.slabDark, b);
      }
      if (!grp) return;

      const isSelected = selectedLayer === idx;
      const isHov = hoveredLayer === idx;

      const targetY = layer.yBase * spread + (isSelected ? 0.05 : 0);
      const targetZ = isSelected ? 0.16 : isHov ? 0.08 : 0;
      const targetScale = isSelected ? 1.05 : 1.0;

      grp.position.y = THREE.MathUtils.damp(grp.position.y, targetY, 10, delta);
      grp.position.z = THREE.MathUtils.damp(grp.position.z, targetZ, 10, delta);
      const nextS = THREE.MathUtils.damp(grp.scale.x, targetScale, 10, delta);
      grp.scale.set(nextS, nextS, nextS);
    });
  });

  return (
    <group position={[0, 0.24, 0]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          playSound('chime');
          onToggleExplode();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
          onHoverHint(`CENTRAL SPINDLE · Click to ${exploded ? 'collapse' : 'explode'} stack`);
        }}
        onPointerOut={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
          onHoverHint(null);
        }}
      >
        <cylinderGeometry args={[0.048, 0.048, exploded ? 2.15 : 1.38, 24]} />
        <meshStandardMaterial
          color="#E0441B"
          emissive="#E0441B"
          emissiveIntensity={exploded ? 0.8 : 0.25}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.48, 0.016, 16, 96]} />
        <meshStandardMaterial ref={ringMatRef} color="#CBD5E1" metalness={0.85} roughness={0.22} />
      </mesh>
      <mesh ref={innerRingRef}>
        <torusGeometry args={[1.26, 0.012, 16, 80]} />
        <meshStandardMaterial
          color="#E0441B"
          emissive="#E0441B"
          emissiveIntensity={isDark ? 0.65 : 0.25}
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {STACK_LAYERS.map((layer, idx) => {
        const isSelected = selectedLayer === idx;
        const isHov = hoveredLayer === idx;
        return (
          <group
            key={layer.code}
            ref={(el) => {
              slabGroupsRef.current[idx] = el;
            }}
            position={[0, layer.yBase, 0]}
            onClick={(e) => {
              e.stopPropagation();
              playSound('cartridge');
              onSelectLayer(idx);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredLayer(idx);
              if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
              onHoverHint(`${layer.code} · ${layer.title} (${layer.stack})`);
            }}
            onPointerOut={() => {
              setHoveredLayer(null);
              if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
              onHoverHint(null);
            }}
          >
            <mesh geometry={slabGeometries[idx]} castShadow receiveShadow>
              <meshStandardMaterial
                ref={(el) => {
                  slabMatsRef.current[idx] = el;
                }}
                color="#F5F5F2"
                roughness={0.34}
                metalness={0.18}
              />
            </mesh>

            <mesh position={[0, 0, layer.depth / 2 + 0.005]}>
              <boxGeometry args={[layer.width * 0.55, 0.022, 0.012]} />
              <meshStandardMaterial
                color={layer.color}
                emissive={layer.color}
                emissiveIntensity={isSelected ? 1.4 : isHov ? 0.85 : 0.35}
                roughness={0.2}
              />
            </mesh>

            {[
              [-layer.width * 0.38, -layer.depth * 0.36],
              [layer.width * 0.38, -layer.depth * 0.36],
              [-layer.width * 0.38, layer.depth * 0.36],
              [layer.width * 0.38, layer.depth * 0.36],
            ].map(([nx, nz], ni) => (
              <mesh key={ni} position={[nx, 0.044, nz]}>
                <cylinderGeometry args={[0.018, 0.018, 0.014, 12]} />
                <meshStandardMaterial
                  color={isSelected ? layer.color : '#94A3B8'}
                  emissive={isSelected ? layer.color : '#000000'}
                  emissiveIntensity={isSelected ? 1.1 : 0}
                />
              </mesh>
            ))}

            {idx === STACK_LAYERS.length - 1 && (
              <FoldedPrism3D
                position={[0, 0.044, 0.22]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={0.28}
                depth={0.014}
                bevel={0.002}
                primaryColor="#18181D"
                primaryDarkColor="#F5F5F7"
                secondaryColor="#52525B"
                secondaryDarkColor="#94A3B8"
                accentColor="#E0441B"
                accentDarkColor="#FF572E"
                blendRef={themeBlendRef}
                metalness={0.55}
                roughness={0.22}
                accentEmissive={isDark ? 0.55 : 0.14}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}

/**
 * Interactive Rig + Responsive Camera Framing + Cursor-Tracking Studio Rim Light
 */
function StageController({
  mode,
  exploded,
  selectedLayer,
  isDark,
  mouseRef,
  touchYawRef,
  activeProjectId,
  onSelectProject,
  onOpenCaseStudy,
  onToggleTheme,
  onSelectLayer,
  onToggleExplode,
  onHoverHint,
}: {
  mode: AtelierMode;
  exploded: boolean;
  selectedLayer: number;
  isDark: boolean;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  touchYawRef: React.MutableRefObject<number>;
  activeProjectId: CartridgeId | null;
  onSelectProject: (id: CartridgeId | null) => void;
  onOpenCaseStudy: (id: CartridgeId) => void;
  onToggleTheme: () => void;
  onSelectLayer: (idx: number) => void;
  onToggleExplode: () => void;
  onHoverHint: (hint: string | null) => void;
}) {
  const rigRef = useRef<THREE.Group>(null);
  const cursorLightRef = useRef<THREE.PointLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const themeBlendRef = useRef(isDark ? 1 : 0);

  useFrame((state, delta) => {
    const targetBlend = isDark ? 1 : 0;
    themeBlendRef.current = THREE.MathUtils.damp(themeBlendRef.current, targetBlend, 6, delta);
    const b = themeBlendRef.current;

    // Responsive camera pull-back on narrow viewports so full desk never clips horizontally
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const desiredZ = Math.max(4.45, Math.min(7.2, 6.82 / Math.max(aspect, 0.78)));
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, desiredZ, 8, delta);

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(1.45, 0.65, b);
    }
    if (keyLightRef.current) {
      keyLightRef.current.intensity = THREE.MathUtils.lerp(1.85, 1.15, b);
    }

    if (cursorLightRef.current) {
      const targetLX = mouseRef.current.x * 3.4;
      const targetLY = 2.6 - mouseRef.current.y * 1.1;
      cursorLightRef.current.position.x = THREE.MathUtils.damp(cursorLightRef.current.position.x, targetLX, 8, delta);
      cursorLightRef.current.position.y = THREE.MathUtils.damp(cursorLightRef.current.position.y, targetLY, 8, delta);
      cursorLightRef.current.intensity = THREE.MathUtils.lerp(0.9, 1.75, b);
    }

    if (!rigRef.current) return;

    const t = state.clock.elapsedTime;
    const idleX = Math.sin(t * 0.45) * 0.018;
    const idleY = Math.cos(t * 0.35) * 0.025;

    const baseYaw = mode === 'core' ? 0.18 : -0.24;
    const targetRotY = baseYaw + mouseRef.current.x * 0.34 + touchYawRef.current + idleY;
    const targetRotX = 0.08 - mouseRef.current.y * 0.16 + idleX;

    rigRef.current.rotation.y = THREE.MathUtils.damp(rigRef.current.rotation.y, targetRotY, 7, delta);
    rigRef.current.rotation.x = THREE.MathUtils.damp(rigRef.current.rotation.x, targetRotX, 7, delta);
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={isDark ? 0.65 : 1.45} color="#FFFFFF" />
      <directionalLight
        ref={keyLightRef}
        position={[4.2, 6.4, 4.6]}
        intensity={isDark ? 1.15 : 1.85}
        color={isDark ? '#E2E8F0' : '#FFFDF8'}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4.5, 3.2, -3]} intensity={isDark ? 0.6 : 0.75} color="#CBD5E1" />
      <pointLight
        ref={cursorLightRef}
        position={[0, 2.5, 2.8]}
        intensity={isDark ? 1.75 : 0.9}
        color="#FF784F"
        distance={9}
        decay={2}
      />

      <group ref={rigRef}>
        {mode === 'atelier' ? (
          <AtelierWorkstation
            isDark={isDark}
            themeBlendRef={themeBlendRef}
            activeProjectId={activeProjectId}
            onSelectProject={onSelectProject}
            onOpenCaseStudy={onOpenCaseStudy}
            onToggleTheme={onToggleTheme}
            onHoverHint={onHoverHint}
          />
        ) : (
          <ExplodedStackCore
            isDark={isDark}
            themeBlendRef={themeBlendRef}
            exploded={exploded}
            selectedLayer={selectedLayer}
            onSelectLayer={onSelectLayer}
            onToggleExplode={onToggleExplode}
            onHoverHint={onHoverHint}
          />
        )}
      </group>

      <ContactShadows
        position={[0, mode === 'atelier' ? -0.725 : -0.82, 0]}
        opacity={isDark ? 0.65 : 0.24}
        scale={6.4}
        blur={2.4}
        far={2.6}
        color={isDark ? '#000000' : '#475569'}
      />
    </>
  );
}

export function Atelier3DStage({
  isDark,
  onToggleTheme,
  activeProjectId,
  onSelectProject,
  onOpenCaseStudy,
}: Atelier3DStageProps) {
  const [mode, setMode] = useState<AtelierMode>('atelier');
  const [exploded, setExploded] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<number>(4);
  const [hoverHint, setHoverHint] = useState<string | null>(null);

  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchYawRef = useRef(0);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current = {
        x: THREE.MathUtils.clamp(nx, -1, 1),
        y: THREE.MathUtils.clamp(ny, -1, 1),
      };
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStartRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      touchYawRef.current = THREE.MathUtils.clamp(touchYawRef.current + dx / 180, -0.9, 0.9);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = () => {
    dragStartRef.current = null;
  };

  const activeLayerSpec = STACK_LAYERS[selectedLayer];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full flex flex-col justify-between select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Top Floating Telemetry Hint Pill */}
      <div className="relative z-10 flex items-center justify-center sm:justify-end px-2 pt-1 pointer-events-none">
        <div className="cv-badge px-3 py-1.5 flex items-center gap-2 text-[11px] max-w-full">
          <span
            className="h-1.5 w-1.5 shrink-0"
            style={{
              borderRadius: '9999px',
              backgroundColor: hoverHint ? 'var(--cv-accent)' : 'var(--cv-live)',
            }}
          />
          <span
            className="font-cv-mono truncate"
            style={{ color: hoverHint ? 'var(--cv-ink)' : 'var(--cv-ink-muted)' }}
          >
            {hoverHint || 'Move cursor to orbit · Click lamp for theme'}
          </span>
        </div>
      </div>

      {/* Borderless 3D Canvas Floating Directly Over Background */}
      <div className="relative w-full flex-1 min-h-[250px] sm:min-h-[340px] lg:min-h-[400px]">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0.15, 1.38, 4.45], fov: 35, near: 0.1, far: 30 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <StageController
              mode={mode}
              exploded={exploded}
              selectedLayer={selectedLayer}
              isDark={isDark}
              mouseRef={mouseRef}
              touchYawRef={touchYawRef}
              activeProjectId={activeProjectId}
              onSelectProject={onSelectProject}
              onOpenCaseStudy={onOpenCaseStudy}
              onToggleTheme={onToggleTheme}
              onSelectLayer={setSelectedLayer}
              onToggleExplode={() => setExploded((v) => !v)}
              onHoverHint={setHoverHint}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Bottom Merged UI Bridge Control Dock */}
      <div className="relative z-10 mx-auto w-full max-w-[580px] px-1 pt-1">
        <div
          className="cv-radius-md p-2.5 sm:p-3 flex flex-col gap-2.5"
          style={{
            backgroundColor: 'var(--cv-surface-elevated)',
            border: '1px solid var(--cv-border)',
            boxShadow: 'var(--cv-shadow-card)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div
              className="inline-flex items-center p-0.5 cv-radius-pill gap-0.5"
              style={{
                backgroundColor: 'var(--cv-surface)',
                border: '1px solid var(--cv-border)',
              }}
            >
              <button
                onClick={() => setMode('atelier')}
                className="px-3 py-1 cv-radius-pill text-[11.5px] font-medium transition-colors flex items-center gap-1.5"
                style={{
                  backgroundColor: mode === 'atelier' ? 'var(--cv-surface-elevated)' : 'transparent',
                  color: mode === 'atelier' ? 'var(--cv-ink)' : 'var(--cv-ink-muted)',
                  boxShadow: mode === 'atelier' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <span>Projects</span>
                <span
                  className="font-cv-mono text-[9.5px] px-1.5 py-0.5 cv-radius-pill cv-tabular leading-none"
                  style={{
                    backgroundColor: mode === 'atelier' ? 'var(--cv-accent-soft)' : 'transparent',
                    color: mode === 'atelier' ? 'var(--cv-accent)' : 'var(--cv-ink-subtle)',
                  }}
                >
                  {PROJECT_ORDER.length}
                </span>
              </button>
              <button
                onClick={() => setMode('core')}
                className="px-3 py-1 cv-radius-pill text-[11.5px] font-medium transition-colors flex items-center gap-1.5"
                style={{
                  backgroundColor: mode === 'core' ? 'var(--cv-surface-elevated)' : 'transparent',
                  color: mode === 'core' ? 'var(--cv-ink)' : 'var(--cv-ink-muted)',
                  boxShadow: mode === 'core' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <span>Architecture</span>
                <span
                  className="font-cv-mono text-[9.5px] px-1.5 py-0.5 cv-radius-pill cv-tabular leading-none"
                  style={{
                    backgroundColor: mode === 'core' ? 'var(--cv-accent-soft)' : 'transparent',
                    color: mode === 'core' ? 'var(--cv-accent)' : 'var(--cv-ink-subtle)',
                  }}
                >
                  {STACK_LAYERS.length}
                </span>
              </button>
            </div>

            {mode === 'atelier' ? (
              <span
                className="font-cv-mono text-[10.5px] uppercase tracking-wider px-1.5"
                style={{ color: 'var(--cv-ink-muted)' }}
              >
                Click to inspect ↗
              </span>
            ) : (
              <button
                onClick={() => {
                  playSound('chime');
                  setExploded((v) => !v);
                }}
                className={exploded ? 'cv-btn-accent px-3 py-1 text-[11.5px] font-semibold' : 'cv-btn-secondary px-3 py-1 text-[11.5px] font-medium'}
              >
                {exploded ? 'Stack Layers' : 'Expand Layers'}
              </button>
            )}
          </div>

          {mode === 'atelier' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROJECT_ORDER.map((id, idx) => {
                const proj = cartridgeProjects[id];
                const meta = PROJECT_CARD_META[id];
                const isSelected = activeProjectId === id;
                return (
                  <button
                    key={id}
                    onMouseEnter={() => {
                      if (activeProjectId !== id) {
                        onSelectProject(id);
                      }
                    }}
                    onClick={() => {
                      playSound('cartridge');
                      onSelectProject(id);
                      onOpenCaseStudy(id);
                    }}
                    className="group cv-deck-card px-2.5 py-2 cv-radius-sm text-left flex flex-col justify-between gap-1 min-w-0"
                    style={{
                      backgroundColor: isSelected ? 'var(--cv-surface-elevated)' : 'var(--cv-surface)',
                      border: `1px solid ${isSelected ? proj.color : 'var(--cv-border)'}`,
                      borderLeft: isSelected ? `3px solid ${proj.color}` : '1px solid var(--cv-border)',
                      boxShadow: isSelected ? `0 4px 14px -4px ${proj.color}33` : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="h-2 w-2 shrink-0"
                          style={{
                            borderRadius: '9999px',
                            backgroundColor: proj.color,
                          }}
                        />
                        <span
                          className="font-cv-mono text-[9.5px] leading-none cv-tabular"
                          style={{ color: isSelected ? proj.color : 'var(--cv-ink-muted)' }}
                        >
                          0{idx + 1}
                        </span>
                      </div>

                      {isSelected ? (
                        <span
                          className="font-cv-mono text-[8.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 cv-radius-pill leading-none shrink-0"
                          style={{
                            backgroundColor: `${proj.color}20`,
                            color: proj.color,
                          }}
                        >
                          Live ↗
                        </span>
                      ) : (
                        <span
                          className="font-cv-mono text-[10px] leading-none opacity-40 group-hover:opacity-100 transition-opacity shrink-0"
                          style={{ color: 'var(--cv-ink-muted)' }}
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 w-full">
                      <span
                        className="block text-[12px] font-semibold truncate leading-tight"
                        style={{ color: 'var(--cv-ink)' }}
                      >
                        {meta.name}
                      </span>
                      <span
                        className="block font-cv-mono text-[9.5px] truncate mt-0.5 leading-tight"
                        style={{ color: 'var(--cv-ink-muted)' }}
                      >
                        {meta.tag}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-1.5">
                {STACK_LAYERS.map((layer, idx) => {
                  const isSel = selectedLayer === idx;
                  return (
                    <button
                      key={layer.code}
                      onClick={() => {
                        playSound('cartridge');
                        setSelectedLayer(idx);
                      }}
                      className="cv-deck-card relative overflow-hidden pt-2 pb-1.5 px-1.5 cv-radius-sm text-center"
                      style={{
                        backgroundColor: isSel ? 'var(--cv-surface-elevated)' : 'var(--cv-surface)',
                        border: isSel ? `1px solid ${layer.color}` : '1px solid var(--cv-border)',
                        boxShadow: isSel ? `0 4px 12px -4px ${layer.color}33` : 'none',
                      }}
                    >
                      <span
                        aria-hidden
                        className="absolute top-0 inset-x-0 h-[2.5px] transition-opacity duration-150"
                        style={{
                          backgroundColor: layer.color,
                          opacity: isSel ? 1 : 0.25,
                        }}
                      />
                      <span
                        className="block font-cv-mono text-[10.5px] font-bold leading-none"
                        style={{ color: isSel ? layer.color : 'var(--cv-ink-muted)' }}
                      >
                        {layer.code}
                      </span>
                      <span
                        className="hidden sm:block text-[10.5px] font-medium truncate mt-1 leading-tight"
                        style={{ color: 'var(--cv-ink)' }}
                      >
                        {layer.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div
                className="px-3 py-2 cv-radius-sm flex items-center justify-between gap-2 text-[11.5px]"
                style={{
                  backgroundColor: 'var(--cv-surface)',
                  border: '1px solid var(--cv-border)',
                  borderLeft: `3px solid ${activeLayerSpec.color}`,
                }}
              >
                <span className="font-semibold shrink-0" style={{ color: activeLayerSpec.color }}>
                  {activeLayerSpec.code} · {activeLayerSpec.title}
                </span>
                <span className="font-cv-mono text-[11px] truncate" style={{ color: 'var(--cv-ink-secondary)' }}>
                  {activeLayerSpec.stack}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
