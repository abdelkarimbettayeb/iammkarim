'use client';

import React from 'react';
import Link from 'next/link';
import { X, Download, Briefcase, Award, Code2, MessageSquareQuote, ExternalLink } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={toggleDrawer}
      />

      {/* Slide-out Sheet */}
      <div className="relative w-full max-w-2xl bg-[#0B0F19] border-l border-slate-800 shadow-2xl h-full overflow-y-auto text-white p-6 sm:p-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-blue-400">
              Curriculum Vitae
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mt-1 text-white">
              {personalInfo.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {personalInfo.role} • {personalInfo.experienceYears} Years Experience
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={personalInfo.resumePdfUrl}
              target="_blank"
              className="p-2 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold px-3 border border-blue-500/30"
            >
              <Download size={14} />
              <span className="hidden sm:inline">PDF</span>
            </Link>
            <button
              onClick={toggleDrawer}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 1. Who Am I */}
        <div className="mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Briefcase size={14} className="text-amber-400" />
            <span>Professional Summary</span>
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Full-stack web developer and an experienced software engineer with over{' '}
            <strong className="text-amber-400 font-bold">9 years</strong> of hands-on experience.
            Specializing in high-performance web systems, reactive architectures, cloud integrations,
            and optimized computational modules.
          </p>
        </div>

        {/* 2. Key Achievements Grid */}
        <div className="mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Award size={14} className="text-amber-400" />
            <span>Key Achievements</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-center"
              >
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  {item.number}
                </div>
                <div className="text-xs font-bold text-slate-300 mt-0.5">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Core Tech Skills */}
        <div className="mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Code2 size={14} className="text-amber-400" />
            <span>Technical Skills</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {techSkills.map((skill) => (
              <div
                key={skill.name}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{skill.name}</span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${skill.color}20`, color: skill.color }}
                  >
                    {skill.level}%
                  </span>
                </div>
                {skill.description && (
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                    {skill.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Highlighted Projects */}
        <div className="mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Briefcase size={14} className="text-amber-400" />
            <span>Featured Production Projects</span>
          </h3>
          <div className="space-y-4">
            {Object.values(cartridgeProjects).map((proj) => (
              <div
                key={proj.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white">{proj.title}</h4>
                    <p className="text-xs text-slate-400">{proj.subtitle}</p>
                  </div>
                  {proj.url && (
                    <Link
                      href={proj.url}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors shrink-0"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  )}
                </div>

                <div className="space-y-1">
                  {proj.description.map((bullet, i) => (
                    <p key={i} className="text-xs text-slate-300 leading-relaxed">
                      • {bullet}
                    </p>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  {proj.stack.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-bold text-slate-300"
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
        <div className="mt-8">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <MessageSquareQuote size={14} className="text-amber-400" />
            <span>Client Recommendations</span>
          </h3>
          <div className="space-y-3">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 leading-relaxed"
              >
                <p>&ldquo;{t.description}&rdquo;</p>
                <div className="mt-2 text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <span>{t.name}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-normal">{t.country}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Contact Action */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
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
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            Contact Abdelkarim
          </button>
        </div>
      </div>
    </div>
  );
}

