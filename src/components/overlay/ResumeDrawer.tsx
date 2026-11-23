'use client';

import React from 'react';
import { X, Download, ArrowUpRight, Send, GraduationCap } from 'lucide-react';
import { useRoomStore, roomStore } from '@/store/useRoomStore';
import { exploreStore, useExplore, type DrawerSection } from '@/store/exploreStore';
import {
  personalInfo,
  achievements,
  techSkills,
  cartridgeProjects,
  workExperience,
  education,
  languages,
} from '@/data/resumeData';

const testimonials = [
  {
    name: 'Mahmoud S.',
    country: 'Egypt',
    description:
      'We asked Engineer Abdelkarim to work on more than 5 projects, all exceeded our expectations. As opposed to the sophisticated nature of the work, he never gets tired of nor fails to propose better, easier and safer solutions.',
  },
  {
    name: 'Hani I.',
    country: 'Saudi Arabia',
    description:
      'His dedication to the work is evident, characterized by sincerity and meticulous attention to detail. I express my heartfelt wishes for their continued success in all endeavors.',
  },
  {
    name: 'Khaled A.',
    country: 'Yemen',
    description:
      'Abdelkarim exemplifies excellence as a first-class programmer. Our collaboration on numerous projects has been exceedingly fruitful.',
  },
];

const TABS: { id: DrawerSection; label: string }[] = [
  { id: 'summary', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-cv-display font-bold text-[19px] tracking-[-0.015em] mb-4"
      style={{ color: 'var(--cv-ink)' }}
    >
      {children}
    </h3>
  );
}

export function ResumeDrawer() {
  const isDrawerOpen = useRoomStore((state) => state.isDrawerOpen);
  const toggleDrawer = useRoomStore((state) => state.toggleDrawer);
  const toggleContact = useRoomStore((state) => state.toggleContact);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [current, setCurrent] = React.useState<DrawerSection>('summary');

  const handleClose = React.useCallback(() => {
    toggleDrawer();
    roomStore.setActiveStation('none');
  }, [toggleDrawer]);

  React.useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handleClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOpen, handleClose]);

  const drawerSection = useExplore((st) => st.drawerSection);
  React.useEffect(() => {
    if (!isDrawerOpen) exploreStore.clearDrawerSection();
    if (!isDrawerOpen || !drawerSection) return;
    const id = window.setTimeout(() => {
      document.getElementById(`resume-${drawerSection}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
    return () => window.clearTimeout(id);
  }, [isDrawerOpen, drawerSection]);

  React.useEffect(() => {
    if (!isDrawerOpen || !scrollRef.current) return;
    const root = scrollRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0]?.target.id.replace('resume-', '') as DrawerSection | undefined;
        if (id && TABS.some((t) => t.id === id)) setCurrent(id);
      },
      { root, rootMargin: '-15% 0px -70% 0px' }
    );
    TABS.forEach((t) => {
      const el = document.getElementById(`resume-${t.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const goTo = (id: DrawerSection) =>
    document.getElementById(`resume-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'var(--cv-scrim)' }}
        onClick={handleClose}
      />

      <aside
        aria-label="Resume"
        className="sheet-in relative cv-modal-sheet w-full sm:w-[min(680px,92vw)] h-full sm:h-[calc(100%-24px)] sm:my-3 sm:mr-3 flex flex-col overflow-hidden"
      >
        {/* Sticky Adaptive Header */}
        <header
          className="relative shrink-0 px-5 sm:px-8 pt-5 sm:pt-7"
          style={{
            borderBottom: '1px solid var(--cv-border)',
            backgroundColor: 'var(--cv-surface)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span
                className="block font-cv-mono text-[10.5px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: 'var(--cv-accent)' }}
              >
                Curriculum Vitae
              </span>
              <h2
                className="font-cv-display font-bold text-[26px] sm:text-[32px] leading-[1.04] tracking-[-0.025em]"
                style={{ color: 'var(--cv-ink)' }}
              >
                {personalInfo.name}
              </h2>
              <p className="mt-1 text-[13.5px]" style={{ color: 'var(--cv-ink-secondary)' }}>
                {personalInfo.role}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={personalInfo.resumePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cv-btn-secondary h-9 px-3.5 text-[12px] font-medium flex items-center gap-1.5"
              >
                <Download size={14} />
                <span className="hidden sm:inline">PDF</span>
              </a>
              <button
                onClick={handleClose}
                aria-label="Close resume"
                className="cv-icon-btn h-9 w-9 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <nav aria-label="Resume sections" className="mt-4 -mx-1 flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => {
              const isActive = current === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => goTo(t.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className="relative shrink-0 px-3 pb-3 pt-1 text-[13px] font-medium transition-colors duration-200"
                  style={{ color: isActive ? 'var(--cv-ink)' : 'var(--cv-ink-muted)' }}
                >
                  {t.label}
                  <span
                    className={`absolute left-3 right-3 bottom-0 h-[2px] transition-transform duration-300 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                    style={{ backgroundColor: 'var(--cv-accent)' }}
                  />
                </button>
              );
            })}
          </nav>
        </header>

        <div ref={scrollRef} className="relative flex-1 overflow-y-auto overscroll-contain px-5 sm:px-8 pb-10">
          {/* About */}
          <section id="resume-summary" className="pt-7 scroll-mt-4">
            <p className="text-[15px] leading-[1.65] max-w-[62ch]" style={{ color: 'var(--cv-ink-secondary)' }}>
              {personalInfo.bio}
            </p>
            <p className="mt-3 text-[13px] font-medium flex items-center gap-2" style={{ color: 'var(--cv-live)' }}>
              <span
                className="h-2 w-2 shrink-0"
                style={{ borderRadius: '9999px', backgroundColor: 'var(--cv-live)' }}
              />
              {personalInfo.availability}, based in {personalInfo.location}
            </p>
          </section>

          {/* Career Metrics Ledger */}
          <section id="resume-achievements" className="mt-7 scroll-mt-4" aria-label="Career numbers">
            <dl
              className="grid grid-cols-2 sm:grid-cols-3 cv-radius-md overflow-hidden"
              style={{
                backgroundColor: 'var(--cv-surface)',
                border: '1px solid var(--cv-border)',
              }}
            >
              {achievements.map((a) => (
                <div
                  key={a.title}
                  className="px-4 py-4"
                  style={{ borderRight: '1px solid var(--cv-border)', borderBottom: '1px solid var(--cv-border)' }}
                >
                  <dt className="sr-only">{a.title}</dt>
                  <dd
                    className="font-cv-display font-bold text-[24px] leading-none tracking-[-0.02em] cv-tabular"
                    style={{ color: 'var(--cv-ink)' }}
                  >
                    {a.number}
                  </dd>
                  <dd className="mt-1.5 font-cv-mono text-[11px] leading-snug" style={{ color: 'var(--cv-ink-muted)' }}>
                    {a.title}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Experience */}
          <section id="resume-experience" className="pt-10 scroll-mt-4">
            <SectionTitle>Experience</SectionTitle>
            <ol className="relative ml-1.5 space-y-7" style={{ borderLeft: '1px solid var(--cv-border-strong)' }}>
              {workExperience.map((exp) => (
                <li key={exp.role + exp.company} className="relative pl-6">
                  <span
                    className="absolute -left-[5px] top-1.5 h-2.5 w-2.5"
                    style={{ borderRadius: '9999px', backgroundColor: 'var(--cv-accent)' }}
                  />
                  <p className="font-cv-mono text-[11.5px] font-medium cv-tabular" style={{ color: 'var(--cv-accent)' }}>
                    {exp.period}
                  </p>
                  <h4 className="mt-0.5 font-cv-display text-[16px] font-bold leading-snug" style={{ color: 'var(--cv-ink)' }}>
                    {exp.role},{' '}
                    <span className="font-normal" style={{ color: 'var(--cv-ink-secondary)' }}>
                      {exp.company}
                    </span>
                  </h4>
                  <p className="text-[12px]" style={{ color: 'var(--cv-ink-muted)' }}>
                    {exp.location} · {exp.type}
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {exp.highlights.map((h) => (
                      <li key={h} className="text-[13.5px] leading-[1.6] max-w-[64ch]" style={{ color: 'var(--cv-ink-secondary)' }}>
                        {h}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          {/* Skills with Icons & 5-Pip Tactile Indicators */}
          <section id="resume-skills" className="pt-10 scroll-mt-4">
            <SectionTitle>Skills</SectionTitle>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {techSkills.map((skill) => {
                const pips = Math.max(3, Math.min(5, Math.round(skill.level / 20)));
                return (
                  <li key={skill.name} className="cv-skill-tile p-3.5 flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="cv-icon-well h-7 w-7 shrink-0 flex items-center justify-center p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={skill.iconPath} alt="" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-cv-display text-[13.5px] font-bold truncate" style={{ color: 'var(--cv-ink)' }}>
                          {skill.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" aria-label={`${pips} out of 5`}>
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
                    {skill.description && (
                      <p className="text-[11.5px] leading-snug" style={{ color: 'var(--cv-ink-secondary)' }}>
                        {skill.description}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2" aria-label="Languages">
              {languages.map((lang) => (
                <span key={lang.name} className="cv-badge px-3 py-1.5 text-[12px]">
                  <span className="font-semibold" style={{ color: 'var(--cv-ink)' }}>
                    {lang.name}
                  </span>
                  <span style={{ color: 'var(--cv-ink-muted)' }}> · {lang.fluency}</span>
                </span>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section id="resume-projects" className="pt-10 scroll-mt-4">
            <SectionTitle>Projects</SectionTitle>
            <ul className="space-y-3">
              {Object.values(cartridgeProjects).map((proj) => (
                <li key={proj.id} className="cv-skill-tile p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0"
                      style={{ borderRadius: '9999px', background: proj.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-cv-display text-[15.5px] font-bold leading-snug" style={{ color: 'var(--cv-ink)' }}>
                        {proj.title}
                      </h4>
                      <p className="text-[12px]" style={{ color: 'var(--cv-ink-muted)' }}>
                        {proj.subtitle}
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--cv-ink-secondary)' }}>
                        {proj.metrics}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            toggleDrawer();
                            roomStore.setActiveCartridge(proj.id);
                          }}
                          className="cv-btn-secondary h-8 px-3.5 text-[12px] font-medium"
                        >
                          Read the case study
                        </button>
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 px-2 text-[12px] font-medium flex items-center gap-1 hover:underline"
                            style={{ color: 'var(--cv-accent)' }}
                          >
                            Open project <ArrowUpRight size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Education */}
          <section id="resume-education" className="pt-10 scroll-mt-4">
            <SectionTitle>Education</SectionTitle>
            <div className="flex gap-4">
              <div
                className="cv-icon-well h-11 w-11 shrink-0 flex items-center justify-center"
                style={{ color: 'var(--cv-accent)' }}
              >
                <GraduationCap size={20} />
              </div>
              <div>
                <h4 className="font-cv-display text-[15.5px] font-bold leading-snug" style={{ color: 'var(--cv-ink)' }}>
                  {education.degree}
                </h4>
                <p className="text-[13px]" style={{ color: 'var(--cv-ink-secondary)' }}>
                  {education.institution}, {education.location}
                </p>
                <p className="font-cv-mono text-[11.5px] cv-tabular mt-0.5" style={{ color: 'var(--cv-ink-muted)' }}>
                  {education.period}
                </p>
                <p className="mt-2 text-[12.5px] font-medium" style={{ color: 'var(--cv-accent)' }}>
                  {education.honors}
                </p>
              </div>
            </div>
          </section>

          {/* Client Recommendations */}
          <section className="pt-10" aria-label="Client recommendations">
            <SectionTitle>What clients say</SectionTitle>
            <div className="space-y-5">
              {testimonials.map((t) => (
                <figure
                  key={t.name}
                  className="relative pl-4"
                  style={{ borderLeft: '2px solid var(--cv-border-strong)' }}
                >
                  <blockquote className="text-[14px] leading-relaxed max-w-[62ch]" style={{ color: 'var(--cv-ink-secondary)' }}>
                    &ldquo;{t.description}&rdquo;
                  </blockquote>
                  <figcaption className="mt-2 text-[12px]" style={{ color: 'var(--cv-ink-muted)' }}>
                    <span className="font-semibold" style={{ color: 'var(--cv-ink)' }}>
                      {t.name}
                    </span>
                    , {t.country}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div
            className="mt-10 cv-dossier-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <p className="text-[14px] font-medium" style={{ color: 'var(--cv-ink)' }}>
              Have a project or a role in mind?
            </p>
            <button
              onClick={() => {
                toggleDrawer();
                toggleContact();
              }}
              className="cv-btn-primary h-10 px-4 text-[13px] font-semibold flex items-center justify-center gap-2 shrink-0"
            >
              <Send size={14} />
              Contact me
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
