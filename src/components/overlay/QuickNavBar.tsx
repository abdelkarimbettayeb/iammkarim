'use client';

import React from 'react';
import { Compass, Code2, Briefcase, Monitor, Mail } from 'lucide-react';
import { roomStore, useRoomStore } from '@/store/useRoomStore';
import { exploreStore } from '@/store/exploreStore';
import type { RoomZone } from '@/types/room';

interface NavItem {
  id: RoomZone;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  run: () => void;
}

/** Close whatever panel is open so the next one has the stage */
function closePanels() {
  const s = roomStore.getState();
  if (s.isDrawerOpen) roomStore.toggleDrawer();
  if (s.isContactOpen) roomStore.toggleContact();
  if (s.activeCartridge) roomStore.setActiveCartridge(null);
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Explore',
    icon: Compass,
    run: () => {
      closePanels();
      roomStore.setActiveStation('none');
    },
  },
  {
    id: 'workstation',
    label: 'Projects',
    icon: Monitor,
    run: () => {
      closePanels();
      roomStore.setActiveStation('workstation');
    },
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: Code2,
    run: () => {
      if (roomStore.getState().isContactOpen) roomStore.toggleContact();
      exploreStore.openDrawer('skills');
    },
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: Briefcase,
    run: () => {
      if (roomStore.getState().isContactOpen) roomStore.toggleContact();
      exploreStore.openDrawer('experience');
    },
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: Mail,
    run: () => {
      const s = roomStore.getState();
      if (s.isDrawerOpen) roomStore.toggleDrawer();
      if (!s.isContactOpen) roomStore.toggleContact();
    },
  },
];

export function QuickNavBar() {
  const activeZone = useRoomStore((state) => state.activeZone);
  const setActiveZone = useRoomStore((state) => state.setActiveZone);
  const buttons = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const [lens, setLens] = React.useState<{ left: number; width: number } | null>(null);

  React.useLayoutEffect(() => {
    const measure = () => {
      const el = buttons.current[activeZone];
      if (el) setLens({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeZone]);

  return (
    <nav
      aria-label="Sections"
      className="fixed left-1/2 -translate-x-1/2 z-30 pointer-events-auto bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6"
    >
      <div className="cv-hud-pill relative p-1.5 flex items-center gap-1">
        {lens && (
          <span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 cv-radius-pill transition-[left,width] duration-300 z-0"
            style={{
              left: lens.left,
              width: lens.width,
              backgroundColor: 'var(--cv-ink)',
            }}
          />
        )}
        {NAV_ITEMS.map(({ id, label, icon: Icon, run }) => {
          const isActive = activeZone === id;
          return (
            <button
              key={id}
              ref={(el) => {
                buttons.current[id] = el;
              }}
              onClick={() => {
                setActiveZone(id);
                run();
              }}
              title={label}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className="relative z-[3] flex items-center gap-2 h-10 px-3 sm:px-4 cv-radius-pill text-[12.5px] font-medium transition-colors duration-200 select-none"
              style={{
                color: isActive ? 'var(--cv-bg)' : 'var(--cv-ink-secondary)',
              }}
            >
              <Icon
                size={15}
                className="shrink-0"
                style={{ color: isActive ? 'var(--cv-accent)' : 'currentColor' }}
              />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
