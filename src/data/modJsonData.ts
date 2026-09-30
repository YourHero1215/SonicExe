import {
  CharacterPose,
  GirlfriendCharacterId,
  NoteskinId,
  OpponentCharacterId,
  PlayerCharacterId,
  StageConfigId,
} from '../types/game';

export interface ModAnimationDef {
  name: string;
  prefix: string;
  looped?: boolean;
  offsets: [number, number];
  frameRate?: number;
  flipX?: boolean;
  flipY?: boolean;
  assetPath?: string | null;
}

export interface ModCharacterJson {
  name: string;
  assetPath: string;
  singTime: number;
  version: string;
  scale: number;
  flipX: boolean;
  flipY?: boolean;
  isPixel: boolean;
  danceEvery?: number;
  offsets?: [number, number];
  cameraOffsets?: [number, number];
  healthIcon: {
    id: string;
    offsets?: [number, number];
    flipX: boolean;
    isPixel: boolean;
    scale: number;
  };
  animations: ModAnimationDef[];
}

export interface ModStageProp {
  name: string;
  assetPath: string;
  zIndex: number;
  position: [number, number];
  scale: [number, number];
  scroll: [number, number];
  isPixel: boolean;
  danceEvery?: number;
  flipX?: boolean;
  flipY?: boolean;
  alpha?: number;
  startingAnimation?: string | null;
  animations?: ModAnimationDef[];
}

export interface ModStageJson {
  name: StageConfigId;
  version: string;
  cameraZoom: number;
  props: ModStageProp[];
  characters: {
    bf: {
      zIndex: number;
      position: [number, number];
      cameraOffsets: [number, number];
      scale?: number;
      alpha?: number;
    };
    gf: {
      zIndex: number;
      position: [number, number];
      cameraOffsets: [number, number];
      scale?: number;
      alpha?: number;
    };
    dad: {
      zIndex: number;
      position: [number, number];
      cameraOffsets: [number, number];
      scale?: number;
      alpha?: number;
    };
  };
}

export interface ModNoteskinJson {
  version: string;
  name: string;
  author: string;
  fallback: string | null;
  isPixel: boolean;
  noteScale: number;
  strumOffsets: [number, number];
  splashAssetPath: string;
  splashIsPixel: boolean;
  splashAlpha: number;
   splashOffsets: [number, number];
  holdCoverColor: 'red' | 'blue' | 'pixel';
  holdCoverScale: number;
  countdownAudioType: 'bizarre' | 'funkin';
  countdownInvisibleReady: boolean;
  judgementStyle: 'pixel' | 'exe1' | 'funkin';
  judgementScale: number;
  comboNumberScale: number;
}

// ============================================================================
// 1. ALL NOTESKIN & NOTEKIND JSON CONFIGURATIONS FROM THE MOD
// ============================================================================
export const MOD_NOTESKINS: Record<NoteskinId, ModNoteskinJson> = {
  // From Phantom Note (EXE) & Ring Note (EXE) base noteskin
  'exe-standard': {
    version: '1.1.0',
    name: 'Phantom / Ring Note (EXE)',
    author: '',
    fallback: 'funkin',
    isPixel: false,
    noteScale: 0.7,
    strumOffsets: [0, 0],
    splashAssetPath: 'noteskins/BloodSplash',
    splashIsPixel: false,
    splashAlpha: 1.0,
    splashOffsets: [35, 10],
    holdCoverColor: 'red', // holdCoverStartRed / holdCoverRed / holdCoverEndRed
    holdCoverScale: 1.0,
    countdownAudioType: 'funkin', // shared:gameplay/countdown/funkin/introTHREE..introGO
    countdownInvisibleReady: false,
    judgementStyle: 'funkin',
    judgementScale: 0.65,
    comboNumberScale: 0.45,
  },
  // From "EXE (Pixel)" JSON by Moawling
  'exe-pixel': {
    version: '1.1.0',
    name: 'EXE (Pixel)',
    author: 'Moawling',
    fallback: 'funkin',
    isPixel: true,
    noteScale: 6.0,
    strumOffsets: [28, 32],
    splashAssetPath: 'noteskins/PixelBloodSplash',
    splashIsPixel: true,
    splashAlpha: 1.0,
    splashOffsets: [35, 10],
    holdCoverColor: 'pixel', // week6:pixelNoteHoldCover (loop0000 / loop / explode)
    holdCoverScale: 6.0,
    countdownAudioType: 'bizarre', // shared:countdown/exe/bizarre
    countdownInvisibleReady: true, // shared:ui/countdown/funkin/invisibleReady
    judgementStyle: 'pixel', // default:ui/popup/pixel/sick..shit
    judgementScale: 4.2,
    comboNumberScale: 4.2,
  },
  // From "EXE (Majin)" JSON by PhantomArcade
  'exe-majin': {
    version: '1.1.0',
    name: 'EXE (Majin)',
    author: 'PhantomArcade',
    fallback: null,
    isPixel: false,
    noteScale: 0.7,
    strumOffsets: [24, 25],
    splashAssetPath: 'noteskins/majin/endlessNoteSplashes',
    splashIsPixel: false,
    splashAlpha: 0.8,
    splashOffsets: [0, 0],
    holdCoverColor: 'blue', // holdCoverStartBlue / holdCoverBlue / holdCoverEndBlue
    holdCoverScale: 0.7,
    countdownAudioType: 'bizarre', // shared:countdown/exe/bizarre
    countdownInvisibleReady: true, // shared:ui/countdown/funkin/invisibleReady
    judgementStyle: 'exe1', // default:ui/popup/exe1/sick..shit
    judgementScale: 0.65,
    comboNumberScale: 0.45,
  },
};

export const PHANTOM_NOTE_JSON = {
  version: '1.1.0',
  name: 'Phantom Note (EXE)',
  assetPath: 'notekinds/phantomnote/PhantomNote',
  scale: 0.7,
  offsets: [0, 0] as [number, number],
  prefixes: {
    left: 'A0000',
    down: 'B0000',
    up: 'C0000',
    right: 'D0000',
  },
  noteSplash: 'noteskins/BloodSplash',
  holdCover: 'noteskins/holdCoverExe',
};

export const RING_NOTE_JSON = {
  version: '1.1.0',
  name: 'Ring Note (EXE)',
  assetPath: 'notekinds/ringnote/ring',
  scale: 0.7,
  offsets: [-100, 0] as [number, number],
  prefixes: {
    left: 'purple0000',
    down: 'blue0000',
    up: 'green0000',
    right: 'red0000',
  },
  noteSplash: 'noteskins/BloodSplash',
  holdCover: 'noteskins/holdCoverExe',
};

// ============================================================================
// 2. ALL CHARACTER JSON CONFIGURATIONS FROM THE MOD
// ============================================================================
export const MOD_CHARACTERS: Record<
  OpponentCharacterId | PlayerCharacterId | GirlfriendCharacterId,
  ModCharacterJson
> = {
  'gf-encore': {
    assetPath: 'characters/Main2GF',
    name: 'Girlfriend (Encore)',
    singTime: 4,
    version: '1.0.0',
    scale: 0.9,
    flipX: false,
    isPixel: false,
    offsets: [-20, -35],
    cameraOffsets: [0, 0],
    healthIcon: {
      id: 'gf',
      offsets: [0, 0],
      flipX: false,
      isPixel: false,
      scale: 1,
    },
    animations: [
      {
        name: 'danceLeft',
        prefix: 'DanceLeft',
        looped: false,
        offsets: [-102, -109],
        frameRate: 20,
      },
      {
        name: 'danceRight',
        prefix: 'DanceRight',
        looped: false,
        offsets: [-106, -109],
        frameRate: 20,
      },
    ],
  },
  gf: {
    assetPath: 'characters/GF_assets',
    name: 'Girlfriend',
    singTime: 4,
    version: '1.0.0',
    scale: 1.0,
    flipX: false,
    isPixel: false,
    offsets: [0, 0],
    cameraOffsets: [0, 0],
    healthIcon: {
      id: 'gf',
      offsets: [0, 0],
      flipX: false,
      isPixel: false,
      scale: 1,
    },
    animations: [
      {
        name: 'danceLeft',
        prefix: 'GF Dancing Beat',
        looped: false,
        offsets: [0, -9],
        frameRate: 24,
      },
      {
        name: 'danceRight',
        prefix: 'GF Dancing Beat',
        looped: false,
        offsets: [0, -9],
        frameRate: 24,
      },
    ],
  },
  'gf-hidden': {
    assetPath: 'characters/GF_assets',
    name: 'Girlfriend (Hidden in Majin Forest)',
    singTime: 4,
    version: '1.0.0',
    scale: 1.0,
    flipX: false,
    isPixel: false,
    offsets: [0, 0],
    cameraOffsets: [0, 50],
    healthIcon: {
      id: 'gf',
      offsets: [0, 0],
      flipX: false,
      isPixel: false,
      scale: 1,
    },
    animations: [],
  },
  'knuckles-soul': {
    assetPath: 'characters/KnucklesEXE',
    name: 'Knuckles.EXE',
    singTime: 6.1,
    version: '1.0.0',
    scale: 1.1,
    flipX: true,
    isPixel: false,
    offsets: [200, 240],
    cameraOffsets: [-50, 0],
    healthIcon: {
      id: 'knux',
      offsets: [0, 0],
      flipX: false,
      isPixel: false,
      scale: 1,
    },
    animations: [
      {
        name: 'idle',
        prefix: 'Knux Idle',
        looped: false,
        offsets: [-150, 0],
        frameRate: 24,
      },
      {
        name: 'singDOWN',
        prefix: 'Knux Down',
        looped: false,
        offsets: [-80, -105],
        frameRate: 24,
      },
      {
        name: 'singUP',
        prefix: 'Knux Up',
        looped: false,
        offsets: [-130, 54],
        frameRate: 24,
      },
      {
        name: 'singLEFT',
        prefix: 'Knux Right',
        looped: false,
        offsets: [30, -70],
        frameRate: 24,
      },
      {
        name: 'singRIGHT',
        prefix: 'Knux Left',
        looped: false,
        offsets: [-170, -70],
        frameRate: 24,
      },
    ],
  },
  'eggman-soul': {
    assetPath: 'characters/eggman_soul',
    name: 'Eggman.EXE',
    singTime: 6.1,
    version: '1.0.0',
    scale: 1,
    flipX: false,
    isPixel: false,
    offsets: [-10, 255],
    cameraOffsets: [0, -50],
    healthIcon: {
      id: 'eggman',
      offsets: [0, 0],
      flipX: false,
      isPixel: false,
      scale: 1,
    },
    animations: [
      {
        name: 'idle',
        prefix: 'Eggman_Idle',
        looped: true,
        offsets: [0, 0],
        frameRate: 24,
      },
      {
        name: 'singDOWN',
        prefix: 'Eggman_Down',
        looped: false,
        offsets: [70, -100],
        frameRate: 24,
      },
      {
        name: 'singLEFT',
        prefix: 'Eggman_Left',
        looped: false,
        offsets: [160, 95],
        frameRate: 24,
      },
      {
        name: 'singUP',
        prefix: 'Eggman_Up',
        looped: false,
        offsets: [100, 239],
        frameRate: 24,
      },
      {
        name: 'singRIGHT',
        prefix: 'Eggman_Right',
        looped: false,
        offsets: [0, 170],
        frameRate: 24,
      },
      {
        name: 'jijijija',
        prefix: 'Eggman_Laugh',
        looped: false,
        offsets: [0, 205],
        frameRate: 36,
      },
    ],
  },
  majin: {
    version: '1.0.0',
    offsets: [0, 0],
    danceEvery: 1,
    scale: 1,
    name: 'Majin Sonic (Variation 1)',
    cameraOffsets: [0, 0],
    flipX: false,
    isPixel: false,
    singTime: 4,
    flipY: false,
    healthIcon: {
      isPixel: false,
      offsets: [0, 0],
      scale: 1,
      flipX: false,
      id: 'majin',
    },
    assetPath: 'characters/SonicFunAssets',
    animations: [
      {
        offsets: [275, 54],
        prefix: 'SONICFUNLEFT',
        name: 'singLEFT',
        looped: false,
        frameRate: 24,
      },
      {
        offsets: [39, 196],
        prefix: 'SONICFUNUP',
        name: 'singUP',
        looped: false,
        frameRate: 24,
      },
      {
        offsets: [51, 45],
        prefix: 'SONICFUNDOWN',
        name: 'singDOWN',
        looped: false,
        frameRate: 24,
      },
      {
        offsets: [-51, 133],
        prefix: 'SONICFUNRIGHT',
        name: 'singRIGHT',
        looped: false,
        frameRate: 24,
      },
      {
        offsets: [-42, 183],
        prefix: 'SONICFUNIDLE',
        name: 'idle',
        looped: true,
        frameRate: 24,
      },
    ],
  },
  'majin-og': {
    danceEvery: 1,
    offsets: [0, -60],
    version: '1.0.0',
    scale: 1.4,
    cameraOffsets: [-50, 50],
    flipX: false,
    name: 'Majin Sonic (Variation 2)',
    singTime: 6,
    isPixel: false,
    healthIcon: {
      isPixel: false,
      offsets: [0, 0],
      scale: 1,
      id: 'majin-og',
      flipX: false,
    },
    assetPath: 'characters/MajinOG',
    animations: [
      {
        offsets: [-38, 42],
        frameRate: 24,
        prefix: 'Majin_IDLE',
        name: 'idle',
        looped: true,
      },
      {
        offsets: [-17, 116],
        frameRate: 32,
        prefix: 'Majin_UP',
        name: 'singUP',
        looped: false,
      },
      {
        offsets: [14, -23],
        frameRate: 32,
        prefix: 'Majin_DOWN',
        name: 'singDOWN',
        looped: false,
      },
      {
        offsets: [152, 43],
        frameRate: 32,
        prefix: 'Majin_LEFT',
        name: 'singLEFT',
        looped: false,
      },
      {
        offsets: [-40, 7],
        frameRate: 32,
        prefix: 'Majin_RIGHT',
        name: 'singRIGHT',
        looped: false,
      },
    ],
  },
  'bf-encore': {
    assetPath: 'characters/ENCORE_BF',
    name: 'Boyfriend (ENCORE)',
    singTime: 4,
    version: '1.0.0',
    scale: 1,
    flipX: true,
    isPixel: false,
    offsets: [85, 20],
    cameraOffsets: [0, 50],
    healthIcon: {
      id: 'bf',
      offsets: [0, 0],
      flipX: false,
      isPixel: false,
      scale: 1,
    },
    animations: [
      {
        name: 'singDOWNmiss',
        prefix: 'miss DOWN instance',
        looped: false,
        offsets: [-7, -53],
        frameRate: 24,
      },
      {
        name: 'singLEFTmiss',
        prefix: 'miss LEFT instance',
        looped: false,
        offsets: [107, -1],
        frameRate: 24,
      },
      {
        name: 'singRIGHTmiss',
        prefix: 'miss RIGHT instance',
        looped: false,
        offsets: [-24, -24],
        frameRate: 24,
      },
      {
        name: 'singUPmiss',
        prefix: 'miss UP instance',
        looped: false,
        offsets: [-35, 37],
        frameRate: 24,
      },
      {
        name: 'singLEFT',
        prefix: 'Left instance',
        looped: false,
        offsets: [105, -2],
        frameRate: 24,
      },
      {
        name: 'singDOWN',
        prefix: 'down instance',
        looped: false,
        offsets: [-7, -56],
        frameRate: 24,
      },
      {
        name: 'singUP',
        prefix: 'up instance',
        looped: false,
        offsets: [-25, 44],
        frameRate: 24,
      },
      {
        name: 'singRIGHT',
        prefix: 'right instance',
        looped: false,
        offsets: [-28, -27],
        frameRate: 24,
      },
      {
        name: 'idle',
        prefix: 'idle instance 1',
        looped: false,
        offsets: [-5, 0],
        frameRate: 24,
      },
    ],
  },
  'bf-endless': {
    version: '1.0.0',
    name: 'Boyfriend (Endless)',
    assetPath: 'characters/endless_bf',
    flipX: true,
    singTime: 4,
    isPixel: false,
    scale: 1,
    offsets: [0, 0],
    cameraOffsets: [-100, -100],
    healthIcon: {
      id: 'bf',
      isPixel: false,
      flipX: false,
      scale: 1,
    },
    animations: [
      { name: 'idle', prefix: 'BF idle dance', offsets: [-5, 0] },
      { name: 'singLEFT', prefix: 'BF NOTE LEFT0', offsets: [5, -6] },
      { name: 'singDOWN', prefix: 'BF NOTE DOWN0', offsets: [-20, -51] },
      { name: 'singUP', prefix: 'BF NOTE UP0', offsets: [-46, 27] },
      { name: 'singRIGHT', prefix: 'BF NOTE RIGHT0', offsets: [-48, -7] },
      { name: 'singLEFTmiss', prefix: 'BF NOTE LEFT MISS', offsets: [7, 19] },
      { name: 'singDOWNmiss', prefix: 'BF NOTE DOWN MISS', offsets: [-15, -19] },
      { name: 'singUPmiss', prefix: 'BF NOTE UP MISS', offsets: [-46, 27] },
      { name: 'singRIGHTmiss', prefix: 'BF NOTE RIGHT MISS', offsets: [-44, 22] },
      { name: 'hey', prefix: 'BF HEY', offsets: [-3, 5] },
      { name: 'hurt', prefix: 'BF hit', offsets: [14, 18] },
      { name: 'scared', prefix: 'BF idle shaking', offsets: [-4, 0] },
      { name: 'dodge', prefix: 'boyfriend dodge', offsets: [-10, -16] },
      { name: 'attack', prefix: 'boyfriend attack', offsets: [294, 267] },
      { name: 'pre-attack', prefix: 'bf pre attack', offsets: [-40, -40] },
    ],
  },
  bf: {
    version: '1.0.0',
    name: 'Boyfriend',
    assetPath: 'characters/BOYFRIEND',
    flipX: true,
    singTime: 4,
    isPixel: false,
    scale: 1,
    offsets: [0, 0],
    cameraOffsets: [-150, -100],
    healthIcon: {
      id: 'bf',
      isPixel: false,
      flipX: false,
      scale: 1,
    },
    animations: [
      { name: 'idle', prefix: 'BF idle dance', offsets: [-5, 0] },
      { name: 'singLEFT', prefix: 'BF NOTE LEFT0', offsets: [5, -6] },
      { name: 'singDOWN', prefix: 'BF NOTE DOWN0', offsets: [-20, -51] },
      { name: 'singUP', prefix: 'BF NOTE UP0', offsets: [-46, 27] },
      { name: 'singRIGHT', prefix: 'BF NOTE RIGHT0', offsets: [-48, -7] },
      { name: 'singLEFTmiss', prefix: 'BF NOTE LEFT MISS', offsets: [7, 19] },
      { name: 'singDOWNmiss', prefix: 'BF NOTE DOWN MISS', offsets: [-15, -19] },
      { name: 'singUPmiss', prefix: 'BF NOTE UP MISS', offsets: [-46, 27] },
      { name: 'singRIGHTmiss', prefix: 'BF NOTE RIGHT MISS', offsets: [-44, 22] },
    ],
  },
  'bf-pixel': {
    version: '1.0.0',
    name: 'Boyfriend (Pixel)',
    assetPath: 'characters/bfPixel',
    flipX: true,
    singTime: 4,
    isPixel: true,
    scale: 6,
    offsets: [0, 0],
    cameraOffsets: [-150, -100],
    healthIcon: {
      id: 'bf-pixel',
      isPixel: true,
      flipX: false,
      scale: 1,
    },
    animations: [
      { name: 'idle', prefix: 'BF IDLE', offsets: [0, 0] },
      { name: 'singLEFT', prefix: 'BF LEFT NOTE', offsets: [12, 0] },
      { name: 'singDOWN', prefix: 'BF DOWN NOTE', offsets: [0, -10] },
      { name: 'singUP', prefix: 'BF UP NOTE', offsets: [-6, 12] },
      { name: 'singRIGHT', prefix: 'BF RIGHT NOTE', offsets: [-12, 0] },
    ],
  },
  'sonic-exe': {
    version: '1.0.0',
    name: 'Sonic.EXE (Too Slow)',
    assetPath: 'characters/Sonic_EXE_Assets',
    flipX: false,
    singTime: 4,
    isPixel: false,
    scale: 1,
    offsets: [0, 0],
    cameraOffsets: [160, -100],
    healthIcon: {
      id: 'sonic-exe',
      isPixel: false,
      flipX: false,
      scale: 1,
    },
    animations: [
      { name: 'idle', prefix: 'SONICmoveIDLE', offsets: [0, 0], frameRate: 24 },
      { name: 'singLEFT', prefix: 'SONICmoveLEFT', offsets: [85, -12], frameRate: 24 },
      { name: 'singDOWN', prefix: 'SONICmoveDOWN', offsets: [20, -64], frameRate: 24 },
      { name: 'singUP', prefix: 'SONICmoveUP', offsets: [-18, 72], frameRate: 24 },
      { name: 'singRIGHT', prefix: 'SONICmoveRIGHT', offsets: [-64, -15], frameRate: 24 },
    ],
  },
  'ycr-exe': {
    version: '1.0.0',
    name: 'Sonic.EXE (YCR)',
    assetPath: 'characters/ycr_sonic',
    flipX: false,
    singTime: 4,
    isPixel: false,
    scale: 1.05,
    offsets: [0, 0],
    cameraOffsets: [150, -40],
    healthIcon: {
      id: 'ycr-exe',
      isPixel: false,
      flipX: false,
      scale: 1,
    },
    animations: [
      { name: 'idle', prefix: 'Idle', offsets: [0, 0], frameRate: 24 },
      { name: 'singLEFT', prefix: 'Left', offsets: [95, -10], frameRate: 24 },
      { name: 'singDOWN', prefix: 'Down', offsets: [30, -70], frameRate: 24 },
      { name: 'singUP', prefix: 'Up', offsets: [-15, 80], frameRate: 24 },
      { name: 'singRIGHT', prefix: 'Right', offsets: [-75, -10], frameRate: 24 },
    ],
  },
  'pixel-exe': {
    version: '1.0.0',
    name: 'Sonic.EXE (Pixel GreenHill)',
    assetPath: 'characters/Pixel_Sonic_EXE',
    flipX: false,
    singTime: 4,
    isPixel: true,
    scale: 6,
    offsets: [0, 0],
    cameraOffsets: [150, -40],
    healthIcon: {
      id: 'pixel-exe',
      isPixel: true,
      flipX: false,
      scale: 1,
    },
    animations: [
      { name: 'idle', prefix: 'Sonic_EXE_Pixel_Idle', offsets: [0, 0], frameRate: 24 },
      { name: 'singLEFT', prefix: 'Sonic_EXE_Pixel_Left', offsets: [48, 0], frameRate: 24 },
      { name: 'singDOWN', prefix: 'Sonic_EXE_Pixel_Down', offsets: [0, -36], frameRate: 24 },
      { name: 'singUP', prefix: 'Sonic_EXE_Pixel_Up', offsets: [0, 48], frameRate: 24 },
      { name: 'singRIGHT', prefix: 'Sonic_EXE_Pixel_Right', offsets: [-48, 0], frameRate: 24 },
    ],
  },
  xenophanes: {
    version: '1.0.0',
    name: 'Xenophanes (Phase 3)',
    assetPath: 'characters/Phase3_Sonic',
    flipX: false,
    singTime: 4.5,
    isPixel: false,
    scale: 1.18,
    offsets: [0, 0],
    cameraOffsets: [245, 200],
    healthIcon: {
      id: 'xenophanes',
      isPixel: false,
      flipX: false,
      scale: 1,
    },
    animations: [
      { name: 'idle', prefix: 'P3_Idle', offsets: [0, 0], frameRate: 24 },
      { name: 'singLEFT', prefix: 'P3_Left', offsets: [140, 20], frameRate: 24 },
      { name: 'singDOWN', prefix: 'P3_Down', offsets: [40, -95], frameRate: 24 },
      { name: 'singUP', prefix: 'P3_Up', offsets: [-30, 125], frameRate: 24 },
      { name: 'singRIGHT', prefix: 'P3_Right', offsets: [-110, 15], frameRate: 24 },
    ],
  },
  'tails-soul': {
    version: '1.0.0',
    name: 'Tails.EXE',
    assetPath: 'characters/Tails_Soul',
    flipX: false,
    singTime: 6.1,
    isPixel: false,
    scale: 1.0,
    offsets: [0, 120],
    cameraOffsets: [160, 0],
    healthIcon: {
      id: 'tails',
      isPixel: false,
      flipX: false,
      scale: 1,
    },
    animations: [
      { name: 'idle', prefix: 'Tails_Idle', offsets: [0, 0], frameRate: 24 },
      { name: 'singLEFT', prefix: 'Tails_Left', offsets: [90, -10], frameRate: 24 },
      { name: 'singDOWN', prefix: 'Tails_Down', offsets: [15, -65], frameRate: 24 },
      { name: 'singUP', prefix: 'Tails_Up', offsets: [-10, 75], frameRate: 24 },
      { name: 'singRIGHT', prefix: 'Tails_Right', offsets: [-70, -10], frameRate: 24 },
    ],
  },
};

// ============================================================================
// 3. ALL 4 STAGE JSON CONFIGURATIONS FROM THE MOD
// ============================================================================
export const MOD_STAGES: Record<StageConfigId, ModStageJson> = {
  Hill: {
    version: '1.0.0',
    name: 'Hill',
    cameraZoom: 0.65,
    props: [
      {
        name: 'TooSlowTreesFront',
        assetPath: 'stages/hill/TreesFront',
        zIndex: -13,
        position: [-1650, -1020],
        scale: [1.25, 1.25],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowBG',
        assetPath: 'stages/hill/BGSky',
        zIndex: 1,
        position: [-1800, -1270],
        scale: [1.305, 1.305],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowTreesMidBack',
        assetPath: 'stages/hill/TreesMidBack',
        zIndex: 2,
        position: [-1850, -1270],
        scale: [1.25, 1.25],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowTreesOuterMid',
        assetPath: 'stages/hill/TreesOuterMid1',
        zIndex: 3,
        position: [-1795, -1179],
        scale: [1.25, 1.25],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowTreesLeft',
        assetPath: 'stages/hill/TreesLeft',
        zIndex: 4,
        position: [-1854, -1065],
        scale: [1.25, 1.25],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TreesOuterMid2',
        assetPath: 'stages/hill/TreesOuterMid2',
        zIndex: 4,
        position: [-1916, -1269],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowTreesMid',
        assetPath: 'stages/hill/TreesMid',
        zIndex: 5,
        position: [-1850, -1270],
        scale: [1.25, 1.25],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowTreesRight',
        assetPath: 'stages/hill/TreesRight',
        zIndex: 6,
        position: [-1657, -1071],
        scale: [1.25, 1.25],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowGroundBG',
        assetPath: 'stages/hill/OuterBush',
        zIndex: 7,
        position: [-2000, -1120],
        scale: [1.45, 1.45],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowGround',
        assetPath: 'stages/hill/Grass',
        zIndex: 8,
        position: [-2000, -1070],
        scale: [1.405, 1.405],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowEgg',
        assetPath: 'stages/hill/DeadEgg',
        zIndex: 8,
        position: [-1950, -1120],
        scale: [1.405, 1.405],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowTail1',
        assetPath: 'stages/hill/DeadTailz1',
        zIndex: 9,
        position: [-1950, -1070],
        scale: [1.405, 1.405],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowTail3',
        assetPath: 'stages/hill/DeadTailz3',
        zIndex: 9,
        position: [-1700, -1300],
        scale: [1.405, 1.405],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowKnux',
        assetPath: 'stages/hill/DeadKnux',
        zIndex: 10,
        position: [-2050, -1120],
        scale: [1.405, 1.405],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowTail2',
        assetPath: 'stages/hill/DeadTailz2',
        zIndex: 10,
        position: [-1950, -1070],
        scale: [1.405, 1.405],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowTopOverlay',
        assetPath: 'stages/hill/OuterBushUp',
        zIndex: 13,
        position: [-1920, -1120],
        scale: [1.45, 1.45],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'TooSlowTrees',
        assetPath: 'stages/hill/TreesFG',
        zIndex: 500,
        position: [-1880, -970],
        scale: [1.35, 1.35],
        scroll: [1, 1],
        isPixel: false,
      },
    ],
    characters: {
      bf: {
        zIndex: 300,
        cameraOffsets: [-150, -100],
        position: [-230, 0],
      },
      gf: {
        zIndex: 100,
        position: [-500, -90],
        cameraOffsets: [-970, 50],
      },
      dad: {
        zIndex: 200,
        cameraOffsets: [160, -100],
        position: [-950, -70],
      },
    },
  },
  'Hill (Act 2)': {
    version: '1.0.0',
    name: 'Hill (Act 2)',
    cameraZoom: 0.65,
    props: [
      {
        name: 'GreenHill',
        assetPath: 'stages/GreenHill',
        zIndex: -50,
        position: [-1600, -1000],
        scale: [9, 9],
        scroll: [1, 1],
        isPixel: true,
      },
      {
        name: 'RunSky',
        assetPath: 'stages/hillAct2/Sky',
        zIndex: -6,
        position: [-1600.0, -1220.0],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'RunBG',
        assetPath: 'stages/hillAct2/BackBush',
        zIndex: -5,
        position: [-1600.0, -1220.0],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'RunTrees',
        assetPath: 'stages/hillAct2/trees',
        zIndex: -4,
        position: [-1650.0, -920.0],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'RunGround',
        assetPath: 'stages/hillAct2/TopBushes',
        zIndex: -3,
        position: [-1600.0, -920.0],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'RunTreesFront',
        assetPath: 'stages/hillAct2/TreesFront',
        zIndex: -2,
        position: [-1650.0, -1020.0],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'RunTopOverlay',
        assetPath: 'stages/hillAct2/TopOverlay',
        zIndex: -1,
        position: [-1650.0, -870.0],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
      },
    ],
    characters: {
      bf: {
        zIndex: 300,
        position: [0, 50],
        cameraOffsets: [-150, -100],
      },
      dad: {
        zIndex: 200,
        position: [-700, -100],
        cameraOffsets: [150, -40],
      },
      gf: {
        zIndex: 100,
        cameraOffsets: [0, 50],
        position: [-200, 0],
      },
    },
  },
  'Hill (Act 3)': {
    version: '1.0.0',
    name: 'Hill (Act 3)',
    cameraZoom: 0.9,
    props: [
      {
        name: 'p3_Stats',
        assetPath: 'stages/hillAct3/P3_SonicStat',
        zIndex: 1,
        position: [-1600, -720],
        scale: [5.5, 5.5],
        scroll: [1, 1],
        isPixel: false,
        startingAnimation: 'busk',
        animations: [
          {
            name: 'busk',
            prefix: 'TitleMenuSSBG instance 1',
            offsets: [0, 0],
            frameRate: 24,
            looped: true,
          },
        ],
      },
      {
        name: 'p3_Glitch',
        assetPath: 'stages/hillAct3/p3_glitch_noanim',
        zIndex: 3,
        position: [-1700.0, -720.0],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
        startingAnimation: 'batic',
      },
      {
        name: 'p3_tree',
        assetPath: 'stages/hillAct3/p3_Trees',
        zIndex: 5,
        position: [-1700.0, -720.0],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'p3_trs',
        assetPath: 'stages/hillAct3/p3_Trees2',
        zIndex: 10,
        position: [-1700.0, -720.0],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
      },
      {
        name: 'p3_floor',
        assetPath: 'stages/hillAct3/p3_Grass',
        zIndex: 20,
        position: [-1700.0, -820.0],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
      },
    ],
    characters: {
      bf: {
        zIndex: 300,
        position: [0, 425],
        cameraOffsets: [-100, -100],
      },
      dad: {
        zIndex: 200,
        position: [-730, -110],
        cameraOffsets: [245, 200],
      },
      gf: {
        zIndex: 100,
        cameraOffsets: [0, 50],
        position: [300, 130],
      },
    },
  },
  'Majin Forest': {
    version: '1.0.0',
    name: 'Majin Forest',
    cameraZoom: 0.9,
    props: [
      {
        name: 'endlessSky',
        assetPath: 'stages/majinForest/sonicFUNsky',
        zIndex: 0,
        position: [-1367, -705],
        scale: [1.02, 0.85],
        scroll: [1, 1],
        isPixel: false,
        alpha: 1,
      },
      {
        name: 'endlessBG',
        assetPath: 'stages/majinForest/Bush 1',
        zIndex: 1,
        position: [-1000, -120],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
        alpha: 1,
      },
      {
        name: 'endlessBG2',
        assetPath: 'stages/majinForest/Bush2',
        zIndex: 4,
        position: [-1104, -213],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
        alpha: 1,
      },
      {
        name: 'endlessTreeBack',
        assetPath: 'stages/majinForest/Majin Boppers Back',
        zIndex: 4,
        position: [-787, -803],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
        startingAnimation: 'tree',
      },
      {
        name: 'endlessTreeFront2',
        assetPath: 'stages/majinForest/Majin Boppers Front',
        zIndex: 6,
        position: [-1130, -926],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
        startingAnimation: 'tree',
      },
      {
        name: 'endlessTreeFront',
        assetPath: 'stages/majinForest/Majin Boppers Front',
        zIndex: 7,
        position: [1473, -973],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
        flipX: true,
        startingAnimation: 'tree',
      },
      {
        name: 'endlessGround',
        assetPath: 'stages/majinForest/floor BG',
        zIndex: 20,
        position: [-1361, -29],
        scale: [1, 1],
        scroll: [1, 1],
        isPixel: false,
        alpha: 1,
      },
      {
        name: 'endlessSonic',
        assetPath: 'stages/majinForest/majin FG2',
        zIndex: 1000,
        position: [-1300, 80],
        scale: [1, 1],
        scroll: [1.1, 1.1],
        isPixel: false,
        startingAnimation: 'idle',
      },
      {
        name: 'endlessSonic2',
        assetPath: 'stages/majinForest/majin FG1',
        zIndex: 1001,
        position: [0, 80],
        scale: [1, 1],
        scroll: [1.1, 1.1],
        isPixel: false,
        startingAnimation: 'idle',
      },
    ],
    characters: {
      bf: {
        zIndex: 300,
        position: [215.5, 321],
        scale: 1,
        alpha: 1,
        cameraOffsets: [-100, -100],
      },
      gf: {
        zIndex: 0,
        position: [-180.5, 225],
        scale: 1,
        alpha: 0, // GF is hidden in Majin Forest!
        cameraOffsets: [0, 50],
      },
      dad: {
        zIndex: 200,
        position: [-520, 494],
        scale: 1,
        alpha: 1,
        cameraOffsets: [250, -250],
      },
    },
  },
};

// Helper to resolve animation offset & prefix from the character JSON
export function getCharacterAnimationData(
  charId: OpponentCharacterId | PlayerCharacterId | GirlfriendCharacterId,
  pose: CharacterPose
): {
  offset: [number, number];
  prefix: string;
  frameRate: number;
  scale: number;
  flipX: boolean;
  isPixel: boolean;
  singTime: number;
} {
  const charDef = MOD_CHARACTERS[charId];
  if (!charDef) {
    return {
      offset: [0, 0],
      prefix: 'idle',
      frameRate: 24,
      scale: 1,
      flipX: false,
      isPixel: false,
      singTime: 4,
    };
  }

  const animNameMap: Record<CharacterPose, string> = {
    idle: 'idle',
    left: 'singLEFT',
    down: 'singDOWN',
    up: 'singUP',
    right: 'singRIGHT',
    miss: 'singDOWNmiss',
    singLEFTmiss: 'singLEFTmiss',
    singDOWNmiss: 'singDOWNmiss',
    singUPmiss: 'singUPmiss',
    singRIGHTmiss: 'singRIGHTmiss',
    jijijija: 'jijijija',
    hey: 'hey',
    scared: 'scared',
  };

  const targetName = animNameMap[pose] || 'idle';
  const foundAnim =
    charDef.animations.find((a) => a.name === targetName) ||
    charDef.animations[0];

  const baseOffsets = charDef.offsets || [0, 0];
  const animOffsets = foundAnim ? foundAnim.offsets : [0, 0];

  return {
    offset: [
      (baseOffsets[0] + animOffsets[0]) * 0.18,
      (baseOffsets[1] + animOffsets[1]) * 0.18,
    ],
    prefix: foundAnim ? foundAnim.prefix : 'idle',
    frameRate: foundAnim?.frameRate || 24,
    scale: charDef.scale,
    flipX: charDef.flipX,
    isPixel: charDef.isPixel,
    singTime: charDef.singTime,
  };
}
