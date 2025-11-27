
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
    <div className={`flex items-center justify-center select-none ${vertical ? 'flex-col gap-2 h-full' : 'flex-col w-full gap-1'}`}>
       {/* If vertical, we put the input in a specific container and rotate it */}
       {vertical ? (
           <div className="relative h-36 w-8 flex items-center justify-center">
               <input 
                 type="range"
                 min={min}
                 max={max}
                 step={step}
                 value={value}
                 onChange={(e) => onChange(parseFloat(e.target.value))}
                 className="
                   absolute
                   w-32 h-1 
                   origin-center -rotate-90 
                   appearance-none bg-neutral-800 rounded-full cursor-pointer
                   focus:outline-none
                 "
               />
           </div>
       ) : (
           <input 
             type="range"
             min={min}
             max={max}
             step={step}
             value={value}
             onChange={(e) => onChange(parseFloat(e.target.value))}
             className="
               w-full h-1
               appearance-none bg-neutral-800 rounded-full cursor-pointer
               focus:outline-none
             "
           />
       )}
       
       <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{label}</span>
            <span className="text-[9px] font-mono text-neutral-300">{value.toFixed(step < 1 ? 2 : 0)}</span>
       </div>
    </div>
  );
};
