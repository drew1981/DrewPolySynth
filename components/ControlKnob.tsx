
import React, { useState, useEffect, useRef } from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  step?: number;
}

export const ControlKnob: React.FC<Props> = ({ label, value, min, max, onChange, step = 1 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number>(0);
  const startValue = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startY.current - e.clientY;
      const range = max - min;
      const sensitivity = 200; // pixels for full range
      const deltaValue = (deltaY / sensitivity) * range;
      
      let newValue = startValue.current + deltaValue;
      newValue = Math.max(min, Math.min(max, newValue));
      
      if (step) {
        newValue = Math.round(newValue / step) * step;
      }
      
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, max, min, onChange, step]);

  // Visual calculation
  const percentage = (value - min) / (max - min);
  const rotation = -135 + (percentage * 270); // 270 degree range

  return (
    <div className="flex flex-col items-center select-none group">
      <div 
        className="relative w-14 h-14 cursor-ns-resize"
        onMouseDown={handleMouseDown}
      >
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-slate-700 bg-slate-800 shadow-inner"></div>
        
        {/* Active Ring Indicator (SVG) */}
        <svg className="absolute inset-0 w-full h-full p-1 pointer-events-none transform -rotate-90">
             <circle
               cx="24" cy="24" r="20"
               fill="none"
               stroke="#334155"
               strokeWidth="4"
             />
             <circle
               cx="24" cy="24" r="20"
               fill="none"
               stroke={isDragging ? '#22d3ee' : '#0891b2'}
               strokeWidth="4"
               strokeDasharray={`${percentage * 125}, 125`} 
               strokeLinecap="round"
             />
        </svg>

        {/* Knob Body */}
        <div 
            className="absolute top-2 left-2 w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-900 shadow-xl flex items-center justify-center transform transition-transform duration-75"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <div className="w-1 h-3 bg-white rounded-full absolute top-1 shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
        </div>
      </div>
      <div className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
      <div className="text-[10px] text-cyan-500 font-mono h-3">{value.toFixed(step < 1 ? 2 : 0)}</div>
    </div>
  );
};
