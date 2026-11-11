'use client';

import React from 'react';
import { Compass, Code2, Briefcase, Monitor, Mail } from 'lucide-react';
import { roomStore, useRoomStore } from '@/store/useRoomStore';
import { exploreStore } from '@/store/exploreStore';
import type { RoomZone } from '@/types/room';

interface NavItem {
  id: RoomZone;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** What the button actually does */
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
    // He walks to the desk, sits down and the case studies open on arrival
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

  // The amber lens glides to whichever section is active
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
      className="hud fixed left-1/2 -translate-x-1/2 z-30 pointer-events-auto bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6"
    >
      <div className="hud-in glass-panel-master p-1.5 flex items-center gap-1 font-secondary">
        {lens && (
          <span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 glass-pill-active transition-[left,width] duration-500 ease-[cubic-bezier(0.2,0.9,0.25,1.12)] z-0"
            style={{ left: lens.left, width: lens.width }}
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
              className={`relative z-[3] flex items-center gap-2 h-10 px-3 sm:px-4 rounded text-[13px] font-medium transition-colors duration-300 select-none ${
                isActive ? 'text-[#1a1206]' : 'text-slate-200 hover:text-white'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
