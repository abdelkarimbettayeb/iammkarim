'use client';

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  ArrowUpRight,
  Award,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Command,
  Copy,
  Download,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Monitor,
  Moon,
  Send,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  cartridgeProjects,
  education,
  languages,
  personalInfo,
  techSkills,
  workExperience,
} from '@/data/resumeData';
import { roomStore, useRoomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';
import { sendEmail } from '@/app/actions';
import type { CartridgeId } from '@/types/room';
import { CVCaseStudyModal } from './CVCaseStudyModal';
import { JudPlatformPreview } from './JudPlatformPreview';
import { CppSearchPreview } from './CppSearchPreview';
import { MostaqlReviewsPreview } from './MostaqlReviewsPreview';
import { MouserKvmPreview } from './MouserKvmPreview';
import { MeubleStorePreview } from './MeubleStorePreview';
import { AlgMathPreview } from './AlgMathPreview';
import { FloatingModeSwitch } from './FloatingModeSwitch';
import { BrandLogo } from './BrandLogo';
import { HeroTooltip } from './HeroTooltip';
import { CommandPalette } from './CommandPalette';
import './cv.css';

const Atelier3DStage = dynamic(
  () => import('./Atelier3DStage').then((mod) => mod.Atelier3DStage),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[240px] flex flex-col items-center justify-center gap-3">
        <div
          className="h-9 w-9 animate-spin"
          style={{
            borderRadius: '9999px',
            border: '2px solid var(--cv-border)',
            borderTopColor: 'var(--cv-accent)',
          }}
        />
        <span
          className="font-cv-mono text-[11px] uppercase tracking-widest"
          style={{ color: 'var(--cv-ink-muted)' }}
        >
          Calibrating Atelier 3D Stage…
        </span>
      </div>
    ),
  }
);

type SectionId = 'hero' | 'experience' | 'projects' | 'skills' | 'contact';

const SECTIONS: { id: SectionId; label: string; number: string }[] = [
  { id: 'hero', label: 'Overview', number: '01' },
  { id: 'experience', label: 'Experience', number: '02' },
  { id: 'projects', label: 'Work', number: '03' },
  { id: 'skills', label: 'Stack', number: '04' },
  { id: 'contact', label: 'Contact', number: '05' },
];

const PROJECT_ORDER: CartridgeId[] = ['jud', 'alnurayn', 'freelance', 'mouser', 'meuble', 'algmath'];

const PROJECT_SHORT_LABELS: Record<CartridgeId, string> = {
  jud: 'Jud',
  alnurayn: 'Alnurayn',
  freelance: 'Mostaql',
  mouser: 'Mouser',
  meuble: 'Meuble',
  algmath: 'BAC Maths',
};

const SKILL_CATEGORIES: { id: string; label: string; mobileOnly?: boolean }[] = [
  { id: 'all', label: 'All Stack' },
  { id: 'languages', label: 'Languages' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'database', label: 'Data' },
  { id: 'ai', label: 'AI & DevOps' },
  { id: 'reviews', label: 'Reviews 5★', mobileOnly: true },
];

const TESTIMONIALS = [
  {
    name: 'Mahmoud S.',
    country: 'Egypt',
    role: 'Repeat Enterprise Client (5+ Projects)',
    quote:
      'We asked Engineer Abdelkarim to work on more than 5 projects, all exceeded our expectations. Despite the sophisticated nature of the work, he consistently proposes better, easier, and safer architectural solutions.',
  },
  {
    name: 'Hani I.',
    country: 'Saudi Arabia',
    role: 'Platform Stakeholder',
    quote:
      'His dedication to the work is evident, characterized by sincerity and meticulous attention to detail. Every milestone was delivered with exceptional reliability.',
  },
  {
    name: 'Khaled A.',
    country: 'Yemen',
    role: 'Technical Founder',
    quote:
      'Abdelkarim exemplifies excellence as a first-class programmer. Our collaboration on numerous systems has been exceedingly fruitful.',
  },
];

function getSkillTier(level: number): string {
  if (level >= 92) return 'CORE';
  if (level >= 88) return 'PRODUCTION';
  return 'SYSTEMS';
}

const emptySubscribe = () => () => { };

export function HybridCV() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef<number>(0);
  const snapLockUntilRef = useRef<number>(0);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const [selectedRoleIdx, setSelectedRoleIdx] = useState<number>(0);
  const [spotlightProjectId, setSpotlightProjectId] = useState<CartridgeId>('jud');
  const [modalProjectId, setModalProjectId] = useState<CartridgeId | null>(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [mobileContactTab, setMobileContactTab] = useState<'form' | 'channels'>('form');

  const { resolvedTheme, setTheme } = useTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const isMuted = useRoomStore((s) => s.isMuted);
  const toggleMute = useRoomStore((s) => s.toggleMute);
  const activeCartridge = useRoomStore((s) => s.activeCartridge);

  // Contact form state
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Keep roomStore lighting in sync with resolved next-themes state
  useEffect(() => {
    if (!mounted) return;
    roomStore.setNightMode(isDark);
  }, [isDark, mounted]);

  const openProjectModal = useCallback((id: CartridgeId | null) => {
    setModalProjectId(id);
    if (id) {
      setSpotlightProjectId(id);
      roomStore.setActiveCartridge(id);
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (id) url.searchParams.set('project', id);
      else url.searchParams.delete('project');
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }, []);

  // Support deep links like /?project=mouser directly from social & README shares
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      const param = new URLSearchParams(window.location.search).get('project');
      if (param && PROJECT_ORDER.includes(param as CartridgeId)) {
        const id = param as CartridgeId;
        setSpotlightProjectId(id);
        roomStore.setActiveCartridge(id);
        setModalProjectId(id);
      }
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  // Global Cmd/Ctrl+K command palette shortcut
  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, []);

  const snapToIndex = useCallback((idx: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(SECTIONS.length - 1, idx));
    activeIndexRef.current = clamped;
    setActiveSection(SECTIONS[clamped].id);
    const targetEl = document.getElementById(SECTIONS[clamped].id);
    container.scrollTo({
      top: targetEl ? targetEl.offsetTop : clamped * container.clientHeight,
      behavior: 'smooth',
    });
  }, []);

  const scrollToSection = useCallback(
    (id: SectionId) => {
      const idx = SECTIONS.findIndex((s) => s.id === id);
      if (idx !== -1) snapToIndex(idx);
    },
    [snapToIndex]
  );

  // Sync active section index on native touch swipes or programmatic scrolls
  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const topId = visible[0]?.target.id as SectionId | undefined;
        if (topId) {
          const idx = SECTIONS.findIndex((s) => s.id === topId);
          if (idx !== -1) {
            activeIndexRef.current = idx;
            setActiveSection(topId);
          }
        }
      },
      {
        root,
        threshold: [0.2, 0.45, 0.7],
        rootMargin: '-15% 0px -35% 0px',
      }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Strict 1-slide-at-a-time wheel snap controller (Desktop)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth < 768) return;
      if (modalProjectId !== null || cmdOpen) return;

      // Allow inner bounded scroll containers (e.g. skill tiles on short viewports) to scroll naturally before snapping
      const targetEl = e.target as HTMLElement | null;
      const innerScrollable = targetEl?.closest('[data-inner-scroll="true"]') as HTMLElement | null;
      if (innerScrollable && innerScrollable.scrollHeight > innerScrollable.clientHeight + 2) {
        const atTop = innerScrollable.scrollTop <= 1;
        const atBottom =
          innerScrollable.scrollTop + innerScrollable.clientHeight >=
          innerScrollable.scrollHeight - 2;
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
          return;
        }
      }

      e.preventDefault();
      if (Math.abs(e.deltaY) < 8) return;

      const now = performance.now();
      if (now < snapLockUntilRef.current) return;
      snapLockUntilRef.current = now + 520;

      const dir = e.deltaY > 0 ? 1 : -1;
      snapToIndex(activeIndexRef.current + dir);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalProjectId !== null || cmdOpen) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag && ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        snapToIndex(activeIndexRef.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        snapToIndex(activeIndexRef.current - 1);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cmdOpen, modalProjectId, snapToIndex]);

  const handleToggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleLoadOn3DMonitor = (id: CartridgeId) => {
    playSound('cartridge');
    roomStore.setActiveCartridge(id);
    openProjectModal(null);
    scrollToSection('hero');
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(personalInfo.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${personalInfo.email}`;
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await sendEmail(null, formData);
      if (res && (res.name?.length || res.email?.length)) {
        setErrorMessage('Please check your name and email address, then try again.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setErrorMessage(`Could not send directly. Reach me at ${personalInfo.email}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardPointerMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--card-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--card-y', `${e.clientY - rect.top}px`);
  };

  const stepSpotlight = (dir: 1 | -1) => {
    const i = PROJECT_ORDER.indexOf(spotlightProjectId);
    setSpotlightProjectId(PROJECT_ORDER[(i + dir + PROJECT_ORDER.length) % PROJECT_ORDER.length]);
  };

  const isMobileEduTab = selectedRoleIdx === workExperience.length;
  const selectedRole = workExperience[selectedRoleIdx] || workExperience[0];
  const spotlightProject = cartridgeProjects[spotlightProjectId];
  const spotlightIndex = PROJECT_ORDER.indexOf(spotlightProjectId);

  const effectiveSkillFilter = skillFilter === 'reviews' ? 'all' : skillFilter;
  const filteredSkills = techSkills.filter((skill) => {
    if (effectiveSkillFilter === 'all') return true;
    if (effectiveSkillFilter === 'ai') return skill.category === 'ai' || skill.category === 'tools';
    return skill.category === effectiveSkillFilter;
  });

  return (
    <div className="cv-shell relative w-screen h-[100dvh] overflow-hidden">
      {/* =====================================================================
          1. STICKY MINIMALIST ATELIER TOP HEADER
         ===================================================================== */}
      <header className="cv-header fixed top-0 inset-x-0 z-30 px-3 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand Monogram + Name */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2.5 sm:gap-3 text-left group shrink-0"
          >
            <BrandLogo
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 transition-transform duration-200 group-hover:scale-105"
              style={{ color: 'var(--cv-ink)' }}
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="font-cv-display font-bold text-[14px] sm:text-[15px] tracking-tight"
                  style={{ color: 'var(--cv-ink)' }}
                >
                  {personalInfo.name}
                </span>
                <span
                  className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: 'var(--cv-live-soft)',
                    color: 'var(--cv-live)',
                  }}
                >
                  <span
                    className="h-1.5 w-1.5"
                    style={{ borderRadius: '9999px', backgroundColor: 'var(--cv-live)' }}
                  />
                  Available
                </span>
              </div>
              <p
                className="text-[11px] leading-none mt-0.5 hidden sm:block"
                style={{ color: 'var(--cv-ink-muted)' }}
              >
                {personalInfo.role}
              </p>
            </div>
          </button>

          {/* Center Desktop Section Index Nav */}
          <nav
            aria-label="CV Sections"
            className="cv-nav-rail hidden md:flex items-center p-1 gap-0.5"
          >
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => scrollToSection(sec.id)}
                  className="cv-nav-pill px-3 py-1.5 text-[12.5px] font-medium flex items-center gap-1.5"
                >
                  <span
                    className="font-cv-mono text-[10px]"
                    style={{ color: isActive ? 'var(--cv-accent)' : 'var(--cv-ink-subtle)' }}
                  >
                    {sec.number}
                  </span>
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Command Palette, Theme Toggle, Sound, 3D World, Resume PDF */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              aria-label="Open command palette"
              title="Quick Jump & Actions (⌘K / Ctrl+K)"
              className="cv-btn-secondary h-9 px-2.5 hidden lg:inline-flex items-center gap-1.5 font-cv-mono text-[11px]"
              style={{ color: 'var(--cv-ink-muted)' }}
            >
              <Command size={12} style={{ color: 'var(--cv-accent)' }} />
              <span>K</span>
            </button>

            <div className="cv-theme-switch" role="group" aria-label="Color appearance">
              <button
                onClick={() => setTheme('light')}
                data-active={!isDark ? 'true' : 'false'}
                aria-label="Light mode"
                aria-pressed={!isDark}
                className="cv-theme-option"
              >
                <Sun size={14} />
                <span className="hidden lg:inline">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                data-active={isDark ? 'true' : 'false'}
                aria-label="Dark mode"
                aria-pressed={isDark}
                className="cv-theme-option"
              >
                <Moon size={14} />
                <span className="hidden lg:inline">Dark</span>
              </button>
            </div>

            <button
              onClick={() => {
                toggleMute();
                if (isMuted) setTimeout(() => playSound('chime'), 50);
              }}
              aria-label={isMuted ? 'Enable subtle sound effects' : 'Mute sound effects'}
              title={isMuted ? 'Enable subtle sound effects' : 'Mute sound effects'}
              className="cv-icon-btn h-9 w-9 hidden sm:flex items-center justify-center"
            >
              {isMuted ? (
                <VolumeX size={15} />
              ) : (
                <Volume2 size={15} style={{ color: 'var(--cv-accent)' }} />
              )}
            </button>

            <Link
              href="/room"
              title="Open Full 3D Room Diorama"
              className="cv-btn-secondary h-9 px-3 hidden lg:flex items-center gap-1.5 text-[12px] font-medium"
            >
              <Box size={14} style={{ color: 'var(--cv-accent)' }} />
              <span>3D World</span>
            </Link>

            <a
              href={personalInfo.resumePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cv-btn-primary h-9 px-3 sm:px-4 text-[12px] sm:text-[12.5px] font-semibold flex items-center gap-1.5"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
              <span>CV</span>
            </a>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. RIGHT-HAND DESKTOP SNAP PROGRESS RAIL
         ===================================================================== */}
      <aside
        aria-label="Section progress"
        className="fixed right-4 xl:right-7 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-end gap-3"
      >
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className="group flex items-center gap-2.5 text-right"
              aria-label={`Jump to ${sec.label}`}
            >
              <span
                className="font-cv-mono text-[10.5px] uppercase tracking-wider transition-all duration-200"
                style={{
                  color: isActive ? 'var(--cv-accent)' : 'var(--cv-ink-muted)',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateX(0)' : 'translateX(4px)',
                }}
              >
                {sec.number} · {sec.label}
              </span>
              <span
                className="transition-all duration-300"
                style={{
                  borderRadius: '9999px',
                  width: isActive ? '8px' : '6px',
                  height: isActive ? '26px' : '6px',
                  backgroundColor: isActive ? 'var(--cv-accent)' : 'var(--cv-border-strong)',
                }}
              />
            </button>
          );
        })}
      </aside>

      {/* =====================================================================
          2b. MOBILE FLOATING BOTTOM SNAP DOCK + INLINE MODE SWITCH
         ===================================================================== */}
      <div className="md:hidden fixed bottom-3 inset-x-2.5 z-30 pb-[env(safe-area-inset-bottom)] flex items-center justify-center gap-1.5 pointer-events-none">
        <nav
          aria-label="Mobile section navigation"
          className="pointer-events-auto cv-mobile-dock p-1 flex-1 min-w-0 flex items-center justify-between gap-0.5"
        >
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            const mobileLabel = sec.id === 'experience' ? 'Exp' : sec.label;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className="flex-1 h-8 px-1.5 cv-radius-pill flex items-center justify-center text-[10.5px] leading-none transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? 'var(--cv-ink)' : 'transparent',
                  color: isActive ? 'var(--cv-bg)' : 'var(--cv-ink-muted)',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {mobileLabel}
              </button>
            );
          })}
        </nav>

        <div className="pointer-events-auto shrink-0">
          <FloatingModeSwitch inline />
        </div>
      </div>

      {/* =====================================================================
          3. STRICT 100% SNAPPY FULL-VIEWPORT CONTAINER (ZERO MIDDLE SCROLL)
         ===================================================================== */}
      <div
        ref={scrollContainerRef}
        className="cv-snap-container relative z-10 w-full h-[100dvh] overflow-y-auto overflow-x-hidden no-scrollbar"
      >
        {/* ===================================================================
            SECTION 01: HERO (Editorial Left Intro + Borderless 3D Atelier)
           =================================================================== */}
        <section
          id="hero"
          className="cv-snap-section relative w-full flex flex-col justify-center pt-16 pb-24 md:pt-20 md:pb-8 px-4 sm:px-6 lg:px-12"
        >
          <div aria-hidden className="cv-hero-grid pointer-events-none absolute inset-0" />

          <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-6 items-center my-auto">
            {/* LEFT COLUMN: Editorial Intro & Metric Ledger */}
            <div className="lg:col-span-5 flex flex-col items-start text-left">
              <HeroTooltip
                label="Availability · GMT+1"
                accent="#10B981"
                side="bottom"
                description="Based in Algeria (UTC+1), overlapping European & UK work hours. Open to remote engineering roles and visa relocation."
              >
                <button
                  type="button"
                  className="cv-hero-enter cv-badge inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 text-[10.5px] sm:text-[11.5px] mb-2.5 sm:mb-4 cursor-help transition-colors hover:border-[var(--cv-border-strong)]"
                  style={{ animationDelay: '0ms' }}
                >
                  <span className="cv-live-beacon h-2 w-2 shrink-0">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: 'var(--cv-live)' }}
                    />
                  </span>
                  <span className="font-cv-mono text-[10.5px]" style={{ color: 'var(--cv-ink)' }}>
                    35.7°N · RELIZANE, DZ
                  </span>
                  <span className="hidden sm:inline" style={{ color: 'var(--cv-ink-subtle)' }}>·</span>
                  <span className="hidden sm:inline font-medium" style={{ color: 'var(--cv-ink-secondary)' }}>
                    {personalInfo.availability}
                  </span>
                </button>
              </HeroTooltip>

              <h1
                className="cv-hero-enter font-cv-display font-extrabold text-[28px] sm:text-[44px] xl:text-[56px] leading-[1.0] tracking-[-0.035em] [text-wrap:balance]"
                style={{ color: 'var(--cv-ink)', animationDelay: '55ms' }}
              >
                Architecting{' '}
                <HeroTooltip
                  label="Engineering Philosophy"
                  accent="#EA580C"
                  side="bottom"
                  description="Fault-tolerant schemas, offline-first sync, strict type boundaries, and sub-millisecond native bottlenecks built for real-world load."
                >
                  <button
                    type="button"
                    className="cv-inline-term"
                    style={{ color: 'var(--cv-accent)' }}
                  >
                    resilient
                  </button>
                </HeroTooltip>{' '}
                production systems.
              </h1>

              <p
                className="cv-hero-enter mt-2.5 sm:mt-4 text-[13.5px] sm:text-[15.5px] leading-[1.55] max-w-[50ch] [text-wrap:pretty]"
                style={{ color: 'var(--cv-ink-secondary)', animationDelay: '110ms' }}
              >
                I&apos;m <strong style={{ color: 'var(--cv-ink)' }}>{personalInfo.name}</strong> — a{' '}
                <HeroTooltip
                  label="Leadership & Architecture"
                  accent="#7C3AED"
                  description="Currently Lead Software Engineer at Jud (KSA), owning system architecture, CI/CD pipelines, code reviews, and AI-assisted delivery."
                >
                  <button type="button" className="cv-inline-term">
                    {personalInfo.role}
                  </button>
                </HeroTooltip>{' '}
                with{' '}
                <HeroTooltip
                  label="Client Delivery"
                  accent="#F59E0B"
                  description="End-to-end commercial systems shipped across telehealth, clinical monorepos, 3D e-commerce, and offline desktop POS."
                >
                  <button type="button" className="cv-inline-term font-semibold" style={{ color: 'var(--cv-ink)' }}>
                    30+ commercial platforms
                  </button>
                </HeroTooltip>{' '}
                shipped across{' '}
                <HeroTooltip
                  label="Type Safety"
                  accent="#3178C6"
                  description="Strict end-to-end typing across frontend clients, API contracts, Prisma/GraphQL schemas, and shared monorepos."
                >
                  <button type="button" className="cv-inline-term">
                    TypeScript
                  </button>
                </HeroTooltip>
                ,{' '}
                <HeroTooltip
                  label="Interactive UI"
                  accent="#0EA5E9"
                  description="Next.js App Router, Refine.dev admin consoles, React Native / Expo mobile apps, and 3D WebGL experiences."
                >
                  <button type="button" className="cv-inline-term">
                    React
                  </button>
                </HeroTooltip>
                ,{' '}
                <HeroTooltip
                  label="Backend Runtime"
                  accent="#10B981"
                  description="NestJS services, Apollo GraphQL & REST APIs, BullMQ queues, and low-latency event-driven architectures."
                >
                  <button type="button" className="cv-inline-term">
                    Node.js
                  </button>
                </HeroTooltip>
                ,{' '}
                <HeroTooltip
                  label="Data Layer"
                  accent="#336791"
                  description="Multi-tenant relational schemas, Prisma ORM, Redis caching layers, and high-volume indexed queries."
                >
                  <button type="button" className="cv-inline-term">
                    PostgreSQL
                  </button>
                </HeroTooltip>
                , and{' '}
                <HeroTooltip
                  label="Systems & Native C++"
                  accent="#F43F5E"
                  description="Embedded Node.js C++ search addons (Alnurayn) and the C++/CMake native macOS backend powering Mouser (.NET 8, Avalonia, Kotlin)."
                >
                  <button type="button" className="cv-inline-term">
                    C++ engines
                  </button>
                </HeroTooltip>
                .
              </p>

              {/* Hairline-Divided 4-Column Metric Ledger */}
              <dl
                className="cv-hero-enter mt-3.5 sm:mt-6 w-full grid grid-cols-4 gap-2 sm:gap-4 py-2.5 sm:py-4"
                style={{
                  borderTop: '1px solid var(--cv-border)',
                  borderBottom: '1px solid var(--cv-border)',
                  animationDelay: '165ms',
                }}
              >
                <HeroTooltip
                  label="Career Timeline"
                  accent="#7C3AED"
                  description="Shipping full-stack web, mobile, and native software since 2016 — from independent consulting to lead architecture."
                >
                  <div tabIndex={0} className="cv-metric-cell">
                    <dd
                      className="font-cv-display font-bold text-[18px] sm:text-[25px] leading-none cv-tabular"
                      style={{ color: 'var(--cv-ink)' }}
                    >
                      {personalInfo.experienceYears}
                    </dd>
                    <dt
                      className="mt-1 font-cv-mono text-[9px] sm:text-[10.5px] uppercase tracking-wider"
                      style={{ color: 'var(--cv-ink-muted)' }}
                    >
                      Years
                    </dt>
                  </div>
                </HeroTooltip>

                <HeroTooltip
                  label="Production Platforms"
                  accent="#EA580C"
                  description="From Care360 telehealth and Dentist clinical suites to Meuble 3D e-commerce and RSA-licensed WPF POS software."
                >
                  <div tabIndex={0} className="cv-metric-cell">
                    <dd
                      className="font-cv-display font-bold text-[18px] sm:text-[25px] leading-none cv-tabular"
                      style={{ color: 'var(--cv-accent)' }}
                    >
                      30+
                    </dd>
                    <dt
                      className="mt-1 font-cv-mono text-[9px] sm:text-[10.5px] uppercase tracking-wider"
                      style={{ color: 'var(--cv-ink-muted)' }}
                    >
                      Shipped
                    </dt>
                  </div>
                </HeroTooltip>

                <HeroTooltip
                  label="Mostaql Verified Score"
                  accent="#F59E0B"
                  description="100% project completion rate, 100% on-time delivery, and 44.4% repeat-hire rate across verified client reviews."
                >
                  <div tabIndex={0} className="cv-metric-cell">
                    <dd
                      className="font-cv-display font-bold text-[18px] sm:text-[25px] leading-none cv-tabular"
                      style={{ color: 'var(--cv-ink)' }}
                    >
                      5.0★
                    </dd>
                    <dt
                      className="mt-1 font-cv-mono text-[9px] sm:text-[10.5px] uppercase tracking-wider"
                      style={{ color: 'var(--cv-ink-muted)' }}
                    >
                      Rating
                    </dt>
                  </div>
                </HeroTooltip>

                <HeroTooltip
                  label="Academic Foundation"
                  accent="#6366F1"
                  description="Master's in Computer Science (Information Systems & Networks) — ranked Top 5% of cohort at Ahmed Zabana University."
                >
                  <div tabIndex={0} className="cv-metric-cell">
                    <dd
                      className="font-cv-display font-bold text-[18px] sm:text-[25px] leading-none cv-tabular"
                      style={{ color: 'var(--cv-ink)' }}
                    >
                      Top 5%
                    </dd>
                    <dt
                      className="mt-1 font-cv-mono text-[9px] sm:text-[10.5px] uppercase tracking-wider"
                      style={{ color: 'var(--cv-ink-muted)' }}
                    >
                      M.Sc. CS
                    </dt>
                  </div>
                </HeroTooltip>
              </dl>

              {/* Focused Action Row */}
              <div
                className="cv-hero-enter mt-3.5 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto"
                style={{ animationDelay: '220ms' }}
              >
                <button
                  onClick={() => scrollToSection('projects')}
                  className="cv-btn-primary h-10 sm:h-11 px-3.5 sm:px-5 text-[12.5px] sm:text-[13.5px] font-semibold flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Selected Work</span>
                  <ArrowUpRight size={15} className="shrink-0" />
                </button>

                <button
                  onClick={() => scrollToSection('contact')}
                  className="cv-btn-secondary h-10 sm:h-11 px-3.5 sm:px-5 text-[12.5px] sm:text-[13.5px] font-medium flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Contact</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <HeroTooltip
                    label={copied ? 'Email Copied' : 'Direct Email'}
                    accent={copied ? '#10B981' : '#EA580C'}
                    description={
                      copied
                        ? 'Copied to clipboard — ready to paste.'
                        : `Click to copy ${personalInfo.email}`
                    }
                  >
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      aria-label="Copy email address"
                      className="cv-icon-btn h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center"
                    >
                      {copied ? (
                        <Check size={16} style={{ color: 'var(--cv-live)' }} />
                      ) : (
                        <Mail size={16} />
                      )}
                    </button>
                  </HeroTooltip>
                  <a
                    href={personalInfo.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub profile"
                    className="cv-icon-btn h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center"
                  >
                    <Github size={16} />
                  </a>
                  <a
                    href={personalInfo.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile"
                    className="cv-icon-btn h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center"
                  >
                    <Linkedin size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Borderless Interactive 3D Atelier Stage */}
            <div className="lg:col-span-7 h-[clamp(250px,36dvh,340px)] sm:h-[420px] lg:h-[min(540px,calc(100dvh-145px))] w-full">
              <Atelier3DStage
                isDark={isDark}
                onToggleTheme={handleToggleTheme}
                activeProjectId={activeCartridge}
                onSelectProject={(id) => roomStore.setActiveCartridge(id)}
                onOpenCaseStudy={(id) => openProjectModal(id)}
              />
            </div>
          </div>

          {/* Desktop Scroll Cue */}
          <div className="hidden md:flex items-center justify-center pt-1 relative z-10">
            <button
              onClick={() => scrollToSection('experience')}
              className="group flex items-center gap-2 font-cv-mono text-[11px] uppercase tracking-widest transition-colors"
              style={{ color: 'var(--cv-ink-muted)' }}
            >
              <span>01 / 05 · Scroll to snap to next section</span>
              <ChevronDown
                size={15}
                className="group-hover:translate-y-0.5 transition-transform"
                style={{ color: 'var(--cv-accent)' }}
              />
            </button>
          </div>
        </section>

        {/* ===================================================================
            SECTION 02: INTERACTIVE ARCHITECTURAL EXPERIENCE DOSSIER
           =================================================================== */}
        <section
          id="experience"
          className="cv-snap-section relative w-full flex flex-col justify-center pt-16 pb-24 md:pt-20 md:pb-10 px-4 sm:px-6 lg:px-12"
          style={{ borderTop: '1px solid var(--cv-border)' }}
        >
          <div className="max-w-7xl mx-auto w-full my-auto flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <span
                  className="block font-cv-mono text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-widest mb-1"
                  style={{ color: 'var(--cv-accent)' }}
                >
                  02 / Career Dossier
                </span>
                <h2
                  className="font-cv-display font-bold text-[24px] sm:text-[36px] leading-[1.06] tracking-[-0.025em]"
                  style={{ color: 'var(--cv-ink)' }}
                >
                  Experience &amp; Academic Standing
                </h2>
              </div>
              <p
                className="hidden sm:block text-[13.5px] max-w-[44ch] leading-[1.5]"
                style={{ color: 'var(--cv-ink-muted)' }}
              >
                Select any role to inspect architectural leadership, deliverables, and system
                ownership across 9+ years.
              </p>
            </div>

            {/* Interactive Master-Detail Dossier Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 items-start">
              {/* Role Selector List */}
              <div
                role="tablist"
                aria-label="Work experience and credentials"
                className="lg:col-span-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 no-scrollbar"
              >
                {workExperience.map((exp, idx) => {
                  const isActive = selectedRoleIdx === idx;
                  return (
                    <button
                      key={exp.role + exp.company}
                      role="tab"
                      aria-selected={isActive}
                      data-active={isActive ? 'true' : 'false'}
                      onClick={() => setSelectedRoleIdx(idx)}
                      className="cv-role-tab min-w-[200px] sm:min-w-[240px] lg:min-w-0 w-full px-3.5 sm:px-5 py-3 sm:py-3.5 shrink-0"
                    >
                      <span
                        className="block font-cv-mono text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: isActive ? 'var(--cv-accent)' : 'var(--cv-ink-muted)' }}
                      >
                        0{idx + 1} · {exp.period}
                      </span>
                      <div
                        className="mt-1 font-cv-display font-bold text-[15px] sm:text-[16.5px] leading-snug"
                        style={{ color: 'var(--cv-ink)' }}
                      >
                        {exp.role}
                      </div>
                      <div
                        className="mt-0.5 text-[12px] sm:text-[13px] truncate"
                        style={{ color: 'var(--cv-ink-secondary)' }}
                      >
                        {exp.company}
                      </div>
                    </button>
                  );
                })}

                {/* 4th Mobile Tab for M.Sc. & Languages (fits cleanly inside 100dvh on phones) */}
                <button
                  role="tab"
                  aria-selected={isMobileEduTab}
                  data-active={isMobileEduTab ? 'true' : 'false'}
                  onClick={() => setSelectedRoleIdx(workExperience.length)}
                  className="cv-role-tab lg:hidden min-w-[190px] px-3.5 py-3 shrink-0"
                >
                  <span
                    className="block font-cv-mono text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: isMobileEduTab ? 'var(--cv-accent)' : 'var(--cv-ink-muted)' }}
                  >
                    04 · Credentials
                  </span>
                  <div
                    className="mt-1 font-cv-display font-bold text-[15px] leading-snug"
                    style={{ color: 'var(--cv-ink)' }}
                  >
                    M.Sc. &amp; Languages
                  </div>
                  <div className="mt-0.5 text-[12px]" style={{ color: 'var(--cv-ink-secondary)' }}>
                    Top 5% · 3 Languages
                  </div>
                </button>
              </div>

              {/* Right 8 Columns: Active Spec Sheet + Desktop Education/Languages */}
              <div className="lg:col-span-8 space-y-3.5">
                {/* Role Dossier Panel */}
                <article
                  key={selectedRole.role + selectedRole.company}
                  role="tabpanel"
                  className={`${isMobileEduTab ? 'hidden lg:block' : 'block'} cv-dossier-card p-4 sm:p-6`}
                >
                  <div
                    className="flex flex-wrap items-center justify-between gap-2 pb-3 sm:pb-4"
                    style={{ borderBottom: '1px solid var(--cv-border)' }}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="cv-badge px-2.5 py-0.5 font-cv-mono text-[10.5px] font-medium"
                          style={{ color: 'var(--cv-accent)' }}
                        >
                          {selectedRole.period}
                        </span>
                        <span
                          className="font-cv-mono text-[10.5px] uppercase tracking-wider"
                          style={{ color: 'var(--cv-ink-muted)' }}
                        >
                          {selectedRole.type} · {selectedRole.location}
                        </span>
                      </div>

                      <h3
                        className="mt-2 font-cv-display font-bold text-[19px] sm:text-[24px] leading-tight"
                        style={{ color: 'var(--cv-ink)' }}
                      >
                        {selectedRole.role}
                      </h3>
                      <p
                        className="text-[13px] sm:text-[14px] font-medium mt-0.5"
                        style={{ color: 'var(--cv-ink-secondary)' }}
                      >
                        {selectedRole.company}
                      </p>
                    </div>
                  </div>

                  <ol
                    data-inner-scroll="true"
                    className="mt-3.5 sm:mt-4 space-y-2.5 lg:max-h-[30dvh] lg:overflow-y-auto pr-1"
                  >
                    {selectedRole.highlights.map((bullet, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-[13px] sm:text-[14px] leading-[1.55]"
                        style={{ color: 'var(--cv-ink-secondary)' }}
                      >
                        <span
                          className="font-cv-mono text-[11px] font-semibold mt-0.5 shrink-0 cv-tabular"
                          style={{ color: 'var(--cv-accent)' }}
                        >
                          0{i + 1}
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ol>
                </article>

                {/* Education + Spoken Languages Strip (Always visible on lg+, shown via Tab 04 on mobile) */}
                <div
                  className={`${isMobileEduTab ? 'grid' : 'hidden lg:grid'
                    } grid-cols-1 md:grid-cols-2 gap-3.5`}
                >
                  <div className="cv-dossier-card p-4 sm:p-5 flex items-start gap-3.5">
                    <div
                      className="cv-icon-well h-10 w-10 shrink-0 flex items-center justify-center"
                      style={{ color: 'var(--cv-accent)' }}
                    >
                      <GraduationCap size={19} />
                    </div>
                    <div className="min-w-0">
                      <span
                        className="font-cv-mono text-[10px] uppercase tracking-widest"
                        style={{ color: 'var(--cv-ink-muted)' }}
                      >
                        {education.period} · {education.location}
                      </span>
                      <h3
                        className="mt-0.5 font-cv-display font-bold text-[15px] sm:text-[16px] leading-snug"
                        style={{ color: 'var(--cv-ink)' }}
                      >
                        {education.degree}
                      </h3>
                      <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--cv-ink-secondary)' }}>
                        {education.institution}
                      </p>
                      <div
                        className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 cv-radius-sm text-[11px] font-medium"
                        style={{
                          backgroundColor: 'var(--cv-accent-soft)',
                          color: 'var(--cv-accent)',
                        }}
                      >
                        <Award size={12} />
                        <span>{education.honors}</span>
                      </div>
                    </div>
                  </div>

                  <div className="cv-dossier-card p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="font-cv-mono text-[10px] uppercase tracking-widest"
                        style={{ color: 'var(--cv-ink-muted)' }}
                      >
                        Spoken Languages
                      </span>
                      <span
                        className="font-cv-mono text-[10px]"
                        style={{ color: 'var(--cv-accent)' }}
                      >
                        TRILINGUAL
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {languages.map((lang) => (
                        <div
                          key={lang.name}
                          className="flex items-center justify-between py-1"
                          style={{ borderBottom: '1px solid var(--cv-border)' }}
                        >
                          <div>
                            <span
                              className="text-[13px] font-semibold"
                              style={{ color: 'var(--cv-ink)' }}
                            >
                              {lang.name}
                            </span>
                            <span
                              className="ml-2 text-[11.5px]"
                              style={{ color: 'var(--cv-ink-muted)' }}
                            >
                              {lang.fluency}
                            </span>
                          </div>
                          <span
                            className="font-cv-mono text-[11.5px]"
                            style={{ color: 'var(--cv-ink-secondary)' }}
                          >
                            {lang.nativeName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 03: INTERACTIVE SPOTLIGHT PROJECT STAGE (100dvh FIT)
           =================================================================== */}
        <section
          id="projects"
          className="cv-snap-section relative w-full flex flex-col justify-center pt-16 pb-24 md:pt-20 md:pb-10 px-4 sm:px-6 lg:px-12"
          style={{ borderTop: '1px solid var(--cv-border)' }}
        >
          <div className="max-w-7xl mx-auto w-full my-auto">
            {/* Header + 4-Module Hardware Index Selector */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <span
                  className="block font-cv-mono text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-widest mb-1"
                  style={{ color: 'var(--cv-accent)' }}
                >
                  03 / Selected Engineering Work
                </span>
                <h2
                  className="font-cv-display font-bold text-[24px] sm:text-[36px] leading-[1.06] tracking-[-0.025em]"
                  style={{ color: 'var(--cv-ink)' }}
                >
                  Production Systems &amp; Case Studies
                </h2>
              </div>

              {/* 4-Slot Hardware Index Switcher */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                <div
                  className="inline-flex items-center gap-1 p-1 cv-radius-pill shrink-0"
                  style={{
                    backgroundColor: 'var(--cv-surface)',
                    border: '1px solid var(--cv-border)',
                  }}
                >
                  {PROJECT_ORDER.map((id, idx) => {
                    const proj = cartridgeProjects[id];
                    const isSel = spotlightProjectId === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setSpotlightProjectId(id)}
                        className="px-2.5 sm:px-3.5 py-1.5 cv-radius-pill text-[11.5px] sm:text-[12px] font-medium flex items-center gap-1.5 transition-all whitespace-nowrap"
                        style={{
                          backgroundColor: isSel ? 'var(--cv-surface-elevated)' : 'transparent',
                          color: isSel ? 'var(--cv-ink)' : 'var(--cv-ink-muted)',
                          boxShadow: isSel
                            ? '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px var(--cv-border)'
                            : 'none',
                        }}
                      >
                        <span
                          className="h-2 w-2 shrink-0"
                          style={{ borderRadius: '9999px', backgroundColor: proj.color }}
                        />
                        <span className="font-cv-mono text-[10px]" style={{ color: isSel ? 'var(--cv-accent)' : 'var(--cv-ink-subtle)' }}>
                          0{idx + 1}
                        </span>
                        <span>{PROJECT_SHORT_LABELS[id]}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => stepSpotlight(-1)}
                    aria-label="Previous project"
                    className="cv-icon-btn h-9 w-9 flex items-center justify-center"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() => stepSpotlight(1)}
                    aria-label="Next project"
                    className="cv-icon-btn h-9 w-9 flex items-center justify-center"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Monumental Featured Project Stage Card */}
            <article
              key={spotlightProject.id}
              onMouseMove={handleCardPointerMove}
              className="cv-project-card p-4 sm:p-6 lg:p-8"
              style={{
                borderColor: activeCartridge === spotlightProject.id ? 'var(--cv-accent)' : undefined,
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
                {/* Left 5 Columns: Framed Visual Preview + Quick Links */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 shrink-0"
                        style={{ borderRadius: '9999px', backgroundColor: spotlightProject.color }}
                      />
                      <span
                        className="font-cv-mono text-[11px] font-semibold tracking-wider"
                        style={{ color: 'var(--cv-accent)' }}
                      >
                        PRJ—0{spotlightIndex + 1}
                      </span>
                      <span style={{ color: 'var(--cv-ink-subtle)' }}>/</span>
                      <span
                        className="text-[12px] truncate"
                        style={{ color: 'var(--cv-ink-muted)' }}
                      >
                        {spotlightProject.subtitle}
                      </span>
                    </div>

                    {spotlightProject.isOpenSource && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] font-semibold uppercase shrink-0"
                        style={{
                          backgroundColor: 'var(--cv-surface)',
                          color: 'var(--cv-ink)',
                          border: '1px solid var(--cv-border)',
                        }}
                      >
                        <Github size={11} />
                        <span>Open Source</span>
                      </span>
                    )}
                  </div>

                  {spotlightProject.visualType === 'jud-platform' ? (
                    <div className="cv-project-frame h-[208px] sm:h-56 lg:h-64 w-full">
                      <JudPlatformPreview key={spotlightProject.id} variant="spotlight" />
                    </div>
                  ) : spotlightProject.visualType === 'cpp-search' ? (
                    <div className="cv-project-frame h-[208px] sm:h-56 lg:h-64 w-full">
                      <CppSearchPreview key={spotlightProject.id} variant="spotlight" />
                    </div>
                  ) : spotlightProject.visualType === 'mostaql-reviews' ? (
                    <div className="cv-project-frame h-[208px] sm:h-56 lg:h-64 w-full">
                      <MostaqlReviewsPreview key={spotlightProject.id} variant="spotlight" />
                    </div>
                  ) : spotlightProject.visualType === 'mouser-kvm' ? (
                    <div className="cv-project-frame h-[208px] sm:h-56 lg:h-64 w-full">
                      <MouserKvmPreview key={spotlightProject.id} variant="spotlight" />
                    </div>
                  ) : spotlightProject.visualType === 'meuble-store' ? (
                    <div className="cv-project-frame h-[208px] sm:h-56 lg:h-64 w-full">
                      <MeubleStorePreview key={spotlightProject.id} variant="spotlight" />
                    </div>
                  ) : spotlightProject.visualType === 'alg-math' ? (
                    <div className="cv-project-frame h-[208px] sm:h-56 lg:h-64 w-full">
                      <AlgMathPreview key={spotlightProject.id} variant="spotlight" />
                    </div>
                  ) : spotlightProject.image ? (
                    <div className="cv-project-frame h-[208px] sm:h-56 lg:h-64 w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={spotlightProject.image}
                        alt={spotlightProject.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => handleLoadOn3DMonitor(spotlightProject.id)}
                      className="cv-btn-secondary h-10 px-3.5 text-[12px] font-medium flex items-center gap-1.5 flex-1 justify-center"
                    >
                      <Monitor size={14} style={{ color: 'var(--cv-accent)' }} />
                      <span>Mount in 3D Monitor ↑</span>
                    </button>

                    {spotlightProject.url && (
                      <a
                        href={spotlightProject.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cv-btn-secondary h-10 px-3.5 text-[12px] font-medium flex items-center gap-1.5 shrink-0"
                      >
                        {spotlightProject.isOpenSource && <Github size={14} />}
                        <span>{spotlightProject.isOpenSource ? 'GitHub' : 'Live URL'}</span>
                        <ArrowUpRight size={14} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Right 7 Columns: Title, Outcome, Engineering Notes & Stack */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-cv-display font-bold text-[22px] sm:text-[30px] lg:text-[34px] leading-[1.08] tracking-[-0.025em]"
                      style={{ color: 'var(--cv-ink)' }}
                    >
                      {spotlightProject.title}
                    </h3>

                    <div
                      className="mt-3 px-4 py-2.5 sm:py-3 cv-radius-sm text-[13px] sm:text-[14px] font-medium leading-snug"
                      style={{
                        backgroundColor: 'var(--cv-surface)',
                        color: 'var(--cv-ink)',
                        borderLeft: `3px solid ${spotlightProject.color}`,
                      }}
                    >
                      {spotlightProject.metrics}
                    </div>

                    <ol
                      data-inner-scroll="true"
                      className="mt-3.5 sm:mt-4 space-y-2 md:max-h-[24dvh] md:overflow-y-auto pr-1"
                    >
                      {spotlightProject.description.map((line, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-[13px] sm:text-[14px] leading-[1.55]"
                          style={{ color: 'var(--cv-ink-secondary)' }}
                        >
                          <span
                            className="font-cv-mono text-[11px] font-semibold mt-0.5 shrink-0 cv-tabular"
                            style={{ color: 'var(--cv-accent)' }}
                          >
                            0{i + 1}
                          </span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div
                    className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 flex flex-wrap items-center justify-between gap-3"
                    style={{ borderTop: '1px solid var(--cv-border)' }}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {spotlightProject.stack.slice(0, 6).map((tech) => (
                        <span
                          key={tech}
                          className="cv-chip px-2.5 py-0.5 font-cv-mono text-[10.5px] uppercase"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => openProjectModal(spotlightProject.id)}
                      className="cv-btn-primary h-10 px-4 text-[12.5px] font-semibold flex items-center gap-1.5 ml-auto"
                    >
                      <span>Full Case Study</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ===================================================================
            SECTION 04: SYSTEMS STACK MATRIX & EDITORIAL ENDORSEMENTS
           =================================================================== */}
        <section
          id="skills"
          className="cv-snap-section relative w-full flex flex-col justify-center pt-16 pb-24 md:pt-20 md:pb-10 px-4 sm:px-6 lg:px-12"
          style={{ borderTop: '1px solid var(--cv-border)' }}
        >
          <div className="max-w-7xl mx-auto w-full my-auto">
            {/* Header + Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 sm:mb-5">
              <div>
                <span
                  className="block font-cv-mono text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-widest mb-1"
                  style={{ color: 'var(--cv-accent)' }}
                >
                  04 / Technical Architecture
                </span>
                <h2
                  className="font-cv-display font-bold text-[24px] sm:text-[36px] leading-[1.06] tracking-[-0.025em]"
                  style={{ color: 'var(--cv-ink)' }}
                >
                  Systems Stack &amp; Client Proof
                </h2>
              </div>

              <div
                className="flex items-center gap-1 p-1 cv-radius-pill overflow-x-auto no-scrollbar max-w-full"
                style={{
                  backgroundColor: 'var(--cv-surface)',
                  border: '1px solid var(--cv-border)',
                }}
              >
                {SKILL_CATEGORIES.map((cat) => {
                  const isActive = skillFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSkillFilter(cat.id)}
                      className={`${cat.mobileOnly ? 'md:hidden' : ''} px-2.5 sm:px-3 py-1 cv-radius-pill text-[11.5px] sm:text-[12px] font-medium transition-all whitespace-nowrap shrink-0`}
                      style={{
                        backgroundColor: isActive ? 'var(--cv-surface-elevated)' : 'transparent',
                        color: isActive ? 'var(--cv-ink)' : 'var(--cv-ink-muted)',
                        boxShadow: isActive
                          ? '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px var(--cv-border)'
                          : 'none',
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skill Matrix Grid (Bounded internal scroll tray if needed on compact screens) */}
            <div
              data-inner-scroll="true"
              className={`${skillFilter === 'reviews' ? 'hidden md:grid' : 'grid'
                } grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:max-h-[44dvh] md:overflow-y-auto pr-1`}
            >
              {filteredSkills.map((skill) => {
                const pips = Math.max(3, Math.min(5, Math.round(skill.level / 20)));
                const tier = getSkillTier(skill.level);
                return (
                  <div key={skill.name} className="cv-skill-tile p-3 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="cv-icon-well h-7 w-7 shrink-0 flex items-center justify-center p-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={skill.iconPath}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <h3
                            className="font-cv-display font-bold text-[14px] leading-snug truncate"
                            style={{ color: 'var(--cv-ink)' }}
                          >
                            {skill.name}
                          </h3>
                        </div>

                        <span
                          className="font-cv-mono text-[9px] font-semibold px-1.5 py-0.5 cv-radius-sm shrink-0"
                          style={{
                            backgroundColor: 'var(--cv-surface)',
                            color: 'var(--cv-ink-muted)',
                            border: '1px solid var(--cv-border)',
                          }}
                        >
                          {tier}
                        </span>
                      </div>

                      {skill.description && (
                        <p
                          className="mt-1.5 text-[11.5px] leading-[1.45] line-clamp-2"
                          style={{ color: 'var(--cv-ink-secondary)' }}
                        >
                          {skill.description}
                        </p>
                      )}
                    </div>

                    <div
                      className="flex items-center justify-between pt-1.5"
                      style={{ borderTop: '1px solid var(--cv-border)' }}
                    >
                      <span
                        className="font-cv-mono text-[9.5px] uppercase tracking-wider"
                        style={{ color: 'var(--cv-ink-muted)' }}
                      >
                        Mastery
                      </span>
                      <div className="flex items-center gap-1" aria-label={`${pips} out of 5`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className="h-1.5 w-3"
                            style={{
                              borderRadius: '9999px',
                              backgroundColor: n <= pips ? skill.color : 'var(--cv-pip-empty)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Editorial Client Endorsements (Always on md+, selectable via "Reviews 5★" on mobile) */}
            <div
              className={`${skillFilter === 'reviews' ? 'block' : 'hidden md:block'
                } mt-4 sm:mt-5 pt-4`}
              style={{ borderTop: '1px solid var(--cv-border)' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span
                  className="font-cv-mono text-[10.5px] uppercase tracking-widest"
                  style={{ color: 'var(--cv-ink-muted)' }}
                >
                  Verified Client Endorsements · 5.0 / 5.0 Average
                </span>
                <a
                  href="https://mostaql.com/u/abdelkrime2055/reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] font-medium flex items-center gap-1 hover:underline"
                  style={{ color: 'var(--cv-accent)' }}
                >
                  <span>Verify on Mostaql</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>

              <div
                data-inner-scroll="true"
                className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 pr-1"
              >
                {TESTIMONIALS.map((t) => (
                  <figure
                    key={t.name}
                    className="pl-3.5 flex flex-col justify-between"
                    style={{ borderLeft: '2px solid var(--cv-border-strong)' }}
                  >
                    <blockquote
                      className="text-[12.5px] sm:text-[13px] leading-[1.5]"
                      style={{ color: 'var(--cv-ink-secondary)' }}
                    >
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-2 flex items-center justify-between text-[11.5px]">
                      <div>
                        <span className="font-semibold" style={{ color: 'var(--cv-ink)' }}>
                          {t.name}
                        </span>
                        <span style={{ color: 'var(--cv-ink-muted)' }}> · {t.country}</span>
                      </div>
                      <span
                        className="font-cv-mono text-[10.5px]"
                        style={{ color: 'var(--cv-accent)' }}
                      >
                        5.0 ★
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 05: SWISS DISPATCH CONTACT SHEET
           =================================================================== */}
        <section
          id="contact"
          className="cv-snap-section relative w-full flex flex-col justify-center pt-16 pb-24 md:pt-20 md:pb-10 px-4 sm:px-6 lg:px-12"
          style={{ borderTop: '1px solid var(--cv-border)' }}
        >
          <div className="max-w-6xl mx-auto w-full my-auto">
            {/* Mobile Tab Toggle between Form and Direct Channels */}
            <div className="flex lg:hidden items-center justify-between gap-3 mb-3">
              <span
                className="font-cv-mono text-[10.5px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--cv-accent)' }}
              >
                05 / Contact
              </span>
              <div
                className="inline-flex items-center p-0.5 cv-radius-pill"
                style={{
                  backgroundColor: 'var(--cv-surface)',
                  border: '1px solid var(--cv-border)',
                }}
              >
                <button
                  onClick={() => setMobileContactTab('form')}
                  className="px-3 py-1 cv-radius-pill text-[11.5px] font-medium"
                  style={{
                    backgroundColor:
                      mobileContactTab === 'form' ? 'var(--cv-surface-elevated)' : 'transparent',
                    color: mobileContactTab === 'form' ? 'var(--cv-ink)' : 'var(--cv-ink-muted)',
                  }}
                >
                  Direct Message
                </button>
                <button
                  onClick={() => setMobileContactTab('channels')}
                  className="px-3 py-1 cv-radius-pill text-[11.5px] font-medium"
                  style={{
                    backgroundColor:
                      mobileContactTab === 'channels'
                        ? 'var(--cv-surface-elevated)'
                        : 'transparent',
                    color:
                      mobileContactTab === 'channels' ? 'var(--cv-ink)' : 'var(--cv-ink-muted)',
                  }}
                >
                  Channels &amp; 3D
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left 5 Columns: Direct Channels & World Switch */}
              <div
                className={`${mobileContactTab === 'channels' ? 'block' : 'hidden lg:block'
                  } lg:col-span-5 space-y-3.5 sm:space-y-4`}
              >
                <div>
                  <span
                    className="hidden lg:block font-cv-mono text-[11px] font-semibold uppercase tracking-widest mb-2"
                    style={{ color: 'var(--cv-accent)' }}
                  >
                    05 / Initiate Collaboration
                  </span>
                  <h2
                    className="font-cv-display font-bold text-[26px] sm:text-[38px] leading-[1.04] tracking-[-0.03em]"
                    style={{ color: 'var(--cv-ink)' }}
                  >
                    Let&apos;s build something enduring.
                  </h2>
                  <p
                    className="mt-2 text-[13.5px] sm:text-[14.5px] leading-[1.55]"
                    style={{ color: 'var(--cv-ink-secondary)' }}
                  >
                    Available for Lead &amp; Senior Full-Stack roles, system architecture, and
                    end-to-end product delivery.
                  </p>
                </div>

                {/* Copyable Email Ledger */}
                <div className="cv-dossier-card p-3 flex items-center gap-3">
                  <div
                    className="cv-icon-well h-9 w-9 shrink-0 flex items-center justify-center"
                    style={{ color: 'var(--cv-accent)' }}
                  >
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className="block font-cv-mono text-[9.5px] uppercase tracking-wider"
                      style={{ color: 'var(--cv-ink-muted)' }}
                    >
                      Direct Email
                    </span>
                    <a
                      href={`mailto:${personalInfo.email}`}
                      className="text-[13px] font-semibold truncate block hover:underline"
                      style={{ color: 'var(--cv-ink)' }}
                    >
                      {personalInfo.email}
                    </a>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="cv-btn-secondary h-8 px-3 text-[11.5px] font-medium flex items-center gap-1.5 shrink-0"
                  >
                    {copied ? (
                      <Check size={13} style={{ color: 'var(--cv-live)' }} />
                    ) : (
                      <Copy size={13} />
                    )}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* 2x2 Channel Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={personalInfo.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cv-skill-tile p-3 flex items-center gap-2.5"
                  >
                    <MessageSquare size={16} style={{ color: 'var(--cv-live)' }} />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold" style={{ color: 'var(--cv-ink)' }}>
                        WhatsApp
                      </div>
                      <div className="text-[10.5px] truncate" style={{ color: 'var(--cv-ink-muted)' }}>
                        {personalInfo.phone}
                      </div>
                    </div>
                  </a>

                  <a
                    href={personalInfo.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cv-skill-tile p-3 flex items-center gap-2.5"
                  >
                    <Linkedin size={16} style={{ color: 'var(--cv-ink)' }} />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold" style={{ color: 'var(--cv-ink)' }}>
                        LinkedIn
                      </div>
                      <div className="text-[10.5px] truncate" style={{ color: 'var(--cv-ink-muted)' }}>
                        /in/karimbettayeb
                      </div>
                    </div>
                  </a>

                  <a
                    href={personalInfo.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cv-skill-tile p-3 flex items-center gap-2.5"
                  >
                    <Github size={16} style={{ color: 'var(--cv-ink)' }} />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold" style={{ color: 'var(--cv-ink)' }}>
                        GitHub
                      </div>
                      <div className="text-[10.5px] truncate" style={{ color: 'var(--cv-ink-muted)' }}>
                        @xnevz
                      </div>
                    </div>
                  </a>

                  <a
                    href={personalInfo.resumePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cv-skill-tile p-3 flex items-center gap-2.5"
                  >
                    <Download size={16} style={{ color: 'var(--cv-accent)' }} />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold" style={{ color: 'var(--cv-ink)' }}>
                        Resume PDF
                      </div>
                      <div className="text-[10.5px] truncate" style={{ color: 'var(--cv-ink-muted)' }}>
                        Print-ready CV
                      </div>
                    </div>
                  </a>
                </div>

                {/* Location & 3D Diorama Link */}
                <div className="cv-dossier-card p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin size={15} style={{ color: 'var(--cv-accent)' }} className="shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--cv-ink)' }}>
                        100% 3D Room Diorama
                      </div>
                      <div className="text-[11px] truncate" style={{ color: 'var(--cv-ink-muted)' }}>
                        Interactive isometric portfolio
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/room"
                    className="cv-btn-secondary h-8 px-3 text-[11.5px] font-semibold flex items-center gap-1.5 shrink-0"
                  >
                    <Box size={13} style={{ color: 'var(--cv-accent)' }} />
                    <span>Enter Room</span>
                  </Link>
                </div>
              </div>

              {/* Right 7 Columns: Swiss Dispatch Form */}
              <div
                className={`${mobileContactTab === 'form' ? 'block' : 'hidden lg:block'
                  } lg:col-span-7`}
              >
                <div className="cv-dossier-card p-5 sm:p-7">
                  <div
                    className="flex items-center justify-between gap-3 mb-4 pb-3"
                    style={{ borderBottom: '1px solid var(--cv-border)' }}
                  >
                    <div>
                      <h3
                        className="font-cv-display font-bold text-[20px] sm:text-[22px]"
                        style={{ color: 'var(--cv-ink)' }}
                      >
                        Direct Dispatch
                      </h3>
                      <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--cv-ink-muted)' }}>
                        Send a note about a role, architecture challenge, or product idea.
                      </p>
                    </div>
                    <span className="font-cv-mono text-[10.5px] px-2.5 py-1 cv-badge hidden sm:inline">
                      MSG // 05
                    </span>
                  </div>

                  {submitted ? (
                    <div
                      className="p-5 cv-radius-md flex items-start gap-3"
                      role="status"
                      style={{
                        backgroundColor: 'var(--cv-live-soft)',
                        border: '1px solid var(--cv-border)',
                      }}
                    >
                      <CheckCircle2 size={20} style={{ color: 'var(--cv-live)' }} className="shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-[15px]" style={{ color: 'var(--cv-ink)' }}>
                          Message received
                        </div>
                        <p className="text-[13.5px] mt-1" style={{ color: 'var(--cv-ink-secondary)' }}>
                          Thanks for reaching out. I&apos;ll reply to{' '}
                          <strong style={{ color: 'var(--cv-ink)' }}>{formData.email}</strong> shortly.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <label className="block">
                          <span
                            className="block font-cv-mono text-[10.5px] uppercase tracking-wider mb-1"
                            style={{ color: 'var(--cv-ink-muted)' }}
                          >
                            Your Name
                          </span>
                          <input
                            type="text"
                            required
                            autoComplete="name"
                            placeholder="Jane Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="cv-input w-full px-3.5 py-2"
                          />
                        </label>

                        <label className="block">
                          <span
                            className="font-cv-mono block text-[10.5px] uppercase tracking-wider mb-1"
                            style={{ color: 'var(--cv-ink-muted)' }}
                          >
                            Your Email
                          </span>
                          <input
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="jane@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="cv-input w-full px-3.5 py-2"
                          />
                        </label>
                      </div>

                      <label className="block">
                        <span
                          className="block font-cv-mono text-[10.5px] uppercase tracking-wider mb-1"
                          style={{ color: 'var(--cv-ink-muted)' }}
                        >
                          Project or Role Details
                        </span>
                        <textarea
                          required
                          rows={4}
                          placeholder="Tell me about the team, scope, or architecture…"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="cv-input w-full px-3.5 py-2 resize-none"
                        />
                      </label>

                      {errorMessage && (
                        <p role="alert" className="text-[13px]" style={{ color: 'var(--cv-accent)' }}>
                          {errorMessage}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="cv-btn-primary w-full h-11 text-[13.5px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <Send size={15} />
                        <span>{submitting ? 'Sending Dispatch…' : 'Send Message'}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Adaptive Light/Dark Case Study Modal */}
      <CVCaseStudyModal
        projectId={modalProjectId}
        onClose={() => openProjectModal(null)}
        onSelectProject={(id) => openProjectModal(id)}
        onLoadOn3DMonitor={handleLoadOn3DMonitor}
      />

      {/* Keyboard Command Palette (⌘K / Ctrl+K) */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNavigateSection={scrollToSection}
        onOpenProject={(id) => openProjectModal(id)}
        onCopyEmail={handleCopyEmail}
        emailCopied={copied}
        onToggleTheme={handleToggleTheme}
        isDark={isDark}
        onEnterRoom={() => router.push('/room')}
      />

      {/* Persistent Floating Mode Switcher (/ <-> /room) */}
      <FloatingModeSwitch />
    </div>
  );
}
