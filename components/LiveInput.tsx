import React, { useEffect, useRef, useState } from 'react';
import { SynthEngine } from '../services/synthEngine';

interface Props {
  engine: SynthEngine | null;
}

export const LiveInput: React.FC<Props> = ({ engine }) => {
  const [isActive, setIsActive] = useState(false);
  const [gain, setGain] = useState(0.5);
  const [sendToFx, setSendToFx] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const toggleInput = async () => {
      if (!engine) return;
      if (!isActive) {
          const success = await engine.initAudioInput();
          if (success) {
              setIsActive(true);
              engine.setInputGain(gain);
              engine.setInputFXSend(sendToFx);
              setError(null);
              startVisualizer();
          } else {
              setError("Mic Access Denied");
          }
      } else {
          // We don't really 'stop' the stream in the engine for simplicity, just mute it
          engine.setInputGain(0);
          setIsActive(false);
          if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      }
  };

  useEffect(() => {
      if (engine && isActive) {
          engine.setInputGain(gain);
      }
  }, [gain, engine, isActive]);

  useEffect(() => {
      if (engine && isActive) {
          engine.setInputFXSend(sendToFx);
      }
  }, [sendToFx, engine, isActive]);

  const startVisualizer = () => {
      if (!engine || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      const bufferLength = 256; // Matches fftSize in engine
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
          if (!engine) return;
          engine.getAnalyserData(dataArray);

          // Calculate RMS (roughly)
          let sum = 0;
          for(let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
          }
          const average = sum / bufferLength;
          
          // Draw VU Meter
          const width = canvasRef.current!.width;
          const height = canvasRef.current!.height;
          
          ctx.clearRect(0, 0, width, height);
          
          // Background
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, width, height);
          
          // Meter
          const meterWidth = (average / 128) * width; // 128 is approx mid-high amplitude
          
          const gradient = ctx.createLinearGradient(0, 0, width, 0);
          gradient.addColorStop(0, '#22d3ee');
          gradient.addColorStop(0.6, '#4ade80');
          gradient.addColorStop(1, '#f43f5e');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, meterWidth, height);

          animationRef.current = requestAnimationFrame(draw);
      };
      draw();
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col gap-4">
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
        <h2 className="text-sm font-bold text-orange-500 tracking-widest uppercase">Live Input</h2>

        <div className="flex flex-col gap-2">
            <button 
                onClick={toggleInput}
                className={`w-full py-2 rounded font-bold text-xs uppercase tracking-wide transition-all
                    ${isActive ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}
                `}
            >
                {isActive ? 'Active' : 'Enable Mic/Line'}
            </button>
            {error && <span className="text-xs text-red-500 text-center">{error}</span>}
        </div>

        <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500 font-bold">
                <span>INPUT GAIN</span>
                <span>{Math.round(gain * 100)}%</span>
            </div>
            <input 
                type="range" min={0} max={2} step={0.01} 
                value={gain} onChange={e => setGain(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
        </div>
        
        <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">Send to FX</span>
            <button 
                onClick={() => setSendToFx(!sendToFx)}
                className={`w-10 h-5 rounded-full relative transition-colors ${sendToFx ? 'bg-orange-500' : 'bg-slate-700'}`}
            >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${sendToFx ? 'left-6' : 'left-1'}`}></div>
            </button>
        </div>

        {/* VU Meter Canvas */}
        <canvas ref={canvasRef} width={200} height={10} className="w-full h-3 rounded bg-slate-950 mt-1"></canvas>
    </div>
  );
};