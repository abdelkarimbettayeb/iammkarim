'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Box,
  Check,
  Command,
  Copy,
  Download,
  Github,
  Linkedin,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { cartridgeProjects, personalInfo } from '@/data/resumeData';
import type { CartridgeId } from '@/types/room';

export type CommandSectionId = 'hero' | 'experience' | 'projects' | 'skills' | 'contact';

interface CommandItem {
  id: string;
  group: 'Case Studies' | 'Sections & 3D' | 'Quick Actions';
  label: string;
  detail: string;
  keywords: string;
  dotColor?: string;
  icon?: React.ReactNode;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigateSection: (id: CommandSectionId) => void;
  onOpenProject: (id: CartridgeId) => void;
  onCopyEmail: () => void;
  emailCopied: boolean;
  onToggleTheme: () => void;
  isDark: boolean;
  onEnterRoom: () => void;
}

const PROJECT_ORDER: CartridgeId[] = ['jud', 'alnurayn', 'dentist', 'freelance', 'mouser', 'meuble', 'algmath'];

export function CommandPalette({
  open,
  onClose,
  onNavigateSection,
  onOpenProject,
  onCopyEmail,
  emailCopied,
  onToggleTheme,
  isDark,
  onEnterRoom,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [rawSelectedIdx, setRawSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const raf = window.requestAnimationFrame(() => {
      setQuery('');
      setRawSelectedIdx(0);
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const projectItems: CommandItem[] = PROJECT_ORDER.map((id, idx) => {
      const proj = cartridgeProjects[id];
      return {
        id: `prj-${id}`,
        group: 'Case Studies',
        label: proj.title,
        detail: `PRJ-0${idx + 1} · ${proj.subtitle}`,
        keywords: `${proj.title} ${proj.subtitle} ${proj.stack.join(' ')}`,
        dotColor: proj.color,
        run: () => {
          onOpenProject(id);
          onClose();
        },
      };
    });

    const sectionItems: CommandItem[] = [
      {
        id: 'sec-hero',
        group: 'Sections & 3D',
        label: '01 · Overview & 3D Desk',
        detail: 'Intro, metrics & interactive Atelier stage',
        keywords: 'overview hero intro home 3d desk',
        run: () => {
          onNavigateSection('hero');
          onClose();
        },
      },
      {
        id: 'sec-exp',
        group: 'Sections & 3D',
        label: '02 · Career Experience',
        detail: 'Jud, Alnurayn, Mostaql & M.Sc. CS',
        keywords: 'experience resume career education degree',
        run: () => {
          onNavigateSection('experience');
          onClose();
        },
      },
      {
        id: 'sec-prj',
        group: 'Sections & 3D',
        label: '03 · Selected Work',
        detail: 'Interactive project spotlight cards',
        keywords: 'work projects portfolio spotlight',
        run: () => {
          onNavigateSection('projects');
          onClose();
        },
      },
      {
        id: 'sec-skills',
        group: 'Sections & 3D',
        label: '04 · Systems Stack & Endorsements',
        detail: 'Skills matrix & 5.0★ client testimonials',
        keywords: 'skills stack typescript react node cpp testimonials reviews',
        run: () => {
          onNavigateSection('skills');
          onClose();
        },
      },
      {
        id: 'sec-contact',
        group: 'Sections & 3D',
        label: '05 · Contact & Dispatch',
        detail: 'Send message or view direct channels',
        keywords: 'contact email message whatsapp hire',
        run: () => {
          onNavigateSection('contact');
          onClose();
        },
      },
      {
        id: 'go-room',
        group: 'Sections & 3D',
        label: 'Enter 3D Room World',
        detail: 'Full isometric interactive room (/room)',
        keywords: '3d room world diorama isometric explore',
        icon: <Box size={14} style={{ color: 'var(--cv-accent)' }} />,
        run: () => {
          onClose();
          onEnterRoom();
        },
      },
    ];

    const actionItems: CommandItem[] = [
      {
        id: 'act-email',
        group: 'Quick Actions',
        label: emailCopied ? 'Email Copied to Clipboard' : 'Copy Email Address',
        detail: personalInfo.email,
        keywords: 'copy email mailto contact address',
        icon: emailCopied ? (
          <Check size={14} style={{ color: 'var(--cv-live)' }} />
        ) : (
          <Copy size={14} />
        ),
        run: () => {
          onCopyEmail();
          onClose();
        },
      },
      {
        id: 'act-theme',
        group: 'Quick Actions',
        label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        detail: isDark ? 'Studio white surface' : 'Graphite dark surface',
        keywords: 'theme light dark mode appearance',
        icon: isDark ? <Sun size={14} /> : <Moon size={14} />,
        run: () => {
          onToggleTheme();
          onClose();
        },
      },
      {
        id: 'act-cv',
        group: 'Quick Actions',
        label: 'Download Resume PDF',
        detail: 'Print-ready CV (Resume.pdf)',
        keywords: 'download resume cv pdf',
        icon: <Download size={14} />,
        run: () => {
          window.open(personalInfo.resumePdfUrl, '_blank', 'noopener,noreferrer');
          onClose();
        },
      },
      {
        id: 'act-github',
        group: 'Quick Actions',
        label: 'Open GitHub Profile',
        detail: 'github.com/xnevz',
        keywords: 'github code open source xnevz',
        icon: <Github size={14} />,
        run: () => {
          window.open(personalInfo.githubUrl, '_blank', 'noopener,noreferrer');
          onClose();
        },
      },
      {
        id: 'act-linkedin',
        group: 'Quick Actions',
        label: 'Open LinkedIn Profile',
        detail: 'linkedin.com/in/karimbettayeb',
        keywords: 'linkedin profile social network',
        icon: <Linkedin size={14} />,
        run: () => {
          window.open(personalInfo.linkedinUrl, '_blank', 'noopener,noreferrer');
          onClose();
        },
      },
    ];

    return [...projectItems, ...sectionItems, ...actionItems];
  }, [
    emailCopied,
    isDark,
    onClose,
    onCopyEmail,
    onEnterRoom,
    onNavigateSection,
    onOpenProject,
    onToggleTheme,
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    );
  }, [items, query]);

  const activeIdx = Math.min(rawSelectedIdx, Math.max(0, filtered.length - 1));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setRawSelectedIdx((prev) =>
          filtered.length ? (Math.min(prev, filtered.length - 1) + 1) % filtered.length : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setRawSelectedIdx((prev) =>
          filtered.length
            ? (Math.min(prev, filtered.length - 1) - 1 + filtered.length) % filtered.length
            : 0
        );
      } else if (e.key === 'Enter' && filtered[activeIdx]) {
        e.preventDefault();
        filtered[activeIdx].run();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIdx, filtered, onClose, open]);

  if (!open) return null;

  const groups: CommandItem['group'][] = ['Case Studies', 'Sections & 3D', 'Quick Actions'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12dvh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div
        className="fixed inset-0 backdrop-blur-sm transition-opacity"
        style={{ backgroundColor: 'var(--cv-scrim)' }}
        onClick={onClose}
      />

      <div className="cv-modal-sheet relative z-10 w-full max-w-[560px] overflow-hidden flex flex-col max-h-[70dvh]">
        {/* Search Bar */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--cv-border)' }}
        >
          <Search size={16} style={{ color: 'var(--cv-accent)' }} className="shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setRawSelectedIdx(0);
            }}
            placeholder="Search case studies, sections, or actions…"
            className="w-full bg-transparent text-[14px] focus:outline-none"
            style={{ color: 'var(--cv-ink)' }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="cv-icon-btn h-7 w-7 flex items-center justify-center shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-[13px]" style={{ color: 'var(--cv-ink-muted)' }}>
              No matching commands for &ldquo;{query}&rdquo;
            </div>
          ) : (
            groups.map((group) => {
              const groupItems = filtered.filter((i) => i.group === group);
              if (groupItems.length === 0) return null;
              return (
                <div key={group}>
                  <div
                    className="px-2.5 pb-1 font-cv-mono text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--cv-ink-muted)' }}
                  >
                    {group}
                  </div>
                  <div className="space-y-0.5">
                    {groupItems.map((item) => {
                      const flatIdx = filtered.indexOf(item);
                      const isSelected = flatIdx === activeIdx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setRawSelectedIdx(flatIdx)}
                          onClick={item.run}
                          className="w-full px-3 py-2 cv-radius-sm flex items-center justify-between gap-3 text-left transition-colors"
                          style={{
                            backgroundColor: isSelected ? 'var(--cv-surface)' : 'transparent',
                            border: isSelected
                              ? '1px solid var(--cv-border)'
                              : '1px solid transparent',
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.dotColor ? (
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.dotColor }}
                              />
                            ) : (
                              <span
                                className="h-5 w-5 flex items-center justify-center shrink-0"
                                style={{ color: 'var(--cv-ink-secondary)' }}
                              >
                                {item.icon ?? <Command size={13} />}
                              </span>
                            )}
                            <div className="min-w-0">
                              <div
                                className="text-[13px] font-semibold truncate"
                                style={{ color: 'var(--cv-ink)' }}
                              >
                                {item.label}
                              </div>
                              <div
                                className="text-[11px] truncate"
                                style={{ color: 'var(--cv-ink-muted)' }}
                              >
                                {item.detail}
                              </div>
                            </div>
                          </div>

                          <ArrowRight
                            size={13}
                            className="shrink-0 transition-opacity"
                            style={{
                              color: 'var(--cv-accent)',
                              opacity: isSelected ? 1 : 0,
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard Hint Footer */}
        <div
          className="px-4 py-2 flex items-center justify-between font-cv-mono text-[10px] shrink-0"
          style={{
            borderTop: '1px solid var(--cv-border)',
            backgroundColor: 'var(--cv-surface)',
            color: 'var(--cv-ink-muted)',
          }}
        >
          <span>↑↓ Navigate · ↵ Run · Esc Close</span>
          <span>⌘K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}
