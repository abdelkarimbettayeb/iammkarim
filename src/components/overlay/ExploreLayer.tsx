'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Compass, X, MousePointerClick, Move3d, ZoomIn, RotateCcw, Send } from 'lucide-react';
import { exploreStore, useExplore } from '@/store/exploreStore';
import { roomStore, useRoomStore } from '@/store/useRoomStore';
import { DISCOVERIES, DISCOVERY_BY_ID, STATION_DISCOVERY } from '@/data/discoveries';
import { playSound } from '@/lib/audioEngine';

const TOTAL = DISCOVERIES.length;
const HINT_KEY = 'room.hint.seen.v1';

/** Label that follows the cursor: what the thing under it is and what a click does */
function HoverLabel() {
  const hover = useExplore((s) => s.hover);
  const found = useExplore((s) => s.discovered);
  const [pos, setPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Touch screens have no hover; the label would just get stuck
  if (!hover || pos.x < 0) return null;
  const isNew = DISCOVERIES.some((d) => d.title === hover.title && !found.includes(d.id));
  return (
    <div className="hover-label" style={{ left: pos.x, top: pos.y }} key={hover.title}>
      <div className="glass-panel-master px-2.5 py-1.5 font-secondary max-w-[240px]">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-white leading-tight">
          {hover.title}
          {isNew && <span className="px-1 py-px rounded bg-amber-300/20 text-[10px] text-amber-200 font-medium">New</span>}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-300 leading-tight mt-0.5">
          <MousePointerClick size={11} className="text-amber-300 shrink-0" />
          {hover.action}
        </div>
      </div>
    </div>
  );
}

/** Pops up for each first-time find with the fact it unlocks */
function DiscoveryToast() {
  const lastFind = useExplore((s) => s.lastFind);
  const count = useExplore((s) => s.discovered.length);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastFind) return;
    setVisible(true);
    playSound('chime');
    const id = window.setTimeout(() => setVisible(false), 4200);
    return () => window.clearTimeout(id);
  }, [lastFind]);

  const d = lastFind ? DISCOVERY_BY_ID[lastFind.id] : null;
  if (!visible || !d) return null;
  return (
    <div
      key={lastFind?.at}
      role="status"
      className="toast-in fixed top-20 left-1/2 z-40 glass-panel-master px-4 py-3 flex items-start gap-3 w-[min(92vw,380px)] font-secondary"
    >
      <div className="text-2xl leading-none mt-0.5" aria-hidden>
        {d.emoji}
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] font-medium text-amber-200">
          Found {count} of {TOTAL}
        </div>
        <div className="text-sm font-semibold text-white">{d.title}</div>
        <p className="text-xs text-slate-300 leading-snug mt-0.5">{d.fact}</p>
      </div>
    </div>
  );
}

/** A short burst of confetti when the last discovery is found */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.8,
        drift: (Math.random() - 0.5) * 220,
        spin: (Math.random() - 0.5) * 1440,
        color: ['#F59E0B', '#0EA5E9', '#10B981', '#F43F5E', '#A855F7', '#FDE68A'][i % 6],
      })),
    []
  );
  return (
    <>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${p.left}vw`,
              background: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--drift': `${p.drift}px`,
              '--spin': `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

/** Progress ring + the list of everything to find; every row also takes you there */
function DiscoveryPanel() {
  const discovered = useExplore((s) => s.discovered);
  const lastFind = useExplore((s) => s.lastFind);
  const [open, setOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const count = discovered.length;
  const complete = count >= TOTAL;

  // Celebrate the moment the last one is found (not on every reload)
  useEffect(() => {
    if (!lastFind || !complete) return;
    setCelebrate(true);
    setOpen(true);
    const id = window.setTimeout(() => setCelebrate(false), 4500);
    return () => window.clearTimeout(id);
  }, [lastFind, complete]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const r = 13;
  const c = 2 * Math.PI * r;

  return (
    <div ref={panelRef} className="hud fixed left-3 sm:left-4 md:left-8 top-[150px] sm:top-[104px] z-30 font-secondary">
      {celebrate && <Confetti />}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        key={lastFind?.at}
        className={`glass-panel-subtle h-11 pl-1.5 pr-3 flex items-center gap-2 text-left hover:border-white/20 transition-colors ${lastFind ? 'find-pulse' : ''}`}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden className="-rotate-90">
          <circle cx="17" cy="17" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3.5" />
          <circle
            cx="17"
            cy="17"
            r={r}
            fill="none"
            stroke={complete ? '#10B981' : '#F59E0B'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - count / TOTAL)}
            style={{ transition: 'stroke-dashoffset 600ms ease' }}
          />
        </svg>
        <div>
          <div className="text-[11.5px] text-slate-300 leading-tight">
            {complete ? 'All found' : 'Discoveries'}
          </div>
          <div className="text-sm text-white font-semibold leading-tight">
            {count}
            <span className="text-slate-400 font-normal">/{TOTAL}</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="pane-in mt-2 glass-panel-master w-[min(92vw,340px)] max-h-[min(62vh,560px)] flex flex-col">
          <div className="px-4 pt-3.5 pb-2 flex items-start justify-between gap-3 border-b border-white/[0.08]">
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Compass size={15} className="text-amber-300" /> Explore the room
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {complete
                  ? 'You found everything. Thanks for looking around!'
                  : 'Each find unlocks something about me. Click a row to jump there.'}
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-slate-400 hover:text-white p-1 -m-1">
              <X size={16} />
            </button>
          </div>

          {complete && (
            <button
              onClick={() => {
                setOpen(false);
                if (!roomStore.getState().isContactOpen) roomStore.toggleContact();
              }}
              className="mx-3 mt-3 glass-btn-primary text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-2"
            >
              <Send size={14} /> You clearly pay attention to detail. Let&apos;s talk!
            </button>
          )}

          <ul className="overflow-y-auto p-2 space-y-1">
            {DISCOVERIES.map((d) => {
              const found = discovered.includes(d.id);
              return (
                <li key={d.id}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      d.go();
                    }}
                    className="w-full text-left flex items-start gap-3 px-2.5 py-2 rounded hover:bg-white/[0.07] transition-colors"
                  >
                    <span className={`text-lg leading-none mt-0.5 ${found ? '' : 'grayscale opacity-40'}`} aria-hidden>
                      {d.emoji}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-[12.5px] font-semibold ${found ? 'text-white' : 'text-slate-400'}`}>
                        {found ? d.title : '???'}
                      </span>
                      <span className="block text-[11px] text-slate-400 leading-snug">{found ? d.fact : d.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {count > 0 && (
            <button
              onClick={() => exploreStore.resetDiscoveries()}
              className="text-[10.5px] text-slate-500 hover:text-slate-300 py-2 border-t border-white/[0.06] flex items-center justify-center gap-1"
            >
              <RotateCcw size={11} /> Start over
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function HintRow({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number; className?: string }>; text: string }) {
  return (
    <li className="flex items-center gap-2">
      <Icon size={14} className="text-amber-300 shrink-0" />
      {text}
    </li>
  );
}

/** First visit only: how to drive the room */
function ControlsHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(HINT_KEY) === '1';
    } catch {
      // storage blocked: show it, it just won't be remembered
    }
    if (seen) return;
    const t1 = window.setTimeout(() => setShow(true), 2500);
    const t2 = window.setTimeout(() => dismiss(), 14000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);
  const dismiss = () => {
    setShow(false);
    try {
      window.localStorage.setItem(HINT_KEY, '1');
    } catch {
      // ignore
    }
  };
  if (!show) return null;
  return (
    <div className="toast-in fixed bottom-24 left-1/2 z-30 glass-panel-master px-4 py-3 font-secondary w-[min(92vw,340px)]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-white">Welcome in!</div>
        <button onClick={dismiss} aria-label="Dismiss" className="text-slate-400 hover:text-white p-1 -m-1">
          <X size={15} />
        </button>
      </div>
      <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
        <HintRow icon={MousePointerClick} text="Click anything: he walks over and uses it" />
        <HintRow icon={Move3d} text="Drag to look around the house" />
        <HintRow icon={ZoomIn} text="Scroll or pinch to zoom, double-click to reset" />
      </ul>
    </div>
  );
}

/**
 * Walking to a station counts as finding it; and once every panel is closed
 * and he's back to roaming, the nav bar goes back to "Explore".
 */
function StationDiscoveries() {
  const activeStation = useRoomStore((s) => s.activeStation);
  const anyPanel = useRoomStore((s) => s.isDrawerOpen || s.isContactOpen || s.activeCartridge !== null);
  useEffect(() => {
    const id = STATION_DISCOVERY[activeStation];
    if (id) exploreStore.discover(id);
  }, [activeStation]);
  useEffect(() => {
    if (!anyPanel && activeStation === 'none') roomStore.setActiveZone('overview');
  }, [anyPanel, activeStation]);
  return null;
}

/** Feeds the cursor position to the panes' glint (one light for the whole HUD) */
function GlassLight() {
  useEffect(() => {
    let raf = 0;
    const root = document.documentElement;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.setProperty('--mx', `${e.clientX}px`);
        root.style.setProperty('--my', `${e.clientY}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);
  return null;
}

/** Open at night if it's night where the visitor is (once per page load) */
function LocalTimeOfDay() {
  useEffect(() => {
    const h = new Date().getHours();
    if ((h >= 20 || h < 6) && !roomStore.getState().isNightMode) roomStore.toggleNightMode();
  }, []);
  return null;
}

export function ExploreLayer() {
  useEffect(() => exploreStore.hydrate(), []);
  return (
    <>
      <GlassLight />
      <StationDiscoveries />
      <LocalTimeOfDay />
      <DiscoveryPanel />
      <DiscoveryToast />
      <HoverLabel />
      <ControlsHint />
    </>
  );
}
