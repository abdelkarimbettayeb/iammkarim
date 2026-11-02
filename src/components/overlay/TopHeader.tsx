'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Volume2, VolumeX, Sun, Moon, FileText, CloudSun, CloudRain, Snowflake } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';
import type { WeatherState } from '@/types/room';

const WEATHER_OPTIONS: { id: WeatherState; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'clear', label: 'Clear', icon: CloudSun },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'snow', label: 'Snow', icon: Snowflake },
];

export function TopHeader() {
  const isMuted = useRoomStore((state) => state.isMuted);
  const toggleMute = useRoomStore((state) => state.toggleMute);
  const isNightMode = useRoomStore((state) => state.isNightMode);
  const toggleNightMode = useRoomStore((state) => state.toggleNightMode);
  const weatherState = useRoomStore((state) => state.weatherState);
  const setWeatherState = useRoomStore((state) => state.setWeatherState);
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
      {/* 1. Brand & title */}
      <div className="pointer-events-auto glass-panel-subtle px-3.5 py-2.5 rounded flex items-center gap-3 select-none">
        <div className="w-9 h-9 rounded bg-amber-400 text-slate-950 font-primary font-bold text-lg flex items-center justify-center">
          B
        </div>
        <div>
          <h1 className="text-sm font-primary font-semibold text-white flex items-center gap-2 leading-[1.3]">
            <span>Abdelkarim Bettayeb</span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/30">
              9+ yrs experience
            </span>
          </h1>
          <p className="text-[11px] text-slate-300/80 font-secondary line-clamp-1 leading-[1.3]">
            Interactive 3D portfolio
          </p>
        </div>
      </div>

      {/* 2. Controls */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Weather */}
        <div
          role="radiogroup"
          aria-label="Weather"
          className="glass-btn-secondary rounded h-10 p-1 flex items-center gap-0.5"
        >
          {WEATHER_OPTIONS.map(({ id, label, icon: Icon }) => {
            const active = weatherState === id;
            return (
              <button
                key={id}
                role="radio"
                aria-checked={active}
                title={label}
                onClick={() => setWeatherState(id)}
                className={`h-8 w-8 rounded flex items-center justify-center transition-colors select-none ${
                  active ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>

        {/* Sound */}
        <button
          onClick={handleMuteClick}
          title={isMuted ? 'Unmute audio' : 'Mute audio'}
          className={`h-10 px-3 rounded flex items-center gap-2 transition-colors select-none ${
            isMuted
              ? 'glass-btn-secondary text-slate-300 hover:text-white'
              : 'glass-btn-secondary border-emerald-500/40 text-emerald-300'
          }`}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span className="text-xs font-medium hidden sm:inline">{isMuted ? 'Muted' : 'Sound on'}</span>
        </button>

        {/* Day / night */}
        <button
          onClick={handleThemeClick}
          title="Toggle day / night"
          className="h-10 w-10 rounded glass-btn-secondary text-amber-300 hover:text-amber-200 transition-colors flex items-center justify-center select-none"
        >
          {isNightMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Full resume */}
        <button
          onClick={toggleDrawer}
          className="h-10 px-4 rounded glass-btn-primary text-white font-medium text-xs flex items-center gap-2 transition-colors select-none"
        >
          <FileText size={15} />
          <span>Full resume</span>
        </button>
      </div>
    </header>
  );
}
