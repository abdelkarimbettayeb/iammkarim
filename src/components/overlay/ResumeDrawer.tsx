'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Download,
  Briefcase,
  Award,
  Code2,
  MessageSquareQuote,
  ExternalLink,
  GraduationCap,
  Globe,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useRoomStore, roomStore } from '@/store/useRoomStore';
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

export function ResumeDrawer() {
  const isDrawerOpen = useRoomStore((state) => state.isDrawerOpen);
  const toggleDrawer = useRoomStore((state) => state.toggleDrawer);
  const toggleContact = useRoomStore((state) => state.toggleContact);

  const handleClose = React.useCallback(() => {
    toggleDrawer();
    roomStore.setActiveStation('none');
  }, [toggleDrawer]);

  React.useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, handleClose]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop scrim */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Radical Glassmorphic Slide-out Sheet (VisionOS / Dark Glass) */}
      <div className="relative w-full max-w-2xl glass-panel-master border-l border-white/[0.14] shadow-2xl h-full overflow-y-auto overflow-x-hidden text-white p-6 sm:p-10 animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="relative flex items-start justify-between pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded glass-pill mb-2">
              <span className="w-2 h-2 rounded bg-sky-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-300">
                Curriculum Vitae
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-primary font-bold mt-1 text-white tracking-tight">
              {personalInfo.name}
            </h2>
            <p className="text-xs sm:text-sm text-sky-300 font-secondary font-semibold mt-0.5">
              {personalInfo.role}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>{personalInfo.location}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">{personalInfo.availability}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={personalInfo.resumePdfUrl}
              target="_blank"
              className="px-3.5 py-2 rounded glass-btn-primary text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-md"
            >
              <Download size={14} />
              <span className="hidden sm:inline">PDF</span>
            </Link>
            <button
              onClick={handleClose}
              className="p-2.5 rounded glass-btn-secondary text-slate-300 hover:text-white transition-all flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 1. Professional Summary */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Briefcase size={15} className="text-amber-400" />
            <span>Professional Summary</span>
          </h3>
          <div className="glass-tile p-5 rounded border border-white/[0.08] space-y-2">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-paragraph">
              {personalInfo.bio}
            </p>
          </div>
        </div>

        {/* 2. Key Achievements Grid */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Award size={15} className="text-amber-400" />
            <span>Key Career Achievements</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded glass-tile flex flex-col justify-center transition-all"
              >
                <div className="text-xl sm:text-2xl font-primary font-bold text-amber-400 tracking-tight">
                  {item.number}
                </div>
                <div className="text-xs font-secondary font-medium text-slate-200 mt-1">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Work Experience */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Briefcase size={15} className="text-sky-400" />
            <span>Work Experience</span>
          </h3>
          <div className="space-y-4">
            {workExperience.map((exp, idx) => (
              <div
                key={idx}
                className="p-5 rounded glass-tile space-y-3 transition-all hover:border-white/[0.18]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/[0.06] pb-2.5">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                      {exp.role} <span className="text-sky-400 font-normal">| {exp.company}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">{exp.location} • {exp.type}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400/90 whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>

                <ul className="space-y-1.5 pt-1">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                      <span className="text-sky-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Education */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <GraduationCap size={15} className="text-emerald-400" />
            <span>Education</span>
          </h3>
          <div className="p-5 rounded glass-tile space-y-2 border border-white/[0.08]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-sm font-bold text-white">
                {education.degree}
              </h4>
              <span className="text-xs text-amber-400 font-bold">
                {education.period}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {education.institution} • {education.location}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold mt-2 border border-emerald-500/30">
              <Sparkles size={12} />
              <span>{education.honors}</span>
            </div>
          </div>
        </div>

        {/* 5. Core Tech Skills */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Code2 size={15} className="text-sky-400" />
            <span>Technical Skills</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {techSkills.map((skill) => (
              <div
                key={skill.name}
                className="p-4 rounded glass-tile flex flex-col justify-between transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white tracking-wide">{skill.name}</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: `${skill.color}25`,
                      color: skill.color,
                      borderColor: `${skill.color}45`,
                    }}
                  >
                    {skill.level}%
                  </span>
                </div>
                {skill.description && (
                  <p className="text-[11px] text-slate-300/80 mt-2 leading-relaxed font-paragraph">
                    {skill.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 6. Languages */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Globe size={15} className="text-amber-400" />
            <span>Languages</span>
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {languages.map((lang) => (
              <div key={lang.name} className="p-3.5 rounded glass-tile text-center">
                <div className="text-sm font-bold text-white">{lang.name}</div>
                <div className="text-[10px] text-sky-400 mt-0.5 font-semibold">{lang.nativeName}</div>
                <div className="text-[11px] text-slate-300 mt-1 font-medium">{lang.fluency}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Highlighted Projects */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Briefcase size={15} className="text-amber-400" />
            <span>Featured Production Systems</span>
          </h3>
          <div className="space-y-4">
            {Object.values(cartridgeProjects).map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded glass-tile space-y-3 transition-all hover:border-white/[0.18]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">{proj.title}</h4>
                    <p className="text-xs text-slate-300/80">{proj.subtitle}</p>
                  </div>
                  {proj.url && (
                    <Link
                      href={proj.url}
                      target="_blank"
                      className="p-2 rounded glass-btn-secondary text-sky-400 hover:text-white transition-all shrink-0"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  )}
                </div>

                <div className="space-y-1.5">
                  {proj.description.map((bullet, i) => (
                    <p key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                      <span className="text-sky-400 font-bold">•</span>
                      <span>{bullet}</span>
                    </p>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-white/[0.08]">
                  {proj.stack.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded glass-pill text-[10px] uppercase font-bold text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Client Testimonials */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <MessageSquareQuote size={15} className="text-amber-400" />
            <span>Client Recommendations</span>
          </h3>
          <div className="space-y-3">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-4 rounded glass-tile text-xs text-slate-200 leading-relaxed"
              >
                <p className="italic text-slate-300/90 font-paragraph text-sm leading-relaxed">&ldquo;{t.description}&rdquo;</p>
                <div className="mt-2.5 text-[11px] font-bold text-amber-400 flex items-center gap-2">
                  <span>{t.name}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-normal">{t.country}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Contact Action */}
        <div className="relative mt-10 pt-6 border-t border-white/[0.08] flex items-center justify-between gap-4">
          <button
            onClick={handleClose}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Close Resume
          </button>
          <button
            onClick={() => {
              toggleDrawer();
              toggleContact();
            }}
            className="px-5 py-2.5 rounded glass-pill-active text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            Contact Abdelkarim
          </button>
        </div>
      </div>
    </div>
  );
}
