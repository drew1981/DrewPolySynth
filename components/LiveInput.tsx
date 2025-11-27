
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
  const [vizMode, setVizMode] = useState<'spectrum' | 'waveform'>('spectrum');
  
  const vizModeRef = useRef(vizMode);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Keep ref in sync for loop
  useEffect(() => {
    vizModeRef.current = vizMode;
  }, [vizMode]);

  // Visualizer Loop - Always runs if engine exists
  useEffect(() => {
      if (!engine) return;

      const bufferLength = 512;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
          if (!canvasRef.current) return;
          const ctx = canvasRef.current.getContext('2d');
          if (!ctx) return;
          
          const width = canvasRef.current.width;
          const height = canvasRef.current.height;
          const mode = vizModeRef.current;

          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = '#0f172a'; // Match bg
          ctx.fillRect(0, 0, width, height);
          
          if (mode === 'spectrum') {
              engine.getAnalyserFrequencyData(dataArray);
              // We mostly care about the first half of the frequency spectrum for musical content
              const barsToDraw = 128; 
              const barWidth = width / barsToDraw;
              
              for(let i = 0; i < barsToDraw; i++) {
                  // Normalize 0-255 to 0-1
                  const v = dataArray[i] / 255;
                  const barHeight = v * height;
                  
                  // Color gradient based on frequency index
                  ctx.fillStyle = `hsl(${i * 2 + 180}, 100%, 50%)`; 
                  ctx.fillRect(i * barWidth, height - barHeight, barWidth - 0.5, barHeight);
              }
          } else {
              engine.getAnalyserTimeData(dataArray);
              ctx.lineWidth = 2;
              ctx.strokeStyle = '#22d3ee'; // Cyan
              ctx.beginPath();
              
              const sliceWidth = width / bufferLength;
              let x = 0;
              
              for(let i = 0; i < bufferLength; i++) {
                  const v = dataArray[i] / 128.0; // 128 is zero crossing
                  const y = (v * height) / 2;
                  
                  if(i === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                  
                  x += sliceWidth;
              }
              ctx.lineTo(width, height / 2);
              ctx.stroke();
          }

          animationRef.current = requestAnimationFrame(draw);
      };
      
      draw();

      return () => {
          if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      };
  }, [engine]);

  const toggleInput = async () => {
      if (!engine) return;
      if (!isActive) {
          const success = await engine.initAudioInput();
          if (success) {
              setIsActive(true);
              engine.setInputGain(gain);
              engine.setInputFXSend(sendToFx);
              setError(null);
          } else {
              setError("Mic Access Denied");
          }
      } else {
          engine.setInputGain(0);
          setIsActive(false);
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

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col gap-4">
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
        <h2 className="text-sm font-bold text-orange-500 tracking-widest uppercase">Live Input & Output</h2>

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

        {/* Visualizer Section */}
        <div className="relative mt-1 group">
             <canvas ref={canvasRef} width={300} height={64} className="w-full h-16 rounded bg-slate-950 border border-slate-800 cursor-pointer" onClick={() => setVizMode(m => m === 'spectrum' ? 'waveform' : 'spectrum')}></canvas>
             <div className="absolute bottom-1 right-2 text-[10px] text-slate-500 font-bold pointer-events-none uppercase opacity-50">
                 {vizMode}
             </div>
        </div>
    </div>
  );
};
