import React, { useEffect, useRef, useCallback } from 'react';
import { Direction, Food, GameSettings, GameState, Particle, Position, LevelConfig } from '../types/game';
import { sound } from '../utils/audio';
import { SNAKE_SKINS, GAME_LEVELS } from '../data/gameData';

interface SnakeCanvasProps {
  gameState: GameState;
  settings: GameSettings;
  currentLevel: LevelConfig;
  score: number;
  highScore: number;
  applesEaten: number;
  levelApplesEaten: number;
  onScoreChange: (score: number) => void;
  onApplesChange: (apples: number) => void;
  onLevelApplesChange: (apples: number) => void;
  onGameStateChange: (state: GameState) => void;
  onLevelComplete: () => void;
  onGameOver: (finalScore: number, apples: number) => void;
  currentDirectionRef: React.MutableRefObject<Direction>;
  setPendingDirection: (dir: Direction) => void;
}

const GRID_SIZE = 20;

export const SnakeCanvas: React.FC<SnakeCanvasProps> = ({
  gameState,
  settings,
  currentLevel,
  score,
  highScore,
  applesEaten,
  levelApplesEaten,
  onScoreChange,
  onApplesChange,
  onLevelApplesChange,
  onGameStateChange,
  onLevelComplete,
  onGameOver,
  currentDirectionRef,
  setPendingDirection,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game State Refs
  const snakeRef = useRef<Position[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const directionRef = useRef<Direction>('RIGHT');
  const inputQueueRef = useRef<Direction[]>([]);
  const foodRef = useRef<Food>({ x: 15, y: 10, type: 'REGULAR', createdAt: Date.now(), durationMs: 0 });
  const goldenFoodRef = useRef<Food | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastTickTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const shakeRef = useRef<number>(0);
  const tongueTimerRef = useRef<number>(0);

  // Get Active Skin
  const activeSkin = SNAKE_SKINS[settings.skinId] || SNAKE_SKINS.EMERALD;

  // Sync external direction controls with internal queue
  const queueDirection = useCallback((newDir: Direction) => {
    const lastDir = inputQueueRef.current.length > 0 
      ? inputQueueRef.current[inputQueueRef.current.length - 1] 
      : directionRef.current;

    const isOpposite =
      (newDir === 'UP' && lastDir === 'DOWN') ||
      (newDir === 'DOWN' && lastDir === 'UP') ||
      (newDir === 'LEFT' && lastDir === 'RIGHT') ||
      (newDir === 'RIGHT' && lastDir === 'LEFT');

    if (!isOpposite && newDir !== lastDir && inputQueueRef.current.length < 2) {
      inputQueueRef.current.push(newDir);
      sound.playTurn();
    }
  }, []);

  useEffect(() => {
    setPendingDirection(queueDirection as unknown as Direction);
  }, [queueDirection, setPendingDirection]);

  // Compute speed based on difficulty: Easy, Medium, Hard
  const getTickInterval = useCallback(() => {
    switch (settings.difficulty) {
      case 'EASY':
        return 150;
      case 'MEDIUM':
        return 105;
      case 'HARD':
        return 65;
      default:
        return 105;
    }
  }, [settings.difficulty]);

  // Spawn food helper taking obstacles and snake body into account
  const spawnFood = useCallback((type: 'REGULAR' | 'GOLDEN'): Food => {
    const occupied = new Set<string>();
    snakeRef.current.forEach((seg) => occupied.add(`${seg.x},${seg.y}`));
    if (foodRef.current) occupied.add(`${foodRef.current.x},${foodRef.current.y}`);
    if (goldenFoodRef.current) occupied.add(`${goldenFoodRef.current.x},${goldenFoodRef.current.y}`);

    // Add obstacles to occupied set
    currentLevel.obstacles.forEach((obs) => occupied.add(`${obs.x},${obs.y}`));

    const freeSlots: Position[] = [];
    for (let x = 1; x < GRID_SIZE - 1; x++) {
      for (let y = 1; y < GRID_SIZE - 1; y++) {
        if (!occupied.has(`${x},${y}`)) {
          freeSlots.push({ x, y });
        }
      }
    }

    const target = freeSlots.length > 0 
      ? freeSlots[Math.floor(Math.random() * freeSlots.length)]
      : { x: 5, y: 5 };

    return {
      x: target.x,
      y: target.y,
      type,
      createdAt: Date.now(),
      durationMs: type === 'GOLDEN' ? 7500 : 0,
    };
  }, [currentLevel.obstacles]);

  // Create burst particles
  const createParticles = (x: number, y: number, color: string, count = 14) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 3.5;
      particlesRef.current.push({
        x: x + 0.5,
        y: y + 0.5,
        vx: Math.cos(angle) * speed * 0.05,
        vy: Math.sin(angle) * speed * 0.05,
        color,
        size: 3 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 12,
      });
    }
  };

  // Find a safe initial spawn spot for snake that doesn't overlap obstacles
  const getSafeSpawn = useCallback((): Position[] => {
    const obsSet = new Set(currentLevel.obstacles.map((o) => `${o.x},${o.y}`));
    const candidates = [
      [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      [{ x: 10, y: 3 }, { x: 9, y: 3 }, { x: 8, y: 3 }],
      [{ x: 10, y: 16 }, { x: 9, y: 16 }, { x: 8, y: 16 }],
      [{ x: 3, y: 10 }, { x: 2, y: 10 }, { x: 1, y: 10 }],
    ];

    for (const cand of candidates) {
      if (cand.every((p) => !obsSet.has(`${p.x},${p.y}`))) {
        return cand;
      }
    }
    return [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  }, [currentLevel.obstacles]);

  // Reset / Init game
  const resetGame = useCallback(() => {
    snakeRef.current = getSafeSpawn();
    directionRef.current = 'RIGHT';
    currentDirectionRef.current = 'RIGHT';
    inputQueueRef.current = [];
    foodRef.current = spawnFood('REGULAR');
    goldenFoodRef.current = null;
    particlesRef.current = [];
    shakeRef.current = 0;
    onScoreChange(0);
    onApplesChange(0);
    onLevelApplesChange(0);
  }, [currentDirectionRef, getSafeSpawn, onApplesChange, onLevelApplesChange, onScoreChange, spawnFood]);

  // Handle Game Restart
  useEffect(() => {
    if (gameState === 'READY') {
      resetGame();
    }
  }, [gameState, resetGame, currentLevel.id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'PLAYING') {
          onGameStateChange('PAUSED');
          sound.playClick();
        } else if (gameState === 'PAUSED' || gameState === 'READY') {
          onGameStateChange('PLAYING');
          sound.playClick();
        } else if (gameState === 'LEVEL_CLEARED') {
          onLevelComplete();
        }
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'GAME_OVER' || gameState === 'PAUSED') {
          resetGame();
          onGameStateChange('PLAYING');
          sound.playClick();
          return;
        }
      }

      if (gameState === 'READY') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
          onGameStateChange('PLAYING');
        }
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          queueDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          queueDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          queueDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          queueDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, onGameStateChange, onLevelComplete, queueDirection, resetGame]);

  // Touch Swipe Handling on the Canvas
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    touchStartRef.current = null;

    const minSwipeDistance = 25;
    if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
      if (gameState === 'READY' || gameState === 'PAUSED') {
        onGameStateChange('PLAYING');
        sound.playClick();
      } else if (gameState === 'LEVEL_CLEARED') {
        onLevelComplete();
      }
      return;
    }

    if (gameState === 'READY') {
      onGameStateChange('PLAYING');
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) queueDirection('RIGHT');
      else queueDirection('LEFT');
    } else {
      if (dy > 0) queueDirection('DOWN');
      else queueDirection('UP');
    }
  };

  // Main Logic Step
  const stepGame = useCallback(() => {
    if (inputQueueRef.current.length > 0) {
      directionRef.current = inputQueueRef.current.shift()!;
      currentDirectionRef.current = directionRef.current;
    }

    const currentSnake = snakeRef.current;
    const head = { ...currentSnake[0] };
    const dir = directionRef.current;

    switch (dir) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    // Check Wall Collision
    if (settings.wallMode === 'SOLID') {
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        shakeRef.current = 12;
        sound.playGameOver();
        onGameStateChange('GAME_OVER');
        onGameOver(score, applesEaten);
        return;
      }
    } else {
      // WRAP Mode
      if (head.x < 0) head.x = GRID_SIZE - 1;
      else if (head.x >= GRID_SIZE) head.x = 0;
      if (head.y < 0) head.y = GRID_SIZE - 1;
      else if (head.y >= GRID_SIZE) head.y = 0;
    }

    // Check Obstacle Collision
    for (const obs of currentLevel.obstacles) {
      if (head.x === obs.x && head.y === obs.y) {
        shakeRef.current = 14;
        sound.playGameOver();
        onGameStateChange('GAME_OVER');
        onGameOver(score, applesEaten);
        return;
      }
    }

    // Check Self Collision
    for (let i = 0; i < currentSnake.length; i++) {
      if (currentSnake[i].x === head.x && currentSnake[i].y === head.y) {
        shakeRef.current = 12;
        sound.playGameOver();
        onGameStateChange('GAME_OVER');
        onGameOver(score, applesEaten);
        return;
      }
    }

    // Check Food Consumption
    let ateFood = false;
    let scoreGain = 0;

    // Multiplier based on difficulty: Easy = 1x, Medium = 1.5x (round), Hard = 2x
    const multiplier = settings.difficulty === 'HARD' ? 2 : settings.difficulty === 'MEDIUM' ? 1.5 : 1;

    // Normal Food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      ateFood = true;
      scoreGain += Math.round(10 * multiplier);
      const newTotalApples = applesEaten + 1;
      const newLevelApples = levelApplesEaten + 1;

      onApplesChange(newTotalApples);
      onLevelApplesChange(newLevelApples);
      sound.playEat();
      createParticles(head.x, head.y, activeSkin.particleColor, 16);

      // Check Campaign Level Completion Target
      if (settings.campaignMode && newLevelApples >= currentLevel.targetApples) {
        sound.playLevelUp();
        onGameStateChange('LEVEL_CLEARED');
        // Bonus points for completing level!
        scoreGain += Math.round(100 * multiplier);
      }

      foodRef.current = spawnFood('REGULAR');

      // Randomly spawn golden food every 5-6 apples if none currently active
      if (newTotalApples % 5 === 0 && !goldenFoodRef.current) {
        goldenFoodRef.current = spawnFood('GOLDEN');
      }
    }

    // Golden Food
    if (goldenFoodRef.current && head.x === goldenFoodRef.current.x && head.y === goldenFoodRef.current.y) {
      ateFood = true;
      scoreGain += Math.round(50 * multiplier);
      sound.playGoldenEat();
      createParticles(head.x, head.y, '#fbbf24', 24);
      goldenFoodRef.current = null;
    }

    // Check golden food expiration
    if (goldenFoodRef.current) {
      const elapsed = Date.now() - goldenFoodRef.current.createdAt;
      if (elapsed > goldenFoodRef.current.durationMs) {
        goldenFoodRef.current = null;
      }
    }

    if (scoreGain > 0) {
      onScoreChange(score + scoreGain);
    }

    // Move Snake Segments
    const newSnake = [head, ...currentSnake];
    if (!ateFood) {
      newSnake.pop();
    }
    snakeRef.current = newSnake;
  }, [
    activeSkin.particleColor,
    applesEaten,
    currentDirectionRef,
    currentLevel.obstacles,
    currentLevel.targetApples,
    levelApplesEaten,
    onApplesChange,
    onGameOver,
    onGameStateChange,
    onLevelApplesChange,
    onScoreChange,
    score,
    settings.campaignMode,
    settings.difficulty,
    settings.wallMode,
    spawnFood,
  ]);

  // Animation & Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = (time: number) => {
      if (!isRunning) return;

      if (gameState === 'PLAYING') {
        const interval = getTickInterval();
        if (time - lastTickTimeRef.current >= interval) {
          lastTickTimeRef.current = time;
          stepGame();
        }
      }

      // Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Decay Screen Shake
      if (shakeRef.current > 0) {
        shakeRef.current *= 0.85;
        if (shakeRef.current < 0.2) shakeRef.current = 0;
      }

      // Update Tongue Flickering timer
      tongueTimerRef.current = (tongueTimerRef.current + 1) % 40;

      // Draw Canvas Frame
      drawCanvas(ctx, canvas, time);

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [gameState, getTickInterval, stepGame]);

  // Canvas Drawing Routine
  const drawCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, timestamp: number) => {
    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / GRID_SIZE;

    ctx.save();

    // Screen Shake
    if (shakeRef.current > 0) {
      const sx = (Math.random() - 0.5) * shakeRef.current * 2;
      const sy = (Math.random() - 0.5) * shakeRef.current * 2;
      ctx.translate(sx, sy);
    }

    // 1. Arena Background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // Subtle Grid Overlay
    if (settings.showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);
        ctx.stroke();
      }
    }

    // 2. Render Level Obstacles
    currentLevel.obstacles.forEach((obs) => {
      const ox = obs.x * cellSize;
      const oy = obs.y * cellSize;
      const oPad = 1;

      // Obstacle block with high-tech hazard styling
      ctx.fillStyle = '#1e293b';
      drawRoundedRect(ctx, ox + oPad, oy + oPad, cellSize - oPad * 2, cellSize - oPad * 2, 4);
      ctx.fill();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner diagonal danger stripe or core
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(ox + cellSize * 0.25, oy + cellSize * 0.25, cellSize * 0.5, cellSize * 0.5);
    });

    // 3. Boundary Borders
    if (settings.wallMode === 'SOLID') {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);

      const bracketLen = 14;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;

      // Corners
      ctx.beginPath();
      ctx.moveTo(1, 1 + bracketLen);
      ctx.lineTo(1, 1);
      ctx.lineTo(1 + bracketLen, 1);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width - 1 - bracketLen, 1);
      ctx.lineTo(width - 1, 1);
      ctx.lineTo(width - 1, 1 + bracketLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(1, height - 1 - bracketLen);
      ctx.lineTo(1, height - 1);
      ctx.lineTo(1 + bracketLen, height - 1);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width - 1 - bracketLen, height - 1);
      ctx.lineTo(width - 1, height - 1);
      ctx.lineTo(width - 1, height - 1 - bracketLen);
      ctx.stroke();
    } else {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(1, 1, width - 2, height - 2);
      ctx.setLineDash([]);
    }

    // 4. Render Normal Food (Apple)
    const food = foodRef.current;
    if (food) {
      const fx = food.x * cellSize;
      const fy = food.y * cellSize;
      const fRadius = (cellSize / 2) * 0.78;
      const centerX = fx + cellSize / 2;
      const centerY = fy + cellSize / 2 + Math.sin(timestamp * 0.005) * 1.5;

      const foodGlow = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, cellSize * 0.8);
      foodGlow.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
      foodGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = foodGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, cellSize * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Apple Body
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(centerX, centerY, fRadius, 0, Math.PI * 2);
      ctx.fill();

      // Apple Highlight
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.arc(centerX - fRadius * 0.35, centerY - fRadius * 0.35, fRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Apple Stem & Leaf
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - fRadius + 1);
      ctx.quadraticCurveTo(centerX + 2, centerY - fRadius - 4, centerX + 4, centerY - fRadius - 5);
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(centerX + 3, centerY - fRadius - 3, 3.5, 2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Render Golden Food
    const gFood = goldenFoodRef.current;
    if (gFood) {
      const gx = gFood.x * cellSize;
      const gy = gFood.y * cellSize;
      const gRadius = (cellSize / 2) * 0.88;
      const centerX = gx + cellSize / 2;
      const centerY = gy + cellSize / 2;

      const elapsed = Date.now() - gFood.createdAt;
      const remainingPct = Math.max(0, 1 - elapsed / gFood.durationMs);

      const isUrgent = remainingPct < 0.35;
      const flashAlpha = isUrgent ? 0.4 + 0.6 * Math.sin(timestamp * 0.02) : 1;

      ctx.save();
      ctx.globalAlpha = flashAlpha;

      const glowSize = cellSize * (1.1 + 0.2 * Math.sin(timestamp * 0.008));
      const goldenGlow = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, glowSize);
      goldenGlow.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
      goldenGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = goldenGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, gRadius + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remainingPct);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      drawStar(ctx, centerX, centerY, 5, gRadius, gRadius * 0.5);
      ctx.fill();

      ctx.fillStyle = '#fef3c7';
      drawStar(ctx, centerX, centerY, 5, gRadius * 0.45, gRadius * 0.2);
      ctx.fill();

      ctx.restore();
    }

    // 6. Render Snake with Selected Skin
    const snake = snakeRef.current;
    if (snake.length > 0) {
      const head = snake[0];
      const headX = head.x * cellSize;
      const headY = head.y * cellSize;
      const dir = directionRef.current;

      // Draw Body Segments with Skin styling
      for (let i = snake.length - 1; i >= 1; i--) {
        const seg = snake[i];
        const segX = seg.x * cellSize;
        const segY = seg.y * cellSize;

        if (activeSkin.id === 'RAINBOW') {
          // Dynamic rainbow shift
          const hue = (timestamp * 0.08 + i * 18) % 360;
          ctx.fillStyle = `hsl(${hue}, 85%, 55%)`;
        } else {
          // Custom skin gradient interpolation
          const progress = i / snake.length;
          ctx.fillStyle = activeSkin.bodyGradient[progress > 0.5 ? 1 : 0];
        }

        const pad = 2;
        const segRadius = (cellSize - pad * 2) * 0.35;
        drawRoundedRect(
          ctx,
          segX + pad,
          segY + pad,
          cellSize - pad * 2,
          cellSize - pad * 2,
          segRadius
        );
        ctx.fill();

        // Connect adjacent segments smoothly
        const nextSeg = snake[i - 1];
        if (Math.abs(seg.x - nextSeg.x) <= 1 && Math.abs(seg.y - nextSeg.y) <= 1) {
          const midX = ((seg.x + nextSeg.x) / 2) * cellSize + cellSize / 2;
          const midY = ((seg.y + nextSeg.y) / 2) * cellSize + cellSize / 2;
          ctx.beginPath();
          ctx.arc(midX, midY, (cellSize - pad * 2) / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Snake Tongue
      if (tongueTimerRef.current > 30) {
        ctx.strokeStyle = activeSkin.tongueColor;
        ctx.lineWidth = 1.8;
        const hCenterX = headX + cellSize / 2;
        const hCenterY = headY + cellSize / 2;
        let startX = hCenterX;
        let startY = hCenterY;
        let tipX = hCenterX;
        let tipY = hCenterY;
        const tongueLen = cellSize * 0.45;

        if (dir === 'RIGHT') {
          startX += cellSize * 0.4;
          tipX = startX + tongueLen;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(tipX, tipY);
          ctx.lineTo(tipX + 3, tipY - 2.5);
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX + 3, tipY + 2.5);
          ctx.stroke();
        } else if (dir === 'LEFT') {
          startX -= cellSize * 0.4;
          tipX = startX - tongueLen;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(tipX, tipY);
          ctx.lineTo(tipX - 3, tipY - 2.5);
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX - 3, tipY + 2.5);
          ctx.stroke();
        } else if (dir === 'UP') {
          startY -= cellSize * 0.4;
          tipY = startY - tongueLen;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(tipX, tipY);
          ctx.lineTo(tipX - 2.5, tipY - 3);
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX + 2.5, tipY - 3);
          ctx.stroke();
        } else if (dir === 'DOWN') {
          startY += cellSize * 0.4;
          tipY = startY + tongueLen;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(tipX, tipY);
          ctx.lineTo(tipX - 2.5, tipY + 3);
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX + 2.5, tipY + 3);
          ctx.stroke();
        }
      }

      // Draw Snake Head
      const hPad = 1.5;
      const headRadius = (cellSize - hPad * 2) * 0.42;

      if (activeSkin.id === 'RAINBOW') {
        const headHue = (timestamp * 0.08) % 360;
        ctx.fillStyle = `hsl(${headHue}, 90%, 60%)`;
      } else {
        ctx.fillStyle = activeSkin.headColor;
      }

      drawRoundedRect(
        ctx,
        headX + hPad,
        headY + hPad,
        cellSize - hPad * 2,
        cellSize - hPad * 2,
        headRadius
      );
      ctx.fill();

      // Eyes
      const eyeRadius = cellSize * 0.16;
      const pupilRadius = cellSize * 0.08;

      let eye1 = { x: headX + cellSize / 2, y: headY + cellSize / 2 };
      let eye2 = { x: headX + cellSize / 2, y: headY + cellSize / 2 };
      let pupilOffset = { x: 0, y: 0 };

      if (dir === 'RIGHT') {
        eye1 = { x: headX + cellSize * 0.65, y: headY + cellSize * 0.28 };
        eye2 = { x: headX + cellSize * 0.65, y: headY + cellSize * 0.72 };
        pupilOffset = { x: 1, y: 0 };
      } else if (dir === 'LEFT') {
        eye1 = { x: headX + cellSize * 0.35, y: headY + cellSize * 0.28 };
        eye2 = { x: headX + cellSize * 0.35, y: headY + cellSize * 0.72 };
        pupilOffset = { x: -1, y: 0 };
      } else if (dir === 'UP') {
        eye1 = { x: headX + cellSize * 0.28, y: headY + cellSize * 0.35 };
        eye2 = { x: headX + cellSize * 0.72, y: headY + cellSize * 0.35 };
        pupilOffset = { x: 0, y: -1 };
      } else if (dir === 'DOWN') {
        eye1 = { x: headX + cellSize * 0.28, y: headY + cellSize * 0.65 };
        eye2 = { x: headX + cellSize * 0.72, y: headY + cellSize * 0.65 };
        pupilOffset = { x: 0, y: 1 };
      }

      // Eyeballs
      ctx.fillStyle = activeSkin.eyeColor;
      ctx.beginPath();
      ctx.arc(eye1.x, eye1.y, eyeRadius, 0, Math.PI * 2);
      ctx.arc(eye2.x, eye2.y, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Pupils
      ctx.fillStyle = activeSkin.pupilColor;
      ctx.beginPath();
      ctx.arc(eye1.x + pupilOffset.x, eye1.y + pupilOffset.y, pupilRadius, 0, Math.PI * 2);
      ctx.arc(eye2.x + pupilOffset.x, eye2.y + pupilOffset.y, pupilRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Render Particles
    particlesRef.current.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x * cellSize, p.y * cellSize, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 8. Overlay States
    if (gameState === 'READY') {
      ctx.fillStyle = 'rgba(11, 15, 25, 0.78)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillText('PRESS SPACE TO PLAY', width / 2, height / 2 - 18);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${currentLevel.name.toUpperCase()}`, width / 2, height / 2 + 10);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText('Swipe or use Arrow Keys / WASD', width / 2, height / 2 + 32);
    } else if (gameState === 'PAUSED') {
      ctx.fillStyle = 'rgba(11, 15, 25, 0.75)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.fillText('GAME PAUSED', width / 2, height / 2 - 10);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px system-ui, -apple-system, sans-serif';
      ctx.fillText('Press Space to Resume', width / 2, height / 2 + 18);
    } else if (gameState === 'LEVEL_CLEARED') {
      ctx.fillStyle = 'rgba(11, 15, 25, 0.88)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.fillText('★ LEVEL CLEARED! ★', width / 2, height / 2 - 32);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '15px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Target Reached! (+100 Bonus)`, width / 2, height / 2);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.fillText('Press Space / Tap to Advance', width / 2, height / 2 + 34);
    } else if (gameState === 'GAME_OVER') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.fillText('GAME OVER', width / 2, height / 2 - 42);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '16px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Final Score: ${score}`, width / 2, height / 2 - 10);

      if (score > highScore && score > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.fillText('★ NEW HIGH SCORE! ★', width / 2, height / 2 + 18);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Best: ${highScore}`, width / 2, height / 2 + 18);
      }

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px system-ui, -apple-system, sans-serif';
      ctx.fillText('Press R or Tap Below to Play Again', width / 2, height / 2 + 52);
    }

    ctx.restore();
  };

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  return (
    <div className="relative flex justify-center items-center select-none w-full max-w-[500px] aspect-square mx-auto">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (gameState === 'READY' || gameState === 'PAUSED') {
            onGameStateChange('PLAYING');
            sound.playClick();
          } else if (gameState === 'LEVEL_CLEARED') {
            onLevelComplete();
          }
        }}
        className="w-full h-full rounded-2xl shadow-2xl border border-slate-800 touch-none cursor-pointer"
      />
    </div>
  );
};
