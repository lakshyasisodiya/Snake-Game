import { LevelConfig, SnakeSkin, SnakeSkinId } from '../types/game';

export const SNAKE_SKINS: Record<SnakeSkinId, SnakeSkin> = {
  EMERALD: {
    id: 'EMERALD',
    name: 'Classic Emerald',
    tagline: 'Vibrant arcade green with jade undertones',
    headColor: '#10b981',
    bodyGradient: ['#34d399', '#059669'],
    eyeColor: '#ffffff',
    pupilColor: '#064e3b',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    particleColor: '#10b981',
    tongueColor: '#f43f5e',
  },
  CYBERPUNK: {
    id: 'CYBERPUNK',
    name: 'Cyber Neon',
    tagline: 'High-voltage electric cyan & magenta',
    headColor: '#06b6d4',
    bodyGradient: ['#38bdf8', '#d946ef'],
    eyeColor: '#fdf4ff',
    pupilColor: '#4a044e',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    particleColor: '#06b6d4',
    tongueColor: '#ec4899',
  },
  GOLDEN_DRAGON: {
    id: 'GOLDEN_DRAGON',
    name: 'Golden Dragon',
    tagline: 'Radiant imperial gold with amber fire',
    headColor: '#fbbf24',
    bodyGradient: ['#f59e0b', '#b45309'],
    eyeColor: '#fffbeb',
    pupilColor: '#78350f',
    glowColor: 'rgba(251, 191, 36, 0.55)',
    particleColor: '#f59e0b',
    tongueColor: '#dc2626',
  },
  LAVA_VIPER: {
    id: 'LAVA_VIPER',
    name: 'Lava Viper',
    tagline: 'Molten magma red with searing orange core',
    headColor: '#ef4444',
    bodyGradient: ['#f97316', '#b91c1c'],
    eyeColor: '#ffedd5',
    pupilColor: '#450a0a',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    particleColor: '#f97316',
    tongueColor: '#fbbf24',
  },
  ARCTIC_FROST: {
    id: 'ARCTIC_FROST',
    name: 'Arctic Frost',
    tagline: 'Sub-zero crystal blue and glacial teal',
    headColor: '#38bdf8',
    bodyGradient: ['#7dd3fc', '#0284c7'],
    eyeColor: '#f0f9ff',
    pupilColor: '#082f49',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    particleColor: '#bae6fd',
    tongueColor: '#38bdf8',
  },
  RAINBOW: {
    id: 'RAINBOW',
    name: 'Prism Rainbow',
    tagline: 'Dynamic shifting chromatic spectrum',
    headColor: '#ec4899',
    bodyGradient: ['#8b5cf6', '#06b6d4'],
    eyeColor: '#ffffff',
    pupilColor: '#1e1b4b',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    particleColor: '#ec4899',
    tongueColor: '#e11d48',
  },
};

// Crafted Levels for 20x20 Grid (x: 0..19, y: 0..19)
export const GAME_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Level 1: The Meadow',
    subtitle: 'Clear open arena to find your rhythm',
    targetApples: 5,
    obstacles: [],
  },
  {
    id: 2,
    name: 'Level 2: Four Pillars',
    subtitle: 'Navigate around strategic monoliths',
    targetApples: 7,
    obstacles: [
      // 4 quadrant pillar blocks (2x2 each)
      { x: 4, y: 4 }, { x: 5, y: 4 },
      { x: 4, y: 5 }, { x: 5, y: 5 },

      { x: 14, y: 4 }, { x: 15, y: 4 },
      { x: 14, y: 5 }, { x: 15, y: 5 },

      { x: 4, y: 14 }, { x: 5, y: 14 },
      { x: 4, y: 15 }, { x: 5, y: 15 },

      { x: 14, y: 14 }, { x: 15, y: 14 },
      { x: 14, y: 15 }, { x: 15, y: 15 },
    ],
  },
  {
    id: 3,
    name: 'Level 3: The Divider',
    subtitle: 'Central barrier wall with tight passing corridors',
    targetApples: 8,
    obstacles: [
      // Horizontal central wall with openings
      { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 4, y: 9 }, { x: 5, y: 9 },
      // gap at 6, 7, 8
      { x: 9, y: 9 }, { x: 10, y: 9 },
      // gap at 11, 12, 13
      { x: 14, y: 9 }, { x: 15, y: 9 }, { x: 16, y: 9 }, { x: 17, y: 9 },
    ],
  },
  {
    id: 4,
    name: 'Level 4: Twin Corridors',
    subtitle: 'Dual vertical channels requiring swift turns',
    targetApples: 10,
    obstacles: [
      // Two vertical bar segments with exits
      { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 },
      { x: 6, y: 13 }, { x: 6, y: 14 }, { x: 6, y: 15 }, { x: 6, y: 16 }, { x: 6, y: 17 },

      { x: 13, y: 2 }, { x: 13, y: 3 }, { x: 13, y: 4 }, { x: 13, y: 5 }, { x: 13, y: 6 },
      { x: 13, y: 13 }, { x: 13, y: 14 }, { x: 13, y: 15 }, { x: 13, y: 16 }, { x: 13, y: 17 },
    ],
  },
  {
    id: 5,
    name: 'Level 5: The Fortress',
    subtitle: 'Central stronghold with corner bastions',
    targetApples: 12,
    obstacles: [
      // Center ring
      { x: 8, y: 8 }, { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 },
      { x: 8, y: 11 }, { x: 9, y: 11 }, { x: 10, y: 11 }, { x: 11, y: 11 },
      { x: 8, y: 9 }, { x: 8, y: 10 },
      { x: 11, y: 9 }, { x: 11, y: 10 },

      // Corner angles
      { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 3 },
      { x: 17, y: 2 }, { x: 16, y: 2 }, { x: 17, y: 3 },
      { x: 2, y: 17 }, { x: 3, y: 17 }, { x: 2, y: 16 },
      { x: 17, y: 17 }, { x: 16, y: 17 }, { x: 17, y: 16 },
    ],
  },
  {
    id: 6,
    name: 'Level 6: The Labyrinth',
    subtitle: 'The ultimate serpent proving grounds',
    targetApples: 15,
    obstacles: [
      // Symmetrical maze turns
      { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 3, y: 7 },
      { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },

      { x: 16, y: 4 }, { x: 16, y: 5 }, { x: 16, y: 6 }, { x: 16, y: 7 },
      { x: 15, y: 4 }, { x: 14, y: 4 }, { x: 13, y: 4 },

      { x: 3, y: 15 }, { x: 3, y: 14 }, { x: 3, y: 13 }, { x: 3, y: 12 },
      { x: 4, y: 15 }, { x: 5, y: 15 }, { x: 6, y: 15 },

      { x: 16, y: 15 }, { x: 16, y: 14 }, { x: 16, y: 13 }, { x: 16, y: 12 },
      { x: 15, y: 15 }, { x: 14, y: 15 }, { x: 13, y: 15 },

      // Center cross
      { x: 9, y: 9 }, { x: 10, y: 9 },
      { x: 9, y: 10 }, { x: 10, y: 10 },
    ],
  },
];
