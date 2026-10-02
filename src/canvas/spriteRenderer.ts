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

// Preloaded authentic sprite sheets (lazy-loaded per song to minimize Chromebook GPU VRAM usage)
const spriteSheetCache: Record<string, HTMLImageElement> = {};

// Character sprite sheets are downscaled by 0.5x (<= 4096px max dimension) to cut GPU VRAM by 75% on Chromebooks
const CHAR_SHEET_SRC_SCALE = 0.5;

function drawCharSubTexture(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  srcScale = CHAR_SHEET_SRC_SCALE
) {
  ctx.drawImage(
    sheet,
    sx * srcScale,
    sy * srcScale,
    sw * srcScale,
    sh * srcScale,
    dx,
    dy,
    dw,
    dh
  );
}

function getSpriteSheet(src: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!spriteSheetCache[src]) {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    if (typeof img.decode === 'function') {
      img.decode().catch(() => {});
    }
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

export function preloadSpritesForSong(songId: string) {
  if (typeof window === 'undefined') return;
  const needed = new Set<string>([
    '/sprites/NOTE_assets.png',
    '/sprites/STATIC_assets.png',
    '/sprites/PhantomNote.png',
    '/sprites/RingNote.png',
    '/sprites/RingCounter.png',
    '/sprites/arrows-pixels.png',
    '/sprites/arrowEndsNew.png',
    '/sprites/icon-bf.png',
    '/sprites/icon-sonic-exe.png',
    '/sprites/BloodSplash.png',
    '/sprites/ui/sick.png',
    '/sprites/ui/good.png',
    '/sprites/ui/bad.png',
    '/sprites/ui/shit.png',
    '/sprites/ui/num0.png',
    '/sprites/ui/num1.png',
    '/sprites/ui/num2.png',
    '/sprites/ui/num3.png',
    '/sprites/ui/num4.png',
    '/sprites/ui/num5.png',
    '/sprites/ui/num6.png',
    '/sprites/ui/num7.png',
    '/sprites/ui/num8.png',
    '/sprites/ui/num9.png',
  ]);
  if (songId === 'too-slow' || songId === 'too-slow-encore') {
    needed.add('/sprites/hillSkyAndBack.png');
    needed.add('/sprites/hillTreesMid.png');
    needed.add('/sprites/hillGroundAndProps.png');
    needed.add('/sprites/hillTreesFG.png');
    needed.add('/sprites/sonicexe.png');
    needed.add('/sprites/SonicJumpscare.png');
  }
  if (songId === 'too-slow-encore') {
    needed.add('/sprites/Sonic_FakerForm.png');
    needed.add('/sprites/icon-sonicfake.png');
  }
  if (songId !== 'endless' && songId !== 'endless-og') {
    needed.add('/sprites/Main2GF.png');
  }
  if (songId.includes('encore')) {
    needed.add('/sprites/ENCORE_BF.png');
  } else {
    needed.add('/sprites/BOYFRIEND.png');
  }
  if (songId === 'you-cant-run' || songId === 'you-cant-run-encore') {
    needed.add('/sprites/ycrSkyAndBack.png');
    needed.add('/sprites/ycrTreesMid.png');
    needed.add('/sprites/ycrGroundAndFront.png');
    needed.add('/sprites/GreenHill.png');
    needed.add('/sprites/YCR.png');
    needed.add('/sprites/YCR_Mad.png');
    needed.add('/sprites/Sonic_EXE_Pixel.png');
    needed.add('/sprites/BF_Pixel.png');
    needed.add('/sprites/arrows-pixels.png');
    needed.add('/sprites/arrowEndsNew.png');
    needed.add('/sprites/icon-ycr.png');
    needed.add('/sprites/icon-ycr-pissy.png');
    needed.add('/sprites/icon-pixelsonic.png');
    needed.add('/sprites/icon-bfpixelycr.png');
    needed.add('/sprites/RedVG.png');
    needed.add('/sprites/SonicJumpscare.png');
  } else if (songId === 'triple-trouble') {
    needed.add('/sprites/Tails.png');
    needed.add('/sprites/KnucklesEXE.png');
    needed.add('/sprites/eggman_soul.png');
    needed.add('/sprites/Beast.png');
    needed.add('/sprites/P3_BF.png');
    needed.add('/sprites/P3_Tails.png');
    needed.add('/sprites/P3_Knuckles.png');
    needed.add('/sprites/P3_Eggman.png');
    needed.add('/sprites/p3_Grass.png');
    needed.add('/sprites/p3_Trees.png');
    needed.add('/sprites/p3_Trees2.png');
    needed.add('/sprites/ttBackBush.png');
    needed.add('/sprites/ttTopBushes.png');
    needed.add('/sprites/ttTrees.png');
    needed.add('/sprites/ttFGTree1.png');
    needed.add('/sprites/ttFGTree2.png');
    needed.add('/sprites/icon-tails.png');
    needed.add('/sprites/icon-knux.png');
    needed.add('/sprites/icon-eggman.png');
    needed.add('/sprites/icon-xenophanes.png');
  } else if (songId === 'endless') {
    needed.add('/sprites/SonicFunAssets.png');
    needed.add('/sprites/Majin_Notes.png');
    needed.add('/sprites/icon-majin.png');
  } else if (songId === 'endless-og') {
    needed.add('/sprites/MajinOG.png');
    needed.add('/sprites/Majin_Notes.png');
    needed.add('/sprites/icon-majin-og.png');
  }

  // Evict unused character/stage sprite sheets from previous songs to prevent GPU texture cache thrashing
  for (const existingSrc of Object.keys(spriteSheetCache)) {
    if (!needed.has(existingSrc)) {
      const oldImg = spriteSheetCache[existingSrc];
      if (oldImg) {
        oldImg.src = '';
      }
      delete spriteSheetCache[existingSrc];
    }
  }

  needed.forEach((src) => getSpriteSheet(src));
}

if (typeof window !== 'undefined') {
  [
    '/sprites/NOTE_assets.png',
    '/sprites/STATIC_assets.png',
    '/sprites/PhantomNote.png',
    '/sprites/Majin_Notes.png',
    '/sprites/RingNote.png',
    '/sprites/RingCounter.png',
    '/sprites/arrows-pixels.png',
    '/sprites/arrowEndsNew.png',
    '/sprites/icon-bf.png',
    '/sprites/icon-sonic-exe.png',
    '/sprites/BloodSplash.png',
    '/sprites/ui/sick.png',
    '/sprites/ui/good.png',
    '/sprites/ui/bad.png',
    '/sprites/ui/shit.png',
    '/sprites/ui/num0.png',
    '/sprites/ui/num1.png',
    '/sprites/ui/num2.png',
    '/sprites/ui/num3.png',
    '/sprites/ui/num4.png',
    '/sprites/ui/num5.png',
    '/sprites/ui/num6.png',
    '/sprites/ui/num7.png',
    '/sprites/ui/num8.png',
    '/sprites/ui/num9.png',
  ].forEach((src) => getSpriteSheet(src));

  if (typeof FontFace !== 'undefined' && document?.fonts) {
    const vcrFont = new FontFace('VCR OSD Mono', 'url(/fonts/vcr.ttf)');
    vcrFont
      .load()
      .then((loaded) => document.fonts.add(loaded))
      .catch(() => {});
    const pressStartFont = new FontFace(
      'Press Start 2P',
      'url(/fonts/PressStart2P.ttf)'
    );
    pressStartFont
      .load()
      .then((loaded) => document.fonts.add(loaded))
      .catch(() => {});
  }
}

// Exact Sparrow v2 SubTexture animations & offsets for YCR Sonic.EXE Act 2 (YCR.xml + sonicexep2.json)
const YCR_NORMAL_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right' | 'laugh' | 'scream',
  {
    fps: number;
    offset: [number, number];
    frames: readonly { x: number; y: number; w: number; h: number }[];
  }
> = {
  idle: {
    fps: 26,
    offset: [-18, 67],
    frames: [
      { x: 6895, y: 73, w: 512, h: 738 },
      { x: 6895, y: 73, w: 512, h: 738 },
      { x: 7450, y: 73, w: 512, h: 738 },
      { x: 7450, y: 73, w: 512, h: 738 },
      { x: 73, y: 854, w: 512, h: 738 },
      { x: 73, y: 854, w: 512, h: 738 },
      { x: 628, y: 854, w: 512, h: 738 },
      { x: 628, y: 854, w: 512, h: 738 },
      { x: 1183, y: 854, w: 512, h: 738 },
      { x: 1738, y: 854, w: 512, h: 738 },
      { x: 2293, y: 854, w: 512, h: 738 },
      { x: 2848, y: 854, w: 512, h: 738 },
      { x: 3403, y: 854, w: 512, h: 738 },
      { x: 3958, y: 854, w: 512, h: 738 },
      { x: 4513, y: 854, w: 512, h: 738 },
      { x: 5068, y: 854, w: 512, h: 738 },
      { x: 5623, y: 854, w: 512, h: 738 },
    ],
  },
  left: {
    fps: 38,
    offset: [184, 22],
    frames: [
      { x: 6178, y: 854, w: 712, h: 683 },
      { x: 6178, y: 854, w: 712, h: 683 },
      { x: 6933, y: 854, w: 712, h: 683 },
      { x: 6933, y: 854, w: 712, h: 683 },
      { x: 73, y: 1635, w: 712, h: 683 },
      { x: 73, y: 1635, w: 712, h: 683 },
      { x: 828, y: 1635, w: 712, h: 683 },
      { x: 828, y: 1635, w: 712, h: 683 },
      { x: 1583, y: 1635, w: 712, h: 683 },
      { x: 1583, y: 1635, w: 712, h: 683 },
      { x: 2338, y: 1635, w: 712, h: 683 },
    ],
  },
  down: {
    fps: 40,
    offset: [21, -6],
    frames: [
      { x: 3133, y: 73, w: 584, h: 639 },
      { x: 3133, y: 73, w: 584, h: 639 },
      { x: 3760, y: 73, w: 584, h: 639 },
      { x: 3760, y: 73, w: 584, h: 639 },
      { x: 4387, y: 73, w: 584, h: 639 },
      { x: 4387, y: 73, w: 584, h: 639 },
      { x: 5014, y: 73, w: 584, h: 639 },
      { x: 5014, y: 73, w: 584, h: 639 },
      { x: 5641, y: 73, w: 584, h: 639 },
      { x: 5641, y: 73, w: 584, h: 639 },
      { x: 6268, y: 73, w: 584, h: 639 },
    ],
  },
  up: {
    fps: 42,
    offset: [-69, 129],
    frames: [
      { x: 845, y: 2361, w: 531, h: 770 },
      { x: 845, y: 2361, w: 531, h: 770 },
      { x: 1419, y: 2361, w: 531, h: 770 },
      { x: 1419, y: 2361, w: 531, h: 770 },
      { x: 1993, y: 2361, w: 531, h: 770 },
      { x: 1993, y: 2361, w: 531, h: 770 },
      { x: 2567, y: 2361, w: 531, h: 770 },
      { x: 2567, y: 2361, w: 531, h: 770 },
      { x: 3141, y: 2361, w: 531, h: 770 },
      { x: 3141, y: 2361, w: 531, h: 770 },
      { x: 3715, y: 2361, w: 531, h: 770 },
      { x: 2567, y: 2361, w: 531, h: 770 },
    ],
  },
  right: {
    fps: 35,
    offset: [-26, -31],
    frames: [
      { x: 3093, y: 1635, w: 729, h: 619 },
      { x: 3093, y: 1635, w: 729, h: 619 },
      { x: 3865, y: 1635, w: 729, h: 619 },
      { x: 3865, y: 1635, w: 729, h: 619 },
      { x: 4637, y: 1635, w: 729, h: 619 },
      { x: 4637, y: 1635, w: 729, h: 619 },
      { x: 5409, y: 1635, w: 729, h: 619 },
      { x: 5409, y: 1635, w: 729, h: 619 },
      { x: 6181, y: 1635, w: 729, h: 619 },
      { x: 6181, y: 1635, w: 729, h: 619 },
      { x: 6953, y: 1635, w: 729, h: 619 },
      { x: 73, y: 2361, w: 729, h: 619 },
    ],
  },
  laugh: {
    fps: 24,
    offset: [18, -51],
    frames: [
      { x: 73, y: 73, w: 569, h: 598 },
      { x: 685, y: 73, w: 569, h: 598 },
      { x: 1297, y: 73, w: 569, h: 598 },
      { x: 1909, y: 73, w: 569, h: 598 },
      { x: 2521, y: 73, w: 569, h: 598 },
    ],
  },
  scream: {
    fps: 24,
    offset: [360, 7],
    frames: [
      { x: 4289, y: 2361, w: 848, h: 663 },
      { x: 5180, y: 2361, w: 848, h: 663 },
      { x: 6071, y: 2361, w: 848, h: 663 },
      { x: 6962, y: 2361, w: 848, h: 663 },
      { x: 73, y: 3174, w: 848, h: 663 },
      { x: 964, y: 3174, w: 848, h: 663 },
      { x: 1855, y: 3174, w: 848, h: 663 },
      { x: 2746, y: 3174, w: 848, h: 663 },
      { x: 3637, y: 3174, w: 848, h: 663 },
      { x: 4528, y: 3174, w: 848, h: 663 },
      { x: 5419, y: 3174, w: 848, h: 663 },
      { x: 6310, y: 3174, w: 848, h: 663 },
      { x: 7201, y: 3174, w: 848, h: 663 },
    ],
  },
};

// Exact Sparrow v2 SubTexture animations & offsets for YCR Mad Sonic.EXE (YCR_Mad.xml + sonicexep2mad.json)
const YCR_MAD_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right' | 'laugh' | 'scream' | 'die',
  {
    fps: number;
    offset: [number, number];
    frames: readonly { x: number; y: number; w: number; h: number }[];
  }
> = {
  idle: {
    fps: 26,
    offset: [-18, 67],
    frames: [
      { x: 1435, y: 3828, w: 509, h: 726 },
      { x: 1435, y: 3828, w: 509, h: 726 },
      { x: 2044, y: 3828, w: 509, h: 726 },
      { x: 2044, y: 3828, w: 509, h: 726 },
      { x: 2653, y: 3828, w: 509, h: 726 },
      { x: 2653, y: 3828, w: 509, h: 726 },
      { x: 3262, y: 3828, w: 509, h: 726 },
      { x: 3262, y: 3828, w: 509, h: 726 },
      { x: 3871, y: 3828, w: 509, h: 726 },
      { x: 4480, y: 3828, w: 509, h: 726 },
      { x: 5089, y: 3828, w: 509, h: 726 },
      { x: 5698, y: 3828, w: 509, h: 726 },
      { x: 6307, y: 3828, w: 509, h: 726 },
      { x: 6916, y: 3828, w: 509, h: 726 },
      { x: 7525, y: 3828, w: 509, h: 726 },
      { x: 73, y: 4654, w: 509, h: 726 },
      { x: 682, y: 4654, w: 509, h: 726 },
    ],
  },
  left: {
    fps: 38,
    offset: [192, 32],
    frames: [
      { x: 1291, y: 4654, w: 725, h: 689 },
      { x: 1291, y: 4654, w: 725, h: 689 },
      { x: 2116, y: 4654, w: 725, h: 689 },
      { x: 2116, y: 4654, w: 725, h: 689 },
      { x: 2941, y: 4654, w: 725, h: 689 },
      { x: 2941, y: 4654, w: 725, h: 689 },
      { x: 3766, y: 4654, w: 725, h: 689 },
      { x: 3766, y: 4654, w: 725, h: 689 },
      { x: 4591, y: 4654, w: 725, h: 689 },
      { x: 4591, y: 4654, w: 725, h: 689 },
      { x: 5416, y: 4654, w: 725, h: 689 },
    ],
  },
  down: {
    fps: 40,
    offset: [-20, -26],
    frames: [
      { x: 5344, y: 3077, w: 581, h: 606 },
      { x: 5344, y: 3077, w: 581, h: 606 },
      { x: 6025, y: 3077, w: 581, h: 606 },
      { x: 6025, y: 3077, w: 581, h: 606 },
      { x: 6706, y: 3077, w: 581, h: 606 },
      { x: 6706, y: 3077, w: 581, h: 606 },
      { x: 7387, y: 3077, w: 581, h: 606 },
      { x: 7387, y: 3077, w: 581, h: 606 },
      { x: 73, y: 3828, w: 581, h: 606 },
      { x: 73, y: 3828, w: 581, h: 606 },
      { x: 754, y: 3828, w: 581, h: 606 },
    ],
  },
  up: {
    fps: 42,
    offset: [-61, 238],
    frames: [
      { x: 4298, y: 5480, w: 544, h: 867 },
      { x: 4298, y: 5480, w: 544, h: 867 },
      { x: 4942, y: 5480, w: 544, h: 867 },
      { x: 4942, y: 5480, w: 544, h: 867 },
      { x: 5586, y: 5480, w: 544, h: 867 },
      { x: 5586, y: 5480, w: 544, h: 867 },
      { x: 6230, y: 5480, w: 544, h: 867 },
      { x: 6230, y: 5480, w: 544, h: 867 },
      { x: 6874, y: 5480, w: 544, h: 867 },
      { x: 6874, y: 5480, w: 544, h: 867 },
      { x: 7518, y: 5480, w: 544, h: 867 },
      { x: 73, y: 6447, w: 544, h: 867 },
    ],
  },
  right: {
    fps: 35,
    offset: [-26, 0],
    frames: [
      { x: 6241, y: 4654, w: 745, h: 640 },
      { x: 6241, y: 4654, w: 745, h: 640 },
      { x: 7086, y: 4654, w: 745, h: 640 },
      { x: 7086, y: 4654, w: 745, h: 640 },
      { x: 73, y: 5480, w: 745, h: 640 },
      { x: 73, y: 5480, w: 745, h: 640 },
      { x: 918, y: 5480, w: 745, h: 640 },
      { x: 918, y: 5480, w: 745, h: 640 },
      { x: 1763, y: 5480, w: 745, h: 640 },
      { x: 1763, y: 5480, w: 745, h: 640 },
      { x: 2608, y: 5480, w: 745, h: 640 },
      { x: 3453, y: 5480, w: 745, h: 640 },
    ],
  },
  laugh: {
    fps: 24,
    offset: [18, -35],
    frames: [
      { x: 1999, y: 3077, w: 569, h: 598 },
      { x: 2668, y: 3077, w: 569, h: 598 },
      { x: 3337, y: 3077, w: 569, h: 598 },
      { x: 4006, y: 3077, w: 569, h: 598 },
      { x: 4675, y: 3077, w: 569, h: 598 },
    ],
  },
  scream: {
    fps: 24,
    offset: [360, 7],
    frames: [
      { x: 717, y: 6447, w: 848, h: 663 },
      { x: 1665, y: 6447, w: 848, h: 663 },
      { x: 2613, y: 6447, w: 848, h: 663 },
      { x: 3561, y: 6447, w: 848, h: 663 },
      { x: 4509, y: 6447, w: 848, h: 663 },
      { x: 5457, y: 6447, w: 848, h: 663 },
      { x: 6405, y: 6447, w: 848, h: 663 },
      { x: 73, y: 7414, w: 848, h: 663 },
      { x: 1021, y: 7414, w: 848, h: 663 },
      { x: 1969, y: 7414, w: 848, h: 663 },
      { x: 2917, y: 7414, w: 848, h: 663 },
      { x: 3865, y: 7414, w: 848, h: 663 },
      { x: 4813, y: 7414, w: 848, h: 663 },
    ],
  },
  die: {
    fps: 24,
    offset: [170, 20],
    frames: [
      { x: 73, y: 73, w: 863, h: 651 },
      { x: 1036, y: 73, w: 863, h: 651 },
      { x: 1999, y: 73, w: 863, h: 651 },
      { x: 2962, y: 73, w: 863, h: 651 },
      { x: 3925, y: 73, w: 863, h: 651 },
      { x: 4888, y: 73, w: 863, h: 651 },
      { x: 5851, y: 73, w: 863, h: 651 },
      { x: 6814, y: 73, w: 863, h: 651 },
      { x: 73, y: 824, w: 863, h: 651 },
      { x: 1036, y: 824, w: 863, h: 651 },
      { x: 1999, y: 824, w: 863, h: 651 },
      { x: 2962, y: 824, w: 863, h: 651 },
      { x: 3925, y: 824, w: 863, h: 651 },
      { x: 4888, y: 824, w: 863, h: 651 },
      { x: 5851, y: 824, w: 863, h: 651 },
      { x: 6814, y: 824, w: 863, h: 651 },
      { x: 73, y: 1575, w: 863, h: 651 },
      { x: 1036, y: 1575, w: 863, h: 651 },
      { x: 1999, y: 1575, w: 863, h: 651 },
      { x: 2962, y: 1575, w: 863, h: 651 },
      { x: 3925, y: 1575, w: 863, h: 651 },
      { x: 4888, y: 1575, w: 863, h: 651 },
      { x: 5851, y: 1575, w: 863, h: 651 },
      { x: 6814, y: 1575, w: 863, h: 651 },
      { x: 73, y: 2326, w: 863, h: 651 },
      { x: 1036, y: 2326, w: 863, h: 651 },
      { x: 1999, y: 2326, w: 863, h: 651 },
      { x: 2962, y: 2326, w: 863, h: 651 },
      { x: 3925, y: 2326, w: 863, h: 651 },
      { x: 4888, y: 2326, w: 863, h: 651 },
      { x: 5851, y: 2326, w: 863, h: 651 },
      { x: 6814, y: 2326, w: 863, h: 651 },
      { x: 73, y: 3077, w: 863, h: 651 },
      { x: 1036, y: 3077, w: 863, h: 651 },
    ],
  },
};

// Exact 16-bit Pixel Sonic.EXE frames from Sonic_EXE_Pixel.xml (51x51 native)
const SONIC_PIXEL_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right',
  readonly { x: number; y: number; w: number; h: number }[]
> = {
  idle: [
    { x: 102, y: 0, w: 51, h: 51 },
    { x: 0, y: 51, w: 51, h: 51 },
    { x: 51, y: 51, w: 51, h: 51 },
    { x: 102, y: 51, w: 51, h: 51 },
    { x: 0, y: 102, w: 51, h: 51 },
  ],
  down: [
    { x: 0, y: 0, w: 51, h: 51 },
    { x: 51, y: 0, w: 51, h: 51 },
  ],
  up: [
    { x: 51, y: 204, w: 51, h: 51 },
    { x: 102, y: 204, w: 51, h: 51 },
  ],
  // Since Sonic_EXE_Pixel is flipped horizontally on the left side to face right toward BF:
  left: [
    { x: 0, y: 153, w: 51, h: 51 },
    { x: 51, y: 153, w: 51, h: 51 },
    { x: 102, y: 153, w: 51, h: 51 },
    { x: 0, y: 204, w: 51, h: 51 },
  ],
  right: [
    { x: 51, y: 102, w: 51, h: 51 },
    { x: 102, y: 102, w: 51, h: 51 },
  ],
};

// Exact 16-bit Pixel Boyfriend frames from BF.xml (42x46 native, facing left on right side of stage)
const BF_PIXEL_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right' | 'miss',
  readonly { x: number; y: number; w: number; h: number }[]
> = {
  idle: [
    { x: 0, y: 0, w: 42, h: 46 },
    { x: 42, y: 0, w: 42, h: 46 },
    { x: 84, y: 0, w: 42, h: 46 },
    { x: 126, y: 0, w: 42, h: 46 },
    { x: 168, y: 0, w: 42, h: 46 },
  ],
  down: [
    { x: 210, y: 0, w: 42, h: 46 },
    { x: 0, y: 46, w: 42, h: 46 },
  ],
  left: [
    { x: 42, y: 46, w: 42, h: 46 },
    { x: 84, y: 46, w: 42, h: 46 },
  ],
  up: [
    { x: 126, y: 46, w: 42, h: 46 },
    { x: 168, y: 46, w: 42, h: 46 },
  ],
  right: [
    { x: 210, y: 46, w: 42, h: 46 },
    { x: 0, y: 92, w: 42, h: 46 },
  ],
  miss: [
    { x: 42, y: 92, w: 42, h: 46 },
    { x: 84, y: 92, w: 42, h: 46 },
  ],
};

// Authentic Sparrow v2 SubTexture animations for Fake Sonic (sonicexefake) from Sonic_FakerForm.xml + sonicexefake.json
const SONIC_FAKER_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right' | 'revealed',
  {
    fps: number;
    offset: [number, number];
    frames: readonly { x: number; y: number; w: number; h: number; fx: number; fy: number }[];
  }
> = {
  idle: {
    fps: 24,
    offset: [140, 100],
    frames: [
      { x: 1816, y: 0, w: 438, h: 600, fx: 0, fy: -9 },
      { x: 1816, y: 0, w: 438, h: 600, fx: 0, fy: -9 },
      { x: 2268, y: 0, w: 438, h: 602, fx: 0, fy: -7 },
      { x: 2268, y: 0, w: 438, h: 602, fx: 0, fy: -7 },
      { x: 2720, y: 0, w: 437, h: 607, fx: -2, fy: -2 },
      { x: 2720, y: 0, w: 437, h: 607, fx: -2, fy: -2 },
      { x: 3171, y: 0, w: 439, h: 608, fx: -3, fy: 0 },
      { x: 3171, y: 0, w: 439, h: 608, fx: -3, fy: 0 },
      { x: 3624, y: 0, w: 439, h: 608, fx: -3, fy: 0 },
      { x: 3624, y: 0, w: 439, h: 608, fx: -3, fy: 0 },
      { x: 3624, y: 0, w: 439, h: 608, fx: -3, fy: 0 },
      { x: 3624, y: 0, w: 439, h: 608, fx: -3, fy: 0 },
      { x: 3624, y: 0, w: 439, h: 608, fx: -3, fy: 0 },
      { x: 3624, y: 0, w: 439, h: 608, fx: -3, fy: 0 },
    ],
  },
  left: {
    fps: 24,
    offset: [143, 105],
    frames: [
      { x: 0, y: 622, w: 427, h: 613, fx: 0, fy: 0 },
      { x: 0, y: 622, w: 427, h: 613, fx: 0, fy: 0 },
      { x: 441, y: 622, w: 427, h: 613, fx: -2, fy: 0 },
      { x: 441, y: 622, w: 427, h: 613, fx: -2, fy: 0 },
      { x: 882, y: 622, w: 430, h: 611, fx: -7, fy: -2 },
      { x: 882, y: 622, w: 430, h: 611, fx: -7, fy: -2 },
      { x: 1326, y: 622, w: 431, h: 611, fx: -7, fy: -2 },
      { x: 1326, y: 622, w: 431, h: 611, fx: -7, fy: -2 },
      { x: 1326, y: 622, w: 431, h: 611, fx: -7, fy: -2 },
      { x: 1326, y: 622, w: 431, h: 611, fx: -7, fy: -2 },
      { x: 1326, y: 622, w: 431, h: 611, fx: -7, fy: -2 },
      { x: 1326, y: 622, w: 431, h: 611, fx: -7, fy: -2 },
      { x: 1326, y: 622, w: 431, h: 611, fx: -7, fy: -2 },
    ],
  },
  down: {
    fps: 24,
    offset: [149, 96],
    frames: [
      { x: 0, y: 0, w: 441, h: 597, fx: 0, fy: -8 },
      { x: 0, y: 0, w: 441, h: 597, fx: 0, fy: -8 },
      { x: 455, y: 0, w: 441, h: 597, fx: -1, fy: -7 },
      { x: 455, y: 0, w: 441, h: 597, fx: -1, fy: -7 },
      { x: 910, y: 0, w: 439, h: 603, fx: -5, fy: -1 },
      { x: 910, y: 0, w: 439, h: 603, fx: -5, fy: -1 },
      { x: 1363, y: 0, w: 439, h: 605, fx: -5, fy: 0 },
      { x: 1363, y: 0, w: 439, h: 605, fx: -5, fy: 0 },
      { x: 1363, y: 0, w: 439, h: 605, fx: -5, fy: 0 },
      { x: 1363, y: 0, w: 439, h: 605, fx: -5, fy: 0 },
      { x: 1363, y: 0, w: 439, h: 605, fx: -5, fy: 0 },
      { x: 1363, y: 0, w: 439, h: 605, fx: -5, fy: 0 },
      { x: 1363, y: 0, w: 439, h: 605, fx: -5, fy: 0 },
    ],
  },
  up: {
    fps: 24,
    offset: [137, 129],
    frames: [
      { x: 907, y: 2547, w: 442, h: 637, fx: -3, fy: 0 },
      { x: 907, y: 2547, w: 442, h: 637, fx: -3, fy: 0 },
      { x: 1363, y: 2547, w: 442, h: 635, fx: -3, fy: -2 },
      { x: 1363, y: 2547, w: 442, h: 635, fx: -3, fy: -2 },
      { x: 1819, y: 2547, w: 443, h: 624, fx: 0, fy: -13 },
      { x: 1819, y: 2547, w: 443, h: 624, fx: 0, fy: -13 },
      { x: 2276, y: 2547, w: 443, h: 622, fx: 0, fy: -15 },
      { x: 2276, y: 2547, w: 443, h: 622, fx: 0, fy: -15 },
      { x: 2276, y: 2547, w: 443, h: 622, fx: 0, fy: -15 },
      { x: 2276, y: 2547, w: 443, h: 622, fx: 0, fy: -15 },
      { x: 2276, y: 2547, w: 443, h: 622, fx: 0, fy: -15 },
      { x: 2276, y: 2547, w: 443, h: 622, fx: 0, fy: -15 },
      { x: 2276, y: 2547, w: 443, h: 622, fx: 0, fy: -15 },
    ],
  },
  right: {
    fps: 24,
    offset: [138, 121],
    frames: [
      { x: 2764, y: 1896, w: 443, h: 630, fx: 0, fy: 0 },
      { x: 2764, y: 1896, w: 443, h: 630, fx: 0, fy: 0 },
      { x: 3221, y: 1896, w: 443, h: 630, fx: 0, fy: -1 },
      { x: 3221, y: 1896, w: 443, h: 630, fx: 0, fy: -1 },
      { x: 0, y: 2547, w: 440, h: 623, fx: 0, fy: -7 },
      { x: 0, y: 2547, w: 440, h: 623, fx: 0, fy: -7 },
      { x: 454, y: 2547, w: 439, h: 622, fx: 0, fy: -8 },
      { x: 454, y: 2547, w: 439, h: 622, fx: 0, fy: -8 },
      { x: 454, y: 2547, w: 439, h: 622, fx: 0, fy: -8 },
      { x: 454, y: 2547, w: 439, h: 622, fx: 0, fy: -8 },
      { x: 454, y: 2547, w: 439, h: 622, fx: 0, fy: -8 },
      { x: 454, y: 2547, w: 439, h: 622, fx: 0, fy: -8 },
      { x: 454, y: 2547, w: 439, h: 622, fx: 0, fy: -8 },
    ],
  },
  revealed: {
    fps: 12,
    offset: [158, 111],
    frames: [
      // Immediate dark-blue glowing-red-eye bleeding sprites (Sonic Reveal0020 & 0022) when sprite changes at 41.33s
      { x: 1846, y: 1896, w: 446, h: 617, fx: -18, fy: -3 },
      { x: 1846, y: 1896, w: 446, h: 617, fx: -18, fy: -3 },
      { x: 2306, y: 1896, w: 444, h: 608, fx: -18, fy: -11 },
      { x: 2306, y: 1896, w: 444, h: 608, fx: -18, fy: -11 },
      { x: 1846, y: 1896, w: 446, h: 617, fx: -18, fy: -3 },
      { x: 1846, y: 1896, w: 446, h: 617, fx: -18, fy: -3 },
      { x: 2306, y: 1896, w: 444, h: 608, fx: -18, fy: -11 },
      { x: 2306, y: 1896, w: 444, h: 608, fx: -18, fy: -11 },
    ],
  },
};

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

// Exact Sparrow v2 SubTexture frames for GF with the Speakers (GF_assets.xml: GF Dancing Beat0000..0014 = danceLeft, 0015..0029 = danceRight at 24fps, frameWidth 703, frameHeight 648)
const GF_SPEAKER_DANCE_LEFT_FRAMES = [
  { x: 3553, y: 0, w: 699, h: 634, fx: -2, fy: -14 },
  { x: 4262, y: 0, w: 703, h: 634, fx: 0, fy: -14 },
  { x: 4975, y: 0, w: 703, h: 632, fx: 0, fy: -16 },
  { x: 5688, y: 0, w: 699, h: 632, fx: -2, fy: -16 },
  { x: 6397, y: 0, w: 699, h: 635, fx: -2, fy: -13 },
  { x: 7106, y: 0, w: 699, h: 635, fx: -2, fy: -13 },
  { x: 0, y: 667, w: 699, h: 637, fx: -2, fy: -11 },
  { x: 709, y: 667, w: 699, h: 648, fx: -2, fy: 0 },
  { x: 709, y: 667, w: 699, h: 648, fx: -2, fy: 0 },
  { x: 709, y: 667, w: 699, h: 648, fx: -2, fy: 0 },
  { x: 1418, y: 667, w: 699, h: 648, fx: -2, fy: 0 },
  { x: 1418, y: 667, w: 699, h: 648, fx: -2, fy: 0 },
  { x: 1418, y: 667, w: 699, h: 648, fx: -2, fy: 0 },
  { x: 2127, y: 667, w: 699, h: 648, fx: -2, fy: 0 },
  { x: 2127, y: 667, w: 699, h: 648, fx: -2, fy: 0 },
] as const;

const GF_SPEAKER_DANCE_RIGHT_FRAMES = [
  { x: 2836, y: 667, w: 699, h: 636, fx: -2, fy: -12 },
  { x: 3545, y: 667, w: 703, h: 636, fx: 0, fy: -12 },
  { x: 4258, y: 667, w: 703, h: 636, fx: 0, fy: -12 },
  { x: 4971, y: 667, w: 699, h: 636, fx: -2, fy: -12 },
  { x: 5680, y: 667, w: 699, h: 637, fx: -2, fy: -11 },
  { x: 6389, y: 667, w: 699, h: 637, fx: -2, fy: -11 },
  { x: 7098, y: 667, w: 699, h: 638, fx: -2, fy: -10 },
  { x: 0, y: 1325, w: 699, h: 643, fx: -2, fy: -5 },
  { x: 0, y: 1325, w: 699, h: 643, fx: -2, fy: -5 },
  { x: 0, y: 1325, w: 699, h: 643, fx: -2, fy: -5 },
  { x: 709, y: 1325, w: 699, h: 642, fx: -2, fy: -6 },
  { x: 709, y: 1325, w: 699, h: 642, fx: -2, fy: -6 },
  { x: 709, y: 1325, w: 699, h: 642, fx: -2, fy: -6 },
  { x: 1418, y: 1325, w: 699, h: 642, fx: -2, fy: -6 },
  { x: 1418, y: 1325, w: 699, h: 642, fx: -2, fy: -6 },
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

// Exact Sparrow v2 SubTexture frames & Psych Engine offsets for Endless OG Majin Sonic (MajinOG.xml + majin_new.json, scale 1.4)
const MAJIN_OG_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right',
  {
    offset: [number, number];
    fps: number;
    frames: readonly { x: number; y: number; w: number; h: number }[];
  }
> = {
  idle: {
    offset: [-20, -3],
    fps: 24,
    frames: [
      { x: 2300, y: 15, w: 379, h: 439 },
      { x: 2300, y: 15, w: 379, h: 439 },
      { x: 2694, y: 15, w: 379, h: 439 },
      { x: 2694, y: 15, w: 379, h: 439 },
      { x: 3088, y: 15, w: 379, h: 439 },
      { x: 3088, y: 15, w: 379, h: 439 },
      { x: 3482, y: 15, w: 379, h: 439 },
      { x: 3482, y: 15, w: 379, h: 439 },
      { x: 15, y: 469, w: 379, h: 439 },
      { x: 15, y: 469, w: 379, h: 439 },
      { x: 409, y: 469, w: 379, h: 439 },
      { x: 409, y: 469, w: 379, h: 439 },
    ],
  },
  up: {
    offset: [9, 95],
    fps: 32,
    frames: [
      { x: 2543, y: 946, w: 392, h: 534 },
      { x: 2543, y: 946, w: 392, h: 534 },
      { x: 2950, y: 946, w: 392, h: 534 },
      { x: 2950, y: 946, w: 392, h: 534 },
      { x: 3357, y: 946, w: 392, h: 534 },
      { x: 3357, y: 946, w: 392, h: 534 },
      { x: 15, y: 1495, w: 392, h: 534 },
      { x: 15, y: 1495, w: 392, h: 534 },
      { x: 422, y: 1495, w: 392, h: 534 },
      { x: 422, y: 1495, w: 392, h: 534 },
      { x: 422, y: 1495, w: 392, h: 534 },
      { x: 422, y: 1495, w: 392, h: 534 },
    ],
  },
  down: {
    offset: [24, -73],
    fps: 32,
    frames: [
      { x: 15, y: 15, w: 442, h: 390 },
      { x: 15, y: 15, w: 442, h: 390 },
      { x: 472, y: 15, w: 442, h: 390 },
      { x: 472, y: 15, w: 442, h: 390 },
      { x: 929, y: 15, w: 442, h: 390 },
      { x: 929, y: 15, w: 442, h: 390 },
      { x: 1386, y: 15, w: 442, h: 390 },
      { x: 1386, y: 15, w: 442, h: 390 },
      { x: 1843, y: 15, w: 442, h: 390 },
      { x: 1843, y: 15, w: 442, h: 390 },
      { x: 1843, y: 15, w: 442, h: 390 },
      { x: 1843, y: 15, w: 442, h: 390 },
    ],
  },
  left: {
    offset: [262, 13],
    fps: 32,
    frames: [
      { x: 803, y: 469, w: 499, h: 462 },
      { x: 803, y: 469, w: 499, h: 462 },
      { x: 1317, y: 469, w: 499, h: 462 },
      { x: 1317, y: 469, w: 499, h: 462 },
      { x: 1831, y: 469, w: 499, h: 462 },
      { x: 1831, y: 469, w: 499, h: 462 },
      { x: 2345, y: 469, w: 499, h: 462 },
      { x: 2345, y: 469, w: 499, h: 462 },
      { x: 2859, y: 469, w: 499, h: 462 },
      { x: 2859, y: 469, w: 499, h: 462 },
      { x: 2859, y: 469, w: 499, h: 462 },
      { x: 2859, y: 469, w: 499, h: 462 },
    ],
  },
  right: {
    offset: [60, -33],
    fps: 32,
    frames: [
      { x: 3373, y: 469, w: 617, h: 417 },
      { x: 3373, y: 469, w: 617, h: 417 },
      { x: 15, y: 946, w: 617, h: 417 },
      { x: 15, y: 946, w: 617, h: 417 },
      { x: 647, y: 946, w: 617, h: 417 },
      { x: 647, y: 946, w: 617, h: 417 },
      { x: 1279, y: 946, w: 617, h: 417 },
      { x: 1279, y: 946, w: 617, h: 417 },
      { x: 1911, y: 946, w: 617, h: 417 },
      { x: 1911, y: 946, w: 617, h: 417 },
      { x: 1911, y: 946, w: 617, h: 417 },
      { x: 1911, y: 946, w: 617, h: 417 },
    ],
  },
};

// Exact Sparrow v2 SubTexture frames & Psych Engine offsets for Endless Majin Sonic (SonicFunAssets.xml + majin.json, scale 1.0, 24fps)
const SONIC_FUN_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right',
  {
    offset: [number, number];
    fps: number;
    frames: readonly { x: number; y: number; w: number; h: number }[];
  }
> = {
  idle: {
    offset: [-42, 183],
    fps: 24,
    frames: [
      { x: 4382, y: 536, w: 516, h: 678 },
      { x: 4898, y: 536, w: 516, h: 678 },
      { x: 5414, y: 536, w: 516, h: 678 },
      { x: 5930, y: 536, w: 516, h: 678 },
      { x: 6446, y: 536, w: 516, h: 678 },
      { x: 6962, y: 536, w: 516, h: 678 },
      { x: 7478, y: 536, w: 516, h: 678 },
      { x: 0, y: 1214, w: 516, h: 678 },
      { x: 516, y: 1214, w: 516, h: 678 },
      { x: 1032, y: 1214, w: 516, h: 678 },
      { x: 1548, y: 1214, w: 516, h: 678 },
    ],
  },
  left: {
    offset: [275, 54],
    fps: 24,
    frames: [
      { x: 2064, y: 1214, w: 741, h: 553 },
      { x: 2805, y: 1214, w: 741, h: 553 },
      { x: 3546, y: 1214, w: 741, h: 553 },
      { x: 4287, y: 1214, w: 741, h: 553 },
      { x: 5028, y: 1214, w: 741, h: 553 },
      { x: 5769, y: 1214, w: 741, h: 553 },
      { x: 6510, y: 1214, w: 741, h: 553 },
      { x: 7251, y: 1214, w: 741, h: 553 },
      { x: 0, y: 1892, w: 741, h: 553 },
      { x: 741, y: 1892, w: 741, h: 553 },
      { x: 1482, y: 1892, w: 741, h: 553 },
      { x: 2223, y: 1892, w: 741, h: 553 },
      { x: 2964, y: 1892, w: 741, h: 553 },
      { x: 3705, y: 1892, w: 741, h: 553 },
      { x: 4446, y: 1892, w: 741, h: 553 },
      { x: 5187, y: 1892, w: 741, h: 553 },
      { x: 5928, y: 1892, w: 741, h: 553 },
      { x: 6669, y: 1892, w: 741, h: 553 },
      { x: 7410, y: 1892, w: 741, h: 553 },
      { x: 0, y: 2445, w: 741, h: 553 },
    ],
  },
  down: {
    offset: [51, 45],
    fps: 24,
    frames: [
      { x: 0, y: 0, w: 626, h: 536 },
      { x: 626, y: 0, w: 626, h: 536 },
      { x: 1252, y: 0, w: 626, h: 536 },
      { x: 1878, y: 0, w: 626, h: 536 },
      { x: 2504, y: 0, w: 626, h: 536 },
      { x: 3130, y: 0, w: 626, h: 536 },
      { x: 3756, y: 0, w: 626, h: 536 },
      { x: 4382, y: 0, w: 626, h: 536 },
      { x: 5008, y: 0, w: 626, h: 536 },
      { x: 5634, y: 0, w: 626, h: 536 },
      { x: 6260, y: 0, w: 626, h: 536 },
      { x: 6886, y: 0, w: 626, h: 536 },
      { x: 7512, y: 0, w: 626, h: 536 },
      { x: 0, y: 536, w: 626, h: 536 },
      { x: 626, y: 536, w: 626, h: 536 },
      { x: 1252, y: 536, w: 626, h: 536 },
      { x: 1878, y: 536, w: 626, h: 536 },
      { x: 2504, y: 536, w: 626, h: 536 },
      { x: 3130, y: 536, w: 626, h: 536 },
      { x: 3756, y: 536, w: 626, h: 536 },
    ],
  },
  up: {
    offset: [39, 196],
    fps: 24,
    frames: [
      { x: 5643, y: 3067, w: 513, h: 696 },
      { x: 6156, y: 3067, w: 513, h: 696 },
      { x: 6669, y: 3067, w: 513, h: 696 },
      { x: 7182, y: 3067, w: 513, h: 696 },
      { x: 0, y: 3763, w: 513, h: 696 },
      { x: 513, y: 3763, w: 513, h: 696 },
      { x: 1026, y: 3763, w: 513, h: 696 },
      { x: 1539, y: 3763, w: 513, h: 696 },
      { x: 2052, y: 3763, w: 513, h: 696 },
      { x: 2565, y: 3763, w: 513, h: 696 },
      { x: 3078, y: 3763, w: 513, h: 696 },
      { x: 3591, y: 3763, w: 513, h: 696 },
      { x: 4104, y: 3763, w: 513, h: 696 },
      { x: 4617, y: 3763, w: 513, h: 696 },
      { x: 5130, y: 3763, w: 513, h: 696 },
      { x: 5643, y: 3763, w: 513, h: 696 },
      { x: 6156, y: 3763, w: 513, h: 696 },
      { x: 6669, y: 3763, w: 513, h: 696 },
      { x: 7182, y: 3763, w: 513, h: 696 },
      { x: 0, y: 4459, w: 513, h: 696 },
    ],
  },
  right: {
    offset: [-51, 133],
    fps: 24,
    frames: [
      { x: 741, y: 2445, w: 627, h: 622 },
      { x: 1368, y: 2445, w: 627, h: 622 },
      { x: 1995, y: 2445, w: 627, h: 622 },
      { x: 2622, y: 2445, w: 627, h: 622 },
      { x: 3249, y: 2445, w: 627, h: 622 },
      { x: 3876, y: 2445, w: 627, h: 622 },
      { x: 4503, y: 2445, w: 627, h: 622 },
      { x: 5130, y: 2445, w: 627, h: 622 },
      { x: 5757, y: 2445, w: 627, h: 622 },
      { x: 6384, y: 2445, w: 627, h: 622 },
      { x: 7011, y: 2445, w: 627, h: 622 },
      { x: 0, y: 3067, w: 627, h: 622 },
      { x: 627, y: 3067, w: 627, h: 622 },
      { x: 1254, y: 3067, w: 627, h: 622 },
      { x: 1881, y: 3067, w: 627, h: 622 },
      { x: 2508, y: 3067, w: 627, h: 622 },
      { x: 3135, y: 3067, w: 627, h: 622 },
      { x: 3762, y: 3067, w: 627, h: 622 },
      { x: 4389, y: 3067, w: 627, h: 622 },
      { x: 5016, y: 3067, w: 627, h: 622 },
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

// Exact Sparrow v2 SubTexture frames & Psych Engine offsets for standard Boyfriend (BOYFRIEND.xml + bf.json, 24fps)
const BOYFRIEND_ANIMS: Record<
  'idle' | 'left' | 'down' | 'up' | 'right' | 'miss',
  {
    offset: [number, number];
    frames: readonly { x: number; y: number; w: number; h: number; fx: number; fy: number }[];
  }
> = {
  idle: {
    offset: [-5, 0],
    frames: [
      { x: 0, y: 2344, w: 406, h: 392, fx: -1, fy: -20 },
      { x: 0, y: 2344, w: 406, h: 392, fx: -1, fy: -20 },
      { x: 416, y: 2344, w: 408, h: 393, fx: 0, fy: -19 },
      { x: 416, y: 2344, w: 408, h: 393, fx: 0, fy: -19 },
      { x: 834, y: 2344, w: 405, h: 398, fx: -3, fy: -14 },
      { x: 834, y: 2344, w: 405, h: 398, fx: -3, fy: -14 },
      { x: 1249, y: 2344, w: 410, h: 411, fx: -1, fy: -1 },
      { x: 1249, y: 2344, w: 410, h: 411, fx: -1, fy: -1 },
      { x: 1669, y: 2344, w: 408, h: 412, fx: -2, fy: 0 },
      { x: 1669, y: 2344, w: 408, h: 412, fx: -2, fy: 0 },
      { x: 1669, y: 2344, w: 408, h: 412, fx: -2, fy: 0 },
      { x: 1669, y: 2344, w: 408, h: 412, fx: -2, fy: 0 },
      { x: 1669, y: 2344, w: 408, h: 412, fx: -2, fy: 0 },
      { x: 1669, y: 2344, w: 408, h: 412, fx: -2, fy: 0 },
    ],
  },
  left: {
    offset: [5, -6],
    frames: [
      { x: 0, y: 988, w: 383, h: 406, fx: 0, fy: 0 },
      { x: 0, y: 988, w: 383, h: 406, fx: 0, fy: 0 },
      { x: 393, y: 988, w: 374, h: 404, fx: -11, fy: -2 },
      { x: 393, y: 988, w: 374, h: 404, fx: -11, fy: -2 },
      { x: 393, y: 988, w: 374, h: 404, fx: -11, fy: -2 },
      { x: 393, y: 988, w: 374, h: 404, fx: -11, fy: -2 },
    ],
  },
  down: {
    offset: [-10, -50],
    frames: [
      { x: 6640, y: 509, w: 374, h: 357, fx: -1, fy: -5 },
      { x: 6640, y: 509, w: 374, h: 357, fx: -1, fy: -5 },
      { x: 7024, y: 509, w: 373, h: 362, fx: 0, fy: 0 },
      { x: 7024, y: 509, w: 373, h: 362, fx: 0, fy: 0 },
      { x: 7024, y: 509, w: 373, h: 362, fx: 0, fy: 0 },
      { x: 7024, y: 509, w: 373, h: 362, fx: 0, fy: 0 },
    ],
  },
  up: {
    offset: [-29, 27],
    frames: [
      { x: 3580, y: 988, w: 369, h: 446, fx: -5, fy: 0 },
      { x: 3580, y: 988, w: 369, h: 446, fx: -5, fy: 0 },
      { x: 3959, y: 988, w: 376, h: 441, fx: 0, fy: -5 },
      { x: 3959, y: 988, w: 376, h: 441, fx: 0, fy: -5 },
      { x: 3959, y: 988, w: 376, h: 441, fx: 0, fy: -5 },
      { x: 3959, y: 988, w: 376, h: 441, fx: 0, fy: -5 },
    ],
  },
  right: {
    offset: [-48, -7],
    frames: [
      { x: 1929, y: 988, w: 408, h: 405, fx: -1, fy: -2 },
      { x: 1929, y: 988, w: 408, h: 405, fx: -1, fy: -2 },
      { x: 2347, y: 988, w: 408, h: 407, fx: 0, fy: 0 },
      { x: 2347, y: 988, w: 408, h: 407, fx: 0, fy: 0 },
      { x: 2347, y: 988, w: 408, h: 407, fx: 0, fy: 0 },
      { x: 2347, y: 988, w: 408, h: 407, fx: 0, fy: 0 },
    ],
  },
  miss: {
    offset: [-15, -19],
    frames: [
      { x: 6640, y: 509, w: 374, h: 357, fx: -1, fy: -35 },
      { x: 7407, y: 509, w: 376, h: 392, fx: -1, fy: 0 },
      { x: 7407, y: 509, w: 376, h: 392, fx: -1, fy: 0 },
      { x: 7793, y: 509, w: 378, h: 388, fx: 0, fy: -4 },
      { x: 7793, y: 509, w: 378, h: 388, fx: 0, fy: -4 },
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

// Offscreen bitmap cache for FNF arrows & receptors so Chromebook GPUs blit pre-rendered arrows in O(1)
const arrowBitmapCache: Record<string, HTMLCanvasElement> = {};

function getCachedArrowBitmap(
  size: number,
  dir: Direction,
  fillColor: string,
  isReceptor: boolean,
  isPressed: boolean,
  special: 'normal' | 'phantom',
  isMajinNoteskin: boolean
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const key = `${size}|${dir}|${fillColor}|${isReceptor ? 1 : 0}|${isPressed ? 1 : 0}|${special}|${isMajinNoteskin ? 1 : 0}`;
  if (arrowBitmapCache[key]) return arrowBitmapCache[key];

  const pad = 16;
  const dim = Math.ceil(size + pad * 2);
  const off = document.createElement('canvas');
  off.width = dim;
  off.height = dim;
  const octx = off.getContext('2d');
  if (!octx) return null;

  octx.translate(dim * 0.5, dim * 0.5);
  const rotations = [Math.PI, Math.PI / 2, -Math.PI / 2, 0];
  octx.rotate(rotations[dir]);
  const scale = isPressed ? 0.94 : 1.0;
  octx.scale(scale, scale);

  const half = size * 0.48;
  octx.lineJoin = 'round';
  octx.lineCap = 'round';

  if (isReceptor) {
    traceRoundedFnfArrowPath(octx, half);
    octx.lineWidth = size * 0.14;
    octx.strokeStyle = '#000000';
    octx.stroke();

    octx.fillStyle = isPressed
      ? RECEPTOR_PRESSED_FILL[dir]
      : isMajinNoteskin
        ? '#1E3A8A'
        : '#536270';
    octx.fill();

    octx.save();
    octx.scale(0.84, 0.84);
    traceRoundedFnfArrowPath(octx, half);
    octx.fillStyle = isPressed
      ? RECEPTOR_PRESSED_FILL[dir]
      : isMajinNoteskin
        ? '#2563EB'
        : '#697887';
    octx.fill();
    octx.restore();
  } else {
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

    traceRoundedFnfArrowPath(octx, half);
    octx.lineWidth = size * 0.15;
    octx.strokeStyle = outlineColor;
    octx.stroke();

    octx.fillStyle = '#FFFFFF';
    octx.fill();

    octx.save();
    octx.translate(-half * 0.03, 0);
    octx.scale(0.86, 0.86);
    traceRoundedFnfArrowPath(octx, half);
    octx.fillStyle = effectiveColor;
    octx.fill();
    octx.restore();
  }

  arrowBitmapCache[key] = off;
  return off;
}

// Authentic SubTexture coordinates for NOTE_assets.png, STATIC_assets.png, PhantomNote.png, and Majin_Notes.png
const NOTE_ASSETS_STATIC_RECEPTOR: Record<Direction, { x: number; y: number; w: number; h: number }> = {
  0: { x: 488, y: 238, w: 155, h: 158 }, // arrow static instance 10000 (Left)
  1: { x: 647, y: 238, w: 157, h: 155 }, // arrow static instance 20000 (Down)
  2: { x: 323, y: 240, w: 157, h: 154 }, // arrow static instance 40000 (Up)
  3: { x: 808, y: 238, w: 155, h: 157 }, // arrow static instance 30000 (Right)
};

const NOTE_ASSETS_PRESS_RECEPTOR: Record<Direction, { x: number; y: number; w: number; h: number }> = {
  0: { x: 1898, y: 150, w: 146, h: 149 }, // left press instance 10002
  1: { x: 1898, y: 0, w: 150, h: 146 },   // down press instance 10002
  2: { x: 158, y: 398, w: 154, h: 151 },  // up press instance 10002
  3: { x: 316, y: 398, w: 149, h: 152 },  // right press instance 10002
};

const NOTE_ASSETS_CONFIRM_RECEPTOR: Record<Direction, { x: number; y: number; w: number; h: number }> = {
  0: { x: 972, y: 0, w: 230, h: 232 },  // left confirm instance 10000
  1: { x: 0, y: 0, w: 240, h: 236 },    // down confirm instance 10000
  2: { x: 488, y: 0, w: 238, h: 234 },  // up confirm instance 10000
  3: { x: 1206, y: 0, w: 228, h: 231 }, // right confirm instance 10002
};

const NOTE_ASSETS_COLORED_NOTES: Record<Direction, { x: number; y: number; w: number; h: number }> = {
  0: { x: 0, y: 398, w: 154, h: 157 },   // purple instance 10000 (Left)
  1: { x: 0, y: 240, w: 158, h: 154 },   // blue instance 10000 (Down)
  2: { x: 162, y: 240, w: 157, h: 154 }, // green instance 10000 (Up)
  3: { x: 647, y: 397, w: 154, h: 157 }, // red instance 10000 (Right)
};

const NOTE_ASSETS_HOLD_PIECE: Record<Direction, { x: number; y: number; w: number; h: number }> = {
  0: { x: 1337, y: 457, w: 51, h: 44 }, // purple hold piece
  1: { x: 1282, y: 457, w: 51, h: 44 }, // blue hold piece
  2: { x: 1227, y: 457, w: 51, h: 44 }, // green hold piece
  3: { x: 1172, y: 457, w: 51, h: 44 }, // red hold piece
};

const NOTE_ASSETS_HOLD_END: Record<Direction, { x: number; y: number; w: number; h: number }> = {
  0: { x: 1117, y: 452, w: 51, h: 64 }, // pruple end hold
  1: { x: 1062, y: 452, w: 51, h: 64 }, // blue hold end
  2: { x: 1007, y: 452, w: 51, h: 64 }, // green hold end
  3: { x: 952, y: 452, w: 51, h: 64 },  // red hold end
};

const STATIC_NOTE_SUBTEXTURES: Record<Direction, { x: number; y: number; w: number; h: number }> = {
  0: { x: 5, y: 164, w: 155, h: 158 },   // purple0000 (Left)
  1: { x: 115, y: 5, w: 158, h: 155 },   // blue0000 (Down)
  2: { x: 277, y: 5, w: 158, h: 155 },   // green0000 (Up)
  3: { x: 163, y: 164, w: 155, h: 158 }, // red0000 (Right)
};

const PHANTOM_NOTE_SUBTEXTURES: Record<Direction, { x: number; y: number; w: number; h: number }> = {
  0: { x: 0, y: 193, w: 187, h: 190 },   // A0000 (Left)
  1: { x: 0, y: 0, w: 196, h: 193 },     // B0000 (Down)
  2: { x: 196, y: 0, w: 184, h: 181 },   // C0000 (Up)
  3: { x: 187, y: 193, w: 193, h: 196 }, // D0000 (Right)
};

const MAJIN_STATIC_RECEPTOR: Record<Direction, { x: number; y: number; w: number; h: number }> = {
  0: { x: 157, y: 0, w: 154, h: 157 }, // arrowLEFT0000
  1: { x: 0, y: 0, w: 157, h: 154 },   // arrowDOWN0000
  2: { x: 465, y: 0, w: 157, h: 154 }, // arrowUP0000
  3: { x: 311, y: 0, w: 154, h: 157 }, // arrowRIGHT0000
};

const MAJIN_PRESS_RECEPTOR: Record<Direction, { x: number; y: number; w: number; h: number }> = {
  0: { x: 930, y: 235, w: 146, h: 149 },  // left press0002
  1: { x: 1742, y: 0, w: 149, h: 146 },   // down press0002
  2: { x: 1383, y: 466, w: 153, h: 150 }, // up press0002
  3: { x: 374, y: 466, w: 148, h: 151 },  // right press0002
};

const MAJIN_CONFIRM_RECEPTOR: Record<Direction, { x: number; y: number; w: number; h: number }> = {
  0: { x: 100, y: 235, w: 228, h: 231 },  // left confirm0000
  1: { x: 879, y: 0, w: 238, h: 235 },    // down confirm0000
  2: { x: 522, y: 466, w: 236, h: 232 },  // up confirm0000
  3: { x: 1584, y: 235, w: 226, h: 230 }, // right confirm0000
};

const MAJIN_COLORED_NOTES: Record<Direction, { x: number; y: number; w: number; h: number }> = {
  0: { x: 1126, y: 235, w: 154, h: 157 }, // purple0000
  1: { x: 622, y: 0, w: 157, h: 154 },    // blue0000
  2: { x: 1891, y: 0, w: 157, h: 154 },   // green0000
  3: { x: 1330, y: 235, w: 154, h: 157 }, // red0000
};

export function drawFnfSustainTail(
  ctx: CanvasRenderingContext2D,
  x: number,
  startY: number,
  endY: number,
  dir: Direction,
  downscroll: boolean,
  isMajinNoteskin = false,
  isAntiLag = false,
  isPixelNoteskin = false
) {
  const dist = downscroll ? startY - endY : endY - startY;
  if (dist <= 4) return;

  if (isPixelNoteskin) {
    const pixelEnds = getSpriteSheet('/sprites/arrowEndsNew.png');
    if (pixelEnds) {
      const tailW = 42;
      const capH = Math.min(dist, 30);
      const bodyH = Math.max(0, dist - capH);
      const pieceX = dir * 18;
      const capX = dir * 18 + 9;
      ctx.save();
      const prevSmooth = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = isAntiLag ? 0.88 : 0.78;
      if (downscroll) {
        if (bodyH > 0) {
          ctx.drawImage(
            pixelEnds,
            pieceX,
            0,
            9,
            6,
            x - tailW * 0.5,
            endY + capH,
            tailW,
            bodyH
          );
        }
        ctx.translate(x, endY + capH * 0.5);
        ctx.scale(1, -1);
        ctx.drawImage(
          pixelEnds,
          capX,
          0,
          9,
          6,
          -tailW * 0.5,
          -capH * 0.5,
          tailW,
          capH
        );
      } else {
        if (bodyH > 0) {
          ctx.drawImage(
            pixelEnds,
            pieceX,
            0,
            9,
            6,
            x - tailW * 0.5,
            startY,
            tailW,
            bodyH
          );
        }
        ctx.drawImage(
          pixelEnds,
          capX,
          0,
          9,
          6,
          x - tailW * 0.5,
          endY - capH,
          tailW,
          capH
        );
      }
      ctx.imageSmoothingEnabled = prevSmooth;
      ctx.restore();
      return;
    }
  }

  const noteSheet = getSpriteSheet('/sprites/NOTE_assets.png');
  if (noteSheet && !isMajinNoteskin) {
    const piece = NOTE_ASSETS_HOLD_PIECE[dir];
    const endCap = NOTE_ASSETS_HOLD_END[dir];
    const tailW = 34;
    const capH = Math.min(dist, 42);
    const bodyH = Math.max(0, dist - capH);

    ctx.save();
    ctx.globalAlpha = isAntiLag ? 0.85 : 0.72;
    if (downscroll) {
      if (bodyH > 0) {
        ctx.drawImage(
          noteSheet,
          piece.x,
          piece.y,
          piece.w,
          piece.h,
          x - tailW * 0.5,
          endY + capH,
          tailW,
          bodyH
        );
      }
      ctx.translate(x, endY + capH * 0.5);
      ctx.scale(1, -1);
      ctx.drawImage(
        noteSheet,
        endCap.x,
        endCap.y,
        endCap.w,
        endCap.h,
        -tailW * 0.5,
        -capH * 0.5,
        tailW,
        capH
      );
    } else {
      if (bodyH > 0) {
        ctx.drawImage(
          noteSheet,
          piece.x,
          piece.y,
          piece.w,
          piece.h,
          x - tailW * 0.5,
          startY,
          tailW,
          bodyH
        );
      }
      ctx.drawImage(
        noteSheet,
        endCap.x,
        endCap.y,
        endCap.w,
        endCap.h,
        x - tailW * 0.5,
        endY - capH,
        tailW,
        capH
      );
    }
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.strokeStyle = isMajinNoteskin ? '#60A5FA' : LANE_COLORS[dir];
  if (!isAntiLag) {
    ctx.globalAlpha = 0.75;
    ctx.lineCap = 'round';
  }
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.moveTo(x, startY);
  ctx.lineTo(x, endY);
  ctx.stroke();
  ctx.restore();
}

function drawNoteSubTextureDirect(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  drawW: number,
  drawH: number,
  pixelated = false
) {
  const prevSmooth = ctx.imageSmoothingEnabled;
  if (pixelated) {
    ctx.imageSmoothingEnabled = false;
  }
  ctx.drawImage(
    sheet,
    sx,
    sy,
    sw,
    sh,
    -drawW * 0.5,
    -drawH * 0.5,
    drawW,
    drawH
  );
  if (pixelated) {
    ctx.imageSmoothingEnabled = prevSmooth;
  }
}

// Universal FNF Arrow Target, Scrolling Note, Static Note, Phantom Note & Ring Note Renderer
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
  isMajinNoteskin = false,
  isConfirm = false,
  isPixelNoteskin = false
) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.translate(x, y);
  if (extraSpinRad !== 0) {
    ctx.rotate(extraSpinRad);
  }

  // 0. 16-Bit Pixel Noteskin (You Can't Run Genesis Section: arrows-pixels.png & pixel static warning note)
  if (isPixelNoteskin) {
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;

    if (!isReceptor && special === 'static') {
      // Iconic 16-bit pink/magenta pixel warning diamond/badge with '!' from YCR pixel section
      const p = Math.round(size / 17);
      const halfGrid = 7;
      for (let gy = -halfGrid; gy <= halfGrid; gy++) {
        for (let gx = -halfGrid; gx <= halfGrid; gx++) {
          const manhattan = Math.abs(gx) + Math.abs(gy);
          if (manhattan > 9 || Math.abs(gx) > 6 || Math.abs(gy) > 6) continue;
          const isBorder =
            manhattan >= 8 || Math.abs(gx) === 6 || Math.abs(gy) === 6;
          ctx.fillStyle = isBorder
            ? gy < 0
              ? '#F472B6'
              : '#BE185D'
            : '#831843';
          ctx.fillRect(gx * p, gy * p, p, p);
        }
      }
      // Bright yellow/white pixel '!' exclamation mark in center
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(-p, -4 * p, p * 2, p * 5);
      ctx.fillRect(-p, 2 * p, p * 2, p * 2);
      ctx.imageSmoothingEnabled = prevSmooth;
      ctx.restore();
      return;
    }

    const pixelArrows = getSpriteSheet('/sprites/arrows-pixels.png');
    if (pixelArrows && (isReceptor || special === 'normal')) {
      const sx = dir * 17;
      const sy = isReceptor
        ? isConfirm
          ? Math.floor(performance.now() / 65) % 2 === 0
            ? 51
            : 68
          : isPressed
            ? 34
            : 0
        : 17;
      const drawDim = Math.round(size * 0.96);
      drawNoteSubTextureDirect(
        ctx,
        pixelArrows,
        sx,
        sy,
        17,
        17,
        drawDim,
        drawDim,
        true
      );
      ctx.imageSmoothingEnabled = prevSmooth;
      ctx.restore();
      return;
    }
    ctx.imageSmoothingEnabled = prevSmooth;
  }

  // 1. Ring Note (EXE) from shared/images/notekinds/ringnote/ring.png + ring.xml
  if (special === 'ring') {
    const ringSheet = getSpriteSheet('/sprites/RingNote.png');
    if (ringSheet) {
      if (isReceptor) {
        const sub = isConfirm
          ? { x: 0, y: 0, w: 224, h: 229 } // space confirm0000
          : isPressed
            ? { x: 0, y: 229, w: 158, h: 159 } // space press0002
            : { x: 158, y: 229, w: 149, h: 150 }; // arrowSPACE0000
        const mult = isConfirm ? 1.42 : isPressed ? 0.96 : 1.0;
        const baseRef = isConfirm ? 226 : isPressed ? 158 : 150;
        const drawW = size * mult * (sub.w / baseRef);
        const drawH = size * mult * (sub.h / baseRef);
        drawNoteSubTextureDirect(
          ctx,
          ringSheet,
          sub.x,
          sub.y,
          sub.w,
          sub.h,
          drawW,
          drawH
        );
      } else {
        const drawSize = size * 0.96;
        // green0000 / red0000 / purple0000 / blue0000 at (424, 0, 149, 150)
        drawNoteSubTextureDirect(
          ctx,
          ringSheet,
          424,
          0,
          149,
          150,
          drawSize,
          drawSize
        );
      }
      ctx.restore();
      return;
    }
  }

  // 2. Static Note (EXE) from STATIC_assets.png (notekinds/staticnote/STATIC_assets)
  if (!isReceptor && special === 'static') {
    const staticSheet = getSpriteSheet('/sprites/STATIC_assets.png');
    if (staticSheet) {
      const sub = STATIC_NOTE_SUBTEXTURES[dir];
      const drawW = size * (sub.w / 156);
      const drawH = size * (sub.h / 156);
      drawNoteSubTextureDirect(
        ctx,
        staticSheet,
        sub.x,
        sub.y,
        sub.w,
        sub.h,
        drawW,
        drawH
      );
      ctx.restore();
      return;
    }
  }

  // 3. Phantom Note (EXE) from PhantomNote.png (notekinds/phantomnote/PhantomNote)
  if (!isReceptor && special === 'phantom') {
    const phantomSheet = getSpriteSheet('/sprites/PhantomNote.png');
    if (phantomSheet) {
      const sub = PHANTOM_NOTE_SUBTEXTURES[dir];
      const drawW = size * 1.12 * (sub.w / 190);
      const drawH = size * 1.12 * (sub.h / 190);
      drawNoteSubTextureDirect(
        ctx,
        phantomSheet,
        sub.x,
        sub.y,
        sub.w,
        sub.h,
        drawW,
        drawH
      );
      ctx.restore();
      return;
    }
  }

  // 4. Majin Noteskin (Endless NoteSwapEvent) from Majin_Notes.png
  if (isMajinNoteskin) {
    const majinSheet = getSpriteSheet('/sprites/Majin_Notes.png');
    if (majinSheet) {
      const sub = isReceptor
        ? isConfirm
          ? MAJIN_CONFIRM_RECEPTOR[dir]
          : isPressed
            ? MAJIN_PRESS_RECEPTOR[dir]
            : MAJIN_STATIC_RECEPTOR[dir]
        : MAJIN_COLORED_NOTES[dir];
      const mult = isReceptor && isConfirm ? 1.42 : isReceptor && isPressed ? 0.95 : 1.0;
      const drawW = size * mult * (sub.w / (isReceptor && isConfirm ? 232 : 156));
      const drawH = size * mult * (sub.h / (isReceptor && isConfirm ? 232 : 156));
      drawNoteSubTextureDirect(
        ctx,
        majinSheet,
        sub.x,
        sub.y,
        sub.w,
        sub.h,
        drawW,
        drawH
      );
      ctx.restore();
      return;
    }
  }

  // 5. Universal FNF Arrow Targets & Colored Notes from NOTE_assets.png
  const noteSheet = getSpriteSheet('/sprites/NOTE_assets.png');
  if (noteSheet) {
    const sub = isReceptor
      ? isConfirm
        ? NOTE_ASSETS_CONFIRM_RECEPTOR[dir]
        : isPressed
          ? NOTE_ASSETS_PRESS_RECEPTOR[dir]
          : NOTE_ASSETS_STATIC_RECEPTOR[dir]
      : NOTE_ASSETS_COLORED_NOTES[dir];
    const mult = isReceptor && isConfirm ? 1.44 : isReceptor && isPressed ? 0.95 : 1.0;
    const baseRef = isReceptor && isConfirm ? 234 : isReceptor && isPressed ? 149 : 156;
    const drawW = size * mult * (sub.w / baseRef);
    const drawH = size * mult * (sub.h / baseRef);
    drawNoteSubTextureDirect(
      ctx,
      noteSheet,
      sub.x,
      sub.y,
      sub.w,
      sub.h,
      drawW,
      drawH
    );
    ctx.restore();
    return;
  }

  const rotations = [Math.PI, Math.PI / 2, -Math.PI / 2, 0];
  ctx.rotate(rotations[dir]);

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

let cachedMajinBopperBack: HTMLCanvasElement | null = null;
let cachedMajinBopperFront: HTMLCanvasElement | null = null;

function getMajinBopperBitmap(isForeground: boolean): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (isForeground && cachedMajinBopperFront) return cachedMajinBopperFront;
  if (!isForeground && cachedMajinBopperBack) return cachedMajinBopperBack;

  const c = document.createElement('canvas');
  c.width = 120;
  c.height = 170;
  const ctx = c.getContext('2d');
  if (!ctx) return null;

  ctx.translate(68, 92);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

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

  if (isForeground) cachedMajinBopperFront = c;
  else cachedMajinBopperBack = c;
  return c;
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
    const bmp = getMajinBopperBitmap(isForeground);
    if (!bmp) return;
    ctx.save();
    ctx.translate(bx, by);
    if (flipX) ctx.scale(-scale, scale);
    else ctx.scale(scale, scale);
    ctx.drawImage(bmp, -68, -92);
    ctx.restore();
  };

  if (layer === 'back') {
    const backPositions = [165, 355, 640, 925, 1115];
    for (let idx = 0; idx < backPositions.length; idx++) {
      const parallaxX = backPositions[idx] - cameraOffsetX * 0.45;
      const by = h * 0.56 + (idx % 2 === 0 ? bopY : bopY * 0.7);
      drawSculptedMajinBopper(parallaxX, by, 0.92, false, idx >= 3);
    }
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
}

let cachedPixelSkyAndMoon: HTMLCanvasElement | null = null;
let cachedPixelCheckerGround: HTMLCanvasElement | null = null;

// Draw 16-bit Sega Genesis Green Hill Zone pixel stage for You Can't Run's iconic mid-song switch
export function drawPixelGenesisStage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeMs: number
) {
  const greenHillImg = getSpriteSheet('/sprites/GreenHill.png');
  if (greenHillImg) {
    ctx.save();
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(greenHillImg, 0, 0, w, h);
    ctx.imageSmoothingEnabled = prevSmooth;
    ctx.restore();
    return;
  }

  ctx.save();
  const groundY = Math.floor(h * 0.72);

  if (typeof document !== 'undefined') {
    if (!cachedPixelSkyAndMoon) {
      const skyCanv = document.createElement('canvas');
      skyCanv.width = w;
      skyCanv.height = h;
      const sctx = skyCanv.getContext('2d')!;
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
        sctx.fillStyle = col;
        sctx.fillRect(0, idx * bandH, w, bandH + 2);
      });
      sctx.fillStyle = '#EF4444';
      sctx.fillRect(Math.floor(w * 0.5 - 44), 56, 88, 88);
      sctx.fillStyle = '#FCA5A5';
      sctx.fillRect(Math.floor(w * 0.5 - 32), 68, 64, 64);
      cachedPixelSkyAndMoon = skyCanv;
    }

    if (!cachedPixelCheckerGround) {
      const gCanv = document.createElement('canvas');
      gCanv.width = w;
      gCanv.height = h;
      const gctx = gCanv.getContext('2d')!;
      const tileSize = 28;
      for (let y = groundY; y < h; y += tileSize) {
        for (let x = 0; x < w; x += tileSize) {
          const col = Math.floor(x / tileSize);
          const row = Math.floor((y - groundY) / tileSize);
          const isLight = (col + row) % 2 === 0;
          gctx.fillStyle = isLight ? '#6E351B' : '#3D1A0B';
          gctx.fillRect(x, y, tileSize, tileSize);
          gctx.fillStyle = isLight ? '#8C4625' : '#4F2310';
          gctx.fillRect(x + 2, y + 2, tileSize - 6, 4);
          gctx.fillRect(x + 2, y + 2, 4, tileSize - 6);
        }
      }
      gctx.fillStyle = '#EF4444';
      gctx.fillRect(0, groundY - 16, w, 6);
      gctx.fillStyle = '#DC2626';
      gctx.fillRect(0, groundY - 10, w, 10);
      gctx.fillStyle = '#991B1B';
      for (let x = 0; x < w; x += 24) {
        gctx.fillRect(x, groundY, 14, 10);
        gctx.fillRect(x + 4, groundY + 10, 6, 6);
      }
      cachedPixelCheckerGround = gCanv;
    }
  }

  if (cachedPixelSkyAndMoon) {
    ctx.drawImage(cachedPixelSkyAndMoon, 0, 0, w, h);
  }

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
    ctx.fillRect(x - 6, h * 0.72 - 18, 60, 6);
  }

  if (cachedPixelCheckerGround) {
    ctx.drawImage(cachedPixelCheckerGround, 0, 0, w, h);
  }

  ctx.restore();
}

// Draw High-Definition Girlfriend on the FNF Speaker Box bopping to the BPM
// Applied to every song except Endless and Endless OG!
export function drawSpeakerGirlfriend(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bpm: number,
  timeMs: number,
  stageTheme: StageThemeId,
  _isEncore = false
) {
  const beatPeriod = 60000 / bpm;

  const gfSpeakerSheet = getSpriteSheet('/sprites/Main2GF.png');
  if (gfSpeakerSheet) {
    ctx.save();
    ctx.translate(cx, cy);

    // Ground shadow under Speaker Box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 46, 148, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // danceEvery = 1 beat: even beats play danceLeft (frames 0..14), odd beats play danceRight (frames 15..29) at 24fps
    const beatCount = Math.floor(Math.max(0, timeMs) / beatPeriod);
    const beatLocalMs = Math.max(0, timeMs) % beatPeriod;
    const isDanceRight = beatCount % 2 === 1;
    const frames = isDanceRight
      ? GF_SPEAKER_DANCE_RIGHT_FRAMES
      : GF_SPEAKER_DANCE_LEFT_FRAMES;
    const frameIdx = Math.min(
      frames.length - 1,
      Math.floor(beatLocalMs / (1000 / 24))
    );
    const f = frames[frameIdx];

    // Full 703x648 GF + Speaker Box frame scaled to our 1280x720 logical stage coordinates
    const scale = 0.42;
    const drawW = f.w * scale;
    const drawH = f.h * scale;
    const drawX = (-351.5 - f.fx) * scale;
    const drawY = 52 - (648 + f.fy) * scale;

    drawCharSubTexture(
      ctx,
      gfSpeakerSheet,
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
    // Scale matched to video framing alongside GF (0.42) and Boyfriend (0.44)
    const scale = 0.405;

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

      drawCharSubTexture(
        ctx,
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
      // Authentic 24fps 11-frame idle animation restarted on every beat (danceEvery = 1)
      const beatLocalMs = ((timeMs % beatPeriod) + beatPeriod) % beatPeriod;
      frameIdx = Math.min(
        anim.frames.length - 1,
        Math.floor(beatLocalMs / (1000 / 24))
      );
    } else {
      const rawFrame = Math.floor(elapsedPoseMs / (1000 / 24));
      frameIdx = Math.min(anim.frames.length - 1, rawFrame);
    }

    const f = anim.frames[frameIdx];

    // Exact V-Slice / Psych Engine Sparrow v2 coordinates and offsets from sonicexe.json
    const drawW = f.w * scale;
    const drawH = f.h * scale;
    const drawX = (-279 - anim.offset[0] - f.fx) * scale;
    const drawY = 82 - (748 + anim.offset[1] + f.fy) * scale;

    drawCharSubTexture(
      ctx,
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
    ctx.beginPath();
    ctx.arc(0, -12, 3.8, 0, Math.PI * 2);
    ctx.arc(20, -16, 3.8, 0, Math.PI * 2);
    ctx.fill();

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
    ctx.beginPath();
    ctx.ellipse(4, -2, 4.5, 3, 0.2, 0, Math.PI * 2);
    ctx.ellipse(20, 0, 4, 2.8, -0.2, 0, Math.PI * 2);
    ctx.fill();

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
    ctx.beginPath();
    ctx.arc(14, -8, 4.2, 0, Math.PI * 2);
    ctx.fill();

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
    ctx.beginPath();
    ctx.arc(14, -4, 3.5, 0, Math.PI * 2);
    ctx.fill();

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

const XENOPHANES_BEAST_ANIMS = {
  idle: { offset: [0, 0], frames: [{ x: 2456, y: 0, w: 541, h: 914, fx: -18, fy: -23 }, { x: 2456, y: 0, w: 541, h: 914, fx: -18, fy: -23 }, { x: 2997, y: 0, w: 537, h: 909, fx: -18, fy: -28 }, { x: 2997, y: 0, w: 537, h: 909, fx: -18, fy: -28 }, { x: 3534, y: 0, w: 535, h: 914, fx: -17, fy: -24 }, { x: 3534, y: 0, w: 535, h: 914, fx: -17, fy: -24 }, { x: 4069, y: 0, w: 534, h: 918, fx: -15, fy: -20 }, { x: 4069, y: 0, w: 534, h: 918, fx: -15, fy: -20 }, { x: 4603, y: 0, w: 547, h: 922, fx: 0, fy: -17 }, { x: 4603, y: 0, w: 547, h: 922, fx: 0, fy: -17 }, { x: 5150, y: 0, w: 538, h: 939, fx: -7, fy: 0 }, { x: 5150, y: 0, w: 538, h: 939, fx: -7, fy: 0 }, { x: 5688, y: 0, w: 540, h: 940, fx: -5, fy: 0 }, { x: 5688, y: 0, w: 540, h: 940, fx: -5, fy: 0 }, { x: 6228, y: 0, w: 540, h: 940, fx: -5, fy: 0 }, { x: 6228, y: 0, w: 540, h: 940, fx: -5, fy: 0 }] },
  left: { offset: [180, -95], frames: [{ x: 1057, y: 940, w: 865, h: 852, fx: 0, fy: -1 }, { x: 1057, y: 940, w: 865, h: 852, fx: 0, fy: -1 }, { x: 1922, y: 940, w: 851, h: 853, fx: -25, fy: 0 }, { x: 1922, y: 940, w: 851, h: 853, fx: -25, fy: 0 }, { x: 2773, y: 940, w: 815, h: 828, fx: -101, fy: -25 }, { x: 2773, y: 940, w: 815, h: 828, fx: -101, fy: -25 }, { x: 3588, y: 940, w: 836, h: 838, fx: -80, fy: -15 }, { x: 3588, y: 940, w: 836, h: 838, fx: -80, fy: -15 }] },
  down: { offset: [20, -95], frames: [{ x: 0, y: 0, w: 615, h: 802, fx: 0, fy: -49 }, { x: 0, y: 0, w: 615, h: 802, fx: 0, fy: -49 }, { x: 615, y: 0, w: 615, h: 854, fx: 0, fy: 0 }, { x: 615, y: 0, w: 615, h: 854, fx: 0, fy: 0 }, { x: 1230, y: 0, w: 615, h: 839, fx: 0, fy: -14 }, { x: 1230, y: 0, w: 615, h: 839, fx: 0, fy: -14 }, { x: 1845, y: 0, w: 611, h: 840, fx: -4, fy: -14 }, { x: 1845, y: 0, w: 611, h: 840, fx: -4, fy: -14 }] },
  up: { offset: [50, 80], frames: [{ x: 7391, y: 940, w: 625, h: 1020, fx: 0, fy: 0 }, { x: 7391, y: 940, w: 625, h: 1020, fx: 0, fy: 0 }, { x: 0, y: 1960, w: 625, h: 1006, fx: 0, fy: -13 }, { x: 0, y: 1960, w: 625, h: 1006, fx: 0, fy: -13 }, { x: 625, y: 1960, w: 625, h: 961, fx: 0, fy: -55 }, { x: 625, y: 1960, w: 625, h: 961, fx: 0, fy: -55 }, { x: 1250, y: 1960, w: 625, h: 968, fx: 0, fy: -47 }, { x: 1250, y: 1960, w: 625, h: 968, fx: 0, fy: -47 }] },
  right: { offset: [-160, -60], frames: [{ x: 4424, y: 940, w: 753, h: 872, fx: -3, fy: -5 }, { x: 4424, y: 940, w: 753, h: 872, fx: -3, fy: -5 }, { x: 5177, y: 940, w: 748, h: 874, fx: -2, fy: -3 }, { x: 5177, y: 940, w: 748, h: 874, fx: -2, fy: -3 }, { x: 5925, y: 940, w: 733, h: 871, fx: 0, fy: -6 }, { x: 5925, y: 940, w: 733, h: 871, fx: 0, fy: -6 }, { x: 6658, y: 940, w: 733, h: 877, fx: 0, fy: 0 }, { x: 6658, y: 940, w: 733, h: 877, fx: 0, fy: 0 }] },
  laugh: { offset: [-120, -225], frames: [{ x: 6768, y: 0, w: 567, h: 724, fx: 0, fy: 0 }, { x: 6768, y: 0, w: 567, h: 724, fx: 0, fy: 0 }, { x: 7335, y: 0, w: 547, h: 708, fx: -1, fy: -16 }, { x: 7335, y: 0, w: 547, h: 708, fx: -1, fy: -16 }, { x: 0, y: 940, w: 522, h: 690, fx: -3, fy: -34 }, { x: 0, y: 940, w: 522, h: 690, fx: -3, fy: -34 }, { x: 522, y: 940, w: 535, h: 704, fx: -3, fy: -20 }, { x: 522, y: 940, w: 535, h: 704, fx: -3, fy: -20 }] },
} as const;

const BF_PERSPECTIVE_ANIMS = {
  idle: { offset: [-5, -20], frames: [{ x: 4716, y: 494, w: 514, h: 493, fx: 0, fy: 0 }, { x: 5230, y: 494, w: 514, h: 493, fx: 0, fy: 0 }, { x: 5744, y: 494, w: 514, h: 493, fx: 0, fy: 0 }, { x: 6258, y: 494, w: 514, h: 493, fx: 0, fy: 0 }, { x: 6772, y: 494, w: 514, h: 493, fx: 0, fy: 0 }, { x: 7286, y: 494, w: 514, h: 493, fx: 0, fy: 0 }, { x: 0, y: 988, w: 514, h: 493, fx: 0, fy: 0 }, { x: 514, y: 988, w: 514, h: 493, fx: 0, fy: 0 }, { x: 1028, y: 988, w: 514, h: 493, fx: 0, fy: 0 }, { x: 1542, y: 988, w: 514, h: 493, fx: 0, fy: 0 }, { x: 2056, y: 988, w: 514, h: 493, fx: 0, fy: 0 }, { x: 2570, y: 988, w: 514, h: 493, fx: 0, fy: 0 }, { x: 3084, y: 988, w: 514, h: 493, fx: 0, fy: 0 }, { x: 3598, y: 988, w: 514, h: 493, fx: 0, fy: 0 }] },
  left: { offset: [48, -28], frames: [{ x: 996, y: 3785, w: 487, h: 484, fx: 0, fy: 0 }, { x: 1483, y: 3785, w: 487, h: 484, fx: 0, fy: 0 }, { x: 1970, y: 3785, w: 487, h: 484, fx: 0, fy: 0 }, { x: 2457, y: 3785, w: 487, h: 484, fx: 0, fy: 0 }, { x: 2944, y: 3785, w: 487, h: 484, fx: 0, fy: 0 }, { x: 3431, y: 3785, w: 487, h: 484, fx: 0, fy: 0 }, { x: 3918, y: 3785, w: 487, h: 484, fx: 0, fy: 0 }, { x: 4405, y: 3785, w: 487, h: 484, fx: 0, fy: 0 }] },
  down: { offset: [30, -33], frames: [{ x: 4770, y: 2714, w: 498, h: 479, fx: 0, fy: 0 }, { x: 5268, y: 2714, w: 498, h: 479, fx: 0, fy: 0 }, { x: 5766, y: 2714, w: 498, h: 479, fx: 0, fy: 0 }, { x: 6264, y: 2714, w: 498, h: 479, fx: 0, fy: 0 }, { x: 6762, y: 2714, w: 498, h: 479, fx: 0, fy: 0 }, { x: 7260, y: 2714, w: 498, h: 479, fx: 0, fy: 0 }, { x: 0, y: 3306, w: 498, h: 479, fx: 0, fy: 0 }, { x: 498, y: 3306, w: 498, h: 479, fx: 0, fy: 0 }] },
  up: { offset: [-69, 37], frames: [{ x: 1569, y: 5283, w: 461, h: 552, fx: 0, fy: 0 }, { x: 2030, y: 5283, w: 461, h: 552, fx: 0, fy: 0 }, { x: 2491, y: 5283, w: 461, h: 552, fx: 0, fy: 0 }, { x: 2952, y: 5283, w: 461, h: 552, fx: 0, fy: 0 }, { x: 3413, y: 5283, w: 461, h: 552, fx: 0, fy: 0 }, { x: 3874, y: 5283, w: 461, h: 552, fx: 0, fy: 0 }, { x: 4335, y: 5283, w: 461, h: 552, fx: 0, fy: 0 }, { x: 4796, y: 5283, w: 461, h: 552, fx: 0, fy: 0 }] },
  right: { offset: [-23, -5], frames: [{ x: 4870, y: 4269, w: 523, h: 507, fx: 0, fy: 0 }, { x: 5393, y: 4269, w: 523, h: 507, fx: 0, fy: 0 }, { x: 5916, y: 4269, w: 523, h: 507, fx: 0, fy: 0 }, { x: 6439, y: 4269, w: 523, h: 507, fx: 0, fy: 0 }, { x: 6962, y: 4269, w: 523, h: 507, fx: 0, fy: 0 }, { x: 7485, y: 4269, w: 523, h: 507, fx: 0, fy: 0 }, { x: 0, y: 4776, w: 523, h: 507, fx: 0, fy: 0 }, { x: 523, y: 4776, w: 523, h: 507, fx: 0, fy: 0 }] },
  miss: { offset: [35, -19], frames: [{ x: 0, y: 0, w: 524, h: 494, fx: 0, fy: 0 }, { x: 524, y: 0, w: 524, h: 494, fx: 0, fy: 0 }, { x: 1048, y: 0, w: 524, h: 494, fx: 0, fy: 0 }, { x: 1572, y: 0, w: 524, h: 494, fx: 0, fy: 0 }, { x: 2096, y: 0, w: 524, h: 494, fx: 0, fy: 0 }, { x: 2620, y: 0, w: 524, h: 494, fx: 0, fy: 0 }, { x: 3144, y: 0, w: 524, h: 494, fx: 0, fy: 0 }, { x: 3668, y: 0, w: 524, h: 494, fx: 0, fy: 0 }] },
} as const;

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

      drawCharSubTexture(ctx, tailsSheet, f.x, f.y, f.w, f.h, drawX, drawY, drawW, drawH);
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

      drawCharSubTexture(ctx, knuxSheet, f.x, f.y, f.w, f.h, drawX, drawY, drawW, drawH);
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

      drawCharSubTexture(ctx, eggSheet, f.x, f.y, f.w, f.h, drawX, drawY, drawW, drawH);
      ctx.restore();
      return;
    }
  }

  // 4. Endless (OG): Majin Sonic Variation 2 (majin_new.json: assetPath "characters/MajinOG", scale 1.4, 32fps sing / 24fps idle)
  if (character === 'majin-og') {
    const majinOgSheet = getSpriteSheet('/sprites/MajinOG.png');
    if (majinOgSheet) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 82, 74, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' =
        pose === 'left' || pose === 'down' || pose === 'up' || pose === 'right'
          ? pose
          : 'idle';
      const anim = MAJIN_OG_ANIMS[animKey];
      const frameIdx =
        animKey === 'idle'
          ? Math.floor(beatPhase * anim.frames.length) % anim.frames.length
          : Math.min(
              anim.frames.length - 1,
              Math.floor(elapsedPoseMs / (1000 / anim.fps))
            );
      const f = anim.frames[frameIdx];

      const headBounce =
        animKey === 'idle'
          ? Math.sin(beatPhase * Math.PI) * 6
          : Math.sin(elapsedPoseMs * 0.055) * Math.exp(-elapsedPoseMs * 0.0045) * 9;
      const moveIn = animKey === 'idle' ? 1 : Math.min(1, elapsedPoseMs / 85);
      const easeOut = 1 - Math.pow(1 - moveIn, 3);
      const slideX =
        animKey === 'left'
          ? 24 * (1 - easeOut)
          : animKey === 'right'
            ? -24 * (1 - easeOut)
            : 0;
      const slideY =
        animKey === 'up'
          ? 20 * (1 - easeOut)
          : animKey === 'down'
            ? -16 * (1 - easeOut)
            : 0;

      // Scale 1.4 from majin_new.json with exact Psych Engine foot-anchored offsets
      const scale = 0.36 * 1.4;
      const drawW = f.w * scale;
      const drawH = f.h * scale;
      const drawX = (-178 - anim.offset[0]) * scale + slideX;
      const drawY =
        82 - (440 + anim.offset[1]) * scale + slideY + headBounce * 0.45;

      drawCharSubTexture(ctx, majinOgSheet, f.x, f.y, f.w, f.h, drawX, drawY, drawW, drawH);
      ctx.restore();
      return;
    }
  }

  // 5. Endless: Majin Sonic Variation 1 (majin.json: assetPath "characters/SonicFunAssets", scale 1.0, 24fps)
  if (character === 'majin') {
    const sonicFunSheet = getSpriteSheet('/sprites/SonicFunAssets.png');
    if (sonicFunSheet) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 82, 70, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' =
        pose === 'left' || pose === 'down' || pose === 'up' || pose === 'right'
          ? pose
          : 'idle';
      const anim = SONIC_FUN_ANIMS[animKey];
      const frameIdx =
        animKey === 'idle'
          ? Math.floor(beatPhase * anim.frames.length) % anim.frames.length
          : Math.min(
              anim.frames.length - 1,
              Math.floor(elapsedPoseMs / (1000 / anim.fps))
            );
      const f = anim.frames[frameIdx];

      const headBounce =
        animKey === 'idle'
          ? Math.sin(beatPhase * Math.PI) * 6
          : Math.sin(elapsedPoseMs * 0.055) * Math.exp(-elapsedPoseMs * 0.0045) * 9;
      const moveIn = animKey === 'idle' ? 1 : Math.min(1, elapsedPoseMs / 85);
      const easeOut = 1 - Math.pow(1 - moveIn, 3);
      const slideX =
        animKey === 'left'
          ? 24 * (1 - easeOut)
          : animKey === 'right'
            ? -24 * (1 - easeOut)
            : 0;
      const slideY =
        animKey === 'up'
          ? 20 * (1 - easeOut)
          : animKey === 'down'
            ? -16 * (1 - easeOut)
            : 0;

      // Exact Psych Engine foot-anchored offsets for SonicFunAssets (bot - off_y = 494, cx - off_x = 258)
      const scale = 0.36;
      const drawW = f.w * scale;
      const drawH = f.h * scale;
      const drawX = (-258 - anim.offset[0]) * scale + slideX;
      const drawY =
        82 - (494 + anim.offset[1]) * scale + slideY + headBounce * 0.45;

      drawCharSubTexture(ctx, sonicFunSheet, f.x, f.y, f.w, f.h, drawX, drawY, drawW, drawH);
      ctx.restore();
      return;
    }
  }

  // Use the authentic Sonic_FakerForm.png sprite sheet for Fake Sonic (sonicexefake) in Too Slow Encore!
  if (character === 'sonicexefake') {
    const fakerSheet = getSpriteSheet('/sprites/Sonic_FakerForm.png');
    if (fakerSheet) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 82, 64, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' | 'revealed' =
        pose === 'gotcha' || pose === 'laugh'
          ? 'revealed'
          : pose === 'left' || pose === 'down' || pose === 'up' || pose === 'right'
            ? pose
            : 'idle';
      const anim = SONIC_FAKER_ANIMS[animKey];
      const beatLocalMs = ((timeMs % beatPeriod) + beatPeriod) % beatPeriod;
      const frameIdx =
        animKey === 'idle'
          ? Math.min(
              anim.frames.length - 1,
              Math.floor(beatLocalMs / (1000 / anim.fps))
            )
          : Math.min(
              anim.frames.length - 1,
              Math.floor(elapsedPoseMs / (1000 / anim.fps))
            );
      const f = anim.frames[frameIdx];

      // Exact V-Slice / Psych Engine Sparrow v2 foot-locked coordinates from sonicexefake.json
      const scale = 0.36;
      const drawW = f.w * scale;
      const drawH = f.h * scale;
      const drawX = (-82.5 - anim.offset[0] - f.fx) * scale;
      const drawY = 82 - (508 + anim.offset[1] + f.fy) * scale;

      // About 0.20s before the screen goes dark at 42667ms (42467ms..42667ms),
      // animate ONLY Fake Sonic's head twisting backwards toward you while his body stays frozen!
      const headTwistWindowMs =
        animKey === 'revealed'
          ? timeMs >= 42457 && timeMs <= 42680
            ? timeMs - 42457
            : elapsedPoseMs >= 1124
              ? elapsedPoseMs - 1124
              : -1
          : -1;

      if (headTwistWindowMs >= 0) {
        const t = Math.min(1, Math.max(0, headTwistWindowMs / 185));
        // Smooth stepped horror snap curve
        const snapEase =
          t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) * 0.5;
        const headSrcH = 260;
        const bodySrcH = f.h - headSrcH;
        const headDrawH = headSrcH * scale;
        const bodyDrawH = bodySrcH * scale;
        const micCapSrcW = 102;
        const micCapSrcY = 244;
        const micCapSrcH = headSrcH - micCapSrcY;

        // 1. Draw the stationary lower body (from neck y=260 down to shoes) completely still
        drawCharSubTexture(
          ctx,
          fakerSheet,
          f.x,
          f.y + headSrcH,
          f.w,
          bodySrcH,
          drawX,
          drawY + headDrawH,
          drawW,
          bodyDrawH
        );
        // Keep the top tip of the microphone in his left hand stationary with the body
        drawCharSubTexture(
          ctx,
          fakerSheet,
          f.x,
          f.y + micCapSrcY,
          micCapSrcW,
          micCapSrcH,
          drawX,
          drawY + micCapSrcY * scale,
          micCapSrcW * scale,
          micCapSrcH * scale
        );

        // 2. Draw ONLY his head (y=0..260) twisting backwards around his neck toward the viewer
        const neckPivotX = drawX + drawW * 0.455;
        const neckPivotY = drawY + headDrawH;
        // Horizontal 3D turn from facing left (+1) through center toward you, twisting backwards (-0.88)
        const rawScaleX = 1 - snapEase * 1.88;
        const twistScaleX =
          Math.abs(rawScaleX) < 0.28
            ? (rawScaleX >= 0 ? 0.28 : -0.28)
            : rawScaleX;
        const twistScaleY = 1 + Math.sin(t * Math.PI) * 0.06;
        // Eerie owl-like backward head-cock angle as it twists toward you
        const twistAngle = -snapEase * 0.24 + Math.sin(t * Math.PI * 6) * 0.025;

        ctx.save();
        ctx.translate(neckPivotX, neckPivotY);
        ctx.rotate(twistAngle);
        ctx.scale(twistScaleX, twistScaleY);
        ctx.translate(-neckPivotX, -neckPivotY);

        // Clip out the stationary microphone cap corner so only the head rotates
        ctx.beginPath();
        ctx.rect(drawX - 40, drawY - 40, drawW + 80, micCapSrcY * scale + 40);
        ctx.rect(
          drawX + micCapSrcW * scale,
          drawY + micCapSrcY * scale,
          drawW - micCapSrcW * scale + 40,
          micCapSrcH * scale + 4
        );
        ctx.clip();

        drawCharSubTexture(
          ctx,
          fakerSheet,
          f.x,
          f.y,
          f.w,
          headSrcH,
          drawX,
          drawY,
          drawW,
          headDrawH
        );
        ctx.restore();

        // 3. As his head twists toward you (t > 0.25), lock both glowing crimson-red eyes directly onto the viewer
        if (t > 0.25) {
          const eyeAlpha = Math.min(1, (t - 0.25) / 0.45);
          const faceCenterX = neckPivotX + snapEase * 6;
          const faceCenterY = neckPivotY - headDrawH * 0.36;
          ctx.save();
          ctx.globalAlpha = eyeAlpha;
          ctx.translate(faceCenterX, faceCenterY);
          ctx.rotate(-snapEase * 0.16);

          // Sunken dark eye sockets facing viewer
          ctx.fillStyle = '#050208';
          ctx.beginPath();
          ctx.ellipse(-9, 0, 6.5, 8.5, -0.1, 0, Math.PI * 2);
          ctx.ellipse(8, 1, 6.5, 8.5, 0.1, 0, Math.PI * 2);
          ctx.fill();

          // Glowing crimson pupils staring straight at you
          ctx.shadowColor = '#FF0022';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#FF1A2E';
          ctx.beginPath();
          ctx.arc(-9, 0, 3.2, 0, Math.PI * 2);
          ctx.arc(8, 1, 3.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFE4E8';
          ctx.beginPath();
          ctx.arc(-9, -0.5, 1.2, 0, Math.PI * 2);
          ctx.arc(8, 0.5, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else {
        drawCharSubTexture(
          ctx,
          fakerSheet,
          f.x,
          f.y,
          f.w,
          f.h,
          drawX,
          drawY,
          drawW,
          drawH
        );
      }
      ctx.restore();
      return;
    }
  }

  // 6. You Can't Run Phase 1: YCR Sonic.EXE (YCR.png + YCR.xml + sonicexep2.json)
  if (character === 'ycr-exe') {
    const ycrSheet = getSpriteSheet('/sprites/YCR.png');
    if (ycrSheet) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 82, 70, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' | 'laugh' | 'scream' =
        pose === 'gotcha' || pose === 'scream'
          ? 'scream'
          : pose === 'laugh'
            ? 'laugh'
            : pose === 'left' || pose === 'down' || pose === 'up' || pose === 'right'
              ? pose
              : 'idle';
      const anim = YCR_NORMAL_ANIMS[animKey];
      const beatLocalMs = ((timeMs % beatPeriod) + beatPeriod) % beatPeriod;
      const frameIdx =
        animKey === 'idle'
          ? Math.min(
              anim.frames.length - 1,
              Math.floor(beatLocalMs / (1000 / anim.fps))
            )
          : animKey === 'laugh'
            ? Math.floor(elapsedPoseMs / (1000 / anim.fps)) % anim.frames.length
            : Math.min(
                anim.frames.length - 1,
                Math.floor(elapsedPoseMs / (1000 / anim.fps))
              );
      const f = anim.frames[frameIdx];

      const scale = 0.38;
      const drawW = f.w * scale;
      const drawH = f.h * scale;
      const drawX = (-256 - anim.offset[0]) * scale;
      const drawY = 82 - (671 + anim.offset[1]) * scale;

      drawCharSubTexture(
        ctx,
        ycrSheet,
        f.x,
        f.y,
        f.w,
        f.h,
        drawX,
        drawY,
        drawW,
        drawH,
        0.25
      );
      ctx.restore();
      return;
    }
  }

  // 7. You Can't Run Post-Pixel Enraged Phase: YCR_Mad Sonic.EXE (YCR_Mad.png + YCR_Mad.xml + sonicexep2mad.json)
  if (character === 'ycr-mad') {
    const ycrMadSheet = getSpriteSheet('/sprites/YCR_Mad.png');
    if (ycrMadSheet) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
      ctx.beginPath();
      ctx.ellipse(0, 82, 74, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' | 'laugh' | 'scream' | 'die' =
        pose === 'gotcha'
          ? 'die'
          : pose === 'scream'
            ? 'scream'
            : pose === 'laugh'
              ? 'laugh'
              : pose === 'left' || pose === 'down' || pose === 'up' || pose === 'right'
                ? pose
                : 'idle';
      const anim = YCR_MAD_ANIMS[animKey];
      const beatLocalMs = ((timeMs % beatPeriod) + beatPeriod) % beatPeriod;
      const frameIdx =
        animKey === 'idle'
          ? Math.min(
              anim.frames.length - 1,
              Math.floor(beatLocalMs / (1000 / anim.fps))
            )
          : animKey === 'laugh'
            ? Math.floor(elapsedPoseMs / (1000 / anim.fps)) % anim.frames.length
            : Math.min(
                anim.frames.length - 1,
                Math.floor(elapsedPoseMs / (1000 / anim.fps))
              );
      const f = anim.frames[frameIdx];

      const scale = 0.38;
      const drawW = f.w * scale;
      const drawH = f.h * scale;
      const drawX = (-255 - anim.offset[0]) * scale;
      const drawY = 82 - (659 + anim.offset[1]) * scale;

      drawCharSubTexture(
        ctx,
        ycrMadSheet,
        f.x,
        f.y,
        f.w,
        f.h,
        drawX,
        drawY,
        drawW,
        drawH,
        0.25
      );
      ctx.restore();
      return;
    }
  }

  // 8. You Can't Run 16-Bit Pixel Genesis Section: Sonic_EXE_Pixel (Sonic_EXE_Pixel.png + Sonic_EXE_Pixel.xml)
  if (character === 'pixel-exe') {
    const pixelExeSheet = getSpriteSheet('/sprites/Sonic_EXE_Pixel.png');
    if (pixelExeSheet) {
      ctx.save();
      ctx.translate(x, y);
      const prevSmooth = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;

      // Pixel ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(-58, 70, 116, 16);

      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' =
        pose === 'left' || pose === 'down' || pose === 'up' || pose === 'right'
          ? pose
          : 'idle';
      const frames = SONIC_PIXEL_ANIMS[animKey];
      const beatLocalMs = ((timeMs % beatPeriod) + beatPeriod) % beatPeriod;
      const frameIdx =
        animKey === 'idle'
          ? Math.min(frames.length - 1, Math.floor(beatLocalMs / (1000 / 12)))
          : Math.min(frames.length - 1, Math.floor(elapsedPoseMs / (1000 / 14)));
      const f = frames[frameIdx];

      const scale = 4.7;
      const drawW = Math.round(f.w * scale);
      const drawH = Math.round(f.h * scale);
      // Flip horizontally so Pixel Sonic on the left faces right toward Pixel BF on the right
      ctx.scale(-1, 1);
      ctx.drawImage(
        pixelExeSheet,
        f.x,
        f.y,
        f.w,
        f.h,
        -Math.round(drawW * 0.5),
        82 - drawH,
        drawW,
        drawH
      );

      ctx.imageSmoothingEnabled = prevSmooth;
      ctx.restore();
      return;
    }
  }

  // 8b. Triple Trouble Xenophanes (Beast.png + Beast.xml: sonic-beast & sonic-beast-invert)
  if (character === 'xenophanes' || character === 'xenophanes-flipped') {
    const beastSheet = getSpriteSheet('/sprites/Beast.png');
    if (beastSheet) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
      ctx.beginPath();
      ctx.ellipse(0, 86, 86, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      const isFlipped = character === 'xenophanes-flipped';
      // In sonic-beast-invert.json, singLEFT uses Beast_RIGHT and singRIGHT uses Beast_LEFT
      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' | 'laugh' =
        pose === 'laugh' || pose === 'gotcha'
          ? 'laugh'
          : pose === 'left'
            ? isFlipped
              ? 'right'
              : 'left'
            : pose === 'right'
              ? isFlipped
                ? 'left'
                : 'right'
              : pose === 'down' || pose === 'up'
                ? pose
                : 'idle';
      const anim = XENOPHANES_BEAST_ANIMS[animKey];
      const beatLocalMs = ((timeMs % beatPeriod) + beatPeriod) % beatPeriod;
      const frameIdx =
        animKey === 'idle'
          ? Math.min(
              anim.frames.length - 1,
              Math.floor(beatLocalMs / (1000 / 24))
            )
          : Math.min(
              anim.frames.length - 1,
              Math.floor(elapsedPoseMs / (1000 / 24))
            );
      const f = anim.frames[frameIdx];

      const scale = 0.54;
      const drawW = f.w * scale;
      const drawH = f.h * scale;
      if (isFlipped) {
        ctx.scale(-1, 1);
      }
      const drawX = -drawW * 0.5 - (anim.offset[0] * 0.45 + f.fx * 0.4) * scale;
      const drawY = 108 - (860 + anim.offset[1] * 0.35 + f.fy * 0.4) * scale;

      drawCharSubTexture(
        ctx,
        beastSheet,
        f.x,
        f.y,
        f.w,
        f.h,
        drawX,
        drawY,
        drawW,
        drawH,
        0.25
      );
      ctx.restore();
      return;
    }
  }

  // Use the exact 5-pose Sonic.exe sprites for Too Slow!
  if (character === 'sonic-exe') {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 82, 68, 16, 0, 0, Math.PI * 2);
    ctx.fill();

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
    ctx.beginPath();
    ctx.arc(1, -5, pupilRadius, 0, Math.PI * 2);
    ctx.arc(19, -5, pupilRadius, 0, Math.PI * 2);
    ctx.fill();
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
  poseStartedMs = 0,
  isFlippedOnLeft = false
) {
  const beatPeriod = 60000 / bpm;
  const elapsedPoseMs = Math.max(0, timeMs - poseStartedMs);
  const beatPhase = (((timeMs % beatPeriod) + beatPeriod) % beatPeriod) / beatPeriod;

  // Triple Trouble Over-the-Shoulder 3rd-Person Perspective Boyfriend (P3_BF.png + P3_BF.xml)
  if (
    character === 'bf-perspective-right' ||
    character === 'bf-perspective-left'
  ) {
    const p3BfSheet = getSpriteSheet('/sprites/P3_BF.png');
    if (p3BfSheet) {
      ctx.save();
      ctx.translate(x, y);
      const isRightSide = character === 'bf-perspective-right';
      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' | 'miss' =
        pose === 'miss'
          ? 'miss'
          : pose === 'left'
            ? isRightSide
              ? 'left'
              : 'right'
            : pose === 'right'
              ? isRightSide
                ? 'right'
                : 'left'
              : pose === 'down' || pose === 'up'
                ? pose
                : 'idle';
      const anim = BF_PERSPECTIVE_ANIMS[animKey];
      const beatLocalMs = ((timeMs % beatPeriod) + beatPeriod) % beatPeriod;
      const frameIdx =
        animKey === 'idle'
          ? Math.min(
              anim.frames.length - 1,
              Math.floor(beatLocalMs / (1000 / 24))
            )
          : Math.min(
              anim.frames.length - 1,
              Math.floor(elapsedPoseMs / (1000 / 24))
            );
      const f = anim.frames[frameIdx];

      const scale = 0.72;
      const drawW = f.w * scale;
      const drawH = f.h * scale;
      if (isRightSide) {
        ctx.scale(-1, 1);
      }
      const drawX = -drawW * 0.5 - anim.offset[0] * scale * 0.45;
      const drawY = 185 - drawH - anim.offset[1] * scale * 0.45;

      drawCharSubTexture(
        ctx,
        p3BfSheet,
        f.x,
        f.y,
        f.w,
        f.h,
        drawX,
        drawY,
        drawW,
        drawH,
        0.25
      );
      ctx.restore();
      return;
    }
  }

  // 16-Bit Pixel Boyfriend for You Can't Run Pixel Section (BF_Pixel.png + BF.xml, on the right side facing left)
  if (character === 'bf-pixel') {
    const bfPixelSheet = getSpriteSheet('/sprites/BF_Pixel.png');
    if (bfPixelSheet) {
      ctx.save();
      ctx.translate(x, y);
      const prevSmooth = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;

      // Pixel ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(-52, 66, 104, 16);

      const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' | 'miss' =
        pose === 'left' ||
        pose === 'down' ||
        pose === 'up' ||
        pose === 'right' ||
        pose === 'miss'
          ? pose
          : 'idle';
      const frames = BF_PIXEL_ANIMS[animKey];
      const beatLocalMs = ((timeMs % beatPeriod) + beatPeriod) % beatPeriod;
      const frameIdx =
        animKey === 'idle'
          ? Math.min(frames.length - 1, Math.floor(beatLocalMs / (1000 / 12)))
          : Math.min(frames.length - 1, Math.floor(elapsedPoseMs / (1000 / 14)));
      const f = frames[frameIdx];

      const scale = 4.6;
      const drawW = Math.round(f.w * scale);
      const drawH = Math.round(f.h * scale);
      ctx.drawImage(
        bfPixelSheet,
        f.x,
        f.y,
        f.w,
        f.h,
        -Math.round(drawW * 0.5),
        78 - drawH,
        drawW,
        drawH
      );

      ctx.imageSmoothingEnabled = prevSmooth;
      ctx.restore();
      return;
    }
  }

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
      const beatLocalMs = ((timeMs % beatPeriod) + beatPeriod) % beatPeriod;
      const frameIdx =
        animKey === 'idle'
          ? Math.min(
              anim.frames.length - 1,
              Math.floor(beatLocalMs / (1000 / 12))
            )
          : Math.min(
              anim.frames.length - 1,
              Math.floor(elapsedPoseMs / (1000 / 12))
            );
      const frame = anim.frames[frameIdx];

      const scale = 0.38;
      const drawW = frame.w * scale;
      const drawH = frame.h * scale;
      const drawX = -78 - (anim.offset[0] + 5) * scale;
      const drawY = 78 - 496 * scale - anim.offset[1] * scale;

      drawCharSubTexture(
        ctx,
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

  // Universal BOYFRIEND.png sprite sheet across Too Slow, You Can't Run, Triple Trouble, and Endless!
  const bfSheet = getSpriteSheet('/sprites/BOYFRIEND.png');
  if (bfSheet) {
    ctx.save();
    ctx.translate(x, y);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 78, 60, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isFlippedOnLeft) {
      ctx.scale(-1, 1);
    }

    const animKey: 'idle' | 'left' | 'down' | 'up' | 'right' | 'miss' =
      pose === 'left'
        ? isFlippedOnLeft
          ? 'right'
          : 'left'
        : pose === 'right'
          ? isFlippedOnLeft
            ? 'left'
            : 'right'
          : pose === 'down' || pose === 'up' || pose === 'miss'
            ? pose
            : 'idle';
    const anim = BOYFRIEND_ANIMS[animKey];
    const beatLocalMs = ((timeMs % beatPeriod) + beatPeriod) % beatPeriod;
    const frameIdx =
      animKey === 'idle'
        ? Math.min(
            anim.frames.length - 1,
            Math.floor(beatLocalMs / (1000 / 24))
          )
        : Math.min(
            anim.frames.length - 1,
            Math.floor(elapsedPoseMs / (1000 / 24))
          );
    const f = anim.frames[frameIdx];

    // Exact Psych Engine foot-anchored coordinates (psych_cx = 220, psych_bot = 411)
    const scale = 0.44;
    const drawW = f.w * scale;
    const drawH = f.h * scale;
    const drawX = (-220 - anim.offset[0] - f.fx) * scale;
    const drawY = 78 - (411 + anim.offset[1] + f.fy) * scale;

    drawCharSubTexture(ctx, bfSheet, f.x, f.y, f.w, f.h, drawX, drawY, drawW, drawH);
    ctx.restore();
    return;
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
export function getCharacterHealthColor(
  character: OpponentCharacterId | PlayerCharacterId
): string {
  switch (character) {
    case 'tails-soul':
      return '#666666'; // Tails.EXE grey from Triple Trouble video
    case 'xenophanes':
    case 'xenophanes-flipped':
      return '#4F1D96'; // Xenophanes deep purple from Triple Trouble video
    case 'knuckles-soul':
      return '#7F1212'; // Knuckles.EXE dark crimson from Triple Trouble video
    case 'eggman-soul':
      return '#8B5A00'; // Eggman.EXE dark gold/ochre from Triple Trouble video
    case 'sonicexefake':
      return '#1D4ED8'; // Fake Sonic royal blue
    case 'sonic-exe':
      return '#161E9C'; // Sonic.EXE deep royal blue from Too Slow video
    case 'ycr-exe':
      return '#1E3A8A'; // YCR Sonic.EXE dark blue
    case 'ycr-mad':
      return '#991B1B'; // YCR Mad crimson
    case 'pixel-exe':
      return '#2563EB'; // Pixel Sonic blue
    case 'majin':
      return '#1D4ED8'; // Majin Sonic cobalt
    case 'majin-og':
      return '#1E40AF'; // Majin OG deep cobalt
    case 'bf':
    case 'bf-encore':
    case 'bf-pixel':
    case 'bf-perspective-right':
    case 'bf-perspective-left':
    default:
      return '#31B0D1'; // Boyfriend signature cyan
  }
}

export function drawHealthIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isPlayer: boolean,
  character: OpponentCharacterId | PlayerCharacterId,
  isLosing: boolean,
  bopScale = 1.0
) {
  ctx.save();
  ctx.translate(x, y);
  if (bopScale !== 1.0) {
    ctx.scale(bopScale, bopScale);
  }
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (isPlayer) {
    if (character === 'bf-pixel') {
      const bfPixelIcon = getSpriteSheet('/sprites/icon-bfpixelycr.png');
      if (bfPixelIcon) {
        const halfW = Math.floor(bfPixelIcon.naturalWidth / 2);
        const fullH = bfPixelIcon.naturalHeight;
        const sx = isLosing ? halfW : 0;
        const drawSize = 78;
        const prevSmooth = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        ctx.scale(-1, 1);
        ctx.drawImage(
          bfPixelIcon,
          sx,
          0,
          halfW,
          fullH,
          -drawSize * 0.5,
          -drawSize * 0.5,
          drawSize,
          drawSize
        );
        ctx.imageSmoothingEnabled = prevSmooth;
        ctx.restore();
        return;
      }
    }
    // Universal Boyfriend Health Icon (icon-bf.png)
    const bfIcon = getSpriteSheet('/sprites/icon-bf.png');
    if (bfIcon) {
      const halfW = Math.floor(bfIcon.naturalWidth / 2);
      const fullH = bfIcon.naturalHeight;
      const sx = isLosing ? halfW : 0;
      const drawSize = 82;
      ctx.scale(-1, 1);
      ctx.drawImage(
        bfIcon,
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
    const fakeIconSheet = getSpriteSheet('/sprites/icon-sonicfake.png');
    if (fakeIconSheet) {
      const halfW = Math.floor(fakeIconSheet.naturalWidth / 2);
      const fullH = fakeIconSheet.naturalHeight;
      const sx = isLosing ? halfW : 0;
      const drawSize = 82;
      ctx.drawImage(
        fakeIconSheet,
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
    const majinIcon = getSpriteSheet('/sprites/icon-majin.png');
    if (majinIcon) {
      const halfW = Math.floor(majinIcon.naturalWidth / 2);
      const fullH = majinIcon.naturalHeight;
      const sx = isLosing ? halfW : 0;
      const drawSize = 82;
      ctx.drawImage(
        majinIcon,
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
    const majinOgIcon = getSpriteSheet('/sprites/icon-majin-og.png');
    if (majinOgIcon) {
      const halfW = Math.floor(majinOgIcon.naturalWidth / 2);
      const fullH = majinOgIcon.naturalHeight;
      const sx = isLosing ? halfW : 0;
      const drawSize = 82;
      ctx.drawImage(
        majinOgIcon,
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
  } else if (
    character === 'ycr-exe' ||
    character === 'ycr-mad' ||
    character === 'pixel-exe'
  ) {
    const ycrIconPath =
      character === 'ycr-mad'
        ? '/sprites/icon-ycr-pissy.png'
        : character === 'pixel-exe'
          ? '/sprites/icon-pixelsonic.png'
          : '/sprites/icon-ycr.png';
    const ycrIconSheet = getSpriteSheet(ycrIconPath);
    if (ycrIconSheet) {
      const halfW = Math.floor(ycrIconSheet.naturalWidth / 2);
      const fullH = ycrIconSheet.naturalHeight;
      const sx = isLosing ? halfW : 0;
      const drawSize = character === 'pixel-exe' ? 78 : 84;
      const prevSmooth = ctx.imageSmoothingEnabled;
      if (character === 'pixel-exe') {
        ctx.imageSmoothingEnabled = false;
      }
      ctx.drawImage(
        ycrIconSheet,
        sx,
        0,
        halfW,
        fullH,
        -drawSize * 0.5,
        -drawSize * 0.5,
        drawSize,
        drawSize
      );
      ctx.imageSmoothingEnabled = prevSmooth;
      ctx.restore();
      return;
    }
    // Fallback vector icon if image is still loading
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
    character === 'xenophanes' ||
    character === 'xenophanes-flipped'
  ) {
    // Triple Trouble Health Icons
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
    const exeIconSheet = getSpriteSheet('/sprites/icon-sonic-exe.png');
    if (exeIconSheet) {
      const halfW = Math.floor(exeIconSheet.naturalWidth / 2);
      const fullH = exeIconSheet.naturalHeight;
      const sx = isLosing ? halfW : 0;
      const drawSize = 82;
      ctx.drawImage(
        exeIconSheet,
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
    ctx.scale(1.25, 1.25);

    const iconFill = '#0960B8';

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

export function drawSonicJumpscare(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  spookType = 'sonic'
) {
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);
  const spookPath =
    spookType === 'tails'
      ? '/sprites/P3_Tails.png'
      : spookType === 'knuckles'
        ? '/sprites/P3_Knuckles.png'
        : spookType === 'eggman'
          ? '/sprites/P3_Eggman.png'
          : '/sprites/SonicJumpscare.png';
  const spookImg = getSpriteSheet(spookPath);
  if (spookImg) {
    ctx.drawImage(spookImg, 0, 0, w, h);
  } else {
    drawOpponentSprite(ctx, w * 0.5, h * 0.58, 'sonic-exe', 'gotcha', 0, 130);
  }
  ctx.restore();
}

export function drawTripleTroubleRingCounter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rings: number
) {
  ctx.save();
  const baseX = w - 135;
  const baseY = h - 78;
  const ringIcon = getSpriteSheet('/sprites/RingCounter.png');
  if (ringIcon) {
    ctx.drawImage(ringIcon, baseX - 24, baseY - 22, 62, 62);
  } else {
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(baseX + 6, baseY + 8, 20, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Classic Sonic 3D yellow numbers with thick red/black outline ("00" / "64" + "Rings")
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 44px "Syne", "JetBrains Mono", sans-serif';
  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 8;
  ctx.strokeText(String(Math.max(0, rings)), baseX + 52, baseY + 6);
  ctx.fillStyle = '#FACC15';
  ctx.fillText(String(Math.max(0, rings)), baseX + 52, baseY + 6);

  ctx.font = '900 22px "Syne", sans-serif';
  ctx.strokeStyle = '#7F1D1D';
  ctx.lineWidth = 6;
  ctx.strokeText('Rings', baseX + 38, baseY + 38);
  ctx.fillStyle = '#FDE047';
  ctx.fillText('Rings', baseX + 38, baseY + 38);
  ctx.restore();
}

export function drawRedVignetteOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  alpha: number
) {
  if (alpha <= 0.01) return;
  const redVgImg = getSpriteSheet('/sprites/RedVG.png');
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  if (redVgImg) {
    ctx.drawImage(redVgImg, 0, 0, w, h);
  } else {
    const grad = ctx.createRadialGradient(
      w * 0.5,
      h * 0.5,
      h * 0.25,
      w * 0.5,
      h * 0.5,
      w * 0.65
    );
    grad.addColorStop(0, 'rgba(220, 38, 38, 0)');
    grad.addColorStop(1, 'rgba(220, 38, 38, 0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

export function drawJudgmentAndComboPopup(
  ctx: CanvasRenderingContext2D,
  text: string,
  combo: number,
  centerX: number,
  baseY: number,
  age: number,
  isAntiLag = false
) {
  ctx.save();
  if (!isAntiLag) {
    ctx.globalAlpha = Math.max(0, 1 - Math.pow(age, 1.6) * 0.92);
  }

  const popBounce = 1 + Math.max(0, 1 - age * 5.5) * 0.14;
  const py = baseY - Math.sin(age * Math.PI) * 18;

  const judgmentSpritePath =
    text === 'SICK!!'
      ? '/sprites/ui/sick.png'
      : text === 'GOOD!'
        ? '/sprites/ui/good.png'
        : text === 'BAD'
          ? '/sprites/ui/bad.png'
          : text === 'SHIT'
            ? '/sprites/ui/shit.png'
            : null;

  if (judgmentSpritePath) {
    const ratingImg = getSpriteSheet(judgmentSpritePath);
    if (ratingImg) {
      const ratingScale = 0.44 * popBounce;
      const rw = ratingImg.naturalWidth * ratingScale;
      const rh = ratingImg.naturalHeight * ratingScale;
      ctx.drawImage(ratingImg, centerX - rw * 0.5, py - rh * 0.6, rw, rh);
    }

    // Always render at least a 3-digit zero-padded combo counter (e.g. 006, 042) using only the number sprites
    if (combo >= 1) {
      const comboStr = String(Math.max(0, Math.floor(combo))).padStart(3, '0');
      const digitScale = 0.36;
      const digitSpacing = 33;
      const totalWidth = (comboStr.length - 1) * digitSpacing;
      const startX = centerX - totalWidth * 0.5;
      const comboY = py + 44;

      for (let i = 0; i < comboStr.length; i++) {
        const ch = comboStr[i];
        const digitImg = getSpriteSheet(`/sprites/ui/num${ch}.png`);
        if (digitImg) {
          const digitAge = Math.max(0, age - i * 0.025);
          const digitPop = 1 + Math.max(0, 1 - digitAge * 6) * 0.12;
          const digitBounceY = -Math.sin(Math.min(1, digitAge * 1.15) * Math.PI) * 8;
          const dw = digitImg.naturalWidth * digitScale * digitPop;
          const dh = digitImg.naturalHeight * digitScale * digitPop;
          const dx = startX + i * digitSpacing - dw * 0.5;
          const dy = comboY + digitBounceY - dh * 0.5;
          ctx.drawImage(digitImg, dx, dy, dw, dh);
        }
      }
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

export function formatPsychRating(stats: {
  sicks: number;
  goods: number;
  bads: number;
  shits: number;
  misses: number;
}): string {
  const totalJudged =
    stats.sicks + stats.goods + stats.bads + stats.shits + stats.misses;
  if (totalJudged <= 0) return '?';

  const acc = calculateAccuracy(stats);
  let ratingName = 'You Suck!';
  if (acc >= 100 - 1e-6) {
    ratingName = 'Perfect!!';
  } else if (acc >= 90) {
    ratingName = 'Sick!';
  } else if (acc >= 80) {
    ratingName = 'Great';
  } else if (acc >= 70) {
    ratingName = 'Good';
  } else if (acc >= 69) {
    ratingName = 'Nice';
  } else if (acc >= 60) {
    ratingName = 'Meh';
  } else if (acc >= 50) {
    ratingName = 'Bruh';
  } else if (acc >= 40) {
    ratingName = 'Bad';
  } else if (acc >= 20) {
    ratingName = 'Shit';
  }

  let fcTier = 'Clear';
  if (stats.misses === 0) {
    if (stats.bads > 0 || stats.shits > 0) {
      fcTier = 'FC';
    } else if (stats.goods > 0) {
      fcTier = 'GFC';
    } else {
      fcTier = 'SFC';
    }
  } else if (stats.misses < 10) {
    fcTier = 'SDCB';
  }

  const accFormatted = Number(acc.toFixed(2));
  return `${ratingName} (${accFormatted}%) - ${fcTier}`;
}

