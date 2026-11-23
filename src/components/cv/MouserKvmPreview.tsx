'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import {
  ArrowLeftRight,
  ClipboardCheck,
  Github,
  Laptop,
  Monitor,
  Pause,
  Play,
  ShieldCheck,
} from 'lucide-react';

type KvmPhase = 'screenA' | 'crossRight' | 'screenB' | 'crossLeft';

interface PhaseSpec {
  phase: KvmPhase;
  activeScreen: 'A' | 'B';
  isCrossing: boolean;
  direction: 'right' | 'left' | null;
  cursorX: number; // % of stage width
  cursorY: number; // % of stage height
  statusLabel: string;
  packetLabel: string;
  clipboardSynced: boolean;
  durationMs: number;
}

const MOUSER_GREEN = '#10b981';
const MOUSER_REPO_URL = 'https://github.com/xnevz/mouser';

const PHASE_SEQUENCE: PhaseSpec[] = [
  {
    phase: 'screenA',
    activeScreen: 'A',
    isCrossing: false,
    direction: null,
    cursorX: 20,
    cursorY: 46,
    statusLabel: 'LOCAL HOOK · SCREEN A',
    packetLabel: 'Hooks idle',
    clipboardSynced: false,
    durationMs: 1400,
  },
  {
    phase: 'crossRight',
    activeScreen: 'B',
    isCrossing: true,
    direction: 'right',
    cursorX: 76,
    cursorY: 45,
    statusLabel: 'EDGE HANDOFF → SCREEN B',
    packetLabel: '51B AES-GCM UDP →',
    clipboardSynced: false,
    durationMs: 1300,
  },
  {
    phase: 'screenB',
    activeScreen: 'B',
    isCrossing: false,
    direction: null,
    cursorX: 81,
    cursorY: 64,
    statusLabel: 'REMOTE CONTROL · UDP 58491',
    packetLabel: 'k_ab seq #4092',
    clipboardSynced: true,
    durationMs: 2100,
  },
  {
    phase: 'crossLeft',
    activeScreen: 'A',
    isCrossing: true,
    direction: 'left',
    cursorX: 24,
    cursorY: 58,
    statusLabel: '← EDGE RETURN · SCREEN A',
    packetLabel: '← 51B AES-GCM UDP',
    clipboardSynced: false,
    durationMs: 1300,
  },
];

const subscribeReducedMotion = (cb: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

const getReducedMotionSnapshot = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export interface MouserKvmPreviewProps {
  variant?: 'modal' | 'spotlight';
}

export function MouserKvmPreview({ variant = 'modal' }: MouserKvmPreviewProps) {
  const isModal = variant === 'modal';
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const [phaseIdx, setPhaseIdx] = useState(reducedMotion ? 1 : 0);
  const [autoPlay, setAutoPlay] = useState(true);

  const current = PHASE_SEQUENCE[phaseIdx];

  useEffect(() => {
    if (reducedMotion || !autoPlay) return;
    const timer = window.setTimeout(() => {
      setPhaseIdx((prev) => (prev + 1) % PHASE_SEQUENCE.length);
    }, current.durationMs);
    return () => window.clearTimeout(timer);
  }, [autoPlay, current.durationMs, reducedMotion]);

  const handleSelectScreen = (target: 'A' | 'B') => {
    setAutoPlay(false);
    setPhaseIdx(target === 'A' ? 3 : 1);
  };

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none"
      style={{
        backgroundColor: 'var(--cv-surface)',
        color: 'var(--cv-ink)',
      }}
    >
      {/* Subtle architectural dot backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--cv-dot-color) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Top Open-Source & Protocol Telemetry Header */}
      <div
        className={`relative z-10 flex items-center justify-between gap-2 shrink-0 ${
          isModal ? 'px-3.5 py-2.5' : 'px-3 py-1.5'
        }`}
        style={{
          backgroundColor: 'var(--cv-surface-elevated)',
          borderBottom: '1px solid var(--cv-border)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-flex items-center justify-center h-5 w-5 cv-radius-sm shrink-0"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.14)',
              color: MOUSER_GREEN,
            }}
          >
            <ArrowLeftRight size={12} />
          </span>

          <span
            className="font-cv-mono text-[10px] font-semibold uppercase tracking-wider truncate"
            style={{ color: 'var(--cv-ink)' }}
          >
            MOUSER · SOFTWARE KVM
          </span>

          <a
            href={MOUSER_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cv-search-pill inline-flex items-center gap-1 px-1.5 py-0.5 cv-radius-sm font-cv-mono text-[9.5px] font-semibold shrink-0"
            style={{
              backgroundColor: 'var(--cv-surface)',
              color: 'var(--cv-ink-secondary)',
              border: '1px solid var(--cv-border)',
            }}
          >
            <Github size={10} />
            <span className={isModal ? 'inline' : 'hidden sm:inline'}>
              {isModal ? 'xnevz/mouser' : 'Open Source'}
            </span>
          </a>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] font-semibold cv-tabular"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.14)',
              color: MOUSER_GREEN,
            }}
          >
            <ShieldCheck size={10} />
            <span>51B AES-GCM</span>
          </span>
        </div>
      </div>

      {/* Interactive Dual-Screen Stage */}
      <div
        className={`relative z-10 flex-1 min-h-0 flex flex-col justify-between ${
          isModal ? 'p-3.5 gap-2.5' : 'p-2.5 gap-1.5'
        }`}
      >
        {/* Dual-Screen Container with GPU-Accelerated Cursor Overlay */}
        <div className="relative flex-1 min-h-0 flex items-stretch gap-0">
          {/* SCREEN A: Primary Workstation */}
          <div
            className={`flex-1 min-w-0 cv-radius-sm flex flex-col justify-between transition-colors duration-200 ${
              isModal ? 'p-2.5 sm:p-3' : 'p-2'
            }`}
            style={{
              backgroundColor: 'var(--cv-surface-elevated)',
              border: `1.5px solid ${
                current.activeScreen === 'A' ? MOUSER_GREEN : 'var(--cv-border)'
              }`,
              boxShadow:
                current.activeScreen === 'A'
                  ? '0 0 0 2px rgba(16, 185, 129, 0.12)'
                  : undefined,
            }}
          >
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Monitor
                  size={isModal ? 12 : 11}
                  style={{
                    color:
                      current.activeScreen === 'A' ? MOUSER_GREEN : 'var(--cv-ink-muted)',
                  }}
                  className="shrink-0"
                />
                <span
                  className="font-cv-mono text-[9.5px] font-semibold uppercase truncate"
                  style={{ color: 'var(--cv-ink)' }}
                >
                  WIN-11 · PRIMARY
                </span>
              </div>
              <span
                className="h-1.5 w-1.5 cv-radius-pill shrink-0"
                style={{
                  backgroundColor:
                    current.activeScreen === 'A' ? MOUSER_GREEN : 'var(--cv-border-strong)',
                }}
              />
            </div>

            {/* Mock Workspace Window inside Screen A */}
            <div
              className={`my-auto cv-radius-sm ${isModal ? 'p-2.5 space-y-1.5' : 'p-1.5 space-y-1'}`}
              style={{
                backgroundColor: 'var(--cv-surface)',
                border: '1px solid var(--cv-border)',
              }}
            >
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 cv-radius-pill bg-rose-400/70" />
                <span className="h-1.5 w-1.5 cv-radius-pill bg-amber-400/70" />
                <span className="h-1.5 w-1.5 cv-radius-pill bg-emerald-400/70" />
                <span
                  className="ml-1 font-cv-mono text-[8.5px] truncate"
                  style={{ color: 'var(--cv-ink-muted)' }}
                >
                  Mouser.Core
                </span>
              </div>
              <div
                className="h-1.5 w-4/5 cv-radius-pill"
                style={{ backgroundColor: 'var(--cv-border-strong)' }}
              />
              <div
                className="h-1.5 w-3/5 cv-radius-pill"
                style={{
                  backgroundColor:
                    current.activeScreen === 'A'
                      ? 'rgba(16, 185, 129, 0.35)'
                      : 'var(--cv-border)',
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-1 font-cv-mono text-[8.5px]">
              <span
                style={{
                  color:
                    current.activeScreen === 'A' ? MOUSER_GREEN : 'var(--cv-ink-muted)',
                }}
              >
                {current.activeScreen === 'A' ? 'ACTIVE · LOCAL' : 'EDGE STANDBY'}
              </span>
              {isModal && (
                <span className="hidden sm:inline" style={{ color: 'var(--cv-ink-subtle)' }}>
                  192.168.1.14
                </span>
              )}
            </div>
          </div>

          {/* VIRTUAL EDGE BRIDGE SEAM */}
          <div
            className={`relative shrink-0 flex flex-col items-center justify-center ${
              isModal ? 'w-9 sm:w-12' : 'w-7 sm:w-9'
            }`}
          >
            <div
              className={`w-[2px] flex-1 transition-opacity duration-200 ${
                current.isCrossing && !reducedMotion ? 'cv-edge-pulse' : ''
              }`}
              style={{
                background: current.isCrossing
                  ? `linear-gradient(to bottom, transparent, ${MOUSER_GREEN}, transparent)`
                  : 'linear-gradient(to bottom, transparent, var(--cv-border-strong), transparent)',
              }}
            />

            <div
              className="my-1 px-1.5 py-0.5 cv-radius-pill font-cv-mono text-[8.5px] font-bold flex items-center justify-center"
              style={{
                backgroundColor: current.isCrossing
                  ? 'rgba(16, 185, 129, 0.18)'
                  : 'var(--cv-surface-elevated)',
                color: current.isCrossing ? MOUSER_GREEN : 'var(--cv-ink-muted)',
                border: `1px solid ${
                  current.isCrossing ? 'rgba(16, 185, 129, 0.5)' : 'var(--cv-border)'
                }`,
              }}
            >
              {current.direction === 'right'
                ? '→'
                : current.direction === 'left'
                  ? '←'
                  : '⇄'}
            </div>

            {current.isCrossing && !reducedMotion && (
              <span
                key={current.phase}
                className="cv-packet-travel absolute top-1/2 -translate-y-7 px-1 py-0.5 cv-radius-sm font-cv-mono text-[8px] font-semibold whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--cv-ink)',
                  color: 'var(--cv-bg)',
                }}
              >
                UDP
              </span>
            )}

            <div
              className={`w-[2px] flex-1 transition-opacity duration-200 ${
                current.isCrossing && !reducedMotion ? 'cv-edge-pulse' : ''
              }`}
              style={{
                background: current.isCrossing
                  ? `linear-gradient(to bottom, transparent, ${MOUSER_GREEN}, transparent)`
                  : 'linear-gradient(to bottom, transparent, var(--cv-border-strong), transparent)',
              }}
            />
          </div>

          {/* SCREEN B: Paired Remote Workstation */}
          <div
            className={`flex-1 min-w-0 cv-radius-sm flex flex-col justify-between transition-colors duration-200 ${
              isModal ? 'p-2.5 sm:p-3' : 'p-2'
            }`}
            style={{
              backgroundColor: 'var(--cv-surface-elevated)',
              border: `1.5px solid ${
                current.activeScreen === 'B' ? MOUSER_GREEN : 'var(--cv-border)'
              }`,
              boxShadow:
                current.activeScreen === 'B'
                  ? '0 0 0 2px rgba(16, 185, 129, 0.12)'
                  : undefined,
            }}
          >
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Laptop
                  size={isModal ? 12 : 11}
                  style={{
                    color:
                      current.activeScreen === 'B' ? MOUSER_GREEN : 'var(--cv-ink-muted)',
                  }}
                  className="shrink-0"
                />
                <span
                  className="font-cv-mono text-[9.5px] font-semibold uppercase truncate"
                  style={{ color: 'var(--cv-ink)' }}
                >
                  PEER · PAIRED PC
                </span>
              </div>
              <span
                className="h-1.5 w-1.5 cv-radius-pill shrink-0"
                style={{
                  backgroundColor:
                    current.activeScreen === 'B' ? MOUSER_GREEN : 'var(--cv-border-strong)',
                }}
              />
            </div>

            {/* Mock Target Window inside Screen B */}
            <div
              className={`my-auto cv-radius-sm ${isModal ? 'p-2.5 space-y-1.5' : 'p-1.5 space-y-1'}`}
              style={{
                backgroundColor: 'var(--cv-surface)',
                border: '1px solid var(--cv-border)',
              }}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className="font-cv-mono text-[8.5px] truncate"
                  style={{ color: 'var(--cv-ink-muted)' }}
                >
                  SendInput · SAS 842-190
                </span>
                {current.clipboardSynced && (
                  <span
                    className="inline-flex items-center gap-0.5 px-1 py-0.5 cv-radius-sm font-cv-mono text-[8px] font-semibold shrink-0"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: MOUSER_GREEN,
                    }}
                  >
                    <ClipboardCheck size={9} />
                    <span className={isModal ? 'inline' : 'hidden sm:inline'}>Synced</span>
                  </span>
                )}
              </div>
              <div
                className="h-1.5 w-3/4 cv-radius-pill"
                style={{
                  backgroundColor:
                    current.activeScreen === 'B'
                      ? 'rgba(16, 185, 129, 0.35)'
                      : 'var(--cv-border-strong)',
                }}
              />
              <div
                className="h-1.5 w-1/2 cv-radius-pill"
                style={{ backgroundColor: 'var(--cv-border)' }}
              />
            </div>

            <div className="flex items-center justify-between gap-1 font-cv-mono text-[8.5px]">
              <span
                style={{
                  color:
                    current.activeScreen === 'B' ? MOUSER_GREEN : 'var(--cv-ink-muted)',
                }}
              >
                {current.activeScreen === 'B' ? 'ACTIVE · REMOTE' : 'PAIR READY'}
              </span>
              {isModal && (
                <span className="hidden sm:inline" style={{ color: 'var(--cv-ink-subtle)' }}>
                  UDP :58491
                </span>
              )}
            </div>
          </div>

          {/* FULL-STAGE GPU-ACCELERATED MOUSE CURSOR OVERLAY
              Because this wrapper spans 100% × 100% (inset-0), percentage translate3d(X%, Y%, 0)
              maps directly to stage coordinates using transform only (zero layout thrashing). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              transform: `translate3d(${current.cursorX}%, ${current.cursorY}%, 0)`,
              transition: reducedMotion
                ? 'none'
                : 'transform 650ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          >
            <div className="relative -translate-x-1 -translate-y-1 inline-flex items-start">
              <svg
                width={isModal ? 22 : 18}
                height={isModal ? 22 : 18}
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))',
                }}
              >
                <path
                  d="M4.5 3.5L19 11.2L12.3 13.1L9.6 19.8L4.5 3.5Z"
                  fill={MOUSER_GREEN}
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className="ml-1 mt-3 px-1.5 py-0.5 cv-radius-pill font-cv-mono text-[8px] font-bold uppercase tracking-wider whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--cv-ink)',
                  color: 'var(--cv-bg)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
              >
                {current.activeScreen === 'A' ? 'PC-A' : 'PC-B'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Controls & Telemetry */}
        {isModal ? (
          <div className="space-y-2 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectScreen('A')}
                  className="cv-search-pill px-2.5 py-0.5 cv-radius-pill text-[10.5px] font-medium"
                  style={{
                    backgroundColor:
                      current.activeScreen === 'A'
                        ? 'rgba(16, 185, 129, 0.14)'
                        : 'var(--cv-surface-elevated)',
                    color:
                      current.activeScreen === 'A'
                        ? MOUSER_GREEN
                        : 'var(--cv-ink-secondary)',
                    border: `1px solid ${
                      current.activeScreen === 'A'
                        ? 'rgba(16, 185, 129, 0.45)'
                        : 'var(--cv-border)'
                    }`,
                  }}
                >
                  Screen A (Local)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectScreen('B')}
                  className="cv-search-pill px-2.5 py-0.5 cv-radius-pill text-[10.5px] font-medium"
                  style={{
                    backgroundColor:
                      current.activeScreen === 'B'
                        ? 'rgba(16, 185, 129, 0.14)'
                        : 'var(--cv-surface-elevated)',
                    color:
                      current.activeScreen === 'B'
                        ? MOUSER_GREEN
                        : 'var(--cv-ink-secondary)',
                    border: `1px solid ${
                      current.activeScreen === 'B'
                        ? 'rgba(16, 185, 129, 0.45)'
                        : 'var(--cv-border)'
                    }`,
                  }}
                >
                  Screen B (Remote)
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAutoPlay((p) => !p)}
                  className="cv-search-pill px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] flex items-center gap-1"
                  style={{
                    backgroundColor: 'var(--cv-surface-elevated)',
                    color: 'var(--cv-ink-muted)',
                    border: '1px solid var(--cv-border)',
                  }}
                >
                  {autoPlay ? <Pause size={10} /> : <Play size={10} />}
                  <span>{autoPlay ? 'Auto' : 'Play loop'}</span>
                </button>
              </div>
            </div>

            <div
              className="flex flex-wrap items-center justify-between gap-2 pt-1.5 font-cv-mono text-[9.5px]"
              style={{
                borderTop: '1px solid var(--cv-border)',
                color: 'var(--cv-ink-muted)',
              }}
            >
              <span>ECDH P-256 · 6-DIGIT SAS · AES-256-GCM · 100% LAN · NO CLOUD</span>
              <span style={{ color: MOUSER_GREEN }}>{current.statusLabel}</span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center justify-between gap-2 px-0.5 shrink-0 font-cv-mono text-[9.5px]">
            <span style={{ color: MOUSER_GREEN }}>{current.statusLabel}</span>
            <span style={{ color: 'var(--cv-ink-muted)' }}>{current.packetLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
