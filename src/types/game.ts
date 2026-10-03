export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameState = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'LEVEL_CLEARED' | 'VICTORY';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type WallMode = 'SOLID' | 'WRAP';

export type SnakeSkinId = 'EMERALD' | 'CYBERPUNK' | 'GOLDEN_DRAGON' | 'LAVA_VIPER' | 'ARCTIC_FROST' | 'RAINBOW';

export interface SnakeSkin {
  id: SnakeSkinId;
  name: string;
  tagline: string;
  headColor: string;
  bodyGradient: [string, string]; // [Head-adjacent color, Tail color]
  eyeColor: string;
  pupilColor: string;
  glowColor: string;
  particleColor: string;
  tongueColor: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Food {
  x: number;
  y: number;
  type: 'REGULAR' | 'GOLDEN';
  createdAt: number;
  durationMs: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  targetApples: number;
  obstacles: Position[];
}

export interface GameSettings {
  difficulty: Difficulty;
  wallMode: WallMode;
  showGrid: boolean;
  soundEnabled: boolean;
  skinId: SnakeSkinId;
  campaignMode: boolean; // if true, progresses level 1 -> 6; if false, plays selected level endlessly
  selectedLevel: number;
}
