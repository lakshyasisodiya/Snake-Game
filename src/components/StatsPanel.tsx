import React from 'react';
import { Volume2, VolumeX, Settings2, Trophy, Palette, Layers, Flag } from 'lucide-react';
import { GameSettings, LevelConfig } from '../types/game';
import { SNAKE_SKINS } from '../data/gameData';
import { sound } from '../utils/audio';

interface StatsPanelProps {
  score: number;
  highScore: number;
  applesEaten: number;
  levelApplesEaten: number;
  currentLevel: LevelConfig;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onOpenSettings: () => void;
  onOpenSkins: () => void;
  onOpenLevels: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  score,
  highScore,
  applesEaten,
  levelApplesEaten,
  currentLevel,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenSkins,
  onOpenLevels,
}) => {
  const currentSkin = SNAKE_SKINS[settings.skinId] || SNAKE_SKINS.EMERALD;

  const toggleSound = () => {
    const nextMuted = !settings.soundEnabled;
    sound.setMuted(!nextMuted);
    onUpdateSettings({ soundEnabled: nextMuted });
    if (nextMuted) {
      sound.playClick();
    }
  };

  return (
    <div className="w-full max-w-[500px] mb-3 px-1 select-none">
      {/* Top Main Score & High Score Row */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Score</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 leading-tight">
              {score.toString().padStart(4, '0')}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-slate-800 mx-1" />

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              <Trophy size={11} className="text-amber-400" />
              <span>Best</span>
            </div>
            <span className="text-2xl font-bold font-mono text-amber-400/90 leading-tight">
              {highScore.toString().padStart(4, '0')}
            </span>
          </div>
        </div>

        {/* Action Buttons: Skins, Levels, Audio, Settings */}
        <div className="flex items-center gap-1.5">
          {/* Skin Selector Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSkins();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs font-medium cursor-pointer"
            title="Change Snake Skin"
          >
            <div
              className="w-2.5 h-2.5 rounded-full ring-1 ring-white/30"
              style={{ backgroundColor: currentSkin.headColor }}
            />
            <span className="hidden xs:inline">{currentSkin.name.split(' ')[0]}</span>
            <Palette size={13} className="text-slate-400" />
          </button>

          {/* Level Selector Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenLevels();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs font-medium cursor-pointer"
            title="Choose Level / Map"
          >
            <Layers size={13} className="text-emerald-400" />
            <span>Lvl {currentLevel.id}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              settings.soundEnabled
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-400'
            }`}
            title={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            aria-label={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {settings.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Difficulty & Settings"
            aria-label="Difficulty & Settings"
          >
            <Settings2 size={15} />
          </button>
        </div>
      </div>

      {/* Secondary Line: Level Target, Total Apples, Difficulty, Mode */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 font-mono">
        <div className="flex items-center gap-2">
          {settings.campaignMode ? (
            <span className="flex items-center gap-1 text-slate-300">
              <Flag size={11} className="text-rose-400" />
              <span>Goal: <strong>{levelApplesEaten}/{currentLevel.targetApples}</strong></span>
            </span>
          ) : (
            <span>Apples: <strong className="text-slate-200 font-semibold">{applesEaten}</strong></span>
          )}
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Length: <strong className="text-slate-200 font-semibold">{3 + applesEaten}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <span>Diff: <strong className={`font-semibold ${
            settings.difficulty === 'EASY' ? 'text-emerald-400' :
            settings.difficulty === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
          }`}>{settings.difficulty}</strong></span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{currentLevel.name.split(':')[1]?.trim() || currentLevel.name}</span>
        </div>
      </div>
    </div>
  );
};
