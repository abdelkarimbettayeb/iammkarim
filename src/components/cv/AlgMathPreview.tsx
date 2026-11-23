'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { CheckCircle2, Pause, Play, Sigma } from 'lucide-react';

type LocaleCode = 'en' | 'ar' | 'fr';
type MathModeId = 'limit' | 'tvi';

interface ApproachPoint {
  sx: number;
  sy: number;
  xLabel: string;
  yLabel: string;
  activeStepIdx: number;
  verified: boolean;
}

interface MathModeSpec {
  id: MathModeId;
  formula: string;
  targetBadge: string;
  tabLabel: Record<LocaleCode, string>;
  chapterLabel: Record<LocaleCode, string>;
  steps: Record<LocaleCode, { label: string; math: string }[]>;
  points: ApproachPoint[];
}

const MATH_INDIGO = '#4f46e5';
const VERIFIED_GREEN = '#10b981';

const MODES: Record<MathModeId, MathModeSpec> = {
  limit: {
    id: 'limit',
    formula: 'f(x) = (x² − 1) / (x − 1)',
    targetBadge: 'lim = 2',
    tabLabel: {
      en: 'Limit Zoom',
      ar: 'نهاية دالة',
      fr: 'Limite',
    },
    chapterLabel: {
      en: 'Ch.01 · Continuity & Limits (3AS)',
      ar: 'المحور 01 · النهايات والاستمرارية',
      fr: 'Ch.01 · Limites & Continuité',
    },
    steps: {
      en: [
        { label: 'Substitute x = 1', math: '0 / 0 (IF)' },
        { label: 'Factor numerator', math: '(x − 1)(x + 1) / (x − 1)' },
        { label: 'Converged limit', math: 'lim (x → 1) = 2 ✓' },
      ],
      ar: [
        { label: 'التعويض المباشر عند 1', math: '0 / 0 (ع.ت)' },
        { label: 'تحليل البسط واختزاله', math: '(x − 1)(x + 1) / (x − 1)' },
        { label: 'النهاية المحقّقة', math: 'lim (x → 1) = 2 ✓' },
      ],
      fr: [
        { label: 'Substitution directe', math: '0 / 0 (FI)' },
        { label: 'Factorisation', math: '(x − 1)(x + 1) / (x − 1)' },
        { label: 'Limite vérifiée', math: 'lim (x → 1) = 2 ✓' },
      ],
    },
    // Line y = x + 1, origin (34, 108), scaleX = 88, scaleY = 28
    points: [
      { sx: 56, sy: 73, xLabel: '0.25', yLabel: '1.25', activeStepIdx: 0, verified: false },
      { sx: 91.2, sy: 61.8, xLabel: '0.65', yLabel: '1.65', activeStepIdx: 1, verified: false },
      { sx: 111.4, sy: 55.4, xLabel: '0.88', yLabel: '1.88', activeStepIdx: 1, verified: false },
      { sx: 121.9, sy: 52, xLabel: '0.999', yLabel: '2.00', activeStepIdx: 2, verified: true },
    ],
  },
  tvi: {
    id: 'tvi',
    formula: 'f(x) = eˣ − 2 = 0',
    targetBadge: 'α ≈ 0.693',
    tabLabel: {
      en: 'TVI Root α',
      ar: 'القيم المتوسطة',
      fr: 'Théorème TVI',
    },
    chapterLabel: {
      en: 'Ch.01–03 · Intermediate Value Theorem',
      ar: 'مبرهنة القيم المتوسطة · الدالة الأسية',
      fr: 'Théorème des Valeurs Intermédiaires',
    },
    steps: {
      en: [
        { label: 'Strictly increasing on [0, 1]', math: "f'(x) = eˣ > 0" },
        { label: 'Sign change check', math: 'f(0)·f(1) < 0' },
        { label: 'Unique root α', math: 'α ∈ ]0.69, 0.70[ ✓' },
      ],
      ar: [
        { label: 'مستمرة ومتزايدة تماماً على [0,1]', math: "f'(x) = eˣ > 0" },
        { label: 'تغيّر الإشارة', math: 'f(0)·f(1) < 0' },
        { label: 'الحل الوحيد α', math: 'α ∈ ]0.69, 0.70[ ✓' },
      ],
      fr: [
        { label: 'Continue et monotone sur [0, 1]', math: "f'(x) = eˣ > 0" },
        { label: 'Changement de signe', math: 'f(0)·f(1) < 0' },
        { label: 'Solution unique α', math: 'α ∈ ]0.69, 0.70[ ✓' },
      ],
    },
    // Curve y = e^x - 2 on [0, 1], x_svg = 34 + x*156, y_svg = 64 - y*36
    points: [
      { sx: 34, sy: 100, xLabel: '0.00', yLabel: '−1.00', activeStepIdx: 0, verified: false },
      { sx: 88.6, sy: 84.9, xLabel: '0.35', yLabel: '−0.58', activeStepIdx: 1, verified: false },
      { sx: 121.4, sy: 73, xLabel: '0.56', yLabel: '−0.25', activeStepIdx: 1, verified: false },
      { sx: 142.1, sy: 64, xLabel: '0.693', yLabel: '0.000', activeStepIdx: 2, verified: true },
    ],
  },
};

const LOCALES: { code: LocaleCode; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
  { code: 'fr', label: 'FR' },
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

export interface AlgMathPreviewProps {
  variant?: 'modal' | 'spotlight';
}

export function AlgMathPreview({ variant = 'modal' }: AlgMathPreviewProps) {
  const isModal = variant === 'modal';
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const [modeId, setModeId] = useState<MathModeId>('limit');
  const [locale, setLocale] = useState<LocaleCode>('en');
  const [stepIdx, setStepIdx] = useState(reducedMotion ? 3 : 0);
  const [autoPlay, setAutoPlay] = useState(true);

  const mode = MODES[modeId];
  const point = mode.points[stepIdx];
  const isRtl = locale === 'ar';

  useEffect(() => {
    if (reducedMotion || !autoPlay) return;
    const isFinalStep = stepIdx === mode.points.length - 1;
    const timer = window.setTimeout(() => {
      if (!isFinalStep) {
        setStepIdx((prev) => prev + 1);
      } else {
        setModeId((prev) => (prev === 'limit' ? 'tvi' : 'limit'));
        setLocale((prev) => (prev === 'en' ? 'ar' : prev === 'ar' ? 'fr' : 'en'));
        setStepIdx(0);
      }
    }, isFinalStep ? 2300 : 880);

    return () => window.clearTimeout(timer);
  }, [autoPlay, mode.points.length, reducedMotion, stepIdx]);

  const handleSelectMode = (nextMode: MathModeId) => {
    setAutoPlay(false);
    setModeId(nextMode);
    setStepIdx(reducedMotion ? 3 : 0);
    if (!reducedMotion) {
      window.setTimeout(() => setStepIdx(3), 120);
    }
  };

  const handleSelectLocale = (nextLocale: LocaleCode) => {
    setAutoPlay(false);
    setLocale(nextLocale);
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

      {/* Top Instrument Chrome */}
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
              backgroundColor: 'rgba(79, 70, 229, 0.14)',
              color: MATH_INDIGO,
            }}
          >
            <Sigma size={12} />
          </span>

          <span
            className="font-cv-mono text-[10px] font-semibold uppercase tracking-wider truncate"
            style={{ color: 'var(--cv-ink)' }}
          >
            BAC 3AS MATHS · PWA
          </span>

          {isModal && (
            <span
              className="hidden sm:inline-flex px-1.5 py-0.5 cv-radius-sm font-cv-mono text-[9.5px] uppercase"
              style={{
                backgroundColor: 'rgba(79, 70, 229, 0.12)',
                color: MATH_INDIGO,
              }}
            >
              SE · M · TM
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isModal ? (
            <div
              className="inline-flex items-center p-0.5 cv-radius-pill gap-0.5"
              style={{
                backgroundColor: 'var(--cv-surface)',
                border: '1px solid var(--cv-border)',
              }}
            >
              {LOCALES.map((loc) => {
                const active = locale === loc.code;
                return (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => handleSelectLocale(loc.code)}
                    className="px-1.5 py-0.5 cv-radius-pill font-cv-mono text-[9.5px] font-semibold transition-colors"
                    style={{
                      backgroundColor: active ? MATH_INDIGO : 'transparent',
                      color: active ? '#FFFFFF' : 'var(--cv-ink-muted)',
                    }}
                  >
                    {loc.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <span
              className="px-2 py-0.5 cv-radius-pill font-cv-mono text-[9.5px] font-semibold uppercase"
              style={{
                backgroundColor: 'rgba(79, 70, 229, 0.12)',
                color: MATH_INDIGO,
              }}
            >
              {locale.toUpperCase()} · {point.verified ? mode.targetBadge : `x=${point.xLabel}`}
            </span>
          )}

          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] font-semibold cv-tabular"
            style={{
              backgroundColor: point.verified ? 'var(--cv-live-soft)' : 'var(--cv-surface)',
              color: point.verified ? VERIFIED_GREEN : 'var(--cv-ink-muted)',
              border: point.verified ? 'none' : '1px solid var(--cv-border)',
            }}
          >
            {point.verified && <CheckCircle2 size={10} />}
            <span>{mode.targetBadge}</span>
          </span>
        </div>
      </div>

      {/* Main Calculus Graph + Trilingual Step Solver */}
      <div
        className={`relative z-10 flex-1 min-h-0 flex flex-col justify-between ${
          isModal ? 'p-3.5 gap-2.5' : 'p-2.5 gap-1.5'
        }`}
      >
        <div
          className={`flex-1 min-h-0 grid gap-2.5 items-stretch ${
            isModal ? 'grid-cols-1 sm:grid-cols-12' : 'grid-cols-1'
          }`}
        >
          {/* SVG Coordinate Plot */}
          <div
            className={`${
              isModal ? 'sm:col-span-6' : 'col-span-1'
            } cv-radius-sm p-2.5 flex flex-col justify-between overflow-hidden`}
            style={{
              backgroundColor: 'var(--cv-surface-elevated)',
              border: '1px solid var(--cv-border)',
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span
                dir="ltr"
                className="font-cv-mono text-[10px] sm:text-[10.5px] font-semibold truncate"
                style={{ color: 'var(--cv-ink)' }}
              >
                {mode.formula}
              </span>
              <span
                dir="ltr"
                className="font-cv-mono text-[9.5px] cv-tabular shrink-0"
                style={{ color: point.verified ? VERIFIED_GREEN : MATH_INDIGO }}
              >
                ({point.xLabel}, {point.yLabel})
              </span>
            </div>

            <div className="flex-1 min-h-0 flex items-center justify-center">
              <svg
                viewBox="0 0 240 124"
                className="w-full h-full max-h-[155px]"
                aria-label={mode.formula}
              >
                {/* Faint coordinate grid */}
                <g stroke="var(--cv-border)" strokeWidth="0.7">
                  <line x1="22" y1="24" x2="224" y2="24" />
                  <line x1="22" y1="52" x2="224" y2="52" />
                  <line x1="22" y1="80" x2="224" y2="80" />
                  <line x1="78" y1="14" x2="78" y2="114" />
                  <line x1="122" y1="14" x2="122" y2="114" />
                  <line x1="166" y1="14" x2="166" y2="114" />
                </g>

                {modeId === 'limit' ? (
                  <>
                    {/* Axes */}
                    <line x1="22" y1="108" x2="224" y2="108" stroke="var(--cv-border-strong)" strokeWidth="1.2" />
                    <line x1="34" y1="14" x2="34" y2="116" stroke="var(--cv-border-strong)" strokeWidth="1.2" />
                    {/* Limit target dashed guides to (1, 2) = (122, 52) */}
                    <line x1="122" y1="52" x2="122" y2="108" stroke={MATH_INDIGO} strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
                    <line x1="34" y1="52" x2="122" y2="52" stroke={MATH_INDIGO} strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
                    {/* Function line y = x + 1 */}
                    <line x1="26" y1="82" x2="210" y2="24" stroke={MATH_INDIGO} strokeWidth="2.2" strokeLinecap="round" />
                    {/* Removable discontinuity hole at (1, 2) */}
                    <circle cx="122" cy="52" r="4.2" fill="var(--cv-surface-elevated)" stroke={MATH_INDIGO} strokeWidth="1.8" />
                    <text x="120" y="119" fontSize="8.5" fill="var(--cv-ink-muted)" fontFamily="monospace">1</text>
                    <text x="22" y="55" fontSize="8.5" fill="var(--cv-ink-muted)" fontFamily="monospace">2</text>
                  </>
                ) : (
                  <>
                    {/* Axes: zero line at y = 64 */}
                    <line x1="22" y1="64" x2="224" y2="64" stroke="var(--cv-border-strong)" strokeWidth="1.2" />
                    <line x1="34" y1="14" x2="34" y2="116" stroke="var(--cv-border-strong)" strokeWidth="1.2" />
                    {/* Root vertical guide at alpha = 0.693 -> x = 142.1 */}
                    <line x1="142.1" y1="64" x2="142.1" y2="108" stroke={VERIFIED_GREEN} strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
                    {/* Exponential curve y = e^x - 2 */}
                    <path
                      d="M 34 100 Q 108 79 142.1 64 T 204 28"
                      fill="none"
                      stroke={MATH_INDIGO}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    {/* Root marker */}
                    <circle cx="142.1" cy="64" r="3.8" fill="var(--cv-surface-elevated)" stroke={VERIFIED_GREEN} strokeWidth="1.8" />
                    <text x="139" y="117" fontSize="8.5" fill={VERIFIED_GREEN} fontFamily="monospace">α</text>
                    <text x="188" y="75" fontSize="8.5" fill="var(--cv-ink-muted)" fontFamily="monospace">1</text>
                  </>
                )}

                {/* Animated Moving Point M(x, f(x)) */}
                <g
                  style={{
                    transform: `translate(${point.sx}px, ${point.sy}px)`,
                    transition: reducedMotion
                      ? 'none'
                      : 'transform 520ms cubic-bezier(0.23, 1, 0.32, 1)',
                  }}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r="8"
                    fill={point.verified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(79, 70, 229, 0.2)'}
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="4"
                    fill={point.verified ? VERIFIED_GREEN : MATH_INDIGO}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                </g>
              </svg>
            </div>
          </div>

          {/* Trilingual CAS Step Solver Panel (Modal only) */}
          {isModal && (
            <div
              className="sm:col-span-6 cv-radius-sm p-3 flex flex-col justify-between gap-2"
              style={{
                backgroundColor: 'var(--cv-surface-elevated)',
                border: '1px solid var(--cv-border)',
              }}
            >
              <div>
                <div
                  className="flex items-center justify-between gap-2 mb-2"
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <span
                    className="text-[11px] font-semibold truncate"
                    style={{ color: 'var(--cv-ink)' }}
                  >
                    {mode.chapterLabel[locale]}
                  </span>
                  <span
                    dir="ltr"
                    className="font-cv-mono text-[9.5px] uppercase shrink-0"
                    style={{ color: 'var(--cv-ink-muted)' }}
                  >
                    CAS WORKER
                  </span>
                </div>

                <div className="space-y-1.5">
                  {mode.steps[locale].map((s, idx) => {
                    const isActive = point.activeStepIdx === idx;
                    const isDone = idx < point.activeStepIdx || (point.verified && idx === 2);
                    return (
                      <div
                        key={`${modeId}-${locale}-${idx}`}
                        dir={isRtl ? 'rtl' : 'ltr'}
                        className="px-2.5 py-1.5 cv-radius-sm flex items-center justify-between gap-2 transition-colors duration-200"
                        style={{
                          backgroundColor: isActive
                            ? point.verified
                              ? 'var(--cv-live-soft)'
                              : 'rgba(79, 70, 229, 0.1)'
                            : 'var(--cv-surface)',
                          border: `1px solid ${
                            isActive
                              ? point.verified
                                ? 'rgba(16, 185, 129, 0.45)'
                                : 'rgba(79, 70, 229, 0.45)'
                              : 'var(--cv-border)'
                          }`,
                          opacity: isActive || isDone ? 1 : 0.6,
                        }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            dir="ltr"
                            className="font-cv-mono text-[9.5px] font-semibold shrink-0 cv-tabular"
                            style={{
                              color:
                                isActive && point.verified
                                  ? VERIFIED_GREEN
                                  : isActive
                                    ? MATH_INDIGO
                                    : 'var(--cv-ink-muted)',
                            }}
                          >
                            0{idx + 1}
                          </span>
                          <span
                            className="text-[11px] font-medium truncate"
                            style={{ color: 'var(--cv-ink-secondary)' }}
                          >
                            {s.label}
                          </span>
                        </div>

                        <span
                          dir="ltr"
                          className="font-cv-mono text-[10px] font-semibold shrink-0"
                          style={{
                            color:
                              isActive && point.verified
                                ? VERIFIED_GREEN
                                : 'var(--cv-ink)',
                          }}
                        >
                          {s.math}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className="pt-2 flex items-center justify-between gap-2 font-cv-mono text-[9.5px]"
                style={{
                  borderTop: '1px solid var(--cv-border)',
                  color: 'var(--cv-ink-muted)',
                }}
              >
                <span>GOLDEN SUITE: 150 / 152</span>
                <span style={{ color: point.verified ? VERIFIED_GREEN : MATH_INDIGO }}>
                  {point.verified ? 'VERIFIED ✓' : 'CONVERGING…'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls / Spotlight Status */}
        {isModal ? (
          <div className="space-y-2 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['limit', 'tvi'] as MathModeId[]).map((id) => {
                  const active = modeId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectMode(id)}
                      dir={isRtl ? 'rtl' : 'ltr'}
                      className="cv-search-pill px-2.5 py-0.5 cv-radius-pill text-[10.5px] font-medium"
                      style={{
                        backgroundColor: active
                          ? 'rgba(79, 70, 229, 0.14)'
                          : 'var(--cv-surface-elevated)',
                        color: active ? MATH_INDIGO : 'var(--cv-ink-secondary)',
                        border: `1px solid ${
                          active ? 'rgba(79, 70, 229, 0.45)' : 'var(--cv-border)'
                        }`,
                      }}
                    >
                      {MODES[id].tabLabel[locale]}
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
              <span>OFFLINE PWA · MDX + KATEX + PAGEFIND · ~132 KiB GZIP</span>
              <span style={{ color: MATH_INDIGO }}>RTL + LTR MATH</span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center justify-between gap-2 px-0.5 shrink-0 font-cv-mono text-[9.5px]">
            <span
              dir={isRtl ? 'rtl' : 'ltr'}
              className="truncate"
              style={{ color: point.verified ? VERIFIED_GREEN : MATH_INDIGO }}
            >
              {mode.steps[locale][point.activeStepIdx].label}
            </span>
            <span
              dir="ltr"
              className="shrink-0"
              style={{ color: 'var(--cv-ink-muted)' }}
            >
              {mode.steps[locale][point.activeStepIdx].math}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
