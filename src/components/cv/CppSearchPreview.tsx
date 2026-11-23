'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Cpu, Database, Pause, Play, Search, Zap } from 'lucide-react';

interface SearchPassage {
  id: string;
  book: string;
  author: string;
  lang: 'ar' | 'fa' | 'en';
  page: number;
  paragraph: number;
  text: string;
}

interface SearchScenario {
  id: string;
  query: string;
  langBadge: string;
  latencyMs: string;
  hitCount: string;
  cacheLabel: string;
  canonicalTag: string;
  dir: 'rtl' | 'ltr';
  passages: SearchPassage[];
}

const SCENARIOS: SearchScenario[] = [
  {
    id: 'hikma',
    query: 'حكمة',
    langBadge: 'AR',
    latencyMs: '18.4 ms',
    hitCount: '2,033 hits',
    cacheLabel: 'L1 LRU HIT',
    canonicalTag: 'حكمة · diacritics stripped',
    dir: 'rtl',
    passages: [
      {
        id: 'h1',
        book: 'لوامع البصائر والأسرار',
        author: 'السيد كاظم الرشتي',
        lang: 'ar',
        page: 14,
        paragraph: 3,
        text: 'وإنّ في تحقيق الحكمة الإلهية ومراتب المعرفة نوراً يهتدي به الباحثون في أصول المعاني.',
      },
      {
        id: 'h2',
        book: 'شرح الفوائد الحِكَمية',
        author: 'الشيخ أحمد الأحسائي',
        lang: 'ar',
        page: 89,
        paragraph: 7,
        text: 'فكلّ حكمة بالغة تقتضي اتساق العقل والنقل عند استنباط الدلائل من متون الكتب.',
      },
      {
        id: 'h3',
        book: 'رسائل التوحيد والبيان',
        author: 'مكتبة النورين',
        lang: 'ar',
        page: 204,
        paragraph: 2,
        text: 'وقد أودع الله في هذه الصحائف حكمةً واضحةً وميزاناً دقيقاً لأهل النظر والاعتبار.',
      },
    ],
  },
  {
    id: 'ilm',
    query: 'علم',
    langBadge: 'AR',
    latencyMs: '24.1 ms',
    hitCount: '11,155 hits',
    cacheLabel: 'L1 NORM CACHE',
    canonicalTag: 'علم · whole-word & root',
    dir: 'rtl',
    passages: [
      {
        id: 'i1',
        book: 'مجموع الرسائل الفلسفية',
        author: 'السيد كاظم الرشتي',
        lang: 'ar',
        page: 42,
        paragraph: 5,
        text: 'اعلم أنّ العلم الحقيقي نورٌ يقذفه الله في قلب من اصطفاه لفهم أسرار الموجودات.',
      },
      {
        id: 'i2',
        book: 'جوامع الكلم في المعارف',
        author: 'الشيخ أحمد الأحسائي',
        lang: 'ar',
        page: 118,
        paragraph: 1,
        text: 'والفرق بين علم اليقين وعين اليقين يظهر عند مقابلة النصوص وفحص أسانيدها.',
      },
      {
        id: 'i3',
        book: 'فهرس المخطوطات العلمية',
        author: 'أرشيف بهمردي',
        lang: 'ar',
        page: 311,
        paragraph: 4,
        text: 'باب في تقسيم العلوم النقلية والعقلية ومناهج البحث في الخزائن الرقمية.',
      },
    ],
  },
  {
    id: 'philosophy',
    query: 'philosophy',
    langBadge: 'EN/AR/FA',
    latencyMs: '19.6 ms',
    hitCount: '1,482 hits',
    cacheLabel: 'L1 + PG POOL',
    canonicalTag: 'Concept → Topic Graph',
    dir: 'ltr',
    passages: [
      {
        id: 'p1',
        book: 'Foundations of Illuminationist Philosophy',
        author: 'Alnurayn Research Archive',
        lang: 'en',
        page: 27,
        paragraph: 2,
        text: 'Classical Islamic philosophy bridges deductive metaphysics with textual exegesis across centuries.',
      },
      {
        id: 'p2',
        book: 'مقاصد الفلسفة والمنطق',
        author: 'السيد كاظم الرشتي',
        lang: 'ar',
        page: 64,
        paragraph: 6,
        text: 'Philosophy (الفلسفة والحكمة المتعالية) in Arabic and Persian treatises links ontology with ethics.',
      },
      {
        id: 'p3',
        book: 'مبانی فلسفه و عرفان',
        author: 'کتابخانه نورین',
        lang: 'fa',
        page: 153,
        paragraph: 3,
        text: 'در سنت فلسفی و philosophy تطبیقی، پیوند میان برهان عقلی و شهود قلبی محور پژوهش است.',
      },
    ],
  },
];

const ALL_PASSAGES: SearchPassage[] = SCENARIOS.flatMap((s) => s.passages);

const IGNORED_RE = /[\u064B-\u065F\u0670\u06D6-\u06ED\u200C]/;

/**
 * Mirrors C++ canonicalize() in D:\projects\bahmardi\cpp-addon\src\search.cpp:
 * folds Alef variants, Persian/Arabic Kaf & Ya, Teh Marbuta -> Heh, strips diacritics & ZWNJ.
 */
function canonicalizeWithMap(input: string): { norm: string; indexMap: number[] } {
  let norm = '';
  const indexMap: number[] = [];

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (IGNORED_RE.test(ch)) continue;

    let mapped = ch.toLowerCase();
    if (ch === 'ک') mapped = 'ك';
    else if (ch === 'ی' || ch === 'ى') mapped = 'ي';
    else if (ch === 'أ' || ch === 'إ' || ch === 'آ' || ch === 'ٱ') mapped = 'ا';
    else if (ch === 'ة') mapped = 'ه';

    norm += mapped;
    indexMap.push(i);
  }

  return { norm, indexMap };
}

function canonicalizePlain(input: string): string {
  return canonicalizeWithMap(input).norm;
}

interface HighlightSlice {
  prefix: string;
  highlight: string;
  suffix: string;
}

function splitFirstMatch(text: string, query: string): HighlightSlice | null {
  const cleanQuery = canonicalizePlain(query.trim());
  if (!cleanQuery) return null;

  const { norm, indexMap } = canonicalizeWithMap(text);
  const matchPos = norm.indexOf(cleanQuery);
  if (matchPos === -1) return null;

  const origStart = indexMap[matchPos];
  const lastNormIdx = matchPos + cleanQuery.length - 1;
  let origEnd = indexMap[lastNormIdx] + 1;

  // Include trailing diacritics attached to the last matched character
  while (origEnd < text.length && IGNORED_RE.test(text[origEnd])) {
    origEnd++;
  }

  return {
    prefix: text.slice(0, origStart),
    highlight: text.slice(origStart, origEnd),
    suffix: text.slice(origEnd),
  };
}

function isArabicLike(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

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

type AnimPhase = 'typing' | 'scanning' | 'results';

export interface CppSearchPreviewProps {
  variant?: 'modal' | 'spotlight';
}

export function CppSearchPreview({ variant = 'modal' }: CppSearchPreviewProps) {
  const isModal = variant === 'modal';
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<AnimPhase>(reducedMotion ? 'results' : 'typing');
  const [typedLen, setTypedLen] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [customQuery, setCustomQuery] = useState('');
  const [customLatency, setCustomLatency] = useState('0.2 ms');

  const scenario = SCENARIOS[scenarioIdx];
  const isCustomActive = isModal && customQuery.trim().length > 0;

  // Drive the smart keystroke -> scan -> staggered results loop
  useEffect(() => {
    if (reducedMotion || !autoPlay || isCustomActive) return;

    let timer: number;
    const targetLen = scenario.query.length;

    if (phase === 'typing') {
      if (typedLen < targetLen) {
        timer = window.setTimeout(() => {
          setTypedLen((c) => c + 1);
        }, 52);
      } else {
        timer = window.setTimeout(() => {
          setPhase('scanning');
        }, 70);
      }
    } else if (phase === 'scanning') {
      timer = window.setTimeout(() => {
        setPhase('results');
      }, 110);
    } else {
      timer = window.setTimeout(() => {
        setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length);
        setTypedLen(0);
        setPhase('typing');
      }, 3300);
    }

    return () => window.clearTimeout(timer);
  }, [autoPlay, isCustomActive, phase, reducedMotion, scenario.query.length, typedLen]);

  // Instant custom search over the bilingual sample corpus using canonical UTF-32 folding rules
  const customMatches = useMemo(() => {
    if (!isCustomActive) return null;
    const q = customQuery.trim();
    return ALL_PASSAGES.map((passage) => ({
      passage,
      slice: splitFirstMatch(passage.text, q),
    })).filter((entry): entry is { passage: SearchPassage; slice: HighlightSlice } => entry.slice !== null);
  }, [customQuery, isCustomActive]);

  const handleCustomQueryChange = (value: string) => {
    setAutoPlay(false);
    setCustomQuery(value);
    const trimmed = value.trim();
    if (!trimmed) {
      setCustomLatency('0.2 ms');
      return;
    }
    const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    for (const passage of ALL_PASSAGES) {
      splitFirstMatch(passage.text, trimmed);
    }
    const elapsed = typeof performance !== 'undefined' ? Math.max(0.2, performance.now() - t0) : 0.2;
    setCustomLatency(`${elapsed.toFixed(1)} ms`);
  };

  const handleSelectPreset = (idx: number) => {
    setAutoPlay(false);
    setCustomQuery('');
    setScenarioIdx(idx);
    setTypedLen(SCENARIOS[idx].query.length);
    if (reducedMotion) {
      setPhase('results');
    } else {
      setPhase('scanning');
      window.setTimeout(() => setPhase('results'), 110);
    }
  };

  const handleToggleAuto = () => {
    if (autoPlay) {
      setAutoPlay(false);
      setTypedLen(scenario.query.length);
      setPhase('results');
    } else {
      setCustomQuery('');
      setAutoPlay(true);
      setTypedLen(0);
      setPhase(reducedMotion ? 'results' : 'typing');
    }
  };

  const displayedQuery = isCustomActive
    ? customQuery
    : reducedMotion || !autoPlay
      ? scenario.query
      : scenario.query.slice(0, typedLen);

  const showResults = isCustomActive || reducedMotion || phase === 'results';
  const isScanning = !isCustomActive && !reducedMotion && phase === 'scanning';

  const displayedRows = useMemo(() => {
    if (customMatches) {
      return customMatches.slice(0, 3);
    }
    return scenario.passages
      .slice(0, isModal ? 3 : 2)
      .map((passage) => ({
        passage,
        slice: splitFirstMatch(passage.text, scenario.query) ?? {
          prefix: '',
          highlight: '',
          suffix: passage.text,
        },
      }));
  }, [customMatches, isModal, scenario.passages, scenario.query]);

  const activeLatency = isCustomActive
    ? customLatency
    : showResults
      ? scenario.latencyMs
      : isScanning
        ? '… ms'
        : '— ms';

  const activeHitsLabel = isCustomActive
    ? `${customMatches?.length ?? 0} sample hits`
    : showResults
      ? scenario.hitCount
      : isScanning
        ? 'scanning…'
        : 'typing…';

  const activeCacheLabel = isCustomActive ? 'UTF-32 FOLD' : scenario.cacheLabel;
  const queryIsRtl = isArabicLike(displayedQuery || scenario.query);

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

      {/* Top Hardware Telemetry Bar */}
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
            className="inline-flex items-center gap-1.5 font-cv-mono text-[10px] font-semibold uppercase tracking-wider truncate"
            style={{ color: 'var(--cv-ink)' }}
          >
            <Cpu size={12} style={{ color: '#0ea5e9' }} className="shrink-0" />
            <span className="truncate">@bahmardi/search-native</span>
          </span>

          {isModal && (
            <span
              className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 cv-radius-sm font-cv-mono text-[9.5px] uppercase"
              style={{
                backgroundColor: 'rgba(14, 165, 233, 0.12)',
                color: '#0ea5e9',
              }}
            >
              <Database size={10} />
              <span>{activeCacheLabel}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] font-semibold cv-tabular"
            style={{
              backgroundColor: 'var(--cv-live-soft)',
              color: 'var(--cv-live)',
            }}
          >
            <Zap size={10} />
            <span>{activeLatency}</span>
          </span>

          {isModal && (
            <span
              className="hidden sm:inline-flex px-2 py-0.5 cv-radius-pill font-cv-mono text-[9.5px] font-semibold"
              style={{
                backgroundColor: 'var(--cv-surface)',
                color: 'var(--cv-ink-secondary)',
                border: '1px solid var(--cv-border)',
              }}
            >
              51× vs JS
            </span>
          )}
        </div>
      </div>

      {/* Main Search Input + Preset Controls + Animated Results */}
      <div className={`relative z-10 flex-1 flex flex-col justify-between min-h-0 ${isModal ? 'p-3.5 gap-2.5' : 'p-2.5 gap-1.5'}`}>
        {/* Search Bar + Presets */}
        <div className="space-y-2 shrink-0">
          <div
            className={`flex items-center gap-2 cv-radius-sm ${isModal ? 'px-3 py-2' : 'px-2.5 py-1.5'}`}
            style={{
              backgroundColor: 'var(--cv-surface-elevated)',
              border: `1px solid ${isScanning ? '#0ea5e9' : 'var(--cv-border-strong)'}`,
              boxShadow: isScanning ? '0 0 0 2px rgba(14, 165, 233, 0.16)' : undefined,
            }}
          >
            <Search size={isModal ? 14 : 12} style={{ color: '#0ea5e9' }} className="shrink-0" />

            {isModal ? (
              <div className="relative flex-1 min-w-0 flex items-center">
                <input
                  type="text"
                  value={isCustomActive ? customQuery : displayedQuery}
                  onChange={(e) => handleCustomQueryChange(e.target.value)}
                  dir={queryIsRtl ? 'rtl' : 'ltr'}
                  aria-label="Test live normalized search query"
                  placeholder="Type Arabic, Persian, or English (e.g. حكمة, علم, philosophy)…"
                  className="w-full bg-transparent text-[13px] sm:text-[13.5px] font-medium focus:outline-none"
                  style={{ color: 'var(--cv-ink)' }}
                />
                {!isCustomActive && autoPlay && phase === 'typing' && (
                  <span
                    aria-hidden
                    className="cv-search-caret inline-block w-[2px] h-4 ml-1 shrink-0"
                    style={{ backgroundColor: '#0ea5e9' }}
                  />
                )}
              </div>
            ) : (
              <div
                className="flex-1 min-w-0 flex items-center gap-1 overflow-hidden"
                dir={queryIsRtl ? 'rtl' : 'ltr'}
              >
                <span
                  className="text-[12px] sm:text-[13px] font-semibold truncate"
                  style={{ color: 'var(--cv-ink)' }}
                >
                  {displayedQuery}
                </span>
                {!reducedMotion && phase === 'typing' && (
                  <span
                    aria-hidden
                    className="cv-search-caret inline-block w-[2px] h-3.5 shrink-0"
                    style={{ backgroundColor: '#0ea5e9' }}
                  />
                )}
              </div>
            )}

            <span
              className="font-cv-mono text-[10px] cv-tabular shrink-0"
              style={{ color: 'var(--cv-ink-muted)' }}
            >
              {activeHitsLabel}
            </span>
          </div>

          {/* Preset Query Pills (Modal only — interactive) */}
          {isModal && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="font-cv-mono text-[9.5px] uppercase tracking-wider mr-0.5"
                  style={{ color: 'var(--cv-ink-muted)' }}
                >
                  Try:
                </span>
                {SCENARIOS.map((item, idx) => {
                  const active = !isCustomActive && scenarioIdx === idx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPreset(idx)}
                      className="cv-search-pill px-2 py-0.5 cv-radius-pill text-[11px] font-medium flex items-center gap-1.5"
                      style={{
                        backgroundColor: active ? 'rgba(14, 165, 233, 0.14)' : 'var(--cv-surface-elevated)',
                        color: active ? '#0ea5e9' : 'var(--cv-ink-secondary)',
                        border: `1px solid ${active ? 'rgba(14, 165, 233, 0.45)' : 'var(--cv-border)'}`,
                      }}
                    >
                      <span>{item.query}</span>
                      <span
                        className="font-cv-mono text-[9px] opacity-75"
                      >
                        {item.langBadge}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleToggleAuto}
                className="cv-search-pill px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--cv-surface-elevated)',
                  color: 'var(--cv-ink-muted)',
                  border: '1px solid var(--cv-border)',
                }}
              >
                {autoPlay && !isCustomActive ? <Pause size={10} /> : <Play size={10} />}
                <span>{autoPlay && !isCustomActive ? 'Auto' : 'Play loop'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Highlighted Search Results List */}
        <div className={`flex-1 min-h-0 flex flex-col justify-start overflow-hidden ${isModal ? 'gap-2' : 'gap-1.5'}`}>
          {!showResults ? (
            <div className="flex-1 flex flex-col justify-center gap-1.5 px-1">
              {[0, 1, isModal ? 2 : null].filter((x): x is number => x !== null).map((skeletonIdx) => (
                <div
                  key={skeletonIdx}
                  className="cv-radius-sm px-3 py-2 flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--cv-surface-elevated)',
                    border: '1px solid var(--cv-border)',
                    opacity: isScanning ? 0.85 : 0.45,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 cv-radius-pill"
                      style={{ backgroundColor: isScanning ? '#0ea5e9' : 'var(--cv-border-strong)' }}
                    />
                    <span
                      className="font-cv-mono text-[10px]"
                      style={{ color: 'var(--cv-ink-muted)' }}
                    >
                      {isScanning
                        ? skeletonIdx === 0
                          ? 'UTF-32 canonicalize() → stripping diacritics…'
                          : skeletonIdx === 1
                            ? 'L1 PageCache LRU lookup (500 MB)…'
                            : 'Extracting prefix [highlight] suffix…'
                        : 'Awaiting query buffer…'}
                    </span>
                  </div>
                  <span
                    className="font-cv-mono text-[9.5px]"
                    style={{ color: 'var(--cv-ink-subtle)' }}
                  >
                    THREAD 0{skeletonIdx + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : displayedRows.length === 0 ? (
            <div
              className="flex-1 flex flex-col items-center justify-center text-center px-4 py-6 cv-radius-sm"
              style={{
                backgroundColor: 'var(--cv-surface-elevated)',
                border: '1px dashed var(--cv-border-strong)',
              }}
            >
              <p className="text-[12.5px] font-medium" style={{ color: 'var(--cv-ink)' }}>
                No matches in the 9-passage preview slice for &ldquo;{customQuery}&rdquo;.
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--cv-ink-muted)' }}>
                Try <span className="font-semibold">حكمة</span>, <span className="font-semibold">إسلامية / المعرفة</span>,{' '}
                <span className="font-semibold">علم</span>, or <span className="font-semibold">philosophy</span> (Alef/Ya/tashkeel folding is live).
              </p>
            </div>
          ) : (
            displayedRows.map(({ passage, slice }, idx) => {
              const rowKey = `${isCustomActive ? 'custom' : scenario.id}-${passage.id}`;
              const isRtl = passage.lang === 'ar' || passage.lang === 'fa';
              return (
                <div
                  key={rowKey}
                  className={`cv-search-row cv-radius-sm ${isModal ? 'px-3 py-2' : 'px-2.5 py-1.5'}`}
                  style={{
                    animationDelay: `${idx * 45}ms`,
                    backgroundColor: 'var(--cv-surface-elevated)',
                    border: '1px solid var(--cv-border)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="font-cv-mono text-[9px] font-semibold uppercase px-1.5 py-0.5 cv-radius-sm shrink-0"
                        style={{
                          backgroundColor: 'var(--cv-surface)',
                          color: '#0ea5e9',
                          border: '1px solid var(--cv-border)',
                        }}
                      >
                        {passage.lang}
                      </span>
                      <span
                        className="text-[11px] sm:text-[11.5px] font-semibold truncate"
                        dir={isRtl ? 'rtl' : 'ltr'}
                        style={{ color: 'var(--cv-ink)' }}
                      >
                        {passage.book}
                      </span>
                      {isModal && (
                        <span
                          className="hidden sm:inline text-[10.5px] truncate"
                          dir={isRtl ? 'rtl' : 'ltr'}
                          style={{ color: 'var(--cv-ink-muted)' }}
                        >
                          · {passage.author}
                        </span>
                      )}
                    </div>

                    <span
                      className="font-cv-mono text-[9.5px] cv-tabular shrink-0"
                      style={{ color: 'var(--cv-ink-muted)' }}
                    >
                      p.{passage.page} · ¶{passage.paragraph}
                    </span>
                  </div>

                  <p
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className={`${isModal ? 'text-[12px] sm:text-[12.5px] line-clamp-2' : 'text-[11px] truncate'} leading-[1.45]`}
                    style={{ color: 'var(--cv-ink-secondary)' }}
                  >
                    <span>{slice.prefix}</span>
                    {slice.highlight && (
                      <mark
                        className="px-1 py-0.5 rounded font-semibold"
                        style={{
                          backgroundColor: 'rgba(14, 165, 233, 0.2)',
                          color: 'var(--cv-ink)',
                        }}
                      >
                        {slice.highlight}
                      </mark>
                    )}
                    <span>{slice.suffix}</span>
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Normalization & Cursor Strip (Modal only) */}
        {isModal && (
          <div
            className="flex flex-wrap items-center justify-between gap-2 pt-1.5 shrink-0 font-cv-mono text-[9.5px]"
            style={{
              borderTop: '1px solid var(--cv-border)',
              color: 'var(--cv-ink-muted)',
            }}
          >
            <span>UTF-32 FOLD: أ إ آ ٱ → ا · ک → ك · ی ى → ي · ة → ه</span>
            <span style={{ color: '#0ea5e9' }}>
              {isCustomActive ? 'LIVE NORMALIZER' : scenario.canonicalTag}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
