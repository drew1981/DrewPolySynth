
import { SynthParams, DelayParams, MusicalKey, ScaleMode } from '../types';
import { SCALES, MUSICAL_KEYS, ECO_MAX_VOICES, HQ_MAX_VOICES } from '../constants';

interface Grain {
    bufferIndex: number;
    position: number;
    speed: number;
    duration: number;
    pan: number;
}

interface DelayGrain {
    bufferIndex: number;
    position: number;
    speed: number;
    duration: number;
    pan: number;
    gain: number;
}

export class SynthEngine {
  public ctx: AudioContext;
  private masterGain: GainNode;
  private reverbNode: ConvolverNode;
  private dryNode: GainNode;
  private wetNode: GainNode;
  private compressor: DynamicsCompressorNode;
  private analyser: AnalyserNode;
  private recorderDest: MediaStreamAudioDestinationNode;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private playbackSource: AudioBufferSourceNode | null = null;

  // Granular Section
  private granularNode: ScriptProcessorNode;
  private granularBuffer: Float32Array;
  private granularWriteIndex: number = 0;
  private activeGrains: Grain[] = [];
  private grainSpawnTimer: number = 0;
  private granularDry: GainNode;
  private granularWet: GainNode;
  private MAX_GRAINS = 40; // Hard limit to prevent UI freezes

  // Delay Section
  private delayNode: ScriptProcessorNode;
  private delayBuffer: Float32Array;
  private delayWriteIndex: number = 0;
  private activeDelayGrains: DelayGrain[] = [];
  private delayTimer: number = 0;
  private delayDry: GainNode;
  private delayWet: GainNode;

  // Live Input
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private inputGain: GainNode;
  private inputSendToFx: GainNode;
  private inputDry: GainNode;

  // Active Voices
  private activeVoices: Map<number, Voice> = new Map();
  private heldNotes: Set<number> = new Set();
  private hallBuffer: AudioBuffer | null = null;
  private shimmerBuffer: AudioBuffer | null = null;
  
  // State
  private params: SynthParams;
  public isHoldEnabled: boolean = false;
  private voiceDestination: GainNode;

  constructor(initialParams: SynthParams) {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.params = initialParams;

    // --- Signal Chain Setup ---

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -20;
    this.compressor.ratio.value = 4;
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = initialParams.master.gain;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048; // High resolution for spectrum analysis
    this.analyser.smoothingTimeConstant = 0.85;

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

    // Initialize ScriptProcessors
    this.granularNode = this.ctx.createScriptProcessor(4096, 2, 2); 
    this.granularBuffer = new Float32Array(this.ctx.sampleRate * 2); 
    this.granularNode.onaudioprocess = this.processGranular.bind(this);

    this.delayNode = this.ctx.createScriptProcessor(4096, 2, 2);
    this.delayBuffer = new Float32Array(this.ctx.sampleRate * 4);
    this.delayNode.onaudioprocess = this.processDelay.bind(this);

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

    // Effects Init
    this.generateReverbBuffers();
    this.updateReverbState();
    this.updateGranularState();
    this.updateDelayState();
  }

  private processGranular(e: AudioProcessingEvent) {
      if (!this.params.granular.enabled) {
          // Hard Bypass for CPU saving
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

          // Process Grains
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

          // Spawn Logic
          this.grainSpawnTimer--;
          if (this.grainSpawnTimer <= 0) {
              this.grainSpawnTimer = spawnInterval * (0.5 + Math.random());
              
              // Only spawn if below MAX_GRAINS limit
              if (this.activeGrains.length < this.MAX_GRAINS) {
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
  }

  private processDelay(e: AudioProcessingEvent) {
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
              
              // Only spawn if below MAX_GRAINS limit
              if (this.activeDelayGrains.length < this.MAX_GRAINS) {
                  let startIdx = this.delayWriteIndex - delaySamples;
                  if (startIdx < 0) startIdx += this.delayBuffer.length;
                  
                  const speed = getRandomSpeed();
                  const duration = delaySamples; 

                  this.activeDelayGrains.push({
                      bufferIndex: startIdx,
                      position: 0,
                      speed: speed,
                      duration: duration,
                      pan: (Math.random() * 0.4 - 0.2), 
                      gain: 1.0 
                  });
              }
          }
      }
  }

  public async initAudioInput() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
                echoCancellation: false, 
                noiseSuppression: false,
                autoGainControl: false
            } 
        });
        
        this.inputSource = this.ctx.createMediaStreamSource(stream);
        this.inputSource.connect(this.inputGain);
        return true;
    } catch (err) {
        console.error("Audio Input Error:", err);
        return false;
    }
  }

  public setInputGain(val: number) {
      this.inputGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
  }

  public setInputFXSend(enabled: boolean) {
      const target = enabled ? 1 : 0;
      this.inputSendToFx.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
  }

  public getAnalyserFrequencyData(array: Uint8Array) {
      this.analyser.getByteFrequencyData(array);
  }

  public getAnalyserTimeData(array: Uint8Array) {
      this.analyser.getByteTimeDomainData(array);
  }

  public resumeContext() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateParams(newParams: SynthParams) {
    const oldParams = this.params;
    this.params = newParams;

    // Trigger Reverb Regeneration if Performance Mode Changed
    if (oldParams.performanceMode !== newParams.performanceMode) {
        this.generateReverbBuffers();
        // Force update assignment
        this.updateReverbState();
    }

    this.masterGain.gain.setTargetAtTime(newParams.master.gain, this.ctx.currentTime, 0.1);
    
    if (oldParams.master.reverbMix !== newParams.master.reverbMix || 
        oldParams.master.reverbType !== newParams.master.reverbType) {
      this.updateReverbState();
    }

    if (JSON.stringify(oldParams.granular) !== JSON.stringify(newParams.granular)) {
        this.updateGranularState();
    }

    if (JSON.stringify(oldParams.delay) !== JSON.stringify(newParams.delay)) {
        this.updateDelayState();
    }

    this.activeVoices.forEach(voice => voice.updateParams(newParams));
  }

  private updateGranularState() {
      const { enabled, mix } = this.params.granular;
      const t = this.ctx.currentTime;
      
      // We also bypass inside processGranular, but gain staging ensures smooth transition
      if (enabled) {
          this.granularDry.gain.setTargetAtTime(1 - mix, t, 0.1);
          this.granularWet.gain.setTargetAtTime(mix, t, 0.1);
      } else {
          this.granularDry.gain.setTargetAtTime(1, t, 0.1);
          this.granularWet.gain.setTargetAtTime(0, t, 0.1);
      }
  }

  private updateDelayState() {
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

  private updateReverbState() {
    const { reverbType, reverbMix } = this.params.master;

    if (reverbType === 'off') {
      this.wetNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      this.dryNode.gain.setTargetAtTime(1, this.ctx.currentTime, 0.1); 
    } else {
      const buffer = reverbType === 'hall' ? this.hallBuffer : this.shimmerBuffer;
      if (this.reverbNode.buffer !== buffer) {
        this.reverbNode.buffer = buffer;
      }
      this.wetNode.gain.setTargetAtTime(reverbMix, this.ctx.currentTime, 0.1);
      this.dryNode.gain.setTargetAtTime(1 - (reverbMix * 0.4), this.ctx.currentTime, 0.1); 
    }
  }

  public playNote(noteIndex: number, frequency: number) {
    this.resumeContext();

    // RPi Optimization: Max Voices
    const maxVoices = this.params.performanceMode === 'Eco' ? ECO_MAX_VOICES : HQ_MAX_VOICES;

    // Voice Stealing: If we are at limit, stop the oldest voice (first inserted)
    if (this.activeVoices.size >= maxVoices) {
        // Map iterators yield in insertion order
        const oldestNoteIndex = this.activeVoices.keys().next().value;
        if (oldestNoteIndex !== undefined) {
             this.stopNote(oldestNoteIndex);
        }
    }

    if (this.activeVoices.has(noteIndex)) {
        this.activeVoices.get(noteIndex)?.stop(); 
        this.activeVoices.delete(noteIndex);
    }

    const voice = new Voice(this.ctx, this.voiceDestination, frequency, this.params);
    voice.start();
    this.activeVoices.set(noteIndex, voice);
  }

  public stopNote(noteIndex: number) {
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

  public setHold(enabled: boolean) {
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

  // --- Recorder Functions ---

  public startRecording() {
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.recorderDest.stream, { mimeType: 'audio/webm' });
      
      this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
              this.recordedChunks.push(e.data);
          }
      };
      
      this.mediaRecorder.start();
  }

  public stopRecording(): Promise<void> {
      return new Promise((resolve) => {
          if (!this.mediaRecorder) return resolve();
          
          this.mediaRecorder.onstop = () => {
              resolve();
          };
          this.mediaRecorder.stop();
      });
  }

  public async playRecording(loop: boolean) {
      if (this.recordedChunks.length === 0) return;
      if (this.playbackSource) {
          this.playbackSource.stop();
      }

      const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

      this.playbackSource = this.ctx.createBufferSource();
      this.playbackSource.buffer = audioBuffer;
      this.playbackSource.loop = loop;
      this.playbackSource.connect(this.ctx.destination);
      this.playbackSource.start();
  }

  public stopPlayback() {
      if (this.playbackSource) {
          this.playbackSource.stop();
          this.playbackSource = null;
      }
  }

  public clearRecording() {
      this.recordedChunks = [];
      this.stopPlayback();
  }

  // --- Reverb Generation ---
  private generateReverbBuffers() {
    const isEco = this.params.performanceMode === 'Eco';
    
    // RPi Optimization: Shorter Impulse Responses in Eco Mode
    const hallDecay = isEco ? 1.2 : 2.5; 
    const shimmerDecay = isEco ? 2.0 : 4.0;
    
    this.hallBuffer = this.createImpulse(hallDecay, hallDecay, false);
    this.shimmerBuffer = this.createImpulse(shimmerDecay, 1.2, true);
  }

  private createImpulse(duration: number, decay: number, shimmer: boolean): AudioBuffer {
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

class Voice {
  private ctx: AudioContext;
  private osc: OscillatorNode;
  private filter: BiquadFilterNode;
  private amp: GainNode;
  private lfo: OscillatorNode;
  private lfoGain: GainNode;
  
  private params: SynthParams;
  private frequency: number;
  private startTime: number;

  constructor(ctx: AudioContext, destination: AudioNode, frequency: number, params: SynthParams) {
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

  private routeLFO() {
    this.lfoGain.disconnect();
    switch(this.params.lfo.target) {
        case 'pitch': this.lfoGain.connect(this.osc.detune); break;
        case 'cutoff': this.lfoGain.connect(this.filter.frequency); break;
        case 'amp': this.lfoGain.connect(this.amp.gain); break;
    }
  }

  private setupParams() {
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

  public start() {
    this.osc.start(this.startTime);
    this.lfo.start(this.startTime);
  }

  public updateParams(newParams: SynthParams) {
    const t = this.ctx.currentTime;
    this.params = newParams;
    
    this.osc.type = newParams.oscillator.type;
    this.osc.detune.setTargetAtTime(newParams.oscillator.detune, t, 0.1);
    this.filter.Q.setTargetAtTime(newParams.filter.resonance, t, 0.1);
    this.filter.frequency.setTargetAtTime(newParams.filter.cutoff, t, 0.1);
    
    this.lfo.frequency.setTargetAtTime(newParams.lfo.rate, t, 0.1);
    this.routeLFO();
  }

  public stop() {
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
