import React from 'react';
import { X, Layers, Flag, Shield, Sparkles } from 'lucide-react';
import { LevelConfig } from '../types/game';
import { GAME_LEVELS } from '../data/gameData';
import { sound } from '../utils/audio';

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  campaignMode: boolean;
  onToggleCampaignMode: (enabled: boolean) => void;
}

export const LevelModal: React.FC<LevelModalProps> = ({
  isOpen,
  onClose,
  currentLevelId,
  onSelectLevel,
  campaignMode,
  onToggleCampaignMode,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold">Game Levels & Maps</h2>
              <p className="text-xs text-slate-400">Choose custom arena obstacle configurations</p>
            </div>
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

        {/* Campaign Mode Switch */}
        <div className="py-3 px-4 my-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span>Campaign Progression Mode</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Automatically advance to next level when target apples are eaten
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onToggleCampaignMode(!campaignMode);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              campaignMode ? 'bg-emerald-600' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={campaignMode}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                campaignMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Level List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {GAME_LEVELS.map((lvl) => {
            const isCurrent = currentLevelId === lvl.id;

            return (
              <button
                key={lvl.id}
                onClick={() => {
                  sound.playClick();
                  onSelectLevel(lvl.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-100">{lvl.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                    {lvl.obstacles.length} Obstacles
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-2.5 leading-snug">{lvl.subtitle}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <Flag size={11} className="text-rose-400" />
                    <span>Target: {lvl.targetApples} apples</span>
                  </div>
                  {isCurrent && <span className="text-emerald-400 font-semibold">Active</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
