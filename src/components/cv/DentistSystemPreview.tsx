'use client';

import React, { useEffect, useId, useState, useSyncExternalStore } from 'react';
import { CheckCircle2, Pause, Play, ShieldCheck, Stethoscope } from 'lucide-react';

type WorkflowModeId = 'visit' | 'waitlist' | 'audit';

type ToothKind = 'incisor' | 'canine' | 'premolar' | 'molar';
type ToothStatus = 'finding' | 'plan' | 'treated' | 'healthy';
type Surface = 'M' | 'D' | 'O' | 'B' | 'L';

interface ToothSpec {
  id: string;
  fdi: number;
  label: string;
  status: ToothStatus;
  surfaces?: Surface[];
  wholeOutline?: boolean;
  note: string;
  code: string;
}

const SURFACE_ORDER: readonly Surface[] = ['M', 'D', 'O', 'B', 'L'];

const POSITION_NAMES = [
  'Cent. Incisor',
  'Lat. Incisor',
  'Canine',
  '1st Premolar',
  '2nd Premolar',
  '1st Molar',
  '2nd Molar',
  '3rd Molar',
] as const;

const QUADRANT_PREFIX: Record<number, string> = {
  1: 'UR',
  2: 'UL',
  3: 'LL',
  4: 'LR',
};

const CROWN_SIZES: Record<number, { w: number; d: number }> = {
  1: { w: 19, d: 14 },
  2: { w: 16, d: 13 },
  3: { w: 17.5, d: 16.5 },
  4: { w: 18, d: 19.5 },
  5: { w: 18, d: 19.5 },
  6: { w: 26, d: 27 },
  7: { w: 24, d: 25 },
  8: { w: 21.5, d: 22.5 },
};

function toothKind(fdi: number): ToothKind {
  const pos = fdi % 10;
  if (pos <= 2) return 'incisor';
  if (pos === 3) return 'canine';
  return pos <= 5 ? 'premolar' : 'molar';
}

const CLINICAL_MARKS: Record<number, Omit<ToothSpec, 'id' | 'fdi' | 'label'>> = {
  16: {
    status: 'treated',
    surfaces: ['O'],
    note: 'Prophylaxis · Recall 6m',
    code: 'D1110',
  },
  14: {
    status: 'finding',
    surfaces: ['M', 'O'],
    note: 'MO Caries -> Composite',
    code: 'D2392',
  },
  24: {
    status: 'plan',
    wholeOutline: true,
    note: 'Plan Phase 1 · Crown',
    code: 'D2740',
  },
  26: {
    status: 'healthy',
    note: 'X-ray · SeaweedFS S3',
    code: 'D0220',
  },
  46: {
    status: 'plan',
    surfaces: ['B', 'L'],
    note: 'Perio 4mm · SRP Plan',
    code: 'D4341',
  },
  36: {
    status: 'finding',
    surfaces: ['O', 'D'],
    note: 'Crown Fracture · Urgent',
    code: 'D2750',
  },
};

function makeTooth(fdi: number): ToothSpec {
  const q = Math.floor(fdi / 10);
  const pos = fdi % 10;
  const mark = CLINICAL_MARKS[fdi];
  return {
    id: String(fdi),
    fdi,
    label: `#${fdi} ${QUADRANT_PREFIX[q]} ${POSITION_NAMES[pos - 1]}`,
    status: mark?.status ?? 'healthy',
    surfaces: mark?.surfaces,
    wholeOutline: mark?.wholeOutline,
    note: mark?.note ?? 'Intact · No findings',
    code: mark?.code ?? 'INTACT',
  };
}

const UPPER_FDIS = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_FDIS = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const DENTAL_TEETH: ToothSpec[] = [...UPPER_FDIS, ...LOWER_FDIS].map(makeTooth);

/** Organic top-down occlusal tooth silhouettes in local frame (-y buccal/cheek, +y lingual/tongue). */
function crownSilhouette(kind: ToothKind, w: number, d: number): string {
  const x = w / 2;
  const y = d / 2;
  const f = (v: number) => (Math.round(v * 100) / 100).toString();

  if (kind === 'molar') {
    return [
      `M 0 ${f(-y * 0.88)}`,
      `C ${f(x * 0.35)} ${f(-y * 1.02)} ${f(x * 0.86)} ${f(-y * 0.98)} ${f(x * 0.96)} ${f(-y * 0.56)}`,
      `C ${f(x * 1.03)} ${f(-y * 0.25)} ${f(x * 0.94)} ${f(-y * 0.08)} ${f(x * 0.91)} 0`,
      `C ${f(x * 0.94)} ${f(y * 0.08)} ${f(x * 1.03)} ${f(y * 0.28)} ${f(x * 0.94)} ${f(y * 0.6)}`,
      `C ${f(x * 0.82)} ${f(y * 0.98)} ${f(x * 0.32)} ${f(y * 1.02)} 0 ${f(y * 0.88)}`,
      `C ${f(-x * 0.32)} ${f(y * 1.02)} ${f(-x * 0.82)} ${f(y * 0.98)} ${f(-x * 0.94)} ${f(y * 0.6)}`,
      `C ${f(-x * 1.03)} ${f(y * 0.28)} ${f(-x * 0.94)} ${f(y * 0.08)} ${f(-x * 0.91)} 0`,
      `C ${f(-x * 0.94)} ${f(-y * 0.08)} ${f(-x * 1.03)} ${f(-y * 0.25)} ${f(-x * 0.96)} ${f(-y * 0.56)}`,
      `C ${f(-x * 0.86)} ${f(-y * 0.98)} ${f(-x * 0.35)} ${f(-y * 1.02)} 0 ${f(-y * 0.88)} Z`,
    ].join(' ');
  }

  if (kind === 'premolar') {
    return [
      `M 0 ${f(-y * 0.94)}`,
      `C ${f(x * 0.52)} ${f(-y * 1.02)} ${f(x * 0.98)} ${f(-y * 0.62)} ${f(x * 0.94)} 0`,
      `C ${f(x * 0.98)} ${f(y * 0.58)} ${f(x * 0.5)} ${f(y * 1.02)} 0 ${f(y * 0.94)}`,
      `C ${f(-x * 0.5)} ${f(y * 1.02)} ${f(-x * 0.98)} ${f(y * 0.58)} ${f(-x * 0.94)} 0`,
      `C ${f(-x * 0.98)} ${f(-y * 0.62)} ${f(-x * 0.52)} ${f(-y * 1.02)} 0 ${f(-y * 0.94)} Z`,
    ].join(' ');
  }

  if (kind === 'canine') {
    return [
      `M 0 ${f(-y * 0.98)}`,
      `C ${f(x * 0.62)} ${f(-y * 0.98)} ${f(x * 1.02)} ${f(-y * 0.44)} ${f(x * 0.88)} ${f(y * 0.14)}`,
      `C ${f(x * 0.74)} ${f(y * 0.68)} ${f(x * 0.42)} ${f(y * 0.98)} 0 ${f(y * 0.94)}`,
      `C ${f(-x * 0.42)} ${f(y * 0.98)} ${f(-x * 0.74)} ${f(y * 0.68)} ${f(-x * 0.88)} ${f(y * 0.14)}`,
      `C ${f(-x * 1.02)} ${f(-y * 0.44)} ${f(-x * 0.62)} ${f(-y * 0.98)} 0 ${f(-y * 0.98)} Z`,
    ].join(' ');
  }

  // Incisor: gently arched labial edge tapering to rounded lingual cingulum
  return [
    `M 0 ${f(-y * 0.94)}`,
    `C ${f(x * 0.58)} ${f(-y * 0.95)} ${f(x * 0.98)} ${f(-y * 0.74)} ${f(x * 0.94)} ${f(-y * 0.16)}`,
    `C ${f(x * 0.88)} ${f(y * 0.48)} ${f(x * 0.52)} ${f(y * 0.96)} 0 ${f(y * 0.94)}`,
    `C ${f(-x * 0.52)} ${f(y * 0.96)} ${f(-x * 0.88)} ${f(y * 0.48)} ${f(-x * 0.94)} ${f(-y * 0.16)}`,
    `C ${f(-x * 0.98)} ${f(-y * 0.74)} ${f(-x * 0.58)} ${f(-y * 0.95)} 0 ${f(-y * 0.94)} Z`,
  ].join(' ');
}

function crownFissures(kind: ToothKind, w: number, d: number): string {
  const f = (v: number) => (Math.round(v * 100) / 100).toString();
  if (kind === 'molar') {
    return `M ${f(-w * 0.25)} 0 Q 0 ${f(-d * 0.12)} ${f(w * 0.25)} 0 M 0 ${f(-d * 0.24)} Q ${f(w * 0.08)} 0 0 ${f(d * 0.24)}`;
  }
  if (kind === 'premolar') {
    return `M ${f(-w * 0.22)} 0 Q 0 ${f(-d * 0.08)} ${f(w * 0.22)} 0`;
  }
  return `M ${f(-w * 0.22)} ${f(-d * 0.1)} Q 0 ${f(-d * 0.18)} ${f(w * 0.22)} ${f(-d * 0.1)}`;
}

function crownPolygons(w: number, d: number, mesialRight: boolean): Record<Surface, string> {
  const x = w / 2;
  const y = d / 2;
  const ix = x - w * 0.27;
  const iy = y - d * 0.27;
  const pts = (corners: [number, number][]) =>
    corners.map(([cx, cy]) => `${cx.toFixed(2)},${cy.toFixed(2)}`).join(' ');
  const top = pts([
    [-x, -y],
    [x, -y],
    [ix, -iy],
    [-ix, -iy],
  ]);
  const bottom = pts([
    [-x, y],
    [x, y],
    [ix, iy],
    [-ix, iy],
  ]);
  const left = pts([
    [-x, -y],
    [-ix, -iy],
    [-ix, iy],
    [-x, y],
  ]);
  const right = pts([
    [x, -y],
    [x, y],
    [ix, iy],
    [ix, -iy],
  ]);
  return {
    O: pts([
      [-ix, -iy],
      [ix, -iy],
      [ix, iy],
      [-ix, iy],
    ]),
    B: top,
    L: bottom,
    M: mesialRight ? right : left,
    D: mesialRight ? left : right,
  };
}

interface ArchShape {
  cx: number;
  cy: number;
  a: number;
  b: number;
  upper: boolean;
}

interface Placement {
  x: number;
  y: number;
  matrix: [number, number, number, number, number, number];
  outward: [number, number];
  mesialRight: boolean;
}

const ARCH_END = 0.08;
const ARCH_SAMPLES = 240;

function archPlacements(
  widths: readonly number[],
  midIndex: number,
  shape: ArchShape,
  gap = 1.6
): Placement[] {
  const phi: number[] = [];
  const len: number[] = [];
  let travelled = 0;
  let last: [number, number] | null = null;
  for (let i = 0; i <= ARCH_SAMPLES; i += 1) {
    const angle = Math.PI - ARCH_END - (i * (Math.PI - 2 * ARCH_END)) / ARCH_SAMPLES;
    const pt: [number, number] = [shape.a * Math.cos(angle), shape.b * Math.sin(angle)];
    if (last) travelled += Math.hypot(pt[0] - last[0], pt[1] - last[1]);
    phi.push(angle);
    len.push(travelled);
    last = pt;
  }

  const totalLen = len[len.length - 1] ?? 0;
  const sum = widths.reduce((t, w) => t + w, 0);
  const strip = sum + gap * (widths.length - 1);
  const squeeze = Math.min(1, totalLen / strip);
  const used = strip * squeeze;

  let before = 0;
  for (let i = 0; i < midIndex; i += 1) before += (widths[i] ?? 0) + gap;
  let cursor = Math.min(Math.max(totalLen / 2 - (before - gap / 2) * squeeze, 0), totalLen - used);

  const angleAt = (at: number) => {
    const clamped = Math.min(Math.max(at, 0), totalLen);
    let lo = 0;
    let hi = len.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if ((len[mid] ?? 0) <= clamped) lo = mid;
      else hi = mid;
    }
    const span = (len[hi] ?? 0) - (len[lo] ?? 0);
    const share = span === 0 ? 0 : (clamped - (len[lo] ?? 0)) / span;
    return (phi[lo] ?? 0) + share * ((phi[hi] ?? 0) - (phi[lo] ?? 0));
  };

  return widths.map((w) => {
    const centre = cursor + (w * squeeze) / 2;
    cursor += (w + gap) * squeeze;
    const angle = angleAt(centre);
    const x = shape.cx + shape.a * Math.cos(angle);
    const offsetY = shape.b * Math.sin(angle);
    const y = shape.upper ? shape.cy - offsetY : shape.cy + offsetY;
    const nx = Math.cos(angle) / shape.a;
    const ny = (shape.upper ? -Math.sin(angle) : Math.sin(angle)) / shape.b;
    const norm = Math.hypot(nx, ny);
    const outward: [number, number] = [nx / norm, ny / norm];
    const ey: [number, number] = [-outward[0], -outward[1]];
    const ex: [number, number] = [ey[1], -ey[0]];
    const towardMidline = Math.sign(shape.cx - x);
    return {
      x,
      y,
      matrix: [ex[0], ex[1], ey[0], ey[1], x, y],
      outward,
      mesialRight: ex[0] * towardMidline > 0,
    };
  });
}

const UPPER_ARCH: ArchShape = { cx: 180, cy: 122, a: 132, b: 86, upper: true };
const LOWER_ARCH: ArchShape = { cx: 180, cy: 134, a: 132, b: 86, upper: false };
const LABEL_GAP = 10.5;

const UPPER_TEETH = UPPER_FDIS.map(makeTooth);
const LOWER_TEETH = LOWER_FDIS.map(makeTooth);
const UPPER_PLACEMENTS = archPlacements(
  UPPER_TEETH.map((t) => CROWN_SIZES[t.fdi % 10]!.w),
  8,
  UPPER_ARCH
);
const LOWER_PLACEMENTS = archPlacements(
  LOWER_TEETH.map((t) => CROWN_SIZES[t.fdi % 10]!.w),
  8,
  LOWER_ARCH
);

const CLINICAL_TEAL = '#0d9488';
const PERIWINKLE = '#4352E0';
const VERIFIED_GREEN = '#10b981';

interface HandoffStep {
  actor: string;
  title: string;
  detail: string;
  badge: string;
  toothId: string;
  stageLabel: string;
  verified?: boolean;
}

interface WorkflowSpec {
  id: WorkflowModeId;
  tabLabel: string;
  moduleTag: string;
  steps: HandoffStep[];
}

const WORKFLOWS: Record<WorkflowModeId, WorkflowSpec> = {
  visit: {
    id: 'visit',
    tabLabel: 'Visit Flow',
    moduleTag: 'APPT · CHART · BILL',
    steps: [
      {
        actor: 'EXPO MOBILE',
        title: 'Slot held & QR/GPS check-in',
        detail: '6-digit desk code + triage alerts',
        badge: 'CHECKED IN',
        toothId: '14',
        stageLabel: 'ARRIVED · WAITING ROOM',
      },
      {
        actor: 'REFINE 5 ADMIN',
        title: 'Odontogram chart & frozen plan',
        detail: 'Tooth #14 D2392 + e-signed fees',
        badge: 'CHARTED',
        toothId: '24',
        stageLabel: 'CHAIRSIDE · SIGNED',
      },
      {
        actor: 'APOLLO + PG-BOSS',
        title: 'Outbox dispatches PDF & push',
        detail: 'FOR UPDATE SKIP LOCKED + S3',
        badge: 'OUTBOX OK',
        toothId: '36',
        stageLabel: 'WORKER · PDF + FCM',
      },
      {
        actor: 'CHECKOUT + AUDIT',
        title: 'Split payment & hash-chained log',
        detail: 'Blind cash drawer + Stripe receipt',
        badge: 'COMPLETE ✓',
        toothId: '14',
        stageLabel: 'DISCHARGED · AUDITED ✓',
        verified: true,
      },
    ],
  },
  waitlist: {
    id: 'waitlist',
    tabLabel: 'Waitlist Fill',
    moduleTag: 'WAITLIST · PUSH · BOOK',
    steps: [
      {
        actor: 'PATIENT A · APP',
        title: 'Late cancellation frees chair',
        detail: 'Clinic policy checked automatically',
        badge: 'SLOT FREED',
        toothId: '36',
        stageLabel: 'CHAIR 03 · OPEN GAP',
      },
      {
        actor: 'PG-BOSS WORKER',
        title: 'Matches 3 waiting patients',
        detail: '15-min FCM/APNs offer dispatched',
        badge: 'OFFERED',
        toothId: '24',
        stageLabel: '3 OFFERS · 15M TTL',
      },
      {
        actor: 'PATIENT B · APP',
        title: 'Atomic claim prevents race',
        detail: 'First tap books without double-hold',
        badge: 'CLAIMED',
        toothId: '16',
        stageLabel: 'SLOT LOCKED · CONFIRMED',
      },
      {
        actor: 'RECEPTION DESK',
        title: 'Schedule updated in real time',
        detail: 'Zero phone calls, chair recovered',
        badge: 'FILLED ✓',
        toothId: '16',
        stageLabel: 'CHAIR RECOVERED ✓',
        verified: true,
      },
    ],
  },
  audit: {
    id: 'audit',
    tabLabel: 'Audit & Ops',
    moduleTag: 'MFA · SEAWEEDFS · S3',
    steps: [
      {
        actor: 'AUTH + TOTP MFA',
        title: 'Step-up 2FA & 7-role RBAC',
        detail: 'Argon2id + AES-256-GCM secret seal',
        badge: 'MFA OK',
        toothId: '26',
        stageLabel: 'CLINIC SCOPE VERIFIED',
      },
      {
        actor: 'SEAWEEDFS S3',
        title: 'Presigned X-ray SHA-256 check',
        detail: 'Worker re-hashes & quarantines bad',
        badge: 'S3 VERIFIED',
        toothId: '26',
        stageLabel: 'IMAGING INTEGRITY OK',
      },
      {
        actor: 'STERILIZATION',
        title: 'Spore test & lot recall lookup',
        detail: 'Pack barcodes linked to patient visit',
        badge: 'TRACEABLE',
        toothId: '46',
        stageLabel: 'LOT + PACK LINKED',
      },
      {
        actor: 'AUDIT LEDGER',
        title: 'Append-only hash-chained trail',
        detail: 'Patient "Who viewed" + Restic backup',
        badge: 'SEALED ✓',
        toothId: '14',
        stageLabel: 'HIPAA AUDIT SEALED ✓',
        verified: true,
      },
    ],
  },
};

const WORKFLOW_ORDER: WorkflowModeId[] = ['visit', 'waitlist', 'audit'];

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

export interface DentistSystemPreviewProps {
  variant?: 'modal' | 'spotlight';
}

export function DentistSystemPreview({ variant = 'modal' }: DentistSystemPreviewProps) {
  const isModal = variant === 'modal';
  const idPrefix = useId().replace(/[^a-zA-Z0-9]/g, '');
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const [modeId, setModeId] = useState<WorkflowModeId>('visit');
  const [stepIdx, setStepIdx] = useState(reducedMotion ? 3 : 0);
  const [selectedToothId, setSelectedToothId] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);

  const workflow = WORKFLOWS[modeId];
  const step = workflow.steps[stepIdx];
  const activeToothId = selectedToothId ?? step.toothId;
  const activeTooth = DENTAL_TEETH.find((t) => t.id === activeToothId) ?? DENTAL_TEETH[1];

  useEffect(() => {
    if (reducedMotion || !autoPlay) return;
    const isFinal = stepIdx === workflow.steps.length - 1;
    const timer = window.setTimeout(() => {
      setSelectedToothId(null);
      if (!isFinal) {
        setStepIdx((prev) => prev + 1);
      } else {
        setModeId((prev) => {
          const next = (WORKFLOW_ORDER.indexOf(prev) + 1) % WORKFLOW_ORDER.length;
          return WORKFLOW_ORDER[next];
        });
        setStepIdx(0);
      }
    }, isFinal ? 2200 : 950);

    return () => window.clearTimeout(timer);
  }, [autoPlay, reducedMotion, stepIdx, workflow.steps.length]);

  const handleSelectMode = (nextMode: WorkflowModeId) => {
    setAutoPlay(false);
    setSelectedToothId(null);
    setModeId(nextMode);
    setStepIdx(reducedMotion ? 3 : 0);
    if (!reducedMotion) {
      window.setTimeout(() => setStepIdx(3), 140);
    }
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
              backgroundColor: 'rgba(13, 148, 136, 0.14)',
              color: CLINICAL_TEAL,
            }}
          >
            <Stethoscope size={12} />
          </span>

          <span
            className="font-cv-mono text-[10px] font-semibold uppercase tracking-wider truncate"
            style={{ color: 'var(--cv-ink)' }}
          >
            BAHMARDI DENTAL · CLINICAL SUITE
          </span>

          {isModal && (
            <span
              className="hidden sm:inline-flex px-1.5 py-0.5 cv-radius-sm font-cv-mono text-[9.5px] uppercase shrink-0"
              style={{
                backgroundColor: 'rgba(67, 82, 224, 0.12)',
                color: PERIWINKLE,
              }}
            >
              31 MODULES
            </span>
          )}
        </div>

        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 cv-radius-pill font-cv-mono text-[9.5px] font-semibold cv-tabular shrink-0"
          style={{
            backgroundColor: step.verified ? 'var(--cv-live-soft)' : 'rgba(13, 148, 136, 0.12)',
            color: step.verified ? VERIFIED_GREEN : CLINICAL_TEAL,
          }}
        >
          {step.verified && <CheckCircle2 size={10} />}
          <span>{step.badge}</span>
        </span>
      </div>

      {/* Main Odontogram & Multi-App Handoff Grid */}
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
          {/* Left Panel: Interactive Dental Odontogram Arch */}
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
                className="font-cv-mono text-[10px] font-semibold uppercase tracking-wider truncate"
                style={{ color: 'var(--cv-ink)' }}
              >
                ODONTOGRAM · {activeTooth.label}
              </span>
              <span
                className="font-cv-mono text-[9.5px] font-semibold shrink-0 cv-tabular"
                style={{
                  color:
                    activeTooth.status === 'finding'
                      ? '#f59e0b'
                      : activeTooth.status === 'plan'
                        ? PERIWINKLE
                        : CLINICAL_TEAL,
                }}
              >
                {activeTooth.code}
              </span>
            </div>

            <div className="flex-1 min-h-0 flex items-center justify-center">
              <svg
                viewBox="0 0 360 256"
                className={`w-full h-full ${isModal ? 'max-h-[210px]' : 'max-h-[144px]'}`}
                aria-label="Interactive open-mouth occlusal odontogram"
              >
                {/* Center Crosshair & Anatomical Orientation */}
                <g stroke="var(--cv-border-strong)" strokeWidth="0.9" pointerEvents="none">
                  <line x1="180" y1="108" x2="180" y2="148" />
                  <line x1="160" y1="128" x2="200" y2="128" />
                </g>
                <text
                  x="150"
                  y="130.5"
                  textAnchor="end"
                  fontSize="6.5"
                  fontFamily="monospace"
                  fill="var(--cv-ink-muted)"
                  pointerEvents="none"
                >
                  Patient&apos;s right
                </text>
                <text
                  x="210"
                  y="130.5"
                  textAnchor="start"
                  fontSize="6.5"
                  fontFamily="monospace"
                  fill="var(--cv-ink-muted)"
                  pointerEvents="none"
                >
                  Patient&apos;s left
                </text>

                {[
                  { teeth: UPPER_TEETH, placements: UPPER_PLACEMENTS, title: 'Upper teeth' },
                  { teeth: LOWER_TEETH, placements: LOWER_PLACEMENTS, title: 'Lower teeth' },
                ].map((arch) => (
                  <g key={arch.title} role="group" aria-label={arch.title}>
                    {arch.teeth.map((tooth, idx) => {
                      const placement = arch.placements[idx]!;
                      const { w, d } = CROWN_SIZES[tooth.fdi % 10]!;
                      const kind = toothKind(tooth.fdi);
                      const outline = crownSilhouette(kind, w, d);
                      const groove = crownFissures(kind, w, d);
                      const polygons = crownPolygons(w, d, placement.mesialRight);
                      const clipId = `${idPrefix}-t${tooth.id}`;

                      const isActive = tooth.id === activeTooth.id;
                      const accentColor =
                        tooth.status === 'finding'
                          ? '#f59e0b'
                          : tooth.status === 'plan'
                            ? PERIWINKLE
                            : CLINICAL_TEAL;
                      const isMarked = tooth.status !== 'healthy';

                      const labelX = placement.x + placement.outward[0] * (d / 2 + LABEL_GAP);
                      const labelY = placement.y + placement.outward[1] * (d / 2 + LABEL_GAP);

                      return (
                        <g
                          key={tooth.id}
                          className="cursor-pointer"
                          onClick={() => {
                            setAutoPlay(false);
                            setSelectedToothId(tooth.id);
                          }}
                        >
                          <g transform={`matrix(${placement.matrix.map((v) => v.toFixed(3)).join(' ')})`}>
                            <clipPath id={clipId}>
                              <path d={outline} />
                            </clipPath>

                            {/* Active Outer Tooth Halo */}
                            {isActive && (
                              <path
                                d={outline}
                                fill="none"
                                stroke={accentColor}
                                strokeWidth="3.5"
                                strokeOpacity="0.28"
                                strokeLinejoin="round"
                              />
                            )}

                            {/* Clipped 5-Surface Occlusal Polygons */}
                            <g clipPath={`url(#${clipId})`}>
                              {SURFACE_ORDER.map((surface) => {
                                const hit = tooth.surfaces?.includes(surface) ?? false;
                                const fill = hit
                                  ? accentColor
                                  : isActive && !isMarked
                                    ? 'rgba(13, 148, 136, 0.12)'
                                    : 'var(--cv-surface-elevated)';
                                return (
                                  <polygon
                                    key={surface}
                                    points={polygons[surface]}
                                    fill={fill}
                                    fillOpacity={hit ? (isActive ? 0.92 : 0.72) : 1}
                                    stroke="var(--cv-border)"
                                    strokeWidth="0.6"
                                    strokeLinejoin="round"
                                  />
                                );
                              })}
                            </g>

                            {/* Anatomical Occlusal Fissures / Incisal Ridge */}
                            <path
                              d={groove}
                              fill="none"
                              stroke="var(--cv-ink-subtle)"
                              strokeOpacity={0.55}
                              strokeWidth="0.7"
                              strokeLinecap="round"
                              pointerEvents="none"
                            />

                            {/* Organic Tooth Contour */}
                            <path
                              d={outline}
                              fill="none"
                              stroke={isActive ? accentColor : 'var(--cv-border-strong)'}
                              strokeWidth={isActive ? '1.35' : '0.95'}
                              strokeLinejoin="round"
                              pointerEvents="none"
                            />

                            {/* Whole-Tooth Plan Outline (e.g. Crown on #24) */}
                            {tooth.wholeOutline && (
                              <path
                                d={outline}
                                fill={accentColor}
                                fillOpacity={isActive ? 0.28 : 0.14}
                                stroke={accentColor}
                                strokeWidth="1.6"
                                strokeLinejoin="round"
                                pointerEvents="none"
                              />
                            )}
                          </g>

                          {/* External FDI Tooth Number */}
                          <text
                            x={labelX}
                            y={labelY + 2.5}
                            textAnchor="middle"
                            fontSize="6.8"
                            fontWeight={isActive ? '700' : '500'}
                            fontFamily="monospace"
                            fill={
                              isActive
                                ? accentColor
                                : isMarked
                                  ? 'var(--cv-ink)'
                                  : 'var(--cv-ink-muted)'
                            }
                          >
                            {tooth.id}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                ))}
              </svg>
            </div>

            <div
              className="mt-1 pt-1.5 flex items-center justify-between gap-2 font-cv-mono text-[9.5px]"
              style={{ borderTop: '1px solid var(--cv-border)' }}
            >
              <span className="truncate" style={{ color: 'var(--cv-ink-secondary)' }}>
                {activeTooth.note}
              </span>
              <span className="shrink-0" style={{ color: CLINICAL_TEAL }}>
                {isModal ? 'TAP TOOTH' : 'CDT · PLAN'}
              </span>
            </div>
          </div>

          {/* Right Panel (Modal): 4-Step Multi-App Handoff Feed */}
          {isModal && (
            <div
              className="sm:col-span-6 cv-radius-sm p-3 flex flex-col justify-between gap-2"
              style={{
                backgroundColor: 'var(--cv-surface-elevated)',
                border: '1px solid var(--cv-border)',
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className="font-cv-mono text-[10px] font-semibold uppercase tracking-wider truncate"
                    style={{ color: 'var(--cv-ink)' }}
                  >
                    {workflow.moduleTag}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 font-cv-mono text-[9.5px] shrink-0"
                    style={{ color: CLINICAL_TEAL }}
                  >
                    <ShieldCheck size={10} />
                    <span>ONE RECORD</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  {workflow.steps.map((s, idx) => {
                    const isActive = stepIdx === idx;
                    const isDone = idx < stepIdx || (step.verified && idx === workflow.steps.length - 1);
                    return (
                      <button
                        key={`${modeId}-${s.actor}`}
                        type="button"
                        onClick={() => {
                          setAutoPlay(false);
                          setSelectedToothId(null);
                          setStepIdx(idx);
                        }}
                        className="w-full text-left px-2.5 py-1.5 cv-radius-sm flex items-center justify-between gap-2 transition-colors duration-200"
                        style={{
                          backgroundColor: isActive
                            ? s.verified
                              ? 'var(--cv-live-soft)'
                              : 'rgba(13, 148, 136, 0.1)'
                            : 'var(--cv-surface)',
                          border: `1px solid ${
                            isActive
                              ? s.verified
                                ? 'rgba(16, 185, 129, 0.45)'
                                : 'rgba(13, 148, 136, 0.45)'
                              : 'var(--cv-border)'
                          }`,
                          opacity: isActive || isDone ? 1 : 0.62,
                        }}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-cv-mono text-[9px] font-semibold shrink-0 cv-tabular"
                              style={{
                                color:
                                  isActive && s.verified
                                    ? VERIFIED_GREEN
                                    : isActive
                                      ? CLINICAL_TEAL
                                      : 'var(--cv-ink-muted)',
                              }}
                            >
                              0{idx + 1}
                            </span>
                            <span
                              className="text-[11px] font-semibold truncate"
                              style={{ color: 'var(--cv-ink)' }}
                            >
                              {s.title}
                            </span>
                          </div>
                          <div
                            className="text-[10px] truncate pl-4"
                            style={{ color: 'var(--cv-ink-muted)' }}
                          >
                            {s.detail}
                          </div>
                        </div>

                        <span
                          className="font-cv-mono text-[9px] font-semibold shrink-0"
                          style={{
                            color: isActive && s.verified ? VERIFIED_GREEN : CLINICAL_TEAL,
                          }}
                        >
                          {s.actor}
                        </span>
                      </button>
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
                <span>PG-BOSS OUTBOX · S3</span>
                <span style={{ color: step.verified ? VERIFIED_GREEN : CLINICAL_TEAL }}>
                  {step.stageLabel}
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
                {WORKFLOW_ORDER.map((id) => {
                  const active = modeId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectMode(id)}
                      className="cv-search-pill px-2.5 py-0.5 cv-radius-pill text-[10.5px] font-medium"
                      style={{
                        backgroundColor: active
                          ? 'rgba(13, 148, 136, 0.14)'
                          : 'var(--cv-surface-elevated)',
                        color: active ? CLINICAL_TEAL : 'var(--cv-ink-secondary)',
                        border: `1px solid ${
                          active ? 'rgba(13, 148, 136, 0.45)' : 'var(--cv-border)'
                        }`,
                      }}
                    >
                      {WORKFLOWS[id].tabLabel}
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
              <span>APOLLO 5 · PRISMA 7 (191 MODELS) · SEAWEEDFS · 8,800+ TESTS</span>
              <span style={{ color: CLINICAL_TEAL }}>4 APPS · 7 ROLES</span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center justify-between gap-2 px-0.5 shrink-0 font-cv-mono text-[9.5px]">
            <span
              className="truncate"
              style={{ color: step.verified ? VERIFIED_GREEN : CLINICAL_TEAL }}
            >
              {step.actor} · {step.title}
            </span>
            <span className="shrink-0" style={{ color: 'var(--cv-ink-muted)' }}>
              31 MODULES · 191 MODELS
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
