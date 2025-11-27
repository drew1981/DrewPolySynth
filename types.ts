
export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type FilterType = 'lowpass' | 'highpass' | 'bandpass';
export type ReverbType = 'hall' | 'shimmer' | 'off';
export type MusicalKey = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type ScaleMode = 'Chromatic' | 'Major' | 'Minor' | 'Pentatonic' | 'WholeTone';

export interface GranularParams {
  enabled: boolean;
  mix: number; // 0-1
  grainSize: number; // 0.01 - 0.5 seconds
  density: number; // 0-1 (Spawn rate / Overlap)
  spread: number; // 0-1 Stereo width
  feedback: number; // 0-0.9
}

export interface DelayParams {
  enabled: boolean;
  time: number; // 0 - 2 seconds
  feedback: number; // 0 - 0.95
  mix: number; // 0 - 1
  pitchRandom: number; // 0 - 1 (Probability of shifting pitch)
  rootKey: MusicalKey;
  scale: ScaleMode;
}

export interface SynthParams {
  oscillator: {
    type: Waveform;
    detune: number; // cents
  };
  filter: {
    type: FilterType;
    cutoff: number; // Hz
    resonance: number;
    envAmount: number; // Hz to add to cutoff
  };
  envelope: {
    attack: number; // seconds
    decay: number; // seconds
    sustain: number; // 0-1 gain
    release: number; // seconds
  };
  lfo: {
    rate: number; // Hz
    depth: number; // modulation amount
    target: 'pitch' | 'cutoff' | 'amp';
  };
  granular: GranularParams;
  delay: DelayParams;
  master: {
    gain: number;
    reverbMix: number; // 0-1
    reverbType: ReverbType;
  };
}

export interface NoteConfig {
  note: string;
  frequency: number;
  octave: number;
  isSharp: boolean;
}

export interface Preset {
  name: string;
  params: SynthParams;
}
