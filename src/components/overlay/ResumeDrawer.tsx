'use client';

import React from 'react';
import Link from 'next/link';
import { X, Download, Briefcase, Award, Code2, MessageSquareQuote, ExternalLink } from 'lucide-react';
import { useRoomStore, roomStore } from '@/store/useRoomStore';
import { personalInfo, achievements, techSkills, cartridgeProjects } from '@/data/resumeData';

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

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop scrim */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => { toggleDrawer(); roomStore.setActiveStation('none'); }}
      />

      {/* Radical Glassmorphic Slide-out Sheet (VisionOS / Dark Glass) */}
      <div className="relative w-full max-w-2xl glass-panel-master border-l border-white/[0.14] shadow-2xl h-full overflow-y-auto overflow-x-hidden text-white p-6 sm:p-10 animate-in slide-in-from-right duration-300">
        {/* Ambient Decorative Diffused Lights */}
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none bg-blue-500" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none bg-amber-500" />

        {/* Header */}
        <div className="relative flex items-start justify-between pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill mb-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-300">
                Curriculum Vitae
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-primary font-bold mt-1 text-white tracking-tight">
              {personalInfo.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-0.5 font-secondary font-medium">
              {personalInfo.role} • {personalInfo.experienceYears} Years Experience
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={personalInfo.resumePdfUrl}
              target="_blank"
              className="px-3.5 py-2 rounded-xl glass-btn-primary text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105"
            >
              <Download size={14} />
              <span className="hidden sm:inline">PDF</span>
            </Link>
            <button
              onClick={toggleDrawer}
              className="p-2.5 rounded-xl glass-btn-secondary text-slate-300 hover:text-white transition-all flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 1. Who Am I */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Briefcase size={15} className="text-amber-400" />
            <span>Professional Summary</span>
          </h3>
          <div className="glass-tile p-5 rounded-2xl border border-white/[0.08]">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-paragraph">
              Full-stack web developer and experienced software engineer with over{' '}
              <strong className="text-amber-400 font-bold">9 years</strong> of hands-on experience.
              Specializing in high-performance web systems, reactive architectures, cloud integrations,
              and optimized computational modules.
            </p>
          </div>
        </div>

        {/* 2. Key Achievements Grid */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Award size={15} className="text-amber-400" />
            <span>Key Achievements</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-tile flex flex-col justify-center transition-all hover:scale-105"
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

        {/* 3. Core Tech Skills */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Code2 size={15} className="text-sky-400" />
            <span>Technical Skills</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {techSkills.map((skill) => (
              <div
                key={skill.name}
                className="p-4 rounded-2xl glass-tile flex flex-col justify-between transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white tracking-wide">{skill.name}</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
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

        {/* 4. Highlighted Projects */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Briefcase size={15} className="text-amber-400" />
            <span>Featured Production Projects</span>
          </h3>
          <div className="space-y-4">
            {Object.values(cartridgeProjects).map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl glass-tile space-y-3 transition-all hover:border-white/[0.18]"
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
                      className="p-2 rounded-xl glass-btn-secondary text-sky-400 hover:text-white transition-all shrink-0"
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
                      className="px-2.5 py-1 rounded-lg glass-pill text-[10px] uppercase font-bold text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Client Testimonials */}
        <div className="relative mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <MessageSquareQuote size={15} className="text-amber-400" />
            <span>Client Recommendations</span>
          </h3>
          <div className="space-y-3">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-tile text-xs text-slate-200 leading-relaxed"
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
            onClick={toggleDrawer}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Close Resume
          </button>
          <button
            onClick={() => {
              toggleDrawer();
              toggleContact();
            }}
            className="px-5 py-2.5 rounded-xl glass-pill-active text-slate-950 font-bold text-xs shadow-lg transition-all hover:scale-105"
          >
            Contact Abdelkarim
          </button>
        </div>
      </div>
    </div>
  );
}
