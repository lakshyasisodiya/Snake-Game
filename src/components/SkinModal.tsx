import React from 'react';
import { X, Palette, Check, Sparkles } from 'lucide-react';
import { SnakeSkinId } from '../types/game';
import { SNAKE_SKINS } from '../data/gameData';
import { sound } from '../utils/audio';

interface SkinModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSkinId: SnakeSkinId;
  onSelectSkin: (id: SnakeSkinId) => void;
}

export const SkinModal: React.FC<SkinModalProps> = ({
  isOpen,
  onClose,
  selectedSkinId,
  onSelectSkin,
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
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Palette size={20} className="text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold">Snake Skins</h2>
              <p className="text-xs text-slate-400">Choose your serpent styling & color theme</p>
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

        {/* Skins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 max-h-[60vh] overflow-y-auto pr-1">
          {Object.values(SNAKE_SKINS).map((skin) => {
            const isSelected = selectedSkinId === skin.id;

            return (
              <button
                key={skin.id}
                onClick={() => {
                  sound.playClick();
                  onSelectSkin(skin.id);
                }}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all text-xs relative ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                {/* Active Checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                    <Check size={13} strokeWidth={3} />
                  </div>
                )}

                {/* Skin Preview Mini-Snake */}
                <div className="h-10 w-full rounded-lg bg-slate-950/80 border border-slate-800/80 mb-3 flex items-center px-3 gap-1">
                  {/* Head */}
                  <div
                    className="w-5 h-5 rounded-md relative flex items-center justify-end pr-0.5 shadow-sm"
                    style={{ backgroundColor: skin.headColor }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: skin.eyeColor }}
                    >
                      <div
                        className="w-0.5 h-0.5 rounded-full"
                        style={{ backgroundColor: skin.pupilColor }}
                      />
                    </div>
                  </div>
                  {/* Body Segments */}
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: skin.bodyGradient[0] }}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-sm"
                    style={{ backgroundColor: skin.bodyGradient[1] }}
                  />
                  <div
                    className="w-3 h-3 rounded-sm opacity-80"
                    style={{ backgroundColor: skin.bodyGradient[1] }}
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-sm opacity-60"
                    style={{ backgroundColor: skin.bodyGradient[1] }}
                  />
                </div>

                <div className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                  <span>{skin.name}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {skin.tagline}
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
            Apply Skin
          </button>
        </div>
      </div>
    </div>
  );
};
