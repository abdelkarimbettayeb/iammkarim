import { roomStore } from '@/store/useRoomStore';

export type SoundEffect = 'guitar' | 'lamp' | 'dart' | 'cartridge' | 'chime';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // AudioContext resume will be triggered on next user interaction
    });
  }

  return audioCtx;
}

function playGuitarStrum(ctx: AudioContext) {
  // Acoustic guitar chord: E minor / E major inspired open strings
  const stringFrequencies = [82.41, 123.47, 164.81, 196.0, 246.94, 329.63];
  const now = ctx.currentTime;

  stringFrequencies.forEach((freq, index) => {
    const stringTime = now + index * 0.035; // Downward strum stagger
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Warm acoustic guitar body filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, stringTime);
    filter.frequency.exponentialRampToValueAtTime(300, stringTime + 1.2);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, stringTime);

    // Pluck envelope
    gain.gain.setValueAtTime(0.001, stringTime);
    gain.gain.linearRampToValueAtTime(0.18, stringTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, stringTime + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(stringTime);
    osc.stop(stringTime + 1.5);
  });
}

function playLampClick(ctx: AudioContext) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);

  // Micro secondary click release
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(900, now + 0.02);
  gain2.gain.setValueAtTime(0.15, now + 0.02);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc2.start(now + 0.02);
  osc2.stop(now + 0.08);
}

function playDartImpact(ctx: AudioContext) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.1);

  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.15);
}

function playCartridgeSlot(ctx: AudioContext) {
  const now = ctx.currentTime;
  // Retro 8-bit rising two-tone chime
  const notes = [440, 659.25, 880]; // A4, E5, A5
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = now + idx * 0.06;

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.08, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.12);
  });
}

function playChime(ctx: AudioContext) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now); // A5
  osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15); // A6

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.45);
}

export function playSound(effect: SoundEffect): void {
  if (typeof window === 'undefined') return;

  // Check global mute state
  const { isMuted } = roomStore.getState();
  if (isMuted) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    switch (effect) {
      case 'guitar':
        playGuitarStrum(ctx);
        break;
      case 'lamp':
        playLampClick(ctx);
        break;
      case 'dart':
        playDartImpact(ctx);
        break;
      case 'cartridge':
        playCartridgeSlot(ctx);
        break;
      case 'chime':
        playChime(ctx);
        break;
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}
