
import { NoteConfig, Preset, SynthParams, MusicalKey, ScaleMode } from './types';

// RPi Performance Tuning
export const ECO_MAX_VOICES = 6; // Safe for Pi 3/4
export const HQ_MAX_VOICES = 16; // Desktop

// Frequencies for C3 to B4
export const NOTES: NoteConfig[] = [
  { note: 'C', octave: 3, frequency: 130.81, isSharp: false },
  { note: 'C#', octave: 3, frequency: 138.59, isSharp: true },
  { note: 'D', octave: 3, frequency: 146.83, isSharp: false },
  { note: 'D#', octave: 3, frequency: 155.56, isSharp: true },
  { note: 'E', octave: 3, frequency: 164.81, isSharp: false },
  { note: 'F', octave: 3, frequency: 174.61, isSharp: false },
  { note: 'F#', octave: 3, frequency: 185.00, isSharp: true },
  { note: 'G', octave: 3, frequency: 196.00, isSharp: false },
  { note: 'G#', octave: 3, frequency: 207.65, isSharp: true },
  { note: 'A', octave: 3, frequency: 220.00, isSharp: false },
  { note: 'A#', octave: 3, frequency: 233.08, isSharp: true },
  { note: 'B', octave: 3, frequency: 246.94, isSharp: false },
  { note: 'C', octave: 4, frequency: 261.63, isSharp: false },
  { note: 'C#', octave: 4, frequency: 277.18, isSharp: true },
  { note: 'D', octave: 4, frequency: 293.66, isSharp: false },
  { note: 'D#', octave: 4, frequency: 311.13, isSharp: true },
  { note: 'E', octave: 4, frequency: 329.63, isSharp: false },
  { note: 'F', octave: 4, frequency: 349.23, isSharp: false },
  { note: 'F#', octave: 4, frequency: 369.99, isSharp: true },
  { note: 'G', octave: 4, frequency: 392.00, isSharp: false },
  { note: 'G#', octave: 4, frequency: 415.30, isSharp: true },
  { note: 'A', octave: 4, frequency: 440.00, isSharp: false },
  { note: 'A#', octave: 4, frequency: 466.16, isSharp: true },
  { note: 'B', octave: 4, frequency: 493.88, isSharp: false },
];

export const KEYBOARD_MAP: Record<string, number> = {
  'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4,
  'f': 5, 't': 6, 'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11,
  'k': 12, 'o': 13, 'l': 14, 'p': 15, ';': 16,
  '\'': 18,
};

export const MUSICAL_KEYS: MusicalKey[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES: Record<ScaleMode, number[]> = {
    'Chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    'Major': [0, 2, 4, 5, 7, 9, 11],
    'Minor': [0, 2, 3, 5, 7, 8, 10],
    'Pentatonic': [0, 3, 5, 7, 10],
    'WholeTone': [0, 2, 4, 6, 8, 10]
};

export const DEFAULT_PARAMS: SynthParams = {
  performanceMode: 'HQ',
  oscillator: { type: 'sawtooth', detune: 0 },
  filter: { type: 'lowpass', cutoff: 2000, resonance: 5, envAmount: 1000 },
  envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.8 },
  lfo: { rate: 0, depth: 0, target: 'cutoff' },
  granular: { enabled: false, mix: 0.4, grainSize: 0.1, density: 0.5, spread: 0.8, feedback: 0.2 },
  delay: { enabled: false, time: 0.5, feedback: 0.3, mix: 0.4, pitchRandom: 0, rootKey: 'C', scale: 'Major' },
  master: { gain: 0.4, reverbMix: 0.3, reverbType: 'hall' },
};

export const PRESETS: Preset[] = [
    {
        name: "Init Saw",
        params: DEFAULT_PARAMS
    },
    {
        name: "Soft Pad",
        params: {
            performanceMode: 'HQ',
            oscillator: { type: 'triangle', detune: 5 },
            filter: { type: 'lowpass', cutoff: 600, resonance: 2, envAmount: 400 },
            envelope: { attack: 0.8, decay: 1.5, sustain: 0.6, release: 2.0 },
            lfo: { rate: 0.5, depth: 20, target: 'pitch' },
            granular: { enabled: false, mix: 0.3, grainSize: 0.1, density: 0.5, spread: 0.5, feedback: 0 },
            delay: DEFAULT_PARAMS.delay,
            master: { gain: 0.5, reverbMix: 0.6, reverbType: 'hall' }
        }
    },
    {
        name: "Granular Cloud",
        params: {
            performanceMode: 'HQ',
            oscillator: { type: 'sine', detune: 0 },
            filter: { type: 'bandpass', cutoff: 1500, resonance: 1, envAmount: 0 },
            envelope: { attack: 0.5, decay: 0.5, sustain: 1.0, release: 2.0 },
            lfo: { rate: 0.2, depth: 0, target: 'pitch' },
            granular: { enabled: true, mix: 0.7, grainSize: 0.2, density: 0.95, spread: 1.0, feedback: 0.6 },
            delay: DEFAULT_PARAMS.delay,
            master: { gain: 0.5, reverbMix: 0.5, reverbType: 'shimmer' }
        }
    },
    {
        name: "Rhythmic Delay",
        params: {
            performanceMode: 'HQ',
            oscillator: { type: 'square', detune: -5 },
            filter: { type: 'lowpass', cutoff: 1200, resonance: 4, envAmount: 500 },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.5 },
            lfo: { rate: 0, depth: 0, target: 'cutoff' },
            granular: { enabled: false, mix: 0, grainSize: 0.1, density: 0.5, spread: 0, feedback: 0 },
            delay: { enabled: true, time: 0.3, feedback: 0.5, mix: 0.5, pitchRandom: 0.8, rootKey: 'C', scale: 'Minor' },
            master: { gain: 0.4, reverbMix: 0.2, reverbType: 'hall' }
        }
    }
];