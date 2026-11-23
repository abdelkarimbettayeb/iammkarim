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
    const onMove = (e: PointerEvent) =>
      setPos(e.pointerType === 'touch' ? { x: -999, y: -999 } : { x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
    };
  }, []);

  if (!hover || pos.x < 0) return null;
  const isNew = DISCOVERIES.some((d) => d.title === hover.title && !found.includes(d.id));
  return (
    <div className="hover-label" style={{ left: pos.x, top: pos.y }} key={hover.title}>
      <div className="cv-hud-panel px-3 py-2 max-w-[240px]">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold leading-tight" style={{ color: 'var(--cv-ink)' }}>
          {hover.title}
          {isNew && (
            <span
              className="px-1.5 py-px cv-radius-sm font-cv-mono text-[9.5px] font-semibold uppercase"
              style={{ backgroundColor: 'var(--cv-accent-soft)', color: 'var(--cv-accent)' }}
            >
              New
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] leading-tight mt-0.5" style={{ color: 'var(--cv-ink-secondary)' }}>
          <MousePointerClick size={11} className="shrink-0" style={{ color: 'var(--cv-accent)' }} />
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
  const [swipe, setSwipe] = useState<{ start: number; y: number } | null>(null);

  useEffect(() => {
    if (!lastFind) return;
    setVisible(true);
    playSound('chime');
    const id = window.setTimeout(() => setVisible(false), 4200);
    return () => window.clearTimeout(id);
  }, [lastFind]);

  const d = lastFind ? DISCOVERY_BY_ID[lastFind.id] : null;
  if (!visible || !d) return null;
  const y = swipe?.y ?? 0;
  return (
    <div
      key={lastFind?.at}
      role="status"
      className="toast-in fixed top-3 sm:top-20 left-1/2 z-40 w-[min(92vw,380px)]"
    >
      <div
        className="cv-hud-panel pl-3.5 pr-2.5 py-2.5 sm:pl-4 sm:py-3 flex items-start gap-3 touch-none select-none"
        style={{
          transform: `translateY(${y}px)`,
          opacity: Math.max(0, 1 + y / 100),
          transition: swipe ? 'none' : 'transform 200ms ease, opacity 200ms ease',
        }}
        onPointerDown={(e) => {
          if ((e.target as Element).closest('button')) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setSwipe({ start: e.clientY, y: 0 });
        }}
        onPointerMove={(e) => swipe && setSwipe({ ...swipe, y: Math.min(0, e.clientY - swipe.start) })}
        onPointerUp={() => {
          if (y < -36) setVisible(false);
          setSwipe(null);
        }}
        onPointerCancel={() => setSwipe(null)}
      >
        <div className="text-xl sm:text-2xl leading-none mt-0.5" aria-hidden>
          {d.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-cv-mono text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cv-accent)' }}>
            Found {count} of {TOTAL}
          </div>
          <div className="font-cv-display text-[14px] font-bold leading-tight mt-0.5" style={{ color: 'var(--cv-ink)' }}>
            {d.title}
          </div>
          <p className="text-[11.5px] leading-snug mt-0.5" style={{ color: 'var(--cv-ink-secondary)' }}>
            {d.fact}
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          aria-label="Dismiss"
          className="cv-icon-btn shrink-0 h-8 w-8 -mt-0.5 flex items-center justify-center"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

/** Deterministic celebration confetti when all room discoveries are unlocked */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 72 }, (_, i) => ({
        left: ((i * 37 + 13) % 100),
        delay: ((i * 7) % 12) * 0.05,
        duration: 2.2 + ((i * 11) % 9) * 0.2,
        drift: (((i * 23) % 100) - 50) * 4.4,
        spin: (((i * 41) % 100) - 50) * 28,
        color: ['#E0441B', '#0EA5E9', '#15803D', '#F59E0B', '#8B5CF6', '#111113'][i % 6],
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

/** Progress ring + discovery tracker popover */
function DiscoveryPanel() {
  const discovered = useExplore((s) => s.discovered);
  const lastFind = useExplore((s) => s.lastFind);
  const [open, setOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const count = discovered.length;
  const complete = count >= TOTAL;

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
    <div ref={panelRef} className="fixed left-3 sm:left-4 md:left-8 top-[108px] sm:top-[64px] z-30">
      {celebrate && <Confetti />}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        key={lastFind?.at}
        className={`cv-hud-pill h-11 pl-1.5 pr-3.5 flex items-center gap-2 text-left transition-transform active:scale-95 ${lastFind ? 'find-pulse' : ''}`}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden className="-rotate-90">
          <circle cx="17" cy="17" r={r} fill="none" stroke="var(--cv-border-strong)" strokeWidth="3.5" />
          <circle
            cx="17"
            cy="17"
            r={r}
            fill="none"
            stroke={complete ? 'var(--cv-live)' : 'var(--cv-accent)'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - count / TOTAL)}
            style={{ transition: 'stroke-dashoffset 600ms ease' }}
          />
        </svg>
        <div>
          <div className="font-cv-mono text-[10px] uppercase tracking-wider leading-tight" style={{ color: 'var(--cv-ink-muted)' }}>
            {complete ? 'All found' : 'Discoveries'}
          </div>
          <div className="font-cv-display text-[13.5px] font-bold leading-tight cv-tabular" style={{ color: 'var(--cv-ink)' }}>
            {count}
            <span className="font-normal" style={{ color: 'var(--cv-ink-muted)' }}>/{TOTAL}</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="pane-in mt-2 cv-hud-panel w-[min(92vw,340px)] max-h-[min(58vh,520px)] flex flex-col overflow-hidden">
          <div
            className="px-4 pt-3.5 pb-2.5 flex items-start justify-between gap-3"
            style={{ borderBottom: '1px solid var(--cv-border)' }}
          >
            <div>
              <div className="font-cv-display text-[14.5px] font-bold flex items-center gap-1.5" style={{ color: 'var(--cv-ink)' }}>
                <Compass size={15} style={{ color: 'var(--cv-accent)' }} /> Explore the room
              </div>
              <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: 'var(--cv-ink-muted)' }}>
                {complete
                  ? 'You found everything. Thanks for looking around!'
                  : 'Each find unlocks something about me. Click a row to jump there.'}
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="cv-icon-btn h-8 w-8 flex items-center justify-center shrink-0">
              <X size={14} />
            </button>
          </div>

          {complete && (
            <button
              onClick={() => {
                setOpen(false);
                if (!roomStore.getState().isContactOpen) roomStore.toggleContact();
              }}
              className="mx-3 mt-3 cv-btn-primary text-[12px] font-semibold py-2.5 px-3 flex items-center justify-center gap-2"
            >
              <Send size={13} /> You clearly pay attention to detail. Let&apos;s talk!
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
                    className="w-full text-left flex items-start gap-3 px-2.5 py-2 cv-radius-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  >
                    <span className={`text-lg leading-none mt-0.5 ${found ? '' : 'grayscale opacity-40'}`} aria-hidden>
                      {d.emoji}
                    </span>
                    <span className="min-w-0">
                      <span
                        className="block text-[12.5px] font-semibold"
                        style={{ color: found ? 'var(--cv-ink)' : 'var(--cv-ink-muted)' }}
                      >
                        {found ? d.title : '???'}
                      </span>
                      <span className="block text-[11px] leading-snug" style={{ color: 'var(--cv-ink-muted)' }}>
                        {found ? d.fact : d.hint}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {count > 0 && (
            <button
              onClick={() => exploreStore.resetDiscoveries()}
              className="text-[11px] py-2 flex items-center justify-center gap-1 transition-colors"
              style={{
                borderTop: '1px solid var(--cv-border)',
                color: 'var(--cv-ink-muted)',
              }}
            >
              <RotateCcw size={11} /> Start over
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function HintRow({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; text: string }) {
  return (
    <li className="flex items-center gap-2">
      <Icon size={14} className="shrink-0" style={{ color: 'var(--cv-accent)' }} />
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
  const touch = window.matchMedia('(pointer: coarse)').matches;
  return (
    <div className="toast-in fixed bottom-20 sm:bottom-24 left-1/2 z-30 cv-hud-panel px-4 py-3.5 w-[min(92vw,340px)]">
      <div className="flex items-start justify-between gap-3">
        <div className="font-cv-display text-[14px] font-bold" style={{ color: 'var(--cv-ink)' }}>
          Welcome in!
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="cv-icon-btn h-7 w-7 flex items-center justify-center">
          <X size={13} />
        </button>
      </div>
      <ul className="mt-2 space-y-1.5 text-[12px]" style={{ color: 'var(--cv-ink-secondary)' }}>
        {touch ? (
          <>
            <HintRow icon={MousePointerClick} text="Tap anything: he walks over and uses it" />
            <HintRow icon={Move3d} text="Drag to look around, two fingers to move" />
            <HintRow icon={ZoomIn} text="Pinch to zoom, double-tap to reset" />
          </>
        ) : (
          <>
            <HintRow icon={MousePointerClick} text="Click anything: he walks over and uses it" />
            <HintRow icon={Move3d} text="Drag to look around, right-drag to move" />
            <HintRow icon={ZoomIn} text="Scroll or pinch to zoom, double-click to reset" />
          </>
        )}
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

export function ExploreLayer() {
  useEffect(() => exploreStore.hydrate(), []);
  return (
    <>
      <StationDiscoveries />
      <DiscoveryPanel />
      <DiscoveryToast />
      <HoverLabel />
      <ControlsHint />
    </>
  );
}
