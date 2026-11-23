'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Check, Pause, Play, RotateCcw, ShoppingBag, Sparkles } from 'lucide-react';

interface FurnitureItem {
  id: 'bed' | 'sofa';
  name: string;
  priceDa: number;
  priceLabel: string;
  tag: string;
}

type StorePhaseId = 'hoverBed' | 'addBed' | 'hoverSofa' | 'addSofa' | 'orderConfirmed';

interface StorePhaseSpec {
  id: StorePhaseId;
  modalX: number;
  modalY: number;
  spotX: number;
  spotY: number;
  hoveredId: 'bed' | 'sofa' | null;
  rippleTarget: 'bed' | 'sofa' | 'checkout' | null;
  cartIds: ('bed' | 'sofa')[];
  confirmed: boolean;
  statusLabel: string;
  durationMs: number;
}

const MEUBLE_ROSE = '#e11d48';
const CONFIRMED_GREEN = '#10b981';

const FURNITURE_ITEMS: FurnitureItem[] = [
  {
    id: 'bed',
    name: 'Oak Platform Bed',
    priceDa: 48500,
    priceLabel: '48,500 DA',
    tag: 'Solid Oak',
  },
  {
    id: 'sofa',
    name: 'Nordic Lounge Sofa',
    priceDa: 64000,
    priceLabel: '64,000 DA',
    tag: '3-Seater',
  },
];

const PHASE_SEQUENCE: StorePhaseSpec[] = [
  {
    id: 'hoverBed',
    modalX: 16,
    modalY: 42,
    spotX: 25,
    spotY: 44,
    hoveredId: 'bed',
    rippleTarget: null,
    cartIds: [],
    confirmed: false,
    statusLabel: 'Browsing catalog · Oak Bed',
    durationMs: 1100,
  },
  {
    id: 'addBed',
    modalX: 17,
    modalY: 68,
    spotX: 33,
    spotY: 70,
    hoveredId: 'bed',
    rippleTarget: 'bed',
    cartIds: ['bed'],
    confirmed: false,
    statusLabel: 'Added Oak Bed to cart',
    durationMs: 1200,
  },
  {
    id: 'hoverSofa',
    modalX: 43,
    modalY: 42,
    spotX: 73,
    spotY: 44,
    hoveredId: 'sofa',
    rippleTarget: null,
    cartIds: ['bed'],
    confirmed: false,
    statusLabel: 'Inspecting Nordic Sofa',
    durationMs: 1050,
  },
  {
    id: 'addSofa',
    modalX: 44,
    modalY: 68,
    spotX: 81,
    spotY: 70,
    hoveredId: 'sofa',
    rippleTarget: 'sofa',
    cartIds: ['bed', 'sofa'],
    confirmed: false,
    statusLabel: 'Added Nordic Sofa · Cart (2)',
    durationMs: 1250,
  },
  {
    id: 'orderConfirmed',
    modalX: 81,
    modalY: 74,
    spotX: 88,
    spotY: 16,
    hoveredId: null,
    rippleTarget: 'checkout',
    cartIds: ['bed', 'sofa'],
    confirmed: true,
    statusLabel: 'Order Confirmed · 112,500 DA',
    durationMs: 2400,
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

function BedIllustration({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 96 52"
      fill="none"
      className="w-full h-10 sm:h-12"
      aria-hidden="true"
    >
      {/* Headboard */}
      <rect
        x="10"
        y="8"
        width="76"
        height="18"
        rx="4"
        fill={active ? 'rgba(225, 29, 72, 0.14)' : 'var(--cv-surface)'}
        stroke={active ? MEUBLE_ROSE : 'var(--cv-border-strong)'}
        strokeWidth="1.6"
      />
      {/* Left & Right Pillows */}
      <rect
        x="18"
        y="14"
        width="26"
        height="10"
        rx="3"
        fill="var(--cv-surface-elevated)"
        stroke={active ? MEUBLE_ROSE : 'var(--cv-border-strong)'}
        strokeWidth="1.4"
      />
      <rect
        x="52"
        y="14"
        width="26"
        height="10"
        rx="3"
        fill="var(--cv-surface-elevated)"
        stroke={active ? MEUBLE_ROSE : 'var(--cv-border-strong)'}
        strokeWidth="1.4"
      />
      {/* Mattress + Duvet */}
      <rect
        x="8"
        y="24"
        width="80"
        height="16"
        rx="4"
        fill={active ? 'rgba(225, 29, 72, 0.1)' : 'var(--cv-surface-elevated)'}
        stroke={active ? MEUBLE_ROSE : 'var(--cv-border-strong)'}
        strokeWidth="1.6"
      />
      <path
        d="M12 31H84"
        stroke={active ? MEUBLE_ROSE : 'var(--cv-border-strong)'}
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />
      {/* Legs */}
      <rect x="14" y="40" width="5" height="6" rx="1.5" fill="var(--cv-ink-muted)" />
      <rect x="77" y="40" width="5" height="6" rx="1.5" fill="var(--cv-ink-muted)" />
    </svg>
  );
}

function SofaIllustration({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 96 52"
      fill="none"
      className="w-full h-10 sm:h-12"
      aria-hidden="true"
    >
      {/* Backrest */}
      <rect
        x="14"
        y="10"
        width="68"
        height="18"
        rx="5"
        fill={active ? 'rgba(225, 29, 72, 0.12)' : 'var(--cv-surface)'}
        stroke={active ? MEUBLE_ROSE : 'var(--cv-border-strong)'}
        strokeWidth="1.6"
      />
      {/* Left & Right Armrests */}
      <rect
        x="8"
        y="20"
        width="10"
        height="20"
        rx="3.5"
        fill="var(--cv-surface-elevated)"
        stroke={active ? MEUBLE_ROSE : 'var(--cv-border-strong)'}
        strokeWidth="1.5"
      />
      <rect
        x="78"
        y="20"
        width="10"
        height="20"
        rx="3.5"
        fill="var(--cv-surface-elevated)"
        stroke={active ? MEUBLE_ROSE : 'var(--cv-border-strong)'}
        strokeWidth="1.5"
      />
      {/* Seat Cushions */}
      <rect
        x="18"
        y="24"
        width="29"
        height="14"
        rx="3"
        fill={active ? 'rgba(225, 29, 72, 0.1)' : 'var(--cv-surface-elevated)'}
        stroke={active ? MEUBLE_ROSE : 'var(--cv-border-strong)'}
        strokeWidth="1.5"
      />
      <rect
        x="49"
        y="24"
        width="29"
        height="14"
        rx="3"
        fill={active ? 'rgba(225, 29, 72, 0.1)' : 'var(--cv-surface-elevated)'}
        stroke={active ? MEUBLE_ROSE : 'var(--cv-border-strong)'}
        strokeWidth="1.5"
      />
      {/* Legs */}
      <rect x="13" y="40" width="4.5" height="6" rx="1.5" fill="var(--cv-ink-muted)" />
      <rect x="78.5" y="40" width="4.5" height="6" rx="1.5" fill="var(--cv-ink-muted)" />
    </svg>
  );
}

export interface MeubleStorePreviewProps {
  variant?: 'modal' | 'spotlight';
}

export function MeubleStorePreview({ variant = 'modal' }: MeubleStorePreviewProps) {
  const isModal = variant === 'modal';
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const [phaseIdx, setPhaseIdx] = useState(reducedMotion ? 4 : 0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [manualCartIds, setManualCartIds] = useState<('bed' | 'sofa')[] | null>(null);
  const [manualConfirmed, setManualConfirmed] = useState(false);

  const phase = PHASE_SEQUENCE[phaseIdx];
  const isManual = isModal && manualCartIds !== null;

  useEffect(() => {
    if (reducedMotion || !autoPlay || isManual) return;
    const timer = window.setTimeout(() => {
      setPhaseIdx((prev) => (prev + 1) % PHASE_SEQUENCE.length);
    }, phase.durationMs);
    return () => window.clearTimeout(timer);
  }, [autoPlay, isManual, phase.durationMs, reducedMotion]);

  const activeCartIds = isManual ? manualCartIds : phase.cartIds;
  const isConfirmed = isManual ? manualConfirmed : phase.confirmed;

  const cartItems = useMemo(
    () => FURNITURE_ITEMS.filter((item) => activeCartIds.includes(item.id)),
    [activeCartIds]
  );

  const totalDa = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.priceDa, 0),
    [cartItems]
  );

  const handleToggleItem = (id: 'bed' | 'sofa') => {
    if (!isModal) return;
    setAutoPlay(false);
    setManualConfirmed(false);
    setManualCartIds((prev) => {
      const base = prev ?? phase.cartIds;
      return base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    });
  };

  const handleManualCheckout = () => {
    if (!isModal || activeCartIds.length === 0) return;
    setAutoPlay(false);
    setManualCartIds(activeCartIds);
    setManualConfirmed(true);
  };

  const handleReset = () => {
    setManualCartIds(null);
    setManualConfirmed(false);
    setPhaseIdx(0);
    setAutoPlay(true);
  };

  const cursorX = isModal ? phase.modalX : phase.spotX;
  const cursorY = isModal ? phase.modalY : phase.spotY;

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

      {/* Top Storefront Chrome + Live Cart Badge */}
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
            className="inline-flex items-center justify-center h-5 w-5 cv-radius-sm font-cv-mono text-[10px] font-bold shrink-0"
            style={{
              backgroundColor: 'rgba(225, 29, 72, 0.14)',
              color: MEUBLE_ROSE,
            }}
          >
            M
          </span>
          <span
            className="font-cv-mono text-[10px] font-semibold uppercase tracking-wider truncate"
            style={{ color: 'var(--cv-ink)' }}
          >
            MEUBLE STORE · LIVE DEMO
          </span>

          {isModal && (
            <span
              className="hidden sm:inline-flex px-1.5 py-0.5 cv-radius-sm font-cv-mono text-[9.5px] uppercase"
              style={{
                backgroundColor: 'var(--cv-surface)',
                color: 'var(--cv-ink-muted)',
                border: '1px solid var(--cv-border)',
              }}
            >
              AR · FR · EN
            </span>
          )}
        </div>

        {/* Live Animated Cart Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            key={`cart-pill-${activeCartIds.length}-${isConfirmed ? 'ok' : 'open'}`}
            className={`${activeCartIds.length > 0 && !reducedMotion ? 'cv-cart-pop' : ''} inline-flex items-center gap-1.5 px-2.5 py-0.5 cv-radius-pill font-cv-mono text-[10px] font-semibold cv-tabular`}
            style={{
              backgroundColor: isConfirmed
                ? 'var(--cv-live-soft)'
                : activeCartIds.length > 0
                  ? 'rgba(225, 29, 72, 0.14)'
                  : 'var(--cv-surface)',
              color: isConfirmed
                ? 'var(--cv-live)'
                : activeCartIds.length > 0
                  ? MEUBLE_ROSE
                  : 'var(--cv-ink-muted)',
              border: `1px solid ${
                isConfirmed
                  ? 'rgba(21, 128, 61, 0.35)'
                  : activeCartIds.length > 0
                    ? 'rgba(225, 29, 72, 0.35)'
                    : 'var(--cv-border)'
              }`,
            }}
          >
            <ShoppingBag size={11} />
            <span>Cart ({activeCartIds.length})</span>
            {isConfirmed && !isModal && <span>· Order ✓</span>}
          </div>
        </div>
      </div>

      {/* Main Furniture Catalog + Live Cart Stage */}
      <div
        className={`relative z-10 flex-1 min-h-0 flex flex-col justify-between ${
          isModal ? 'p-3.5 gap-2.5' : 'p-2.5 gap-1.5'
        }`}
      >
        <div
          className={`relative flex-1 min-h-0 grid gap-2.5 items-stretch ${
            isModal ? 'grid-cols-1 sm:grid-cols-12' : 'grid-cols-2'
          }`}
        >
          {/* Furniture Cards Grid (7 cols in modal, 2 cols in spotlight) */}
          <div
            className={`${
              isModal ? 'sm:col-span-7 grid grid-cols-2 gap-2.5' : 'col-span-2 grid grid-cols-2 gap-2'
            }`}
          >
            {FURNITURE_ITEMS.map((item) => {
              const inCart = activeCartIds.includes(item.id);
              const isHovered = !isManual && phase.hoveredId === item.id;
              const isClicking = !isManual && phase.rippleTarget === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleItem(item.id)}
                  className={`relative cv-radius-sm flex flex-col justify-between transition-colors duration-200 ${
                    isModal ? 'p-2.5 sm:p-3 cursor-pointer' : 'p-2'
                  }`}
                  style={{
                    backgroundColor: 'var(--cv-surface-elevated)',
                    border: `1.5px solid ${
                      inCart || isHovered ? MEUBLE_ROSE : 'var(--cv-border)'
                    }`,
                    boxShadow: isHovered
                      ? '0 0 0 2px rgba(225, 29, 72, 0.12)'
                      : undefined,
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="font-cv-mono text-[8.5px] uppercase px-1.5 py-0.5 cv-radius-sm truncate"
                      style={{
                        backgroundColor: 'var(--cv-surface)',
                        color: 'var(--cv-ink-muted)',
                      }}
                    >
                      {item.tag}
                    </span>
                    <span
                      className="font-cv-mono text-[9.5px] font-bold cv-tabular shrink-0"
                      style={{ color: 'var(--cv-ink)' }}
                    >
                      {item.priceLabel}
                    </span>
                  </div>

                  {/* Minimalist Furniture SVG */}
                  <div className="my-auto py-1">
                    {item.id === 'bed' ? (
                      <BedIllustration active={inCart || isHovered} />
                    ) : (
                      <SofaIllustration active={inCart || isHovered} />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="text-[11px] sm:text-[11.5px] font-semibold truncate"
                      style={{ color: 'var(--cv-ink)' }}
                    >
                      {item.name}
                    </span>

                    <span
                      className="relative inline-flex items-center gap-1 px-2 py-0.5 cv-radius-pill font-cv-mono text-[9px] font-semibold shrink-0 transition-colors"
                      style={{
                        backgroundColor: inCart
                          ? 'rgba(225, 29, 72, 0.14)'
                          : 'var(--cv-surface)',
                        color: inCart ? MEUBLE_ROSE : 'var(--cv-ink-secondary)',
                        border: `1px solid ${
                          inCart ? 'rgba(225, 29, 72, 0.4)' : 'var(--cv-border)'
                        }`,
                      }}
                    >
                      {inCart ? <Check size={9} /> : null}
                      <span>{inCart ? 'In Cart' : '+ Add'}</span>

                      {isClicking && !reducedMotion && (
                        <span
                          key={`rip-${phase.id}-${item.id}`}
                          aria-hidden
                          className="cv-click-ripple pointer-events-none absolute inset-0 cv-radius-pill"
                          style={{
                            border: `2px solid ${MEUBLE_ROSE}`,
                          }}
                        />
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Cart Drawer Panel (Modal only) */}
          {isModal && (
            <div
              className="sm:col-span-5 cv-radius-sm p-3 flex flex-col justify-between gap-2"
              style={{
                backgroundColor: 'var(--cv-surface-elevated)',
                border: `1px solid ${
                  isConfirmed ? 'rgba(16, 185, 129, 0.45)' : 'var(--cv-border)'
                }`,
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className="font-cv-mono text-[9.5px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--cv-ink-muted)' }}
                  >
                    Order Summary
                  </span>
                  <span
                    className="font-cv-mono text-[10px] font-bold cv-tabular"
                    style={{ color: isConfirmed ? CONFIRMED_GREEN : MEUBLE_ROSE }}
                  >
                    {totalDa.toLocaleString('en-US')} DA
                  </span>
                </div>

                {cartItems.length === 0 ? (
                  <div
                    className="py-5 px-2 text-center cv-radius-sm font-cv-mono text-[10px]"
                    style={{
                      backgroundColor: 'var(--cv-surface)',
                      color: 'var(--cv-ink-subtle)',
                      border: '1px dashed var(--cv-border)',
                    }}
                  >
                    Select furniture to fill cart…
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {cartItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="cv-search-row px-2.5 py-1.5 cv-radius-sm flex items-center justify-between gap-2 text-[11px]"
                        style={{
                          animationDelay: `${idx * 40}ms`,
                          backgroundColor: 'var(--cv-surface)',
                          border: '1px solid var(--cv-border)',
                        }}
                      >
                        <span
                          className="font-medium truncate"
                          style={{ color: 'var(--cv-ink)' }}
                        >
                          1× {item.name}
                        </span>
                        <span
                          className="font-cv-mono text-[10px] cv-tabular shrink-0"
                          style={{ color: 'var(--cv-ink-muted)' }}
                        >
                          {item.priceLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleManualCheckout}
                disabled={activeCartIds.length === 0}
                className="relative w-full py-2 px-3 cv-radius-pill font-cv-mono text-[10.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-45"
                style={{
                  backgroundColor: isConfirmed
                    ? CONFIRMED_GREEN
                    : activeCartIds.length > 0
                      ? MEUBLE_ROSE
                      : 'var(--cv-surface)',
                  color:
                    isConfirmed || activeCartIds.length > 0
                      ? '#FFFFFF'
                      : 'var(--cv-ink-muted)',
                  border:
                    isConfirmed || activeCartIds.length > 0
                      ? 'none'
                      : '1px solid var(--cv-border)',
                }}
              >
                {isConfirmed ? <Sparkles size={12} /> : <ShoppingBag size={12} />}
                <span>
                  {isConfirmed ? 'Order Confirmed ✓' : 'Place Furniture Order'}
                </span>

                {!isManual && phase.rippleTarget === 'checkout' && !reducedMotion && (
                  <span
                    key="rip-checkout"
                    aria-hidden
                    className="cv-click-ripple pointer-events-none absolute inset-0 cv-radius-pill"
                    style={{ border: `2px solid ${CONFIRMED_GREEN}` }}
                  />
                )}
              </button>
            </div>
          )}

          {/* Full-Stage GPU-Accelerated Mouse Pointer Overlay */}
          {!isManual && !reducedMotion && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20"
              style={{
                transform: `translate3d(${cursorX}%, ${cursorY}%, 0)`,
                transition: 'transform 620ms cubic-bezier(0.23, 1, 0.32, 1)',
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
                    fill={isConfirmed ? CONFIRMED_GREEN : MEUBLE_ROSE}
                    stroke="#FFFFFF"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls & Provisioning Strip */}
        {isModal ? (
          <div className="space-y-2 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className="font-cv-mono text-[10px]"
                style={{ color: isConfirmed ? CONFIRMED_GREEN : 'var(--cv-ink-muted)' }}
              >
                {isManual
                  ? `Custom cart · ${totalDa.toLocaleString('en-US')} DA`
                  : phase.statusLabel}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="cv-search-pill px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] flex items-center gap-1"
                  style={{
                    backgroundColor: 'var(--cv-surface-elevated)',
                    color: 'var(--cv-ink-muted)',
                    border: '1px solid var(--cv-border)',
                  }}
                >
                  <RotateCcw size={10} />
                  <span>Replay</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isManual) {
                      handleReset();
                    } else {
                      setAutoPlay((p) => !p);
                    }
                  }}
                  className="cv-search-pill px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] flex items-center gap-1"
                  style={{
                    backgroundColor: 'var(--cv-surface-elevated)',
                    color: 'var(--cv-ink-muted)',
                    border: '1px solid var(--cv-border)',
                  }}
                >
                  {autoPlay && !isManual ? <Pause size={10} /> : <Play size={10} />}
                  <span>{autoPlay && !isManual ? 'Auto' : 'Play loop'}</span>
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
              <span>10-STEP PROVISIONING · NEXT.JS 16 · PRISMA 7 · CADDY SSL</span>
              <span style={{ color: MEUBLE_ROSE }}>8,700+ TESTS</span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center justify-between gap-2 px-0.5 shrink-0 font-cv-mono text-[9.5px]">
            <span style={{ color: isConfirmed ? CONFIRMED_GREEN : MEUBLE_ROSE }}>
              {phase.statusLabel}
            </span>
            <span className="cv-tabular" style={{ color: 'var(--cv-ink-muted)' }}>
              {totalDa.toLocaleString('en-US')} DA
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
