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

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <div className="bg-[#0B0F19]/90 backdrop-blur-xl border border-slate-700/70 p-1.5 rounded-2xl shadow-2xl shadow-black/80 flex items-center gap-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeZone === id;
          return (
            <button
              key={id}
              onClick={() => setActiveZone(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all select-none ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
