'use client';

import React from 'react';
import Link from 'next/link';
import { X, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { cartridgeProjects } from '@/data/resumeData';

export function CaseStudyModal() {
  const activeCartridge = useRoomStore((state) => state.activeCartridge);
  const setActiveCartridge = useRoomStore((state) => state.setActiveCartridge);
  const setActiveZone = useRoomStore((state) => state.setActiveZone);

  if (!activeCartridge) return null;

  const project = cartridgeProjects[activeCartridge];
  if (!project) return null;

  const handleClose = () => {
    setActiveCartridge(null);
    setActiveZone('overview');
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-end p-4 md:p-8">
      {/* Subtle backdrop scrim on mobile */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden pointer-events-auto"
        onClick={handleClose}
      />

      {/* Radical Glassmorphic Case Study Panel (VisionOS / Refined Dark Glass) */}
      <div className="relative pointer-events-auto w-full max-w-lg glass-panel-master rounded-[28px] p-6 sm:p-8 text-white animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Ambient Project Glow Orbs behind the frosted glass */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: project.color }}
        />
        <div className="absolute -bottom-20 -left-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none bg-sky-500" />

        {/* Header Section */}
        <div className="relative flex items-start justify-between gap-4">
          <div>
            {/* Glass Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill mb-2">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: project.color }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: project.color }}
                />
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-300">
                Active Cartridge
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
              {project.title}
            </h2>
            <p className="text-xs text-slate-300/90 mt-0.5 font-medium">
              {project.subtitle}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2.5 rounded-xl glass-btn-secondary text-slate-300 hover:text-white transition-all flex items-center justify-center shrink-0"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Highlighted Metric Banner (Glass Tile with Colored Accents) */}
        <div
          className="relative mt-5 p-3.5 rounded-2xl glass-tile flex items-center gap-3 border transition-all"
          style={{
            borderColor: `${project.color}35`,
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{
              backgroundColor: `${project.color}25`,
              color: project.color,
            }}
          >
            <Sparkles size={16} />
          </div>
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-white">
            {project.metrics}
          </span>
        </div>

        {/* Description Section (Inner Glass Cards) */}
        <div className="relative mt-5 space-y-2.5">
          {project.description.map((bullet, idx) => (
            <div
              key={idx}
              className="glass-tile rounded-2xl p-3.5 flex items-start gap-3 text-xs sm:text-sm text-slate-200 transition-all hover:translate-x-1"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={13} />
              </div>
              <span className="leading-relaxed">{bullet}</span>
            </div>
          ))}
        </div>

        {/* Tech Stack Architecture Pills */}
        <div className="relative mt-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <span>Tech Stack Architecture</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-xl glass-pill text-[11px] font-bold uppercase text-slate-200 tracking-wide transition-all hover:scale-105"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="relative mt-7 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl glass-btn-secondary text-slate-300 font-bold text-xs transition-all hover:text-white"
          >
            ← Back to Room
          </button>

          {project.url && (
            <Link
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl glass-btn-primary text-white font-bold text-xs flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Visit Live Project</span>
              <ExternalLink size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
