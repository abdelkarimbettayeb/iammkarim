'use client';

import React from 'react';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRoomStore, roomStore } from '@/store/useRoomStore';
import { cartridgeProjects } from '@/data/resumeData';
import type { CartridgeId } from '@/types/room';

const ORDER = Object.keys(cartridgeProjects) as CartridgeId[];

export function CaseStudyModal() {
  const activeCartridge = useRoomStore((state) => state.activeCartridge);
  const setActiveCartridge = useRoomStore((state) => state.setActiveCartridge);
  const setActiveZone = useRoomStore((state) => state.setActiveZone);

  const handleClose = React.useCallback(() => {
    setActiveCartridge(null);
    setActiveZone('overview');
    roomStore.setActiveStation('none');
  }, [setActiveCartridge, setActiveZone]);

  const step = React.useCallback(
    (dir: 1 | -1) => {
      if (!activeCartridge) return;
      const i = ORDER.indexOf(activeCartridge);
      setActiveCartridge(ORDER[(i + dir + ORDER.length) % ORDER.length]);
    },
    [activeCartridge, setActiveCartridge]
  );

  React.useEffect(() => {
    if (!activeCartridge) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeCartridge, handleClose, step]);

  if (!activeCartridge) return null;
  const project = cartridgeProjects[activeCartridge];
  if (!project) return null;
  const index = ORDER.indexOf(activeCartridge);

  return (
    <div className="hud fixed inset-0 z-40 pointer-events-none flex items-end sm:items-center justify-center sm:justify-end p-3 sm:p-6 md:p-8">
      {/* Phones get a scrim; on larger screens the room stays visible beside the pane */}
      <div className="scrim-in fixed inset-0 bg-[rgb(3_7_18/0.45)] sm:hidden pointer-events-auto" onClick={handleClose} />

      <section
        aria-labelledby="case-title"
        className="sheet-in pointer-events-auto glass-panel-master w-full sm:w-[440px] max-h-[86vh] sm:max-h-[calc(100vh-180px)] flex flex-col overflow-hidden"
        style={{ '--a1': project.color, '--a2': '#8b7cff', '--a3': project.color } as React.CSSProperties}
      >
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>

        {/* Screenshot, framed like a pane in a window */}
        {project.image && (
          <div className="relative h-40 sm:h-44 shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={project.id}
              src={project.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-105 animate-in fade-in zoom-in-105 duration-700"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,23,38,0.15)_0%,rgba(14,23,38,0.55)_45%,rgba(14,23,38,0.96)_85%)]" />
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-3 right-3 h-9 w-9 glass-btn-secondary backdrop-blur-md bg-black/25 text-white flex items-center justify-center"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {!project.image && (
          <button onClick={handleClose} aria-label="Close" className="absolute top-3 right-3 z-[3] h-9 w-9 glass-btn-secondary text-white flex items-center justify-center">
            <X size={17} />
          </button>
        )}

        <div
          key={project.id}
          className={`relative px-5 sm:px-6 pb-5 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-500 ${project.image ? '-mt-10' : 'pt-6'}`}
        >
          <p className="text-[12px] text-slate-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded shrink-0" style={{ background: project.color, boxShadow: `0 0 12px ${project.color}` }} />
            {project.subtitle}
          </p>
          <h2 id="case-title" className="font-primary font-bold text-[26px] leading-[1.1] tracking-[-0.02em] text-white mt-1.5">
            {project.title}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-white/90">{project.metrics}</p>

          <ul className="mt-4 space-y-2.5">
            {project.description.map((line, i) => (
              <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-slate-300">
                <span className="mt-[9px] h-px w-3 shrink-0" style={{ background: project.color }} />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech stack">
            {project.stack.map((tech) => (
              <span key={tech} className="px-2.5 py-1 glass-pill text-[11.5px] text-slate-200">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Footer: browse the other projects without leaving the pane */}
        <div className="relative shrink-0 border-t border-white/10 px-3 sm:px-4 py-3 flex items-center gap-2">
          <button onClick={() => step(-1)} aria-label="Previous project" className="h-10 w-10 glass-btn-secondary text-slate-200 flex items-center justify-center">
            <ChevronLeft size={18} />
          </button>
          <span className="text-[12px] text-slate-400 tabular-nums w-10 text-center">
            {index + 1} of {ORDER.length}
          </span>
          <button onClick={() => step(1)} aria-label="Next project" className="h-10 w-10 glass-btn-secondary text-slate-200 flex items-center justify-center">
            <ChevronRight size={18} />
          </button>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto h-10 px-4 glass-btn-primary text-[13px] font-semibold flex items-center gap-2"
            >
              Open project
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
