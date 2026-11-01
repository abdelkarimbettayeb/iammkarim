import { roomStore } from '@/store/useRoomStore';

export type SoundEffect =
  | 'guitar'
  | 'lamp'
  | 'dart'
  | 'cartridge'
  | 'chime'
  | 'volleyball'
  | 'volleyball_bounce';

let audioCtx: AudioContext | null = null;
let lastBounceSoundTime = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

let chordIndex = 0;
const GUITAR_CHORDS = [
  // E minor: E2, B2, E3, G3, B3, E4
  [82.41, 123.47, 164.81, 196.0, 246.94, 329.63],
  // G major: G2, B2, D3, G3, D4, G4
  [98.0, 123.47, 146.83, 196.0, 293.66, 392.0],
  // Cadd9: C3, E3, G3, D4, G4
  [130.81, 164.81, 196.0, 293.66, 392.0],
  // Dsus4 / D major: D3, A3, D4, G4
  [146.83, 220.0, 293.66, 392.0, 440.0],
];

function playGuitarStrum(ctx: AudioContext) {
  // Acoustic guitar chord progression
  const chord = GUITAR_CHORDS[chordIndex % GUITAR_CHORDS.length];
  chordIndex++;

  const now = ctx.currentTime;

  chord.forEach((freq, index) => {
    const stringTime = now + index * 0.032; // Downward strum stagger
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Warm acoustic guitar body filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, stringTime);
    filter.frequency.exponentialRampToValueAtTime(320, stringTime + 1.3);

    // Warm triangle waveform
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, stringTime);

    // Pluck envelope
    gain.gain.setValueAtTime(0.001, stringTime);
    gain.gain.linearRampToValueAtTime(0.2, stringTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, stringTime + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(stringTime);
    osc.stop(stringTime + 1.5);
  });
}

function playVolleyballHit(ctx: AudioContext) {
  const now = ctx.currentTime;

  // 1. Slap impact noise transient (palm hitting synthetic leather)
  const bufferSize = Math.floor(ctx.sampleRate * 0.045);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(1100, now);
  noiseFilter.Q.setValueAtTime(2.2, now);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.3, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);

  // 2. Resonant pressurized ball thud body
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(250, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.13);

  gain.gain.setValueAtTime(0.38, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

export function playVolleyballBounceSound(intensity = 1.0) {
  if (typeof window === 'undefined') return;
  const { isMuted } = roomStore.getState();
  if (isMuted) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (now - lastBounceSoundTime < 0.07) return;
  lastBounceSoundTime = now;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Warm, pressurized floor bounce sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(155, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.095);

    const clampedIntensity = Math.min(Math.max(intensity, 0.12), 1.0);
    const volume = clampedIntensity * 0.26;

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  } catch (err) {
    console.warn('Volleyball bounce sound error:', err);
  }
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
      case 'volleyball':
        playVolleyballHit(ctx);
        break;
      case 'volleyball_bounce':
        playVolleyballBounceSound(0.7);
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
