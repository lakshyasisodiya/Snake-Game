/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SnakeCanvas } from './components/SnakeCanvas';
import { StatsPanel } from './components/StatsPanel';
import { ControlsOverlay } from './components/ControlsOverlay';
import { SettingsModal } from './components/SettingsModal';
import { SkinModal } from './components/SkinModal';
import { LevelModal } from './components/LevelModal';
import { Direction, GameSettings, GameState, SnakeSkinId } from './types/game';
import { GAME_LEVELS, SNAKE_SKINS } from './data/gameData';
import { sound } from './utils/audio';
import { Gamepad2, Info, Palette, Layers } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('READY');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('snake_highscore');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [applesEaten, setApplesEaten] = useState<number>(0);
  const [levelApplesEaten, setLevelApplesEaten] = useState<number>(0);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSkinModalOpen, setIsSkinModalOpen] = useState<boolean>(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  const [settings, setSettings] = useState<GameSettings>(() => {
    const savedDiff = localStorage.getItem('snake_difficulty');
    const savedWall = localStorage.getItem('snake_wallmode');
    const savedGrid = localStorage.getItem('snake_showgrid');
    const savedSkin = localStorage.getItem('snake_skin_id');
    const savedLevel = localStorage.getItem('snake_selected_level');
    const savedCampaign = localStorage.getItem('snake_campaign_mode');
    const soundMuted = localStorage.getItem('snake_sound_muted') === 'true';

    // Normalize difficulty to EASY, MEDIUM, or HARD
    let initialDiff: GameSettings['difficulty'] = 'MEDIUM';
    if (savedDiff === 'EASY' || savedDiff === 'MEDIUM' || savedDiff === 'HARD') {
      initialDiff = savedDiff;
    }

    return {
      difficulty: initialDiff,
      wallMode: (savedWall as GameSettings['wallMode']) || 'SOLID',
      showGrid: savedGrid !== null ? savedGrid === 'true' : true,
      soundEnabled: !soundMuted,
      skinId: (savedSkin as SnakeSkinId) || 'EMERALD',
      campaignMode: savedCampaign !== null ? savedCampaign === 'true' : true,
      selectedLevel: savedLevel ? parseInt(savedLevel, 10) || 1 : 1,
    };
  });

  const currentLevel = GAME_LEVELS.find((lvl) => lvl.id === settings.selectedLevel) || GAME_LEVELS[0];
  const activeSkin = SNAKE_SKINS[settings.skinId] || SNAKE_SKINS.EMERALD;

  const currentDirectionRef = useRef<Direction>('RIGHT');
  const pendingDirectionRef = useRef<((dir: Direction) => void) | null>(null);

  // Sync high score
  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('snake_highscore', String(newScore));
    }
  };

  const handleGameOver = (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('snake_highscore', String(finalScore));
    }
  };

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.difficulty) localStorage.setItem('snake_difficulty', newSettings.difficulty);
      if (newSettings.wallMode) localStorage.setItem('snake_wallmode', newSettings.wallMode);
      if (newSettings.showGrid !== undefined) localStorage.setItem('snake_showgrid', String(newSettings.showGrid));
      if (newSettings.skinId) localStorage.setItem('snake_skin_id', newSettings.skinId);
      if (newSettings.campaignMode !== undefined) localStorage.setItem('snake_campaign_mode', String(newSettings.campaignMode));
      if (newSettings.selectedLevel !== undefined) localStorage.setItem('snake_selected_level', String(newSettings.selectedLevel));
      return updated;
    });
  };

  const handleSelectSkin = (skinId: SnakeSkinId) => {
    handleUpdateSettings({ skinId });
  };

  const handleSelectLevel = (levelId: number) => {
    handleUpdateSettings({ selectedLevel: levelId });
    setLevelApplesEaten(0);
    setGameState('READY');
  };

  const handleLevelComplete = () => {
    if (settings.campaignMode) {
      const nextLevelId = settings.selectedLevel < GAME_LEVELS.length ? settings.selectedLevel + 1 : 1;
      handleUpdateSettings({ selectedLevel: nextLevelId });
      setLevelApplesEaten(0);
      setGameState('PLAYING');
    } else {
      setLevelApplesEaten(0);
      setGameState('PLAYING');
    }
  };

  const handleResetHighScore = () => {
    setHighScore(0);
    localStorage.removeItem('snake_highscore');
  };

  const handleDirectionInput = (dir: Direction) => {
    if (gameState === 'READY') {
      setGameState('PLAYING');
    }
    if (pendingDirectionRef.current) {
      pendingDirectionRef.current(dir);
    }
  };

  const handleTogglePause = () => {
    if (gameState === 'PLAYING') {
      sound.playClick();
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED' || gameState === 'READY') {
      sound.playClick();
      setGameState('PLAYING');
    } else if (gameState === 'GAME_OVER') {
      sound.playClick();
      setGameState('PLAYING');
    } else if (gameState === 'LEVEL_CLEARED') {
      handleLevelComplete();
    }
  };

  const handleRestart = () => {
    setLevelApplesEaten(0);
    setGameState('READY');
  };

  // Close modals on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsSkinModalOpen(false);
        setIsLevelModalOpen(false);
        setShowHowToPlay(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Bar Contract (Wordmark, Nav links, Action) */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-emerald-400" size={20} />
            <span className="text-base font-bold tracking-tight text-white">Classic Snake Canvas</span>
          </div>

          {/* Zone 2: Navigation text links */}
          <nav className="hidden sm:flex items-center gap-5 text-xs text-slate-400">
            <button
              onClick={() => {
                sound.playClick();
                setIsSkinModalOpen(true);
              }}
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <Palette size={13} className="text-emerald-400" />
              <span>Skin: {activeSkin.name}</span>
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <button
              onClick={() => {
                sound.playClick();
                setIsLevelModalOpen(true);
              }}
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <Layers size={13} className="text-cyan-400" />
              <span>{currentLevel.name}</span>
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Diff: {settings.difficulty}</span>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setShowHowToPlay(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
            >
              <Info size={13} />
              <span>Guide</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 w-full max-w-xl flex flex-col items-center justify-center px-4 py-3 sm:py-5">
        {/* Heads Up Display */}
        <StatsPanel
          score={score}
          highScore={highScore}
          applesEaten={applesEaten}
          levelApplesEaten={levelApplesEaten}
          currentLevel={currentLevel}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSkins={() => setIsSkinModalOpen(true)}
          onOpenLevels={() => setIsLevelModalOpen(true)}
        />

        {/* HTML5 Canvas Arcade Board */}
        <SnakeCanvas
          gameState={gameState}
          settings={settings}
          currentLevel={currentLevel}
          score={score}
          highScore={highScore}
          applesEaten={applesEaten}
          levelApplesEaten={levelApplesEaten}
          onScoreChange={handleScoreChange}
          onApplesChange={setApplesEaten}
          onLevelApplesChange={setLevelApplesEaten}
          onGameStateChange={setGameState}
          onLevelComplete={handleLevelComplete}
          onGameOver={handleGameOver}
          currentDirectionRef={currentDirectionRef}
          setPendingDirection={(fn) => {
            pendingDirectionRef.current = fn as unknown as (dir: Direction) => void;
          }}
        />

        {/* Touch & Keyboard Controls Overlay */}
        <ControlsOverlay
          gameState={gameState}
          onDirectionInput={handleDirectionInput}
          onTogglePause={handleTogglePause}
          onRestart={handleRestart}
        />
      </main>

      {/* Footer Info */}
      <footer className="w-full border-t border-slate-900 py-2.5 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-2">
          <span>6 Custom Levels</span>
          <span aria-hidden="true">·</span>
          <span>6 Snake Skins</span>
          <span aria-hidden="true">·</span>
          <span>Easy / Medium / Hard</span>
          <span aria-hidden="true">·</span>
          <span>HTML5 Canvas</span>
        </div>
      </footer>

      {/* Snake Skin Selector Modal */}
      <SkinModal
        isOpen={isSkinModalOpen}
        onClose={() => setIsSkinModalOpen(false)}
        selectedSkinId={settings.skinId}
        onSelectSkin={handleSelectSkin}
      />

      {/* Level Selector Modal */}
      <LevelModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        currentLevelId={currentLevel.id}
        onSelectLevel={handleSelectLevel}
        campaignMode={settings.campaignMode}
        onToggleCampaignMode={(mode) => handleUpdateSettings({ campaignMode: mode })}
      />

      {/* Game Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetHighScore={handleResetHighScore}
        onOpenSkins={() => setIsSkinModalOpen(true)}
        onOpenLevels={() => setIsLevelModalOpen(true)}
      />

      {/* Guide / How To Play Modal */}
      {showHowToPlay && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setShowHowToPlay(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Gamepad2 size={16} className="text-emerald-400" />
                <span>How to Play & Levels</span>
              </h2>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs text-slate-300 leading-relaxed">
              <div>
                <strong className="text-slate-100 block mb-1 text-sm font-semibold">Objective & Levels</strong>
                Steer the snake around obstacles and boundaries. In <strong>Campaign Mode</strong>, eat the required target of apples for each level to advance through 6 unique maps with strategic obstacle configurations.
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                  <div className="font-semibold text-emerald-400 text-xs">Easy</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">150ms · 1x Pts</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                  <div className="font-semibold text-amber-400 text-xs">Medium</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">105ms · 1.5x Pts</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                  <div className="font-semibold text-rose-400 text-xs">Hard</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">65ms · 2x Pts</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-400 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span>Red Apple (+10)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Regular food item. Extends snake body length by 1 tile.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    <span>Golden Star (+50)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Rare bonus! Spawns every 5 apples and expires after 7.5 seconds.</p>
                </div>
              </div>

              <div>
                <strong className="text-slate-100 block mb-1 text-sm font-semibold">Snake Skins</strong>
                Customize your serpent styling anytime: Classic Emerald, Cyber Neon, Golden Dragon, Lava Viper, Arctic Frost, or Prism Rainbow.
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowHowToPlay(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
