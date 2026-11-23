'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Volume2, VolumeX, Sun, Moon, FileText, CloudSun, CloudRain, Snowflake } from 'lucide-react';
import { roomStore, useRoomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';
import type { WeatherState } from '@/types/room';
import { personalInfo } from '@/data/resumeData';
import { exploreStore, useExplore } from '@/store/exploreStore';
import { BrandLogo } from '@/components/cv/BrandLogo';

const WEATHER_OPTIONS: { id: WeatherState; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'clear', label: 'Clear sky', icon: CloudSun },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'snow', label: 'Snow', icon: Snowflake },
];

const emptySubscribe = () => () => {};

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
      className="h-8 w-8 cv-radius-pill flex items-center justify-center transition-colors duration-200"
      style={{
        backgroundColor: active ? 'var(--cv-surface-elevated)' : 'transparent',
        color: active ? 'var(--cv-ink)' : 'var(--cv-ink-muted)',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1), 0 0 0 1px var(--cv-border)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

export function TopHeader() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isMuted = useRoomStore((state) => state.isMuted);
  const toggleMute = useRoomStore((state) => state.toggleMute);
  const weatherState = useRoomStore((state) => state.weatherState);
  const setWeatherState = useRoomStore((state) => state.setWeatherState);
  const activity = useExplore((state) => state.activity);
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  useEffect(() => {
    if (!mounted) return;
    roomStore.setNightMode(isDark);
  }, [isDark, mounted]);

  const handleMuteClick = () => {
    toggleMute();
    if (isMuted) setTimeout(() => playSound('chime'), 50);
  };

  const handleSelectTheme = (next: 'light' | 'dark') => {
    playSound('lamp');
    roomStore.setNightMode(next === 'dark');
    setTheme?.(next);
  };

  return (
    <header className="fixed top-3 sm:top-4 inset-x-3 sm:inset-x-4 md:inset-x-8 z-30 pointer-events-none flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-2">
      {/* Brand identity + live room activity */}
      <div className="pointer-events-auto cv-hud-panel pl-3.5 pr-4 py-2 flex items-center gap-3 select-none self-start">
        <BrandLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" style={{ color: 'var(--cv-ink)' }} />
        <div className="min-w-0">
          <h1
            className="font-cv-display font-bold text-[14.5px] sm:text-[15.5px] leading-tight tracking-tight"
            style={{ color: 'var(--cv-ink)' }}
          >
            {personalInfo.name}
          </h1>
          <p className="text-[11px] leading-tight mt-0.5 line-clamp-1" style={{ color: 'var(--cv-ink-muted)' }}>
            {personalInfo.role}
          </p>
          <p
            className="font-cv-mono text-[10.5px] leading-tight mt-1 flex items-center gap-1.5"
            style={{ color: 'var(--cv-accent)' }}
            aria-live="polite"
          >
            <span
              className="h-1.5 w-1.5 shrink-0"
              style={{ borderRadius: '9999px', backgroundColor: 'var(--cv-live)' }}
            />
            <span key={activity} className="line-clamp-1">
              {activity}
            </span>
          </p>
        </div>
      </div>

      {/* Weather, Light/Dark, Sound & Resume trigger */}
      <div className="pointer-events-auto flex flex-wrap items-center gap-2 self-start sm:self-auto">
        <div className="cv-hud-pill p-1 flex items-center gap-1">
          <div role="radiogroup" aria-label="Weather" className="flex items-center gap-0.5">
            {WEATHER_OPTIONS.map(({ id, label, icon: Icon }) => {
              const active = weatherState === id;
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={active}
                  aria-label={label}
                  title={label}
                  onClick={() => setWeatherState(id)}
                  className="h-8 w-8 cv-radius-pill flex items-center justify-center transition-colors duration-200"
                  style={{
                    backgroundColor: active ? 'var(--cv-surface-elevated)' : 'transparent',
                    color: active ? 'var(--cv-accent)' : 'var(--cv-ink-muted)',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1), 0 0 0 1px var(--cv-border)' : 'none',
                  }}
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </div>

          <span className="w-px h-4 mx-0.5" style={{ backgroundColor: 'var(--cv-border-strong)' }} aria-hidden />

          <IconButton label={isMuted ? 'Turn sound on' : 'Turn sound off'} onClick={handleMuteClick} active={!isMuted}>
            {isMuted ? (
              <VolumeX size={15} />
            ) : (
              <Volume2 size={15} style={{ color: 'var(--cv-accent)' }} />
            )}
          </IconButton>

          <div className="cv-theme-switch ml-0.5" role="group" aria-label="Color appearance">
            <button
              onClick={() => handleSelectTheme('light')}
              data-active={!isDark ? 'true' : 'false'}
              aria-label="Light mode"
              aria-pressed={!isDark}
              className="cv-theme-option"
            >
              <Sun size={13} />
              <span className="hidden md:inline">Light</span>
            </button>
            <button
              onClick={() => handleSelectTheme('dark')}
              data-active={isDark ? 'true' : 'false'}
              aria-label="Dark mode"
              aria-pressed={isDark}
              className="cv-theme-option"
            >
              <Moon size={13} />
              <span className="hidden md:inline">Dark</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => exploreStore.openDrawer(null)}
          className="cv-btn-primary h-10 px-4 font-semibold text-[12.5px] flex items-center gap-2"
        >
          <FileText size={14} />
          <span className="hidden sm:inline">Resume</span>
        </button>
      </div>
    </header>
  );
}
