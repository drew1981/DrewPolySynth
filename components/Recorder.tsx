import React, { useState, useEffect } from 'react';
import { SynthEngine } from '../services/synthEngine';

interface Props {
  engine: SynthEngine | null;
}

export const Recorder: React.FC<Props> = ({ engine }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [loop, setLoop] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
      let interval: any;
      if (isRecording) {
          interval = setInterval(() => setDuration(d => d + 1), 1000);
      } else if (!hasRecording) {
          setDuration(0);
      }
      return () => clearInterval(interval);
  }, [isRecording, hasRecording]);

  const handleRecord = () => {
      if (!engine) return;
      if (isRecording) {
          // Stop
          engine.stopRecording().then(() => {
              setIsRecording(false);
              setHasRecording(true);
          });
      } else {
          // Start
          engine.clearRecording();
          engine.startRecording();
          setIsRecording(true);
          setHasRecording(false);
          setIsPlaying(false);
      }
  };

  const handlePlay = () => {
      if (!engine) return;
      if (isPlaying) {
          engine.stopPlayback();
          setIsPlaying(false);
      } else {
          engine.playRecording(loop);
          setIsPlaying(true);
      }
  };

  const handleClear = () => {
      if (!engine) return;
      engine.clearRecording();
      setHasRecording(false);
      setIsPlaying(false);
      setDuration(0);
  };

  const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col gap-4">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
        <div className="flex justify-between items-center">
             <h2 className="text-sm font-bold text-red-500 tracking-widest uppercase">Tape Recorder</h2>
             <span className="font-mono text-red-500 text-xs">{isRecording ? 'REC ●' : formatTime(duration)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
            <button 
                onClick={handleRecord}
                className={`py-3 rounded-lg font-bold text-xs flex justify-center items-center transition-all
                    ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
                `}
            >
                <div className={`w-3 h-3 rounded-full mr-1 ${isRecording ? 'bg-white' : 'bg-red-500'}`}></div>
                {isRecording ? 'STOP' : 'REC'}
            </button>

            <button 
                onClick={handlePlay}
                disabled={!hasRecording || isRecording}
                className={`py-3 rounded-lg font-bold text-xs flex justify-center items-center transition-all disabled:opacity-50
                    ${isPlaying ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
                `}
            >
                {isPlaying ? 'STOP' : 'PLAY'}
            </button>

            <button 
                onClick={handleClear}
                disabled={isRecording}
                className="bg-slate-800 text-slate-300 hover:bg-slate-700 py-3 rounded-lg font-bold text-xs disabled:opacity-50"
            >
                CLEAR
            </button>
        </div>

        <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-400 font-bold uppercase">Loop Playback</span>
            <button 
                onClick={() => setLoop(!loop)}
                className={`w-10 h-5 rounded-full relative transition-colors ${loop ? 'bg-green-500' : 'bg-slate-700'}`}
            >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${loop ? 'left-6' : 'left-1'}`}></div>
            </button>
        </div>
        
        {hasRecording && !isRecording && (
            <div className="text-[10px] text-center text-slate-500 italic">
                Take saved in memory.
            </div>
        )}
    </div>
  );
};
