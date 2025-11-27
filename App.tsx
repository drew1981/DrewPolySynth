
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SynthEngine } from './services/synthEngine';
import { DEFAULT_PARAMS, PRESETS, MUSICAL_KEYS, SCALES } from './constants';
import { SynthParams, Waveform, FilterType, ReverbType, MusicalKey, ScaleMode } from './types';
import { Keyboard } from './components/Keyboard';
import { ControlKnob } from './components/ControlKnob';
import { ControlSlider } from './components/ControlSlider';
import { LiveInput } from './components/LiveInput';
import { Recorder } from './components/Recorder';

const App: React.FC = () => {
  const [params, setParams] = useState<SynthParams>(DEFAULT_PARAMS);
  const synthRef = useRef<SynthEngine | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isHold, setIsHold] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<string>("Init Saw");

  // Initialize Synth Engine
  useEffect(() => {
    synthRef.current = new SynthEngine(params);
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync params to engine
  useEffect(() => {
    if (synthRef.current) {
        synthRef.current.updateParams(params);
    }
  }, [params]);

  // Sync Hold
  useEffect(() => {
      if (synthRef.current) {
          synthRef.current.setHold(isHold);
      }
  }, [isHold]);

  const updateParam = useCallback((section: Exclude<keyof SynthParams, 'performanceMode'>, key: string, value: any) => {
    setParams(prev => ({
        ...prev,
        [section]: {
            ...(prev[section] as object),
            [key]: value
        }
    }));
    const match = PRESETS.find(p => JSON.stringify(p.params) === JSON.stringify({...params, [section]: {...(params[section] as object), [key]: value}}));
    setCurrentPreset(match ? match.name : "Custom");
  }, [params]);

  const loadPreset = (name: string) => {
      const preset = PRESETS.find(p => p.name === name);
      if (preset) {
          setParams(preset.params);
          setCurrentPreset(name);
      }
  };

  const handleNoteOn = useCallback((index: number, freq: number) => {
    if (!isStarted) {
        setIsStarted(true);
        synthRef.current?.resumeContext();
    }
    synthRef.current?.playNote(index, freq);
  }, [isStarted]);

  const handleNoteOff = useCallback((index: number) => {
    synthRef.current?.stopNote(index);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-white/20 pb-20">
      {/* Header */}
      <header className="p-4 border-b border-neutral-800 bg-[#0f0f0f] flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></div>
            <div>
                <h1 className="text-xl font-bold tracking-[0.2em] text-white uppercase">
                PolyWave Studio
                </h1>
            </div>
        </div>
        
        <div className="flex items-center gap-6">
            {/* Performance Mode */}
            <div className="flex bg-neutral-900 rounded border border-neutral-800 p-0.5">
                 <button
                    onClick={() => setParams(p => ({...p, performanceMode: 'HQ'}))}
                    className={`text-[10px] font-bold px-3 py-1 rounded transition-colors uppercase tracking-wider ${params.performanceMode === 'HQ' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                 >
                     HQ
                 </button>
                 <button
                    onClick={() => setParams(p => ({...p, performanceMode: 'Eco'}))}
                    className={`text-[10px] font-bold px-3 py-1 rounded transition-colors uppercase tracking-wider ${params.performanceMode === 'Eco' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                 >
                     ECO (Pi)
                 </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Preset</span>
                <select 
                    value={currentPreset}
                    onChange={(e) => loadPreset(e.target.value)}
                    className="bg-neutral-900 text-white text-xs font-bold border border-neutral-700 rounded px-2 py-1 outline-none uppercase tracking-wide focus:border-white"
                >
                    <option value="Custom">Custom</option>
                    {PRESETS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
            </div>

            {/* Hold Button */}
            <button
                onClick={() => setIsHold(!isHold)}
                className={`
                    px-4 py-1 rounded font-bold text-[10px] uppercase tracking-[0.15em] transition-all border
                    ${isHold 
                        ? 'bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                        : 'bg-transparent border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300'}
                `}
            >
                Hold {isHold ? '[ON]' : '[OFF]'}
            </button>
        </div>
      </header>

      <main className="container mx-auto p-4 lg:p-8 space-y-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* 1. OSCILLATOR */}
            <div className="md:col-span-3 bg-[#111] rounded border border-neutral-800 p-6 flex flex-col items-center">
                <h2 className="text-xs font-bold text-neutral-500 mb-6 tracking-[0.2em] uppercase w-full text-center border-b border-neutral-800 pb-2">Oscillator</h2>
                
                <div className="w-full space-y-8">
                    <div className="w-full">
                        <select 
                            value={params.oscillator.type}
                            onChange={(e) => updateParam('oscillator', 'type', e.target.value as Waveform)}
                            className="w-full bg-[#0a0a0a] border border-neutral-700 text-white text-xs font-mono uppercase rounded p-2 outline-none text-center"
                        >
                            <option value="sine">Sine</option>
                            <option value="square">Square</option>
                            <option value="sawtooth">Sawtooth</option>
                            <option value="triangle">Triangle</option>
                        </select>
                    </div>
                    <div className="flex justify-center">
                        <ControlKnob 
                            label="Detune" 
                            min={-100} max={100} 
                            value={params.oscillator.detune} 
                            onChange={(v) => updateParam('oscillator', 'detune', v)} 
                        />
                    </div>
                </div>
            </div>

            {/* 2. FILTER & LFO */}
            <div className="md:col-span-5 bg-[#111] rounded border border-neutral-800 p-6">
                <h2 className="text-xs font-bold text-neutral-500 mb-6 tracking-[0.2em] uppercase w-full text-center border-b border-neutral-800 pb-2">Filter & LFO</h2>
                
                <div className="flex gap-6 justify-center mb-8">
                     <div className="w-24 flex flex-col justify-end">
                        <select 
                            value={params.filter.type}
                            onChange={(e) => updateParam('filter', 'type', e.target.value as FilterType)}
                            className="w-full bg-[#0a0a0a] border border-neutral-700 text-white text-[10px] uppercase rounded p-1 outline-none font-mono"
                        >
                            <option value="lowpass">LPF</option>
                            <option value="highpass">HPF</option>
                            <option value="bandpass">BPF</option>
                        </select>
                     </div>
                     <ControlKnob label="Cutoff" min={20} max={10000} step={10} value={params.filter.cutoff} onChange={(v) => updateParam('filter', 'cutoff', v)} />
                     <ControlKnob label="Res" min={0} max={20} value={params.filter.resonance} onChange={(v) => updateParam('filter', 'resonance', v)} />
                     <ControlKnob label="Env Amt" min={0} max={5000} step={10} value={params.filter.envAmount} onChange={(v) => updateParam('filter', 'envAmount', v)} />
                </div>
                
                <div className="border-t border-neutral-800 pt-6 flex gap-8 justify-center items-center">
                    <div className="flex flex-col gap-2">
                         <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider text-center">Target</span>
                         <div className="flex flex-col gap-1">
                             {(['pitch', 'cutoff', 'amp'] as const).map(target => (
                                 <button 
                                    key={target}
                                    onClick={() => updateParam('lfo', 'target', target)}
                                    className={`text-[9px] px-2 py-0.5 rounded uppercase tracking-wider font-bold border ${params.lfo.target === target ? 'bg-white text-black border-white' : 'text-neutral-500 border-neutral-800 hover:border-neutral-600'}`}
                                 >{target}</button>
                             ))}
                         </div>
                    </div>
                    <ControlKnob label="Rate" min={0} max={20} value={params.lfo.rate} onChange={(v) => updateParam('lfo', 'rate', v)} step={0.1} />
                    <ControlKnob label="Depth" min={0} max={100} value={params.lfo.depth} onChange={(v) => updateParam('lfo', 'depth', v)} />
                </div>
            </div>

            {/* 3. ENVELOPE */}
            <div className="md:col-span-4 bg-[#111] rounded border border-neutral-800 p-6">
                <h2 className="text-xs font-bold text-neutral-500 mb-6 tracking-[0.2em] uppercase w-full text-center border-b border-neutral-800 pb-2">Envelope</h2>
                <div className="flex justify-between items-center h-48 px-4">
                    <ControlSlider vertical label="ATK" min={0.01} max={2} value={params.envelope.attack} onChange={(v) => updateParam('envelope', 'attack', v)} />
                    <ControlSlider vertical label="DEC" min={0.1} max={2} value={params.envelope.decay} onChange={(v) => updateParam('envelope', 'decay', v)} />
                    <ControlSlider vertical label="SUS" min={0} max={1} value={params.envelope.sustain} onChange={(v) => updateParam('envelope', 'sustain', v)} />
                    <ControlSlider vertical label="REL" min={0.1} max={5} value={params.envelope.release} onChange={(v) => updateParam('envelope', 'release', v)} />
                </div>
            </div>

            {/* 4. GRANULAR FX */}
            <div className="md:col-span-6 bg-[#111] rounded border border-neutral-800 p-6">
                <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-2">
                     <h2 className="text-xs font-bold text-neutral-500 tracking-[0.2em] uppercase">Granular Cloud</h2>
                     <button
                        onClick={() => updateParam('granular', 'enabled', !params.granular.enabled)}
                        className={`text-[9px] px-2 py-0.5 border rounded uppercase font-bold tracking-wider ${params.granular.enabled ? 'bg-white text-black border-white' : 'bg-transparent text-neutral-600 border-neutral-800'}`}
                     >
                         {params.granular.enabled ? 'ON' : 'BYPASS'}
                     </button>
                </div>
                
                <div className="flex justify-around items-center">
                    <ControlKnob label="Mix" min={0} max={1} step={0.01} value={params.granular.mix} onChange={(v) => updateParam('granular', 'mix', v)} />
                    <ControlKnob label="Size" min={0.01} max={0.5} step={0.01} value={params.granular.grainSize} onChange={(v) => updateParam('granular', 'grainSize', v)} />
                    <ControlKnob label="Density" min={0} max={1} step={0.01} value={params.granular.density} onChange={(v) => updateParam('granular', 'density', v)} />
                    <ControlKnob label="Spread" min={0} max={1} step={0.01} value={params.granular.spread} onChange={(v) => updateParam('granular', 'spread', v)} />
                    <ControlKnob label="F.Back" min={0} max={0.95} step={0.01} value={params.granular.feedback} onChange={(v) => updateParam('granular', 'feedback', v)} />
                </div>
            </div>

            {/* 5. DELAY FX */}
            <div className="md:col-span-6 bg-[#111] rounded border border-neutral-800 p-6">
                <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-2">
                     <h2 className="text-xs font-bold text-neutral-500 tracking-[0.2em] uppercase">Quantized Delay</h2>
                     <button
                        onClick={() => updateParam('delay', 'enabled', !params.delay.enabled)}
                        className={`text-[9px] px-2 py-0.5 border rounded uppercase font-bold tracking-wider ${params.delay.enabled ? 'bg-white text-black border-white' : 'bg-transparent text-neutral-600 border-neutral-800'}`}
                     >
                         {params.delay.enabled ? 'ON' : 'BYPASS'}
                     </button>
                </div>
                
                <div className="flex flex-col gap-6">
                     <div className="flex gap-4 justify-center">
                        <select 
                            value={params.delay.rootKey}
                            onChange={(e) => updateParam('delay', 'rootKey', e.target.value)}
                            className="bg-[#0a0a0a] text-neutral-300 text-[10px] font-bold rounded p-1 outline-none border border-neutral-700 w-16 text-center"
                        >
                            {MUSICAL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                         <select 
                            value={params.delay.scale}
                            onChange={(e) => updateParam('delay', 'scale', e.target.value)}
                            className="bg-[#0a0a0a] text-neutral-300 text-[10px] font-bold rounded p-1 outline-none border border-neutral-700 w-24 text-center"
                        >
                            {Object.keys(SCALES).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                     </div>

                     <div className="flex justify-around items-center">
                        <ControlKnob label="Time" min={0.01} max={1.5} step={0.01} value={params.delay.time} onChange={(v) => updateParam('delay', 'time', v)} />
                        <ControlKnob label="F.Back" min={0} max={0.95} step={0.01} value={params.delay.feedback} onChange={(v) => updateParam('delay', 'feedback', v)} />
                         <ControlKnob label="Rand" min={0} max={1} step={0.01} value={params.delay.pitchRandom} onChange={(v) => updateParam('delay', 'pitchRandom', v)} />
                        <ControlKnob label="Mix" min={0} max={1} step={0.01} value={params.delay.mix} onChange={(v) => updateParam('delay', 'mix', v)} />
                    </div>
                </div>
            </div>

            {/* 6. MASTER FX */}
            <div className="md:col-span-12 bg-[#111] rounded border border-neutral-800 p-6">
                <h2 className="text-xs font-bold text-neutral-500 mb-6 tracking-[0.2em] uppercase w-full text-center border-b border-neutral-800 pb-2">Master Chain</h2>
                
                <div className="grid grid-cols-2 gap-8">
                    <div className="flex items-center justify-center gap-4">
                        {['off', 'hall', 'shimmer'].map((type) => (
                            <button
                                key={type}
                                onClick={() => updateParam('master', 'reverbType', type)}
                                className={`
                                    text-[10px] px-4 py-2 rounded uppercase font-bold tracking-widest border transition-all
                                    ${params.master.reverbType === type 
                                        ? 'bg-white text-black border-white' 
                                        : 'bg-transparent text-neutral-600 border-neutral-800 hover:border-neutral-600'}
                                `}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex justify-center items-center gap-12">
                        <ControlKnob label="Reverb" min={0} max={1} step={0.01} value={params.master.reverbMix} onChange={(v) => updateParam('master', 'reverbMix', v)} />
                        <div className="w-px h-12 bg-neutral-800"></div>
                        <ControlKnob label="Volume" min={0} max={1} step={0.01} value={params.master.gain} onChange={(v) => updateParam('master', 'gain', v)} />
                    </div>
                </div>
            </div>

            {/* 7. UTILITY RACK */}
            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiveInput engine={synthRef.current} />
                <Recorder engine={synthRef.current} />
            </div>

        </div>

        {/* Keyboard */}
        <div className="pt-4">
            <Keyboard onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} />
        </div>

      </main>
    </div>
  );
};

export default App;
