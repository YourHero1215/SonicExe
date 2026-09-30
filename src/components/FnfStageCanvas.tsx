import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import {
  CharacterPose,
  ChartNote,
  Direction,
  GameplaySettings,
  JudgementTier,
  KeybindConfig,
  OpponentCharacterId,
  PlayerCharacterId,
  PlayStats,
  SongEvent,
  SongMetadata,
  StageThemeId,
} from '../types/game';
import { generateSongChartAndEvents, STAGE_IMAGES } from '../data/songs';
import { soundEngine } from '../audio/soundEngine';
import {
  calculateAccuracy,
  calculateGrade,
  drawBloodNoteSplash,
  drawFnfArrow,
  drawHealthIcon,
  drawMajinForestBoppers,
  drawOpponentSprite,
  drawPixelGenesisStage,
  drawPlayerSprite,
  drawSpeakerGirlfriend,
  LANE_COLORS,
} from '../canvas/spriteRenderer';
import {
  drawEndlessMajinStage,
  drawPolishedStageBackLayers,
  drawPolishedStageForegroundLayer,
  drawTripleTroubleStage,
  drawYcrCrimsonStage,
} from '../canvas/polishedStageRenderer';

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
    Object.values(STAGE_IMAGES).forEach((src) => {
      if (!stageImagesRef.current[src]) {
        const img = new Image();
        img.referrerPolicy = 'no-referrer';
        img.src = src;
        stageImagesRef.current[src] = img;
      }
    });
  }, []);

  const chartRef = useRef<{ notes: ChartNote[]; events: SongEvent[] }>({
    notes: [],
    events: [],
  });
  const songTimeMsRef = useRef<number>(-2000);
  const lastFramePerfRef = useRef<number>(0);
  const lastSubBeatRef = useRef<number>(-1);
  const stemsStartedAtZeroRef = useRef<boolean>(false);

  const opponentCharRef = useRef<OpponentCharacterId>(song.initialOpponent);
  const playerCharRef = useRef<PlayerCharacterId>(song.initialPlayer);
  const stageThemeRef = useRef<StageThemeId>(song.stageTheme);
  const lanesFlippedRef = useRef<boolean>(false);

  // V-Slice Endless dynamic states (Strumline Spin, FocusCamera, ZoomCamera, NoteSwapEvent)
  const strumSpinUntilMsRef = useRef<{ startMs: number; durationMs: number } | null>(null);
  const cameraTargetFocusRef = useRef<number>(0); // -65 for Opponent (char 1), +65 for Player (char 0)
  const cameraCurrentXRef = useRef<number>(0);
  const stageZoomOverrideRef = useRef<number>(1.0);
  const majinNoteskinActiveRef = useRef<boolean>(false);

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
  });

  const [hudStats, setHudStats] = useState<PlayStats>(statsRef.current);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [activePhaseLabel, setActivePhaseLabel] = useState<string>(song.subtitle);

  // Initialize chart and reset synced .ogg stems on song mount
  useEffect(() => {
    soundEngine.stopSyncedStems(true);
    soundEngine.preloadSongStems(song.id).catch(() => {});
    chartRef.current = generateSongChartAndEvents(song.id);
    songTimeMsRef.current = -2000;
    lastSubBeatRef.current = -1;
    stemsStartedAtZeroRef.current = false;
    opponentCharRef.current = song.initialOpponent;
    playerCharRef.current = song.initialPlayer;
    stageThemeRef.current = song.stageTheme;
    lanesFlippedRef.current = false;
    strumSpinUntilMsRef.current = null;
    cameraTargetFocusRef.current = 0;
    cameraCurrentXRef.current = 0;
    stageZoomOverrideRef.current = 1.0;
    majinNoteskinActiveRef.current = false;
    staticAlphaRef.current = 0;
    redFlashAlphaRef.current = 0;
    activeLyricsRef.current = '';
    spookUntilMsRef.current = -Infinity;
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
      rings: song.id.includes('encore') || song.id === 'triple-trouble' ? 1 : 0,
      health: 50,
    };
    setHudStats({ ...statsRef.current });
    setActivePhaseLabel(song.subtitle);

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
      const nowMs = songTimeMsRef.current;
      pressedLanesRef.current[lane] = true;

      const hitWindowMs = 165;
      let candidate: ChartNote | null = null;
      let bestAbsDiff = Infinity;

      for (const note of chartRef.current.notes) {
        if (!note.isPlayer || note.hit || note.missed || note.lane !== lane) {
          continue;
        }
        const diff = note.timeMs - nowMs;
        const absDiff = Math.abs(diff);
        if (absDiff <= hitWindowMs && absDiff < bestAbsDiff) {
          bestAbsDiff = absDiff;
          candidate = note;
        }
      }

      if (candidate) {
        candidate.hit = true;
        if (candidate.sustainMs > 0) {
          candidate.holding = true;
        }

        const st = statsRef.current;
        st.totalNotesHit += 1;
        st.totalNotesEncountered += 1;
        st.combo += 1;
        if (st.combo > st.maxCombo) st.maxCombo = st.combo;

        let tier: JudgementTier = 'SICK!!';
        let scoreGain = 350;
        let hpGain = 2.8;

        // Exact judgement point values: Sick = 350, Good = 200, Bad = 50, Shit = -10
        if (bestAbsDiff <= 45) {
          tier = 'SICK!!';
          st.sicks += 1;
          scoreGain = 350;
          hpGain = 3.2;
          hitSplashesRef.current.push({
            lane,
            timeMs: nowMs,
            color: LANE_COLORS[lane],
          });
        } else if (bestAbsDiff <= 90) {
          tier = 'GOOD!';
          st.goods += 1;
          scoreGain = 200;
          hpGain = 1.8;
        } else if (bestAbsDiff <= 130) {
          tier = 'BAD';
          st.bads += 1;
          scoreGain = 50;
          hpGain = 0.5;
        } else {
          tier = 'SHIT';
          st.shits += 1;
          scoreGain = -10;
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

        playerPoseRef.current = {
          pose: DIRECTION_FROM_POSE[lane],
          startedMs: nowMs,
          untilMs: nowMs + 280,
        };

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
          st.score -= 75;
          st.health = Math.max(0, st.health - 4.5);
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

      if (e.code === keybinds.pause || e.code === 'Escape') {
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
      }
      if (e.code === keybinds.down || e.code === 'ArrowDown') {
        pressedLanesRef.current[1] = false;
      }
      if (e.code === keybinds.up || e.code === 'ArrowUp') {
        pressedLanesRef.current[2] = false;
      }
      if (e.code === keybinds.right || e.code === 'ArrowRight') {
        pressedLanesRef.current[3] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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

        // Wait at -10ms if built-in .ogg stems are still decoding so they start cleanly at 0.000s
        if (
          isSongStillLoading &&
          !hasSongStems &&
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
          setHudStats({ ...statsRef.current });
          setProgressPct(
            Math.min(100, Math.max(0, (curMs / totalDurationMs) * 100))
          );
        }
      }

      // 2. Process Song Events (Stage Swaps, Boss Swaps, Strumline Spins, Camera Focus, Lyrics, Flashes)
      for (const ev of chartRef.current.events) {
        if (!ev.triggered && curMs >= ev.timeMs) {
          ev.triggered = true;
          if (ev.type === 'stage_swap') {
            stageThemeRef.current = ev.value as StageThemeId;
            redFlashAlphaRef.current = 0.75;
          } else if (ev.type === 'character_swap') {
            const [opp, plr] = ev.value.split(':');
            if (opp) opponentCharRef.current = opp as OpponentCharacterId;
            if (plr) playerCharRef.current = plr as PlayerCharacterId;
            redFlashAlphaRef.current = 0.75;
            if (song.id === 'too-slow-encore') {
              dramaticBannerRef.current = {
                text: 'SONIC.EXE REVEALED!',
                untilMs: curMs + 1500,
                isMajin: false,
              };
              setActivePhaseLabel('Phase 2 · Sonic.EXE Unleashed');
              soundEngine.playStaticBurst();
            }
          } else if (ev.type === 'flip_lanes') {
            lanesFlippedRef.current = ev.value === 'true';
          } else if (ev.type === 'strumline_spin') {
            const rawDur = parseFloat(ev.value) || 350;
            strumSpinUntilMsRef.current = {
              startMs: curMs,
              durationMs: rawDur < 10 ? rawDur * 1000 : rawDur,
            };
          } else if (ev.type === 'camera_bop') {
            const parts = ev.value.split(':');
            const bopZoom = parseFloat(parts[1] || parts[0]) || 1.05;
            if (bopZoom > 1.1) {
              redFlashAlphaRef.current = 0.35;
            }
          } else if (ev.type === 'focus_camera') {
            // char 1 = Opponent (left), char 0 = Player (right)
            cameraTargetFocusRef.current = ev.value === '1' ? -55 : 55;
          } else if (ev.type === 'zoom_camera') {
            stageZoomOverrideRef.current = parseFloat(ev.value) || 1.0;
          } else if (ev.type === 'noteskin_swap') {
            majinNoteskinActiveRef.current = ev.value === 'majin';
            setActivePhaseLabel('EXE (Majin) Noteskin Active · Fun Is Infinite');
          } else if (ev.type === 'lyrics') {
            activeLyricsRef.current = ev.value;
            if (ev.value) {
              setActivePhaseLabel(ev.value);
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
              setActivePhaseLabel(song.subtitle);
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
                untilMs: curMs + (song.id.includes('you-cant-run') ? 2800 : 6800),
              };
              redFlashAlphaRef.current = 0.65;
            } else if (
              ev.value === 'singDOWN-alt' ||
              ev.value === 'dad:singDOWN-alt' ||
              ev.value === 'dad:laugh' ||
              ev.value === 'jijijija' ||
              ev.value === 'dad:jijijija'
            ) {
              opponentPoseRef.current = {
                pose: 'laugh',
                startedMs: curMs,
                untilMs:
                  curMs +
                  (ev.value.includes('jijijija') ? 1100 : 550),
              };
            } else if (ev.value === 'dad:scream') {
              opponentPoseRef.current = {
                pose: 'up',
                startedMs: curMs,
                untilMs: curMs + 650,
              };
              redFlashAlphaRef.current = 0.55;
            }
          } else if (ev.type === 'too_slow_flash') {
            redFlashAlphaRef.current = ev.value === '2' ? 0.92 : 0.55;
            staticAlphaRef.current = ev.value === '2' ? 0.45 : 0.22;
          } else if (ev.type === 'sonicspook') {
            spookUntilMsRef.current = curMs + 650;
            redFlashAlphaRef.current = 0.95;
            staticAlphaRef.current = 0.65;
            soundEngine.playStaticBurst();
          } else if (ev.type === 'screamer_text') {
            dramaticBannerRef.current = {
              text: ev.value,
              untilMs: curMs + 1600,
              isMajin: false,
            };
            setActivePhaseLabel(ev.value);
            soundEngine.playStaticBurst();
            staticAlphaRef.current = 0.45;
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

      // Smoothly interpolate camera focus X
      cameraCurrentXRef.current +=
        (cameraTargetFocusRef.current - cameraCurrentXRef.current) *
        Math.min(1, dt * 0.008);

      // 3. Process Notes
      for (const note of chartRef.current.notes) {
        if (note.hit || note.missed) {
          if (note.isPlayer && note.holding) {
            if (
              curMs <= note.timeMs + note.sustainMs &&
              (pressedLanesRef.current[note.lane] || settings.botplay)
            ) {
              statsRef.current.health = Math.min(
                100,
                statsRef.current.health + dt * 0.004
              );
              playerPoseRef.current = {
                pose: DIRECTION_FROM_POSE[note.lane],
                startedMs: playerPoseRef.current.startedMs,
                untilMs: curMs + 120,
              };
            } else if (curMs > note.timeMs + note.sustainMs) {
              note.holding = false;
            }
          } else if (!note.isPlayer && note.holding) {
            // Drain health gently while the opponent holds sustain notes
            if (curMs <= note.timeMs + note.sustainMs) {
              if (statsRef.current.health > 15) {
                statsRef.current.health = Math.max(
                  15,
                  statsRef.current.health - dt * 0.0014
                );
              }
              opponentPoseRef.current = {
                pose: DIRECTION_FROM_POSE[note.lane],
                startedMs: opponentPoseRef.current.startedMs,
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

        // Player Notes in Botplay Mode: Auto-hit with SICK!! (exact 350 points)
        if (note.isPlayer && settings.botplay && curMs >= note.timeMs) {
          note.hit = true;
          note.holding = note.sustainMs > 0;
          const st = statsRef.current;
          st.totalNotesHit += 1;
          st.totalNotesEncountered += 1;
          st.sicks += 1;
          st.combo += 1;
          if (st.combo > st.maxCombo) st.maxCombo = st.combo;
          st.score += 350;
          if (note.special === 'ring') st.rings += 1;
          st.health = Math.min(100, st.health + 2.8);

          playerPoseRef.current = {
            pose: DIRECTION_FROM_POSE[note.lane],
            startedMs: curMs,
            untilMs: curMs + Math.max(260, note.sustainMs),
          };
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

        // Player Missed Note (Passed > 165ms ago): exact -75 points & 0% accuracy weight
        if (note.isPlayer && curMs - note.timeMs > 165) {
          note.missed = true;
          // In Practice Mode or Phantom Note: remove misses & prevent game over!
          if (note.special === 'phantom' || settings.practiceMode) {
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
            st.score -= 75;
            const hpPenalty = note.special === 'static' ? 14 : 7.5;
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
          judgementPopupRef.current = {
            text: 'MISS',
            combo: 0,
            timeMs: curMs,
            diffMs: 165,
          };

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

      // 5. Render Canvas Frame (Native 2560x1440 2K QHD Supersampled Resolution)
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          const rawW = canvas.width; // 2560
          const rawH = canvas.height; // 1440
          ctx.clearRect(0, 0, rawW, rawH);

          // Use 1280x720 logical coordinates scaled cleanly by 2.0x to crisp 2560x1440
          const w = 1280;
          const h = 720;
          ctx.save();
          ctx.scale(rawW / w, rawH / h);

          const beatPeriod = 60000 / song.bpm;
          const measurePeriod = beatPeriod * 4;
          const measurePhase =
            ((curMs % measurePeriod) + measurePeriod) % measurePeriod;
          const beatZoom =
            curMs > 0 && measurePhase < 150
              ? 1 + (1 - measurePhase / 150) * 0.032
              : 1;
          // Zoom in closer on the stage (1.15x base camera zoom) so characters and stage details are larger and more immersive
          const baseStageZoom = 1.15;
          const camZoom =
            baseStageZoom * beatZoom * stageZoomOverrideRef.current;
          const camOffsetX = cameraCurrentXRef.current;
          const zoomPivotY = h * 0.62;

          ctx.save();
          ctx.translate(w / 2 - camOffsetX * 0.55, zoomPivotY);
          ctx.scale(camZoom, camZoom);
          ctx.translate(-w / 2, -zoomPivotY);

          // A. Draw High-Definition Multi-Layer Stage Background
          const bgImg = stageImagesRef.current[song.stageImage];
          if (stageThemeRef.current === 'cursed-green-hill') {
            drawPolishedStageBackLayers(ctx, w, h, song.id, camOffsetX);
          } else if (stageThemeRef.current === 'ycr-pixel-genesis') {
            drawPixelGenesisStage(ctx, w, h, curMs);
          } else if (stageThemeRef.current === 'ycr-crimson') {
            drawYcrCrimsonStage(ctx, w, h, Math.max(0, curMs), camOffsetX, bgImg);
          } else if (stageThemeRef.current === 'endless-majin') {
            drawEndlessMajinStage(ctx, w, h, camOffsetX, bgImg);
          } else {
            drawTripleTroubleStage(ctx, w, h, camOffsetX, bgImg);
          }

          // B. On Majin Forest ("endless-majin"), gf.alpha = 0 and Majin Boppers Back/Front dance in background!
          if (stageThemeRef.current === 'endless-majin') {
            drawMajinForestBoppers(
              ctx,
              w,
              h,
              song.bpm,
              Math.max(0, curMs),
              'back',
              camOffsetX
            );
          } else {
            drawSpeakerGirlfriend(
              ctx,
              w * 0.5,
              h * 0.62,
              song.bpm,
              Math.max(0, curMs),
              stageThemeRef.current,
              song.id.includes('encore')
            );
          }

          // C. Draw Opponent & Player Characters
          const oppX = lanesFlippedRef.current ? w * 0.74 : w * 0.26;
          const plrX = lanesFlippedRef.current ? w * 0.26 : w * 0.74;
          const charY = h * 0.69;

          drawOpponentSprite(
            ctx,
            oppX,
            charY,
            opponentCharRef.current,
            opponentPoseRef.current.pose,
            Math.max(0, curMs),
            song.bpm,
            opponentPoseRef.current.startedMs
          );

          drawPlayerSprite(
            ctx,
            plrX,
            charY,
            playerCharRef.current,
            playerPoseRef.current.pose,
            Math.max(0, curMs),
            song.bpm,
            stageThemeRef.current,
            playerPoseRef.current.startedMs
          );

          // Foreground Majin Boppers or Foreground TreesFG.png (zIndex 1000, scroll 1.1)
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
          }

          ctx.restore();

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

          // D0. Top Time Bar with Remaining Time (matching Screenshot 2026-09-29 17.39.43.png)
          const timeBarW = 396;
          const timeBarH = 16;
          const timeBarX = (w - timeBarW) / 2;
          const timeBarY = settings.downscroll ? h - 28 : 14;
          const songProgress = Math.min(
            1,
            Math.max(0, curMs / totalDurationMs)
          );
          const remainingSec = Math.max(
            0,
            Math.ceil((totalDurationMs - Math.max(0, curMs)) / 1000)
          );
          const remMin = Math.floor(remainingSec / 60);
          const remSecPad = String(remainingSec % 60).padStart(2, '0');

          ctx.save();
          // Outer black frame
          ctx.fillStyle = '#000000';
          ctx.fillRect(timeBarX - 4, timeBarY - 4, timeBarW + 8, timeBarH + 8);
          // Red progress fill from left to right
          ctx.fillStyle = '#990000';
          ctx.fillRect(timeBarX, timeBarY, timeBarW * songProgress, timeBarH);
          // Centered M:SS countdown text over the bar
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '700 19px "JetBrains Mono", monospace';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 5;
          ctx.strokeText(
            `${remMin}:${remSecPad}`,
            w * 0.5,
            timeBarY + timeBarH * 0.5 + 1
          );
          ctx.fillStyle = '#D4D4D8';
          ctx.fillText(
            `${remMin}:${remSecPad}`,
            w * 0.5,
            timeBarY + timeBarH * 0.5 + 1
          );
          ctx.restore();

          // D. Draw 8-Lane FNF Strumline & Scrolling Notes (matching Screenshot 2026-09-29 17.39.43.png)
          const receptorY = settings.downscroll ? h - 94 : 84;
          const noteSize = 96;
          const laneGap = 104;

          const leftGroupStartX = lanesFlippedRef.current
            ? w - 126 - laneGap * 3
            : 126;
          const rightGroupStartX = lanesFlippedRef.current
            ? 126
            : w - 126 - laneGap * 3;

          const getLaneX = (isPlayer: boolean, lane: Direction) => {
            const base = isPlayer ? rightGroupStartX : leftGroupStartX;
            return base + lane * laneGap;
          };

          const isMajinSkin = majinNoteskinActiveRef.current;

          for (let l = 0; l < 4; l++) {
            const dir = l as Direction;
            drawFnfArrow(
              ctx,
              getLaneX(false, dir),
              receptorY,
              noteSize,
              dir,
              LANE_COLORS[dir],
              true,
              opponentPoseRef.current.pose === DIRECTION_FROM_POSE[dir],
              'normal',
              spinRad,
              isMajinSkin
            );
            drawFnfArrow(
              ctx,
              getLaneX(true, dir),
              receptorY,
              noteSize,
              dir,
              LANE_COLORS[dir],
              true,
              pressedLanesRef.current[dir] ||
                (settings.botplay &&
                  playerPoseRef.current.pose === DIRECTION_FROM_POSE[dir]),
              'normal',
              spinRad,
              isMajinSkin
            );
          }

          const pxPerMs =
            0.46 * song.scrollSpeed * settings.scrollSpeedMultiplier;
          const scrollDir = settings.downscroll ? -1 : 1;

          for (const note of chartRef.current.notes) {
            if (note.missed) continue;
            const timeDiff = note.timeMs - curMs;
            if (timeDiff > 1900 || timeDiff + note.sustainMs < -200) continue;

            const nx = getLaneX(note.isPlayer, note.lane);
            const ny = receptorY + timeDiff * pxPerMs * scrollDir;
            const color = isMajinSkin ? '#3B82F6' : LANE_COLORS[note.lane];

            if (note.sustainMs > 0) {
              const tailEndMs = note.timeMs + note.sustainMs - curMs;
              const tailStartY = note.hit ? receptorY : ny;
              const tailEndY = receptorY + tailEndMs * pxPerMs * scrollDir;

              ctx.save();
              ctx.strokeStyle = isMajinSkin ? '#60A5FA' : color;
              ctx.globalAlpha = 0.75;
              ctx.lineWidth = 28;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(nx, tailStartY);
              ctx.lineTo(nx, tailEndY);
              ctx.stroke();
              ctx.restore();
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
                isMajinSkin
              );
            }
          }

          hitSplashesRef.current = hitSplashesRef.current.filter(
            (s) => curMs - s.timeMs < 180
          );
          for (const splash of hitSplashesRef.current) {
            const age = (curMs - splash.timeMs) / 180;
            const sx = getLaneX(true, splash.lane);
            if (
              song.id === 'triple-trouble' &&
              drawBloodNoteSplash(ctx, sx, receptorY, age)
            ) {
              continue;
            }
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

          // E. Judgement Popup & Combo Counter
          if (
            judgementPopupRef.current &&
            curMs - judgementPopupRef.current.timeMs < 650
          ) {
            const pop = judgementPopupRef.current;
            const age = (curMs - pop.timeMs) / 650;
            const py = h * 0.44 - Math.sin(age * Math.PI) * 18;

            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - age * 0.85);
            ctx.textAlign = 'center';
            ctx.font = 'italic 800 38px "Syne", sans-serif';
            ctx.fillStyle =
              pop.text === 'SICK!!'
                ? '#22D3EE'
                : pop.text === 'GOOD!'
                  ? '#4ADE80'
                  : pop.text === 'MISS'
                    ? '#EF4444'
                    : '#FACC15';
            ctx.strokeStyle = '#09080D';
            ctx.lineWidth = 6;
            ctx.strokeText(pop.text, w * 0.5, py);
            ctx.fillText(pop.text, w * 0.5, py);

            if (pop.combo >= 2) {
              ctx.font = '700 22px "JetBrains Mono", monospace';
              ctx.fillStyle = '#F8FAFC';
              ctx.strokeText(`${pop.combo}x COMBO`, w * 0.5, py + 32);
              ctx.fillText(`${pop.combo}x COMBO`, w * 0.5, py + 32);
            }
            ctx.restore();
          }

          // F. Mid-song Too Slow & You Can't Run lyrics cutscene (only when curMs > 0)
          if (curMs > 0 && activeLyricsRef.current) {
            ctx.save();
            ctx.textAlign = 'center';
            const isClimaxLine =
              activeLyricsRef.current.includes('GOD') ||
              activeLyricsRef.current.includes('DIE') ||
              activeLyricsRef.current.includes('SOUL') ||
              activeLyricsRef.current.includes("CAN'T RUN");
            ctx.font = isClimaxLine
              ? 'italic 900 50px "Syne", sans-serif'
              : 'italic 800 38px "Syne", sans-serif';
            ctx.fillStyle = isClimaxLine ? '#EF4444' : '#F8FAFC';
            ctx.strokeStyle = '#09080D';
            ctx.lineWidth = 8;
            ctx.strokeText(activeLyricsRef.current, w * 0.5, h * 0.5);
            ctx.fillText(activeLyricsRef.current, w * 0.5, h * 0.5);
            ctx.restore();
          }

          if (curMs > 0 && curMs < spookUntilMsRef.current) {
            ctx.save();
            ctx.fillStyle = 'rgba(9, 8, 13, 0.85)';
            ctx.fillRect(0, 0, w, h);
            drawOpponentSprite(
              ctx,
              w * 0.5,
              h * 0.58,
              'sonic-exe',
              'gotcha',
              curMs,
              song.bpm
            );
            ctx.restore();
          }

          // G. Bottom Health Bar, Head Icons, & "Score: 0 | Combo Breaks: 0 | Accuracy: ?" (matching Screenshot 2026-09-29 17.39.59.png)
          const hbWidth = 600;
          const hbHeight = 15;
          const hbX = (w - hbWidth) / 2;
          const hbY = settings.downscroll ? 48 : h - 74;
          const st = statsRef.current;
          const hp = st.health;
          const opponentRatio = (100 - hp) / 100;

          ctx.save();
          // Thick black health bar border
          ctx.fillStyle = '#000000';
          ctx.fillRect(hbX - 4, hbY - 4, hbWidth + 8, hbHeight + 8);

          // Opponent health bar (Left)
          ctx.fillStyle = song.opponentHealthColor;
          ctx.fillRect(hbX, hbY, hbWidth * opponentRatio, hbHeight);

          // Boyfriend health bar (Right)
          ctx.fillStyle = song.playerHealthColor;
          ctx.fillRect(
            hbX + hbWidth * opponentRatio,
            hbY,
            hbWidth * (hp / 100),
            hbHeight
          );

          // Sonic.exe & Boyfriend Head Icons at clash point
          const clashX = hbX + hbWidth * opponentRatio;
          drawHealthIcon(
            ctx,
            clashX - 28,
            hbY + hbHeight / 2 - 2,
            false,
            opponentCharRef.current,
            hp > 80
          );
          drawHealthIcon(
            ctx,
            clashX + 28,
            hbY + hbHeight / 2 - 2,
            true,
            playerCharRef.current,
            hp < 20
          );

          // Bottom Score / Combo Breaks / Accuracy text line (Sick=100%, Good=75%, Bad=50%, Shit=25%, Miss=0%)
          const totalJudged =
            st.sicks + st.goods + st.bads + st.shits + st.misses;
          const liveAcc = calculateAccuracy(st);
          const liveGrade = calculateGrade(liveAcc, st.misses);
          const accText =
            totalJudged === 0 ? '?' : `${liveAcc.toFixed(2)}% (${liveGrade})`;
          const bottomScoreLine = `Score: ${st.score} | Combo Breaks: ${st.misses} | Accuracy: ${accText}`;

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '700 18px "JetBrains Mono", monospace';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 5;
          ctx.strokeText(bottomScoreLine, w * 0.5, hbY + hbHeight + 30);
          ctx.fillStyle = '#F8FAFC';
          ctx.fillText(bottomScoreLine, w * 0.5, hbY + hbHeight + 30);
          ctx.restore();

          if (staticAlphaRef.current > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(220, 38, 38, ${staticAlphaRef.current * 0.35})`;
            ctx.fillRect(0, 0, w, h);
            for (let i = 0; i < 28; i++) {
              ctx.fillStyle =
                i % 2 === 0
                  ? `rgba(255,255,255,${staticAlphaRef.current * 0.4})`
                  : `rgba(0,0,0,${staticAlphaRef.current * 0.5})`;
              ctx.fillRect(0, Math.random() * h, w, 4 + Math.random() * 10);
            }
            ctx.restore();
          }

          if (redFlashAlphaRef.current > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(239, 68, 68, ${redFlashAlphaRef.current * 0.45})`;
            ctx.fillRect(0, 0, w, h);
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

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen bg-black flex items-center justify-center select-none'
          : 'relative w-full max-w-[1440px] mx-auto rounded-xl overflow-hidden border border-white/15 bg-[#09080D] shadow-2xl select-none'
      }
    >
      {/* Main 2560x1440 (2K QHD 16:9) Stage Canvas */}
      <div className="relative aspect-video w-full max-h-screen bg-[#09080D] group">
        <canvas
          ref={canvasRef}
          width={2560}
          height={1440}
          className="w-full h-full block"
        />

        {settings.crtFilter && (
          <div className="pointer-events-none absolute inset-0 crt-scanlines crt-vignette" />
        )}

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
