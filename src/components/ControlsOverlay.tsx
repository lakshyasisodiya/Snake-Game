import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import { Direction, GameState } from '../types/game';
import { sound } from '../utils/audio';

interface ControlsOverlayProps {
  gameState: GameState;
  onDirectionInput: (dir: Direction) => void;
  onTogglePause: () => void;
  onRestart: () => void;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  gameState,
  onDirectionInput,
  onTogglePause,
  onRestart,
}) => {
  const handleDir = (dir: Direction) => {
    onDirectionInput(dir);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[500px] mt-4 px-2">
      {/* Top Action Row: Play/Pause, Restart */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-2">
          {gameState === 'PLAYING' ? (
            <button
              onClick={onTogglePause}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm active:scale-95"
              title="Pause Game (Space)"
            >
              <Pause size={14} />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onTogglePause}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm active:scale-95"
              title="Resume / Start Game (Space)"
            >
              <Play size={14} />
              <span>{gameState === 'READY' ? 'Start' : 'Resume'}</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors shadow-sm active:scale-95"
            title="Restart Game (R)"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
          Controls: <span className="text-slate-300">WASD / Arrows</span> · <span className="text-slate-300">Space</span> (Pause)
        </div>
      </div>

      {/* On-Screen D-Pad (Touch friendly for mobile/tablet & on-screen clickers) */}
      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm sm:hidden select-none touch-none w-full max-w-[280px]">
        {/* Up */}
        <button
          onClick={() => handleDir('UP')}
          className="w-14 h-12 flex items-center justify-center rounded-xl bg-slate-800/90 active:bg-emerald-600 active:text-white text-slate-200 border border-slate-700/80 shadow-md transition-all active:scale-95 mb-1.5"
          aria-label="Move Up"
        >
          <ArrowUp size={24} />
        </button>

        {/* Left, Center Indicator, Right */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleDir('LEFT')}
            className="w-14 h-12 flex items-center justify-center rounded-xl bg-slate-800/90 active:bg-emerald-600 active:text-white text-slate-200 border border-slate-700/80 shadow-md transition-all active:scale-95"
            aria-label="Move Left"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="w-10 h-10 rounded-full bg-slate-950/60 border border-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-mono">
            D-PAD
          </div>

          <button
            onClick={() => handleDir('RIGHT')}
            className="w-14 h-12 flex items-center justify-center rounded-xl bg-slate-800/90 active:bg-emerald-600 active:text-white text-slate-200 border border-slate-700/80 shadow-md transition-all active:scale-95"
            aria-label="Move Right"
          >
            <ArrowRight size={24} />
          </button>
        </div>

        {/* Down */}
        <button
          onClick={() => handleDir('DOWN')}
          className="w-14 h-12 flex items-center justify-center rounded-xl bg-slate-800/90 active:bg-emerald-600 active:text-white text-slate-200 border border-slate-700/80 shadow-md transition-all active:scale-95 mt-1.5"
          aria-label="Move Down"
        >
          <ArrowDown size={24} />
        </button>
      </div>
    </div>
  );
};
