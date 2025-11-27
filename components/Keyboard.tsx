import React, { useEffect, useState } from 'react';
import { NOTES, KEYBOARD_MAP } from '../constants';

interface Props {
  onNoteOn: (index: number, freq: number) => void;
  onNoteOff: (index: number) => void;
}

export const Keyboard: React.FC<Props> = ({ onNoteOn, onNoteOff }) => {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  // Mouse handlers
  const handleMouseDown = (index: number, freq: number) => {
    if (activeNotes.has(index)) return;
    setActiveNotes(prev => new Set(prev).add(index));
    onNoteOn(index, freq);
  };

  const handleMouseUp = (index: number) => {
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
    onNoteOff(index);
  };
  
  const handleMouseLeave = (index: number) => {
    if (activeNotes.has(index)) {
        handleMouseUp(index);
    }
  }

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const index = KEYBOARD_MAP[e.key.toLowerCase()];
      if (index !== undefined && !e.repeat) {
        if (!activeNotes.has(index)) {
             setActiveNotes(prev => new Set(prev).add(index));
             const note = NOTES[index];
             if(note) onNoteOn(index, note.frequency);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const index = KEYBOARD_MAP[e.key.toLowerCase()];
      if (index !== undefined) {
         setActiveNotes(prev => {
            const next = new Set(prev);
            next.delete(index);
            return next;
         });
         onNoteOff(index);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeNotes, onNoteOn, onNoteOff]);


  return (
    <div className="relative h-48 w-full max-w-4xl mx-auto select-none bg-slate-900 p-2 rounded-xl shadow-2xl border-t-4 border-slate-700">
        <div className="relative flex h-full w-full justify-center">
            {NOTES.map((note, i) => {
                // Calculate position for visual rendering logic
                // Simple implementation: render all as flex items, absolute position blacks
                if (note.isSharp) return null; // We render sharps absolutely over the naturals

                // Find if there is a sharp after this natural
                const nextNote = NOTES[i + 1];
                const hasSharp = nextNote && nextNote.isSharp;
                const isActive = activeNotes.has(i);
                
                return (
                    <div 
                        key={i}
                        className={`
                            relative flex-1 bg-slate-100 border border-slate-300 rounded-b-md mx-[1px]
                            active:bg-cyan-200 transition-colors duration-75
                            ${isActive ? 'bg-cyan-300 shadow-[0_0_15px_cyan] z-10' : 'bg-slate-100'}
                        `}
                        onMouseDown={() => handleMouseDown(i, note.frequency)}
                        onMouseUp={() => handleMouseUp(i)}
                        onMouseLeave={() => handleMouseLeave(i)}
                        onTouchStart={(e) => { e.preventDefault(); handleMouseDown(i, note.frequency); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleMouseUp(i); }}
                    >
                        <div className="absolute bottom-2 w-full text-center text-xs text-slate-400 font-bold pointer-events-none">
                            {note.note}{note.octave}
                        </div>
                        {/* Render Sharp Key if exists next to this */}
                        {hasSharp && (
                            <div 
                                className={`
                                    absolute -right-3 top-0 w-6 h-28 z-20 rounded-b-md border border-slate-800
                                    ${activeNotes.has(i + 1) ? 'bg-gradient-to-b from-cyan-600 to-cyan-800 shadow-[0_0_10px_cyan]' : 'bg-gradient-to-b from-slate-800 to-black'}
                                `}
                                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(i + 1, nextNote.frequency); }}
                                onMouseUp={(e) => { e.stopPropagation(); handleMouseUp(i + 1); }}
                                onMouseLeave={() => handleMouseLeave(i + 1)}
                                onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); handleMouseDown(i + 1, nextNote.frequency); }}
                                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handleMouseUp(i + 1); }}
                            >
                                {/* Key hint for sharps usually tricky to place, skipping for clean UI */}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};
