'use client';

import React from 'react';
import { Compass, Code2, Gamepad2, Monitor, Mail } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import type { RoomZone } from '@/types/room';

interface NavItem {
  id: RoomZone;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'skills', label: 'Skills', icon: Code2 },
  { id: 'experience', label: 'Experience', icon: Gamepad2 },
  { id: 'workstation', label: 'Workstation', icon: Monitor },
  { id: 'contact', label: 'Contact', icon: Mail },
];

export function QuickNavBar() {
  const activeZone = useRoomStore((state) => state.activeZone);
  const setActiveZone = useRoomStore((state) => state.setActiveZone);
  const isContactOpen = useRoomStore((state) => state.isContactOpen);
  const toggleContact = useRoomStore((state) => state.toggleContact);

  const handleNavClick = (id: RoomZone) => {
    setActiveZone(id);
    if (id === 'contact' && !isContactOpen) {
      toggleContact();
    } else if (id !== 'contact' && isContactOpen) {
      toggleContact();
    }
  };

  return (
    <nav aria-label="Room sections" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      {/* Segmented dock */}
      <div className="glass-panel-master p-1 rounded flex items-center gap-1 font-secondary">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeZone === id;
          return (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded text-xs font-medium transition-colors select-none ${
                isActive
                  ? 'glass-pill-active text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-slate-950' : 'text-slate-300'} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
