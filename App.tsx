
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

  const updateParam = useCallback((section: keyof SynthParams, key: string, value: any) => {
    setParams(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [key]: value
        }
    }));
    // Determine if custom
    const match = PRESETS.find(p => JSON.stringify(p.params) === JSON.stringify({...params, [section]: {...params[section], [key]: value}}));
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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 pb-20">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            POLYWAVE STUDIO
            </h1>
            <p className="text-slate-500 text-xs hidden sm:block">Polyphonic Synthesizer workstation</p>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Presets */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold px-2">Preset</span>
                <select 
                    value={currentPreset}
                    onChange={(e) => loadPreset(e.target.value)}
                    className="bg-slate-900 text-cyan-400 text-xs font-bold rounded p-1 outline-none border-none min-w-[100px]"
                >
                    <option value="Custom">Custom</option>
                    {PRESETS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
            </div>

            {/* Hold Button */}
            <button
                onClick={() => setIsHold(!isHold)}
                className={`
                    px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border
                    ${isHold 
                        ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}
                `}
            >
                Hold: {isHold ? 'ON' : 'OFF'}
            </button>
        </div>
      </header>

      <main className="container mx-auto p-4 lg:p-6 space-y-6">
        
        {/* Main Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* 1. OSCILLATOR (Col Span 3) */}
            <div className="md:col-span-3 bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                <h2 className="text-sm font-bold text-cyan-500 mb-4 tracking-widest uppercase">Oscillator</h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Waveform</label>
                        <select 
                            value={params.oscillator.type}
                            onChange={(e) => updateParam('oscillator', 'type', e.target.value as Waveform)}
                            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none"
                        >
                            <option value="sine">Sine</option>
                            <option value="square">Square</option>
                            <option value="sawtooth">Sawtooth</option>
                            <option value="triangle">Triangle</option>
                        </select>
                    </div>
                    <div className="flex justify-center pt-2">
                        <ControlKnob 
                            label="Detune" 
                            min={-100} max={100} 
                            value={params.oscillator.detune} 
                            onChange={(v) => updateParam('oscillator', 'detune', v)} 
                        />
                    </div>
                </div>
            </div>

            {/* 2. FILTER & LFO (Col Span 5) */}
            <div className="md:col-span-5 bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                <h2 className="text-sm font-bold text-purple-500 mb-4 tracking-widest uppercase">Filter & LFO</h2>
                
                <div className="flex flex-wrap gap-4 justify-around">
                     <div className="w-32 mb-2">
                        <select 
                            value={params.filter.type}
                            onChange={(e) => updateParam('filter', 'type', e.target.value as FilterType)}
                            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded p-2 outline-none"
                        >
                            <option value="lowpass">Low Pass</option>
                            <option value="highpass">High Pass</option>
                            <option value="bandpass">Band Pass</option>
                        </select>
                     </div>

                     <ControlKnob 
                        label="Cutoff" 
                        min={20} max={10000} step={10}
                        value={params.filter.cutoff} 
                        onChange={(v) => updateParam('filter', 'cutoff', v)} 
                    />
                     <ControlKnob 
                        label="Resonance" 
                        min={0} max={20} 
                        value={params.filter.resonance} 
                        onChange={(v) => updateParam('filter', 'resonance', v)} 
                    />
                    <ControlKnob 
                        label="Env Amt" 
                        min={0} max={5000} step={10}
                        value={params.filter.envAmount} 
                        onChange={(v) => updateParam('filter', 'envAmount', v)} 
                    />
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex gap-2 items-center mb-2 justify-center">
                         <span className="text-[10px] text-slate-500 font-bold uppercase">LFO Dest</span>
                         <div className="flex bg-slate-800 rounded p-1">
                             {(['pitch', 'cutoff', 'amp'] as const).map(target => (
                                 <button 
                                    key={target}
                                    onClick={() => updateParam('lfo', 'target', target)}
                                    className={`text-[10px] px-2 py-0.5 rounded capitalize ${params.lfo.target === target ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                                 >{target}</button>
                             ))}
                         </div>
                    </div>
                    <div className="flex justify-around">
                        <ControlKnob label="Rate" min={0} max={20} value={params.lfo.rate} onChange={(v) => updateParam('lfo', 'rate', v)} step={0.1} />
                        <ControlKnob label="Depth" min={0} max={100} value={params.lfo.depth} onChange={(v) => updateParam('lfo', 'depth', v)} />
                    </div>
                </div>
            </div>

            {/* 3. ENVELOPE (Col Span 4) */}
            <div className="md:col-span-4 bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <h2 className="text-sm font-bold text-emerald-500 mb-4 tracking-widest uppercase">Amp Envelope</h2>
                
                <div className="flex justify-between items-end h-40 pb-2">
                    <ControlSlider vertical label="A" min={0.01} max={2} value={params.envelope.attack} onChange={(v) => updateParam('envelope', 'attack', v)} />
                    <ControlSlider vertical label="D" min={0.1} max={2} value={params.envelope.decay} onChange={(v) => updateParam('envelope', 'decay', v)} />
                    <ControlSlider vertical label="S" min={0} max={1} value={params.envelope.sustain} onChange={(v) => updateParam('envelope', 'sustain', v)} />
                    <ControlSlider vertical label="R" min={0.1} max={5} value={params.envelope.release} onChange={(v) => updateParam('envelope', 'release', v)} />
                </div>
            </div>

            {/* 4. GRANULAR FX (Col Span 6) */}
            <div className="md:col-span-6 bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-sm font-bold text-yellow-500 tracking-widest uppercase">Granular Cloud</h2>
                     <button
                        onClick={() => updateParam('granular', 'enabled', !params.granular.enabled)}
                        className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${params.granular.enabled ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-500'}`}
                     >
                         {params.granular.enabled ? 'Active' : 'Bypass'}
                     </button>
                </div>
                
                <div className="flex justify-around items-center">
                    <ControlKnob 
                        label="Mix" min={0} max={1} step={0.01}
                        value={params.granular.mix} onChange={(v) => updateParam('granular', 'mix', v)} 
                    />
                    <ControlKnob 
                        label="Size" min={0.01} max={0.5} step={0.01}
                        value={params.granular.grainSize} onChange={(v) => updateParam('granular', 'grainSize', v)} 
                    />
                    <ControlKnob 
                        label="Density" min={0} max={1} step={0.01}
                        value={params.granular.density} onChange={(v) => updateParam('granular', 'density', v)} 
                    />
                    <ControlKnob 
                        label="Spread" min={0} max={1} step={0.01}
                        value={params.granular.spread} onChange={(v) => updateParam('granular', 'spread', v)} 
                    />
                    <ControlKnob 
                        label="F.Back" min={0} max={0.95} step={0.01}
                        value={params.granular.feedback} onChange={(v) => updateParam('granular', 'feedback', v)} 
                    />
                </div>
            </div>

            {/* 5. DELAY FX (Col Span 6) - NEW */}
            <div className="md:col-span-6 bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-sm font-bold text-indigo-500 tracking-widest uppercase">Pitch Quantized Delay</h2>
                     <button
                        onClick={() => updateParam('delay', 'enabled', !params.delay.enabled)}
                        className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${params.delay.enabled ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                     >
                         {params.delay.enabled ? 'Active' : 'Bypass'}
                     </button>
                </div>
                
                <div className="flex flex-col gap-4">
                     {/* Scale Selectors */}
                     <div className="flex gap-2 justify-center">
                        <select 
                            value={params.delay.rootKey}
                            onChange={(e) => updateParam('delay', 'rootKey', e.target.value)}
                            className="bg-slate-800 text-indigo-400 text-xs font-bold rounded p-1 outline-none border border-slate-700"
                        >
                            {MUSICAL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                         <select 
                            value={params.delay.scale}
                            onChange={(e) => updateParam('delay', 'scale', e.target.value)}
                            className="bg-slate-800 text-indigo-400 text-xs font-bold rounded p-1 outline-none border border-slate-700"
                        >
                            {Object.keys(SCALES).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                     </div>

                     <div className="flex justify-around items-center">
                        <ControlKnob 
                            label="Time" min={0.01} max={1.5} step={0.01}
                            value={params.delay.time} onChange={(v) => updateParam('delay', 'time', v)} 
                        />
                        <ControlKnob 
                            label="F.Back" min={0} max={0.95} step={0.01}
                            value={params.delay.feedback} onChange={(v) => updateParam('delay', 'feedback', v)} 
                        />
                         <ControlKnob 
                            label="P.Random" min={0} max={1} step={0.01}
                            value={params.delay.pitchRandom} onChange={(v) => updateParam('delay', 'pitchRandom', v)} 
                        />
                        <ControlKnob 
                            label="Mix" min={0} max={1} step={0.01}
                            value={params.delay.mix} onChange={(v) => updateParam('delay', 'mix', v)} 
                        />
                    </div>
                </div>
            </div>

            {/* 6. MASTER FX (Col Span 12) */}
            <div className="md:col-span-12 bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                <h2 className="text-sm font-bold text-pink-500 mb-4 tracking-widest uppercase">Master Reverb</h2>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                         <div className="flex flex-col gap-2">
                            {['off', 'hall', 'shimmer'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => updateParam('master', 'reverbType', type)}
                                    className={`
                                        text-xs py-2 rounded font-bold capitalize transition-colors
                                        ${params.master.reverbType === type 
                                            ? 'bg-pink-600 text-white shadow-[0_0_10px_rgba(219,39,119,0.5)]' 
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}
                                    `}
                                >
                                    {type}
                                </button>
                            ))}
                         </div>
                    </div>
                    
                    <div className="flex justify-around items-center">
                        <ControlKnob 
                            label="Mix" 
                            min={0} max={1} step={0.01}
                            value={params.master.reverbMix} 
                            onChange={(v) => updateParam('master', 'reverbMix', v)} 
                        />
                        <ControlKnob 
                            label="Master Vol" 
                            min={0} max={1} step={0.01}
                            value={params.master.gain} 
                            onChange={(v) => updateParam('master', 'gain', v)} 
                        />
                    </div>
                </div>
            </div>

            {/* 7. UTILITY RACK (Col Span 12) */}
            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <LiveInput engine={synthRef.current} />
                <Recorder engine={synthRef.current} />
            </div>

        </div>

        {/* Keyboard Section */}
        <div className="pt-4">
            <Keyboard onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} />
            <div className="text-center mt-4 text-slate-600 text-xs">
                Playing with QWERTY? Try keys: A W S E D F T G Y H U J K
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;
