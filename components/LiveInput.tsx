
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

  useEffect(() => {
    vizModeRef.current = vizMode;
  }, [vizMode]);

  useEffect(() => {
      if (!engine) return;

      const bufferLength = 2048; 
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
          if (!canvasRef.current) return;
          const ctx = canvasRef.current.getContext('2d');
          if (!ctx) return;
          
          const width = canvasRef.current.width;
          const height = canvasRef.current.height;
          const mode = vizModeRef.current;

          // Clear with dark bg
          ctx.fillStyle = '#171717'; // neutral-900
          ctx.fillRect(0, 0, width, height);
          
          if (mode === 'spectrum') {
              engine.getAnalyserFrequencyData(dataArray);
              const barCount = 128;
              const barWidth = width / barCount;
              
              for(let i = 0; i < barCount; i++) {
                  const dataIndex = Math.floor(i * (bufferLength / 2) / barCount);
                  const v = dataArray[dataIndex] / 255;
                  const barHeight = v * height;
                  
                  // Monochrome bars (White/Grey)
                  const lightness = 20 + (v * 80);
                  ctx.fillStyle = `hsl(0, 0%, ${lightness}%)`;
                  
                  if (barHeight > 1) {
                      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
                  }
              }
          } else {
              engine.getAnalyserTimeData(dataArray);
              
              ctx.lineWidth = 2;
              ctx.strokeStyle = '#ffffff';
              ctx.shadowColor = 'rgba(255,255,255,0.5)';
              ctx.shadowBlur = 4;
              
              ctx.beginPath();
              const sliceWidth = width / bufferLength;
              let x = 0;
              
              for(let i = 0; i < bufferLength; i++) {
                  const v = dataArray[i] / 128.0;
                  const y = v * height / 2;
                  if(i === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                  x += sliceWidth;
              }
              ctx.lineTo(width, height / 2);
              ctx.stroke();
              ctx.shadowBlur = 0;
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
      if (engine && isActive) engine.setInputGain(gain);
  }, [gain, engine, isActive]);

  useEffect(() => {
      if (engine && isActive) engine.setInputFXSend(sendToFx);
  }, [sendToFx, engine, isActive]);

  return (
    <div className="bg-[#111] rounded border border-neutral-800 p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
            <h2 className="text-xs font-bold text-neutral-500 tracking-[0.2em] uppercase">Live Input</h2>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white shadow-[0_0_8px_white]' : 'bg-neutral-800'}`}></div>
        </div>

        {/* Visualizer */}
        <div 
            className="relative h-24 w-full bg-neutral-900 rounded border border-neutral-800 cursor-pointer overflow-hidden group"
            onClick={() => setVizMode(m => m === 'spectrum' ? 'waveform' : 'spectrum')}
        >
             <canvas ref={canvasRef} width={400} height={96} className="w-full h-full" />
             <div className="absolute top-2 right-2 text-[9px] font-bold text-neutral-600 bg-black/50 px-2 py-0.5 rounded pointer-events-none group-hover:text-white transition-colors uppercase tracking-wider">
                 {vizMode}
             </div>
        </div>

        <div className="flex flex-col gap-3">
            <button 
                onClick={toggleInput}
                className={`w-full py-1.5 rounded font-bold text-[10px] uppercase tracking-widest transition-all border
                    ${isActive 
                        ? 'bg-white text-black border-white' 
                        : 'bg-transparent text-neutral-500 border-neutral-700 hover:border-neutral-500 hover:text-white'}
                `}
            >
                {isActive ? 'Deactivate Input' : 'Activate Input'}
            </button>
            {error && <span className="text-[10px] text-red-500 text-center uppercase tracking-wide">{error}</span>}
        </div>

        <div className="space-y-1">
            <div className="flex justify-between text-[9px] text-neutral-500 font-bold uppercase tracking-wider">
                <span>Input Gain</span>
                <span className="text-neutral-300">{Math.round(gain * 100)}%</span>
            </div>
            <input 
                type="range" min={0} max={2} step={0.01} 
                value={gain} onChange={e => setGain(parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
            />
        </div>
        
        <div className="flex items-center justify-between">
            <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Route to FX</span>
            <button 
                onClick={() => setSendToFx(!sendToFx)}
                className={`w-8 h-4 rounded-full relative transition-colors border border-neutral-700 ${sendToFx ? 'bg-white border-white' : 'bg-transparent'}`}
            >
                <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all ${sendToFx ? 'left-4.5 bg-black' : 'left-0.5 bg-neutral-600'}`}></div>
            </button>
        </div>
    </div>
  );
};
