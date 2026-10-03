import React, { useCallback, useEffect, useRef } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import {
  CharacterPose,
  ChartNote,
  Direction,
  GameplaySettings,
  getVideoQualityResolution,
  JudgementTier,
  KeybindConfig,
  OpponentCharacterId,
  PlayerCharacterId,
  PlayStats,
  SongEvent,
  SongMetadata,
  StageThemeId,
} from '../types/game';
import { generateSongChartAndEvents } from '../data/songs';
import { soundEngine } from '../audio/soundEngine';
import {
  calculateAccuracy,
  calculateGrade,
  drawBloodNoteSplash,
  drawFnfArrow,
  drawFnfSustainTail,
  drawHealthIcon,
  drawJudgmentAndComboPopup,
  drawSonicJumpscare,
  drawMajinForestBoppers,
  drawOpponentSprite,
  drawPixelGenesisStage,
  drawPlayerSprite,
  drawRedVignetteOverlay,
  drawSpeakerGirlfriend,
  drawTripleTroubleRingCounter,
  formatPsychRating,
  getCharacterHealthColor,
  LANE_COLORS,
  preloadSpritesForSong,
} from '../canvas/spriteRenderer';
import {
  drawEndlessMajinStage,
  drawGreenHillCleanStage,
  drawPolishedStageBackLayers,
  drawPolishedStageForegroundLayer,
  drawTripleTroubleForegroundLayer,
  drawTripleTroubleStage,
  drawYcrCrimsonStage,
} from '../canvas/polishedStageRenderer';

// Utility to scale note density per measure based on settings.noteDensityMultiplier
function scaleChartNoteDensity(
  baseChart: { notes: ChartNote[]; events: SongEvent[] },
  densityMultiplier: number
): { notes: ChartNote[]; events: SongEvent[] } {
  const mult = Math.max(0.5, Math.min(2.5, densityMultiplier || 1.0));
  if (mult === 1.0) {
    return {
      notes: baseChart.notes.map((n) => ({ ...n })),
      events: baseChart.events,
    };
  }

  const origNotes = baseChart.notes;
  let scaledNotes: ChartNote[] = [];

  if (mult < 1.0) {
    // Subsample notes to decrease notes per measure
    const step = Math.round(1 / mult);
    scaledNotes = origNotes
      .filter((note, idx) => {
        if (note.special === 'ring') return true;
        return idx % step === 0;
      })
      .map((n) => ({ ...n }));
  } else {
    // Increase notes per measure by inserting intermediate rhythm notes
    const extraRatio = mult - 1.0;
    scaledNotes = origNotes.map((n) => ({ ...n }));
    const newExtraNotes: ChartNote[] = [];

    for (let i = 0; i < origNotes.length - 1; i++) {
      const n1 = origNotes[i];
      const n2 = origNotes[i + 1];
      if (
        n1.isPlayer === n2.isPlayer &&
        n1.lane === n2.lane &&
        n2.timeMs - n1.timeMs > 180 &&
        n2.timeMs - n1.timeMs < 1200
      ) {
        if (Math.random() < extraRatio * 0.85) {
          const midTime = Math.round((n1.timeMs + n2.timeMs) / 2);
          newExtraNotes.push({
            id: `extra_${n1.lane}_${midTime}_${Math.random()}`,
            timeMs: midTime,
            lane: n1.lane,
            isPlayer: n1.isPlayer,
            sustainMs: 0,
            pitchMidi: n1.pitchMidi,
            special: 'normal',
            hit: false,
            missed: false,
            holding: false,
          });
        }
      }
    }
    scaledNotes = [...scaledNotes, ...newExtraNotes].sort(
      (a, b) => a.timeMs - b.timeMs
    );
  }

  return { notes: scaledNotes, events: baseChart.events };
}

// Utility to render TV VHS static screen transition when jumpscares are disabled
function drawFullStaticTransition(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  progress: number
) {
  ctx.save();
  const alpha = Math.max(0, Math.min(1, progress));
  ctx.fillStyle = `rgba(10, 10, 15, ${alpha * 0.96})`;
  ctx.fillRect(0, 0, w, h);

  const numLines = 55;
  for (let i = 0; i < numLines; i++) {
    const y = Math.random() * h;
    const lh = 3 + Math.random() * 8;
    const val = Math.floor(180 + Math.random() * 75);
    ctx.fillStyle = `rgba(${val}, ${val}, ${val}, ${alpha * 0.85})`;
    ctx.fillRect(0, y, w, lh);
  }

  // Red static glitch bar
  ctx.fillStyle = `rgba(220, 38, 38, ${alpha * 0.45})`;
  ctx.fillRect(0, Math.random() * h, w, 10);
  ctx.restore();
}

interface FnfStageCanvasProps {
  song: SongMetadata;
  keybinds: KeybindConfig;
  settings: GameplaySettings;
  isPaused: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onPauseToggle: () => void;
  onSongComplete: (finalStats: PlayStats) => void;
  onGameOver: (finalStats: PlayStats) => void;
  onRestart: () => void;
}

const DIRECTION_FROM_POSE: Record<Direction, CharacterPose> = {
  0: 'left',
  1: 'down',
  2: 'up',
  3: 'right',
};

export const FnfStageCanvas: React.FC<FnfStageCanvasProps> = ({
  song,
  keybinds,
  settings,
  isPaused,
  isFullscreen,
  onToggleFullscreen,
  onPauseToggle,
  onSongComplete,
  onGameOver,
  onRestart,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stageImagesRef = useRef<Record<string, HTMLImageElement>>({});
  useEffect(() => {
    const src = song.stageImage;
    if (src && !stageImagesRef.current[src]) {
      const img = new Image();
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.src = src;
      stageImagesRef.current[src] = img;
    }
    preloadSpritesForSong(song.id);
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.load('32px "VCR OSD Mono"').catch(() => {});
      document.fonts.load('18px "VCR OSD Mono"').catch(() => {});
    }
  }, [song.id, song.stageImage]);

  const chartRef = useRef<{ notes: ChartNote[]; events: SongEvent[] }>({
    notes: [],
    events: [],
  });
  const firstActiveNoteIdxRef = useRef<number>(0);
  const nextEventIdxRef = useRef<number>(0);
  const songTimeMsRef = useRef<number>(-2000);
  const lastFramePerfRef = useRef<number>(0);
  const lastSubBeatRef = useRef<number>(-1);
  const stemsStartedAtZeroRef = useRef<boolean>(false);

  const opponentCharRef = useRef<OpponentCharacterId>(song.initialOpponent);
  const playerCharRef = useRef<PlayerCharacterId>(song.initialPlayer);
  const stageThemeRef = useRef<StageThemeId>(song.stageTheme);
  const lanesFlippedRef = useRef<boolean>(false);

  // V-Slice / Psych Engine dynamic camera & HUD states (Strumline Spin, FocusCamera, ZoomCamera, NoteSwapEvent)
  const strumSpinUntilMsRef = useRef<{ startMs: number; durationMs: number } | null>(null);
  const cameraFocusedCharRef = useRef<'opponent' | 'player'>('player');
  const cameraTargetFocusXRef = useRef<number>(0);
  const cameraTargetFocusYRef = useRef<number>(0);
  const cameraCurrentXRef = useRef<number>(0);
  const cameraCurrentYRef = useRef<number>(0);
  const cameraNoteOffsetXRef = useRef<number>(0);
  const cameraNoteOffsetYRef = useRef<number>(0);
  const stageZoomOverrideRef = useRef<number>(1.0);
  const stageZoomCurrentRef = useRef<number>(1.0);
  const cameraBopRateRef = useRef<number>(4);
  const cameraBopIntensityRef = useRef<number>(1.0);
  const lastBopBeatRef = useRef<number>(-1);
  const camBeatPulseRef = useRef<number>(0);
  const displayedHealthRef = useRef<number>(50);
  const scoreTextZoomRef = useRef<number>(1.0);
  const majinNoteskinActiveRef = useRef<boolean>(false);
  const pixelNoteskinActiveRef = useRef<boolean>(false);
  const phantomDrainUntilMsRef = useRef<number>(-Infinity);

  const opponentPoseRef = useRef<{
    pose: CharacterPose;
    startedMs: number;
    untilMs: number;
  }>({
    pose: 'idle',
    startedMs: 0,
    untilMs: 0,
  });
  const playerPoseRef = useRef<{
    pose: CharacterPose;
    startedMs: number;
    untilMs: number;
  }>({
    pose: 'idle',
    startedMs: 0,
    untilMs: 0,
  });

  const pressedLanesRef = useRef<Record<Direction, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  const playerConfirmUntilMsRef = useRef<Record<Direction, number>>({
    0: -Infinity,
    1: -Infinity,
    2: -Infinity,
    3: -Infinity,
  });
  const ringPressedRef = useRef<boolean>(false);
  const ringConfirmUntilMsRef = useRef<number>(-Infinity);
  const spookTypeRef = useRef<string>('sonic');

  const opponentConfirmUntilMsRef = useRef<Record<Direction, number>>({
    0: -Infinity,
    1: -Infinity,
    2: -Infinity,
    3: -Infinity,
  });

  const hitSplashesRef = useRef<
    { lane: Direction; timeMs: number; color: string }[]
  >([]);

  const judgementPopupRef = useRef<{
    text: JudgementTier;
    combo: number;
    timeMs: number;
    diffMs: number;
  } | null>(null);

  const dramaticBannerRef = useRef<{
    text: string;
    untilMs: number;
    isMajin: boolean;
  } | null>(null);

  const staticAlphaRef = useRef<number>(0);
  const redFlashAlphaRef = useRef<number>(0);
  const screenShakeIntensityRef = useRef<number>(0);
  const whiteFlashAlphaRef = useRef<number>(0);
  const blackoutUntilMsRef = useRef<number>(-Infinity);
  const activeLyricsRef = useRef<string>('');
  const spookUntilMsRef = useRef<number>(-Infinity);

  const statsRef = useRef<PlayStats>({
    score: 0,
    misses: 0,
    combo: 0,
    maxCombo: 0,
    sicks: 0,
    goods: 0,
    bads: 0,
    shits: 0,
    totalNotesHit: 0,
    totalNotesEncountered: 0,
    rings: song.id.includes('encore') || song.id === 'triple-trouble' ? 1 : 0,
    health: 50,
    usedBotplay: settings.botplay,
    usedPracticeMode: settings.practiceMode,
  });

  // Permanently latch if Botplay or Practice Mode is enabled at any point during the run
  useEffect(() => {
    if (settings.botplay) {
      statsRef.current.usedBotplay = true;
    }
    if (settings.practiceMode) {
      statsRef.current.usedPracticeMode = true;
    }
  }, [settings.botplay, settings.practiceMode]);

  // Update note density dynamically in real-time when settings change
  useEffect(() => {
    if (rawBaseChartRef.current) {
      chartRef.current = scaleChartNoteDensity(
        rawBaseChartRef.current,
        settings.noteDensityMultiplier || 1.0
      );
    }
  }, [settings.noteDensityMultiplier]);

  const rawBaseChartRef = useRef<{ notes: ChartNote[]; events: SongEvent[] } | null>(null);

  // Initialize chart and reset synced .ogg stems on song mount
  useEffect(() => {
    soundEngine.stopSyncedStems(true);
    soundEngine.preloadSongStems(song.id).catch(() => {});
    preloadSpritesForSong(song.id);
    const baseChart = generateSongChartAndEvents(song.id);
    rawBaseChartRef.current = baseChart;
    chartRef.current = scaleChartNoteDensity(
      baseChart,
      settings.noteDensityMultiplier || 1.0
    );
    firstActiveNoteIdxRef.current = 0;
    nextEventIdxRef.current = 0;
    songTimeMsRef.current = -2000;
    lastSubBeatRef.current = -1;
    stemsStartedAtZeroRef.current = false;
    opponentCharRef.current = song.initialOpponent;
    playerCharRef.current = song.initialPlayer;
    stageThemeRef.current = song.stageTheme;
    lanesFlippedRef.current = false;
    strumSpinUntilMsRef.current = null;
    cameraFocusedCharRef.current = 'player';
    cameraTargetFocusXRef.current = 0;
    cameraTargetFocusYRef.current = 0;
    cameraCurrentXRef.current = 0;
    cameraCurrentYRef.current = 0;
    cameraNoteOffsetXRef.current = 0;
    cameraNoteOffsetYRef.current = 0;
    stageZoomOverrideRef.current = 1.0;
    stageZoomCurrentRef.current = 1.0;
    cameraBopRateRef.current = 4;
    cameraBopIntensityRef.current = 1.0;
    lastBopBeatRef.current = -1;
    camBeatPulseRef.current = 0;
    displayedHealthRef.current = 50;
    scoreTextZoomRef.current = 1.0;
    majinNoteskinActiveRef.current = false;
    pixelNoteskinActiveRef.current = false;
    phantomDrainUntilMsRef.current = -Infinity;
    staticAlphaRef.current = 0;
    redFlashAlphaRef.current = 0;
    whiteFlashAlphaRef.current = 0;
    blackoutUntilMsRef.current = -Infinity;
    activeLyricsRef.current = '';
    spookUntilMsRef.current = -Infinity;
    spookTypeRef.current = 'sonic';
    ringPressedRef.current = false;
    ringConfirmUntilMsRef.current = -Infinity;
    dramaticBannerRef.current = null;
    statsRef.current = {
      score: 0,
      misses: 0,
      combo: 0,
      maxCombo: 0,
      sicks: 0,
      goods: 0,
      bads: 0,
      shits: 0,
      totalNotesHit: 0,
      totalNotesEncountered: 0,
      rings: song.id.includes('encore') ? 1 : 0,
      health: 50,
      usedBotplay: settings.botplay,
      usedPracticeMode: settings.practiceMode,
    };

    return () => {
      soundEngine.stopSyncedStems(true);
    };
  }, [song]);

  // Pause / resume synchronized .ogg stems when game pause state toggles
  useEffect(() => {
    if (!soundEngine.hasOggStemsForSong(song.id)) return;
    if (!stemsStartedAtZeroRef.current) return;
    if (isPaused) {
      soundEngine.pauseSyncedStems();
    } else {
      soundEngine.resumeSyncedStems();
    }
  }, [isPaused, song.id]);

  const triggerPlayerLane = useCallback(
    (lane: Direction) => {
      if (isPaused) return;
      // Sub-frame real-time audio clock lookup to minimize note pressing delay as much as possible
      const liveStemsMs =
        stemsStartedAtZeroRef.current && soundEngine.isSyncedStemsPlaying()
          ? soundEngine.getSyncedStemsTimeMs()
          : null;
      const subFrameDelta = Math.max(
        0,
        Math.min(20, performance.now() - lastFramePerfRef.current)
      );
      const nowMs =
        liveStemsMs !== null
          ? liveStemsMs
          : songTimeMsRef.current + subFrameDelta;
      pressedLanesRef.current[lane] = true;

      const hitWindowMs = 165;
      const phantomWindowMs = 115;
      let candidate: ChartNote | null = null;
      let bestAbsDiff = Infinity;
      let phantomCandidate: ChartNote | null = null;
      let bestPhantomDiff = Infinity;

      const notes = chartRef.current.notes;
      for (let i = firstActiveNoteIdxRef.current; i < notes.length; i++) {
        const note = notes[i];
        const diff = note.timeMs - nowMs;
        if (diff > hitWindowMs) break;
        if (
          !note.isPlayer ||
          note.hit ||
          note.missed ||
          note.lane !== lane ||
          (song.id === 'triple-trouble' && note.special === 'ring')
        ) {
          continue;
        }
        const absDiff = Math.abs(diff);
        if (note.special === 'phantom') {
          if (absDiff <= phantomWindowMs && absDiff < bestPhantomDiff) {
            bestPhantomDiff = absDiff;
            phantomCandidate = note;
          }
        } else if (absDiff <= hitWindowMs && absDiff < bestAbsDiff) {
          bestAbsDiff = absDiff;
          candidate = note;
        }
      }

      if (!candidate && phantomCandidate) {
        candidate = phantomCandidate;
        bestAbsDiff = bestPhantomDiff;
      }

      if (candidate) {
        candidate.hit = true;

        // Hitting a blurry note (Phantom Note) is BAD and hurts you!
        if (candidate.special === 'phantom') {
          const st = statsRef.current;
          st.misses += 1;
          st.totalNotesEncountered += 1;
          st.combo = 0;
          st.score -= 150;
          st.health = Math.max(
            settings.practiceMode ? 1 : 0,
            st.health - 12.6
          );
          phantomDrainUntilMsRef.current = Math.max(
            phantomDrainUntilMsRef.current,
            nowMs + 1800
          );
          redFlashAlphaRef.current = 0.65;
          staticAlphaRef.current = 0.35;
          playerPoseRef.current = {
            pose: 'miss',
            startedMs: nowMs,
            untilMs: nowMs + 340,
          };
          judgementPopupRef.current = null;
          soundEngine.playMissSound();
          if (st.health <= 0 && !settings.practiceMode) {
            soundEngine.stopSyncedStems(true);
            onGameOver({ ...st });
          }
          return;
        }

        if (candidate.sustainMs > 0) {
          candidate.holding = true;
        }

        // In Too Slow Encore, when BF hits the final note (42667ms) before Sonic's transformation:
        // flash the screen and black it out until Sonic initiates his transformation laugh (44222ms)!
        if (song.id === 'too-slow-encore' && candidate.timeMs === 42667) {
          whiteFlashAlphaRef.current = 1.0;
          blackoutUntilMsRef.current = 44222;
        }

        const st = statsRef.current;
        st.totalNotesHit += 1;
        st.totalNotesEncountered += 1;
        st.combo += 1;
        if (st.combo > st.maxCombo) st.maxCombo = st.combo;

        let tier: JudgementTier = 'SICK!!';
        let scoreGain = 350;
        let hpGain = 0.84;

        // Exact judgement point values: Sick = 350, Good = 200, Bad = 50, Shit = -50
        // Health gain from singular notes decreased by 70% (30% of original values)
        if (bestAbsDiff <= 45) {
          tier = 'SICK!!';
          st.sicks += 1;
          scoreGain = 350;
          hpGain = 0.96;
          hitSplashesRef.current.push({
            lane,
            timeMs: nowMs,
            color: LANE_COLORS[lane],
          });
        } else if (bestAbsDiff <= 90) {
          tier = 'GOOD!';
          st.goods += 1;
          scoreGain = 200;
          hpGain = 0.54;
        } else if (bestAbsDiff <= 130) {
          tier = 'BAD';
          st.bads += 1;
          scoreGain = 50;
          hpGain = 0.15;
        } else {
          tier = 'SHIT';
          st.shits += 1;
          st.combo = 0;
          st.misses += 1;
          scoreGain = -50;
          hpGain = settings.practiceMode ? 0 : -1.0;
        }

        if (candidate.special === 'ring') {
          st.rings += 1;
        }

        st.score += scoreGain;
        st.health = Math.min(
          100,
          Math.max(settings.practiceMode ? 1 : 0, st.health + hpGain)
        );
        scoreTextZoomRef.current = st.combo % 50 === 0 && st.combo > 0 ? 1.38 : 1.075;

        if (st.combo % 50 === 0 && st.combo > 0) {
          dramaticBannerRef.current = {
            text: `🔥 ${st.combo} COMBO STREAK! 🔥`,
            untilMs: nowMs + 1200,
            isMajin: false,
          };
        }

        playerPoseRef.current = {
          pose: DIRECTION_FROM_POSE[lane],
          startedMs: nowMs,
          untilMs: nowMs + 280,
        };
        playerConfirmUntilMsRef.current[lane] =
          nowMs + Math.max(150, candidate.sustainMs);

        judgementPopupRef.current = {
          text: tier,
          combo: st.combo,
          timeMs: nowMs,
          diffMs: Math.round(candidate.timeMs - nowMs),
        };

        soundEngine.playVocalNote(
          candidate.pitchMidi,
          true,
          playerCharRef.current,
          Math.max(170, candidate.sustainMs),
          candidate.special,
          settings.musicVolume,
          song.id
        );
      } else {
        playerPoseRef.current = {
          pose: DIRECTION_FROM_POSE[lane],
          startedMs: nowMs,
          untilMs: nowMs + 180,
        };
        if (!settings.ghostTapping && !settings.practiceMode && nowMs > 0) {
          const st = statsRef.current;
          st.misses += 1;
          st.totalNotesEncountered += 1;
          st.combo = 0;
          st.score -= 100;
          st.health = Math.max(0, st.health - 3.15);
          playerPoseRef.current = {
            pose: 'miss',
            startedMs: nowMs,
            untilMs: nowMs + 300,
          };
          soundEngine.playMissSound();
          if (st.health <= 0) {
            onGameOver({ ...st });
          }
        }
      }
    },
    [
      isPaused,
      onGameOver,
      settings.ghostTapping,
      settings.musicVolume,
      settings.practiceMode,
      song.id,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.code === 'Escape') {
        e.preventDefault();
        if (isFullscreen || Boolean(document.fullscreenElement)) {
          onToggleFullscreen();
        } else {
          onPauseToggle();
        }
        return;
      }

      if (e.code === keybinds.pause) {
        e.preventDefault();
        onPauseToggle();
        return;
      }

      if (e.code === keybinds.reset) {
        e.preventDefault();
        onRestart();
        return;
      }

      if (isPaused) return;

      if (e.code === keybinds.ring) {
        e.preventDefault();
        if (song.id === 'triple-trouble') {
          ringPressedRef.current = true;
          const liveStemsMs =
            stemsStartedAtZeroRef.current && soundEngine.isSyncedStemsPlaying()
              ? soundEngine.getSyncedStemsTimeMs()
              : null;
          const subFrameDelta = Math.max(
            0,
            Math.min(20, performance.now() - lastFramePerfRef.current)
          );
          const nowMs =
            liveStemsMs !== null
              ? liveStemsMs
              : songTimeMsRef.current + subFrameDelta;
          const hitWindowMs = 175;
          const notes = chartRef.current.notes;
          let ringCand: ChartNote | null = null;
          let bestDiff = Infinity;
          for (let i = firstActiveNoteIdxRef.current; i < notes.length; i++) {
            const note = notes[i];
            const diff = note.timeMs - nowMs;
            if (diff > hitWindowMs) break;
            if (
              !note.isPlayer ||
              note.hit ||
              note.missed ||
              note.special !== 'ring'
            ) {
              continue;
            }
            const absDiff = Math.abs(diff);
            if (absDiff <= hitWindowMs && absDiff < bestDiff) {
              bestDiff = absDiff;
              ringCand = note;
            }
          }
          if (ringCand) {
            ringCand.hit = true;
            statsRef.current.rings += 1;
            ringConfirmUntilMsRef.current = nowMs + 165;
            soundEngine.playRingCollect();
          }
          return;
        }
        if (statsRef.current.rings > 0 && statsRef.current.health < 95) {
          statsRef.current.rings -= 1;
          statsRef.current.health = Math.min(100, statsRef.current.health + 18);
          soundEngine.playRingCollect();
        }
        return;
      }

      const isLeft =
        e.code === keybinds.left ||
        (e.code === 'ArrowLeft' &&
          !Object.values(keybinds).includes('ArrowLeft'));
      const isDown =
        e.code === keybinds.down ||
        (e.code === 'ArrowDown' &&
          !Object.values(keybinds).includes('ArrowDown'));
      const isUp =
        e.code === keybinds.up ||
        (e.code === 'ArrowUp' && !Object.values(keybinds).includes('ArrowUp'));
      const isRight =
        e.code === keybinds.right ||
        (e.code === 'ArrowRight' &&
          !Object.values(keybinds).includes('ArrowRight'));

      if (isLeft) {
        e.preventDefault();
        triggerPlayerLane(0);
      } else if (isDown) {
        e.preventDefault();
        triggerPlayerLane(1);
      } else if (isUp) {
        e.preventDefault();
        triggerPlayerLane(2);
      } else if (isRight) {
        e.preventDefault();
        triggerPlayerLane(3);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === keybinds.left || e.code === 'ArrowLeft') {
        pressedLanesRef.current[0] = false;
        playerConfirmUntilMsRef.current[0] = -Infinity;
      }
      if (e.code === keybinds.down || e.code === 'ArrowDown') {
        pressedLanesRef.current[1] = false;
        playerConfirmUntilMsRef.current[1] = -Infinity;
      }
      if (e.code === keybinds.up || e.code === 'ArrowUp') {
        pressedLanesRef.current[2] = false;
        playerConfirmUntilMsRef.current[2] = -Infinity;
      }
      if (e.code === keybinds.right || e.code === 'ArrowRight') {
        pressedLanesRef.current[3] = false;
        playerConfirmUntilMsRef.current[3] = -Infinity;
      }
      if (e.code === keybinds.ring) {
        ringPressedRef.current = false;
        ringConfirmUntilMsRef.current = -Infinity;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, [isPaused, keybinds, onPauseToggle, onRestart, triggerPlayerLane]);

  // Main 60FPS Rhythm Engine & Canvas Render Loop
  useEffect(() => {
    let animationFrameId: number;
    lastFramePerfRef.current = performance.now();

    const renderLoop = (nowPerf: number) => {
      const dt = Math.min(50, nowPerf - lastFramePerfRef.current);
      lastFramePerfRef.current = nowPerf;

      if (!isPaused) {
        const isSongStillLoading = soundEngine.isSongLoading(song.id);
        const hasSongStems = soundEngine.hasOggStemsForSong(song.id);

        // Wait at -10ms if built-in .ogg stems are still decoding so all stems start cleanly together at 0.000s
        if (
          isSongStillLoading &&
          !stemsStartedAtZeroRef.current &&
          songTimeMsRef.current + dt >= 0
        ) {
          songTimeMsRef.current = -10;
        } else if (
          hasSongStems &&
          !stemsStartedAtZeroRef.current &&
          songTimeMsRef.current + dt >= 0
        ) {
          stemsStartedAtZeroRef.current = true;
          const startOffsetSec = Math.max(0, songTimeMsRef.current / 1000);
          soundEngine.startSyncedStems(startOffsetSec, song.id);
          songTimeMsRef.current = startOffsetSec * 1000;
        } else if (
          hasSongStems &&
          stemsStartedAtZeroRef.current &&
          soundEngine.isSyncedStemsPlaying()
        ) {
          // Lock chart clock directly to the synchronized .ogg AudioContext clock!
          const syncedMs = soundEngine.getSyncedStemsTimeMs();
          if (syncedMs !== null) {
            songTimeMsRef.current = syncedMs;
          } else {
            songTimeMsRef.current += dt;
          }
        } else {
          songTimeMsRef.current += dt;
        }
      }

      const curMs = songTimeMsRef.current;
      const totalDurationMs = song.durationSec * 1000;

      if (settings.botplay) {
        statsRef.current.usedBotplay = true;
      }
      if (settings.practiceMode) {
        statsRef.current.usedPracticeMode = true;
      }

      // 1. Trigger Backing Rhythm Sub-Beats (Eighth notes)
      if (!isPaused && curMs >= 0) {
        const subBeatDurationMs = 60000 / song.bpm / 2;
        const currentSubBeat = Math.floor(curMs / subBeatDurationMs);
        if (currentSubBeat > lastSubBeatRef.current) {
          lastSubBeatRef.current = currentSubBeat;
          soundEngine.playBackingSubBeat(
            song.id,
            currentSubBeat,
            settings.musicVolume
          );
        }
      }

      // 2. Process Song Events, Camera Movement, & Note/Sustain Logic ONLY when not paused!
      const notes = chartRef.current.notes;
      if (!isPaused) {
        const events = chartRef.current.events;
        while (
          nextEventIdxRef.current < events.length &&
          events[nextEventIdxRef.current].triggered
        ) {
          nextEventIdxRef.current++;
        }
        for (let ei = nextEventIdxRef.current; ei < events.length; ei++) {
          const ev = events[ei];
          if (curMs < ev.timeMs) break;
          if (!ev.triggered && curMs >= ev.timeMs) {
            ev.triggered = true;
            if (ev.type === 'stage_swap') {
              stageThemeRef.current = ev.value as StageThemeId;
              redFlashAlphaRef.current = 0.75;
              if (song.id === 'triple-trouble') {
                screenShakeIntensityRef.current = 36;
              }
              const isSonicSection =
                song.id === 'triple-trouble' &&
                (stageThemeRef.current === 'triple-trouble-xeno' ||
                  opponentCharRef.current === 'xenophanes' ||
                  opponentCharRef.current === 'xenophanes-flipped');
              const isFlippedLayout =
                isSonicSection || lanesFlippedRef.current;
              const flippedSign = isFlippedLayout ? -1 : 1;
              const isOppFocus = cameraFocusedCharRef.current === 'opponent';
              cameraTargetFocusXRef.current =
                (isOppFocus ? -85 : 85) * flippedSign;
            } else if (ev.type === 'character_swap') {
              const [opp, plr] = ev.value.split(':');
              if (opp) opponentCharRef.current = opp as OpponentCharacterId;
              if (plr) playerCharRef.current = plr as PlayerCharacterId;
              redFlashAlphaRef.current = 0.75;
              if (song.id === 'triple-trouble') {
                screenShakeIntensityRef.current = 36;
                let banner = '⚡ TRIPLE TROUBLE PHASE SHIFT! ⚡';
                const oppName = (opp || '').toLowerCase();
                if (oppName.includes('xeno')) {
                  banner = '⚡ XENOPHANES PHASE! ⚡';
                } else if (oppName.includes('knuckles')) {
                  banner = '🔥 KNUCKLES.EXE PHASE! 🔥';
                } else if (oppName.includes('eggman')) {
                  banner = '⚡ EGGMAN.EXE PHASE! ⚡';
                } else if (oppName.includes('tails')) {
                  banner = '🩸 TAILS.EXE PHASE! 🩸';
                }
                dramaticBannerRef.current = {
                  text: banner,
                  untilMs: curMs + 1800,
                  isMajin: false,
                };
              }
              const isSonicSection =
                song.id === 'triple-trouble' &&
                (stageThemeRef.current === 'triple-trouble-xeno' ||
                  opponentCharRef.current === 'xenophanes' ||
                  opponentCharRef.current === 'xenophanes-flipped');
              const isFlippedLayout =
                isSonicSection || lanesFlippedRef.current;
              const flippedSign = isFlippedLayout ? -1 : 1;
              const isOppFocus = cameraFocusedCharRef.current === 'opponent';
              cameraTargetFocusXRef.current =
                (isOppFocus ? -85 : 85) * flippedSign;
              if (song.id === 'too-slow-encore') {
                dramaticBannerRef.current = {
                  text: 'SONIC.EXE REVEALED!',
                  untilMs: curMs + 1500,
                  isMajin: false,
                };
                soundEngine.playStaticBurst();
              }
            } else if (ev.type === 'flip_lanes') {
              lanesFlippedRef.current = ev.value === 'true';
              const isSonicSection =
                song.id === 'triple-trouble' &&
                (stageThemeRef.current === 'triple-trouble-xeno' ||
                  opponentCharRef.current === 'xenophanes' ||
                  opponentCharRef.current === 'xenophanes-flipped');
              const isFlippedLayout =
                isSonicSection || lanesFlippedRef.current;
              const flippedSign = isFlippedLayout ? -1 : 1;
              const isOppFocus = cameraFocusedCharRef.current === 'opponent';
              cameraTargetFocusXRef.current =
                (isOppFocus ? -85 : 85) * flippedSign;
            } else if (ev.type === 'strumline_spin') {
              const rawDur = parseFloat(ev.value) || 350;
              strumSpinUntilMsRef.current = {
                startMs: curMs,
                durationMs: rawDur < 10 ? rawDur * 1000 : rawDur,
              };
            } else if (ev.type === 'camera_bop') {
              const parts = ev.value.split(':');
              if (parts.length >= 2) {
                const rate = Math.max(1, Math.round(parseFloat(parts[0]) || 4));
                const rawIntensity = parseFloat(parts[1]) || 1.015;
                cameraBopRateRef.current = rate;
                cameraBopIntensityRef.current = Math.max(
                  0.5,
                  Math.min(2.2, (rawIntensity - 1) / 0.015)
                );
              } else {
                const bopZoom = parseFloat(parts[0]) || 1.05;
                camBeatPulseRef.current = Math.max(
                  camBeatPulseRef.current,
                  (bopZoom - 1) * 0.45
                );
                if (bopZoom > 1.1) {
                  redFlashAlphaRef.current = 0.35;
                }
              }
            } else if (ev.type === 'focus_camera') {
              // char 1 = Opponent, char 0 = Player
              const isOppFocus = ev.value === '1';
              cameraFocusedCharRef.current = isOppFocus ? 'opponent' : 'player';
              const isSonicSection =
                song.id === 'triple-trouble' &&
                (stageThemeRef.current === 'triple-trouble-xeno' ||
                  opponentCharRef.current === 'xenophanes' ||
                  opponentCharRef.current === 'xenophanes-flipped');
              const isFlippedLayout =
                isSonicSection || lanesFlippedRef.current;
              const flippedSign = isFlippedLayout ? -1 : 1;
              cameraTargetFocusXRef.current =
                (isOppFocus ? -85 : 85) * flippedSign;
              cameraTargetFocusYRef.current = isOppFocus ? -10 : 8;
            } else if (ev.type === 'zoom_camera') {
              const rawZoom = parseFloat(ev.value) || 1.0;
              // Normalize any < 1.0 V-Slice raw stage zoom values so 1.0 is default stage zoom
              const normalizedZoom =
                rawZoom < 0.95 ? 1.0 : Math.min(1.42, rawZoom);
              stageZoomOverrideRef.current = normalizedZoom;
              if (
                (song.id === 'too-slow' && Math.abs(ev.timeMs - 84667) < 50) ||
                (song.id === 'you-cant-run' &&
                  (Math.abs(ev.timeMs - 13714) < 50 ||
                    Math.abs(ev.timeMs - 56571) < 50 ||
                    Math.abs(ev.timeMs - 84000) < 50))
              ) {
                // Instant camera zoom cut where specified by chart
                stageZoomCurrentRef.current = normalizedZoom;
              }
            } else if (ev.type === 'noteskin_swap') {
              majinNoteskinActiveRef.current = ev.value === 'majin';
              pixelNoteskinActiveRef.current = ev.value === 'exePixel';
            } else if (ev.type === 'lyrics') {
              activeLyricsRef.current = ev.value;
              if (ev.value) {
                if (ev.value.toLowerCase().includes('laughter')) {
                  opponentPoseRef.current = {
                    pose: 'laugh',
                    startedMs: curMs,
                    untilMs: curMs + 3800,
                  };
                } else if (
                  ev.value.includes('GOD') ||
                  ev.value.includes('DIE') ||
                  ev.value.includes('SOUL') ||
                  ev.value.includes('getcha')
                ) {
                  redFlashAlphaRef.current = 0.75;
                  staticAlphaRef.current = 0.38;
                }
              } else {
                if (
                  opponentPoseRef.current.pose === 'laugh' ||
                  opponentPoseRef.current.pose === 'gotcha'
                ) {
                  opponentPoseRef.current = {
                    pose: 'idle',
                    startedMs: curMs,
                    untilMs: curMs,
                  };
                }
              }
            } else if (ev.type === 'play_anim') {
              if (ev.value === 'gotcha' || ev.value === 'dad:gotcha') {
                opponentPoseRef.current = {
                  pose: 'gotcha',
                  startedMs: curMs,
                  untilMs:
                    curMs + (song.id.includes('you-cant-run') ? 2800 : 6800),
                };
                redFlashAlphaRef.current = 0.65;
              } else if (
                ev.value === 'singDOWN-alt' ||
                ev.value === 'dad:singDOWN-alt' ||
                ev.value === 'dad:laugh' ||
                ev.value === 'jijijija' ||
                ev.value === 'dad:jijijija'
              ) {
                if (blackoutUntilMsRef.current > curMs) {
                  blackoutUntilMsRef.current = -Infinity;
                  whiteFlashAlphaRef.current = 0.85;
                }
                opponentPoseRef.current = {
                  pose: 'laugh',
                  startedMs: curMs,
                  untilMs: curMs + (ev.value.includes('jijijija') ? 1100 : 550),
                };
              } else if (ev.value === 'dad:scream') {
                opponentPoseRef.current = {
                  pose: 'scream',
                  startedMs: curMs,
                  untilMs: curMs + 750,
                };
                redFlashAlphaRef.current = 0.55;
              }
            } else if (ev.type === 'too_slow_flash') {
              if (ev.value.startsWith('blackout:')) {
                const until = parseFloat(ev.value.split(':')[1]) || curMs + 1555;
                if (blackoutUntilMsRef.current < until) {
                  whiteFlashAlphaRef.current = 1.0;
                  blackoutUntilMsRef.current = until;
                }
              } else {
                redFlashAlphaRef.current = ev.value === '2' ? 0.92 : 0.55;
                staticAlphaRef.current = ev.value === '2' ? 0.45 : 0.22;
              }
            } else if (ev.type === 'sonicspook') {
              spookTypeRef.current = ev.value || 'sonic';
              spookUntilMsRef.current = curMs + 550;
              if (settings.disableJumpscares) {
                staticAlphaRef.current = 1.0;
                redFlashAlphaRef.current = 0.2;
              } else {
                redFlashAlphaRef.current = 0.95;
                staticAlphaRef.current = 0.65;
                soundEngine.playStaticBurst();
              }
              if (song.id === 'triple-trouble') {
                screenShakeIntensityRef.current = 38;
              }
            } else if (ev.type === 'screamer_text') {
              if (settings.disableJumpscares) {
                staticAlphaRef.current = 1.0;
              } else {
                dramaticBannerRef.current = {
                  text: ev.value,
                  untilMs: curMs + 1600,
                  isMajin: false,
                };
                soundEngine.playStaticBurst();
                staticAlphaRef.current = 0.45;
              }
            } else if (ev.type === 'majin_countdown') {
              dramaticBannerRef.current = {
                text: ev.value,
                untilMs: curMs + 380,
                isMajin: true,
              };
              if (!soundEngine.isSyncedStemsPlaying()) {
                soundEngine.playMenuTick(true);
              }
            } else if (ev.type === 'red_flash') {
              redFlashAlphaRef.current = 0.85;
            }
          }
        }

        // Smoothly interpolate camera focus X/Y + directional note-hit camera offset + stage zoom + HUD health/score zoom
        const camFollowLerp = 1 - Math.exp(-dt * 0.0048);
        cameraCurrentXRef.current +=
          (cameraTargetFocusXRef.current - cameraCurrentXRef.current) *
          camFollowLerp;
        cameraCurrentYRef.current +=
          (cameraTargetFocusYRef.current - cameraCurrentYRef.current) *
          camFollowLerp;

        const activeFocusPose =
          cameraFocusedCharRef.current === 'opponent'
            ? opponentPoseRef.current.pose
            : playerPoseRef.current.pose;
        const fallbackPose =
          activeFocusPose !== 'idle'
            ? activeFocusPose
            : opponentPoseRef.current.pose !== 'idle'
              ? opponentPoseRef.current.pose
              : playerPoseRef.current.pose;
        const noteCamDisplacement = 6;
        const targetNoteCamX =
          fallbackPose === 'left'
            ? -noteCamDisplacement
            : fallbackPose === 'right'
              ? noteCamDisplacement
              : 0;
        const targetNoteCamY =
          fallbackPose === 'up'
            ? -noteCamDisplacement
            : fallbackPose === 'down'
              ? noteCamDisplacement
              : 0;
        const noteCamLerp = 1 - Math.exp(-dt * 0.012);
        cameraNoteOffsetXRef.current +=
          (targetNoteCamX - cameraNoteOffsetXRef.current) * noteCamLerp;
        cameraNoteOffsetYRef.current +=
          (targetNoteCamY - cameraNoteOffsetYRef.current) * noteCamLerp;

        stageZoomCurrentRef.current +=
          (stageZoomOverrideRef.current - stageZoomCurrentRef.current) *
          (1 - Math.exp(-dt * 0.0055));
        displayedHealthRef.current +=
          (statsRef.current.health - displayedHealthRef.current) *
          (1 - Math.exp(-dt * 0.018));
        scoreTextZoomRef.current =
          1 + (scoreTextZoomRef.current - 1) * Math.exp(-dt * 0.014);

        // 3. Process Notes (using sliding window index to avoid scanning old notes)
        const notes = chartRef.current.notes;
        while (
          firstActiveNoteIdxRef.current < notes.length &&
          (notes[firstActiveNoteIdxRef.current].hit ||
            notes[firstActiveNoteIdxRef.current].missed) &&
          !notes[firstActiveNoteIdxRef.current].holding &&
          curMs >
            notes[firstActiveNoteIdxRef.current].timeMs +
              notes[firstActiveNoteIdxRef.current].sustainMs +
              220
        ) {
          firstActiveNoteIdxRef.current++;
        }

        for (let ni = firstActiveNoteIdxRef.current; ni < notes.length; ni++) {
          const note = notes[ni];
          if (note.timeMs - curMs > 300) break;

          // Player Hold / Sustain Note Continuous Logic (Active whenever curMs >= note.timeMs && curMs <= note.timeMs + note.sustainMs)
          if (note.isPlayer && note.sustainMs > 0 && curMs >= note.timeMs) {
            const sustainEndMs = note.timeMs + note.sustainMs;
            const isKeyHeld = pressedLanesRef.current[note.lane] || settings.botplay;

            if (curMs <= sustainEndMs) {
              // Auto-hit initial note head for Botplay if it hasn't been hit yet
              if (settings.botplay && !note.hit && !note.missed) {
                note.hit = true;
                note.holding = true;
                const st = statsRef.current;
                st.totalNotesHit += 1;
                st.totalNotesEncountered += 1;
                st.combo += 1;
                if (st.combo > st.maxCombo) st.maxCombo = st.combo;
                st.score += 350;
                st.sicks += 1;
                hitSplashesRef.current.push({
                  lane: note.lane,
                  timeMs: curMs,
                  color: LANE_COLORS[note.lane],
                });
                judgementPopupRef.current = {
                  text: 'SICK!!',
                  combo: st.combo,
                  timeMs: curMs,
                  diffMs: 0,
                };
                soundEngine.playVocalNote(
                  note.pitchMidi,
                  true,
                  playerCharRef.current,
                  Math.max(170, note.sustainMs),
                  note.special,
                  settings.musicVolume,
                  song.id
                );
              }

              if (isKeyHeld) {
                note.holding = true;
                // Continuously add score while holding sustain notes (+15 score per 60fps frame)
                statsRef.current.score += Math.round(dt * 0.25);
                statsRef.current.health = Math.min(
                  100,
                  statsRef.current.health + dt * 0.004
                );
                // Re-trigger singing pose 5 times a second (every 200ms) while holding a sustain note
                const holdRepeatStartedMs =
                  note.timeMs +
                  Math.floor(Math.max(0, curMs - note.timeMs) / 200) * 200;
                playerPoseRef.current = {
                  pose: DIRECTION_FROM_POSE[note.lane],
                  startedMs: holdRepeatStartedMs,
                  untilMs: curMs + 140,
                };
                playerConfirmUntilMsRef.current[note.lane] = curMs + 140;
                note.lastMissTickMs = 0;
              } else if (!isKeyHeld) {
                // Unheld during sustain note duration
                note.holding = false;
                const isNearEnd = curMs >= sustainEndMs - 200;

                // As long as the player landed the head of the note as Sick, Good, or Bad (note.hit === true)
                // OR released within 0.2s (200ms) of the end: NO COMBO BREAK and NO MISS INCREMENT!
                if (note.hit || isNearEnd) {
                  const holdDrain = dt * 0.005;
                  statsRef.current.health = Math.max(
                    0,
                    statsRef.current.health - holdDrain
                  );
                } else {
                  // Unheld before note head was hit
                  const holdDrain = dt * 0.012;
                  statsRef.current.health = Math.max(
                    0,
                    statsRef.current.health - holdDrain
                  );
                }

                if (statsRef.current.health <= 0 && !settings.practiceMode) {
                  onGameOver({ ...statsRef.current });
                }
              }
            } else {
              note.holding = false;
            }
          }

          if (note.hit || note.missed) {
            if (!note.isPlayer && note.holding) {
              // Drain health gently while the opponent holds sustain notes
              if (curMs <= note.timeMs + note.sustainMs) {
                if (statsRef.current.health > 15) {
                  statsRef.current.health = Math.max(
                    15,
                    statsRef.current.health - dt * 0.0014
                  );
                }
                // Re-trigger opponent singing pose 5 times a second (every 200ms) while holding a sustain note
                const holdRepeatStartedMs =
                  note.timeMs +
                  Math.floor(Math.max(0, curMs - note.timeMs) / 200) * 200;
                opponentPoseRef.current = {
                  pose: DIRECTION_FROM_POSE[note.lane],
                  startedMs: holdRepeatStartedMs,
                  untilMs: curMs + 120,
                };
              } else {
                note.holding = false;
              }
            }
            continue;
          }

          // Opponent Notes: Auto-hit right on time & drain health on hit + while holding
          if (!note.isPlayer && curMs >= note.timeMs) {
            note.hit = true;
            if (note.sustainMs > 0) {
              note.holding = true;
            }
            opponentPoseRef.current = {
              pose: DIRECTION_FROM_POSE[note.lane],
              startedMs: curMs,
              untilMs: curMs + Math.max(260, note.sustainMs),
            };
            opponentConfirmUntilMsRef.current[note.lane] =
              curMs + Math.max(150, note.sustainMs);
            soundEngine.playVocalNote(
              note.pitchMidi,
              false,
              opponentCharRef.current,
              Math.max(180, note.sustainMs),
              note.special,
              settings.musicVolume,
              song.id
            );
            if (statsRef.current.health > 15) {
              statsRef.current.health = Math.max(
                15,
                statsRef.current.health - 0.45
              );
            }
            continue;
          }

          // Player Notes in Botplay Mode: Auto-hit with SICK!! (exact 350 points), ignoring bad phantom notes!
          if (
            note.isPlayer &&
            note.special !== 'phantom' &&
            settings.botplay &&
            curMs >= note.timeMs
          ) {
            note.hit = true;
            note.holding = note.sustainMs > 0;
            if (song.id === 'too-slow-encore' && note.timeMs === 42667) {
              whiteFlashAlphaRef.current = 1.0;
              blackoutUntilMsRef.current = 44222;
            }
            const st = statsRef.current;
            if (note.special === 'ring' && song.id === 'triple-trouble') {
              st.rings += 1;
              ringConfirmUntilMsRef.current = curMs + 165;
              soundEngine.playRingCollect();
              continue;
            }
            st.totalNotesHit += 1;
            st.totalNotesEncountered += 1;
            st.sicks += 1;
            st.combo += 1;
            if (st.combo > st.maxCombo) st.maxCombo = st.combo;
            st.score += 350;
            if (note.special === 'ring') st.rings += 1;
            st.health = Math.min(100, st.health + 0.84);
            scoreTextZoomRef.current = st.combo % 50 === 0 && st.combo > 0 ? 1.38 : 1.075;

            if (st.combo % 50 === 0 && st.combo > 0) {
              dramaticBannerRef.current = {
                text: `🔥 ${st.combo} COMBO STREAK! 🔥`,
                untilMs: curMs + 1200,
                isMajin: false,
              };
            }

            playerPoseRef.current = {
              pose: DIRECTION_FROM_POSE[note.lane],
              startedMs: curMs,
              untilMs: curMs + Math.max(260, note.sustainMs),
            };
            playerConfirmUntilMsRef.current[note.lane] =
              curMs + Math.max(150, note.sustainMs);
            hitSplashesRef.current.push({
              lane: note.lane,
              timeMs: curMs,
              color: LANE_COLORS[note.lane],
            });
            judgementPopupRef.current = {
              text: 'SICK!!',
              combo: st.combo,
              timeMs: curMs,
              diffMs: 0,
            };
            soundEngine.playVocalNote(
              note.pitchMidi,
              true,
              playerCharRef.current,
              Math.max(180, note.sustainMs),
              note.special,
              settings.musicVolume,
              song.id
            );
            continue;
          }

          // Player Missed Note (Passed > 165ms ago): exact -100 points & 0% accuracy weight
          if (note.isPlayer && curMs - note.timeMs > 165) {
            note.missed = true;
            // In Practice Mode, Phantom Note, or Ring Note: remove misses & prevent game over!
            if (
              note.special === 'phantom' ||
              note.special === 'ring' ||
              settings.practiceMode
            ) {
              continue;
            }
            const st = statsRef.current;
            st.totalNotesEncountered += 1;

            if (st.rings > 0) {
              st.rings -= 1;
              soundEngine.playRingCollect();
            } else {
              st.misses += 1;
              st.combo = 0;
              st.score -= 100;
              const hpPenalty = note.special === 'static' ? 9.8 : 5.25;
              st.health = Math.max(0, st.health - hpPenalty);
              if (note.special === 'static') {
                staticAlphaRef.current = 0.75;
                soundEngine.playStaticBurst();
              } else {
                soundEngine.playMissSound();
              }
            }

            playerPoseRef.current = {
              pose: 'miss',
              startedMs: curMs,
              untilMs: curMs + 340,
            };
            judgementPopupRef.current = null;

            if (st.health <= 0 && !settings.botplay && !settings.practiceMode) {
              soundEngine.stopSyncedStems(true);
              onGameOver({ ...st });
              return;
            }
          }
        }

        if (curMs >= totalDurationMs) {
          soundEngine.stopSyncedStems(true);
          onSongComplete({ ...statsRef.current });
          return;
        }

        if (curMs > opponentPoseRef.current.untilMs) {
          opponentPoseRef.current.pose = 'idle';
        }
        if (curMs > playerPoseRef.current.untilMs) {
          playerPoseRef.current.pose = 'idle';
        }

        if (
          curMs < phantomDrainUntilMsRef.current &&
          !settings.practiceMode &&
          !settings.botplay
        ) {
          statsRef.current.health = Math.max(
            1,
            statsRef.current.health - dt * 0.0045
          );
        }

        if (staticAlphaRef.current > 0) {
          staticAlphaRef.current = Math.max(
            0,
            staticAlphaRef.current - dt * 0.0012
          );
        }
        if (redFlashAlphaRef.current > 0) {
          redFlashAlphaRef.current = Math.max(
            0,
            redFlashAlphaRef.current - dt * 0.0018
          );
        }
        if (whiteFlashAlphaRef.current > 0) {
          whiteFlashAlphaRef.current = Math.max(
            0,
            whiteFlashAlphaRef.current - dt * 0.0045
          );
        }
      }

      // 5. Render Canvas Frame (Scaled to active Video Quality pixel resolution while keeping 1280x720 stage layout)
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', {
          alpha: false,
        });
        if (ctx) {
          const isAntiLag = Boolean(settings.antiLagMode);
          const isLowQuality = canvas.width < 1280;
          ctx.imageSmoothingEnabled = !isAntiLag && !isLowQuality;
          if (!isAntiLag && !isLowQuality) {
            ctx.imageSmoothingQuality = 'medium';
          }
          const w = 1280;
          const h = 720;
          ctx.save();
          ctx.scale(canvas.width / w, canvas.height / h);

          const beatPeriod = 60000 / song.bpm;
          if (!isPaused && curMs >= 0) {
            const curBeatIndex = Math.floor(curMs / beatPeriod);
            const bopRate = Math.max(1, cameraBopRateRef.current);
            if (
              curBeatIndex > lastBopBeatRef.current &&
              curBeatIndex % bopRate === 0
            ) {
              lastBopBeatRef.current = curBeatIndex;
              if (!isAntiLag) {
                camBeatPulseRef.current =
                  0.022 * Math.min(1.6, cameraBopIntensityRef.current);
              }
            }
          }
          if (!isPaused) {
            camBeatPulseRef.current *= Math.exp(-dt * 0.0065);
            screenShakeIntensityRef.current *= Math.exp(-dt * 0.005);
          }
          let shakeX = 0;
          let shakeY = 0;
          if (screenShakeIntensityRef.current > 0.05) {
            const angle = Math.random() * Math.PI * 2;
            const dist =
              screenShakeIntensityRef.current * (0.45 + Math.random() * 0.55);
            shakeX = Math.cos(angle) * dist;
            shakeY = Math.sin(angle) * dist;
          }

          const beatZoom = 1 + (isAntiLag ? 0 : camBeatPulseRef.current);

          const isHillStage =
            stageThemeRef.current === 'cursed-green-hill' ||
            stageThemeRef.current === 'green-hill-clean';
          const isYcrStage = stageThemeRef.current === 'ycr-crimson';
          const isHillOrYcr = isHillStage || isYcrStage;
          const isPixelStage = stageThemeRef.current === 'ycr-pixel-genesis';
          const isSonicSection =
            song.id === 'triple-trouble' &&
            (stageThemeRef.current === 'triple-trouble-xeno' ||
              opponentCharRef.current === 'xenophanes' ||
              opponentCharRef.current === 'xenophanes-flipped');

          const isSonicFirstTurn =
            song.id === 'triple-trouble' &&
            (stageThemeRef.current === 'triple-trouble-xeno' ||
              opponentCharRef.current === 'xenophanes' ||
              opponentCharRef.current === 'xenophanes-flipped') &&
            curMs < 234000;

          const baseStageZoom = isPixelStage
            ? 1.48
            : isSonicSection
              ? 1.36
              : 1.72;
          const camZoom = isAntiLag
            ? baseStageZoom
            : isPixelStage
              ? baseStageZoom * beatZoom
              : baseStageZoom * beatZoom * stageZoomCurrentRef.current;
          const camOffsetX =
            isAntiLag || isPixelStage
              ? 0
              : cameraCurrentXRef.current + cameraNoteOffsetXRef.current;
          const camOffsetY =
            isAntiLag || isPixelStage
              ? 0
              : cameraCurrentYRef.current + cameraNoteOffsetYRef.current;
          // Anchor stage zoom directly on the center of GF's boombox (w * 0.5, h * 0.60)
          const zoomPivotY = h * 0.6;

          ctx.save();
          ctx.translate(
            w / 2 - camOffsetX * 0.95 + shakeX,
            zoomPivotY - camOffsetY * 0.85 + shakeY
          );
          ctx.scale(camZoom, camZoom);
          ctx.translate(-w / 2, -zoomPivotY);

          // A. Draw High-Definition Multi-Layer Stage Background
          const bgImg = isAntiLag
            ? undefined
            : stageImagesRef.current[song.stageImage];
          if (stageThemeRef.current === 'green-hill-clean') {
            drawGreenHillCleanStage(ctx, w, h, camOffsetX);
          } else if (isHillStage) {
            drawPolishedStageBackLayers(ctx, w, h, song.id, camOffsetX);
          } else if (isPixelStage) {
            drawPixelGenesisStage(ctx, w, h, curMs);
          } else if (stageThemeRef.current === 'ycr-crimson') {
            drawYcrCrimsonStage(
              ctx,
              w,
              h,
              isAntiLag ? -1 : Math.max(0, curMs),
              camOffsetX,
              bgImg
            );
          } else if (stageThemeRef.current === 'endless-majin') {
            drawEndlessMajinStage(ctx, w, h, camOffsetX, bgImg);
          } else {
            if (isSonicFirstTurn) {
              ctx.save();
              ctx.translate(w / 2, 0);
              ctx.scale(-1, 1);
              ctx.translate(-w / 2, 0);
              drawTripleTroubleStage(ctx, w, h, camOffsetX, bgImg, true);
              ctx.restore();
            } else {
              drawTripleTroubleStage(
                ctx,
                w,
                h,
                camOffsetX,
                bgImg,
                stageThemeRef.current === 'triple-trouble-xeno'
              );
            }
          }

          // B. Apply GF with the speakers to every song except Endless, Endless OG, Triple Trouble, and the YCR 16-bit Pixel section!
          if (song.id === 'endless' || song.id === 'endless-og') {
            drawMajinForestBoppers(
              ctx,
              w,
              h,
              song.bpm,
              Math.max(0, curMs),
              'back',
              camOffsetX
            );
          } else if (!isPixelStage && song.id !== 'triple-trouble') {
            drawSpeakerGirlfriend(
              ctx,
              w * 0.5,
              isHillOrYcr ? h * 0.625 : h * 0.62,
              song.bpm,
              Math.max(0, curMs),
              stageThemeRef.current,
              song.id.includes('encore')
            );
          }

          // C. Draw Opponent & Player Characters positioned around GF's boombox matching the video
          const oppBaseX = isSonicSection ? w * 0.295 : w * 0.355;
          const plrBaseX = isSonicSection ? w * 0.705 : w * 0.645;
          const isFlippedStage =
            isSonicFirstTurn || isSonicSection || (!isPixelStage && lanesFlippedRef.current);
          const oppX = isFlippedStage ? plrBaseX : oppBaseX;
          const plrX = isFlippedStage ? oppBaseX : plrBaseX;
          const oppY = isPixelStage
            ? h * 0.695
            : isSonicSection
              ? (isHillOrYcr ? h * 0.695 : h * 0.69)
              : h * 0.672;
          const plrY = isPixelStage
            ? h * 0.705
            : isSonicSection
              ? (isHillOrYcr ? h * 0.705 : h * 0.69)
              : h * 0.672;

          drawOpponentSprite(
            ctx,
            oppX,
            oppY,
            opponentCharRef.current,
            opponentPoseRef.current.pose,
            Math.max(0, curMs),
            song.bpm,
            opponentPoseRef.current.startedMs,
            isSonicFirstTurn
          );

          drawPlayerSprite(
            ctx,
            plrX,
            plrY,
            playerCharRef.current,
            playerPoseRef.current.pose,
            Math.max(0, curMs),
            song.bpm,
            stageThemeRef.current,
            playerPoseRef.current.startedMs,
            isSonicFirstTurn || (!isPixelStage && lanesFlippedRef.current)
          );

          // Foreground Majin Boppers or Foreground TreesFG.png (zIndex 1000, scroll 1.1)
          if (!isAntiLag) {
            if (stageThemeRef.current === 'endless-majin') {
              drawMajinForestBoppers(
                ctx,
                w,
                h,
                song.bpm,
                Math.max(0, curMs),
                'front',
                camOffsetX
              );
            } else if (stageThemeRef.current === 'cursed-green-hill') {
              drawPolishedStageForegroundLayer(ctx, w, h, camOffsetX);
            } else if (song.id === 'triple-trouble') {
              drawTripleTroubleForegroundLayer(ctx, w, h, camOffsetX);
            }
          }

          ctx.restore();

          // Post-pixel YCR Mad crimson vignette pulse (RedVG.png from hillAct2.hxc)
          if (!isAntiLag && opponentCharRef.current === 'ycr-mad') {
            const vgPulse =
              0.28 +
              Math.pow(
                0.5 + 0.5 * Math.sin((Math.max(0, curMs) / (beatPeriod * 2)) * Math.PI * 2),
                1.5
              ) *
                0.55;
            drawRedVignetteOverlay(ctx, w, h, vgPulse);
          }

          // Calculate active Strumline Spin angle (clockwise quartOut easing over 0.35s)
          let spinRad = 0;
          if (strumSpinUntilMsRef.current) {
            const elapsedSpin = curMs - strumSpinUntilMsRef.current.startMs;
            const dur = strumSpinUntilMsRef.current.durationMs;
            if (elapsedSpin >= 0 && elapsedSpin <= dur) {
              const p = elapsedSpin / dur;
              const quartOut = 1 - Math.pow(1 - p, 4);
              spinRad = quartOut * Math.PI * 2;
            } else if (elapsedSpin > dur) {
              strumSpinUntilMsRef.current = null;
            }
          }

          // D0. Top Time Bar with Remaining Time (matching the video: 400x19 outer black box at y=28, 392x11 inner white fill at y=32 + 32px VCR OSD Mono M:SS text)
          const timeBarW = 392;
          const timeBarH = 11;
          const timeBarX = (w - timeBarW) / 2;
          const timeBarY = settings.downscroll ? h - 36 : 32;
          const songProgress = Math.min(
            1,
            Math.max(0, curMs / totalDurationMs)
          );
          const remainingSec = Math.max(
            0,
            Math.floor((totalDurationMs - Math.max(0, curMs)) / 1000)
          );
          const remMin = Math.floor(remainingSec / 60);
          const remSecPad = String(remainingSec % 60).padStart(2, '0');

          ctx.save();
          // Outer 4px black border (400x19) + black unfilled background
          ctx.fillStyle = '#000000';
          ctx.fillRect(timeBarX - 4, timeBarY - 4, timeBarW + 8, timeBarH + 8);
          // Solid white progress fill from left to right (matching the video!)
          if (songProgress > 0) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(
              timeBarX,
              timeBarY,
              timeBarW * songProgress,
              timeBarH
            );
          }
          // Centered M:SS countdown text over the bar in 32px VCR OSD Mono
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '32px "VCR OSD Mono", "JetBrains Mono", monospace';
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          if (!isAntiLag) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4.5;
            ctx.strokeText(
              `${remMin}:${remSecPad}`,
              w * 0.5,
              timeBarY + timeBarH * 0.5 + 1
            );
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(
            `${remMin}:${remSecPad}`,
            w * 0.5,
            timeBarY + timeBarH * 0.5 + 1
          );
          ctx.restore();

          // D. Draw 8-Lane FNF Strumline & Scrolling Notes (matching the video: 109px arrows, 112px lane spacing, y=50 top edge -> 104 center, x=146.5 & 786.5 centers)
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';

          const receptorY = settings.downscroll ? h - 96 : 104;
          const noteSize = 109;
          const laneGap = 112;

          const leftGroupStartX = lanesFlippedRef.current ? 786.5 : 146.5;
          const rightGroupStartX = lanesFlippedRef.current ? 146.5 : 786.5;

          const getLaneX = (
            isPlayer: boolean,
            lane: Direction
          ) => {
            if (!isPlayer) {
              return leftGroupStartX + lane * laneGap;
            }
            return rightGroupStartX + lane * laneGap;
          };

          const isMajinSkin = majinNoteskinActiveRef.current;
          const isPixelSkin =
            pixelNoteskinActiveRef.current || isPixelStage;

          for (let l = 0; l < 4; l++) {
            const dir = l as Direction;
            const oppConfirm = curMs <= opponentConfirmUntilMsRef.current[dir];
            const plrConfirm =
              curMs <= playerConfirmUntilMsRef.current[dir] ||
              (settings.botplay &&
                playerPoseRef.current.pose === DIRECTION_FROM_POSE[dir] &&
                curMs <= playerPoseRef.current.untilMs);
            const plrPressed = pressedLanesRef.current[dir] || plrConfirm;

            drawFnfArrow(
              ctx,
              getLaneX(false, dir),
              receptorY,
              noteSize,
              dir,
              LANE_COLORS[dir],
              true,
              oppConfirm,
              'normal',
              spinRad,
              isMajinSkin,
              oppConfirm,
              isPixelSkin
            );
            drawFnfArrow(
              ctx,
              getLaneX(true, dir),
              receptorY,
              noteSize,
              dir,
              LANE_COLORS[dir],
              true,
              plrPressed,
              'normal',
              spinRad,
              isMajinSkin,
              plrConfirm,
              isPixelSkin
            );
          }

          const scrollMult =
            Number.isFinite(settings.scrollSpeedMultiplier) &&
            settings.scrollSpeedMultiplier > 0
              ? settings.scrollSpeedMultiplier
              : 1;
          const pxPerMs = 0.46 * song.scrollSpeed * scrollMult;
          const scrollDir = settings.downscroll ? -1 : 1;

          for (let ni = firstActiveNoteIdxRef.current; ni < notes.length; ni++) {
            const note = notes[ni];
            const timeDiff = note.timeMs - curMs;
            if (timeDiff > 1900) break;
            if (timeDiff + note.sustainMs < -260) continue;

            const nx = getLaneX(note.isPlayer, note.lane);
            const ny = receptorY + timeDiff * pxPerMs * scrollDir;
            const color = isMajinSkin ? '#3B82F6' : LANE_COLORS[note.lane];
            const isMissedFade =
              note.missed && note.special !== 'phantom';

            if (isMissedFade) {
              ctx.save();
              ctx.globalAlpha = 0.55;
            }

            if (note.sustainMs > 0) {
              const tailEndMs = note.timeMs + note.sustainMs - curMs;
              const tailStartY = note.hit ? receptorY : ny;
              const tailEndY = receptorY + tailEndMs * pxPerMs * scrollDir;

              drawFnfSustainTail(
                ctx,
                nx,
                tailStartY,
                tailEndY,
                note.lane,
                settings.downscroll,
                isMajinSkin,
                isAntiLag,
                isPixelSkin
              );
            }

            if (!note.hit) {
              drawFnfArrow(
                ctx,
                nx,
                ny,
                noteSize,
                note.lane,
                color,
                false,
                false,
                note.special,
                0,
                isMajinSkin,
                false,
                isPixelSkin
              );
            }

            if (isMissedFade) {
              ctx.restore();
            }
          }

          if (!isAntiLag && hitSplashesRef.current.length > 0) {
            hitSplashesRef.current = hitSplashesRef.current.filter(
              (s) => curMs - s.timeMs < 180
            );
            for (const splash of hitSplashesRef.current) {
              const age = (curMs - splash.timeMs) / 180;
              const sx = getLaneX(true, splash.lane);
              drawBloodNoteSplash(ctx, sx, receptorY, age);
              ctx.save();
              ctx.beginPath();
              ctx.arc(
                sx,
                receptorY,
                noteSize * (0.52 + age * 0.45),
                0,
                Math.PI * 2
              );
              ctx.strokeStyle = isMajinSkin ? '#60A5FA' : splash.color;
              ctx.globalAlpha = 1 - age;
              ctx.lineWidth = 5;
              ctx.stroke();
              ctx.restore();
            }
          } else if (isAntiLag && hitSplashesRef.current.length > 0) {
            hitSplashesRef.current.length = 0;
          }

          // E. Judgement Popup & Combo Counter (sick.png, good.png, bad.png, shit.png + 3-digit num0..9.png combo counter)
          if (
            judgementPopupRef.current &&
            curMs - judgementPopupRef.current.timeMs < 650
          ) {
            const pop = judgementPopupRef.current;
            const age = (curMs - pop.timeMs) / 650;
            drawJudgmentAndComboPopup(
              ctx,
              pop.text,
              pop.combo,
              w * 0.5,
              h * 0.44,
              age,
              isAntiLag
            );
          }

          // F. Mid-song "I AM GOD" Letterboxed Cutscene (applied exclusively to Too Slow & Too Slow Encore matching the video!)
          const isTooSlowSong =
            song.id === 'too-slow' || song.id === 'too-slow-encore';
          const isGodCutscene =
            isTooSlowSong &&
            ((song.id === 'too-slow' && curMs >= 129500 && curMs <= 140200) ||
              (song.id === 'too-slow-encore' && curMs >= 93000 && curMs <= 103800));

          if (isGodCutscene) {
            ctx.save();
            const letterboxH = 86;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, letterboxH);
            ctx.fillRect(0, h - letterboxH, w, letterboxH);

            const cutsceneRelMs =
              song.id === 'too-slow' ? curMs - 129500 : curMs - 93000;

            let blueText = '';
            let redText = '';

            if (cutsceneRelMs >= 0 && cutsceneRelMs < 3100) {
              blueText = 'i am... gonna catch... ';
              redText = 'yaaaaa!';
            } else if (cutsceneRelMs >= 3100 && cutsceneRelMs < 6800) {
              blueText = 'i am... ';
              redText = 'GOD!';
            }

            if (blueText || redText) {
              ctx.font = 'bold 26px "VCR OSD Mono", monospace';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              const blueW = ctx.measureText(blueText).width;
              const redW = ctx.measureText(redText).width;
              const totalW = blueW + redW;
              const startX = (w - totalW) / 2;
              const textY = h - letterboxH / 2;

              ctx.lineWidth = 5;
              ctx.strokeStyle = '#000000';

              if (blueText) {
                ctx.strokeText(blueText, startX, textY);
                ctx.fillStyle = '#60A5FA';
                ctx.fillText(blueText, startX, textY);
              }
              if (redText) {
                ctx.strokeText(redText, startX + blueW, textY);
                ctx.fillStyle = '#EF4444';
                ctx.fillText(redText, startX + blueW, textY);
              }
            }
            ctx.restore();
          } else if (curMs > 0 && activeLyricsRef.current && !isTooSlowSong) {
            ctx.save();
            ctx.textAlign = 'center';
            const isClimaxLine =
              activeLyricsRef.current.includes('DIE') ||
              activeLyricsRef.current.includes('SOUL') ||
              activeLyricsRef.current.includes("CAN'T RUN");
            ctx.font = isClimaxLine
              ? 'italic 900 50px "Syne", sans-serif'
              : 'italic 800 38px "Syne", sans-serif';
            ctx.fillStyle = isClimaxLine ? '#EF4444' : '#F8FAFC';
            if (!isAntiLag) {
              ctx.strokeStyle = '#09080D';
              ctx.lineWidth = 8;
              ctx.strokeText(activeLyricsRef.current, w * 0.5, h * 0.5);
            }
            ctx.fillText(activeLyricsRef.current, w * 0.5, h * 0.5);
            ctx.restore();
          }

          // G. Health Bar, Beat-Bopping Character Icons, & Stats Below the Bar in VCR OSD Mono (matching the video!)
          const hbWidth = 594;
          const hbHeight = 11;
          const hbX = (w - hbWidth) / 2;
          const hbY = settings.downscroll ? 56 : h - 72;
          const st = statsRef.current;
          const hp = Math.max(0, Math.min(100, displayedHealthRef.current));
          const opponentRatio = (100 - hp) / 100;
          const oppBarColor = getCharacterHealthColor(opponentCharRef.current);
          const plrBarColor = getCharacterHealthColor(playerCharRef.current);

          ctx.save();
          // Outer 4px solid black health bar border (602x19)
          ctx.fillStyle = '#000000';
          ctx.fillRect(hbX - 4, hbY - 4, hbWidth + 8, hbHeight + 8);

          // Opponent health bar fill (Left)
          ctx.fillStyle = oppBarColor;
          ctx.fillRect(hbX, hbY, hbWidth * opponentRatio, hbHeight);

          // Boyfriend health bar fill (Right)
          ctx.fillStyle = plrBarColor;
          ctx.fillRect(
            hbX + hbWidth * opponentRatio,
            hbY,
            hbWidth * (hp / 100),
            hbHeight
          );

          // Beat-bopping Opponent & Boyfriend Head Icons at clash point
          const beatLocalPhase =
            (((Math.max(0, curMs) % beatPeriod) + beatPeriod) % beatPeriod) /
            beatPeriod;
          const iconBopScale = isAntiLag
            ? 1.0
            : 1 + Math.pow(1 - beatLocalPhase, 3.2) * 0.18;
          const clashX = hbX + hbWidth * opponentRatio;
          drawHealthIcon(
            ctx,
            clashX - 28,
            hbY + hbHeight / 2 - 2,
            false,
            opponentCharRef.current,
            st.health > 80,
            iconBopScale
          );
          drawHealthIcon(
            ctx,
            clashX + 28,
            hbY + hbHeight / 2 - 2,
            true,
            playerCharRef.current,
            st.health < 20,
            iconBopScale
          );

          // Bottom Stats Below the Bar in the exact same VCR OSD Mono font as the Time Bar:
          // "Score: 0 | Combo Breaks: 0 | Rating: ?"
          const ratingText = formatPsychRating(st);
          const bottomScoreLine = `Score: ${st.score} | Combo Breaks: ${st.misses} | Rating: ${ratingText}`;
          const statsY = settings.downscroll
            ? hbY + hbHeight + 29
            : hbY + hbHeight + 29;

          ctx.save();
          ctx.translate(w * 0.5, statsY);
          if (!isAntiLag && scoreTextZoomRef.current > 1.001) {
            ctx.scale(scoreTextZoomRef.current, scoreTextZoomRef.current);
          }
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '18px "VCR OSD Mono", "JetBrains Mono", monospace';
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          if (!isAntiLag) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3.6;
            ctx.strokeText(bottomScoreLine, 0, 0);
          } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
            ctx.fillRect(-310, -14, 620, 28);
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(bottomScoreLine, 0, 0);
          ctx.restore();
          ctx.restore();

          if (staticAlphaRef.current > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(220, 38, 38, ${staticAlphaRef.current * 0.35})`;
            ctx.fillRect(0, 0, w, h);
            if (!isAntiLag) {
              for (let i = 0; i < 28; i++) {
                ctx.fillStyle =
                  i % 2 === 0
                    ? `rgba(255,255,255,${staticAlphaRef.current * 0.4})`
                    : `rgba(0,0,0,${staticAlphaRef.current * 0.5})`;
                ctx.fillRect(0, Math.random() * h, w, 4 + Math.random() * 10);
              }
            }
            ctx.restore();
          }

          if (redFlashAlphaRef.current > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(239, 68, 68, ${redFlashAlphaRef.current * 0.45})`;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
          }

          // Too Slow Encore pre-transformation blackout (screen flashes and goes black from final BF note 42667ms until Sonic's laugh at 44222ms)
          if (curMs > 0 && curMs < blackoutUntilMsRef.current) {
            ctx.save();
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
          }

          if (whiteFlashAlphaRef.current > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 255, ${whiteFlashAlphaRef.current * 0.92})`;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
          }

          // Full-screen Jumpscare Picture or Full VHS Static Screen Transition
          if (curMs > 0 && curMs < spookUntilMsRef.current) {
            if (settings.disableJumpscares) {
              const staticProgress = (spookUntilMsRef.current - curMs) / 550;
              drawFullStaticTransition(ctx, w, h, staticProgress);
            } else {
              drawSonicJumpscare(ctx, w, h, spookTypeRef.current);
            }
          }

          // Triple Trouble 08:27–08:29 Creepy Sound Test Numbers Ending Screen (from video!)
          if (song.id === 'triple-trouble' && curMs >= 506800) {
            ctx.save();
            ctx.fillStyle = '#070709';
            ctx.fillRect(0, 0, w, h);
            // Subtle VHS tracking line
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(0, h * 0.42, w, 4);
            const rows: [string, string, string, string][] = [
              ['07', '#C2A878', '07', '#B89F72'],
              ['12', '#6478B4', '25', '#7660A8'],
              ['66', '#B86B4B', '06', '#6D9E6F'],
              ['8', '#B89B5E', '21', '#5D9E68'],
              ['31', '#A85A6C', '13', '#9E3B42'],
            ];
            ctx.font = '700 46px "JetBrains Mono", monospace';
            ctx.textBaseline = 'middle';
            rows.forEach(([leftNum, leftCol, rightNum, rightCol], rIdx) => {
              const ry = h * 0.31 + rIdx * 64;
              ctx.textAlign = 'right';
              ctx.fillStyle = leftCol;
              ctx.fillText(leftNum, w * 0.5 - 12, ry);
              ctx.textAlign = 'left';
              ctx.fillStyle = rightCol;
              ctx.fillText(rightNum, w * 0.5 + 12, ry);
            });
            ctx.restore();
          }

          ctx.restore(); // End 1920x1080 scale
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, onGameOver, onSongComplete, settings, song]);

  const videoQuality = getVideoQualityResolution(
    settings.pixelRatioX,
    settings.pixelRatioY
  );

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen bg-black flex items-center justify-center select-none'
          : 'relative w-full max-w-[1440px] mx-auto rounded-xl overflow-hidden border border-white/15 bg-[#09080D] shadow-2xl select-none'
      }
    >
      {/* Main Stage Canvas with Dynamic Video Quality (Pixel Resolution) & Fixed Aspect Ratio */}
      <div className="relative aspect-video w-full max-h-screen bg-[#09080D] group">
        <canvas
          key={`stage-canvas-sync-${song.id}-${videoQuality.width}x${videoQuality.height}`}
          ref={canvasRef}
          width={videoQuality.width}
          height={videoQuality.height}
          style={{
            imageRendering:
              videoQuality.width < 1280 || settings.antiLagMode
                ? 'pixelated'
                : 'auto',
          }}
          className="w-full h-full block"
        />

        {settings.crtFilter && !settings.antiLagMode && (
          <div className="pointer-events-none absolute inset-0 crt-scanlines crt-vignette" />
        )}

        {/* Top-Left Video Quality & Pixel Ratio Readout */}
        <div className="pointer-events-none absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded bg-black/60 border border-white/10 text-[11px] font-mono text-slate-300 opacity-75 group-hover:opacity-100 transition-opacity">
          <span>
            RATIO: {settings.pixelRatioX}:{settings.pixelRatioY}
          </span>
          <span>·</span>
          <span className="text-cyan-300 font-semibold">
            QUALITY: {videoQuality.label}
          </span>
          {settings.antiLagMode && (
            <>
              <span>·</span>
              <span className="text-emerald-400 font-bold">ANTI-LAG ON</span>
            </>
          )}
        </div>

        {/* Top-Right Fullscreen Toggle Button */}
        <button
          onClick={onToggleFullscreen}
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/65 hover:bg-black/85 border border-white/15 text-xs font-mono font-semibold text-slate-200 hover:text-white opacity-80 group-hover:opacity-100 transition-all"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (1920x1080)'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-red-400" />
              Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-red-400" />
              Fullscreen
            </>
          )}
        </button>
      </div>
    </div>
  );
};
