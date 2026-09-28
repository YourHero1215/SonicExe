import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  drawFnfArrow,
  drawHealthIcon,
  drawOpponentSprite,
  drawPixelGenesisStage,
  drawPlayerSprite,
  drawSpeakerGirlfriend,
  LANE_COLORS,
} from '../canvas/spriteRenderer';
import { formatKeyCode } from './KeybindsModal';

interface FnfStageCanvasProps {
  song: SongMetadata;
  keybinds: KeybindConfig;
  settings: GameplaySettings;
  isPaused: boolean;
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
  onPauseToggle,
  onSongComplete,
  onGameOver,
  onRestart,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Preload stage background images
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

  // Mutable gameplay state inside refs for zero-latency 60fps loop
  const chartRef = useRef<{ notes: ChartNote[]; events: SongEvent[] }>({
    notes: [],
    events: [],
  });
  const songTimeMsRef = useRef<number>(-2000); // 2-second "3, 2, 1, GO!" pre-roll
  const lastFramePerfRef = useRef<number>(0);
  const lastSubBeatRef = useRef<number>(-1);

  const opponentCharRef = useRef<OpponentCharacterId>(song.initialOpponent);
  const playerCharRef = useRef<PlayerCharacterId>(song.initialPlayer);
  const stageThemeRef = useRef<StageThemeId>(song.stageTheme);
  const lanesFlippedRef = useRef<boolean>(false);

  const opponentPoseRef = useRef<{ pose: CharacterPose; untilMs: number }>({
    pose: 'idle',
    untilMs: 0,
  });
  const playerPoseRef = useRef<{ pose: CharacterPose; untilMs: number }>({
    pose: 'idle',
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

  // React state mirror for clean top HUD bar updates
  const [hudStats, setHudStats] = useState<PlayStats>(statsRef.current);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [activePhaseLabel, setActivePhaseLabel] = useState<string>(song.subtitle);

  // Initialize chart on song mount
  useEffect(() => {
    chartRef.current = generateSongChartAndEvents(song.id);
    songTimeMsRef.current = -2000;
    lastSubBeatRef.current = -1;
    opponentCharRef.current = song.initialOpponent;
    playerCharRef.current = song.initialPlayer;
    stageThemeRef.current = song.stageTheme;
    lanesFlippedRef.current = false;
    staticAlphaRef.current = 0;
    redFlashAlphaRef.current = 0;
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
  }, [song]);

  // Process player lane press
  const triggerPlayerLane = useCallback(
    (lane: Direction) => {
      if (isPaused) return;
      const nowMs = songTimeMsRef.current;
      pressedLanesRef.current[lane] = true;

      // Find closest unhit player note in this lane within 165ms window
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
          scoreGain = 100;
          hpGain = 0.5;
        } else {
          tier = 'SHIT';
          st.shits += 1;
          scoreGain = 50;
          hpGain = -1.0;
        }

        if (candidate.special === 'ring') {
          st.rings += 1;
          scoreGain += 500;
        }

        st.score += scoreGain;
        st.health = Math.min(100, Math.max(0, st.health + hpGain));

        playerPoseRef.current = {
          pose: DIRECTION_FROM_POSE[lane],
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
          settings.musicVolume
        );
      } else {
        // Empty lane pressed
        playerPoseRef.current = {
          pose: DIRECTION_FROM_POSE[lane],
          untilMs: nowMs + 180,
        };
        if (!settings.ghostTapping && nowMs > 0) {
          const st = statsRef.current;
          st.misses += 1;
          st.combo = 0;
          st.score = Math.max(0, st.score - 50);
          st.health = Math.max(0, st.health - 4.5);
          playerPoseRef.current = { pose: 'miss', untilMs: nowMs + 300 };
          soundEngine.playMissSound();
          if (st.health <= 0) {
            onGameOver({ ...st });
          }
        }
      }
    },
    [isPaused, onGameOver, settings.ghostTapping, settings.musicVolume]
  );

  // Keyboard Listeners (Custom Keybinds + Arrow Fallbacks)
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
        // Activate Ring shield boost if player has rings
        if (statsRef.current.rings > 0 && statsRef.current.health < 95) {
          statsRef.current.rings -= 1;
          statsRef.current.health = Math.min(100, statsRef.current.health + 18);
          soundEngine.playRingCollect();
        }
        return;
      }

      // Check custom keybinds + standard arrow keys
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
      if (
        e.code === keybinds.left ||
        e.code === 'ArrowLeft'
      ) {
        pressedLanesRef.current[0] = false;
      }
      if (
        e.code === keybinds.down ||
        e.code === 'ArrowDown'
      ) {
        pressedLanesRef.current[1] = false;
      }
      if (
        e.code === keybinds.up ||
        e.code === 'ArrowUp'
      ) {
        pressedLanesRef.current[2] = false;
      }
      if (
        e.code === keybinds.right ||
        e.code === 'ArrowRight'
      ) {
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
        songTimeMsRef.current += dt;
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
          // Sync React HUD every sub-beat
          setHudStats({ ...statsRef.current });
          setProgressPct(
            Math.min(100, Math.max(0, (curMs / totalDurationMs) * 100))
          );
        }
      }

      // 2. Process Song Events (Stage Swaps, Boss Swaps, Majin Countdown, Screamers)
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
            redFlashAlphaRef.current = 0.65;
          } else if (ev.type === 'flip_lanes') {
            lanesFlippedRef.current = ev.value === 'true';
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
              untilMs: curMs + 420,
              isMajin: true,
            };
            soundEngine.playMenuTick(true);
          } else if (ev.type === 'red_flash') {
            redFlashAlphaRef.current = 0.85;
          }
        }
      }

      // 3. Process Notes (Opponent Auto-Hit, Botplay Auto-Hit, Sustain Holds, and Player Misses)
      for (const note of chartRef.current.notes) {
        if (note.hit || note.missed) {
          // Score active sustain holds
          if (
            note.holding &&
            curMs <= note.timeMs + note.sustainMs &&
            (pressedLanesRef.current[note.lane] || settings.botplay)
          ) {
            statsRef.current.score += Math.round(dt * 0.25);
            statsRef.current.health = Math.min(
              100,
              statsRef.current.health + dt * 0.004
            );
            playerPoseRef.current = {
              pose: DIRECTION_FROM_POSE[note.lane],
              untilMs: curMs + 120,
            };
          }
          continue;
        }

        // Opponent Notes: Auto-hit right on time
        if (!note.isPlayer && curMs >= note.timeMs) {
          note.hit = true;
          opponentPoseRef.current = {
            pose: DIRECTION_FROM_POSE[note.lane],
            untilMs: curMs + Math.max(260, note.sustainMs),
          };
          soundEngine.playVocalNote(
            note.pitchMidi,
            false,
            opponentCharRef.current,
            Math.max(180, note.sustainMs),
            note.special,
            settings.musicVolume
          );
          // Sonic.exe / Xenophanes slightly drains health on hit if above 22%
          if (statsRef.current.health > 22) {
            statsRef.current.health = Math.max(
              22,
              statsRef.current.health - 0.55
            );
          }
          continue;
        }

        // Player Notes in Botplay Mode: Auto-hit with SICK!!
        if (note.isPlayer && settings.botplay && curMs >= note.timeMs) {
          note.hit = true;
          note.holding = note.sustainMs > 0;
          const st = statsRef.current;
          st.totalNotesHit += 1;
          st.totalNotesEncountered += 1;
          st.sicks += 1;
          st.combo += 1;
          if (st.combo > st.maxCombo) st.maxCombo = st.combo;
          st.score += note.special === 'ring' ? 850 : 350;
          if (note.special === 'ring') st.rings += 1;
          st.health = Math.min(100, st.health + 2.8);

          playerPoseRef.current = {
            pose: DIRECTION_FROM_POSE[note.lane],
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
            settings.musicVolume
          );
          continue;
        }

        // Player Missed Note (Passed > 165ms ago)
        if (note.isPlayer && curMs - note.timeMs > 165) {
          note.missed = true;
          // Phantom notes are harmless if ignored!
          if (note.special === 'phantom') {
            continue;
          }
          const st = statsRef.current;
          st.totalNotesEncountered += 1;

          // Golden Ring Shield absorbs miss damage if rings > 0!
          if (st.rings > 0) {
            st.rings -= 1;
            soundEngine.playRingCollect();
          } else {
            st.misses += 1;
            st.combo = 0;
            const hpPenalty = note.special === 'static' ? 14 : 7.5;
            st.health = Math.max(0, st.health - hpPenalty);
            if (note.special === 'static') {
              staticAlphaRef.current = 0.75;
              soundEngine.playStaticBurst();
            } else {
              soundEngine.playMissSound();
            }
          }

          playerPoseRef.current = { pose: 'miss', untilMs: curMs + 340 };
          judgementPopupRef.current = {
            text: 'MISS',
            combo: 0,
            timeMs: curMs,
            diffMs: 165,
          };

          if (st.health <= 0 && !settings.botplay) {
            onGameOver({ ...st });
            return;
          }
        }
      }

      // Check Song Completion
      if (curMs >= totalDurationMs) {
        onSongComplete({ ...statsRef.current });
        return;
      }

      // 4. Reset poses to idle when timer expires
      if (curMs > opponentPoseRef.current.untilMs) {
        opponentPoseRef.current.pose = 'idle';
      }
      if (curMs > playerPoseRef.current.untilMs) {
        playerPoseRef.current.pose = 'idle';
      }

      // Decay screen flash / static overlays
      if (staticAlphaRef.current > 0) {
        staticAlphaRef.current = Math.max(0, staticAlphaRef.current - dt * 0.0012);
      }
      if (redFlashAlphaRef.current > 0) {
        redFlashAlphaRef.current = Math.max(
          0,
          redFlashAlphaRef.current - dt * 0.0018
        );
      }

      // 5. Render Canvas Frame
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          // Beat camera zoom pulse on quarter notes
          const beatPeriod = 60000 / song.bpm;
          const measurePeriod = beatPeriod * 4;
          const measurePhase = ((curMs % measurePeriod) + measurePeriod) % measurePeriod;
          const camZoom =
            curMs > 0 && measurePhase < 140
              ? 1 + (1 - measurePhase / 140) * 0.022
              : 1;

          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.scale(camZoom, camZoom);
          ctx.translate(-w / 2, -h / 2);

          // A. Draw Stage Background
          if (stageThemeRef.current === 'ycr-pixel-genesis') {
            drawPixelGenesisStage(ctx, w, h, curMs);
          } else {
            const bgImg = stageImagesRef.current[song.stageImage];
            if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
              ctx.drawImage(bgImg, 0, 0, w, h);
              // Atmospheric contrast vignette scrim
              const scrim = ctx.createLinearGradient(0, 0, 0, h);
              scrim.addColorStop(0, 'rgba(9, 8, 13, 0.45)');
              scrim.addColorStop(0.5, 'rgba(9, 8, 13, 0.18)');
              scrim.addColorStop(1, 'rgba(9, 8, 13, 0.72)');
              ctx.fillStyle = scrim;
              ctx.fillRect(0, 0, w, h);
            } else {
              // Instant styled procedural stage fallback
              drawPixelGenesisStage(ctx, w, h, curMs);
            }
          }

          // B. Draw Girlfriend on Speakers in center background
          drawSpeakerGirlfriend(
            ctx,
            w * 0.5,
            h * 0.62,
            song.bpm,
            Math.max(0, curMs),
            stageThemeRef.current
          );

          // C. Draw Opponent & Player Characters (flips sides during Soul Knuckles in Triple Trouble!)
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
            song.bpm
          );

          drawPlayerSprite(
            ctx,
            plrX,
            charY,
            playerCharRef.current,
            playerPoseRef.current.pose,
            Math.max(0, curMs),
            song.bpm,
            stageThemeRef.current
          );

          ctx.restore(); // End camera zoom transform for HUD & Note Highway

          // D. Draw 8-Lane FNF Strumline & Scrolling Notes
          const receptorY = settings.downscroll ? h - 105 : 95;
          const noteSize = 54;
          const laneGap = 64;

          const leftGroupStartX = lanesFlippedRef.current
            ? w - 70 - laneGap * 3.5
            : 70 + laneGap * 0.5;
          const rightGroupStartX = lanesFlippedRef.current
            ? 70 + laneGap * 0.5
            : w - 70 - laneGap * 3.5;

          const getLaneX = (isPlayer: boolean, lane: Direction) => {
            const base = isPlayer ? rightGroupStartX : leftGroupStartX;
            return base + lane * laneGap;
          };

          // Draw 8 Receptors
          for (let l = 0; l < 4; l++) {
            const dir = l as Direction;
            // Opponent receptor
            drawFnfArrow(
              ctx,
              getLaneX(false, dir),
              receptorY,
              noteSize,
              dir,
              LANE_COLORS[dir],
              true,
              opponentPoseRef.current.pose === DIRECTION_FROM_POSE[dir]
            );
            // Player receptor
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
                  playerPoseRef.current.pose === DIRECTION_FROM_POSE[dir])
            );
          }

          // Draw Visible Scrolling Notes & Sustain Trails
          const pxPerMs =
            0.46 * song.scrollSpeed * settings.scrollSpeedMultiplier;
          const scrollDir = settings.downscroll ? -1 : 1;

          for (const note of chartRef.current.notes) {
            if (note.missed) continue;
            const timeDiff = note.timeMs - curMs;
            if (timeDiff > 1900 || timeDiff + note.sustainMs < -200) continue;

            const nx = getLaneX(note.isPlayer, note.lane);
            const ny = receptorY + timeDiff * pxPerMs * scrollDir;
            const color = LANE_COLORS[note.lane];

            // Draw Sustain Hold Trail
            if (note.sustainMs > 0) {
              const tailEndMs = note.timeMs + note.sustainMs - curMs;
              const tailStartY = note.hit ? receptorY : ny;
              const tailEndY = receptorY + tailEndMs * pxPerMs * scrollDir;

              ctx.save();
              ctx.strokeStyle = color;
              ctx.globalAlpha = 0.65;
              ctx.lineWidth = 16;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(nx, tailStartY);
              ctx.lineTo(nx, tailEndY);
              ctx.stroke();
              ctx.restore();
            }

            // Draw Note Head if not yet hit
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
                note.special
              );
            }
          }

          // Draw SICK!! Hit Splashes on Player Receptors
          hitSplashesRef.current = hitSplashesRef.current.filter(
            (s) => curMs - s.timeMs < 180
          );
          for (const splash of hitSplashesRef.current) {
            const age = (curMs - splash.timeMs) / 180;
            const sx = getLaneX(true, splash.lane);
            ctx.save();
            ctx.beginPath();
            ctx.arc(sx, receptorY, noteSize * (0.55 + age * 0.65), 0, Math.PI * 2);
            ctx.strokeStyle = splash.color;
            ctx.globalAlpha = 1 - age;
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();
          }

          // E. Draw Judgement Popup ("SICK!!", "GOOD!", etc.) & Combo Counter
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

          // F. Pre-Song Countdown ("THREE, TWO, ONE, FUNK!") or Dramatic Mid-Song Screamer Banner
          if (curMs < 0) {
            const secLeft = Math.ceil(Math.abs(curMs) / 500);
            const label =
              secLeft >= 4
                ? 'READY?'
                : secLeft === 3
                  ? 'THREE'
                  : secLeft === 2
                    ? 'TWO'
                    : 'GO!!';
            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = 'italic 800 56px "Syne", sans-serif';
            ctx.fillStyle = song.accentColor;
            ctx.strokeStyle = '#09080D';
            ctx.lineWidth = 8;
            ctx.strokeText(label, w * 0.5, h * 0.48);
            ctx.fillText(label, w * 0.5, h * 0.48);
            ctx.restore();
          } else if (
            dramaticBannerRef.current &&
            curMs < dramaticBannerRef.current.untilMs
          ) {
            const banner = dramaticBannerRef.current;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = 'italic 800 46px "Syne", sans-serif';
            ctx.fillStyle = banner.isMajin ? '#60A5FA' : '#EF4444';
            ctx.strokeStyle = '#09080D';
            ctx.lineWidth = 8;
            ctx.strokeText(banner.text, w * 0.5, h * 0.34);
            ctx.fillText(banner.text, w * 0.5, h * 0.34);
            ctx.restore();
          }

          // G. Draw Classic FNF Health Bar & Icons
          const hbWidth = 480;
          const hbHeight = 16;
          const hbX = (w - hbWidth) / 2;
          const hbY = settings.downscroll ? 36 : h - 42;
          const hp = statsRef.current.health; // 0..100 (Player controls right side)
          const opponentRatio = (100 - hp) / 100;

          ctx.save();
          // Health bar border
          ctx.fillStyle = '#09080D';
          ctx.fillRect(hbX - 4, hbY - 4, hbWidth + 8, hbHeight + 8);

          // Opponent half (left)
          ctx.fillStyle = song.opponentHealthColor;
          ctx.fillRect(hbX, hbY, hbWidth * opponentRatio, hbHeight);

          // Player half (right)
          ctx.fillStyle = song.playerHealthColor;
          ctx.fillRect(
            hbX + hbWidth * opponentRatio,
            hbY,
            hbWidth * (hp / 100),
            hbHeight
          );

          // Center clash divider & Icons
          const clashX = hbX + hbWidth * opponentRatio;
          drawHealthIcon(
            ctx,
            clashX - 22,
            hbY + hbHeight / 2,
            false,
            opponentCharRef.current,
            hp > 80
          );
          drawHealthIcon(
            ctx,
            clashX + 22,
            hbY + hbHeight / 2,
            true,
            playerCharRef.current,
            hp < 25
          );
          ctx.restore();

          // H. Static / Red Flash Overlays (Sonic.exe & Triple Trouble static notes)
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
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, onGameOver, onSongComplete, settings, song]);

  const accuracy =
    hudStats.totalNotesEncountered > 0
      ? ((hudStats.sicks +
          hudStats.goods * 0.85 +
          hudStats.bads * 0.5 +
          hudStats.shits * 0.2) /
          hudStats.totalNotesEncountered) *
        100
      : 100;

  return (
    <div className="relative w-full max-w-[1280px] mx-auto rounded-xl overflow-hidden border border-white/15 bg-[#09080D] shadow-2xl select-none">
      {/* Unobtrusive Top Psych Engine Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-[#12101B] border-b border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white tracking-wide">{song.title}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300">{activePhaseLabel}</span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-slate-400 tabular-nums">
            {song.bpm} BPM
          </span>
        </div>

        {/* Song Time Progress Bar */}
        <div className="hidden md:flex items-center gap-2.5 flex-1 max-w-xs mx-4">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-150"
              style={{
                width: `${progressPct}%`,
                backgroundColor: song.accentColor,
              }}
            />
          </div>
          <span className="font-mono text-[11px] text-slate-300 tabular-nums w-9 text-right">
            {Math.round(progressPct)}%
          </span>
        </div>

        {/* Live Psych Engine Score / Misses / Accuracy / Rings */}
        <div className="flex items-center gap-4 font-mono tabular-nums">
          <span>
            Score: <strong className="text-white">{hudStats.score.toLocaleString()}</strong>
          </span>
          <span>·</span>
          <span>
            Misses:{' '}
            <strong
              className={
                hudStats.misses === 0 ? 'text-emerald-400' : 'text-red-400'
              }
            >
              {hudStats.misses}
            </strong>
          </span>
          <span>·</span>
          <span>
            Accuracy: <strong className="text-cyan-300">{accuracy.toFixed(1)}%</strong>
          </span>
          {(song.id.includes('encore') || song.id === 'triple-trouble') && (
            <>
              <span>·</span>
              <span className="text-amber-300 font-bold">
                Rings: {hudStats.rings}
              </span>
            </>
          )}
          <span>·</span>
          <span
            className={
              hudStats.health < 25
                ? 'text-red-400 font-bold'
                : 'text-emerald-400'
            }
          >
            HP: {Math.round(hudStats.health)}%
          </span>
        </div>
      </div>

      {/* Main 16:9 Stage Canvas */}
      <div className="relative aspect-video w-full bg-[#09080D]">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full block"
        />

        {/* CRT Scanline Overlay if enabled */}
        {settings.crtFilter && (
          <div className="pointer-events-none absolute inset-0 crt-scanlines crt-vignette" />
        )}

        {/* Active Keybind Strip & Touch/Click Lane Triggers */}
        <div className="absolute bottom-3 right-6 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
          {([0, 1, 2, 3] as Direction[]).map((lane) => {
            const keyCode =
              lane === 0
                ? keybinds.left
                : lane === 1
                  ? keybinds.down
                  : lane === 2
                    ? keybinds.up
                    : keybinds.right;
            return (
              <button
                key={lane}
                onMouseDown={() => triggerPlayerLane(lane)}
                onMouseUp={() => {
                  pressedLanesRef.current[lane] = false;
                }}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 font-mono text-[11px] font-bold text-white transition-colors whitespace-nowrap"
                style={{ borderColor: LANE_COLORS[lane] }}
              >
                {formatKeyCode(keyCode)}
              </button>
            );
          })}
          {settings.botplay && (
            <span className="ml-2 text-[11px] font-mono font-bold text-amber-400">
              [BOTPLAY ACTIVE]
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
