
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
      e.preventDefault();
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
  // We want an arc from approx 135deg to 405deg (270deg total)
  const range = max - min;
  const pct = (value - min) / range;
  
  // SVG Config
  const size = 60;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = 0.75 * circumference; // 270 degrees is 75% of circle
  const dashOffset = circumference - (pct * arcLength); // Draw 'pct' amount of the arc
  
  // Rotate so the gap is at the bottom
  const rotationOffset = 135; 

  return (
    <div className="flex flex-col items-center justify-center gap-2 select-none group w-20">
      <div 
        className="relative cursor-ns-resize group-hover:scale-105 transition-transform"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
      >
        <svg width={size} height={size} className="transform rotate-90">
           {/* Background Track (Dark Grey) */}
           <circle
             cx={size/2} cy={size/2} r={radius}
             fill="transparent"
             stroke="#333333"
             strokeWidth={strokeWidth}
             strokeDasharray={`${arcLength} ${circumference}`}
             transform={`rotate(${rotationOffset} ${size/2} ${size/2})`}
             strokeLinecap="round"
           />
           
           {/* Active Value (White) */}
           <circle
             cx={size/2} cy={size/2} r={radius}
             fill="transparent"
             stroke={isDragging ? '#ffffff' : '#e5e5e5'}
             strokeWidth={strokeWidth}
             strokeDasharray={`${arcLength} ${circumference}`}
             strokeDashoffset={dashOffset * -1} 
             /* Note: SVG dashoffset logic with gaps is tricky, simpler visual approach: */
           />
           {/* Re-drawing active arc on top accurately */}
             <circle
             cx={size/2} cy={size/2} r={radius}
             fill="transparent"
             stroke={isDragging ? '#ffffff' : '#d4d4d4'}
             strokeWidth={strokeWidth}
             strokeDasharray={`${pct * arcLength} ${circumference}`}
             transform={`rotate(${rotationOffset} ${size/2} ${size/2})`}
             strokeLinecap="round"
           />
        </svg>

        {/* Diamond / Indicator in center (optional styling from image) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Small diamond or just value text */}
             <div className={`w-1.5 h-1.5 transform rotate-45 border border-white ${isDragging ? 'bg-white' : 'bg-transparent'}`}></div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">{label}</span>
          <span className="text-[10px] font-mono text-neutral-300 tabular-nums leading-none">
            {value.toFixed(step < 1 ? 2 : 0)}
          </span>
      </div>
    </div>
  );
};
