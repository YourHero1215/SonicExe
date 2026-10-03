import {
  ChartNote,
  Direction,
  SongEvent,
  SongId,
  SongMetadata,
} from '../types/game';
import { buildExactEndlessChart } from './endlessChartData';
import { buildTooSlowNormalChart } from './tooSlowNormalData';
import { buildTooSlowEncoreChart } from './tooSlowEncoreData';
import { buildYcrNormalChart } from './ycrNormalData';
import { buildYcrEncoreChart } from './ycrEncoreData';
import { buildTripleTroubleChart } from './tripleTroubleData';

export const STAGE_IMAGES = {
  cursedGreenHill: '/src/assets/images/stage_green_hill_cursed_1790622310670.jpg',
  ycrCrimson: '/src/assets/images/stage_you_cant_run_1790622321777.jpg',
  tripleTrouble: '/src/assets/images/stage_triple_trouble_1790622331267.jpg',
  endlessMajin: '/src/assets/images/stage_endless_majin_1790622342153.jpg',
} as const;

export const SONGS: SongMetadata[] = [
  {
    id: 'too-slow',
    title: 'Too Slow',
    subtitle: 'Hill of the Void · V-Slice Chart (Wilde / Sandplanet)',
    modVersionOrigin: 'v3.0',
    composer: 'MarStarBro',
    bpm: 135,
    scrollSpeed: 3.2,
    durationSec: 186,
    difficultyLabel: 'HARD',
    difficultyStars: 4,
    stageImage: STAGE_IMAGES.cursedGreenHill,
    stageTheme: 'cursed-green-hill',
    initialOpponent: 'sonic-exe',
    initialPlayer: 'bf',
    accentColor: '#E11D48',
    opponentHealthColor: '#0E639C',
    playerHealthColor: '#31B0D1',
    description:
      'Corrupted Green Hill Zone featuring the 28.4s ominous piano intro, Static Notes, 84.6s laugh zoom, 129.5s "I am GOD" cutscene, and 164.4s SonicSpook.',
    mechanicsSummary: '0s Synced .OGG Stems · Static Notes · 2:09 Cutscene Lyrics',
  },
  {
    id: 'too-slow-encore',
    title: 'Too Slow Encore',
    subtitle: 'Hill (Erect / Encore) · Fake Sonic → Sonic.EXE',
    modVersionOrigin: 'v4.00000000',
    composer: 'MarStarBro + Saster (Chart: Wilde)',
    bpm: 135,
    scrollSpeed: 3.4,
    durationSec: 178,
    difficultyLabel: 'ENCORE',
    difficultyStars: 5,
    stageImage: STAGE_IMAGES.cursedGreenHill,
    stageTheme: 'cursed-green-hill',
    initialOpponent: 'sonicexefake',
    initialPlayer: 'bf-encore',
    accentColor: '#F43F5E',
    opponentHealthColor: '#0E639C',
    playerHealthColor: '#31B0D1',
    description:
      'Starts against Fake Sonic (sonicexefake.ogg) before transforming into Sonic.EXE at 43.2s, with the 1:33 "I\'m gonna getcha! I am GOD." cutscene and Erect/Encore static streams.',
    mechanicsSummary: 'sonicexefake.ogg Exclusive · 43.2s Boss Transformation · 1:33 Lyrics',
  },
  {
    id: 'you-cant-run',
    title: "You Can't Run",
    subtitle: 'Crimson Labyrinth · V-Slice Chart (Razencro)',
    modVersionOrigin: 'v3.0',
    composer: 'MarStarBro (Chart: Razencro)',
    bpm: 140,
    scrollSpeed: 3.5,
    durationSec: 156,
    difficultyLabel: 'HARD',
    difficultyStars: 4,
    stageImage: STAGE_IMAGES.ycrCrimson,
    stageTheme: 'ycr-crimson',
    initialOpponent: 'ycr-exe',
    initialPlayer: 'bf',
    accentColor: '#DC2626',
    opponentHealthColor: '#6F0E79',
    playerHealthColor: '#31B0D1',
    description:
      'Sonic.exe Phase 2 in the Crimson Labyrinth featuring the 13.7s laugh zoom, Static & Phantom notes, 56.5s–84.0s 16-bit Sega Genesis Green Hill pixel stage swap with Strumline Spins, and 2:31 "JUST DIE!!" finale.',
    mechanicsSummary: '0s Synced .OGG Stems · 56.5s 16-Bit Genesis Swap · Static & Phantom Notes',
  },
  {
    id: 'you-cant-run-encore',
    title: "You Can't Run Encore",
    subtitle: 'Crimson Labyrinth (Erect / Encore) · V-Slice Chart',
    modVersionOrigin: 'v4.00000000',
    composer: 'MarStarBro + Saster (Chart: Razencro)',
    bpm: 140,
    scrollSpeed: 3.5,
    durationSec: 208,
    difficultyLabel: 'ENCORE',
    difficultyStars: 5,
    stageImage: STAGE_IMAGES.ycrCrimson,
    stageTheme: 'ycr-crimson',
    initialOpponent: 'ycr-exe',
    initialPlayer: 'bf-encore',
    accentColor: '#EF4444',
    opponentHealthColor: '#6F0E79',
    playerHealthColor: '#31B0D1',
    description:
      'Official Erect/Encore chart by MarStarBro & Saster featuring the 56.5s–84.0s 16-bit Genesis swap, 2:21 "THE GAZE OF A GOD IS LEFT BY NONE" spoken verse, and 3:16 "JUST... DIE!!" climax.',
    mechanicsSummary: '0s Synced .OGG Stems · 2:21 Gaze of a God Lyrics · Static Barrage',
  },
  {
    id: 'triple-trouble',
    title: 'Triple Trouble',
    subtitle: 'Xenophanes & The Three Souls · Full 8:29 Marathon',
    modVersionOrigin: 'v3.0',
    composer: 'MarStarBro, Juno & Punkett',
    bpm: 146,
    scrollSpeed: 2.9,
    durationSec: 509,
    difficultyLabel: 'NIGHTMARE',
    difficultyStars: 5,
    stageImage: STAGE_IMAGES.tripleTrouble,
    stageTheme: 'triple-trouble-void',
    initialOpponent: 'tails-soul',
    initialPlayer: 'bf',
    accentColor: '#A855F7',
    opponentHealthColor: '#6E737B',
    playerHealthColor: '#31B0D1',
    description:
      'Full 8:29 boss marathon against Tails.EXE, Xenophanes (Beast), Knuckles.EXE (with perspective lane flip!), and Eggman.EXE featuring Static & Phantom notes and the 08:28 Sound Test numbers.',
    mechanicsSummary: 'Perspective Lane Flip · Static & Phantom Notes · 4 Bosses (8:29)',
  },
  {
    id: 'endless',
    title: 'Endless',
    subtitle: 'Majin Forest · V-Slice Official Chart',
    modVersionOrigin: 'v3.0',
    composer: 'MarStarBro (Chart: Echolocated)',
    bpm: 155,
    scrollSpeed: 3.0,
    durationSec: 162,
    difficultyLabel: 'INFINITE',
    difficultyStars: 4,
    stageImage: STAGE_IMAGES.endlessMajin,
    stageTheme: 'endless-majin',
    initialOpponent: 'majin',
    initialPlayer: 'bf',
    accentColor: '#3B82F6',
    opponentHealthColor: '#1D4ED8',
    playerHealthColor: '#38BDF8',
    description:
      'Fun is Infinite with Sega Enterprises! Face off against Majin Sonic (SonicFunAssets) in Majin Forest with synchronized multi-stem .ogg playback, Strumline Spins, and the 85.9s Majin NoteSwap & Zoom drop.',
    mechanicsSummary: 'Synchronized 0s .OGG Stems · Strumline Spins · Majin NoteSwap (1:25)',
  },
  {
    id: 'endless-og',
    title: 'Endless OG',
    subtitle: 'Majin Forest · Variation 2 (MajinOG)',
    modVersionOrigin: 'v4.00000000',
    composer: 'MarStarBro (Original / Erect Mix)',
    bpm: 155,
    scrollSpeed: 3.0,
    durationSec: 162,
    difficultyLabel: 'INFINITE',
    difficultyStars: 4,
    stageImage: STAGE_IMAGES.endlessMajin,
    stageTheme: 'endless-majin',
    initialOpponent: 'majin-og',
    initialPlayer: 'bf',
    accentColor: '#2563EB',
    opponentHealthColor: '#1E40AF',
    playerHealthColor: '#60A5FA',
    description:
      'Features Majin Sonic Variation 2 (MajinOG 1.4x scale) and Boyfriend (Endless) on the Majin Forest stage with synchronized 0s .ogg stem support.',
    mechanicsSummary: 'MajinOG (1.4x Scale) · Synchronized 0s .OGG Stems · Strumline Spins',
  },
];

// Musical scales & motif generators for each song so every note has authentic pitch & rhythm
const SCALES: Record<SongId, number[]> = {
  'too-slow': [50, 53, 55, 56, 57, 60, 62, 65], // D minor / Phrygian horror motif
  'too-slow-encore': [52, 55, 57, 58, 59, 62, 64, 67], // E minor / Phrygian Encore
  'you-cant-run': [48, 51, 53, 54, 55, 58, 60, 63], // C minor / Genesis Green Hill corrupted
  'you-cant-run-encore': [50, 53, 55, 56, 57, 60, 62, 65],
  'triple-trouble': [51, 54, 56, 57, 58, 61, 63, 66], // Eb minor Xenophanes motif
  'endless': [53, 56, 58, 60, 61, 63, 65, 68], // F minor Sega CD Fun is Infinite motif
  'endless-og': [53, 56, 58, 60, 61, 63, 65, 68],
};

// Characteristic melodic patterns (lane + pitch index + beat subdivision)
interface PatternStep {
  beatOffset: number;
  lane: Direction;
  scaleIdx: number;
  sustainBeats?: number;
  special?: 'normal' | 'static' | 'phantom' | 'ring';
}

const MOTIFS: Record<string, PatternStep[]> = {
  // Iconic Too Slow opening & chorus
  tooSlowVerse: [
    { beatOffset: 0, lane: 0, scaleIdx: 0 },
    { beatOffset: 0.5, lane: 2, scaleIdx: 2 },
    { beatOffset: 1, lane: 3, scaleIdx: 4, sustainBeats: 0.75 },
    { beatOffset: 2, lane: 1, scaleIdx: 1 },
    { beatOffset: 2.5, lane: 2, scaleIdx: 3 },
    { beatOffset: 3, lane: 0, scaleIdx: 0, sustainBeats: 0.75 },
  ],
  tooSlowFast: [
    { beatOffset: 0, lane: 0, scaleIdx: 0 },
    { beatOffset: 0.25, lane: 1, scaleIdx: 1 },
    { beatOffset: 0.5, lane: 2, scaleIdx: 2 },
    { beatOffset: 0.75, lane: 3, scaleIdx: 4 },
    { beatOffset: 1.0, lane: 2, scaleIdx: 3 },
    { beatOffset: 1.5, lane: 1, scaleIdx: 1, special: 'static' },
    { beatOffset: 2.0, lane: 3, scaleIdx: 5 },
    { beatOffset: 2.25, lane: 2, scaleIdx: 4 },
    { beatOffset: 2.5, lane: 0, scaleIdx: 2 },
    { beatOffset: 3.0, lane: 1, scaleIdx: 0, sustainBeats: 0.75 },
  ],
  encoreStream: [
    { beatOffset: 0, lane: 0, scaleIdx: 0 },
    { beatOffset: 0.25, lane: 2, scaleIdx: 3 },
    { beatOffset: 0.5, lane: 1, scaleIdx: 2 },
    { beatOffset: 0.75, lane: 3, scaleIdx: 5 },
    { beatOffset: 1.0, lane: 0, scaleIdx: 1, special: 'ring' },
    { beatOffset: 1.25, lane: 1, scaleIdx: 2 },
    { beatOffset: 1.5, lane: 2, scaleIdx: 4 },
    { beatOffset: 1.75, lane: 3, scaleIdx: 6 },
    { beatOffset: 2.0, lane: 2, scaleIdx: 5, sustainBeats: 0.5 },
    { beatOffset: 2.75, lane: 1, scaleIdx: 3, special: 'static' },
    { beatOffset: 3.0, lane: 0, scaleIdx: 0, sustainBeats: 0.75 },
  ],
  // You Can't Run corrupted Green Hill Genesis motif
  ycrGenesis: [
    { beatOffset: 0, lane: 2, scaleIdx: 4 },
    { beatOffset: 0.5, lane: 0, scaleIdx: 2 },
    { beatOffset: 1.0, lane: 2, scaleIdx: 4 },
    { beatOffset: 1.5, lane: 1, scaleIdx: 3 },
    { beatOffset: 2.0, lane: 3, scaleIdx: 5, sustainBeats: 0.5 },
    { beatOffset: 2.75, lane: 1, scaleIdx: 2 },
    { beatOffset: 3.0, lane: 0, scaleIdx: 0, sustainBeats: 0.75 },
  ],
  // Triple Trouble Souls & Xenophanes crystal flurry
  ttSouls: [
    { beatOffset: 0, lane: 0, scaleIdx: 0 },
    { beatOffset: 0.5, lane: 1, scaleIdx: 1 },
    { beatOffset: 0.75, lane: 2, scaleIdx: 3 },
    { beatOffset: 1.25, lane: 3, scaleIdx: 4, special: 'ring' },
    { beatOffset: 1.75, lane: 2, scaleIdx: 2 },
    { beatOffset: 2.0, lane: 0, scaleIdx: 0 },
    { beatOffset: 2.5, lane: 3, scaleIdx: 5, special: 'phantom' },
    { beatOffset: 3.0, lane: 1, scaleIdx: 1, sustainBeats: 0.75 },
  ],
  ttXeno: [
    { beatOffset: 0, lane: 3, scaleIdx: 6 },
    { beatOffset: 0.25, lane: 2, scaleIdx: 5 },
    { beatOffset: 0.5, lane: 1, scaleIdx: 3 },
    { beatOffset: 0.75, lane: 0, scaleIdx: 1 },
    { beatOffset: 1.0, lane: 2, scaleIdx: 4, special: 'static' },
    { beatOffset: 1.5, lane: 3, scaleIdx: 7 },
    { beatOffset: 1.75, lane: 1, scaleIdx: 4 },
    { beatOffset: 2.0, lane: 0, scaleIdx: 2, special: 'ring' },
    { beatOffset: 2.5, lane: 2, scaleIdx: 5 },
    { beatOffset: 3.0, lane: 3, scaleIdx: 6, sustainBeats: 0.75 },
  ],
  // Endless iconic Majin synth lead ("da-da-da-da-da-da-DAA-da")
  endlessGroove: [
    { beatOffset: 0, lane: 0, scaleIdx: 0 },
    { beatOffset: 0.5, lane: 2, scaleIdx: 3 },
    { beatOffset: 1.0, lane: 1, scaleIdx: 2 },
    { beatOffset: 1.5, lane: 3, scaleIdx: 4 },
    { beatOffset: 2.0, lane: 2, scaleIdx: 5 },
    { beatOffset: 2.25, lane: 1, scaleIdx: 3 },
    { beatOffset: 2.5, lane: 0, scaleIdx: 2 },
    { beatOffset: 3.0, lane: 3, scaleIdx: 6, sustainBeats: 0.75 },
  ],
  endlessDrop: [
    { beatOffset: 0, lane: 3, scaleIdx: 7 },
    { beatOffset: 0.25, lane: 2, scaleIdx: 5 },
    { beatOffset: 0.5, lane: 1, scaleIdx: 3 },
    { beatOffset: 0.75, lane: 2, scaleIdx: 5 },
    { beatOffset: 1.0, lane: 3, scaleIdx: 6 },
    { beatOffset: 1.5, lane: 0, scaleIdx: 2 },
    { beatOffset: 2.0, lane: 1, scaleIdx: 3 },
    { beatOffset: 2.5, lane: 2, scaleIdx: 5 },
    { beatOffset: 3.0, lane: 0, scaleIdx: 0, sustainBeats: 0.75 },
  ],
};

export function generateSongChartAndEvents(songId: SongId): {
  notes: ChartNote[];
  events: SongEvent[];
} {
  if (songId === 'too-slow') {
    return buildTooSlowNormalChart();
  }
  if (songId === 'too-slow-encore') {
    return buildTooSlowEncoreChart();
  }
  if (songId === 'you-cant-run') {
    return buildYcrNormalChart();
  }
  if (songId === 'you-cant-run-encore') {
    return buildYcrEncoreChart();
  }
  if (songId === 'triple-trouble') {
    return buildTripleTroubleChart();
  }
  return buildExactEndlessChart(songId);
}
