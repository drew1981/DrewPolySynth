/**
 * POLYWAVE STUDIO - STANDALONE VERSION
 * Converted from Typescript/React to Vanilla JS
 */

// ==========================================
// 1. CONSTANTS & CONFIG
// ==========================================
const ECO_MAX_VOICES = 6;
const HQ_MAX_VOICES = 16;

const NOTES = [
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

const KEYBOARD_MAP = {
    'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4,
    'f': 5, 't': 6, 'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11,
    'k': 12, 'o': 13, 'l': 14, 'p': 15, ';': 16,
    "'": 18,
};

const MUSICAL_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALES = {
    'Chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    'Major': [0, 2, 4, 5, 7, 9, 11],
    'Minor': [0, 2, 3, 5, 7, 8, 10],
    'Pentatonic': [0, 3, 5, 7, 10],
    'WholeTone': [0, 2, 4, 6, 8, 10]
};

const DEFAULT_PARAMS = {
    performanceMode: 'HQ',
    oscillator: { type: 'sawtooth', detune: 0 },
    filter: { type: 'lowpass', cutoff: 2000, resonance: 5, envAmount: 1000 },
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.8 },
    lfo: { rate: 0, depth: 0, target: 'cutoff' },
    granular: { enabled: false, mix: 0.4, grainSize: 0.1, density: 0.5, spread: 0.8, feedback: 0.2 },
    delay: { enabled: false, time: 0.5, feedback: 0.3, mix: 0.4, pitchRandom: 0, rootKey: 'C', scale: 'Major' },
    master: { gain: 0.4, reverbMix: 0.3, reverbType: 'hall' },
};

const PRESETS = [
    { name: "Init Saw", params: JSON.parse(JSON.stringify(DEFAULT_PARAMS)) },
    {
        name: "Soft Pad",
        params: {
            performanceMode: 'HQ',
            oscillator: { type: 'triangle', detune: 5 },
            filter: { type: 'lowpass', cutoff: 600, resonance: 2, envAmount: 400 },
            envelope: { attack: 0.8, decay: 1.5, sustain: 0.6, release: 2.0 },
            lfo: { rate: 0.5, depth: 20, target: 'pitch' },
            granular: { enabled: false, mix: 0.3, grainSize: 0.1, density: 0.5, spread: 0.5, feedback: 0 },
            delay: { ...DEFAULT_PARAMS.delay },
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
            delay: { ...DEFAULT_PARAMS.delay },
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

// ==========================================
// 2. AUDIO ENGINE
// ==========================================

class Voice {
    constructor(ctx, destination, frequency, params) {
        this.ctx = ctx;
        this.params = params;
        this.frequency = frequency;
        this.startTime = ctx.currentTime;

        this.osc = ctx.createOscillator();
        this.filter = ctx.createBiquadFilter();
        this.amp = ctx.createGain();
        this.lfo = ctx.createOscillator();
        this.lfoGain = ctx.createGain();

        this.setupParams();

        this.osc.connect(this.filter);
        this.filter.connect(this.amp);
        this.amp.connect(destination);

        this.lfo.connect(this.lfoGain);
        this.routeLFO();
    }

    routeLFO() {
        this.lfoGain.disconnect();
        switch(this.params.lfo.target) {
            case 'pitch': this.lfoGain.connect(this.osc.detune); break;
            case 'cutoff': this.lfoGain.connect(this.filter.frequency); break;
            case 'amp': this.lfoGain.connect(this.amp.gain); break;
        }
    }

    setupParams() {
        const t = this.ctx.currentTime;
        const p = this.params;

        this.osc.type = p.oscillator.type;
        this.osc.frequency.value = this.frequency;
        this.osc.detune.value = p.oscillator.detune;

        this.filter.type = p.filter.type;
        this.filter.Q.value = p.filter.resonance;
        
        const baseCutoff = p.filter.cutoff;
        const envAmt = p.filter.envAmount;
        
        this.filter.frequency.setValueAtTime(baseCutoff, t);
        this.filter.frequency.linearRampToValueAtTime(
            Math.min(22000, Math.max(0, baseCutoff + envAmt)), 
            t + p.envelope.attack
        );
        this.filter.frequency.exponentialRampToValueAtTime(
            Math.max(10, baseCutoff + (envAmt * p.envelope.sustain)), 
            t + p.envelope.attack + p.envelope.decay
        );

        this.lfo.frequency.value = p.lfo.rate;
        let depthMultiplier = 1;
        if (p.lfo.target === 'cutoff') depthMultiplier = 100;
        if (p.lfo.target === 'pitch') depthMultiplier = 10;
        if (p.lfo.target === 'amp') depthMultiplier = 0.5;

        this.lfoGain.gain.value = p.lfo.depth * depthMultiplier;
        this.lfo.type = 'sine';

        this.amp.gain.setValueAtTime(0, t);
        this.amp.gain.linearRampToValueAtTime(1, t + p.envelope.attack);
        this.amp.gain.exponentialRampToValueAtTime(Math.max(0.001, p.envelope.sustain), t + p.envelope.attack + p.envelope.decay);
    }

    start() {
        this.osc.start(this.startTime);
        this.lfo.start(this.startTime);
    }

    updateParams(newParams) {
        const t = this.ctx.currentTime;
        this.params = newParams;
        
        this.osc.type = newParams.oscillator.type;
        this.osc.detune.setTargetAtTime(newParams.oscillator.detune, t, 0.1);
        this.filter.Q.setTargetAtTime(newParams.filter.resonance, t, 0.1);
        this.filter.frequency.setTargetAtTime(newParams.filter.cutoff, t, 0.1);
        
        this.lfo.frequency.setTargetAtTime(newParams.lfo.rate, t, 0.1);
        this.routeLFO();
    }

    stop() {
        const t = this.ctx.currentTime;
        const { release } = this.params.envelope;
        
        this.amp.gain.cancelScheduledValues(t);
        this.amp.gain.setValueAtTime(this.amp.gain.value, t);
        this.amp.gain.exponentialRampToValueAtTime(0.001, t + release);

        this.filter.frequency.cancelScheduledValues(t);
        this.filter.frequency.setValueAtTime(this.filter.frequency.value, t);
        this.filter.frequency.exponentialRampToValueAtTime(this.params.filter.cutoff, t + release);

        this.osc.stop(t + release + 0.1);
        this.lfo.stop(t + release + 0.1);
        
        setTimeout(() => {
            this.amp.disconnect();
            this.osc.disconnect();
            this.filter.disconnect();
        }, (release + 0.5) * 1000);
    }
}

class SynthEngine {
    constructor(initialParams) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.params = initialParams;

        // --- Signal Chain Setup ---
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -20;
        this.compressor.ratio.value = 4;
        
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = initialParams.master.gain;

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;

        this.recorderDest = this.ctx.createMediaStreamDestination();

        // Reverb Bus
        this.reverbNode = this.ctx.createConvolver();
        this.dryNode = this.ctx.createGain();
        this.wetNode = this.ctx.createGain();

        // Granular Bus
        this.granularDry = this.ctx.createGain();
        this.granularWet = this.ctx.createGain();
        
        // Delay Bus
        this.delayDry = this.ctx.createGain();
        this.delayWet = this.ctx.createGain();

        // ScriptProcessors
        this.granularNode = this.ctx.createScriptProcessor(4096, 2, 2); 
        this.granularBuffer = new Float32Array(this.ctx.sampleRate * 2); 
        this.granularNode.onaudioprocess = this.processGranular.bind(this);
        this.granularWriteIndex = 0;
        this.activeGrains = [];
        this.grainSpawnTimer = 0;

        this.delayNode = this.ctx.createScriptProcessor(4096, 2, 2);
        this.delayBuffer = new Float32Array(this.ctx.sampleRate * 4);
        this.delayNode.onaudioprocess = this.processDelay.bind(this);
        this.delayWriteIndex = 0;
        this.activeDelayGrains = [];
        this.delayTimer = 0;

        // Input Section
        this.inputGain = this.ctx.createGain();
        this.inputGain.gain.value = 0;
        this.inputSendToFx = this.ctx.createGain();
        this.inputDry = this.ctx.createGain();

        // --- Routing Topology ---
        const voiceSum = this.ctx.createGain();
        this.voiceDestination = voiceSum;

        // 1. Voice to Granular
        voiceSum.connect(this.granularDry);
        voiceSum.connect(this.granularNode);
        this.granularNode.connect(this.granularWet);

        // 2. Granular Output to Delay
        const granularOutput = this.ctx.createGain();
        this.granularDry.connect(granularOutput);
        this.granularWet.connect(granularOutput);

        granularOutput.connect(this.delayDry);
        granularOutput.connect(this.delayNode);
        this.delayNode.connect(this.delayWet);

        // 3. Delay Output to Reverb / Final Dry
        const delayOutput = this.ctx.createGain();
        this.delayDry.connect(delayOutput);
        this.delayWet.connect(delayOutput);

        delayOutput.connect(this.dryNode);
        delayOutput.connect(this.reverbNode);

        // Reverb -> WetNode
        this.reverbNode.connect(this.wetNode);
        
        // Sum to Compressor
        this.dryNode.connect(this.compressor);
        this.wetNode.connect(this.compressor);
        
        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.analyser);
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.connect(this.recorderDest);

        // Input Routing
        this.inputGain.connect(this.inputDry);
        this.inputGain.connect(this.inputSendToFx);
        this.inputDry.connect(this.compressor); 
        this.inputSendToFx.connect(this.reverbNode); 

        // State Init
        this.activeVoices = new Map();
        this.heldNotes = new Set();
        this.hallBuffer = null;
        this.shimmerBuffer = null;
        this.isHoldEnabled = false;

        this.generateReverbBuffers();
        this.updateReverbState();
        this.updateGranularState();
        this.updateDelayState();
    }

    processGranular(e) {
        if (!this.params.granular.enabled) {
            const outputL = e.outputBuffer.getChannelData(0);
            const outputR = e.outputBuffer.getChannelData(1);
            outputL.fill(0);
            outputR.fill(0);
            return;
        }

        const inputL = e.inputBuffer.getChannelData(0);
        const inputR = e.inputBuffer.getChannelData(1); 
        const outputL = e.outputBuffer.getChannelData(0);
        const outputR = e.outputBuffer.getChannelData(1);
        const len = inputL.length;
        const { grainSize, density, spread, feedback } = this.params.granular;

        const sampleRate = this.ctx.sampleRate;
        const minInterval = sampleRate * 0.001; 
        const maxInterval = sampleRate * 0.2;
        const spawnInterval = maxInterval - (Math.pow(density, 0.5) * (maxInterval - minInterval));
        const grainDurationSamples = Math.floor(grainSize * sampleRate);

        for (let i = 0; i < len; i++) {
            const monoIn = (inputL[i] + (inputR ? inputR[i] : inputL[i])) * 0.5;
            this.granularBuffer[this.granularWriteIndex] = monoIn;
            
            let currentSampleL = 0;
            let currentSampleR = 0;

            for (let g = this.activeGrains.length - 1; g >= 0; g--) {
                const grain = this.activeGrains[g];
                if (grain.position >= grain.duration) {
                    this.activeGrains.splice(g, 1);
                    continue;
                }

                let readIdx = (grain.bufferIndex + Math.floor(grain.position)) % this.granularBuffer.length;
                if (readIdx < 0) readIdx += this.granularBuffer.length;
                
                const sample = this.granularBuffer[readIdx];
                const progress = grain.position / grain.duration;
                const window = 4 * progress * (1 - progress); 
                const pannedSample = sample * window;
                
                currentSampleL += pannedSample * (1 - Math.max(0, grain.pan));
                currentSampleR += pannedSample * (1 + Math.min(0, grain.pan));

                grain.position += grain.speed;
            }

            if (feedback > 0) {
                const safeFeedback = Math.min(0.95, feedback);
                this.granularBuffer[this.granularWriteIndex] += (currentSampleL + currentSampleR) * 0.5 * safeFeedback;
            }

            outputL[i] = currentSampleL;
            outputR[i] = currentSampleR;

            this.granularWriteIndex = (this.granularWriteIndex + 1) % this.granularBuffer.length;
            this.grainSpawnTimer--;
            if (this.grainSpawnTimer <= 0) {
                this.grainSpawnTimer = spawnInterval * (0.5 + Math.random());
                const sprayAmount = spread * sampleRate * 0.5; 
                const offset = Math.floor(Math.random() * sprayAmount);
                let startIdx = this.granularWriteIndex - offset;
                if (startIdx < 0) startIdx += this.granularBuffer.length;
                const pitchJitter = 1.0 + (Math.random() * 0.05 - 0.025) * spread;

                this.activeGrains.push({
                    bufferIndex: startIdx,
                    position: 0,
                    speed: pitchJitter, 
                    duration: grainDurationSamples,
                    pan: (Math.random() * 2 - 1) * spread
                });
            }
        }
    }

    processDelay(e) {
        if (!this.params.delay.enabled) {
            const outputL = e.outputBuffer.getChannelData(0);
            const outputR = e.outputBuffer.getChannelData(1);
            outputL.fill(0);
            outputR.fill(0);
            return;
        }

        const inputL = e.inputBuffer.getChannelData(0);
        const inputR = e.inputBuffer.getChannelData(1);
        const outputL = e.outputBuffer.getChannelData(0);
        const outputR = e.outputBuffer.getChannelData(1);
        const len = inputL.length;
        const { time, feedback, pitchRandom, rootKey, scale } = this.params.delay;

        const sampleRate = this.ctx.sampleRate;
        const delaySamples = Math.floor(time * sampleRate);
        const allowedIntervals = SCALES[scale];

        const getRandomSpeed = () => {
            if (pitchRandom <= 0.05) return 1.0;
            if (Math.random() > pitchRandom) return 1.0;
            const interval = allowedIntervals[Math.floor(Math.random() * allowedIntervals.length)];
            const octave = Math.random() > 0.7 ? (Math.random() > 0.5 ? 12 : -12) : 0;
            const totalSemitones = interval + octave;
            return Math.pow(2, totalSemitones / 12);
        };

        for (let i = 0; i < len; i++) {
            const monoIn = (inputL[i] + (inputR ? inputR[i] : inputL[i])) * 0.5;
            this.delayBuffer[this.delayWriteIndex] = monoIn;

            let outL = 0;
            let outR = 0;

            for (let g = this.activeDelayGrains.length - 1; g >= 0; g--) {
                const grain = this.activeDelayGrains[g];
                if (grain.position >= grain.duration) {
                    this.activeDelayGrains.splice(g, 1);
                    continue;
                }
                let readIdx = (grain.bufferIndex + Math.floor(grain.position)) % this.delayBuffer.length;
                if (readIdx < 0) readIdx += this.delayBuffer.length;
                const sample = this.delayBuffer[readIdx];
                const progress = grain.position / grain.duration;
                let window = 1;
                if (progress < 0.1) window = progress / 0.1;
                if (progress > 0.9) window = (1 - progress) / 0.1;
                const panned = sample * window * grain.gain;
                outL += panned * (1 - Math.max(0, grain.pan));
                outR += panned * (1 + Math.min(0, grain.pan));
                grain.position += grain.speed;
            }
            
            if (feedback > 0) {
               const fb = (outL + outR) * 0.5 * feedback;
               this.delayBuffer[this.delayWriteIndex] += fb;
            }

            outputL[i] = outL;
            outputR[i] = outR;
            this.delayWriteIndex = (this.delayWriteIndex + 1) % this.delayBuffer.length;
            this.delayTimer--;
            if (this.delayTimer <= 0) {
                this.delayTimer = delaySamples;
                let startIdx = this.delayWriteIndex - delaySamples;
                if (startIdx < 0) startIdx += this.delayBuffer.length;
                const speed = getRandomSpeed();
                this.activeDelayGrains.push({
                    bufferIndex: startIdx,
                    position: 0,
                    speed: speed,
                    duration: delaySamples,
                    pan: (Math.random() * 0.4 - 0.2), 
                    gain: 1.0 
                });
            }
        }
    }

    async initAudioInput() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } 
            });
            this.inputSource = this.ctx.createMediaStreamSource(stream);
            this.inputSource.connect(this.inputGain);
            return true;
        } catch (err) {
            console.error("Audio Input Error:", err);
            return false;
        }
    }

    setInputGain(val) { this.inputGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1); }
    setInputFXSend(enabled) { this.inputSendToFx.gain.setTargetAtTime(enabled ? 1 : 0, this.ctx.currentTime, 0.1); }
    getAnalyserData(array) { this.analyser.getByteFrequencyData(array); }
    resumeContext() { if (this.ctx.state === 'suspended') this.ctx.resume(); }

    updateParams(newParams) {
        const oldParams = this.params;
        this.params = newParams;
        if (oldParams.performanceMode !== newParams.performanceMode) {
            this.generateReverbBuffers();
            this.updateReverbState();
        }
        this.masterGain.gain.setTargetAtTime(newParams.master.gain, this.ctx.currentTime, 0.1);
        if (oldParams.master.reverbMix !== newParams.master.reverbMix || oldParams.master.reverbType !== newParams.master.reverbType) {
            this.updateReverbState();
        }
        if (JSON.stringify(oldParams.granular) !== JSON.stringify(newParams.granular)) this.updateGranularState();
        if (JSON.stringify(oldParams.delay) !== JSON.stringify(newParams.delay)) this.updateDelayState();
        this.activeVoices.forEach(voice => voice.updateParams(newParams));
    }

    updateGranularState() {
        const { enabled, mix } = this.params.granular;
        const t = this.ctx.currentTime;
        if (enabled) {
            this.granularDry.gain.setTargetAtTime(1 - mix, t, 0.1);
            this.granularWet.gain.setTargetAtTime(mix, t, 0.1);
        } else {
            this.granularDry.gain.setTargetAtTime(1, t, 0.1);
            this.granularWet.gain.setTargetAtTime(0, t, 0.1);
        }
    }

    updateDelayState() {
        const { enabled, mix } = this.params.delay;
        const t = this.ctx.currentTime;
        if (enabled) {
            this.delayDry.gain.setTargetAtTime(1 - mix, t, 0.1);
            this.delayWet.gain.setTargetAtTime(mix, t, 0.1);
        } else {
            this.delayDry.gain.setTargetAtTime(1, t, 0.1);
            this.delayWet.gain.setTargetAtTime(0, t, 0.1);
        }
    }

    updateReverbState() {
        const { reverbType, reverbMix } = this.params.master;
        if (reverbType === 'off') {
            this.wetNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
            this.dryNode.gain.setTargetAtTime(1, this.ctx.currentTime, 0.1); 
        } else {
            const buffer = reverbType === 'hall' ? this.hallBuffer : this.shimmerBuffer;
            if (this.reverbNode.buffer !== buffer) this.reverbNode.buffer = buffer;
            this.wetNode.gain.setTargetAtTime(reverbMix, this.ctx.currentTime, 0.1);
            this.dryNode.gain.setTargetAtTime(1 - (reverbMix * 0.4), this.ctx.currentTime, 0.1); 
        }
    }

    playNote(noteIndex, frequency) {
        this.resumeContext();
        const maxVoices = this.params.performanceMode === 'Eco' ? ECO_MAX_VOICES : HQ_MAX_VOICES;
        if (this.activeVoices.size >= maxVoices) {
            const oldestNoteIndex = this.activeVoices.keys().next().value;
            if (oldestNoteIndex !== undefined) this.stopNote(oldestNoteIndex);
        }
        if (this.activeVoices.has(noteIndex)) {
            this.activeVoices.get(noteIndex)?.stop(); 
            this.activeVoices.delete(noteIndex);
        }
        const voice = new Voice(this.ctx, this.voiceDestination, frequency, this.params);
        voice.start();
        this.activeVoices.set(noteIndex, voice);
    }

    stopNote(noteIndex) {
        const voice = this.activeVoices.get(noteIndex);
        if (!voice) return;
        if (this.isHoldEnabled) {
            this.heldNotes.add(noteIndex);
        } else {
            voice.stop();
            this.activeVoices.delete(noteIndex);
            this.heldNotes.delete(noteIndex);
        }
    }

    setHold(enabled) {
        this.isHoldEnabled = enabled;
        if (!enabled) {
            this.heldNotes.forEach(noteIndex => {
                const voice = this.activeVoices.get(noteIndex);
                if (voice) {
                    voice.stop();
                    this.activeVoices.delete(noteIndex);
                }
            });
            this.heldNotes.clear();
        }
    }

    startRecording() {
        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(this.recorderDest.stream, { mimeType: 'audio/webm' });
        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.recordedChunks.push(e.data);
        };
        this.mediaRecorder.start();
    }

    stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder) return resolve();
            this.mediaRecorder.onstop = () => resolve();
            this.mediaRecorder.stop();
        });
    }

    async playRecording(loop) {
        if (this.recordedChunks.length === 0) return;
        if (this.playbackSource) this.playbackSource.stop();
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.playbackSource = this.ctx.createBufferSource();
        this.playbackSource.buffer = audioBuffer;
        this.playbackSource.loop = loop;
        this.playbackSource.connect(this.ctx.destination);
        this.playbackSource.start();
    }

    stopPlayback() {
        if (this.playbackSource) {
            this.playbackSource.stop();
            this.playbackSource = null;
        }
    }

    clearRecording() {
        this.recordedChunks = [];
        this.stopPlayback();
    }

    generateReverbBuffers() {
        const isEco = this.params.performanceMode === 'Eco';
        const hallDecay = isEco ? 1.2 : 2.5; 
        const shimmerDecay = isEco ? 2.0 : 4.0;
        this.hallBuffer = this.createImpulse(hallDecay, hallDecay, false);
        this.shimmerBuffer = this.createImpulse(shimmerDecay, 1.2, true);
    }

    createImpulse(duration, decay, shimmer) {
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);
        for (let i = 0; i < length; i++) {
            const n = i / length;
            const env = Math.pow(1 - n, decay); 
            let noise = (Math.random() * 2 - 1);
            if (shimmer) {
               noise *= (1 + Math.sin(i * 0.3)); 
               if (i < 500) noise *= 0.1;
            }
            left[i] = noise * env;
            right[i] = noise * env;
        }
        return impulse;
    }
}

// ==========================================
// 3. UI CONTROLLER (Main Logic)
// ==========================================

class SynthesizerUI {
    constructor() {
        // Deep Copy Default Params
        this.params = JSON.parse(JSON.stringify(DEFAULT_PARAMS));
        this.synth = null;
        this.isStarted = false;
        this.isHold = false;
        
        // Input Visualizer
        this.visualizerId = null;
        
        // Recorder
        this.isRecording = false;
        this.isPlaying = false;
        this.hasRecording = false;
        this.loop = false;
        this.recInterval = null;
        this.recDuration = 0;

        this.init();
    }

    init() {
        // Start Overlay
        document.getElementById('btn-start-audio').addEventListener('click', () => {
            this.synth = new SynthEngine(this.params);
            this.isStarted = true;
            document.getElementById('start-overlay').classList.add('hidden');
        });

        // Initialize UI Components
        this.renderKeyboard();
        this.setupKnobs();
        this.setupSliders();
        this.setupSwitches();
        this.setupPresetLoader();
        this.setupRecorder();
        this.setupLiveInput();
    }

    updateEngine() {
        if (this.synth) {
            this.synth.updateParams(this.params);
            this.synth.setHold(this.isHold);
        }
    }

    // --- Helpers ---
    updateParam(section, key, value) {
        this.params[section][key] = value;
        this.updateEngine();
    }

    // --- Controls Construction ---
    createKnobHTML(id, label, value, min, max, step) {
        // Calculate initial rotation
        const percentage = (value - min) / (max - min);
        const rotation = -135 + (percentage * 270);
        const dashArray = `${percentage * 125}, 125`;
        
        return `
        <div class="knob-container group" id="${id}" data-min="${min}" data-max="${max}" data-step="${step}" data-value="${value}">
            <div class="knob-outer">
                <div class="knob-ring-bg"></div>
                <svg class="knob-svg" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#334155" stroke-width="4"></circle>
                    <circle class="knob-progress" cx="24" cy="24" r="20" fill="none" stroke="#0891b2" stroke-width="4" 
                            stroke-dasharray="${dashArray}" stroke-linecap="round"></circle>
                </svg>
                <div class="knob-body" style="transform: rotate(${rotation}deg);">
                    <div class="knob-pointer"></div>
                </div>
            </div>
            <div class="knob-label">${label}</div>
            <div class="knob-value">${Number(value).toFixed(step < 1 ? 2 : 0)}</div>
        </div>
        `;
    }

    bindKnobBehavior(id, callback) {
        const el = document.getElementById(id);
        const knobBody = el.querySelector('.knob-body');
        const progressCircle = el.querySelector('.knob-progress');
        const valueDisplay = el.querySelector('.knob-value');
        const min = parseFloat(el.dataset.min);
        const max = parseFloat(el.dataset.max);
        const step = parseFloat(el.dataset.step);
        
        let startY = 0;
        let startVal = 0;

        const onMouseMove = (e) => {
            const deltaY = startY - e.clientY;
            const range = max - min;
            const sensitivity = 200; 
            const deltaVal = (deltaY / sensitivity) * range;
            let newVal = startVal + deltaVal;
            newVal = Math.max(min, Math.min(max, newVal));
            if(step) newVal = Math.round(newVal / step) * step;

            // Visual Update
            const percentage = (newVal - min) / (max - min);
            const rotation = -135 + (percentage * 270);
            knobBody.style.transform = `rotate(${rotation}deg)`;
            progressCircle.setAttribute('stroke-dasharray', `${percentage * 125}, 125`);
            progressCircle.setAttribute('stroke', '#22d3ee'); // Active color
            valueDisplay.textContent = newVal.toFixed(step < 1 ? 2 : 0);
            
            callback(newVal);
        };

        const onMouseUp = () => {
            progressCircle.setAttribute('stroke', '#0891b2'); // Idle color
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        el.addEventListener('mousedown', (e) => {
            startY = e.clientY;
            startVal = parseFloat(valueDisplay.textContent); // crude but effective reading
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    }

    // --- SETUP METHODS ---

    setupKnobs() {
        const knobs = [
            // OSC
            { id: 'knob-container-detune', label: 'Detune', section: 'oscillator', key: 'detune', min: -100, max: 100, step: 1 },
            // FILTER
            { id: 'knob-cutoff', label: 'Cutoff', section: 'filter', key: 'cutoff', min: 20, max: 10000, step: 10 },
            { id: 'knob-res', label: 'Resonance', section: 'filter', key: 'resonance', min: 0, max: 20, step: 0.1 },
            { id: 'knob-envamt', label: 'Env Amt', section: 'filter', key: 'envAmount', min: 0, max: 5000, step: 10 },
            // LFO
            { id: 'knob-lfo-rate', label: 'Rate', section: 'lfo', key: 'rate', min: 0, max: 20, step: 0.1 },
            { id: 'knob-lfo-depth', label: 'Depth', section: 'lfo', key: 'depth', min: 0, max: 100, step: 1 },
            // GRANULAR
            { id: 'knob-gran-mix', label: 'Mix', section: 'granular', key: 'mix', min: 0, max: 1, step: 0.01 },
            { id: 'knob-gran-size', label: 'Size', section: 'granular', key: 'grainSize', min: 0.01, max: 0.5, step: 0.01 },
            { id: 'knob-gran-density', label: 'Density', section: 'granular', key: 'density', min: 0, max: 1, step: 0.01 },
            { id: 'knob-gran-spread', label: 'Spread', section: 'granular', key: 'spread', min: 0, max: 1, step: 0.01 },
            { id: 'knob-gran-fb', label: 'F.Back', section: 'granular', key: 'feedback', min: 0, max: 0.95, step: 0.01 },
            // DELAY
            { id: 'knob-delay-time', label: 'Time', section: 'delay', key: 'time', min: 0.01, max: 1.5, step: 0.01 },
            { id: 'knob-delay-fb', label: 'F.Back', section: 'delay', key: 'feedback', min: 0, max: 0.95, step: 0.01 },
            { id: 'knob-delay-prand', label: 'P.Rand', section: 'delay', key: 'pitchRandom', min: 0, max: 1, step: 0.01 },
            { id: 'knob-delay-mix', label: 'Mix', section: 'delay', key: 'mix', min: 0, max: 1, step: 0.01 },
            // MASTER
            { id: 'knob-verb-mix', label: 'Rev Mix', section: 'master', key: 'reverbMix', min: 0, max: 1, step: 0.01 },
            { id: 'knob-master-vol', label: 'Volume', section: 'master', key: 'gain', min: 0, max: 1, step: 0.01 },
        ];

        knobs.forEach(k => {
            const container = document.getElementById(k.id);
            if(container) {
                const val = this.params[k.section][k.key];
                container.innerHTML = this.createKnobHTML(k.id + '-el', k.label, val, k.min, k.max, k.step);
                this.bindKnobBehavior(k.id + '-el', (v) => this.updateParam(k.section, k.key, v));
            }
        });
    }

    setupSliders() {
        const sliders = [
            { id: 'env-atk', valId: 'val-env-atk', key: 'attack' },
            { id: 'env-dec', valId: 'val-env-dec', key: 'decay' },
            { id: 'env-sus', valId: 'val-env-sus', key: 'sustain' },
            { id: 'env-rel', valId: 'val-env-rel', key: 'release' }
        ];

        sliders.forEach(s => {
            const el = document.getElementById(s.id);
            const valEl = document.getElementById(s.valId);
            // Set init
            el.value = this.params.envelope[s.key];
            valEl.textContent = el.value;
            
            el.addEventListener('input', (e) => {
                const v = parseFloat(e.target.value);
                this.updateParam('envelope', s.key, v);
                valEl.textContent = v.toFixed(2);
            });
        });

        // Input Gain Slider
        const igEl = document.getElementById('input-gain');
        const igVal = document.getElementById('val-input-gain');
        igEl.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            igVal.textContent = Math.round(v * 100) + '%';
            if(this.synth) this.synth.setInputGain(v);
        });
    }

    setupSwitches() {
        // OSC
        document.getElementById('osc-type').addEventListener('change', (e) => this.updateParam('oscillator', 'type', e.target.value));
        // Filter
        document.getElementById('filter-type').addEventListener('change', (e) => this.updateParam('filter', 'type', e.target.value));
        // LFO
        document.getElementById('lfo-target').addEventListener('change', (e) => this.updateParam('lfo', 'target', e.target.value));
        
        // Granular Bypass
        const btnGranular = document.getElementById('btn-granular-toggle');
        btnGranular.addEventListener('click', () => {
            const enabled = !this.params.granular.enabled;
            this.updateParam('granular', 'enabled', enabled);
            btnGranular.textContent = enabled ? "Active" : "Bypass";
            btnGranular.className = enabled ? 
                "text-[10px] px-2 py-1 rounded font-bold uppercase bg-yellow-500 text-black" : 
                "text-[10px] px-2 py-1 rounded font-bold uppercase bg-slate-800 text-slate-500";
        });

        // Delay Bypass
        const btnDelay = document.getElementById('btn-delay-toggle');
        btnDelay.addEventListener('click', () => {
            const enabled = !this.params.delay.enabled;
            this.updateParam('delay', 'enabled', enabled);
            btnDelay.textContent = enabled ? "Active" : "Bypass";
            btnDelay.className = enabled ? 
                "text-[10px] px-2 py-1 rounded font-bold uppercase bg-indigo-500 text-white" : 
                "text-[10px] px-2 py-1 rounded font-bold uppercase bg-slate-800 text-slate-500";
        });

        // Delay Key/Scale
        const keySel = document.getElementById('delay-key');
        MUSICAL_KEYS.forEach(k => {
            const opt = document.createElement('option');
            opt.value = k; opt.textContent = k;
            keySel.appendChild(opt);
        });
        keySel.addEventListener('change', e => this.updateParam('delay', 'rootKey', e.target.value));

        const scaleSel = document.getElementById('delay-scale');
        Object.keys(SCALES).forEach(k => {
            const opt = document.createElement('option');
            opt.value = k; opt.textContent = k;
            scaleSel.appendChild(opt);
        });
        scaleSel.addEventListener('change', e => this.updateParam('delay', 'scale', e.target.value));

        // Reverb Types
        document.querySelectorAll('.btn-verb').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.updateParam('master', 'reverbType', type);
                document.querySelectorAll('.btn-verb').forEach(b => {
                    b.className = "btn-verb text-xs py-2 rounded font-bold capitalize transition-colors bg-slate-800 text-slate-400";
                });
                e.target.className = "btn-verb text-xs py-2 rounded font-bold capitalize transition-colors bg-pink-600 text-white";
            });
        });

        // HQ/Eco
        document.getElementById('btn-hq').addEventListener('click', () => {
             this.updateParam('performanceMode', 'performanceMode', 'HQ'); // Hacky prop access but works
             this.params.performanceMode = 'HQ';
             this.updateEngine();
             document.getElementById('btn-hq').className = "text-[10px] font-bold px-2 py-1 rounded transition-colors bg-cyan-600 text-white";
             document.getElementById('btn-eco').className = "text-[10px] font-bold px-2 py-1 rounded transition-colors text-slate-400";
        });
        document.getElementById('btn-eco').addEventListener('click', () => {
             this.params.performanceMode = 'Eco';
             this.updateEngine();
             document.getElementById('btn-eco').className = "text-[10px] font-bold px-2 py-1 rounded transition-colors bg-green-600 text-white";
             document.getElementById('btn-hq').className = "text-[10px] font-bold px-2 py-1 rounded transition-colors text-slate-400";
        });

        // Hold
        const btnHold = document.getElementById('btn-hold');
        btnHold.addEventListener('click', () => {
            this.isHold = !this.isHold;
            this.updateEngine();
            btnHold.textContent = `Hold: ${this.isHold ? 'ON' : 'OFF'}`;
            btnHold.className = this.isHold ? 
                "px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border bg-yellow-500 border-yellow-400 text-black" :
                "px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700";
        });
    }

    setupPresetLoader() {
        const sel = document.getElementById('preset-select');
        PRESETS.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.name;
            opt.textContent = p.name;
            sel.appendChild(opt);
        });
        
        sel.addEventListener('change', (e) => {
            const p = PRESETS.find(pr => pr.name === e.target.value);
            if(p) {
                // Apply params
                // Note: updating the JS object is easy, updating the UI knobs visual state 
                // requires re-rendering or manually updating style/text of every DOM element.
                // For this standalone version, we will do a reload of knobs.
                this.params = JSON.parse(JSON.stringify(p.params));
                this.updateEngine();
                // Re-init UI values (Simple brute force for simplicity)
                this.setupKnobs();
                this.setupSliders(); // Re-bind
                
                // Update specific switches
                document.getElementById('osc-type').value = this.params.oscillator.type;
                document.getElementById('filter-type').value = this.params.filter.type;
            }
        });
    }

    renderKeyboard() {
        const container = document.getElementById('keyboard-container');
        let html = '';
        NOTES.forEach((note, i) => {
            if (note.isSharp) return; // Sharps rendered via next note logic in CSS, here handled manually

            const nextNote = NOTES[i+1];
            const hasSharp = nextNote && nextNote.isSharp;
            
            html += `
                <div class="piano-key" data-index="${i}">
                    <div class="absolute bottom-2 w-full text-center text-xs text-slate-400 font-bold pointer-events-none">${note.note}${note.octave}</div>
                    ${hasSharp ? `<div class="piano-key-black" data-index="${i+1}" style="left: 65%;"></div>` : ''}
                </div>
            `;
        });
        container.innerHTML = html;

        // Event Binding
        const handleNoteOn = (idx) => {
            if(idx === undefined || isNaN(idx)) return;
            const keyEl = document.querySelector(`[data-index="${idx}"]`);
            if(keyEl) keyEl.classList.add('active');
            if(this.synth && NOTES[idx]) this.synth.playNote(parseInt(idx), NOTES[idx].frequency);
        };

        const handleNoteOff = (idx) => {
            if(idx === undefined || isNaN(idx)) return;
            const keyEl = document.querySelector(`[data-index="${idx}"]`);
            if(keyEl) keyEl.classList.remove('active');
            if(this.synth) this.synth.stopNote(parseInt(idx));
        };

        // Mouse/Touch
        container.querySelectorAll('[data-index]').forEach(el => {
            const idx = parseInt(el.dataset.index);
            el.addEventListener('mousedown', (e) => { e.stopPropagation(); handleNoteOn(idx); });
            el.addEventListener('mouseup', (e) => { e.stopPropagation(); handleNoteOff(idx); });
            el.addEventListener('mouseleave', (e) => { e.stopPropagation(); handleNoteOff(idx); });
            // Touch
            el.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); handleNoteOn(idx); });
            el.addEventListener('touchend', (e) => { e.preventDefault(); e.stopPropagation(); handleNoteOff(idx); });
        });

        // QWERTY
        window.addEventListener('keydown', (e) => {
            if(e.repeat) return;
            const idx = KEYBOARD_MAP[e.key.toLowerCase()];
            if(idx !== undefined) handleNoteOn(idx);
        });
        window.addEventListener('keyup', (e) => {
            const idx = KEYBOARD_MAP[e.key.toLowerCase()];
            if(idx !== undefined) handleNoteOff(idx);
        });
    }

    setupRecorder() {
        const btnRec = document.getElementById('btn-rec');
        const btnPlay = document.getElementById('btn-play');
        const btnClear = document.getElementById('btn-clear');
        const recStatus = document.getElementById('rec-status');
        const checkLoop = document.getElementById('rec-loop');

        const updateTimer = () => {
            const m = Math.floor(this.recDuration / 60);
            const s = this.recDuration % 60;
            recStatus.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
        };

        btnRec.addEventListener('click', () => {
            if (!this.synth) return;
            if (this.isRecording) {
                // STOP REC
                this.synth.stopRecording().then(() => {
                    this.isRecording = false;
                    this.hasRecording = true;
                    clearInterval(this.recInterval);
                    btnRec.innerHTML = "REC";
                    btnRec.className = "py-3 rounded-lg font-bold text-xs bg-slate-800 text-slate-300";
                    btnPlay.disabled = false;
                    btnClear.disabled = false;
                    recStatus.textContent = "SAVED";
                });
            } else {
                // START REC
                this.synth.clearRecording();
                this.synth.startRecording();
                this.isRecording = true;
                this.hasRecording = false;
                this.recDuration = 0;
                
                btnRec.innerHTML = "STOP";
                btnRec.className = "py-3 rounded-lg font-bold text-xs bg-red-600 text-white animate-pulse";
                btnPlay.disabled = true;
                btnClear.disabled = true;

                this.recInterval = setInterval(() => {
                    this.recDuration++;
                    updateTimer();
                }, 1000);
            }
        });

        btnPlay.addEventListener('click', () => {
             if(this.isPlaying) {
                 this.synth.stopPlayback();
                 this.isPlaying = false;
                 btnPlay.textContent = "PLAY";
                 btnPlay.className = "py-3 rounded-lg font-bold text-xs bg-slate-800 text-slate-300";
             } else {
                 this.synth.playRecording(checkLoop.checked);
                 this.isPlaying = true;
                 btnPlay.textContent = "STOP";
                 btnPlay.className = "py-3 rounded-lg font-bold text-xs bg-green-600 text-white";
             }
        });

        btnClear.addEventListener('click', () => {
            this.synth.clearRecording();
            this.hasRecording = false;
            this.isPlaying = false;
            this.recDuration = 0;
            recStatus.textContent = "0:00";
            btnPlay.disabled = true;
            btnPlay.className = "py-3 rounded-lg font-bold text-xs bg-slate-800 text-slate-300";
        });
    }

    setupLiveInput() {
        const btnToggle = document.getElementById('btn-input-toggle');
        const checkFx = document.getElementById('input-fx-send');
        const canvas = document.getElementById('vu-meter');
        const ctx = canvas.getContext('2d');
        
        let isActive = false;

        btnToggle.addEventListener('click', async () => {
            if(!this.synth) return;
            if(!isActive) {
                const ok = await this.synth.initAudioInput();
                if(ok) {
                    isActive = true;
                    btnToggle.textContent = "Active";
                    btnToggle.className = "w-full py-2 rounded font-bold text-xs uppercase tracking-wide bg-orange-600 text-white shadow-lg";
                    this.synth.setInputGain(parseFloat(document.getElementById('input-gain').value));
                    this.drawVuMeter(canvas, ctx);
                } else {
                    btnToggle.textContent = "Error: Access Denied";
                    btnToggle.className = "w-full py-2 rounded font-bold text-xs uppercase tracking-wide bg-red-800 text-white";
                }
            } else {
                // "Mute" logic for simplicity
                this.synth.setInputGain(0);
                isActive = false;
                btnToggle.textContent = "Enable Mic/Line";
                btnToggle.className = "w-full py-2 rounded font-bold text-xs uppercase tracking-wide bg-slate-800 text-slate-400";
                cancelAnimationFrame(this.visualizerId);
            }
        });

        checkFx.addEventListener('change', (e) => {
            if(this.synth) this.synth.setInputFXSend(e.target.checked);
        });
    }

    drawVuMeter(canvas, ctx) {
        if(!this.synth) return;
        const bufferLength = 256;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            this.synth.getAnalyserData(dataArray);
            let sum = 0;
            for(let i=0; i<bufferLength; i++) sum += dataArray[i];
            const avg = sum / bufferLength;
            
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0,0,w,h);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0,0,w,h);

            const meterW = (avg / 128) * w;
            const gradient = ctx.createLinearGradient(0,0,w,0);
            gradient.addColorStop(0, '#22d3ee');
            gradient.addColorStop(0.6, '#4ade80');
            gradient.addColorStop(1, '#f43f5e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0,0, meterW, h);

            this.visualizerId = requestAnimationFrame(draw);
        };
        draw();
    }
}

// Start App
window.addEventListener('DOMContentLoaded', () => {
    const app = new SynthesizerUI();
});