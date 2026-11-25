'use client';

import React from 'react';
import { X, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const serial = `PRJ—0${index + 1}`;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex items-end sm:items-center justify-center sm:justify-end p-3 sm:p-6 md:p-8">
      <div
        className="fixed inset-0 backdrop-blur-sm sm:hidden pointer-events-auto"
        style={{ backgroundColor: 'var(--cv-scrim)' }}
        onClick={handleClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        className="sheet-in pointer-events-auto cv-modal-sheet w-full sm:w-[460px] max-h-[86vh] sm:max-h-[calc(100vh-140px)] flex flex-col overflow-hidden"
      >
        {/* Top Metadata Chrome */}
        <div
          className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ borderBottom: '1px solid var(--cv-border)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="h-2.5 w-2.5 shrink-0"
              style={{ borderRadius: '9999px', backgroundColor: project.color }}
            />
            <span
              className="font-cv-mono text-[11px] font-semibold tracking-wider uppercase"
              style={{ color: 'var(--cv-accent)' }}
            >
              {serial}
            </span>
            <span style={{ color: 'var(--cv-ink-subtle)' }}>/</span>
            <span className="text-[12px] truncate" style={{ color: 'var(--cv-ink-muted)' }}>
              {project.subtitle}
            </span>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close"
            className="cv-icon-btn h-8 w-8 flex items-center justify-center shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div key={project.id} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {project.image && (
            <div className="cv-project-frame h-40 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <h2
              id="case-title"
              className="font-cv-display font-bold text-[24px] sm:text-[26px] leading-[1.1] tracking-[-0.02em]"
              style={{ color: 'var(--cv-ink)' }}
            >
              {project.title}
            </h2>

            <div
              className="mt-3 px-3.5 py-2.5 cv-radius-sm"
              style={{
                backgroundColor: 'var(--cv-surface)',
                border: '1px solid var(--cv-border)',
              }}
            >
              <span
                className="block font-cv-mono text-[9.5px] uppercase tracking-widest mb-0.5"
                style={{ color: 'var(--cv-ink-muted)' }}
              >
                Impact &amp; Metric
              </span>
              <p className="text-[13.5px] font-medium leading-snug" style={{ color: 'var(--cv-ink)' }}>
                {project.metrics}
              </p>
            </div>
          </div>

          <ol className="space-y-2.5">
            {project.description.map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[13px] leading-[1.6]"
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

          <div className="flex flex-wrap gap-1.5" aria-label="Tech stack">
            {project.stack.map((tech) => (
              <span key={tech} className="cv-chip px-2.5 py-1 font-cv-mono text-[10.5px] uppercase">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="shrink-0 px-4 py-3 flex items-center gap-2"
          style={{
            borderTop: '1px solid var(--cv-border)',
            backgroundColor: 'var(--cv-surface)',
          }}
        >
          <button
            onClick={() => step(-1)}
            aria-label="Previous project"
            className="cv-icon-btn h-9 w-9 flex items-center justify-center"
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className="font-cv-mono text-[11.5px] px-2 text-center cv-tabular"
            style={{ color: 'var(--cv-ink-muted)' }}
          >
            0{index + 1} / 0{ORDER.length}
          </span>
          <button
            onClick={() => step(1)}
            aria-label="Next project"
            className="cv-icon-btn h-9 w-9 flex items-center justify-center"
          >
            <ChevronRight size={16} />
          </button>

          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto cv-btn-primary h-9 px-4 text-[12.5px] font-semibold flex items-center gap-1.5"
            >
              <span>Open project</span>
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
