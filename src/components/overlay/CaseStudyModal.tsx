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
      {/* Backdrop scrim on mobile */}
      <div
        className="fixed inset-0 bg-black/50 md:hidden pointer-events-auto"
        onClick={handleClose}
      />

      {/* Floating Glass Case Study Card */}
      <div className="relative pointer-events-auto w-full max-w-lg bg-[#0F172A]/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7 text-white animate-in slide-in-from-right duration-300">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-[11px] uppercase font-bold tracking-widest text-sky-400">
                Active Cartridge
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
              {project.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{project.subtitle}</p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Highlighted Metric Banner */}
        <div
          className="mt-4 p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold"
          style={{
            backgroundColor: `${project.color}15`,
            borderColor: `${project.color}40`,
            color: project.color,
          }}
        >
          <Sparkles size={16} className="shrink-0" />
          <span>{project.metrics}</span>
        </div>

        {/* Description Bullets */}
        <div className="mt-5 space-y-2.5">
          {project.description.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </div>
          ))}
        </div>

        {/* Tech Stack Tags */}
        <div className="mt-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Tech Stack Architecture
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] font-bold uppercase text-slate-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-7 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            ← Back to Room
          </button>

          {project.url && (
            <Link
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
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
