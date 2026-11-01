'use client';

import React from 'react';
import Link from 'next/link';
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
      {/* 1. Brand & Title Badge */}
      <div className="pointer-events-auto bg-[#0F172A]/85 backdrop-blur-md border border-slate-700/60 shadow-xl px-4 py-2.5 rounded-2xl flex items-center gap-3 select-none">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/30">
          B
        </div>
        <div>
          <h1 className="text-sm font-black tracking-wide text-white flex items-center gap-1.5">
            Abdelkarim Bettayeb
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              9+ Yrs Exp
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
            3D Isometric Interactive Portfolio
          </p>
        </div>
      </div>

      {/* 2. Controls & Actions */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Item Studio Sandbox Link */}
        <Link
          href="/studio"
          className="h-10 px-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all"
          title="Open 3D Item Inspection Studio"
        >
          <span>🔬</span>
          <span className="hidden md:inline">Item Studio</span>
        </Link>

        {/* Audio Mute/Unmute Toggle */}
        <button
          onClick={handleMuteClick}
          title={isMuted ? 'Unmute 3D Audio' : 'Mute 3D Audio'}
          className={`h-10 px-3 rounded-xl border flex items-center gap-2 transition-all shadow-lg backdrop-blur-md ${
            isMuted
              ? 'bg-[#0F172A]/80 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-emerald-500/10'
          }`}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          <span className="text-xs font-bold hidden sm:inline">
            {isMuted ? 'Muted' : 'Sound ON'}
          </span>
        </button>

        {/* Day / Night Mode Toggle */}
        <button
          onClick={handleThemeClick}
          title="Toggle Day / Night Mode"
          className="h-10 w-10 rounded-xl bg-[#0F172A]/80 backdrop-blur-md border border-slate-700 text-amber-300 hover:text-amber-200 hover:border-slate-500 transition-all shadow-lg flex items-center justify-center"
        >
          {isNightMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Classic Full Resume Slide-out Trigger */}
        <button
          onClick={toggleDrawer}
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-95"
        >
          <FileText size={16} />
          <span>Full Resume</span>
        </button>
      </div>
    </header>
  );
}
