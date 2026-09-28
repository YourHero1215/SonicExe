import {
  ChartNote,
  Direction,
  SongEvent,
  SongId,
  SongMetadata,
} from '../types/game';

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
    subtitle: 'Hill of the Void · Act I',
    modVersionOrigin: 'v3.0',
    composer: 'MarStarBro & Saster',
    bpm: 135,
    scrollSpeed: 2.9,
    durationSec: 78,
    difficultyLabel: 'HARD',
    difficultyStars: 4,
    stageImage: STAGE_IMAGES.cursedGreenHill,
    stageTheme: 'cursed-green-hill',
    initialOpponent: 'sonic-exe',
    initialPlayer: 'bf',
    accentColor: '#E11D48',
    opponentHealthColor: '#1E1B4B',
    playerHealthColor: '#38BDF8',
    description:
      'Corrupted Green Hill Zone where a disguised hedgehog drops the facade mid-song with a sudden BPM surge and static screamer.',
    mechanicsSummary: 'Static Notes · Mid-Song BPM Surge · "I AM GOD" Cutscene',
  },
  {
    id: 'too-slow-encore',
    title: 'Too Slow Encore',
    subtitle: 'Blood Moon Remix · Encore Week',
    modVersionOrigin: 'v4.00000000',
    composer: 'MarStarBro & Saster (Encore Mix)',
    bpm: 162,
    scrollSpeed: 3.3,
    durationSec: 82,
    difficultyLabel: 'ENCORE',
    difficultyStars: 5,
    stageImage: STAGE_IMAGES.cursedGreenHill,
    stageTheme: 'cursed-green-hill',
    initialOpponent: 'sonic-exe',
    initialPlayer: 'bf-encore',
    accentColor: '#F43F5E',
    opponentHealthColor: '#881337',
    playerHealthColor: '#06B6D4',
    description:
      'Overclocked v3.0/v4.00000000 Encore arrangement featuring syncopated double-note streams, Encore Boyfriend, and Golden Ring shields.',
    mechanicsSummary: 'Ring Shield Mechanic · High-Speed Streams · Encore Stage Tint',
  },
  {
    id: 'you-cant-run',
    title: "You Can't Run",
    subtitle: 'Crimson Labyrinth · Act II',
    modVersionOrigin: 'v3.0',
    composer: 'MarStarBro & KGBepis',
    bpm: 142,
    scrollSpeed: 3.1,
    durationSec: 84,
    difficultyLabel: 'HARD',
    difficultyStars: 4,
    stageImage: STAGE_IMAGES.ycrCrimson,
    stageTheme: 'ycr-crimson',
    initialOpponent: 'ycr-exe',
    initialPlayer: 'bf',
    accentColor: '#DC2626',
    opponentHealthColor: '#991B1B',
    playerHealthColor: '#38BDF8',
    description:
      'Sonic.exe grows more unhinged in the burning red crystal forest before warping both fighters into a 16-bit Sega Genesis Green Hill pixel stage.',
    mechanicsSummary: '16-Bit Sega Genesis Stage Swap · Static Notes · Pixel Sprites',
  },
  {
    id: 'you-cant-run-encore',
    title: "You Can't Run Encore",
    subtitle: 'Crystallized Chaos · Encore Week',
    modVersionOrigin: 'v4.00000000',
    composer: 'SimplyCrispy & MarStarBro',
    bpm: 168,
    scrollSpeed: 3.45,
    durationSec: 86,
    difficultyLabel: 'ENCORE',
    difficultyStars: 5,
    stageImage: STAGE_IMAGES.ycrCrimson,
    stageTheme: 'ycr-crimson',
    initialOpponent: 'ycr-exe',
    initialPlayer: 'bf-encore',
    accentColor: '#EF4444',
    opponentHealthColor: '#DC2626',
    playerHealthColor: '#22D3EE',
    description:
      'Relentless v4.00000000 Encore rechart with rapid stair patterns, extended 16-bit Genesis chiptune breakdown, and Ring survival.',
    mechanicsSummary: 'Extended 16-Bit Pixel Breakdown · Ring Mechanic · 168 BPM',
  },
  {
    id: 'triple-trouble',
    title: 'Triple Trouble',
    subtitle: 'Xenophanes & The Three Souls · Finale',
    modVersionOrigin: 'v3.0',
    composer: 'MarStarBro, Punkett & Uphoric',
    bpm: 154,
    scrollSpeed: 3.25,
    durationSec: 112,
    difficultyLabel: 'NIGHTMARE',
    difficultyStars: 5,
    stageImage: STAGE_IMAGES.tripleTrouble,
    stageTheme: 'triple-trouble-void',
    initialOpponent: 'tails-soul',
    initialPlayer: 'bf',
    accentColor: '#A855F7',
    opponentHealthColor: '#6B21A8',
    playerHealthColor: '#38BDF8',
    description:
      'The legendary multi-phase boss marathon against Soul Tails, Crystallized Xenophanes, Soul Knuckles (with lane perspective flip!), and Soul Eggman.',
    mechanicsSummary: '4 Boss Swaps · Perspective Lane Flip · Golden Rings & Phantom Notes',
  },
  {
    id: 'endless',
    title: 'Endless',
    subtitle: 'Sound Test · FM 46 PCM 12',
    modVersionOrigin: 'v3.0',
    composer: 'MarStarBro',
    bpm: 155,
    scrollSpeed: 3.05,
    durationSec: 80,
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
      'Fun is Infinite with Sega Enterprises! Face off against Majin Sonic in the cobalt blue forest featuring the iconic "THREE, TWO, ONE, GO!" drop.',
    mechanicsSummary: '"THREE, TWO, ONE, GO!" Drop · Blue HUD Theme · Groovy Syncopation',
  },
  {
    id: 'endless-og',
    title: 'Endless OG',
    subtitle: 'Legacy v1.5 / v4.00000000 Sound Test',
    modVersionOrigin: 'v4.00000000',
    composer: 'MarStarBro (Original Mix)',
    bpm: 155,
    scrollSpeed: 2.95,
    durationSec: 78,
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
      'The classic original chart and vintage high-contrast Majin Sonic sprite shading preserved in the v4.00000000 Sound Test vault.',
    mechanicsSummary: 'Classic v1.5 Charting · Vintage Majin Sprite · Sega CD FM Lead',
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
  const song = SONGS.find((s) => s.id === songId) || SONGS[0];
  const beatMs = 60000 / song.bpm;
  const measureMs = beatMs * 4;
  const totalMeasures = Math.floor((song.durationSec * 1000) / measureMs);
  const scale = SCALES[songId];

  const notes: ChartNote[] = [];
  const events: SongEvent[] = [];
  let noteCounter = 0;

  const pushMotif = (
    measureIndex: number,
    isPlayer: boolean,
    motif: PatternStep[],
    pitchShift = 0,
    mirrorLanes = false
  ) => {
    const baseTime = measureIndex * measureMs;
    for (const step of motif) {
      const timeMs = Math.round(baseTime + step.beatOffset * beatMs);
      const lane: Direction = mirrorLanes
        ? ((3 - step.lane) as Direction)
        : step.lane;
      const pitchMidi =
        scale[Math.min(scale.length - 1, Math.max(0, step.scaleIdx))] +
        pitchShift +
        (isPlayer ? 12 : 0);
      const sustainMs = step.sustainBeats
        ? Math.round(step.sustainBeats * beatMs)
        : 0;

      notes.push({
        id: `${songId}-n-${noteCounter++}`,
        timeMs,
        lane,
        isPlayer,
        sustainMs,
        special: step.special || 'normal',
        pitchMidi,
      });
    }
  };

  // Configure authentic song-specific events (stage transitions, boss swaps, countdowns)
  if (songId === 'too-slow' || songId === 'too-slow-encore') {
    events.push({
      timeMs: Math.round(measureMs * 8),
      type: 'screamer_text',
      value: "I'M GONNA GETCHA!",
    });
    events.push({
      timeMs: Math.round(measureMs * 16),
      type: 'screamer_text',
      value: 'I AM GOD.',
    });
    events.push({
      timeMs: Math.round(measureMs * 16),
      type: 'red_flash',
      value: 'high',
    });
  } else if (songId === 'you-cant-run' || songId === 'you-cant-run-encore') {
    // Switch to 16-bit Sega Genesis Pixel Green Hill Zone mid-song and back!
    events.push({
      timeMs: Math.round(measureMs * 10),
      type: 'stage_swap',
      value: 'ycr-pixel-genesis',
    });
    events.push({
      timeMs: Math.round(measureMs * 10),
      type: 'character_swap',
      value: 'pixel-exe:bf-pixel',
    });
    events.push({
      timeMs: Math.round(measureMs * 10),
      type: 'screamer_text',
      value: 'SEGA 16-BIT ZONE ACT 2',
    });
    events.push({
      timeMs: Math.round(measureMs * 20),
      type: 'stage_swap',
      value: 'ycr-crimson',
    });
    events.push({
      timeMs: Math.round(measureMs * 20),
      type: 'character_swap',
      value: `ycr-exe:${songId === 'you-cant-run-encore' ? 'bf-encore' : 'bf'}`,
    });
    events.push({
      timeMs: Math.round(measureMs * 20),
      type: 'screamer_text',
      value: "YOU CAN'T RUN!",
    });
  } else if (songId === 'triple-trouble') {
    // 1. Starts with Soul Tails
    // 2. Xenophanes Act 1
    events.push({
      timeMs: Math.round(measureMs * 8),
      type: 'character_swap',
      value: 'xenophanes:bf',
    });
    events.push({
      timeMs: Math.round(measureMs * 8),
      type: 'screamer_text',
      value: 'XENOPHANES AWAKENS',
    });
    // 3. Soul Knuckles + Perspective Lane Flip!
    events.push({
      timeMs: Math.round(measureMs * 16),
      type: 'character_swap',
      value: 'knuckles-soul:bf',
    });
    events.push({
      timeMs: Math.round(measureMs * 16),
      type: 'flip_lanes',
      value: 'true',
    });
    events.push({
      timeMs: Math.round(measureMs * 16),
      type: 'screamer_text',
      value: 'SOUL KNUCKLES · PERSPECTIVE FLIP!',
    });
    // 4. Xenophanes Act 2
    events.push({
      timeMs: Math.round(measureMs * 24),
      type: 'character_swap',
      value: 'xenophanes:bf',
    });
    events.push({
      timeMs: Math.round(measureMs * 24),
      type: 'flip_lanes',
      value: 'false',
    });
    // 5. Soul Eggman
    events.push({
      timeMs: Math.round(measureMs * 30),
      type: 'character_swap',
      value: 'eggman-soul:bf',
    });
    events.push({
      timeMs: Math.round(measureMs * 30),
      type: 'screamer_text',
      value: 'SOUL EGGMAN LAUGHS',
    });
    // 6. Final Xenophanes Climax
    events.push({
      timeMs: Math.round(measureMs * 36),
      type: 'character_swap',
      value: 'xenophanes:bf',
    });
    events.push({
      timeMs: Math.round(measureMs * 36),
      type: 'red_flash',
      value: 'high',
    });
    events.push({
      timeMs: Math.round(measureMs * 36),
      type: 'screamer_text',
      value: 'FINAL ACT: TRIPLE TROUBLE',
    });
  } else if (songId === 'endless' || songId === 'endless-og') {
    // Iconic "THREE! TWO! ONE! GO!" Majin countdown
    const dropMeasure = 10;
    events.push({
      timeMs: Math.round(measureMs * dropMeasure - beatMs * 4),
      type: 'majin_countdown',
      value: 'THREE!',
    });
    events.push({
      timeMs: Math.round(measureMs * dropMeasure - beatMs * 3),
      type: 'majin_countdown',
      value: 'TWO!',
    });
    events.push({
      timeMs: Math.round(measureMs * dropMeasure - beatMs * 2),
      type: 'majin_countdown',
      value: 'ONE!',
    });
    events.push({
      timeMs: Math.round(measureMs * dropMeasure - beatMs * 1),
      type: 'majin_countdown',
      value: 'GO!! FUN IS INFINITE!',
    });
  }

  // Generate measure-by-measure call-and-response + duet sections
  for (let m = 1; m < totalMeasures - 1; m++) {
    const isEncore = songId.includes('encore');
    let chosenMotif = MOTIFS.tooSlowVerse;

    if (songId === 'too-slow') {
      chosenMotif = m >= 12 ? MOTIFS.tooSlowFast : MOTIFS.tooSlowVerse;
    } else if (songId === 'too-slow-encore') {
      chosenMotif = m % 2 === 0 ? MOTIFS.encoreStream : MOTIFS.tooSlowFast;
    } else if (songId === 'you-cant-run') {
      chosenMotif = m >= 10 && m < 20 ? MOTIFS.ycrGenesis : MOTIFS.tooSlowFast;
    } else if (songId === 'you-cant-run-encore') {
      chosenMotif =
        m >= 10 && m < 20 ? MOTIFS.ycrGenesis : MOTIFS.encoreStream;
    } else if (songId === 'triple-trouble') {
      chosenMotif =
        (m >= 8 && m < 16) || (m >= 24 && m < 30) || m >= 36
          ? MOTIFS.ttXeno
          : MOTIFS.ttSouls;
    } else if (songId === 'endless' || songId === 'endless-og') {
      chosenMotif = m >= 10 ? MOTIFS.endlessDrop : MOTIFS.endlessGroove;
    }

    const pitchShift = (m % 4 === 2 ? 2 : m % 4 === 3 ? -2 : 0) + (isEncore ? 2 : 0);
    const mirror = m % 3 === 0;

    // Odd measures: Opponent leads; Even measures: Player answers; Every 8th measure: Duet climax!
    if (m % 8 === 7 || m % 8 === 0) {
      pushMotif(m, false, chosenMotif, pitchShift, mirror);
      pushMotif(m, true, chosenMotif, pitchShift, mirror);
    } else if (m % 2 === 1) {
      pushMotif(m, false, chosenMotif, pitchShift, mirror);
    } else {
      pushMotif(m, true, chosenMotif, pitchShift, mirror);
    }
  }

  notes.sort((a, b) => a.timeMs - b.timeMs);
  return { notes, events };
}
