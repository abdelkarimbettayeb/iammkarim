'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { ArrowUpRight, CheckCircle2, Pause, Play, ShieldCheck, Star } from 'lucide-react';

interface MostaqlCriterion {
  id: string;
  en: string;
  ar: string;
}

interface MostaqlReview {
  id: string;
  clientName: string;
  clientNative?: string;
  country: string;
  projectTitle: string;
  quote: string;
  tag: string;
}

const MOSTAQL_BLUE = '#2CABE3';
const STAR_GOLD = '#f59e0b';
const MOSTAQL_REVIEWS_URL = 'https://mostaql.com/u/abdelkrime2055/reviews';

const CRITERIA: MostaqlCriterion[] = [
  { id: 'prof', en: 'Professionalism', ar: 'الاحترافية' },
  { id: 'comm', en: 'Communication', ar: 'التواصل' },
  { id: 'qual', en: 'Delivery Quality', ar: 'جودة العمل' },
  { id: 'exp', en: 'Domain Expertise', ar: 'الخبرة' },
  { id: 'time', en: 'On-Time Delivery', ar: 'التسليم بالموعد' },
  { id: 'rehire', en: 'Would Hire Again', ar: 'إعادة التعامل' },
];

const REVIEWS: MostaqlReview[] = [
  {
    id: 'khaled',
    clientName: 'Khaled Al-Khamisi',
    clientNative: 'خالد الخميسي',
    country: 'Yemen',
    projectTitle: 'WooCommerce Payment Gateways (Part 2)',
    quote:
      'Abdelkarim exemplifies excellence as a first-class programmer. Our collaboration on numerous payment & e-commerce systems has been exceedingly fruitful.',
    tag: 'Fintech Plugins',
  },
  {
    id: 'mahmoud',
    clientName: 'Mahmoud S.',
    country: 'Egypt',
    projectTitle: 'Repeat Enterprise Client (5+ Projects)',
    quote:
      'We asked Engineer Abdelkarim to work on more than 5 projects, all exceeded our expectations. He consistently proposes better, easier, and safer architectural solutions.',
    tag: '5+ Repeat Projects',
  },
  {
    id: 'hani',
    clientName: 'Hani I.',
    country: 'Saudi Arabia',
    projectTitle: 'Platform Architecture & Delivery',
    quote:
      'His dedication to the work is evident, characterized by sincerity and meticulous attention to detail. Every milestone was delivered with exceptional reliability.',
    tag: '100% On-Time',
  },
  {
    id: 'bahmardi',
    clientName: 'Bahmardi Archive Team',
    country: 'International',
    projectTitle: 'Long-Term Systems Retainer',
    quote:
      'Architected clinical, archival, and search platforms end-to-end with rare reliability, clean engineering discipline, and zero missed milestones.',
    tag: 'Long-Term Retainer',
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

function MostaqlLogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="28" height="28" rx="7" fill={MOSTAQL_BLUE} />
      <circle cx="14" cy="14" r="7.2" stroke="#FFFFFF" strokeWidth="2.3" />
      <circle cx="14" cy="14" r="2.6" fill="#FFFFFF" />
    </svg>
  );
}

function FiveStarRow({
  animKey,
  size = 13,
  staggerMs = 55,
  baseDelayMs = 0,
}: {
  animKey: string;
  size?: number;
  staggerMs?: number;
  baseDelayMs?: number;
}) {
  return (
    <div className="inline-flex items-center gap-0.5" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((idx) => (
        <span
          key={`${animKey}-${idx}`}
          className="cv-star-ignite inline-flex"
          style={{ animationDelay: `${baseDelayMs + idx * staggerMs}ms` }}
        >
          <Star size={size} fill={STAR_GOLD} color={STAR_GOLD} />
        </span>
      ))}
    </div>
  );
}

export interface MostaqlReviewsPreviewProps {
  variant?: 'modal' | 'spotlight';
}

export function MostaqlReviewsPreview({ variant = 'modal' }: MostaqlReviewsPreviewProps) {
  const isModal = variant === 'modal';
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const [reviewIdx, setReviewIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (reducedMotion || !autoPlay) return;
    const timer = window.setTimeout(() => {
      setReviewIdx((prev) => (prev + 1) % REVIEWS.length);
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [autoPlay, reducedMotion, reviewIdx]);

  const activeReview = REVIEWS[reviewIdx];

  const handleSelectReview = (idx: number) => {
    setAutoPlay(false);
    setReviewIdx(idx);
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

      {/* Top Mostaql Brand & Verification Chrome */}
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
          <MostaqlLogoMark size={isModal ? 22 : 18} />
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="font-bold text-[12.5px] sm:text-[13.5px] leading-none"
              dir="rtl"
              style={{ color: MOSTAQL_BLUE }}
            >
              مستقل
            </span>
            <span style={{ color: 'var(--cv-ink-subtle)' }}>·</span>
            <span
              className="font-cv-mono text-[10px] font-semibold uppercase tracking-wider truncate"
              style={{ color: 'var(--cv-ink)' }}
            >
              MOSTAQL
            </span>
          </div>

          {isModal && (
            <span
              className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 cv-radius-sm font-cv-mono text-[9.5px] uppercase"
              style={{
                backgroundColor: 'rgba(44, 171, 227, 0.12)',
                color: MOSTAQL_BLUE,
              }}
            >
              <ShieldCheck size={10} />
              <span>ID · Phone · Email</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] font-semibold cv-tabular"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.14)',
              color: STAR_GOLD,
            }}
          >
            <Star size={10} fill={STAR_GOLD} color={STAR_GOLD} />
            <span>5.0 (30)</span>
          </span>

          <span
            className={`${isModal ? 'inline-flex' : 'hidden sm:inline-flex'} px-2 py-0.5 cv-radius-pill font-cv-mono text-[9.5px] font-semibold cv-tabular`}
            style={{
              backgroundColor: 'var(--cv-surface)',
              color: 'var(--cv-ink-secondary)',
              border: '1px solid var(--cv-border)',
            }}
          >
            32 Projects
          </span>
        </div>
      </div>

      {/* Main Content */}
      {isModal ? (
        <div className="relative z-10 flex-1 min-h-0 p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
          {/* Left 5 Columns: 6-Criteria Mostaql Scorecard */}
          <div
            className="sm:col-span-5 cv-radius-sm p-3 flex flex-col justify-between gap-2.5"
            style={{
              backgroundColor: 'var(--cv-surface-elevated)',
              border: '1px solid var(--cv-border)',
            }}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className="font-cv-mono text-[9.5px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--cv-ink-muted)' }}
                >
                  6 / 6 Criteria Scorecard
                </span>
                <span
                  className="font-cv-mono text-[10px] font-bold cv-tabular"
                  style={{ color: STAR_GOLD }}
                >
                  5.00
                </span>
              </div>

              <div className="space-y-1.5">
                {CRITERIA.map((criterion, cIdx) => (
                  <div
                    key={criterion.id}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span
                      className="truncate font-medium"
                      style={{ color: 'var(--cv-ink-secondary)' }}
                    >
                      {criterion.en}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="font-cv-mono text-[10px] cv-tabular"
                        style={{ color: 'var(--cv-ink-muted)' }}
                      >
                        5.0
                      </span>
                      <FiveStarRow
                        animKey={`crit-${criterion.id}-${reviewIdx}`}
                        size={10}
                        staggerMs={28}
                        baseDelayMs={cIdx * 30}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="pt-2 flex flex-wrap items-center justify-between gap-1.5 font-cv-mono text-[9.5px] cv-tabular"
              style={{
                borderTop: '1px solid var(--cv-border)',
                color: 'var(--cv-ink-muted)',
              }}
            >
              <span>32 Completed</span>
              <span>3h 29m Reply</span>
              <span>Since Dec 2020</span>
            </div>
          </div>

          {/* Right 7 Columns: Rotating Live Client Review Card */}
          <div className="sm:col-span-7 flex flex-col justify-between gap-2.5 min-w-0">
            <div
              key={activeReview.id}
              className="cv-review-enter flex-1 cv-radius-sm p-3.5 flex flex-col justify-between gap-2.5"
              style={{
                backgroundColor: 'var(--cv-surface-elevated)',
                border: '1px solid var(--cv-border)',
                borderLeft: `3px solid ${MOSTAQL_BLUE}`,
              }}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <FiveStarRow
                    animKey={`review-${activeReview.id}`}
                    size={13}
                    staggerMs={55}
                  />
                  <span
                    className="px-2 py-0.5 cv-radius-pill font-cv-mono text-[9.5px] font-semibold shrink-0"
                    style={{
                      backgroundColor: 'rgba(44, 171, 227, 0.12)',
                      color: MOSTAQL_BLUE,
                    }}
                  >
                    {activeReview.tag}
                  </span>
                </div>

                <div
                  className="text-[11.5px] font-semibold leading-snug"
                  style={{ color: 'var(--cv-ink)' }}
                >
                  {activeReview.projectTitle}
                </div>

                <p
                  className="text-[12.5px] leading-[1.55]"
                  style={{ color: 'var(--cv-ink-secondary)' }}
                >
                  &ldquo;{activeReview.quote}&rdquo;
                </p>
              </div>

              <div
                className="pt-2 flex items-center justify-between gap-2"
                style={{ borderTop: '1px solid var(--cv-border)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center cv-radius-pill font-cv-mono text-[10px] font-bold shrink-0"
                    style={{
                      backgroundColor: 'rgba(44, 171, 227, 0.14)',
                      color: MOSTAQL_BLUE,
                    }}
                  >
                    {activeReview.clientName.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="text-[12px] font-semibold truncate"
                        style={{ color: 'var(--cv-ink)' }}
                      >
                        {activeReview.clientName}
                      </span>
                      {activeReview.clientNative && (
                        <span
                          className="hidden md:inline text-[11px] truncate"
                          dir="rtl"
                          style={{ color: 'var(--cv-ink-muted)' }}
                        >
                          ({activeReview.clientNative})
                        </span>
                      )}
                    </div>
                    <span
                      className="block font-cv-mono text-[9.5px]"
                      style={{ color: 'var(--cv-ink-muted)' }}
                    >
                      {activeReview.country} · Verified Client
                    </span>
                  </div>
                </div>

                <CheckCircle2
                  size={14}
                  style={{ color: 'var(--cv-live)' }}
                  className="shrink-0"
                  aria-label="Verified review"
                />
              </div>
            </div>

            {/* Client Switcher Pills + Auto-Cycle & External Profile Link */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1">
                {REVIEWS.map((rev, idx) => {
                  const isActive = idx === reviewIdx;
                  return (
                    <button
                      key={rev.id}
                      type="button"
                      onClick={() => handleSelectReview(idx)}
                      className="cv-search-pill px-2 py-0.5 cv-radius-pill text-[10.5px] font-medium flex items-center gap-1"
                      style={{
                        backgroundColor: isActive
                          ? 'rgba(44, 171, 227, 0.14)'
                          : 'var(--cv-surface-elevated)',
                        color: isActive ? MOSTAQL_BLUE : 'var(--cv-ink-secondary)',
                        border: `1px solid ${
                          isActive ? 'rgba(44, 171, 227, 0.45)' : 'var(--cv-border)'
                        }`,
                      }}
                    >
                      <span>{rev.clientName.split(' ')[0]}</span>
                      <span className="font-cv-mono text-[9px] opacity-75">
                        {rev.country.slice(0, 2).toUpperCase()}
                      </span>
                    </button>
                  );
                })}
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
                  <span>{autoPlay ? 'Auto' : 'Play'}</span>
                </button>

                <a
                  href={MOSTAQL_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cv-search-pill px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] inline-flex items-center gap-1"
                  style={{
                    backgroundColor: 'var(--cv-surface-elevated)',
                    color: MOSTAQL_BLUE,
                    border: '1px solid var(--cv-border)',
                  }}
                >
                  <span>Mostaql</span>
                  <ArrowUpRight size={10} />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Compact Spotlight Layout (fits h-36 sm:h-52 lg:h-64 cleanly with zero overflow) */
        <div className="relative z-10 flex-1 min-h-0 p-2.5 sm:p-3 flex flex-col justify-between gap-2 overflow-hidden">
          <div
            key={activeReview.id}
            className="cv-review-enter flex-1 min-h-0 cv-radius-sm p-2.5 sm:p-3 flex flex-col justify-between gap-1.5"
            style={{
              backgroundColor: 'var(--cv-surface-elevated)',
              border: '1px solid var(--cv-border)',
              borderLeft: `3px solid ${MOSTAQL_BLUE}`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <FiveStarRow
                animKey={`spot-${activeReview.id}`}
                size={12}
                staggerMs={55}
              />
              <span
                className="px-1.5 py-0.5 cv-radius-pill font-cv-mono text-[9px] font-semibold truncate"
                style={{
                  backgroundColor: 'rgba(44, 171, 227, 0.12)',
                  color: MOSTAQL_BLUE,
                }}
              >
                {activeReview.tag}
              </span>
            </div>

            <p
              className="text-[11px] sm:text-[12px] leading-[1.45] line-clamp-2 sm:line-clamp-3"
              style={{ color: 'var(--cv-ink-secondary)' }}
            >
              &ldquo;{activeReview.quote}&rdquo;
            </p>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span
                className="text-[10.5px] sm:text-[11px] font-semibold truncate"
                style={{ color: 'var(--cv-ink)' }}
              >
                {activeReview.clientName} ·{' '}
                <span style={{ color: 'var(--cv-ink-muted)' }}>{activeReview.country}</span>
              </span>
              <span
                className="hidden sm:inline font-cv-mono text-[9.5px] shrink-0"
                style={{ color: 'var(--cv-live)' }}
              >
                5.0 ★ Verified
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-between gap-2 px-0.5 shrink-0">
            <div className="flex items-center gap-1.5">
              {REVIEWS.map((rev, idx) => (
                <span
                  key={rev.id}
                  className="h-1.5 cv-radius-pill transition-all duration-200"
                  style={{
                    width: idx === reviewIdx ? '18px' : '6px',
                    backgroundColor: idx === reviewIdx ? MOSTAQL_BLUE : 'var(--cv-border-strong)',
                  }}
                />
              ))}
            </div>
            <span
              className="font-cv-mono text-[9.5px] uppercase tracking-wider"
              style={{ color: 'var(--cv-ink-muted)' }}
            >
              6 / 6 Perfect Criteria
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
