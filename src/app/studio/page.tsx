'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Grid } from '@react-three/drei';
import Link from 'next/link';

// Standalone item components
import {
  AcousticGuitar,
  MustardArmchair,
  EamesChair,
  TournamentDartboard,
  PottedCactus,
  CoffeeTable,
  WelcomeMatSneakers,
  TennisRacket,
  WorkstationDesk,
  CubeBookcase,
  TopShelfDecor,
  VenetianWindow,
  WallSconce,
} from '@/components/room/items';
import { VintageMailbox } from '@/components/room/VintageMailbox';

type ItemId =
  | 'guitar'
  | 'armchair'
  | 'eames'
  | 'desk'
  | 'bookcase'
  | 'dartboard'
  | 'shelf'
  | 'cactus'
  | 'coffee_table'
  | 'sneakers'
  | 'racket'
  | 'mailbox'
  | 'window'
  | 'sconce';

interface ItemMeta {
  id: ItemId;
  name: string;
  icon: string;
  category: 'Furniture' | 'Decor' | 'Props' | 'Architecture';
  notes: string;
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
}

const ITEMS: ItemMeta[] = [
  {
    id: 'guitar',
    name: 'Acoustic Guitar',
    icon: '🎸',
    category: 'Props',
    notes: 'Continuous dreadnought body with natural spruce soundboard, mahogany sides, ivory rosette, pickguard, strings, bridge pins & tuning pegs.',
    cameraPos: [0, 1.3, 3.8],
    targetPos: [0, 1.0, 0],
  },
  {
    id: 'armchair',
    name: 'Mustard Tub Armchair',
    icon: '🪑',
    category: 'Furniture',
    notes: 'Mid-century modern mustard yellow accent chair with curved wraparound tub back and 4 splayed wooden legs.',
    cameraPos: [1.8, 1.6, 2.4],
    targetPos: [0, 0.5, 0],
  },
  {
    id: 'eames',
    name: 'Eames Desk Chair',
    icon: '🪑',
    category: 'Furniture',
    notes: 'Classic Eames DSW Eiffel shell chair with molded scoop seat, black metal wire cross-lattice, and splayed wooden dowel legs.',
    cameraPos: [1.4, 1.4, 2.0],
    targetPos: [0, 0.65, 0],
  },
  {
    id: 'desk',
    name: 'Workstation Desk',
    icon: '🖥️',
    category: 'Furniture',
    notes: 'Mid-century teak writing desk with tapered round legs, ultrawide monitor, keyboard, lamp, flask, and PS5.',
    cameraPos: [2.5, 3.2, 4.2],
    targetPos: [0, 1.35, 0],
  },
  {
    id: 'bookcase',
    name: 'Cube Bookcase',
    icon: '📚',
    category: 'Furniture',
    notes: '2x4 cube shelving unit in warm teak, with tilted blue Forrest Gump poster, books, binders, and storage boxes.',
    cameraPos: [0, 3.2, 10.8],
    targetPos: [0, 2.7, 0],
  },
  {
    id: 'dartboard',
    name: 'Tournament Dartboard',
    icon: '🎯',
    category: 'Decor',
    notes: 'Regulation dartboard with dark wood cabinet rim, alternating segments, red/green rings, and embedded darts.',
    cameraPos: [0, 0, 1.8],
    targetPos: [0, 0, 0],
  },
  {
    id: 'shelf',
    name: 'Top Shelf & Fern',
    icon: '🪴',
    category: 'Decor',
    notes: 'Floating teak shelf with waving spoken language flags, cascading lush Boston fern, and framed photo.',
    cameraPos: [4.4, 1.2, 0],
    targetPos: [0, 0.4, 0],
  },
  {
    id: 'cactus',
    name: 'Potted Saguaro Cactus',
    icon: '🌵',
    category: 'Decor',
    notes: 'Saguaro cactus in ceramic pot with terracotta accent band and curved branching arms.',
    cameraPos: [0, 1.0, 2.2],
    targetPos: [0, 0.5, 0],
  },
  {
    id: 'coffee_table',
    name: 'Round Coffee Table',
    icon: '☕',
    category: 'Furniture',
    notes: 'Low round white coffee table resting on 3 splayed wooden dowel tripod legs.',
    cameraPos: [1.4, 1.3, 1.8],
    targetPos: [0, 0.22, 0],
  },
  {
    id: 'sneakers',
    name: 'Welcome Mat & Sneakers',
    icon: '👟',
    category: 'Props',
    notes: 'Rounded entrance rug with debossed "Welcome!" script and a pair of classic white sneakers with blue heel tabs.',
    cameraPos: [0.25, 1.4, 2.2],
    targetPos: [0.25, 0.1, 0],
  },
  {
    id: 'racket',
    name: 'Tennis Racket & Ball',
    icon: '🎾',
    category: 'Props',
    notes: 'Performance graphite tennis racket with translucent nylon strings, white cushion grip, and felt tennis ball.',
    cameraPos: [0, 0.6, 2.4],
    targetPos: [0, 0.45, 0],
  },
  {
    id: 'mailbox',
    name: 'Vintage Mailbox',
    icon: '📮',
    category: 'Props',
    notes: 'Curbside post-mounted mailbox with hinged drop door and pivoting red postal flag.',
    cameraPos: [1.6, 1.6, 2.4],
    targetPos: [0, 1.05, 0],
  },
  {
    id: 'window',
    name: 'Venetian Blinds',
    icon: '🪟',
    category: 'Architecture',
    notes: 'Modern charcoal window frame with horizontal Venetian blind slats casting soft room shadows.',
    cameraPos: [0, 1.8, 7.6],
    targetPos: [0, 1.8, 0],
  },
  {
    id: 'sconce',
    name: 'Wall Sconce Lamp',
    icon: '💡',
    category: 'Decor',
    notes: 'Arched silver wall sconce with hanging white frosted globe light.',
    cameraPos: [0, 0.6, 2.0],
    targetPos: [0.18, 0.55, 0],
  },
];

function StudioScene({
  activeItem,
  lightingMode,
  autoRotate,
  showGrid,
}: {
  activeItem: ItemId;
  lightingMode: 'studio' | 'day' | 'night';
  autoRotate: boolean;
  showGrid: boolean;
}) {
  const meta = ITEMS.find((i) => i.id === activeItem) || ITEMS[0];

  return (
    <>
      {/* Studio Lighting Rig */}
      {lightingMode === 'studio' && (
        <>
          <ambientLight intensity={1.2} color="#FFFFFF" />
          <directionalLight position={[4, 6, 4]} intensity={1.5} color="#FFFFFF" castShadow />
          <directionalLight position={[-4, 4, -4]} intensity={0.8} color="#E2E8F0" />
          <pointLight position={[0, 4, 0]} intensity={0.5} color="#FFFFFF" />
        </>
      )}

      {lightingMode === 'day' && (
        <>
          <ambientLight intensity={1.4} color="#FFF7ED" />
          <directionalLight position={[5, 7.5, 3]} intensity={1.8} color="#FFF6EA" castShadow />
          <directionalLight position={[-3, 4, -3]} intensity={0.6} color="#FAF8F5" />
        </>
      )}

      {lightingMode === 'night' && (
        <>
          <ambientLight intensity={0.4} color="#1E293B" />
          <pointLight position={[0, 3, 2]} intensity={2.0} color="#F59E0B" />
          <pointLight position={[-3, 2, -2]} intensity={1.5} color="#38BDF8" />
          <pointLight position={[3, 2, -2]} intensity={1.2} color="#A855F7" />
        </>
      )}

      {/* Turntable Pedestal Base */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.4, 0.12, 48]} />
        <meshStandardMaterial color="#16181D" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Turntable Soft Contact Shadow */}
      <ContactShadows
        position={[0, -0.001, 0]}
        opacity={0.7}
        scale={6}
        blur={2}
        far={2}
        color="#08090C"
      />

      {/* Circular Grid Reference */}
      {showGrid && (
        <Grid
          position={[0, 0.002, 0]}
          args={[4, 4]}
          cellSize={0.2}
          cellThickness={0.5}
          cellColor="#334155"
          sectionSize={1}
          sectionThickness={1}
          sectionColor="#475569"
          fadeDistance={6}
        />
      )}

      {/* Render Selected Item */}
      <group name="studio-target-item">
        {activeItem === 'guitar' && <AcousticGuitar isLeaning={false} position={[0, 0, 0]} />}
        {activeItem === 'armchair' && <MustardArmchair position={[0, 0, 0]} />}
        {activeItem === 'eames' && <EamesChair position={[0, 0, 0]} />}
        {activeItem === 'desk' && <WorkstationDesk position={[0, 0, 0]} />}
        {activeItem === 'bookcase' && <CubeBookcase position={[0, 0, 0]} />}
        {activeItem === 'dartboard' && <TournamentDartboard position={[0, 0, 0]} />}
        {activeItem === 'shelf' && <TopShelfDecor position={[0, 0, 0]} />}
        {activeItem === 'cactus' && <PottedCactus position={[0, 0, 0]} />}
        {activeItem === 'coffee_table' && <CoffeeTable position={[0, 0, 0]} />}
        {activeItem === 'sneakers' && <WelcomeMatSneakers position={[0, 0, 0]} />}
        {activeItem === 'racket' && <TennisRacket position={[0, 0, 0]} />}
        {activeItem === 'mailbox' && <VintageMailbox position={[0, 0, 0]} />}
        {activeItem === 'window' && <VenetianWindow position={[0, 0, 0]} />}
        {activeItem === 'sconce' && <WallSconce position={[0, 0.55, 0]} />}
      </group>

      {/* 360 Turntable OrbitControls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        autoRotate={autoRotate}
        autoRotateSpeed={1.8}
        minDistance={1.2}
        maxDistance={12}
        target={meta.targetPos}
      />
    </>
  );
}

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialItem = (searchParams.get('item') as ItemId) || 'guitar';
  const [activeItem, setActiveItem] = useState<ItemId>(initialItem);
  const [lightingMode, setLightingMode] = useState<'studio' | 'day' | 'night'>('studio');
  const [autoRotate, setAutoRotate] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Sync state with URL search param
  useEffect(() => {
    const itemParam = searchParams.get('item') as ItemId;
    if (itemParam && ITEMS.some((i) => i.id === itemParam)) {
      setActiveItem(itemParam);
    }
  }, [searchParams]);

  const selectItem = (id: ItemId) => {
    setActiveItem(id);
    router.push(`/studio?item=${id}`, { scroll: false });
  };

  const currentMeta = ITEMS.find((i) => i.id === activeItem) || ITEMS[0];
  const currentIndex = ITEMS.findIndex((i) => i.id === activeItem);

  const prevItem = () => {
    const nextIdx = (currentIndex - 1 + ITEMS.length) % ITEMS.length;
    selectItem(ITEMS[nextIdx].id);
  };

  const nextItem = () => {
    const nextIdx = (currentIndex + 1) % ITEMS.length;
    selectItem(ITEMS[nextIdx].id);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === '[') prevItem();
      if (e.key === 'ArrowRight' || e.key === ']') nextItem();
      if (e.key === ' ') {
        e.preventDefault();
        setAutoRotate((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  return (
    <div className="relative w-full h-screen bg-[#0D0F13] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* 1. Header Toolbar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            ← Back to Room
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <h1 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
            <span>🔬</span>
            <span>3D ITEM WORKSHOP</span>
          </h1>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {currentMeta.category}
          </span>
        </div>

        {/* Studio Controls */}
        <div className="flex items-center gap-2">
          {/* Lighting Mode Selector */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/60 text-xs">
            <button
              onClick={() => setLightingMode('studio')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lightingMode === 'studio'
                  ? 'bg-sky-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Studio
            </button>
            <button
              onClick={() => setLightingMode('day')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lightingMode === 'day'
                  ? 'bg-amber-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daylight
            </button>
            <button
              onClick={() => setLightingMode('night')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lightingMode === 'night'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Night
            </button>
          </div>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              autoRotate
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🔄</span> Auto Spin
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
              showGrid
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
          >
            Grid
          </button>
        </div>
      </header>

      {/* 2. Main Studio Canvas & Sidebars */}
      <div className="relative flex-1 w-full h-full">
        {/* Item Navigation Selector Carousel (Top Bar) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-2xl max-w-[95vw] overflow-x-auto scrollbar-none">
          <button
            onClick={prevItem}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
            title="Previous (Left Arrow or [)"
          >
            ◀
          </button>

          <div className="flex items-center gap-1 overflow-x-auto px-1 py-0.5">
            {ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => selectItem(item.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  item.id === activeItem
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={nextItem}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
            title="Next (Right Arrow or ])"
          >
            ▶
          </button>
        </div>

        {/* 3D Canvas */}
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{
            position: currentMeta.cameraPos,
            fov: 38,
            near: 0.1,
            far: 30,
          }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <StudioScene
              activeItem={activeItem}
              lightingMode={lightingMode}
              autoRotate={autoRotate}
              showGrid={showGrid}
            />
          </Suspense>
        </Canvas>

        {/* Bottom Information Card */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/60 shadow-2xl max-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentMeta.icon}</span>
              <h2 className="text-sm font-bold text-white">{currentMeta.name}</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {currentIndex + 1} / {ITEMS.length}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            {currentMeta.notes}
          </p>
          <div className="text-[10px] text-amber-300/80 font-mono mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>🖱️ Drag to rotate • Scroll to zoom</span>
            <span>⌨️ [ ] to cycle • Space spin</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading Studio...</div>}>
      <StudioContent />
    </Suspense>
  );
}
