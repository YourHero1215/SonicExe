import {
  CharacterPose,
  ChartNote,
  Direction,
  OpponentCharacterId,
  PlayerCharacterId,
  StageThemeId,
} from '../types/game';

export const LANE_COLORS: Record<Direction, string> = {
  0: '#C24B99', // FNF Left Purple (1000029634.png)
  1: '#00FFFF', // FNF Down Cyan (1000029634.png)
  2: '#12FA05', // FNF Up Green (1000029634.png)
  3: '#F9393F', // FNF Right Red (1000029634.png)
};

const LANE_OUTLINE_COLORS: Record<Direction, string> = {
  0: '#3C163B', // Deep plum outline for Left
  1: '#1542B7', // Deep cobalt outline for Down
  2: '#0A4447', // Deep dark teal outline for Up
  3: '#651038', // Deep burgundy outline for Right
};

const RECEPTOR_PRESSED_FILL: Record<Direction, string> = {
  0: '#7B5278',
  1: '#488494', // Matches lit Down receptor in Screenshot 2026-09-29 17.39.43.png
  2: '#4E8C57',
  3: '#8F4D57',
};

// Preloaded authentic sprite sheets for Encore BF (ENCORE_BF.png), Sonic.exe Laugh (sonicexe_laugh.png),
// Encore GF (Main2GF.png), and Triple Trouble (Tails.png, KnucklesEXE.png, eggman_soul.png, RingNote.png, BloodSplash.png)
const spriteSheetCache: Record<string, HTMLImageElement> = {};

function getSpriteSheet(src: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!spriteSheetCache[src]) {
    const img = new Image();
    img.src = src;
    spriteSheetCache[src] = img;
  }
  const cached = spriteSheetCache[src];
  return cached.complete && cached.naturalWidth > 0 ? cached : null;
}

function getEncoreBfSheet(): HTMLImageElement | null {
  return getSpriteSheet('/sprites/ENCORE_BF.png');
}

function getSonicExeSheet(): HTMLImageElement | null {
  return getSpriteSheet('/sprites/sonicexe.png');
}

if (typeof window !== 'undefined') {
  [
    '/sprites/ENCORE_BF.png',
    '/sprites/sonicexe.png',
    '/sprites/Main2GF.png',
    '/sprites/Tails.png',
    '/sprites/KnucklesEXE.png',
    '/sprites/eggman_soul.png',
    '/sprites/RingNote.png',
    '/sprites/BloodSplash.png',
    '/sprites/icon-tails.png',
    '/sprites/icon-knux.png',
    '/sprites/icon-eggman.png',
    '/sprites/icon-xenophanes.png',
  ].forEach((src) => getSpriteSheet(src));
}

// Exact 11-frame Sparrow v2 SubTexture animations & Psych Engine offsets for Too Slow Sonic.exe from sonicexe.xml + sonicexe.json
const SONIC_EXE_TOO_SLOW_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right',
  {
    offset: [number, number];
    frames: readonly { x: number; y: number; w: number; h: number; fx: number; fy: number }[];
  }
> = {
  idle: {
    offset: [-60, -80],
    frames: [
      { x: 2216, y: 1288, w: 430, h: 662, fx: -4, fy: -6 },
      { x: 2646, y: 1288, w: 430, h: 661, fx: -4, fy: -7 },
      { x: 3076, y: 1288, w: 435, h: 662, fx: -3, fy: -6 },
      { x: 3511, y: 1288, w: 452, h: 665, fx: -1, fy: -2 },
      { x: 0, y: 1953, w: 457, h: 667, fx: 0, fy: 0 },
      { x: 457, y: 1953, w: 459, h: 667, fx: 0, fy: 0 },
      { x: 916, y: 1953, w: 458, h: 667, fx: 0, fy: 0 },
      { x: 1374, y: 1953, w: 454, h: 666, fx: -1, fy: -1 },
      { x: 1828, y: 1953, w: 436, h: 663, fx: -3, fy: -5 },
      { x: 2264, y: 1953, w: 430, h: 661, fx: -4, fy: -7 },
      { x: 2216, y: 1288, w: 430, h: 662, fx: -4, fy: -6 },
    ],
  },
  left: {
    offset: [110, -63],
    frames: [
      { x: 2694, y: 1953, w: 566, h: 701, fx: 0, fy: 0 },
      { x: 3260, y: 1953, w: 519, h: 692, fx: -46, fy: -10 },
      { x: 0, y: 2654, w: 496, h: 676, fx: -69, fy: -26 },
      { x: 496, y: 2654, w: 491, h: 666, fx: -74, fy: -35 },
      { x: 987, y: 2654, w: 490, h: 663, fx: -75, fy: -39 },
      { x: 1477, y: 2654, w: 490, h: 659, fx: -75, fy: -43 },
      { x: 1967, y: 2654, w: 490, h: 658, fx: -75, fy: -44 },
      { x: 2457, y: 2654, w: 489, h: 657, fx: -76, fy: -45 },
      { x: 2946, y: 2654, w: 489, h: 655, fx: -76, fy: -46 },
      { x: 3435, y: 2654, w: 490, h: 654, fx: -75, fy: -47 },
      { x: 0, y: 3330, w: 490, h: 654, fx: -75, fy: -47 },
    ],
  },
  down: {
    offset: [20, -160],
    frames: [
      { x: 0, y: 710, w: 567, h: 562, fx: -11, fy: -16 },
      { x: 567, y: 710, w: 552, h: 567, fx: -3, fy: -12 },
      { x: 1119, y: 710, w: 554, h: 576, fx: -1, fy: -3 },
      { x: 1673, y: 710, w: 554, h: 574, fx: 0, fy: -5 },
      { x: 2227, y: 710, w: 554, h: 572, fx: 0, fy: -7 },
      { x: 2781, y: 710, w: 554, h: 577, fx: 0, fy: -2 },
      { x: 3335, y: 710, w: 554, h: 578, fx: 0, fy: -1 },
      { x: 0, y: 1288, w: 554, h: 579, fx: 0, fy: 0 },
      { x: 554, y: 1288, w: 554, h: 579, fx: 0, fy: 0 },
      { x: 1108, y: 1288, w: 554, h: 579, fx: 0, fy: 0 },
      { x: 1662, y: 1288, w: 554, h: 579, fx: 0, fy: 0 },
    ],
  },
  up: {
    offset: [34, 31],
    frames: [
      { x: 1864, y: 4062, w: 623, h: 777, fx: -6, fy: 0 },
      { x: 2487, y: 4062, w: 613, h: 755, fx: -11, fy: -22 },
      { x: 3100, y: 4062, w: 609, h: 744, fx: -11, fy: -33 },
      { x: 0, y: 4839, w: 613, h: 742, fx: -6, fy: -35 },
      { x: 613, y: 4839, w: 614, h: 745, fx: -4, fy: -32 },
      { x: 1227, y: 4839, w: 615, h: 745, fx: -2, fy: -32 },
      { x: 1842, y: 4839, w: 615, h: 744, fx: -2, fy: -33 },
      { x: 2457, y: 4839, w: 616, h: 743, fx: -1, fy: -34 },
      { x: 3073, y: 4839, w: 616, h: 742, fx: -1, fy: -35 },
      { x: 0, y: 5584, w: 617, h: 743, fx: 0, fy: -34 },
      { x: 617, y: 5584, w: 617, h: 743, fx: 0, fy: -34 },
    ],
  },
  right: {
    offset: [-90, -16],
    frames: [
      { x: 490, y: 3330, w: 533, h: 710, fx: 0, fy: -22 },
      { x: 1023, y: 3330, w: 482, h: 732, fx: -3, fy: 0 },
      { x: 1505, y: 3330, w: 474, h: 715, fx: -3, fy: -17 },
      { x: 1979, y: 3330, w: 471, h: 714, fx: -3, fy: -18 },
      { x: 2450, y: 3330, w: 468, h: 713, fx: -4, fy: -19 },
      { x: 2918, y: 3330, w: 467, h: 719, fx: -4, fy: -13 },
      { x: 3385, y: 3330, w: 467, h: 719, fx: -4, fy: -13 },
      { x: 0, y: 4062, w: 466, h: 720, fx: -4, fy: -12 },
      { x: 466, y: 4062, w: 466, h: 720, fx: -4, fy: -12 },
      { x: 932, y: 4062, w: 466, h: 720, fx: -4, fy: -12 },
      { x: 1398, y: 4062, w: 466, h: 720, fx: -4, fy: -12 },
    ],
  },
};

// Exact Sparrow v2 SubTexture frames for Main2GF (gf-encore.json: DanceLeft & DanceRight at 20fps, scale 0.9)
const GF_ENCORE_DANCE_LEFT_FRAMES = [
  { x: 0, y: 0, w: 348, h: 583, fx: -3, fy: 0 },
  { x: 348, y: 0, w: 350, h: 583, fx: -2, fy: 0 },
  { x: 698, y: 0, w: 354, h: 582, fx: 0, fy: -1 },
  { x: 1052, y: 0, w: 350, h: 583, fx: -3, fy: 0 },
  { x: 1402, y: 0, w: 348, h: 580, fx: -9, fy: -3 },
  { x: 1750, y: 0, w: 346, h: 580, fx: -9, fy: -3 },
  { x: 2096, y: 0, w: 344, h: 580, fx: -11, fy: -3 },
  { x: 2440, y: 0, w: 344, h: 580, fx: -11, fy: -3 },
  { x: 2784, y: 0, w: 340, h: 580, fx: -14, fy: -3 },
] as const;

const GF_ENCORE_DANCE_RIGHT_FRAMES = [
  { x: 3124, y: 0, w: 334, h: 580, fx: -18, fy: -3 },
  { x: 3458, y: 0, w: 341, h: 577, fx: -25, fy: -6 },
  { x: 0, y: 583, w: 338, h: 578, fx: -27, fy: -5 },
  { x: 338, y: 583, w: 343, h: 576, fx: -23, fy: -7 },
  { x: 681, y: 583, w: 344, h: 576, fx: -22, fy: -7 },
  { x: 1025, y: 583, w: 344, h: 575, fx: -22, fy: -8 },
  { x: 1369, y: 583, w: 349, h: 575, fx: -17, fy: -8 },
  { x: 1718, y: 583, w: 351, h: 575, fx: -14, fy: -8 },
] as const;

// Exact Sparrow v2 SubTexture frames & offsets for Tails.EXE (tails.json, scale 1.2)
const TAILS_EXE_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right',
  {
    offset: [number, number];
    frames: readonly { x: number; y: number; w: number; h: number; fx: number; fy: number }[];
  }
> = {
  idle: {
    offset: [0, 0],
    frames: [
      { x: 3275, y: 0, w: 257, h: 412, fx: -5, fy: 0 },
      { x: 0, y: 412, w: 259, h: 412, fx: -4, fy: 0 },
      { x: 781, y: 412, w: 264, h: 412, fx: 0, fy: 0 },
      { x: 1573, y: 412, w: 264, h: 412, fx: 0, fy: 0 },
      { x: 2365, y: 412, w: 264, h: 412, fx: 0, fy: 0 },
      { x: 3156, y: 412, w: 261, h: 412, fx: -2, fy: 0 },
    ],
  },
  left: {
    offset: [84, -13],
    frames: [
      { x: 258, y: 824, w: 352, h: 398, fx: 0, fy: -2 },
      { x: 610, y: 824, w: 348, h: 399, fx: -4, fy: -1 },
      { x: 958, y: 824, w: 347, h: 399, fx: -5, fy: -1 },
      { x: 1305, y: 824, w: 346, h: 399, fx: -6, fy: -1 },
      { x: 1651, y: 824, w: 346, h: 400, fx: -6, fy: 0 },
    ],
  },
  down: {
    offset: [17, -51],
    frames: [
      { x: 0, y: 0, w: 299, h: 352, fx: 0, fy: -9 },
      { x: 299, y: 0, w: 298, h: 356, fx: 0, fy: -5 },
      { x: 597, y: 0, w: 297, h: 358, fx: -1, fy: -3 },
      { x: 894, y: 0, w: 297, h: 359, fx: -1, fy: -2 },
      { x: 1191, y: 0, w: 298, h: 360, fx: 0, fy: -1 },
    ],
  },
  up: {
    offset: [20, 39],
    frames: [
      { x: 3574, y: 1236, w: 305, h: 451, fx: -4, fy: 0 },
      { x: 0, y: 1687, w: 309, h: 451, fx: -2, fy: 0 },
      { x: 309, y: 1687, w: 310, h: 448, fx: -1, fy: -3 },
      { x: 619, y: 1687, w: 312, h: 445, fx: 0, fy: -6 },
      { x: 931, y: 1687, w: 312, h: 444, fx: 0, fy: -7 },
    ],
  },
  right: {
    offset: [0, -16],
    frames: [
      { x: 0, y: 1236, w: 333, h: 396, fx: 0, fy: -1 },
      { x: 333, y: 1236, w: 323, h: 393, fx: 0, fy: -4 },
      { x: 656, y: 1236, w: 323, h: 397, fx: 0, fy: 0 },
      { x: 979, y: 1236, w: 323, h: 394, fx: 0, fy: -3 },
      { x: 1302, y: 1236, w: 323, h: 389, fx: 0, fy: -8 },
    ],
  },
};

// Exact Sparrow v2 SubTexture frames & offsets for Knuckles.EXE (knux.json, scale 1.1, flipX: true)
const KNUX_EXE_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right',
  {
    offset: [number, number];
    frames: readonly { x: number; y: number; w: number; h: number; fx: number; fy: number }[];
  }
> = {
  idle: {
    offset: [-150, 0],
    frames: [
      { x: 1946, y: 0, w: 295, h: 444, fx: 0, fy: -28 },
      { x: 2241, y: 0, w: 290, h: 445, fx: -5, fy: -27 },
      { x: 2531, y: 0, w: 278, h: 452, fx: -17, fy: -20 },
      { x: 2809, y: 0, w: 278, h: 463, fx: -17, fy: -9 },
      { x: 3087, y: 0, w: 279, h: 470, fx: -16, fy: -2 },
      { x: 3366, y: 0, w: 279, h: 472, fx: -16, fy: 0 },
    ],
  },
  down: {
    offset: [-80, -105],
    frames: [
      { x: 0, y: 0, w: 398, h: 356, fx: 0, fy: -19 },
      { x: 398, y: 0, w: 392, h: 366, fx: -3, fy: -9 },
      { x: 790, y: 0, w: 387, h: 372, fx: -5, fy: -3 },
      { x: 1177, y: 0, w: 385, h: 374, fx: -6, fy: -1 },
      { x: 1562, y: 0, w: 384, h: 375, fx: -7, fy: 0 },
    ],
  },
  up: {
    offset: [-130, 54],
    frames: [
      { x: 3409, y: 472, w: 327, h: 520, fx: -10, fy: 0 },
      { x: 3736, y: 472, w: 338, h: 508, fx: -4, fy: -12 },
      { x: 0, y: 992, w: 344, h: 503, fx: -1, fy: -17 },
      { x: 344, y: 992, w: 346, h: 500, fx: 0, fy: -20 },
    ],
  },
  // In knux.json: singLEFT -> prefix "Knux Right", singRIGHT -> prefix "Knux Left"
  left: {
    offset: [30, -70],
    frames: [
      { x: 1543, y: 472, w: 404, h: 402, fx: 0, fy: -6 },
      { x: 1947, y: 472, w: 394, h: 401, fx: -6, fy: -7 },
      { x: 2341, y: 472, w: 363, h: 407, fx: -24, fy: -1 },
      { x: 2704, y: 472, w: 353, h: 408, fx: -23, fy: 0 },
    ],
  },
  right: {
    offset: [-170, -70],
    frames: [
      { x: 3645, y: 0, w: 403, h: 407, fx: 0, fy: -2 },
      { x: 0, y: 472, w: 400, h: 407, fx: -3, fy: -2 },
      { x: 400, y: 472, w: 388, h: 409, fx: -13, fy: 0 },
      { x: 788, y: 472, w: 378, h: 409, fx: -20, fy: 0 },
    ],
  },
};

// Exact Sparrow v2 SubTexture frames & offsets for Eggman.EXE (eggy.json, scale 1.0, jijijija at 36fps)
const EGGY_EXE_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right' | 'laugh',
  {
    offset: [number, number];
    fps: number;
    frames: readonly { x: number; y: number; w: number; h: number; fx: number; fy: number }[];
  }
> = {
  idle: {
    offset: [0, 0],
    fps: 24,
    frames: [
      { x: 2380, y: 0, w: 504, h: 529, fx: 0, fy: -50 },
      { x: 2884, y: 0, w: 489, h: 533, fx: -4, fy: -46 },
      { x: 3373, y: 0, w: 492, h: 551, fx: -5, fy: -28 },
      { x: 3865, y: 0, w: 500, h: 564, fx: -5, fy: -16 },
      { x: 4365, y: 0, w: 502, h: 580, fx: -5, fy: 0 },
      { x: 4867, y: 0, w: 499, h: 580, fx: -5, fy: 0 },
    ],
  },
  down: {
    offset: [70, -100],
    fps: 24,
    frames: [
      { x: 0, y: 0, w: 602, h: 447, fx: 0, fy: -36 },
      { x: 602, y: 0, w: 597, h: 461, fx: -2, fy: -23 },
      { x: 1199, y: 0, w: 593, h: 484, fx: -4, fy: 0 },
      { x: 1792, y: 0, w: 588, h: 484, fx: -7, fy: 0 },
    ],
  },
  left: {
    offset: [160, 95],
    fps: 24,
    frames: [
      { x: 2348, y: 581, w: 677, h: 681, fx: 0, fy: 0 },
      { x: 3025, y: 581, w: 665, h: 675, fx: -12, fy: -6 },
      { x: 3690, y: 581, w: 652, h: 670, fx: -25, fy: -11 },
      { x: 4342, y: 581, w: 639, h: 664, fx: -38, fy: -17 },
    ],
  },
  up: {
    offset: [100, 239],
    fps: 24,
    frames: [
      { x: 1366, y: 1370, w: 749, h: 821, fx: 0, fy: 0 },
      { x: 2115, y: 1370, w: 745, h: 807, fx: -3, fy: -14 },
      { x: 2860, y: 1370, w: 738, h: 795, fx: -8, fy: -26 },
      { x: 3598, y: 1370, w: 731, h: 782, fx: -13, fy: -39 },
    ],
  },
  right: {
    offset: [0, 170],
    fps: 24,
    frames: [
      { x: 5620, y: 581, w: 702, h: 755, fx: 0, fy: -6 },
      { x: 6322, y: 581, w: 696, h: 757, fx: 0, fy: -4 },
      { x: 7018, y: 581, w: 690, h: 760, fx: 0, fy: -1 },
      { x: 0, y: 1370, w: 683, h: 762, fx: 0, fy: 0 },
    ],
  },
  laugh: {
    // jijijija -> Eggman_Laugh at 36fps, offsets [0, 205]
    offset: [0, 205],
    fps: 36,
    frames: [
      { x: 6863, y: 0, w: 484, h: 555, fx: 0, fy: -229 },
      { x: 7347, y: 0, w: 483, h: 561, fx: -4, fy: -223 },
      { x: 0, y: 581, w: 485, h: 569, fx: -6, fy: -216 },
      { x: 485, y: 581, w: 456, h: 728, fx: -6, fy: -59 },
      { x: 941, y: 581, w: 469, h: 789, fx: -44, fy: 0 },
      { x: 1410, y: 581, w: 469, h: 786, fx: -44, fy: -3 },
    ],
  },
};

// BloodSplash frames from ringnote.json (noteskins/BloodSplash)
const BLOOD_SPLASH_FRAMES = [
  { x: 0, y: 0, w: 101, h: 65, fx: -70, fy: -43 },
  { x: 101, y: 0, w: 218, h: 128, fx: -12, fy: 0 },
  { x: 0, y: 128, w: 238, h: 141, fx: -2, fy: -3 },
  { x: 238, y: 128, w: 241, h: 133, fx: -1, fy: -17 },
] as const;

export function drawBloodNoteSplash(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ageNormalized: number
): boolean {
  const splashImg = getSpriteSheet('/sprites/BloodSplash.png');
  if (!splashImg) return false;
  const idx = Math.min(
    BLOOD_SPLASH_FRAMES.length - 1,
    Math.floor(Math.max(0, ageNormalized) * BLOOD_SPLASH_FRAMES.length)
  );
  const f = BLOOD_SPLASH_FRAMES[idx];
  const scale = 0.68;
  const dw = f.w * scale;
  const dh = f.h * scale;
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - ageNormalized * 0.65);
  ctx.drawImage(
    splashImg,
    f.x,
    f.y,
    f.w,
    f.h,
    x - 121 * scale - f.fx * scale,
    y - 75 * scale - f.fy * scale,
    dw,
    dh
  );
  ctx.restore();
  return true;
}

// Exact Sparrow v2 SubTexture frames for SONIClaugh from sonicexe.xml
const SONIC_LAUGH_FRAMES = [
  { x: 0, y: 0, w: 534, h: 710, frameX: -17, frameY: 0 },
  { x: 534, y: 0, w: 538, h: 686, frameX: -5, frameY: -25 },
  { x: 1072, y: 0, w: 539, h: 678, frameX: -3, frameY: -33 },
  { x: 1611, y: 0, w: 541, h: 675, frameX: -1, frameY: -37 },
  { x: 2152, y: 0, w: 541, h: 672, frameX: -1, frameY: -40 },
  { x: 2693, y: 0, w: 542, h: 670, frameX: 0, frameY: -42 },
  { x: 3235, y: 0, w: 541, h: 668, frameX: -1, frameY: -44 },
] as const;

// Exact Sparrow v2 SubTexture frames & Psych Engine offsets for ENCORE_BF from ENCORE_BF.xml + bf-encore.json
const ENCORE_BF_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right' | 'miss',
  {
    offset: [number, number];
    frames: readonly { x: number; y: number; w: number; h: number }[];
  }
> = {
  idle: {
    offset: [-5, 0],
    frames: [
      { x: 539, y: 616, w: 774, h: 517 },
      { x: 1356, y: 616, w: 774, h: 517 },
      { x: 2173, y: 616, w: 774, h: 517 },
      { x: 2990, y: 616, w: 774, h: 517 },
      { x: 73, y: 1176, w: 774, h: 517 },
    ],
  },
  left: {
    offset: [105, -2],
    frames: [
      { x: 73, y: 73, w: 567, h: 500 },
      { x: 683, y: 73, w: 567, h: 500 },
      { x: 1293, y: 73, w: 567, h: 500 },
      { x: 1903, y: 73, w: 567, h: 500 },
    ],
  },
  down: {
    offset: [-7, -56],
    frames: [
      { x: 2513, y: 73, w: 423, h: 440 },
      { x: 2979, y: 73, w: 423, h: 440 },
      { x: 3445, y: 73, w: 423, h: 440 },
      { x: 73, y: 616, w: 423, h: 440 },
    ],
  },
  up: {
    offset: [-35, 37],
    frames: [
      { x: 2137, y: 2314, w: 494, h: 536 },
      { x: 2674, y: 2314, w: 494, h: 536 },
      { x: 3211, y: 2314, w: 494, h: 536 },
      { x: 73, y: 2893, w: 494, h: 536 },
    ],
  },
  right: {
    offset: [-28, -27],
    frames: [
      { x: 73, y: 2314, w: 473, h: 471 },
      { x: 589, y: 2314, w: 473, h: 471 },
      { x: 1105, y: 2314, w: 473, h: 471 },
      { x: 1621, y: 2314, w: 473, h: 471 },
    ],
  },
  miss: {
    offset: [-7, -53],
    frames: [
      { x: 890, y: 1176, w: 429, h: 443 },
      { x: 1362, y: 1176, w: 429, h: 443 },
      { x: 1834, y: 1176, w: 429, h: 443 },
    ],
  },
};

// Precomputed deterministic static noise patterns (8 animation frames) matching staticNotes.png
let staticPatterns: (CanvasPattern | null)[] = [];
function getStaticNotePattern(
  ctx: CanvasRenderingContext2D,
  frameIdx: number
): CanvasPattern | null {
  if (typeof document === 'undefined') return null;
  if (staticPatterns.length === 0) {
    for (let f = 0; f < 6; f++) {
      const off = document.createElement('canvas');
      off.width = 48;
      off.height = 48;
      const octx = off.getContext('2d');
      if (octx) {
        octx.fillStyle = '#F21B1B';
        octx.fillRect(0, 0, 48, 48);
        for (let y = 0; y < 48; y += 2) {
          for (let x = 0; x < 48; x += 2) {
            const r = Math.sin((x * 13.7 + y * 29.3 + f * 71.1)) * 43758.5453;
            const frac = r - Math.floor(r);
            if (frac > 0.54) {
              octx.fillStyle = '#FFFFFF';
              octx.fillRect(x, y, 2, 2);
            } else if (frac < 0.18) {
              octx.fillStyle = '#B91C1C';
              octx.fillRect(x, y, 2, 2);
            }
          }
        }
        staticPatterns.push(ctx.createPattern(off, 'repeat'));
      }
    }
  }
  return staticPatterns[Math.abs(frameIdx) % staticPatterns.length] || null;
}

// Helper to trace the rounded chunky FNF arrow path (pointing right at 0 rad, like 1000029634.png)
function traceRoundedFnfArrowPath(ctx: CanvasRenderingContext2D, half: number) {
  ctx.beginPath();
  // Rounded nose at right (+half, 0), sweeping to top wing, inner notch, and rounded tail
  ctx.moveTo(half * 0.96, 0);
  ctx.quadraticCurveTo(half * 0.96, -half * 0.14, half * 0.82, -half * 0.26);
  ctx.lineTo(half * 0.12, -half * 0.88);
  ctx.quadraticCurveTo(-half * 0.08, -half * 1.02, -half * 0.24, -half * 0.84);
  ctx.lineTo(-half * 0.34, -half * 0.72);
  ctx.quadraticCurveTo(-half * 0.44, -half * 0.58, -half * 0.26, -half * 0.42);
  ctx.lineTo(-half * 0.04, -half * 0.25);
  // Top shaft
  ctx.lineTo(-half * 0.78, -half * 0.27);
  ctx.quadraticCurveTo(-half * 0.94, -half * 0.27, -half * 0.94, -half * 0.08);
  ctx.lineTo(-half * 0.94, half * 0.08);
  ctx.quadraticCurveTo(-half * 0.94, half * 0.27, -half * 0.78, half * 0.27);
  // Bottom shaft & wing
  ctx.lineTo(-half * 0.04, half * 0.25);
  ctx.lineTo(-half * 0.26, half * 0.42);
  ctx.quadraticCurveTo(-half * 0.44, half * 0.58, -half * 0.34, half * 0.72);
  ctx.lineTo(-half * 0.24, half * 0.84);
  ctx.quadraticCurveTo(-half * 0.08, half * 1.02, half * 0.12, half * 0.88);
  ctx.lineTo(half * 0.82, half * 0.26);
  ctx.quadraticCurveTo(half * 0.96, half * 0.14, half * 0.96, 0);
  ctx.closePath();
}

// Helper to draw directional arrow inside receptor or note
export function drawFnfArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  dir: Direction,
  fillColor: string,
  isReceptor = false,
  isPressed = false,
  special: 'normal' | 'static' | 'phantom' | 'ring' = 'normal',
  extraSpinRad = 0,
  isMajinNoteskin = false
) {
  ctx.save();
  ctx.translate(x, y);

  if (special === 'ring') {
    // Ring Note (EXE) from ringnote.json: assetPath "notekinds/ringnote/ring", scale 0.7, purple0000/blue0000/green0000/red0000
    const ringSheet = getSpriteSheet('/sprites/RingNote.png');
    if (ringSheet) {
      const drawSize = size * 0.96;
      ctx.drawImage(
        ringSheet,
        112,
        24,
        150,
        150,
        -drawSize * 0.5,
        -drawSize * 0.5,
        drawSize,
        drawSize
      );
      ctx.restore();
      return;
    }

    const r = size * 0.42;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = '#FACC15';
    ctx.shadowColor = '#FDE047';
    ctx.shadowBlur = 12;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.lineWidth = size * 0.05;
    ctx.strokeStyle = '#FEF08A';
    ctx.stroke();
    ctx.restore();
    return;
  }

  const rotations = [Math.PI, Math.PI / 2, -Math.PI / 2, 0];
  ctx.rotate(rotations[dir] + extraSpinRad);

  const scale = isPressed ? 0.94 : 1.0;
  ctx.scale(scale, scale);

  const half = size * 0.48;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // 1. STATIC NOTE (matches staticNotes.png: yellow-gold border + flickering red/white TV static fill)
  if (special === 'static') {
    traceRoundedFnfArrowPath(ctx, half);
    const frameIdx = Math.floor(performance.now() / 42);
    const pat = getStaticNotePattern(ctx, frameIdx);
    ctx.fillStyle = pat || '#EF4444';
    ctx.fill();

    // Bright yellow-gold outer border from staticNotes.png
    ctx.lineWidth = size * 0.11;
    ctx.strokeStyle = '#EAB308';
    ctx.stroke();

    // Thin inner crimson rim from staticNotes.png
    ctx.lineWidth = size * 0.04;
    ctx.strokeStyle = '#DC2626';
    ctx.stroke();

    ctx.restore();
    return;
  }

  // 2. STRUMLINE RECEPTOR TARGETS (matches Screenshot 2026-09-29 17.39.43.png)
  if (isReceptor) {
    traceRoundedFnfArrowPath(ctx, half);
    // Thick black outer outline
    ctx.lineWidth = size * 0.14;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // Outer slate bevel ring
    ctx.fillStyle = isPressed
      ? RECEPTOR_PRESSED_FILL[dir]
      : isMajinNoteskin
        ? '#1E3A8A'
        : '#536270';
    ctx.fill();

    // Inner inset fill matching Screenshot 2026-09-29 17.39.43.png
    ctx.save();
    ctx.scale(0.84, 0.84);
    traceRoundedFnfArrowPath(ctx, half);
    ctx.fillStyle = isPressed
      ? RECEPTOR_PRESSED_FILL[dir]
      : isMajinNoteskin
        ? '#2563EB'
        : '#697887';
    ctx.fill();
    ctx.restore();

    ctx.restore();
    return;
  }

  // 3. SCROLLING COLORED NOTES (matches 1000029634.png with dark colored outer stroke + white inner rim + vivid fill)
  const effectiveColor = isMajinNoteskin
    ? dir === 0
      ? '#6366F1'
      : dir === 1
        ? '#38BDF8'
        : dir === 2
          ? '#2DD4BF'
          : '#3B82F6'
    : special === 'phantom'
      ? '#581C87'
      : LANE_COLORS[dir] || fillColor;

  const outlineColor = isMajinNoteskin
    ? '#0F172A'
    : special === 'phantom'
      ? '#F43F5E'
      : LANE_OUTLINE_COLORS[dir];

  // Outer dark colored border (from 1000029634.png)
  traceRoundedFnfArrowPath(ctx, half);
  ctx.lineWidth = size * 0.15;
  ctx.strokeStyle = outlineColor;
  ctx.stroke();

  // White inner border rim (from 1000029634.png)
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Vivid inner colored arrow body shifted slightly to expose the white inner highlight rim
  ctx.save();
  ctx.translate(-half * 0.03, 0);
  ctx.scale(0.86, 0.86);
  traceRoundedFnfArrowPath(ctx, half);
  ctx.fillStyle = effectiveColor;
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// Draw Majin Forest animated background & foreground boppers (Majin Boppers Back/Front + majin FG1/FG2)
export function drawMajinForestBoppers(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bpm: number,
  timeMs: number,
  layer: 'back' | 'front',
  cameraOffsetX = 0
) {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const beatPeriod = 60000 / bpm;
  const beatPhase = (timeMs % beatPeriod) / beatPeriod;
  const bopY = Math.abs(Math.sin(beatPhase * Math.PI)) * 12;

  const drawSculptedMajinBopper = (
    bx: number,
    by: number,
    scale: number,
    isForeground: boolean,
    flipX = false
  ) => {
    ctx.save();
    ctx.translate(bx, by);
    if (flipX) ctx.scale(-scale, scale);
    else ctx.scale(scale, scale);

    const fillCol = isForeground ? '#0B1536' : '#1E3A8A';
    const rimCol = isForeground ? '#3B82F6' : '#60A5FA';
    ctx.fillStyle = fillCol;
    ctx.strokeStyle = rimCol;
    ctx.lineWidth = 3;

    // Swept-back Majin quills
    ctx.beginPath();
    ctx.moveTo(-10, -56);
    ctx.lineTo(-48, -68);
    ctx.lineTo(-28, -46);
    ctx.lineTo(-56, -38);
    ctx.lineTo(-26, -24);
    ctx.lineTo(-48, -12);
    ctx.lineTo(-8, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Torso & Shoulders
    ctx.beginPath();
    ctx.roundRect(-24, -14, 48, 76, 16);
    ctx.fill();
    ctx.stroke();

    // Majin Head & Pointed Ears
    ctx.beginPath();
    ctx.moveTo(-16, -58);
    ctx.lineTo(-22, -82);
    ctx.lineTo(-4, -64);
    ctx.lineTo(10, -64);
    ctx.lineTo(22, -82);
    ctx.lineTo(20, -56);
    ctx.arc(2, -38, 26, -0.3, Math.PI + 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Iconic Majin M-brow, crescent eyes & wide cheek-to-cheek grin
    ctx.fillStyle = '#040717';
    ctx.beginPath();
    ctx.arc(-6, -40, 5, Math.PI, 0);
    ctx.arc(12, -40, 5, Math.PI, 0);
    ctx.fill();

    ctx.strokeStyle = rimCol;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-12, -28);
    ctx.quadraticCurveTo(3, -16, 18, -28);
    ctx.quadraticCurveTo(12, -14, 3, -14);
    ctx.quadraticCurveTo(-6, -14, -12, -28);
    ctx.stroke();

    ctx.restore();
  };

  if (layer === 'back') {
    const backPositions = [165, 355, 640, 925, 1115];
    backPositions.forEach((bx, idx) => {
      const parallaxX = bx - cameraOffsetX * 0.45;
      const by = h * 0.56 + (idx % 2 === 0 ? bopY : bopY * 0.7);
      drawSculptedMajinBopper(parallaxX, by, 0.92, false, idx >= 3);
    });
  } else {
    // Foreground zIndex 1000 & 1001: majin FG2 (left) and majin FG1 (right)
    drawSculptedMajinBopper(
      85 - cameraOffsetX * 1.1,
      h * 0.9 + bopY * 1.25,
      1.55,
      true,
      false
    );
    drawSculptedMajinBopper(
      w - 85 - cameraOffsetX * 1.1,
      h * 0.9 + bopY * 1.25,
      1.55,
      true,
      true
    );
  }

  ctx.restore();
}

// Draw 16-bit Sega Genesis Green Hill Zone pixel stage for You Can't Run's iconic mid-song switch
export function drawPixelGenesisStage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeMs: number
) {
  ctx.save();
  // Deep crimson-indigo 16-bit sky with Genesis horizontal scan-band gradient
  const skyBands = [
    '#120217',
    '#1F0421',
    '#330624',
    '#4D0824',
    '#6B0B24',
    '#8C1127',
    '#AB162B',
  ];
  const bandH = Math.ceil((h * 0.72) / skyBands.length);
  skyBands.forEach((col, idx) => {
    ctx.fillStyle = col;
    ctx.fillRect(0, idx * bandH, w, bandH + 2);
  });

  // Glowing 16-bit pixel blood moon in upper center
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(Math.floor(w * 0.5 - 44), 56, 88, 88);
  ctx.fillStyle = '#FCA5A5';
  ctx.fillRect(Math.floor(w * 0.5 - 32), 68, 64, 64);

  // Parallax scrolling pixel clouds & jagged Genesis mountains
  const scrollFar = Math.floor((timeMs * 0.025) % 240);
  ctx.fillStyle = '#2B0718';
  for (let x = -240; x < w + 240; x += 240) {
    const dx = Math.floor((x - scrollFar) / 8) * 8;
    ctx.fillRect(dx, h * 0.42, 160, h * 0.3);
    ctx.fillRect(dx + 24, h * 0.34, 112, h * 0.08);
    ctx.fillRect(dx + 48, h * 0.27, 64, h * 0.07);
  }

  // Iconic Green Hill Zone Checkered Loop-de-Loop Silhouette in Midground
  const loopScroll = Math.floor((timeMs * 0.04) % 640);
  const loopX = Math.floor((w * 0.72 - loopScroll * 0.15) / 8) * 8;
  ctx.fillStyle = '#3B170B';
  ctx.fillRect(loopX - 72, h * 0.32, 144, h * 0.4);
  ctx.fillStyle = '#5C2C16';
  ctx.fillRect(loopX - 56, h * 0.35, 112, h * 0.37);
  ctx.fillStyle = '#4A081E';
  ctx.fillRect(loopX - 32, h * 0.41, 64, h * 0.24);

  // Animated shimmering blood waterfalls in background with pixel foam
  for (let x = 96; x < w; x += 280) {
    const wave = Math.floor(((timeMs * 0.03 + x) % 32) / 8) * 8;
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(x, h * 0.48, 48, h * 0.24);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x + 8, h * 0.48 + wave, 12, 28);
    ctx.fillRect(x + 28, h * 0.52 + wave, 12, 28);
    ctx.fillStyle = '#FCA5A5';
    ctx.fillRect(x + 12, h * 0.48 + ((wave + 16) % 32), 6, 14);
    // Waterfall base splash
    ctx.fillRect(x - 6, h * 0.72 - 18, 60, 6);
  }

  // Classic Sega Genesis 3-Tone Beveled Brown Checkerboard Ground
  const groundY = Math.floor(h * 0.72);
  const tileSize = 28;
  for (let y = groundY; y < h; y += tileSize) {
    for (let x = 0; x < w; x += tileSize) {
      const col = Math.floor(x / tileSize);
      const row = Math.floor((y - groundY) / tileSize);
      const isLight = (col + row) % 2 === 0;
      ctx.fillStyle = isLight ? '#6E351B' : '#3D1A0B';
      ctx.fillRect(x, y, tileSize, tileSize);
      // Pixel bevel highlight & shadow inside each checkerboard tile
      ctx.fillStyle = isLight ? '#8C4625' : '#4F2310';
      ctx.fillRect(x + 2, y + 2, tileSize - 6, 4);
      ctx.fillRect(x + 2, y + 2, 4, tileSize - 6);
    }
  }

  // Corrupted Crimson Grass Top Strip with pixel overhangs
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(0, groundY - 16, w, 6);
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(0, groundY - 10, w, 10);
  ctx.fillStyle = '#991B1B';
  for (let x = 0; x < w; x += 24) {
    ctx.fillRect(x, groundY, 14, 10);
    ctx.fillRect(x + 4, groundY + 10, 6, 6);
  }

  ctx.restore();
}

// Draw High-Definition Girlfriend on the FNF Speaker Box bopping to the BPM
// Uses gf-encore (characters/Main2GF, scale 0.9, DanceLeft/DanceRight at 20fps) on all Encore songs!
export function drawSpeakerGirlfriend(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bpm: number,
  timeMs: number,
  stageTheme: StageThemeId,
  isEncore = false
) {
  const beatPeriod = 60000 / bpm;

  if (isEncore) {
    const gfEncoreSheet = getSpriteSheet('/sprites/Main2GF.png');
    if (gfEncoreSheet) {
      ctx.save();
      ctx.translate(cx, cy);

      // Ground shadow under Speaker Box
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 44, 138, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // danceEvery = 1 beat: even beats play danceLeft (offsets [-102, -109]), odd beats play danceRight (offsets [-106, -109]) at 20fps
      const beatCount = Math.floor(Math.max(0, timeMs) / beatPeriod);
      const beatLocalMs = Math.max(0, timeMs) % beatPeriod;
      const isDanceRight = beatCount % 2 === 1;
      const frames = isDanceRight
        ? GF_ENCORE_DANCE_RIGHT_FRAMES
        : GF_ENCORE_DANCE_LEFT_FRAMES;
      const frameIdx = Math.min(
        frames.length - 1,
        Math.floor(beatLocalMs / (1000 / 20))
      );
      const f = frames[frameIdx];

      // scale = 0.9 in gf-encore.json (scaled to our 1280x720 logical stage coordinates)
      const scale = 0.34 * 0.9;
      const animOffsetX = isDanceRight ? -106 : -102;
      const animOffsetY = -109;
      const drawW = f.w * scale;
      const drawH = f.h * scale;
      const drawX = -drawW * 0.5 - (animOffsetX + 104 + f.fx) * scale;
      const drawY = 52 - 583 * scale - (animOffsetY + 109 + f.fy) * scale;

      ctx.drawImage(
        gfEncoreSheet,
        f.x,
        f.y,
        f.w,
        f.h,
        drawX,
        drawY,
        drawW,
        drawH
      );
      ctx.restore();
      return;
    }
  }

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const beatPhase = (timeMs % beatPeriod) / beatPeriod;
  const bop = Math.abs(Math.sin(beatPhase * Math.PI)) * 6;
  const headTilt = Math.cos(beatPhase * Math.PI) * 0.09;

  ctx.translate(cx, cy);

  // Ground shadow under Speaker Box
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 44, 138, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Giant Dual-Subwoofer FNF Boombox Cabinet with 3D Bevel & Side Woofer Stacks
  const isBlue = stageTheme === 'endless-majin';
  const cabGrad = ctx.createLinearGradient(0, -52, 0, 42);
  cabGrad.addColorStop(0, isBlue ? '#1E293B' : '#27272A');
  cabGrad.addColorStop(1, isBlue ? '#0F172A' : '#121215');
  ctx.fillStyle = cabGrad;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.roundRect(-124, -48, 248, 90, 12);
  ctx.fill();
  ctx.stroke();

  // Top bevel highlight strip on Speaker Cabinet
  ctx.fillStyle = isBlue ? '#334155' : '#3F3F46';
  ctx.beginPath();
  ctx.roundRect(-118, -44, 236, 12, 6);
  ctx.fill();

  // Center Equalizer Display Panel
  ctx.fillStyle = '#09090B';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-24, -30, 48, 56, 6);
  ctx.fill();
  ctx.stroke();

  // Animated EQ Bars inside Center Panel
  const eqColors = isBlue
    ? ['#38BDF8', '#3B82F6', '#6366F1']
    : ['#EF4444', '#F59E0B', '#10B981'];
  for (let col = 0; col < 3; col++) {
    const barH = 12 + Math.abs(Math.sin(beatPhase * Math.PI + col * 1.1)) * 28;
    ctx.fillStyle = eqColors[col];
    ctx.fillRect(-16 + col * 12, 18 - barH, 8, barH);
  }

  // Left & Right Subwoofer Cones pulsing with the beat
  const conePulse = 1 + Math.max(0, 1 - beatPhase * 2.8) * 0.15;
  [-74, 74].forEach((sx) => {
    ctx.save();
    ctx.translate(sx, -2);
    ctx.scale(conePulse, conePulse);

    // Outer metallic subwoofer rim
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fillStyle = isBlue ? '#475569' : '#52525B';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // Deep speaker cone interior
    const coneGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, 28);
    coneGrad.addColorStop(0, '#27272A');
    coneGrad.addColorStop(1, '#09090B');
    ctx.beginPath();
    ctx.arc(0, 0, 27, 0, Math.PI * 2);
    ctx.fillStyle = coneGrad;
    ctx.fill();
    ctx.stroke();

    // Center dust cap with specular highlight
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fillStyle = isBlue ? '#2563EB' : '#3F3F46';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(-3, -3, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // --- GIRLFRIEND SITTING ON TOP OF THE SPEAKERS ---
  ctx.save();
  ctx.translate(0, -50 + bop * 0.45);

  const hairBackCol = isBlue ? '#1E3A8A' : '#6B141A';
  const hairMainCol = isBlue ? '#2563EB' : '#991B1B';
  const hairHiCol = isBlue ? '#60A5FA' : '#DC2626';
  const skinCol = isBlue ? '#BFDBFE' : '#FDE2C8';
  const dressCol = isBlue ? '#1D4ED8' : '#E11D48';

  // Voluminous Wavy Auburn Back Hair Cascade
  ctx.fillStyle = hairBackCol;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-38, -42);
  ctx.quadraticCurveTo(-56, -18, -46, 12);
  ctx.quadraticCurveTo(-24, 24, 0, 20);
  ctx.quadraticCurveTo(24, 24, 46, 12);
  ctx.quadraticCurveTo(56, -18, 38, -42);
  ctx.quadraticCurveTo(0, -72, -38, -42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red Sleeveless Dress Torso
  ctx.fillStyle = dressCol;
  ctx.beginPath();
  ctx.moveTo(-16, -20);
  ctx.lineTo(16, -20);
  ctx.lineTo(24, 14);
  ctx.quadraticCurveTo(0, 20, -24, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crossed Legs & Red High Heels resting on the front of the speaker box
  ctx.fillStyle = skinCol;
  ctx.beginPath();
  ctx.roundRect(-20, 10, 16, 26, 7);
  ctx.roundRect(4, 10, 16, 26, 7);
  ctx.fill();
  ctx.stroke();

  // Red High Heels
  ctx.fillStyle = dressCol;
  ctx.beginPath();
  ctx.ellipse(-12, 36, 9, 6, -0.2, 0, Math.PI * 2);
  ctx.ellipse(12, 36, 9, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Girlfriend's Head tilting left/right to the beat
  ctx.save();
  ctx.translate(0, -36);
  ctx.rotate(headTilt);

  // Face
  ctx.fillStyle = skinCol;
  ctx.beginPath();
  ctx.ellipse(0, 2, 22, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sculpted Front Hair Waves & Side Locks
  ctx.fillStyle = hairMainCol;
  ctx.beginPath();
  ctx.moveTo(-24, -2);
  ctx.quadraticCurveTo(-30, -28, 0, -28);
  ctx.quadraticCurveTo(30, -28, 24, -2);
  ctx.quadraticCurveTo(28, 16, 18, 22);
  ctx.quadraticCurveTo(20, 4, 14, -8);
  ctx.quadraticCurveTo(0, -16, -14, -8);
  ctx.quadraticCurveTo(-20, 4, -18, 22);
  ctx.quadraticCurveTo(-28, 16, -24, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hair sheen highlight arc
  ctx.strokeStyle = hairHiCol;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -12, 16, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Expressive Eyes & Cheerful Smile
  ctx.fillStyle = '#09080D';
  ctx.beginPath();
  ctx.ellipse(-7, 3, 2.8, 4.5, 0, 0, Math.PI * 2);
  ctx.ellipse(7, 3, 2.8, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 9, 5, 0.15, Math.PI - 0.15);
  ctx.stroke();

  ctx.restore(); // End Head
  ctx.restore(); // End GF
  ctx.restore();
}

// Helper to draw Sonic.exe's crimson-red grid microphone (from sonic.exe sprites.webp)
function drawExeRedMicrophone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angleRad = -0.45
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Red handle
  ctx.fillStyle = '#B91C1C';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-6, 0, 12, 34, 5);
  ctx.fill();
  ctx.stroke();

  // White gloved fingers wrapped around handle
  ctx.fillStyle = '#FFFFFF';
  for (let fy = 8; fy <= 22; fy += 7) {
    ctx.beginPath();
    ctx.ellipse(0, fy, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Crimson-red spherical mic head with black grid lines
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(0, -14, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Grid lines on red mic head
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-14, -14);
  ctx.lineTo(14, -14);
  ctx.moveTo(-11, -22);
  ctx.lineTo(11, -22);
  ctx.moveTo(-11, -6);
  ctx.lineTo(11, -6);
  ctx.moveTo(0, -31);
  ctx.lineTo(0, 3);
  ctx.moveTo(-9, -28);
  ctx.lineTo(-9, 0);
  ctx.moveTo(9, -28);
  ctx.lineTo(9, 0);
  ctx.stroke();

  ctx.restore();
}

// Draw authentic Too Slow Sonic.exe 5-pose sprites matching idle.jpg, left.jpg, down.jpg, up.jpg, right.jpg
// + SONIClaugh (image.png) whenever Sonic.exe laughs in Too Slow or Too Slow Encore!
function drawTooSlowSonicExeSprite(
  ctx: CanvasRenderingContext2D,
  pose: CharacterPose,
  timeMs: number,
  bpm: number,
  poseStartedMs = 0
) {
  const beatPeriod = 60000 / bpm;
  const elapsedPoseMs = Math.max(0, timeMs - poseStartedMs);
  const sonicExeSheet = getSonicExeSheet();
  if (sonicExeSheet) {
    ctx.save();
    // Larger, sharper scale so Sonic.exe's sprite details pop clearly on stage
    const scale = 0.38;

    // Subtle dark-crimson rim separation so Sonic.exe's dark quills & outlines stand out crisply
    ctx.shadowColor = 'rgba(220, 38, 38, 0.26)';
    ctx.shadowBlur = 8;

    if (pose === 'laugh') {
      const frameIdx =
        Math.floor(elapsedPoseMs / 42) % SONIC_LAUGH_FRAMES.length;
      const f = SONIC_LAUGH_FRAMES[frameIdx];
      const laughBounce = Math.sin(elapsedPoseMs * 0.055) * 6;
      const drawW = f.w * scale;
      const drawH = f.h * scale;
      const drawX = (-265 - f.frameX) * scale;
      const drawY = 82 - (751 - 40 + f.frameY) * scale + laughBounce * 0.35;

      // Pivot at feet (0, 82) for articulated laugh head/torso bounce
      ctx.translate(0, 82);
      ctx.scale(1 - laughBounce * 0.004, 1 + laughBounce * 0.006);
      ctx.translate(0, -82);

      ctx.drawImage(
        sonicExeSheet,
        f.x,
        f.y,
        f.w,
        f.h,
        drawX,
        drawY,
        drawW,
        drawH
      );
      ctx.restore();
      return;
    }

    // Map note hit pose to exact uploaded design (left, down, up, right), otherwise stay in idle!
    const poseKey: 'idle' | 'left' | 'down' | 'up' | 'right' =
      pose === 'left'
        ? 'left'
        : pose === 'down'
          ? 'down'
          : pose === 'up'
            ? 'up'
            : pose === 'right' || pose === 'gotcha'
              ? 'right'
              : 'idle';

    const anim = SONIC_EXE_TOO_SLOW_ANIMS[poseKey];
    let frameIdx = 0;
    if (poseKey === 'idle') {
      // Rhythmic 11-frame idle animation synced to every beat
      const beatPhase = (((timeMs % beatPeriod) + beatPeriod) % beatPeriod) / beatPeriod;
      frameIdx = Math.min(
        anim.frames.length - 1,
        Math.floor(beatPhase * anim.frames.length)
      );
    } else {
      // Play 24fps animation from frame 0 on note hit so he visibly moves into the pose,
      // then loop the subtle head-bounce settle frames (3..8) while holding a sustain note
      const rawFrame = Math.floor(elapsedPoseMs / (1000 / 24));
      if (rawFrame < anim.frames.length) {
        frameIdx = rawFrame;
      } else {
        frameIdx = 3 + ((rawFrame - anim.frames.length) % 6);
      }
    }

    const f = anim.frames[frameIdx];

    // Smooth entry slide/lunge tween over the first 95ms so he visibly moves into the note position
    const moveInT = poseKey === 'idle' ? 1 : Math.min(1, elapsedPoseMs / 95);
    const easeOutCubic = 1 - Math.pow(1 - moveInT, 3);
    const unreached = 1 - easeOutCubic;

    // Damped spring head-bounce when arriving at a note pose + rhythmic beat head-bob in idle
    const beatPhase = (((timeMs % beatPeriod) + beatPeriod) % beatPeriod) / beatPeriod;
    const idleHeadBop =
      poseKey === 'idle'
        ? Math.sin(beatPhase * Math.PI) * 7.5
        : 0;
    const noteHeadBounce =
      poseKey !== 'idle'
        ? Math.sin(elapsedPoseMs * 0.052) *
          Math.exp(-elapsedPoseMs * 0.0042) *
          11
        : 0;

    let slideX = 0;
    let slideY = 0;
    let squashX = 1;
    let squashY = 1;
    let tiltRad = 0;

    if (poseKey === 'left') {
      slideX = 34 * unreached - noteHeadBounce * 0.35;
      squashX = 1 + 0.06 * unreached;
      squashY = 1 - 0.04 * unreached + noteHeadBounce * 0.0045;
      tiltRad = -0.05 * (1 - unreached * 0.5) + noteHeadBounce * 0.003;
    } else if (poseKey === 'right') {
      slideX = -34 * unreached + noteHeadBounce * 0.35;
      squashX = 1 + 0.06 * unreached;
      squashY = 1 - 0.04 * unreached + noteHeadBounce * 0.0045;
      tiltRad = 0.05 * (1 - unreached * 0.5) - noteHeadBounce * 0.003;
    } else if (poseKey === 'up') {
      slideY = 30 * unreached - Math.abs(noteHeadBounce) * 0.45;
      squashX = 1 - 0.05 * (1 - unreached * 0.4);
      squashY = 1 + 0.07 * (1 - unreached * 0.4) + noteHeadBounce * 0.005;
      tiltRad = -0.025 * easeOutCubic;
    } else if (poseKey === 'down') {
      slideY = -26 * unreached + Math.abs(noteHeadBounce) * 0.45;
      squashX = 1 + 0.06 * easeOutCubic;
      squashY = 1 - 0.06 * easeOutCubic - noteHeadBounce * 0.005;
      tiltRad = 0.03 * easeOutCubic;
    } else {
      // Idle rhythmic head & upper-body bounce anchored at feet
      squashX = 1 + idleHeadBop * 0.0035;
      squashY = 1 - idleHeadBop * 0.0055;
      tiltRad = Math.cos(beatPhase * Math.PI) * 0.018;
    }

    // Pivot at Sonic.exe's feet (0, 82) so his shoes stay planted while his body & head move and bounce
    ctx.translate(slideX, 82 + slideY);
    ctx.rotate(tiltRad);
    ctx.scale(squashX, squashY);
    ctx.translate(0, -82);

    const drawW = f.w * scale;
    const drawH = f.h * scale;
    // Exact Psych Engine coordinate formula keeping feet anchored at y = 82
    const drawX = (-235 - anim.offset[0] - f.fx) * scale;
    const drawY =
      82 -
      (748 + anim.offset[1] + f.fy) * scale +
      (poseKey === 'idle' ? idleHeadBop * 0.45 : -noteHeadBounce * 0.55);

    ctx.drawImage(
      sonicExeSheet,
      f.x,
      f.y,
      f.w,
      f.h,
      drawX,
      drawY,
      drawW,
      drawH
    );

    // Articulated upper-head/quills micro-bounce pass (top 48% of sprite) for extra lively FNF head bounce
    const headClipRatio = 0.48;
    const headExtraBounceY =
      poseKey === 'idle'
        ? Math.sin((beatPhase - 0.12) * Math.PI) * 3.2
        : noteHeadBounce * 0.42;
    const headExtraTilt =
      poseKey === 'idle'
        ? Math.sin(beatPhase * Math.PI * 2) * 0.014
        : noteHeadBounce * 0.0028;

    if (Math.abs(headExtraBounceY) > 0.4) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(drawX - 24, drawY - 24, drawW + 48, drawH * headClipRatio + 24);
      ctx.clip();
      const headPivotX = drawX + drawW * 0.5;
      const headPivotY = drawY + drawH * headClipRatio;
      ctx.translate(headPivotX, headPivotY + headExtraBounceY);
      ctx.rotate(headExtraTilt);
      ctx.translate(-headPivotX, -headPivotY);
      ctx.drawImage(
        sonicExeSheet,
        f.x,
        f.y,
        f.w,
        f.h,
        drawX,
        drawY,
        drawW,
        drawH
      );
      ctx.restore();
    }

    ctx.restore();
    return;
  }

  const idleBop =
    pose === 'idle'
      ? Math.abs(Math.sin((timeMs / beatPeriod) * Math.PI)) * 7
      : 0;

  ctx.save();
  ctx.translate(0, idleBop);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const blueFur = '#1329A6';
  const darkBlueShade = '#09135C';
  const peachSkin = '#F1AD85';

  // Helper to draw Sonic's red shoe + white strap + ruffled white sock cuff
  const drawExeShoe = (
    sx: number,
    sy: number,
    rot = 0,
    pointsRight = true
  ) => {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rot);
    const dir = pointsRight ? 1 : -1;

    // White ruffled sock cuff
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-16, -22);
    ctx.lineTo(16, -22);
    ctx.lineTo(20, -6);
    ctx.lineTo(-20, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cuff fold line
    ctx.beginPath();
    ctx.moveTo(-14, -14);
    ctx.lineTo(14, -14);
    ctx.stroke();

    // Red Shoe body
    ctx.fillStyle = '#EF233C';
    ctx.beginPath();
    ctx.moveTo(-18 * dir, -6);
    ctx.quadraticCurveTo(15 * dir, -8, 38 * dir, 12);
    ctx.lineTo(-20 * dir, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White shoe stripe
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(2 * dir, -5);
    ctx.lineTo(12 * dir, -3);
    ctx.lineTo(10 * dir, 12);
    ctx.lineTo(-1 * dir, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  // --- LEGS & SHOES ---
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  if (pose === 'up' || pose === 'laugh') {
    // Pose 2 in sonic.exe sprites.webp: Left leg straight, right leg bent up at knee!
    ctx.strokeStyle = blueFur;
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(-8, 18);
    ctx.lineTo(-10, 62);
    ctx.stroke();

    // Bent leg raised
    ctx.beginPath();
    ctx.moveTo(10, 16);
    ctx.lineTo(28, 34);
    ctx.lineTo(8, 52);
    ctx.stroke();

    drawExeShoe(4, 58, 0.25, true);
    drawExeShoe(-12, 68, 0, false);
  } else if (pose === 'down') {
    // Pose 4 in sonic.exe sprites.webp: Wide crouching bent legs
    ctx.strokeStyle = blueFur;
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(-14, 28);
    ctx.lineTo(-26, 48);
    ctx.lineTo(-16, 66);
    ctx.moveTo(14, 28);
    ctx.lineTo(26, 48);
    ctx.lineTo(16, 66);
    ctx.stroke();

    drawExeShoe(-20, 68, 0, false);
    drawExeShoe(18, 68, 0, true);
  } else {
    // Standard / Left / Right legs
    const leanX = pose === 'right' || pose === 'gotcha' ? 12 : pose === 'left' ? -10 : 0;
    ctx.strokeStyle = blueFur;
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(-10 + leanX * 0.5, 16);
    ctx.lineTo(-18, 64);
    ctx.moveTo(10 + leanX * 0.5, 16);
    ctx.lineTo(16, 64);
    ctx.stroke();

    drawExeShoe(-20, 68, 0, false);
    drawExeShoe(16, 68, 0, true);
  }

  // --- TORSO & PEACH BELLY ---
  ctx.save();
  if (pose === 'down') {
    ctx.translate(0, 22);
    ctx.rotate(0.22);
  } else if (pose === 'left') {
    ctx.translate(-8, 4);
    ctx.rotate(-0.18);
  } else if (pose === 'right' || pose === 'gotcha') {
    ctx.translate(12, 2);
    ctx.rotate(0.16);
  }

  ctx.fillStyle = blueFur;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 2, 24, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Peach belly oval
  ctx.fillStyle = peachSkin;
  ctx.beginPath();
  ctx.ellipse(6, 4, 14, 21, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- HEAD, QUILLS, EYES & POSE-SPECIFIC JAW ---
  ctx.save();
  const headX =
    pose === 'right' || pose === 'gotcha'
      ? 22
      : pose === 'left'
        ? -14
        : pose === 'down'
          ? 8
          : 0;
  const headY =
    pose === 'down'
      ? -18
      : pose === 'up' || pose === 'laugh'
        ? -62
        : -50;
  ctx.translate(headX, headY);

  // Back Quills sweeping left (matching sonic.exe sprites.webp)
  ctx.fillStyle = blueFur;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  // Top quill
  ctx.moveTo(16, -40);
  ctx.quadraticCurveTo(-36, -52, -78, -26);
  ctx.quadraticCurveTo(-50, -14, -38, -8);
  // Middle quill
  ctx.quadraticCurveTo(-76, 0, -90, 18);
  ctx.quadraticCurveTo(-56, 18, -38, 20);
  // Bottom quill
  ctx.quadraticCurveTo(-66, 30, -74, 46);
  ctx.quadraticCurveTo(-38, 42, -10, 32);
  // Forehead curve
  ctx.quadraticCurveTo(38, 10, 38, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dark navy under-quill shading
  ctx.fillStyle = darkBlueShade;
  ctx.beginPath();
  ctx.moveTo(-72, -22);
  ctx.lineTo(-36, -8);
  ctx.lineTo(-52, -4);
  ctx.closePath();
  ctx.fill();

  // Back & Front Ears
  ctx.fillStyle = blueFur;
  ctx.beginPath();
  ctx.moveTo(2, -36);
  ctx.lineTo(10, -60);
  ctx.lineTo(22, -34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-24, -26);
  ctx.lineTo(-34, -48);
  ctx.lineTo(-10, -32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Peach inner ear triangle
  ctx.fillStyle = peachSkin;
  ctx.beginPath();
  ctx.moveTo(-23, -29);
  ctx.lineTo(-29, -42);
  ctx.lineTo(-14, -32);
  ctx.closePath();
  ctx.fill();

  // --- POSE-SPECIFIC EYES, MUZZLE & MOUTH ---
  if (pose === 'up' || pose === 'laugh') {
    // POSE 2 (Second from left in sonic.exe sprites.webp):
    // Unhinged tall gaping jaw, human-like upper/lower teeth, glowing red eyes
    ctx.fillStyle = '#050507';
    ctx.beginPath();
    ctx.ellipse(6, -12, 22, 16, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Glowing red pupils
    ctx.fillStyle = '#EF4444';
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, -12, 3.8, 0, Math.PI * 2);
    ctx.arc(20, -16, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Massive unhinged peach jaw stretching down to the right
    ctx.fillStyle = peachSkin;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-22, 2);
    ctx.quadraticCurveTo(4, -18, 34, -10);
    ctx.lineTo(52, 42);
    ctx.quadraticCurveTo(18, 52, -8, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dark mouth interior
    ctx.fillStyle = '#1A0508';
    ctx.beginPath();
    ctx.moveTo(-10, 2);
    ctx.quadraticCurveTo(14, -10, 32, -4);
    ctx.lineTo(46, 38);
    ctx.quadraticCurveTo(20, 42, -4, 12);
    ctx.closePath();
    ctx.fill();

    // Upper teeth row (white/ivory rounded teeth)
    ctx.fillStyle = '#FEF9C3';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(12 + i * 5, -2 + i * 2, 4, 7, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // Black nose at upper-right tip
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(32, -16, 6, 4, -0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (pose === 'left') {
    // POSE 3 (Middle in sonic.exe sprites.webp):
    // Screaming sideways C-mouth, clawed hand overhead, two glowing crimson eyes
    ctx.fillStyle = '#050507';
    ctx.beginPath();
    ctx.ellipse(8, -6, 22, 18, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Two bright crimson eyes inside socket
    ctx.fillStyle = '#EF4444';
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(4, -2, 4.5, 3, 0.2, 0, Math.PI * 2);
    ctx.ellipse(20, 0, 4, 2.8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Screaming sideways stretched peach muzzle & mouth
    ctx.fillStyle = peachSkin;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-26, -12);
    ctx.quadraticCurveTo(-8, -20, 2, 4);
    ctx.quadraticCurveTo(18, 6, 34, 10);
    ctx.quadraticCurveTo(8, 22, -18, 36);
    ctx.quadraticCurveTo(-34, 28, -26, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dark screaming mouth cavity
    ctx.fillStyle = '#1A0508';
    ctx.beginPath();
    ctx.moveTo(-20, -6);
    ctx.quadraticCurveTo(-6, 6, 18, 11);
    ctx.quadraticCurveTo(-4, 22, -16, 30);
    ctx.closePath();
    ctx.fill();

    // Black nose
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(26, 6, 6, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (pose === 'right' || pose === 'gotcha') {
    // POSE 5 (Far right in sonic.exe sprites.webp):
    // Tall vertical fang-filled roar facing right, blood tears dripping down muzzle
    ctx.fillStyle = '#050507';
    ctx.beginPath();
    ctx.ellipse(8, -10, 22, 17, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Blood dripping under eye socket
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(-4, 2, 22, 6);

    // Glowing red pupil
    ctx.fillStyle = '#EF4444';
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(14, -8, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Tall roaring peach muzzle & lower jaw
    ctx.fillStyle = peachSkin;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-24, 2);
    ctx.quadraticCurveTo(6, 10, 34, -8);
    ctx.lineTo(36, 46);
    ctx.quadraticCurveTo(12, 52, -4, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dark roaring mouth cavity
    ctx.fillStyle = '#1A0508';
    ctx.beginPath();
    ctx.moveTo(-10, 6);
    ctx.quadraticCurveTo(14, 10, 32, -2);
    ctx.lineTo(32, 42);
    ctx.quadraticCurveTo(14, 44, 0, 14);
    ctx.closePath();
    ctx.fill();

    // Sharp yellow fangs along upper & lower jaw (matching Pose 5!)
    ctx.fillStyle = '#FDE047';
    for (let i = 0; i < 5; i++) {
      const fx = -2 + i * 6.5;
      const fy = 6 - i * 1.2;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + 3, fy + 10);
      ctx.lineTo(fx + 6, fy);
      ctx.fill();

      const bfy = 38 - (4 - i) * 3;
      ctx.beginPath();
      ctx.moveTo(fx + 4, bfy);
      ctx.lineTo(fx + 7, bfy - 9);
      ctx.lineTo(fx + 10, bfy);
      ctx.fill();
    }

    // Black nose pointing up-right
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(36, -14, 6, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (pose === 'down') {
    // POSE 4 (Fourth from left in sonic.exe sprites.webp):
    // Hunched forward crouch, fierce furrowed brow, bared teeth grin
    ctx.fillStyle = '#050507';
    ctx.beginPath();
    ctx.ellipse(8, -4, 21, 15, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Glowing red pupil under brow
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(22, -1, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Peach muzzle with wide bared teeth grin
    ctx.fillStyle = peachSkin;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(6, 14, 28, 14, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bared teeth grin
    ctx.fillStyle = '#1A0508';
    ctx.beginPath();
    ctx.ellipse(4, 15, 20, 8, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FEF9C3';
    for (let tx = -12; tx <= 16; tx += 7) {
      ctx.fillRect(tx, 11, 5, 7);
    }

    // Black nose
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(32, 10, 6, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // POSE 1: IDLE (Far left in sonic.exe sprites.webp):
    // Large black eye socket, blood along lower socket, sinister bloody smile
    ctx.fillStyle = '#050507';
    ctx.beginPath();
    ctx.ellipse(8, -6, 22, 17, -0.08, 0, Math.PI * 2);
    ctx.fill();

    // Blood rim under eye socket
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(-6, 5, 24, 6);

    // Glowing red pinpoint pupil
    ctx.fillStyle = '#EF4444';
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(14, -4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Peach muzzle
    ctx.fillStyle = peachSkin;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(8, 14, 27, 13, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Sinister bloody smile on left side of muzzle
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.moveTo(-14, 8);
    ctx.quadraticCurveTo(-2, 22, 14, 14);
    ctx.quadraticCurveTo(-2, 14, -14, 8);
    ctx.fill();
    ctx.stroke();

    // Black nose at right tip
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(35, 11, 6, 4, -0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // End Head

  // --- PEACH ARMS, WHITE GLOVES & RED GRID MICROPHONE ---
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;

  if (pose === 'up' || pose === 'laugh') {
    // Pose 2: Right arm raised with index finger pointing straight up!
    ctx.strokeStyle = peachSkin;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-18, -8);
    ctx.lineTo(-42, -26);
    ctx.stroke();

    // White glove with raised index finger
    ctx.save();
    ctx.translate(-44, -36);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Pointing index finger
    ctx.beginPath();
    ctx.roundRect(-6, -34, 11, 26, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Left arm holding red mic out to the right
    drawExeRedMicrophone(ctx, 56, 2, -0.55);
  } else if (pose === 'left') {
    // Pose 3: Right arm curved high overhead with clawed white glove over forehead!
    ctx.strokeStyle = peachSkin;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-20, -4);
    ctx.quadraticCurveTo(-52, -48, -18, -94);
    ctx.stroke();

    // Clawed white glove overhead
    ctx.save();
    ctx.translate(-8, -94);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 13, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Curved claw fingers
    for (let f = -10; f <= 10; f += 7) {
      ctx.beginPath();
      ctx.ellipse(f, 10, 4.5, 9, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // Red mic held low on the right
    drawExeRedMicrophone(ctx, 26, 24, -0.25);
  } else if (pose === 'down') {
    // Pose 4: Splayed white glove low on left, red mic held low on right
    ctx.strokeStyle = peachSkin;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-20, 14);
    ctx.lineTo(-48, 36);
    ctx.stroke();

    ctx.save();
    ctx.translate(-52, 46);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    drawExeRedMicrophone(ctx, 36, 38, -0.35);
  } else {
    // Pose 1 (Idle) & Pose 5 (Right): Peach right arm hanging down with white cuffed glove
    const armOffsetX = pose === 'right' || pose === 'gotcha' ? 6 : 0;
    ctx.strokeStyle = peachSkin;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-18 + armOffsetX, -8);
    ctx.lineTo(-28 + armOffsetX, 32);
    ctx.stroke();

    // White cuffed glove hanging at left side
    ctx.save();
    ctx.translate(-28 + armOffsetX, 42);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-12, -12, 24, 10, 3);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 6, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Red grid microphone held in left hand (on right side of body)
    const micX = pose === 'right' || pose === 'gotcha' ? 42 : 32;
    const micY = pose === 'right' || pose === 'gotcha' ? 20 : 14;
    drawExeRedMicrophone(ctx, micX, micY, -0.2);
  }

  ctx.restore();
}

// Draw Opponent Character Sprite (Sonic.exe, YCR, Pixel, Xenophanes, Souls, Majin Sonic)
export function drawOpponentSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  character: OpponentCharacterId,
  pose: CharacterPose,
  timeMs: number,
  bpm: number,
  poseStartedMs = 0
) {
  const beatPeriod = 60000 / bpm;
  const elapsedPoseMs = Math.max(0, timeMs - poseStartedMs);
  const beatPhase = (((timeMs % beatPeriod) + beatPeriod) % beatPeriod) / beatPeriod;

  // 1. Triple Trouble: Tails.EXE (tails.json: assetPath "characters/Tails", scale 1.2, flipX: false)
  if (character === 'tails-soul') {
    const tailsSheet = getSpriteSheet('/sprites/Tails.png');
    if (tailsSheet) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 82, 62, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' =
        pose === 'left' || pose === 'down' || pose === 'up' || pose === 'right'
          ? pose
          : 'idle';
      const anim = TAILS_EXE_ANIMS[animKey];
      const frameIdx =
        animKey === 'idle'
          ? Math.floor(beatPhase * anim.frames.length) % anim.frames.length
          : Math.min(
              anim.frames.length - 1,
              Math.floor(elapsedPoseMs / (1000 / 24))
            );
      const f = anim.frames[frameIdx];

      const headBounce =
        animKey === 'idle'
          ? Math.sin(beatPhase * Math.PI) * 5
          : Math.sin(elapsedPoseMs * 0.05) * Math.exp(-elapsedPoseMs * 0.005) * 8;
      const moveIn = animKey === 'idle' ? 1 : Math.min(1, elapsedPoseMs / 85);
      const slideX =
        animKey === 'left'
          ? 20 * (1 - moveIn)
          : animKey === 'right'
            ? -20 * (1 - moveIn)
            : 0;

      // scale 1.2 from tails.json (enhanced size)
      const scale = 0.4 * 1.2;
      const drawW = f.w * scale;
      const drawH = f.h * scale;
      const drawX = -drawW * 0.5 - (anim.offset[0] + f.fx) * scale * 0.45 + slideX;
      const drawY =
        82 - 412 * scale - (anim.offset[1] + f.fy) * scale * 0.45 + headBounce * 0.4;

      ctx.drawImage(tailsSheet, f.x, f.y, f.w, f.h, drawX, drawY, drawW, drawH);
      ctx.restore();
      return;
    }
  }

  // 2. Triple Trouble: Knuckles.EXE (knux.json: assetPath "characters/KnucklesEXE", scale 1.1, flipX: true)
  if (character === 'knuckles-soul') {
    const knuxSheet = getSpriteSheet('/sprites/KnucklesEXE.png');
    if (knuxSheet) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 82, 66, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' =
        pose === 'left' || pose === 'down' || pose === 'up' || pose === 'right'
          ? pose
          : 'idle';
      const anim = KNUX_EXE_ANIMS[animKey];
      const frameIdx =
        animKey === 'idle'
          ? Math.floor(beatPhase * anim.frames.length) % anim.frames.length
          : Math.min(
              anim.frames.length - 1,
              Math.floor(elapsedPoseMs / (1000 / 24))
            );
      const f = anim.frames[frameIdx];

      const headBounce =
        animKey === 'idle'
          ? Math.sin(beatPhase * Math.PI) * 5.5
          : Math.sin(elapsedPoseMs * 0.05) * Math.exp(-elapsedPoseMs * 0.005) * 9;

      // scale 1.1 & flipX: true from knux.json (Knuckles stands on the right when lanes flip, facing left)
      const scale = 0.4 * 1.1;
      const drawW = f.w * scale;
      const drawH = f.h * scale;
      ctx.scale(-1, 1);
      const drawX =
        -drawW * 0.5 + (anim.offset[0] + 150 - f.fx) * scale * 0.35;
      const drawY =
        82 - 465 * scale - (anim.offset[1] + f.fy) * scale * 0.35 + headBounce * 0.4;

      ctx.drawImage(knuxSheet, f.x, f.y, f.w, f.h, drawX, drawY, drawW, drawH);
      ctx.restore();
      return;
    }
  }

  // 3. Triple Trouble: Eggman.EXE (eggy.json: assetPath "characters/eggman_soul", scale 1.0, jijijija at 36fps)
  if (character === 'eggman-soul') {
    const eggSheet = getSpriteSheet('/sprites/eggman_soul.png');
    if (eggSheet) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 82, 74, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' | 'laugh' =
        pose === 'left' ||
        pose === 'down' ||
        pose === 'up' ||
        pose === 'right' ||
        pose === 'laugh'
          ? pose
          : 'idle';
      const anim = EGGY_EXE_ANIMS[animKey];
      const frameIdx =
        animKey === 'idle'
          ? Math.floor(beatPhase * anim.frames.length) % anim.frames.length
          : animKey === 'laugh'
            ? Math.floor(elapsedPoseMs / (1000 / anim.fps)) % anim.frames.length
            : Math.min(
                anim.frames.length - 1,
                Math.floor(elapsedPoseMs / (1000 / anim.fps))
              );
      const f = anim.frames[frameIdx];

      const headBounce =
        animKey === 'idle'
          ? Math.sin(beatPhase * Math.PI) * 6
          : Math.sin(elapsedPoseMs * 0.05) * Math.exp(-elapsedPoseMs * 0.005) * 9;

      const scale = 0.38;
      const drawW = f.w * scale;
      const drawH = f.h * scale;
      const drawX = -drawW * 0.5 - (anim.offset[0] + f.fx) * scale * 0.35;
      const drawY =
        82 - 560 * scale - (anim.offset[1] + f.fy) * scale * 0.35 + headBounce * 0.4;

      ctx.drawImage(eggSheet, f.x, f.y, f.w, f.h, drawX, drawY, drawW, drawH);
      ctx.restore();
      return;
    }
  }

  // Use the exact 5-pose Sonic.exe sprites for Too Slow & You Can't Run (with enraged YCR blood/aura accents for ycr-exe)!
  if (character === 'sonic-exe' || character === 'ycr-exe') {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 82, 68, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    if (character === 'ycr-exe') {
      // Crimson Labyrinth Phase 2 aura & ragged quill spikes behind Sonic.exe P2
      ctx.save();
      ctx.fillStyle = 'rgba(220, 38, 38, 0.18)';
      ctx.beginPath();
      ctx.ellipse(0, -14, 84, 108, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawTooSlowSonicExeSprite(ctx, pose, timeMs, bpm, poseStartedMs);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const idleBop =
    pose === 'idle'
      ? Math.abs(Math.sin((timeMs / beatPeriod) * Math.PI)) * 10
      : 0;

  // Directional pose offsets & squash/stretch
  let dx = 0;
  let dy = idleBop;
  let sx = 1;
  let sy = 1;

  if (pose === 'left') {
    dx = -24;
    sx = 1.08;
    sy = 0.96;
  } else if (pose === 'right') {
    dx = 26;
    sx = 1.1;
    sy = 0.95;
  } else if (pose === 'up') {
    dy = -26;
    sx = 0.92;
    sy = 1.14;
  } else if (pose === 'down') {
    dy = 18;
    sx = 1.14;
    sy = 0.86;
  } else if (pose === 'laugh') {
    // singDOWN-alt maniacal laugh bounce
    dy = Math.sin(timeMs * 0.045) * 14 + 8;
    sx = 1.12;
    sy = 0.92;
  } else if (pose === 'gotcha') {
    // "I'm gonna getcha! I am... GOD." lunging closeup pose
    dx = 34;
    dy = -12 + Math.sin(timeMs * 0.03) * 6;
    sx = 1.24;
    sy = 1.24;
  }

  ctx.translate(x + dx, y + dy);
  ctx.scale(sx, sy);

  // Character-specific palettes & silhouettes
  const isXenophanes = character === 'xenophanes';
  const isMajin = character === 'majin' || character === 'majin-og';
  const isFakeSonic = character === 'sonicexefake';
  const isPixel = character === 'pixel-exe';
  const isTails = character === 'tails-soul';
  const isKnuckles = character === 'knuckles-soul';
  const isEggman = character === 'eggman-soul';

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.ellipse(
    0,
    82,
    isXenophanes || character === 'majin-og' ? 72 : 56,
    14,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  if (character === 'majin-og') {
    ctx.translate(0, -14);
    ctx.scale(1.18, 1.18);
  }

  if (isXenophanes) {
    // Towering Xenophanes scale & glowing multi-faceted purple crystals
    ctx.scale(1.18, 1.22);
    const spikes = [
      [-68, -94, -24, -46, -46, -14],
      [-82, -48, -30, -26, -42, 6],
      [66, -88, 25, -45, 44, -14],
      [-16, -142, -5, -80, 20, -82],
    ];
    for (const [x1, y1, x2, y2, x3, y3] of spikes) {
      const cGrad = ctx.createLinearGradient(x1, y1, x2, y2);
      cGrad.addColorStop(0, '#F3E8FF');
      cGrad.addColorStop(0.45, '#A855F7');
      cGrad.addColorStop(1, '#581C87');
      ctx.fillStyle = cGrad;
      ctx.strokeStyle = '#09050E';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  const primaryFur = isFakeSonic
    ? '#1D4ED8'
    : isMajin
      ? character === 'majin-og'
        ? '#1E3A8A'
        : '#2563EB'
      : isXenophanes
        ? '#2E1065'
        : isTails
          ? '#52525B'
          : isKnuckles
            ? '#451A1A'
            : isEggman
              ? '#3F3F46'
              : '#172554';

  const highlightFur = isFakeSonic
    ? '#3B82F6'
    : isMajin
      ? '#60A5FA'
      : isXenophanes
        ? '#581C87'
        : isTails || isKnuckles || isEggman
          ? '#71717A'
          : '#2563EB';

  const muzzleColor = isMajin
    ? '#60A5FA'
    : isFakeSonic
      ? '#FDE68A'
      : isTails || isKnuckles || isEggman
        ? '#A1A1AA'
        : '#D6B485';

  // Legs & Iconic Shoes with Ruffled White Sock Cuffs
  ctx.strokeStyle = primaryFur;
  ctx.lineWidth = 13;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-18, 22);
  ctx.lineTo(-22, 66);
  ctx.moveTo(18, 22);
  ctx.lineTo(22, 66);
  ctx.stroke();

  [-22, 22].forEach((shoeX, sIdx) => {
    const dir = sIdx === 0 ? -1 : 1;
    // Ruffled White Sock Cuff
    ctx.fillStyle = isMajin ? '#BFDBFE' : '#FFFFFF';
    ctx.strokeStyle = '#09080D';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(shoeX - 14, 52, 28, 13, 4);
    ctx.fill();
    ctx.stroke();

    // Shoe Body
    ctx.fillStyle = isMajin ? '#1D4ED8' : '#DC2626';
    ctx.beginPath();
    ctx.moveTo(shoeX - 16 * dir, 63);
    ctx.quadraticCurveTo(shoeX + 14 * dir, 61, shoeX + 34 * dir, 78);
    ctx.lineTo(shoeX - 18 * dir, 78);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White Shoe Strap & Grey Sole
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(shoeX + 2 * dir - 4, 64, 9, 14);
    ctx.strokeRect(shoeX + 2 * dir - 4, 64, 9, 14);
  });

  // Torso with Cel-Shaded Gradient
  const torsoGrad = ctx.createRadialGradient(-6, -6, 6, 0, 2, 38);
  torsoGrad.addColorStop(0, highlightFur);
  torsoGrad.addColorStop(1, primaryFur);
  ctx.fillStyle = torsoGrad;
  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 2, isEggman ? 44 : 28, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly patch (with crimson X scar on Xenophanes)
  ctx.fillStyle = muzzleColor;
  ctx.beginPath();
  ctx.ellipse(4, 4, 17, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (isXenophanes) {
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(14, 14);
    ctx.moveTo(14, -6);
    ctx.lineTo(-6, 14);
    ctx.stroke();
  }

  // Head & Quills
  ctx.save();
  ctx.translate(0, -48);

  // Back Quills sweeping left with cel-shaded gradient
  const headGrad = ctx.createRadialGradient(8, -12, 8, -10, 0, 72);
  headGrad.addColorStop(0, highlightFur);
  headGrad.addColorStop(1, primaryFur);
  ctx.fillStyle = headGrad;
  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(12, -36);
  ctx.quadraticCurveTo(-38, -48, -80, -24);
  ctx.quadraticCurveTo(-48, -12, -34, -4);
  ctx.quadraticCurveTo(-72, 2, -84, 14);
  ctx.quadraticCurveTo(-50, 16, -28, 18);
  ctx.quadraticCurveTo(-56, 28, -66, 38);
  ctx.quadraticCurveTo(-32, 36, 0, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main Head Sphere
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fillStyle = headGrad;
  ctx.fill();
  ctx.stroke();

  // Ears with inner ear triangles
  ctx.beginPath();
  ctx.moveTo(-20, -28);
  ctx.lineTo(-30, -56);
  ctx.lineTo(-4, -34);
  ctx.moveTo(12, -30);
  ctx.lineTo(24, -56);
  ctx.lineTo(28, -24);
  ctx.fillStyle = primaryFur;
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = muzzleColor;
  ctx.beginPath();
  ctx.moveTo(-19, -31);
  ctx.lineTo(-26, -48);
  ctx.lineTo(-9, -35);
  ctx.closePath();
  ctx.fill();

  // Muzzle
  ctx.beginPath();
  ctx.ellipse(8, 12, 29, 17, 0, 0, Math.PI * 2);
  ctx.fillStyle = muzzleColor;
  ctx.fill();
  ctx.stroke();

  // Nose with white specular shine
  ctx.fillStyle = '#09080D';
  ctx.beginPath();
  ctx.ellipse(33, 6, 6, 3.8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(33, 5, 2.2, 1.2, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eyes: Majin has human-shaded blue eyes; Fake Sonic (sonicexefake) has shadowed disguised eyes; Xenophanes/Pixel have glowing eyes!
  if (isMajin) {
    ctx.fillStyle = '#DBEAFE';
    ctx.beginPath();
    ctx.ellipse(-2, -6, 9, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(16, -6, 9, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#09080D';
    ctx.beginPath();
    ctx.arc(0, -5, 4, 0, Math.PI * 2);
    ctx.arc(18, -5, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (isFakeSonic) {
    // Disguised Fake Sonic (Too Slow Encore 0..43.2s): white sclera with shadowed brow & dark pupils
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.ellipse(-2, -5, 9.5, 13.5, 0, 0, Math.PI * 2);
    ctx.ellipse(16, -5, 9.5, 13.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Shadow cast over upper eyes
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(-14, -20, 42, 11);
    ctx.fillStyle = '#09080D';
    ctx.beginPath();
    ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
    ctx.arc(18, -2, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Black eye sockets
    ctx.fillStyle = '#050507';
    ctx.beginPath();
    ctx.ellipse(-2, -6, 10, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(17, -6, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bleeding dark crimson streaks under eyes
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(-6, 8, 6, 16);
    ctx.fillRect(14, 8, 6, 16);

    // Glowing Red Pupils
    const pupilRadius = pose === 'gotcha' ? 6.2 : 4.2;
    ctx.fillStyle = isPixel ? '#FACC15' : '#EF4444';
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = pose === 'gotcha' ? 20 : 12;
    ctx.beginPath();
    ctx.arc(1, -5, pupilRadius, 0, Math.PI * 2);
    ctx.arc(19, -5, pupilRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Sinister Grin / Singing Mouth depending on Pose
  ctx.fillStyle = '#09080D';
  ctx.beginPath();
  if (pose === 'idle') {
    ctx.arc(10, 12, 16, 0.1, Math.PI - 0.1);
  } else if (
    pose === 'up' ||
    pose === 'right' ||
    pose === 'laugh' ||
    pose === 'gotcha'
  ) {
    ctx.ellipse(
      12,
      15,
      pose === 'gotcha' ? 19 : 16,
      pose === 'gotcha' ? 14 : 12,
      0,
      0,
      Math.PI * 2
    );
  } else {
    ctx.ellipse(10, 14, 13, 8, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // Sharp Fangs (hidden while disguised as Fake Sonic)
  if (!isFakeSonic) {
    ctx.fillStyle = isMajin ? '#EFF6FF' : '#FEF08A';
    for (let tx = -2; tx <= 20; tx += 6) {
      ctx.beginPath();
      ctx.moveTo(tx, 10);
      ctx.lineTo(tx + 3, 16);
      ctx.lineTo(tx + 6, 10);
      ctx.fill();
    }
  }

  ctx.restore(); // End Head

  // Expressive Arms & Cuffed Clawed/Pointing Gloves
  ctx.strokeStyle = isMajin ? primaryFur : muzzleColor;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(16, -6);
  const handX =
    pose === 'gotcha'
      ? 82
      : pose === 'right'
        ? 68
        : pose === 'left'
          ? -45
          : 48;
  const handY =
    pose === 'gotcha'
      ? -18
      : pose === 'up'
        ? -68
        : pose === 'down' || pose === 'laugh'
          ? 32
          : -8;
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // Glove with wrist cuff & fingers
  ctx.fillStyle = isMajin ? '#93C5FD' : '#F8FAFC';
  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(handX, handY, pose === 'gotcha' ? 19 : 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (!isMajin && !isFakeSonic) {
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(handX + 8, handY - 4, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw PolishedP1 ("Hill of the Void" from polishedstage.json) stage props:
// Warning (Tails head on pike), DeadTailz, DeadKnux, DeadEgg, and foreground TreesFG (scroll 1.1)
export function drawPolishedHillProps(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  layer: 'back' | 'front',
  cameraOffsetX = 0
) {
  ctx.save();
  if (layer === 'back') {
    const groundY = h * 0.68;
    // "Warning" (Tails Pike at left-center of stage, zIndex 26)
    const pikeX = w * 0.14 - cameraOffsetX * 0.85;
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(pikeX, groundY + 45);
    ctx.lineTo(pikeX, groundY - 75);
    ctx.stroke();

    // Torn Tails head silhouette on the pike (PolishedP1/Warning)
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = '#09080D';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(pikeX, groundY - 82, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Ears
    ctx.beginPath();
    ctx.moveTo(pikeX - 14, groundY - 98);
    ctx.lineTo(pikeX - 22, groundY - 122);
    ctx.lineTo(pikeX - 4, groundY - 102);
    ctx.moveTo(pikeX + 8, groundY - 98);
    ctx.lineTo(pikeX + 18, groundY - 122);
    ctx.lineTo(pikeX + 18, groundY - 94);
    ctx.fill();
    ctx.stroke();
    // Hollow dark eye socket
    ctx.fillStyle = '#09080D';
    ctx.beginPath();
    ctx.arc(pikeX + 6, groundY - 82, 5, 0, Math.PI * 2);
    ctx.fill();

    // DeadKnux & DeadEgg silhouettes in background grass (zIndex 24-25)
    ctx.fillStyle = 'rgba(69, 10, 10, 0.75)';
    ctx.beginPath();
    ctx.ellipse(w * 0.36 - cameraOffsetX * 0.75, groundY + 18, 34, 13, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(39, 39, 42, 0.75)';
    ctx.beginPath();
    ctx.ellipse(w * 0.64 - cameraOffsetX * 0.75, groundY + 22, 38, 15, 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Foreground TreesFG (zIndex 1000, scroll [1.1, 1.1]) framing left & right edges
    const leftTreeX = -20 - cameraOffsetX * 1.1;
    const rightTreeX = w + 20 - cameraOffsetX * 1.1;
    ctx.fillStyle = 'rgba(9, 8, 13, 0.88)';
    ctx.fillRect(leftTreeX, 0, 68, h);
    ctx.fillRect(rightTreeX - 68, 0, 68, h);
  }
  ctx.restore();
}

// Universal Boyfriend Sprite matching bf sprites.jpg across all songs,
// including the purple bruised/shocked miss animation ("when he's purple, that's the missing animation")!
export function drawPlayerSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  character: PlayerCharacterId,
  pose: CharacterPose,
  timeMs: number,
  bpm: number,
  _stageTheme: StageThemeId,
  poseStartedMs = 0
) {
  const beatPeriod = 60000 / bpm;
  const elapsedPoseMs = Math.max(0, timeMs - poseStartedMs);
  const beatPhase = (((timeMs % beatPeriod) + beatPeriod) % beatPeriod) / beatPeriod;

  // Use ENCORE_BF (encore_bf) for all Encore songs!
  if (character === 'bf-encore') {
    const encoreSheet = getEncoreBfSheet();
    if (encoreSheet) {
      ctx.save();
      ctx.translate(x, y);

      // Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 78, 60, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' | 'miss' =
        pose === 'left' ||
        pose === 'down' ||
        pose === 'up' ||
        pose === 'right' ||
        pose === 'miss'
          ? pose
          : 'idle';
      const anim = ENCORE_BF_ANIMS[animKey];
      const frameIdx =
        animKey === 'idle'
          ? Math.floor(beatPhase * anim.frames.length) % anim.frames.length
          : Math.min(
              anim.frames.length - 1,
              Math.floor(elapsedPoseMs / 42)
            );
      const frame = anim.frames[frameIdx];

      const moveInT = animKey === 'idle' ? 1 : Math.min(1, elapsedPoseMs / 85);
      const unreached = 1 - (1 - Math.pow(1 - moveInT, 3));
      const headBounce =
        animKey === 'idle'
          ? Math.sin(beatPhase * Math.PI) * 5.5
          : Math.sin(elapsedPoseMs * 0.052) * Math.exp(-elapsedPoseMs * 0.0045) * 8;

      const slideX =
        animKey === 'left'
          ? 24 * unreached
          : animKey === 'right'
            ? -24 * unreached
            : 0;
      const slideY =
        animKey === 'up'
          ? 20 * unreached
          : animKey === 'down'
            ? -18 * unreached
            : 0;

      const scale = 0.38;
      const drawW = frame.w * scale;
      const drawH = frame.h * scale;
      const drawX = -78 - (anim.offset[0] + 5) * scale + slideX;
      const drawY =
        78 - 496 * scale - anim.offset[1] * scale + slideY + headBounce * 0.45;

      ctx.drawImage(
        encoreSheet,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        drawX,
        drawY,
        drawW,
        drawH
      );
      ctx.restore();
      return;
    }
  }

  ctx.save();
  const idleBop =
    pose === 'idle'
      ? Math.abs(Math.sin((timeMs / beatPeriod) * Math.PI)) * 7.5
      : Math.sin(elapsedPoseMs * 0.052) * Math.exp(-elapsedPoseMs * 0.0045) * 7;

  const isMiss = pose === 'miss';
  const moveInT = pose === 'idle' ? 1 : Math.min(1, elapsedPoseMs / 85);
  const easeMove = 1 - Math.pow(1 - moveInT, 3);

  let dx = 0;
  let dy = idleBop;
  let sx = 1.1;
  let sy = 1.1;

  if (pose === 'left') {
    dx = -18 * easeMove;
    sx = 1.14;
  } else if (pose === 'right') {
    dx = 18 * easeMove;
    sx = 1.14;
  } else if (pose === 'up') {
    dy = -18 * easeMove + idleBop * 0.5;
    sx = 1.05;
    sy = 1.18;
  } else if (pose === 'down') {
    dy = 15 * easeMove + idleBop * 0.5;
    sx = 1.18;
    sy = 1.0;
  } else if (isMiss) {
    // Recoil shake on purple miss animation
    dx = Math.sin(timeMs * 0.09) * 5;
    dy = -4;
  }

  ctx.translate(x + dx, y + dy);
  ctx.scale(sx, sy);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Palette switches to bruised purple when pose === 'miss' (matching bf sprites.jpg!)
  const capFrontColor = isMiss ? '#6D2158' : '#EE1C25';
  const capBrimColor = isMiss ? '#42164B' : '#9E0B0F';
  const hairMainColor = isMiss ? '#4361EE' : '#00ADEF';
  const hairShadeColor = isMiss ? '#2B3A9E' : '#0072BC';
  const skinColor = isMiss ? '#8E74C2' : '#FAD5B8';
  const shirtColor = isMiss ? '#7E68C9' : '#FFFFFF';
  const shirtShadeColor = isMiss ? '#5A46A8' : '#C7D6E8';
  const prohibColor = isMiss ? '#6D2158' : '#EE1C25';
  const pantsColor = isMiss ? '#242068' : '#1B3F94';
  const shoeRedColor = isMiss ? '#5E1D4E' : '#EE1C25';
  const shoeWhiteColor = isMiss ? '#8E74C2' : '#FFFFFF';

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 78, 52, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- BAGGY BLUE PANTS & CLASSIC RED/WHITE SNEAKERS ---
  ctx.fillStyle = pantsColor;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-28, 24, 24, 34, 6);
  ctx.roundRect(4, 24, 24, 34, 6);
  ctx.fill();
  ctx.stroke();

  // Left & Right Chunky FNF Sneakers
  const drawBfSneaker = (sxPos: number, dir: number) => {
    ctx.save();
    ctx.translate(sxPos, 64);

    // White rubber sole & toe cap
    ctx.fillStyle = shoeWhiteColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(dir * 4, 4, 24, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red sneaker upper
    ctx.fillStyle = shoeRedColor;
    ctx.beginPath();
    ctx.arc(0, -2, 16, Math.PI, 0);
    ctx.lineTo(16, 4);
    ctx.lineTo(-16, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White tongue / laces detail
    ctx.fillStyle = shoeWhiteColor;
    ctx.beginPath();
    ctx.arc(dir * 4, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  drawBfSneaker(-20, -1);
  drawBfSneaker(20, 1);

  // --- OVERSIZED WHITE TEE WITH RED PROHIBITION SIGN ---
  ctx.fillStyle = shirtColor;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, -12);
  ctx.quadraticCurveTo(0, -18, 30, -12);
  ctx.lineTo(36, 32);
  ctx.quadraticCurveTo(0, 38, -34, 32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shirt bottom fold shadow
  ctx.fillStyle = shirtShadeColor;
  ctx.beginPath();
  ctx.moveTo(-30, 22);
  ctx.quadraticCurveTo(0, 28, 32, 22);
  ctx.lineTo(34, 31);
  ctx.quadraticCurveTo(0, 36, -32, 31);
  ctx.closePath();
  ctx.fill();

  // Red Prohibition Sign (Circle + Slash) on chest
  ctx.strokeStyle = prohibColor;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(-2, 12, 13, 0, Math.PI * 2);
  ctx.moveTo(-11, 3);
  ctx.lineTo(7, 21);
  ctx.stroke();

  // Left hand on hip / pocket (viewer's right)
  ctx.fillStyle = skinColor;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(32, 24, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // --- HEAD, RED BACKWARDS CAP & CYAN SPIKY HAIR ---
  ctx.save();
  const headOffsetY = pose === 'down' ? -30 : pose === 'up' ? -44 : -36;
  ctx.translate(0, headOffsetY);

  // Darker red backwards cap brim sticking out to the right
  ctx.fillStyle = capBrimColor;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(16, -12);
  ctx.quadraticCurveTo(46, -10, 48, -2);
  ctx.quadraticCurveTo(46, 4, 18, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Back right cyan hair spike under cap brim
  ctx.fillStyle = hairShadeColor;
  ctx.beginPath();
  ctx.moveTo(22, -2);
  ctx.lineTo(44, 10);
  ctx.lineTo(20, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Peach (or purple on miss) Face / Jaw
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(-2, 4, 29, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Round ear on right side of head
  ctx.beginPath();
  ctx.arc(27, 6, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red Backwards Baseball Cap Dome (matching bf sprites.jpg!)
  ctx.fillStyle = capFrontColor;
  ctx.beginPath();
  ctx.moveTo(-26, -12);
  ctx.quadraticCurveTo(-24, -44, 6, -44);
  ctx.quadraticCurveTo(32, -42, 32, -8);
  ctx.quadraticCurveTo(6, -6, -26, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cap panel seam line & darker back half
  ctx.fillStyle = capBrimColor;
  ctx.beginPath();
  ctx.moveTo(6, -44);
  ctx.quadraticCurveTo(32, -42, 32, -8);
  ctx.lineTo(10, -8);
  ctx.quadraticCurveTo(14, -28, 6, -44);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cyan Spiky Hair Bangs sweeping left & front cap cutout tuft (matching bf sprites.jpg!)
  ctx.fillStyle = hairMainColor;
  ctx.beginPath();
  // Left lower spike
  ctx.moveTo(-24, 4);
  ctx.lineTo(-44, 6);
  ctx.lineTo(-30, -6);
  // Left middle spike
  ctx.lineTo(-48, -12);
  ctx.lineTo(-28, -18);
  // Top left spike
  ctx.lineTo(-36, -34);
  ctx.lineTo(-14, -24);
  // Center spiky bangs through cap opening
  ctx.lineTo(-10, -38);
  ctx.lineTo(0, -22);
  ctx.lineTo(10, -32);
  ctx.lineTo(14, -10);
  // Bottom hairline across forehead
  ctx.lineTo(4, -4);
  ctx.lineTo(-4, -12);
  ctx.lineTo(-14, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- VERTICAL BLACK SHOCK LINES ABOVE HEAD ON PURPLE MISS ANIMATION ---
  if (isMiss) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    for (let lx = -14; lx <= 26; lx += 5) {
      ctx.beginPath();
      ctx.moveTo(lx, -58 - (lx % 2) * 4);
      ctx.lineTo(lx, -38);
      ctx.stroke();
    }
  }

  // --- EYES, EYEBROWS & POSE-SPECIFIC MOUTH ---
  const eyeLookX =
    pose === 'left' ? -4 : pose === 'right' ? 4 : 0;

  if (isMiss) {
    // Shocked wide eyes with tiny pupils on purple miss animation
    ctx.fillStyle = '#93C5FD';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(-13, 3, 6, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(4, 3, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-13, 3, 2, 0, Math.PI * 2);
    ctx.arc(4, 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Shocked purple/dark grimace mouth
    ctx.fillStyle = '#1E1035';
    ctx.beginPath();
    ctx.ellipse(-4, 17, 11, 7, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Confident thick black eyebrows
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-20, -2);
    ctx.lineTo(-8, 1);
    ctx.moveTo(0, 1);
    ctx.lineTo(12, -2);
    ctx.stroke();

    // White sclera & bold vertical oval pupils
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-13, 5, 5.5, 6.5, 0, 0, Math.PI * 2);
    ctx.ellipse(5, 5, 5.5, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(-13 + eyeLookX * 0.5, 5, 3.2, 5.5, 0, 0, Math.PI * 2);
    ctx.ellipse(5 + eyeLookX * 0.5, 5, 3.2, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth based on singing pose (matching bf sprites.jpg!)
    if (pose === 'idle') {
      // Iconic BF confident V-smirk
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-12, 15);
      ctx.lineTo(-3, 19);
      ctx.lineTo(5, 13);
      ctx.stroke();
    } else {
      // Singing open mouth with white teeth & pink tongue
      ctx.fillStyle = '#450A0A';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const mouthW = pose === 'up' || pose === 'right' ? 11 : 9;
      const mouthH = pose === 'up' ? 9 : 7;
      ctx.ellipse(-3 + eyeLookX * 0.4, 17, mouthW, mouthH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // White upper teeth strip
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-9 + eyeLookX * 0.4, 12, 12, 3.5);

      // Pink tongue
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.arc(-3 + eyeLookX * 0.4, 20, 5, Math.PI, 0);
      ctx.fill();
    }
  }

  ctx.restore(); // End Head

  // --- RIGHT HAND & DARK CHARCOAL GRID MICROPHONE (Held on Left Side) ---
  const micX =
    pose === 'left' ? -48 : pose === 'right' ? -32 : -40;
  const micY =
    pose === 'up' ? -18 : pose === 'down' ? 18 : 8;

  ctx.save();
  ctx.translate(micX, micY);
  ctx.rotate(pose === 'left' ? -0.4 : -0.2);

  // Black mic handle
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-5, 0, 10, 24, 4);
  ctx.fill();
  ctx.stroke();

  // BF's fingers gripping handle (skinColor — turns purple on miss!)
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(4, 10, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Dark charcoal grid microphone sphere
  ctx.fillStyle = isMiss ? '#3B2D64' : '#334155';
  ctx.beginPath();
  ctx.arc(-2, -10, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Grid crosshatch on mic head
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-13, -10);
  ctx.lineTo(9, -10);
  ctx.moveTo(-10, -16);
  ctx.lineTo(6, -16);
  ctx.moveTo(-10, -4);
  ctx.lineTo(6, -4);
  ctx.moveTo(-2, -23);
  ctx.lineTo(-2, 3);
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

// Draw FNF Health Bar Icon for Opponent & Boyfriend
// - sonicexefake -> icon-sonicfake.png (Too Slow Encore while Fake Sonic is active)
// - sonic-exe -> icon-sonic-exe.png (Too Slow & Too Slow Encore after Fake Sonic)
// - majin -> icon-majin.png (Endless)
// - majin-og -> icon-majin-og.png (Endless OG)
export function drawHealthIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isPlayer: boolean,
  character: OpponentCharacterId | PlayerCharacterId,
  isLosing: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (isPlayer) {
    // Universal Boyfriend Health Icon matching uploaded image.png (Normal & Losing states)
    // Horizontally flipped (-1.25, 1.25) so Boyfriend's icon on the right side of the bar faces LEFT!
    ctx.scale(-1.25, 1.25);
    const bfCyan = '#2CB3DB';
    ctx.fillStyle = bfCyan;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4.2;

    if (isLosing) {
      // Right half of image.png: Losing state!
      // Cap brim sticking out to the left, tall rounded-rect cap crown with panel seams,
      // two small hair spikes on left, X X eyes, and white grimacing arch mouth!
      ctx.beginPath();
      // Left-pointing cap brim
      ctx.moveTo(-16, 0);
      ctx.quadraticCurveTo(-38, 2, -40, 7);
      ctx.quadraticCurveTo(-36, 11, -18, 6);
      // Two small hair spikes under left cap edge
      ctx.lineTo(-20, 22);
      ctx.lineTo(-10, 10);
      ctx.lineTo(-8, 16);
      // Lower cheek & rounded chin
      ctx.lineTo(-12, 22);
      ctx.quadraticCurveTo(-14, 28, 18, 27);
      // Right spiky bangs
      ctx.lineTo(26, 32);
      ctx.quadraticCurveTo(22, 16, 16, 8);
      ctx.lineTo(36, 12);
      ctx.quadraticCurveTo(30, -6, 18, -12);
      // Tall cap crown on top
      ctx.lineTo(18, -24);
      ctx.quadraticCurveTo(0, -28, -18, -22);
      ctx.quadraticCurveTo(-22, -12, -16, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cap vertical seam lines & sweat/hair sweep line
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-8, -24);
      ctx.lineTo(-8, 0);
      ctx.moveTo(-16, 0);
      ctx.lineTo(14, 0);
      ctx.moveTo(4, 0);
      ctx.lineTo(18, -14);
      ctx.stroke();

      // Thick black X X eyes
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Left X eye
      ctx.moveTo(-6, -2);
      ctx.lineTo(4, 10);
      ctx.moveTo(4, -2);
      ctx.lineTo(-6, 10);
      // Right X eye
      ctx.moveTo(8, 2);
      ctx.lineTo(18, 14);
      ctx.moveTo(18, 2);
      ctx.lineTo(8, 14);
      ctx.stroke();

      // White grimacing/frowning arch mouth at bottom
      ctx.fillStyle = '#FFFFFF';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-8, 21);
      ctx.quadraticCurveTo(2, 11, 14, 23);
      ctx.quadraticCurveTo(2, 21, -8, 21);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Left half of image.png: Normal state!
      // Boxy flat-topped cap on top-left, two large sweeping cyan hair spikes on right,
      // angry V-shaped brow overlapping cap line, and two vertical pill eyes!
      ctx.beginPath();
      // Boxy cap top-left & top-right corners
      ctx.moveTo(-26, -20);
      ctx.quadraticCurveTo(-8, -23, 6, -20);
      ctx.lineTo(8, -8);
      // Upper-right sweeping hair spike
      ctx.quadraticCurveTo(28, -12, 36, 4);
      ctx.lineTo(16, 2);
      // Lower-right long sweeping hair spike
      ctx.quadraticCurveTo(26, 14, 26, 29);
      ctx.quadraticCurveTo(14, 16, 6, 4);
      // Right jawline & small chin bump
      ctx.lineTo(6, 14);
      ctx.quadraticCurveTo(12, 19, 8, 23);
      ctx.quadraticCurveTo(-8, 26, -24, 22);
      // Left face edge up to cap
      ctx.lineTo(-26, -20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sweeping hair spike inner contour line (from center brow up to right spike)
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-6, 4);
      ctx.quadraticCurveTo(4, -10, 16, -14);
      ctx.stroke();

      // Horizontal cap seam line & angry V-shaped brow
      ctx.beginPath();
      ctx.moveTo(-25, -1);
      ctx.lineTo(4, -1);
      // Angry V-brow dipping below cap line
      ctx.moveTo(-22, -6);
      ctx.lineTo(-10, 5);
      ctx.lineTo(0, -5);
      ctx.stroke();

      // Two vertical black pill eyes below V-brow
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(-18, 6, 4.8, 11, 2.4);
      ctx.roundRect(-6, 6, 4.8, 11, 2.4);
      ctx.fill();
    }
  } else if (character === 'sonicexefake') {
    // 1. icon-sonicfake.png (ONLY during Too Slow Encore while Fake Sonic is there!)
    ctx.scale(1.25, 1.25);
    ctx.fillStyle = '#0055E5';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.8;

    // Spiky blue Sonic head silhouette facing right
    ctx.beginPath();
    // Front right ear
    ctx.moveTo(10, -18);
    ctx.lineTo(24, -26);
    ctx.lineTo(22, -8);
    // Right cheek & rounded chin
    ctx.quadraticCurveTo(26, 6, 18, 16);
    ctx.quadraticCurveTo(4, 24, -14, 18);
    // Bottom quill
    ctx.lineTo(-26, 23);
    ctx.lineTo(-22, 10);
    // Middle curved quill
    ctx.quadraticCurveTo(-35, 8, -38, 12);
    ctx.quadraticCurveTo(-32, -4, -18, -10);
    // Top quill
    ctx.lineTo(-28, -14);
    ctx.quadraticCurveTo(-20, -22, -10, -20);
    // Left top ear
    ctx.lineTo(-10, -34);
    ctx.lineTo(4, -22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Large white Sonic eyes with angry center brow notch
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-10, -4);
    ctx.quadraticCurveTo(-12, -14, 4, -8);
    ctx.lineTo(10, -4);
    ctx.lineTo(14, -14);
    ctx.quadraticCurveTo(22, -14, 21, 2);
    ctx.quadraticCurveTo(10, 6, -8, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Black vertical oval pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(4, -2, 2.2, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(16, -2, 2.0, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black nose at right tip with white shine oval
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(22, 4, 5.5, 3.2, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(22, 3, 2.5, 1.2, -0.3, 0, Math.PI * 2);
    ctx.fill();

    if (isLosing) {
      // Right half of icon-sonicfake.png: creepy stitched/jagged grin across cheek!
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-14, 4);
      ctx.quadraticCurveTo(0, 18, 18, 12);
      ctx.stroke();
      // Vertical stitch ticks along the grin
      for (let sx = -10; sx <= 10; sx += 5) {
        ctx.beginPath();
        ctx.moveTo(sx, 7);
        ctx.lineTo(sx - 1, 14);
        ctx.stroke();
      }
    } else {
      // Left half of icon-sonicfake.png: subtle cheek curve & small white smirk corner
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-16, 8);
      ctx.quadraticCurveTo(-10, 10, -8, 14);
      ctx.stroke();
      // Small white tooth triangle near nose
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(12, 8);
      ctx.lineTo(20, 8);
      ctx.lineTo(17, 13);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (character === 'majin') {
    // 2. icon-majin.png (for Endless)
    ctx.scale(1.25, 1.25);
    const majinBlue = '#001AE6';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.8;

    // Back lower & middle quills (solid black shadow fill as in icon-majin.png)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(-10, -14);
    ctx.lineTo(-30, -12);
    ctx.lineTo(-16, 0);
    ctx.lineTo(-36, 6);
    ctx.lineTo(-8, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top blue quill & upper head crown
    ctx.fillStyle = majinBlue;
    ctx.beginPath();
    ctx.moveTo(-12, -14);
    ctx.lineTo(-24, -28);
    ctx.lineTo(4, -26);
    ctx.lineTo(20, -12);
    ctx.lineTo(20, 4);
    ctx.lineTo(-10, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Majin face mask & elongated grinning chin
    const chinBottom = isLosing ? 32 : 26;
    ctx.fillStyle = majinBlue;
    ctx.beginPath();
    // M-shaped brow arch
    ctx.moveTo(-10, 4);
    ctx.quadraticCurveTo(-6, -14, 4, -4);
    ctx.quadraticCurveTo(12, -14, 18, 2);
    // Cheekbones & tall rectangular jaw
    ctx.lineTo(26, 6);
    ctx.lineTo(18, 12);
    ctx.lineTo(18, chinBottom);
    ctx.lineTo(-2, chinBottom + 2);
    ctx.lineTo(-10, 12);
    ctx.lineTo(-16, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (isLosing) {
      // Right half of icon-majin.png: completely blacked-out upper eye sockets & wide black gaping mouth!
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(-8, 4);
      ctx.quadraticCurveTo(-4, -14, 5, -3);
      ctx.quadraticCurveTo(12, -14, 18, 4);
      ctx.closePath();
      ctx.fill();

      // Wide black open mouth cavity between top and bottom blue teeth
      ctx.fillRect(-4, 14, 20, 10);
    } else {
      // Left half of icon-majin.png: angled black shadowed eyes & horizontal teeth divider line
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(-6, 3);
      ctx.lineTo(2, -4);
      ctx.lineTo(2, 4);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(16, 3);
      ctx.lineTo(8, -4);
      ctx.lineTo(8, 4);
      ctx.closePath();
      ctx.fill();

      // Horizontal grin teeth divider
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-6, 10);
      ctx.lineTo(18, 10);
      ctx.moveTo(-4, 18);
      ctx.lineTo(16, 18);
      ctx.stroke();
    }

    // Nose bar
    ctx.fillStyle = '#000000';
    ctx.fillRect(2, 4, 7, 3);
  } else if (character === 'majin-og') {
    // 3. icon-majin-og.png (for Endless OG)
    ctx.scale(1.25, 1.25);
    const ogBlue = '#001AE6';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.8;

    // Swept-back black-shaded lower quills
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(-10, -14);
    ctx.lineTo(-34, -14);
    ctx.lineTo(-20, -2);
    ctx.lineTo(-36, 4);
    ctx.lineTo(-10, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Swept-back blue top quill & head dome
    ctx.fillStyle = ogBlue;
    ctx.beginPath();
    ctx.moveTo(-12, -10);
    ctx.lineTo(-30, -26);
    ctx.quadraticCurveTo(2, -28, 18, -16);
    ctx.lineTo(14, 8);
    ctx.lineTo(-12, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rounded theater-mask Majin OG face with widow's peak V-notch at top
    ctx.fillStyle = ogBlue;
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(2, -16);
    ctx.lineTo(7, -9);
    ctx.lineTo(12, -16);
    ctx.quadraticCurveTo(24, -8, 22, 8);
    ctx.quadraticCurveTo(22, 26, 8, 30);
    ctx.quadraticCurveTo(-8, 28, -12, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crescent eyes & triangular nose shadow
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-2, -1, 5.5, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(14, -1, 5, Math.PI, 0);
    ctx.fill();

    // Triangular nose shadow
    ctx.beginPath();
    ctx.moveTo(8, -2);
    ctx.lineTo(14, 7);
    ctx.lineTo(3, 7);
    ctx.closePath();
    ctx.fill();

    if (isLosing) {
      // Right half of icon-majin-og.png: wide-open cackling black mouth with blue tongue curl!
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(-6, 6);
      ctx.quadraticCurveTo(8, 14, 18, 6);
      ctx.quadraticCurveTo(16, 26, 6, 26);
      ctx.quadraticCurveTo(-4, 24, -6, 6);
      ctx.closePath();
      ctx.fill();

      // Blue tongue curl inside open mouth
      ctx.fillStyle = ogBlue;
      ctx.beginPath();
      ctx.arc(6, 20, 5, 0, Math.PI);
      ctx.fill();
    } else {
      // Left half of icon-majin-og.png: wide curved cheek-to-cheek smile with teeth divider
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-6, 8);
      ctx.quadraticCurveTo(6, 14, 18, 8);
      ctx.quadraticCurveTo(14, 25, 6, 25);
      ctx.quadraticCurveTo(-2, 24, -6, 8);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-4, 16);
      ctx.quadraticCurveTo(6, 19, 15, 16);
      ctx.stroke();
    }
  } else if (character === 'ycr-exe' || character === 'pixel-exe') {
    // Universal You Can't Run Health Bar Icon (applied to both You Can't Run & You Can't Run Encore across all phases)
    ctx.scale(1.25, 1.25);
    const ycrBlue = '#1344A8';
    ctx.fillStyle = ycrBlue;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.8;

    if (isLosing) {
      // Right half (Losing state): Jagged frayed quills, wide pitch-black eye sockets with crimson pinpoints, unhinged screaming fanged jaw!
      ctx.beginPath();
      // Right ear
      ctx.moveTo(6, -20);
      ctx.lineTo(19, -34);
      ctx.lineTo(21, -13);
      // Cheek & long unhinged screaming jaw
      ctx.lineTo(26, -2);
      ctx.lineTo(15, 27);
      ctx.quadraticCurveTo(7, 31, -10, 17);
      // Jagged frayed left quills
      ctx.lineTo(-20, 29);
      ctx.lineTo(-22, 11);
      ctx.lineTo(-37, 17);
      ctx.lineTo(-29, 4);
      ctx.lineTo(-35, -1);
      ctx.quadraticCurveTo(-31, -6, -20, -9);
      ctx.lineTo(-32, -12);
      ctx.lineTo(-18, -19);
      // Left ear with notch
      ctx.lineTo(-22, -28);
      ctx.lineTo(-14, -24);
      ctx.lineTo(-11, -27);
      ctx.lineTo(-5, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Huge pitch-black eye sockets
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(2, -8, 10, 14, -0.15, 0, Math.PI * 2);
      ctx.ellipse(15, -10, 9, 13, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Tiny crimson/white crazed pinpoint pupils
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(3, -7, 1.8, 0, Math.PI * 2);
      ctx.arc(15, -9, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Nose with highlight
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(25, -8, 5.5, 3.5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(25, -9, 2, 1.2, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Massive wide-open pitch-black screaming jaw with sharp fangs
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(-14, -2);
      ctx.quadraticCurveTo(6, 8, 22, -2);
      ctx.lineTo(13, 24);
      ctx.closePath();
      ctx.fill();

      // Sharp upper fangs inside screaming jaw
      ctx.fillStyle = '#F8FAFC';
      for (let fx = -6; fx <= 12; fx += 6) {
        ctx.beginPath();
        ctx.moveTo(fx, 1);
        ctx.lineTo(fx + 2.5, 7);
        ctx.lineTo(fx + 5, 1);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Left half (Normal state): Spiky royal-blue Sonic.exe P2 head, black sockets with red/white pinpoints, wide fanged grin!
      ctx.beginPath();
      // Right ear
      ctx.moveTo(10, -18);
      ctx.lineTo(24, -26);
      ctx.lineTo(21, -6);
      // Cheek & jaw
      ctx.quadraticCurveTo(25, 8, 12, 19);
      ctx.quadraticCurveTo(-4, 21, -14, 16);
      // Bottom quill
      ctx.lineTo(-25, 26);
      ctx.lineTo(-24, 10);
      // Middle frayed quill
      ctx.lineTo(-37, 13);
      ctx.quadraticCurveTo(-30, -4, -18, -10);
      // Top quill
      ctx.lineTo(-29, -13);
      ctx.quadraticCurveTo(-20, -20, -12, -18);
      // Left top ear
      ctx.lineTo(-14, -32);
      ctx.lineTo(2, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Large pitch-black eye sockets
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(0, -3, 9.5, 12, -0.25, 0, Math.PI * 2);
      ctx.ellipse(15, -2, 6.5, 10, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Glowing red/white pinpoint pupils
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(3, 1, 2.1, 0, Math.PI * 2);
      ctx.arc(15, 1, 1.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(3, 1, 0.9, 0, Math.PI * 2);
      ctx.arc(15, 1, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Nose with white highlight at right tip
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(24, 4, 6, 3.6, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(24, 4, 2.5, 1.3, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Wide sinister grin across lower jaw
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(-16, 4);
      ctx.quadraticCurveTo(0, 16, 18, 8);
      ctx.quadraticCurveTo(4, 21, -16, 4);
      ctx.fill();
      ctx.lineWidth = 3.8;
      ctx.stroke();
    }
  } else if (
    character === 'tails-soul' ||
    character === 'knuckles-soul' ||
    character === 'eggman-soul' ||
    character === 'xenophanes'
  ) {
    // Triple Trouble Health Icons from tails.json ("tails"), knux.json ("knux"), eggy.json ("eggman"), and Xenophanes
    const iconPath =
      character === 'tails-soul'
        ? '/sprites/icon-tails.png'
        : character === 'knuckles-soul'
          ? '/sprites/icon-knux.png'
          : character === 'eggman-soul'
            ? '/sprites/icon-eggman.png'
            : '/sprites/icon-xenophanes.png';
    const iconSheet = getSpriteSheet(iconPath);
    if (iconSheet) {
      const halfW = Math.floor(iconSheet.naturalWidth / 2);
      const fullH = iconSheet.naturalHeight;
      const sx = isLosing ? halfW : 0;
      const drawSize = 82;
      ctx.drawImage(
        iconSheet,
        sx,
        0,
        halfW,
        fullH,
        -drawSize * 0.5,
        -drawSize * 0.5,
        drawSize,
        drawSize
      );
      ctx.restore();
      return;
    }
  } else {
    // 4. icon-sonic-exe.png (for the entirety of Too Slow, and Too Slow Encore after Fake Sonic!)
    ctx.scale(1.25, 1.25);

    const iconFill =
      character === 'xenophanes' ? '#6B21A8' : '#0960B8';

    ctx.fillStyle = iconFill;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.8;

    if (isLosing) {
      // Right half of icon-sonic-exe.png:
      // Stretched screaming jaw, huge merged pitch-black eye sockets (no pupils), massive black triangular mouth!
      ctx.beginPath();
      // Right ear
      ctx.moveTo(6, -20);
      ctx.lineTo(18, -34);
      ctx.lineTo(20, -14);
      // Cheek & long screaming V-jaw
      ctx.lineTo(25, -2);
      ctx.lineTo(14, 26);
      ctx.quadraticCurveTo(8, 30, -10, 16);
      // Left quills
      ctx.lineTo(-18, 28);
      ctx.lineTo(-22, 10);
      ctx.lineTo(-34, 16);
      ctx.quadraticCurveTo(-34, -2, -20, -8);
      ctx.lineTo(-30, -10);
      ctx.lineTo(-18, -18);
      // Left ear
      ctx.lineTo(-22, -26);
      ctx.lineTo(-6, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Huge pitch-black eye sockets (no pupils in losing state of icon-sonic-exe.png)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(2, -8, 10, 14, -0.15, 0, Math.PI * 2);
      ctx.ellipse(15, -10, 9, 13, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Nose with white highlight
      ctx.beginPath();
      ctx.ellipse(25, -8, 5.5, 3.5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(25, -9, 2, 1.2, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Massive wide-open pitch-black triangular screaming jaw!
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(-14, -2);
      ctx.quadraticCurveTo(6, 8, 22, -2);
      ctx.lineTo(12, 23);
      ctx.closePath();
      ctx.fill();
    } else {
      // Left half of icon-sonic-exe.png:
      // Spiky blue head facing right, pitch-black eye sockets with tiny white pinpoint dots, wide black grin!
      ctx.beginPath();
      // Right ear
      ctx.moveTo(10, -18);
      ctx.lineTo(24, -26);
      ctx.lineTo(21, -6);
      // Cheek & jaw
      ctx.quadraticCurveTo(25, 8, 12, 19);
      ctx.quadraticCurveTo(-4, 21, -14, 16);
      // Bottom quill
      ctx.lineTo(-24, 26);
      ctx.lineTo(-24, 10);
      // Middle quill
      ctx.lineTo(-36, 12);
      ctx.quadraticCurveTo(-30, -4, -18, -10);
      // Top quill
      ctx.lineTo(-28, -12);
      ctx.quadraticCurveTo(-20, -20, -12, -18);
      // Left top ear
      ctx.lineTo(-14, -32);
      ctx.lineTo(2, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Large pitch-black eye sockets
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(0, -3, 9.5, 12, -0.25, 0, Math.PI * 2);
      ctx.ellipse(15, -2, 6.5, 10, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Two tiny white pinpoint pupils (exact match to left half of icon-sonic-exe.png!)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(3, 1, 1.4, 0, Math.PI * 2);
      ctx.arc(15, 1, 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Nose with white highlight at right tip
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(24, 4, 6, 3.6, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(24, 4, 2.5, 1.3, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Wide thick black sinister grin across lower jaw
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(-16, 4);
      ctx.quadraticCurveTo(0, 16, 18, 8);
      ctx.quadraticCurveTo(4, 20, -16, 4);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function calculateAccuracy(stats: {
  sicks: number;
  goods: number;
  bads: number;
  shits: number;
  misses: number;
}): number {
  const totalJudged =
    stats.sicks + stats.goods + stats.bads + stats.shits + stats.misses;
  if (totalJudged <= 0) return 0;
  const weightedSum =
    stats.sicks * 1.0 +
    stats.goods * 0.75 +
    stats.bads * 0.5 +
    stats.shits * 0.25 +
    stats.misses * 0.0;
  return (weightedSum / totalJudged) * 100;
}

export function calculateGrade(accuracy: number, _misses = 0): string {
  if (accuracy >= 100 - 1e-6) return 'SS+';
  if (accuracy >= 95) return 'S+';
  if (accuracy >= 90) return 'S';
  if (accuracy >= 85) return 'A+';
  if (accuracy >= 80) return 'A';
  if (accuracy >= 75) return 'B+';
  if (accuracy >= 70) return 'B';
  if (accuracy >= 65) return 'C+';
  if (accuracy >= 60) return 'C';
  if (accuracy > 50) return 'D';
  return 'F';
}
