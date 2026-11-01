'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Volume2, VolumeX, Sun, Moon, FileText } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';

export function TopHeader() {
  const isMuted = useRoomStore((state) => state.isMuted);
  const toggleMute = useRoomStore((state) => state.toggleMute);
  const isNightMode = useRoomStore((state) => state.isNightMode);
  const toggleNightMode = useRoomStore((state) => state.toggleNightMode);
  const toggleDrawer = useRoomStore((state) => state.toggleDrawer);
  const { theme, setTheme } = useTheme();

  const handleMuteClick = () => {
    toggleMute();
    if (isMuted) {
      setTimeout(() => playSound('chime'), 50);
    }
  };

  const handleThemeClick = () => {
    playSound('lamp');
    toggleNightMode();
    if (setTheme) {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <header className="fixed top-4 inset-x-4 md:inset-x-8 z-30 pointer-events-none flex items-center justify-between">
      {/* 1. Brand & Title Glass Badge */}
      <div className="pointer-events-auto glass-panel-subtle px-4 py-2.5 rounded-2xl flex items-center gap-3 select-none transition-all duration-300 hover:scale-[1.01]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-lg flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)] border border-white/20">
          B
        </div>
        <div>
          <h1 className="text-sm font-black tracking-wide text-white flex items-center gap-2">
            <span>Abdelkarim Bettayeb</span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              9+ Yrs Exp
            </span>
          </h1>
          <p className="text-[11px] text-slate-300/80 font-medium line-clamp-1">
            3D Isometric Interactive Portfolio
          </p>
        </div>
      </div>

      {/* 2. Glass Controls & Actions */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        {/* Audio Mute/Unmute Glass Toggle */}
        <button
          onClick={handleMuteClick}
          title={isMuted ? 'Unmute 3D Audio' : 'Mute 3D Audio'}
          className={`h-10 px-3.5 rounded-xl flex items-center gap-2 transition-all duration-200 select-none ${
            isMuted
              ? 'glass-btn-secondary text-slate-300 hover:text-white'
              : 'glass-panel-subtle bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
          }`}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          <span className="text-xs font-bold hidden sm:inline">
            {isMuted ? 'Muted' : 'Sound ON'}
          </span>
        </button>

        {/* Day / Night Mode Glass Toggle */}
        <button
          onClick={handleThemeClick}
          title="Toggle Day / Night Mode"
          className="h-10 w-10 rounded-xl glass-btn-secondary text-amber-300 hover:text-amber-200 transition-all flex items-center justify-center select-none"
        >
          {isNightMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Classic Full Resume Glass Trigger */}
        <button
          onClick={toggleDrawer}
          className="h-10 px-4 rounded-xl glass-btn-primary text-white font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 select-none"
        >
          <FileText size={16} />
          <span>Full Resume</span>
        </button>
      </div>
    </header>
  );
}
