import React from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  step?: number;
  vertical?: boolean;
}

export const ControlSlider: React.FC<Props> = ({ label, value, min, max, onChange, step = 0.01, vertical = false }) => {
  return (
    <div className={`flex ${vertical ? 'flex-col h-32 items-center' : 'flex-col w-full'} gap-1 select-none`}>
       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
       <input 
         type="range"
         min={min}
         max={max}
         step={step}
         value={value}
         onChange={(e) => onChange(parseFloat(e.target.value))}
         className={`
           appearance-none bg-slate-800 rounded-lg cursor-pointer
           ${vertical ? 'w-2 h-full writing-vertical-lr' : 'w-full h-2'}
           accent-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50
         `}
         style={vertical ? { writingMode: 'bt-lr' as any, WebkitAppearance: 'slider-vertical' } : {}}
       />
       <span className="text-[10px] text-cyan-500 font-mono">{value.toFixed(step < 1 ? 2 : 0)}</span>
    </div>
  );
};
