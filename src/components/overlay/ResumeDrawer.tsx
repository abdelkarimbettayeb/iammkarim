'use client';

import React from 'react';
import { X, Download, ExternalLink, Send, GraduationCap } from 'lucide-react';
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
  return <h3 className="font-primary font-semibold text-[19px] tracking-[-0.01em] text-white mb-4">{children}</h3>;
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

  // Jump to the section that was asked for (nav bar, skill badges, the photo...)
  const drawerSection = useExplore((st) => st.drawerSection);
  React.useEffect(() => {
    // Forget it once the drawer closes, so a plain "Resume" opens at the top
    if (!isDrawerOpen) exploreStore.clearDrawerSection();
    if (!isDrawerOpen || !drawerSection) return;
    const id = window.setTimeout(() => {
      document.getElementById(`resume-${drawerSection}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
    return () => window.clearTimeout(id);
  }, [isDrawerOpen, drawerSection]);

  // Highlight the tab for the section being read
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
    <div className="hud fixed inset-0 z-50 flex justify-end">
      <div
        className="scrim-in absolute inset-0 bg-[linear-gradient(90deg,rgb(3_7_18/0.15),rgb(3_7_18/0.6))] backdrop-blur-[2px]"
        onClick={handleClose}
      />

      <aside
        aria-label="Resume"
        className="sheet-in relative glass-panel-master w-full sm:w-[min(680px,92vw)] h-full sm:h-[calc(100%-24px)] sm:my-3 sm:mr-3 flex flex-col overflow-hidden"
        style={{ '--a1': '#5cc8ff', '--a2': '#8b7cff', '--a3': '#ffb547' } as React.CSSProperties}
      >
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>

        {/* Sticky header: who, actions, and the section switcher */}
        <header className="relative shrink-0 px-5 sm:px-8 pt-5 sm:pt-7 border-b border-white/10 bg-[rgb(14_23_38/0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-primary font-bold text-[28px] sm:text-[34px] leading-[1.02] tracking-[-0.025em] text-glow-gradient">
                {personalInfo.name}
              </h2>
              <p className="mt-1.5 text-[13.5px] text-slate-200">{personalInfo.role}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={personalInfo.resumePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 glass-btn-secondary text-[12.5px] text-slate-100 flex items-center gap-1.5"
              >
                <Download size={14} />
                <span className="hidden sm:inline">PDF</span>
              </a>
              <button onClick={handleClose} aria-label="Close resume" className="h-9 w-9 glass-btn-secondary text-slate-200 flex items-center justify-center">
                <X size={17} />
              </button>
            </div>
          </div>

          <nav aria-label="Resume sections" className="mt-4 -mx-1 flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => goTo(t.id)}
                aria-current={current === t.id ? 'true' : undefined}
                className={`relative shrink-0 px-3 pb-3 pt-1 text-[13px] transition-colors duration-200 ${
                  current === t.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
                <span
                  className={`absolute left-3 right-3 bottom-0 h-[2px] bg-[linear-gradient(90deg,var(--sky),var(--dusk))] transition-transform duration-300 origin-left ${
                    current === t.id ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            ))}
          </nav>
        </header>

        <div ref={scrollRef} className="relative flex-1 overflow-y-auto overscroll-contain px-5 sm:px-8 pb-10">
          {/* About */}
          <section id="resume-summary" className="pt-7 scroll-mt-4">
            <p className="text-[15px] sm:text-[16px] leading-[1.65] text-slate-100 max-w-[62ch]">{personalInfo.bio}</p>
            <p className="mt-3 text-[13px] text-emerald-300 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" />
              {personalInfo.availability}, based in {personalInfo.location}
            </p>
          </section>

          {/* Numbers */}
          <section id="resume-achievements" className="mt-7 scroll-mt-4" aria-label="Career numbers">
            <dl className="glass-tile grid grid-cols-2 sm:grid-cols-3 overflow-hidden">
              {achievements.map((a) => (
                <div key={a.title} className="px-4 py-4 shadow-[inset_-1px_-1px_0_rgba(255,255,255,0.07)]">
                  <dt className="sr-only">{a.title}</dt>
                  <dd className="font-primary font-bold text-[26px] leading-none tracking-[-0.02em] text-glow-gradient">{a.number}</dd>
                  <dd className="mt-1.5 text-[12px] text-slate-300 leading-snug">{a.title}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Experience: it's a sequence, so it's a timeline */}
          <section id="resume-experience" className="pt-10 scroll-mt-4">
            <SectionTitle>Experience</SectionTitle>
            <ol className="relative border-l border-white/15 ml-1.5 space-y-7">
              {workExperience.map((exp) => (
                <li key={exp.role + exp.company} className="relative pl-6">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded bg-[linear-gradient(135deg,var(--sky),var(--dusk))] shadow-[0_0_12px_rgba(92,200,255,0.7)]" />
                  <p className="text-[12px] text-sky-300 tabular-nums">{exp.period}</p>
                  <h4 className="mt-0.5 text-[15.5px] font-semibold text-white leading-snug">
                    {exp.role}, <span className="text-slate-300 font-normal">{exp.company}</span>
                  </h4>
                  <p className="text-[12px] text-slate-400">
                    {exp.location}, {exp.type.toLowerCase()}
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {exp.highlights.map((h) => (
                      <li key={h} className="text-[13.5px] leading-relaxed text-slate-300 max-w-[64ch]">
                        {h}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          {/* Skills as meters */}
          <section id="resume-skills" className="pt-10 scroll-mt-4">
            <SectionTitle>Skills</SectionTitle>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {techSkills.map((skill, i) => (
                <li key={skill.name}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13.5px] font-medium text-white">{skill.name}</span>
                    <span className="text-[12px] tabular-nums text-slate-400">{skill.level}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded bg-white/[0.08] overflow-hidden">
                    <div
                      className="meter-fill h-full rounded"
                      style={{
                        width: `${skill.level}%`,
                        background: `linear-gradient(90deg, ${skill.color}88, ${skill.color})`,
                        boxShadow: `0 0 10px ${skill.color}66`,
                        animationDelay: `${120 + i * 35}ms`,
                      }}
                    />
                  </div>
                  {skill.description && <p className="mt-1.5 text-[12px] leading-snug text-slate-400">{skill.description}</p>}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-2" aria-label="Languages">
              {languages.map((lang) => (
                <span key={lang.name} className="glass-pill px-3 py-1.5 text-[12.5px] text-slate-200">
                  <span className="text-white font-medium">{lang.name}</span>
                  <span className="text-slate-400">, {lang.fluency.toLowerCase()}</span>
                </span>
              ))}
            </div>
          </section>

          {/* Projects: each opens its case study */}
          <section id="resume-projects" className="pt-10 scroll-mt-4">
            <SectionTitle>Projects</SectionTitle>
            <ul className="space-y-3">
              {Object.values(cartridgeProjects).map((proj) => (
                <li key={proj.id} className="glass-tile p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded shrink-0" style={{ background: proj.color, boxShadow: `0 0 12px ${proj.color}` }} />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[15px] font-semibold text-white leading-snug">{proj.title}</h4>
                      <p className="text-[12px] text-slate-400">{proj.subtitle}</p>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-slate-300">{proj.metrics}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            toggleDrawer();
                            roomStore.setActiveCartridge(proj.id);
                          }}
                          className="h-8 px-3 glass-btn-secondary text-[12.5px] text-white"
                        >
                          Read the case study
                        </button>
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 px-3 text-[12.5px] text-sky-300 hover:text-sky-200 flex items-center gap-1.5"
                          >
                            Open project <ExternalLink size={12} />
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
              <div className="h-11 w-11 shrink-0 rounded glass-pill flex items-center justify-center text-amber-300">
                <GraduationCap size={20} />
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-white leading-snug">{education.degree}</h4>
                <p className="text-[13px] text-slate-300">
                  {education.institution}, {education.location}
                </p>
                <p className="text-[12px] text-slate-400 tabular-nums">{education.period}</p>
                <p className="mt-2 text-[13px] text-amber-200">{education.honors}</p>
              </div>
            </div>
          </section>

          {/* What clients say */}
          <section className="pt-10" aria-label="Client recommendations">
            <SectionTitle>What clients say</SectionTitle>
            <div className="space-y-6">
              {testimonials.map((t) => (
                <figure key={t.name} className="relative pl-5 border-l-2 border-amber-300/60">
                  <blockquote className="text-[14.5px] leading-relaxed text-slate-100 max-w-[62ch]">{t.description}</blockquote>
                  <figcaption className="mt-2 text-[12.5px] text-slate-400">
                    <span className="text-amber-200">{t.name}</span>, {t.country}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* One clear next step */}
          <div className="mt-12 glass-tile p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[14px] text-slate-200">Have a project or a role in mind?</p>
            <button
              onClick={() => {
                toggleDrawer();
                toggleContact();
              }}
              className="h-10 px-4 glass-btn-primary text-[13.5px] font-semibold flex items-center justify-center gap-2"
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
