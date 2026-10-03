import React from 'react';
import { X, Sliders, RefreshCw, Palette, Layers } from 'lucide-react';
import { Difficulty, GameSettings, WallMode } from '../types/game';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onResetHighScore: () => void;
  onOpenSkins: () => void;
  onOpenLevels: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetHighScore,
  onOpenSkins,
  onOpenLevels,
}) => {
  if (!isOpen) return null;

  const difficulties: { id: Difficulty; label: string; desc: string; multiplier: string }[] = [
    { id: 'EASY', label: 'Easy', desc: '150ms gentle pace', multiplier: '1x Pts' },
    { id: 'MEDIUM', label: 'Medium', desc: '105ms classic speed', multiplier: '1.5x Pts' },
    { id: 'HARD', label: 'Hard', desc: '65ms fast reflex challenge', multiplier: '2x Pts' },
  ];

  const wallModes: { id: WallMode; label: string; desc: string }[] = [
    { id: 'SOLID', label: 'Solid Walls', desc: 'Walls destroy the snake' },
    { id: 'WRAP', label: 'Wrap-Around', desc: 'Teleport to opposite border' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-emerald-400" />
            <h2 className="text-lg font-bold">Game Settings</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 pt-4">
          {/* Quick Shortcuts: Skins & Levels */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenSkins();
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Palette size={15} className="text-emerald-400" />
              <span>Change Skin</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenLevels();
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Layers size={15} className="text-cyan-400" />
              <span>Select Level</span>
            </button>
          </div>

          {/* Difficulty Segmented Control: Easy, Medium, Hard */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => {
                    sound.playClick();
                    onUpdateSettings({ difficulty: diff.id });
                  }}
                  className={`text-left p-2.5 rounded-xl border transition-all text-xs ${
                    settings.difficulty === diff.id
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{diff.label}</div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{diff.multiplier}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{diff.desc.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Wall Boundary Rules */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Wall Collision Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {wallModes.map((wm) => (
                <button
                  key={wm.id}
                  onClick={() => {
                    sound.playClick();
                    onUpdateSettings({ wallMode: wm.id });
                  }}
                  className={`text-left p-2.5 rounded-xl border transition-all text-xs ${
                    settings.wallMode === wm.id
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{wm.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{wm.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Grid Toggle */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-200">Grid Overlay</div>
                <div className="text-xs text-slate-400">Display subtle grid lines on the board</div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ showGrid: !settings.showGrid });
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showGrid ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
                role="switch"
                aria-checked={settings.showGrid}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showGrid ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset Best Score */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-300">Clear Records</div>
              <div className="text-[11px] text-slate-400">Reset local best high score to 0</div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset your high score record to 0?')) {
                  sound.playClick();
                  onResetHighScore();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/50 rounded-lg transition-colors"
            >
              <RefreshCw size={12} />
              <span>Reset Best</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
