'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  GitBranch,
  Layers,
  Pause,
  Play,
  ShieldCheck,
  Users,
} from 'lucide-react';

type JudViewId = 'analytics' | 'hr' | 'pipeline';

interface JudViewTab {
  id: JudViewId;
  label: string;
}

const JUD_VIOLET = '#8b5cf6';
const LIVE_GREEN = '#22c55e';

const VIEW_TABS: JudViewTab[] = [
  { id: 'analytics', label: 'Brand Analytics' },
  { id: 'hr', label: 'HR & RBAC' },
  { id: 'pipeline', label: 'AI Sprint' },
];

const ANALYTICS_BARS = [
  { label: 'M1', ratio: 0.42 },
  { label: 'M2', ratio: 0.64 },
  { label: 'M3', ratio: 0.55 },
  { label: 'M4', ratio: 0.78 },
  { label: 'M5', ratio: 0.71 },
  { label: 'M6', ratio: 0.92 },
  { label: 'M7', ratio: 0.98 },
];

const HR_ROWS = [
  {
    id: 'att',
    module: 'Geo Clock-In',
    role: 'Employee',
    detail: '08:58 · On Time',
    badge: 'SHIFT A',
  },
  {
    id: 'leave',
    module: 'Leave Refund',
    role: 'Team Lead',
    detail: '14d Bal · Approved ✓',
    badge: 'HOLIDAY SYNC',
  },
  {
    id: 'pay',
    module: 'Payroll Pre-Run',
    role: 'HR Admin',
    detail: 'Base − Ded + Bonus',
    badge: 'RTL PDF',
  },
];

const PIPELINE_NODES = [
  { code: '01', label: 'Spec M-061', sub: 'Registry' },
  { code: '02', label: 'AI + Review', sub: 'DTO / Prisma' },
  { code: '03', label: 'Jest CI', sub: 'RBAC Tests' },
  { code: '04', label: 'Prod Deploy', sub: 'Socket.IO' },
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

export interface JudPlatformPreviewProps {
  variant?: 'modal' | 'spotlight';
}

export function JudPlatformPreview({ variant = 'modal' }: JudPlatformPreviewProps) {
  const isModal = variant === 'modal';
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const [viewIdx, setViewIdx] = useState(0);
  const [pulseStep, setPulseStep] = useState(reducedMotion ? 3 : 0);
  const [autoPlay, setAutoPlay] = useState(true);

  const activeView = VIEW_TABS[viewIdx];

  useEffect(() => {
    if (reducedMotion || !autoPlay) return;
    const timer = window.setTimeout(() => {
      if (pulseStep < 3) {
        setPulseStep((p) => p + 1);
      } else {
        setViewIdx((v) => (v + 1) % VIEW_TABS.length);
        setPulseStep(0);
      }
    }, pulseStep === 3 ? 2100 : 620);

    return () => window.clearTimeout(timer);
  }, [autoPlay, pulseStep, reducedMotion]);

  const handleSelectView = (idx: number) => {
    setAutoPlay(false);
    setViewIdx(idx);
    setPulseStep(3);
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

      {/* Top Command Chrome */}
      <div
        className={`relative z-10 flex items-center justify-between gap-2 shrink-0 ${
          isModal ? 'px-3.5 py-2.5' : 'px-2.5 sm:px-3 py-1.5'
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
              backgroundColor: 'rgba(139, 92, 246, 0.16)',
              color: JUD_VIOLET,
            }}
          >
            <Layers size={12} />
          </span>

          <span
            className="font-cv-mono text-[10px] font-semibold uppercase tracking-wider truncate"
            style={{ color: 'var(--cv-ink)' }}
          >
            JUD PLATFORM
            <span className={isModal ? 'hidden sm:inline' : 'hidden sm:inline'}> · LEAD ARCH</span>
          </span>

          {isModal && (
            <span
              className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 cv-radius-sm font-cv-mono text-[9.5px] uppercase"
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.14)',
                color: JUD_VIOLET,
              }}
            >
              <ShieldCheck size={10} />
              <span>RBAC · AR/EN</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] font-semibold"
            style={{
              backgroundColor: 'var(--cv-live-soft)',
              color: 'var(--cv-live)',
            }}
          >
            <span
              className="h-1.5 w-1.5 cv-radius-pill"
              style={{ backgroundColor: LIVE_GREEN }}
            />
            <span>
              WS LIVE
              <span className={isModal ? 'inline' : 'hidden sm:inline'}> · NESTJS 11</span>
            </span>
          </span>
        </div>
      </div>

      {/* Active Enterprise View Stage */}
      <div
        className={`relative z-10 flex-1 min-h-0 flex flex-col justify-between ${
          isModal ? 'p-3.5 gap-2.5' : 'p-2 sm:p-2.5 gap-1.5'
        }`}
      >
        {activeView.id === 'analytics' && (
          <div
            key="view-analytics"
            className={`cv-review-enter flex-1 min-h-0 grid items-stretch ${
              isModal ? 'gap-2.5 grid-cols-1 sm:grid-cols-12' : 'gap-2 grid-cols-12'
            }`}
          >
            {/* Bar Chart Panel */}
            <div
              className={`${
                isModal ? 'sm:col-span-7' : 'col-span-7'
              } cv-radius-sm p-2 sm:p-3 flex flex-col justify-between min-w-0`}
              style={{
                backgroundColor: 'var(--cv-surface-elevated)',
                border: '1px solid var(--cv-border)',
              }}
            >
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <span
                  className="inline-flex items-center gap-1.5 font-cv-mono text-[9.5px] font-semibold uppercase tracking-wider min-w-0"
                  style={{ color: 'var(--cv-ink-muted)' }}
                >
                  <BarChart3 size={11} style={{ color: JUD_VIOLET }} className="shrink-0" />
                  <span className="truncate">Multi-Brand Analytics</span>
                </span>
                <span
                  className="font-cv-mono text-[9.5px] font-semibold cv-tabular shrink-0 whitespace-nowrap"
                  style={{ color: LIVE_GREEN }}
                >
                  +42%<span className={isModal ? 'inline' : 'hidden sm:inline'}> Velocity</span>
                </span>
              </div>

              <div
                className={`flex items-end justify-between gap-1.5 sm:gap-2 pt-2 ${
                  isModal ? 'h-24 sm:h-28' : 'flex-1 min-h-[64px]'
                }`}
              >
                {ANALYTICS_BARS.map((bar, bIdx) => {
                  const activeScale =
                    reducedMotion || pulseStep >= 1
                      ? bar.ratio
                      : Math.max(0.25, bar.ratio * 0.55);
                  const isHighlight = bIdx >= 5;
                  return (
                    <div
                      key={bar.label}
                      className="flex-1 h-full flex flex-col items-center justify-end gap-1"
                    >
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full h-full cv-radius-sm"
                          style={{
                            transform: `scaleY(${activeScale})`,
                            transformOrigin: 'bottom',
                            transition: reducedMotion
                              ? 'none'
                              : `transform 460ms cubic-bezier(0.23, 1, 0.32, 1) ${bIdx * 40}ms`,
                            backgroundColor: isHighlight
                              ? JUD_VIOLET
                              : 'rgba(139, 92, 246, 0.34)',
                          }}
                        />
                      </div>
                      {isModal && (
                        <span
                          className="font-cv-mono text-[8.5px]"
                          style={{ color: 'var(--cv-ink-muted)' }}
                        >
                          {bar.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KPI Ledger */}
            <div
              className={`${
                isModal ? 'sm:col-span-5' : 'col-span-5'
              } flex flex-col justify-between gap-1.5 sm:gap-2 min-w-0`}
            >
              {[
                { label: 'ROAS Index', val: '4.8×', sub: '18 Brands' },
                { label: 'HR Modules', val: '15', sub: 'RBAC Scoped' },
                { label: 'Exports', val: 'PDF · XLSX', sub: 'Puppeteer RTL' },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="flex-1 min-h-0 cv-radius-sm px-2 sm:px-2.5 py-1 sm:py-1.5 flex items-center justify-between gap-1.5"
                  style={{
                    backgroundColor: 'var(--cv-surface-elevated)',
                    border: '1px solid var(--cv-border)',
                  }}
                >
                  <div className="min-w-0">
                    <span
                      className="block font-cv-mono text-[8.5px] sm:text-[9px] uppercase truncate"
                      style={{ color: 'var(--cv-ink-muted)' }}
                    >
                      {kpi.label}
                    </span>
                    {isModal && (
                      <span
                        className="block text-[10px] truncate"
                        style={{ color: 'var(--cv-ink-secondary)' }}
                      >
                        {kpi.sub}
                      </span>
                    )}
                  </div>
                  <span
                    className="font-cv-display font-bold text-[11px] sm:text-[14px] cv-tabular shrink-0"
                    style={{ color: JUD_VIOLET }}
                  >
                    {kpi.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView.id === 'hr' && (
          <div
            key="view-hr"
            className="cv-review-enter flex-1 min-h-0 flex flex-col justify-center gap-1.5 sm:gap-2 overflow-hidden"
          >
            {HR_ROWS.slice(0, isModal ? 3 : 2).map((row, idx) => (
              <div
                key={row.id}
                className={`cv-search-row cv-radius-sm flex items-center justify-between gap-2 ${
                  isModal ? 'px-3 py-2' : 'px-2.5 py-1.5'
                }`}
                style={{
                  animationDelay: `${idx * 50}ms`,
                  backgroundColor: 'var(--cv-surface-elevated)',
                  border: '1px solid var(--cv-border)',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Users size={12} style={{ color: JUD_VIOLET }} className="shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[11.5px] sm:text-[12px] font-semibold truncate"
                        style={{ color: 'var(--cv-ink)' }}
                      >
                        {row.module}
                      </span>
                      <span
                        className="px-1.5 py-0.5 cv-radius-sm font-cv-mono text-[8.5px] uppercase shrink-0"
                        style={{
                          backgroundColor: 'var(--cv-surface)',
                          color: 'var(--cv-ink-muted)',
                          border: '1px solid var(--cv-border)',
                        }}
                      >
                        {row.role}
                      </span>
                    </div>
                    {isModal && (
                      <span
                        className="block font-cv-mono text-[10px]"
                        style={{ color: 'var(--cv-ink-secondary)' }}
                      >
                        {row.detail}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className="px-2 py-0.5 cv-radius-pill font-cv-mono text-[9px] font-semibold shrink-0"
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.14)',
                    color: JUD_VIOLET,
                  }}
                >
                  {isModal ? row.badge : row.detail}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeView.id === 'pipeline' && (
          <div
            key="view-pipeline"
            className="cv-review-enter flex-1 min-h-0 flex flex-col justify-center gap-2"
          >
            <div className={`grid grid-cols-2 sm:grid-cols-4 ${isModal ? 'gap-2' : 'gap-1.5'}`}>
              {PIPELINE_NODES.map((node, nIdx) => {
                const isLit = reducedMotion || nIdx <= pulseStep;
                return (
                  <div
                    key={node.code}
                    className={`cv-radius-sm flex flex-col justify-between gap-1 transition-opacity duration-200 ${
                      isModal ? 'p-2.5' : 'p-2 sm:p-2.5'
                    }`}
                    style={{
                      backgroundColor: 'var(--cv-surface-elevated)',
                      border: `1.5px solid ${isLit ? JUD_VIOLET : 'var(--cv-border)'}`,
                      opacity: isLit ? 1 : 0.48,
                    }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className="font-cv-mono text-[9.5px] font-bold"
                        style={{ color: JUD_VIOLET }}
                      >
                        {node.code}
                      </span>
                      {nIdx === 3 && isLit ? (
                        <CheckCircle2 size={12} style={{ color: LIVE_GREEN }} />
                      ) : (
                        <GitBranch
                          size={11}
                          style={{ color: isLit ? JUD_VIOLET : 'var(--cv-ink-subtle)' }}
                        />
                      )}
                    </div>
                    <div>
                      <span
                        className="block text-[11px] font-semibold truncate"
                        style={{ color: 'var(--cv-ink)' }}
                      >
                        {node.label}
                      </span>
                      {isModal && (
                        <span
                          className="block font-cv-mono text-[9px] truncate"
                          style={{ color: 'var(--cv-ink-muted)' }}
                        >
                          {node.sub}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {isModal && (
              <div
                className="px-3 py-2 cv-radius-sm flex items-center justify-between gap-2 font-cv-mono text-[10px]"
                style={{
                  backgroundColor: 'var(--cv-surface-elevated)',
                  border: '1px solid var(--cv-border)',
                  color: 'var(--cv-ink-secondary)',
                }}
              >
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Activity size={11} style={{ color: JUD_VIOLET }} />
                  <span>ARCHITECTURE.md · 61 Canonical Module Contracts</span>
                </span>
                <span style={{ color: LIVE_GREEN }} className="shrink-0">
                  CI GREEN
                </span>
              </div>
            )}
          </div>
        )}

        {/* Bottom Switcher & Telemetry Strip */}
        {isModal ? (
          <div className="space-y-2 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {VIEW_TABS.map((tab, idx) => {
                  const active = idx === viewIdx;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleSelectView(idx)}
                      className="cv-search-pill px-2.5 py-0.5 cv-radius-pill text-[10.5px] font-medium"
                      style={{
                        backgroundColor: active
                          ? 'rgba(139, 92, 246, 0.16)'
                          : 'var(--cv-surface-elevated)',
                        color: active ? JUD_VIOLET : 'var(--cv-ink-secondary)',
                        border: `1px solid ${
                          active ? 'rgba(139, 92, 246, 0.45)' : 'var(--cv-border)'
                        }`,
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

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

            <div
              className="flex flex-wrap items-center justify-between gap-2 pt-1.5 font-cv-mono text-[9.5px]"
              style={{
                borderTop: '1px solid var(--cv-border)',
                color: 'var(--cv-ink-muted)',
              }}
            >
              <span>NESTJS 11 · PRISMA 7 · REACT 19 · REFINE · SOCKET.IO</span>
              <span style={{ color: JUD_VIOLET }}>61 MODULES</span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center justify-between gap-2 px-0.5 shrink-0 font-cv-mono text-[9.5px]">
            <span style={{ color: JUD_VIOLET }}>{activeView.label}</span>
            <span style={{ color: 'var(--cv-ink-muted)' }}>15 HR Modules · 61 AI Specs</span>
          </div>
        )}
      </div>
    </div>
  );
}
