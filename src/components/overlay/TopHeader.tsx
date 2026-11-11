'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Volume2, VolumeX, Sun, Moon, FileText, CloudSun, CloudRain, Snowflake } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';
import type { WeatherState } from '@/types/room';
import { personalInfo } from '@/data/resumeData';
import { exploreStore, useExplore } from '@/store/exploreStore';

const WEATHER_OPTIONS: { id: WeatherState; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'clear', label: 'Clear sky', icon: CloudSun },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'snow', label: 'Snow', icon: Snowflake },
];

function IconButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`h-9 w-9 rounded flex items-center justify-center transition-colors duration-200 ${
        active ? 'bg-white/[0.16] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]' : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
      }`}
    >
      {children}
    </button>
  );
}

export function TopHeader() {
  const isMuted = useRoomStore((state) => state.isMuted);
  const toggleMute = useRoomStore((state) => state.toggleMute);
  const isNightMode = useRoomStore((state) => state.isNightMode);
  const toggleNightMode = useRoomStore((state) => state.toggleNightMode);
  const weatherState = useRoomStore((state) => state.weatherState);
  const setWeatherState = useRoomStore((state) => state.setWeatherState);
  const activity = useExplore((state) => state.activity);
  const { theme, setTheme } = useTheme();

  const handleMuteClick = () => {
    toggleMute();
    if (isMuted) setTimeout(() => playSound('chime'), 50);
  };

  const handleThemeClick = () => {
    playSound('lamp');
    toggleNightMode();
    setTheme?.(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="hud hud-in fixed top-3 sm:top-4 inset-x-3 sm:inset-x-4 md:inset-x-8 z-30 pointer-events-none flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-2">
      {/* Who, what, and what he's doing right now */}
      <div className="pointer-events-auto glass-panel-subtle pl-2 pr-4 py-2 flex items-center gap-3 select-none self-start">
        <div className="relative w-11 h-11 rounded overflow-hidden flex items-center justify-center font-primary font-bold text-[17px] text-[#1a1206] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] bg-[linear-gradient(140deg,#ffe3a3,#ffb547_50%,#ff8a4c)]">
          AB
        </div>
        <div className="min-w-0">
          <h1 className="font-primary font-semibold text-[15px] sm:text-base leading-tight text-white tracking-[-0.01em]">
            {personalInfo.name}
          </h1>
          <p className="text-[11.5px] text-slate-300 leading-tight mt-0.5 line-clamp-1">{personalInfo.role}</p>
          <p className="text-[11px] text-amber-200/90 leading-tight mt-1 flex items-center gap-1.5" aria-live="polite">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inset-0 rounded bg-amber-300 opacity-70 animate-ping" />
              <span className="relative h-1.5 w-1.5 rounded bg-amber-300" />
            </span>
            <span key={activity} className="line-clamp-1 animate-in fade-in slide-in-from-bottom-1 duration-300">
              {activity}
            </span>
          </p>
        </div>
      </div>

      {/* Scene controls + resume */}
      <div className="pointer-events-auto flex items-center gap-2 self-start sm:self-auto">
        <div className="glass-panel-subtle p-1 flex items-center gap-0.5">
          <div role="radiogroup" aria-label="Weather" className="flex items-center gap-0.5">
            {WEATHER_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="radio"
                aria-checked={weatherState === id}
                aria-label={label}
                title={label}
                onClick={() => setWeatherState(id)}
                className={`h-9 w-9 rounded flex items-center justify-center transition-colors duration-200 ${
                  weatherState === id
                    ? 'bg-white/[0.16] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          <span className="w-px h-5 bg-white/15 mx-1" aria-hidden />
          <IconButton label={isMuted ? 'Turn sound on' : 'Turn sound off'} onClick={handleMuteClick} active={!isMuted}>
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-amber-300" />}
          </IconButton>
          <IconButton label={isNightMode ? 'Switch to day' : 'Switch to night'} onClick={handleThemeClick}>
            {isNightMode ? <Sun size={16} className="text-amber-300" /> : <Moon size={16} className="text-indigo-200" />}
          </IconButton>
        </div>

        <button
          onClick={() => exploreStore.openDrawer(null)}
          className="h-11 px-4 glass-btn-primary font-semibold text-[13px] flex items-center gap-2"
        >
          <FileText size={15} />
          <span className="hidden sm:inline">Resume</span>
        </button>
      </div>
    </header>
  );
}
