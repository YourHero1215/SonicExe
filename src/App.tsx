import React, { useEffect, useRef, useState } from 'react';
import {
  Disc,
  Keyboard,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  Trash2,
  Trophy,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  GameState,
  GameplaySettings,
  getVideoQualityResolution,
  HighScoreRecord,
  KeybindConfig,
  PlayStats,
  SongId,
  SongMetadata,
} from './types/game';
import { SONGS } from './data/songs';
import { TOO_SLOW_NORMAL_CREDITS } from './data/tooSlowNormalData';
import { TOO_SLOW_ENCORE_CREDITS } from './data/tooSlowEncoreData';
import { YCR_NORMAL_CREDITS } from './data/ycrNormalData';
import { YCR_ENCORE_CREDITS } from './data/ycrEncoreData';
import {
  DEFAULT_KEYBINDS,
  formatKeyCode,
  KeybindsModal,
} from './components/KeybindsModal';
import { MobileControlsModal } from './components/MobileControlsModal';
import { FnfStageCanvas } from './components/FnfStageCanvas';
import {
  calculateAccuracy,
  calculateGrade,
  drawOpponentSprite,
  drawPlayerSprite,
  drawSpeakerGirlfriend,
  formatPsychRating,
  preloadSpritesForSong,
} from './canvas/spriteRenderer';
import {
  drawEndlessMajinStage,
  drawPolishedStageBackLayers,
  drawPolishedStageForegroundLayer,
  drawTripleTroubleStage,
  drawYcrCrimsonStage,
} from './canvas/polishedStageRenderer';
import { LoadedOggStem, soundEngine } from './audio/soundEngine';

type SongFilter = 'all' | 'main' | 'encore' | 'soundtest';

const STORAGE_KEY_BINDS = 'fnf_sonic_exe_keybinds_v4';
const STORAGE_KEY_SETTINGS = 'fnf_sonic_exe_settings_v4';
const STORAGE_KEY_SCORES = 'fnf_sonic_exe_highscores_v4';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [selectedSongId, setSelectedSongId] = useState<SongId>('too-slow');
  const [songFilter, setSongFilter] = useState<SongFilter>('all');
  const [isKeybindsOpen, setIsKeybindsOpen] = useState<boolean>(false);
  const [isMobileCustomizerOpen, setIsMobileCustomizerOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [runKey, setRunKey] = useState<number>(1);
  const [lastRunStats, setLastRunStats] = useState<PlayStats | null>(null);
  const [loadedStems, setLoadedStems] = useState<LoadedOggStem[]>([]);
  const [isUploadingOgg, setIsUploadingOgg] = useState<boolean>(false);
  const oggInputRef = useRef<HTMLInputElement | null>(null);

  const handleOggUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingOgg(true);
    try {
      const updated = await soundEngine.loadOggFilesForSong(
        files,
        selectedSongId
      );
      setLoadedStems([...updated]);
      soundEngine.playRingCollect();
      if (gameState === 'PLAYING' || gameState === 'PAUSED') {
        setRunKey((k) => k + 1);
        setGameState('PLAYING');
      }
    } finally {
      setIsUploadingOgg(false);
      e.target.value = '';
    }
  };

  const handleClearSongOgg = async (songId: SongId) => {
    await soundEngine.clearEndlessOggStems(songId);
    setLoadedStems([...soundEngine.getAllLoadedStems()]);
    soundEngine.playMenuTick(false);
  };

  const toggleFullscreen = () => {
    const next = !isFullscreen;
    setIsFullscreen(next);
    try {
      if (next && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (!next && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Fallback to viewport fullscreen if iframe restricts native fullscreen
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      if (document.fullscreenElement) {
        setIsFullscreen(true);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    soundEngine
      .restoreSavedEndlessStems()
      .then((stems) => setLoadedStems([...stems]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    preloadSpritesForSong(selectedSongId);
    soundEngine
      .preloadSongStems(selectedSongId)
      .then(() => setLoadedStems([...soundEngine.getAllLoadedStems()]))
      .catch(() => {});
  }, [selectedSongId]);

  const [keybinds, setKeybinds] = useState<KeybindConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BINDS);
      if (saved) return { ...DEFAULT_KEYBINDS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_KEYBINDS;
  });

  const [settings, setSettings] = useState<GameplaySettings>(() => {
    const isTouchDevice =
      typeof window !== 'undefined' &&
      (('ontouchstart' in window) || navigator.maxTouchPoints > 0 || window.innerWidth <= 768);

    const defaults: GameplaySettings = {
      downscroll: isTouchDevice,
      scrollSpeedMultiplier: 1.0,
      noteDensityMultiplier: 1.0,
      disableJumpscares: false,
      isMobileMode: isTouchDevice,
      deviceChosen: false,
      ghostTapping: true,
      practiceMode: false,
      easyMode: false,
      botplay: false,
      crtFilter: false,
      antiLagMode: false,
      pixelRatioX: 3,
      pixelRatioY: 2,
      pixelRatioLock: 1.5,
      hitSoundVolume: 0.7,
      musicVolume: 0.75,
      modVersion: 'v3.0',
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return defaults;
  });

  const [highScores, setHighScores] = useState<Record<string, HighScoreRecord>>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SCORES);
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
      return {};
    }
  );
  const [confirmResetAll, setConfirmResetAll] = useState<boolean>(false);
  const [pendingDeleteSongId, setPendingDeleteSongId] =
    useState<SongId | null>(null);

  const handleEraseSongRecord = (songId: SongId) => {
    soundEngine.playMenuTick(true);
    setHighScores((prev) => {
      const updated = { ...prev };
      delete updated[songId];
      try {
        localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setPendingDeleteSongId(null);
  };

  const handleResetAllRecords = () => {
    soundEngine.playMenuTick(true);
    setHighScores({});
    setConfirmResetAll(false);
    try {
      localStorage.removeItem(STORAGE_KEY_SCORES);
    } catch {
      // ignore
    }
  };

  // Persist keybinds and settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BINDS, JSON.stringify(keybinds));
    } catch {
      // ignore
    }
  }, [keybinds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const selectedSong: SongMetadata =
    SONGS.find((s) => s.id === selectedSongId) || SONGS[0];

  const filteredSongs = SONGS.filter((song) => {
    if (songFilter === 'main') {
      return (
        song.id === 'too-slow' ||
        song.id === 'you-cant-run' ||
        song.id === 'triple-trouble'
      );
    }
    if (songFilter === 'encore') {
      return (
        song.id === 'too-slow-encore' || song.id === 'you-cant-run-encore'
      );
    }
    if (songFilter === 'soundtest') {
      return song.id === 'endless' || song.id === 'endless-og';
    }
    return true;
  });

  // Animated Character Showcase Preview Canvas on Title Menu (throttled to 30FPS at 1:1 520x230 resolution for Chromebook efficiency)
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (gameState !== 'TITLE_MENU') return;
    let rafId: number;
    const start = performance.now();
    let lastDraw = 0;

    const animatePreview = (now: number) => {
      const minInterval = settings.antiLagMode ? 64 : 32;
      if (now - lastDraw < minInterval) {
        rafId = requestAnimationFrame(animatePreview);
        return;
      }
      lastDraw = now;
      const elapsed = now - start;
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const isLowQuality = canvas.width < 520;
          ctx.imageSmoothingEnabled = !settings.antiLagMode && !isLowQuality;
          if (!settings.antiLagMode && !isLowQuality) {
            ctx.imageSmoothingQuality = 'medium';
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const logicalW = 520;
          const logicalH = 230;
          ctx.save();
          ctx.scale(canvas.width / logicalW, canvas.height / logicalH);

          // Zoom in to the central point of all stages matching the video framing (GF's boombox at 260, 145)
          ctx.translate(260, 145);
          ctx.scale(1.24, 1.24);
          ctx.translate(-260, -145);

          const gentlePan = settings.antiLagMode
            ? 0
            : Math.sin(elapsed * 0.0012) * 18;
          // Draw High-Definition multi-layer stage maps in Freeplay preview
          if (selectedSong.stageTheme === 'cursed-green-hill') {
            drawPolishedStageBackLayers(
              ctx,
              logicalW,
              logicalH,
              selectedSong.id,
              gentlePan
            );
          } else if (selectedSong.stageTheme === 'ycr-crimson') {
            drawYcrCrimsonStage(
              ctx,
              logicalW,
              logicalH,
              settings.antiLagMode ? -1 : elapsed,
              gentlePan
            );
          } else if (selectedSong.stageTheme === 'endless-majin') {
            drawEndlessMajinStage(ctx, logicalW, logicalH, gentlePan);
          } else {
            drawTripleTroubleStage(ctx, logicalW, logicalH, gentlePan);
          }

          // Keep Sonic.exe in the idle position when not hitting notes
          const poseCycle = Math.floor(elapsed / 650) % 6;
          const poses = ['idle', 'left', 'down', 'up', 'right', 'idle'] as const;
          const activePose =
            selectedSong.initialOpponent === 'sonic-exe'
              ? 'idle'
              : poses[poseCycle];

          if (
            selectedSong.id !== 'endless' &&
            selectedSong.id !== 'endless-og'
          ) {
            ctx.save();
            ctx.translate(260, 148);
            ctx.scale(0.68, 0.68);
            drawSpeakerGirlfriend(
              ctx,
              0,
              0,
              selectedSong.bpm,
              elapsed,
              selectedSong.stageTheme,
              selectedSong.id.includes('encore')
            );
            ctx.restore();
          }

          drawOpponentSprite(
            ctx,
            155,
            165,
            selectedSong.initialOpponent,
            activePose,
            elapsed,
            selectedSong.bpm
          );
          drawPlayerSprite(
            ctx,
            365,
            170,
            selectedSong.initialPlayer,
            activePose,
            elapsed,
            selectedSong.bpm,
            selectedSong.stageTheme
          );

          if (selectedSong.stageTheme === 'cursed-green-hill') {
            drawPolishedStageForegroundLayer(
              ctx,
              logicalW,
              logicalH,
              gentlePan
            );
          }
          ctx.restore();
        }
      }
      rafId = requestAnimationFrame(animatePreview);
    };

    rafId = requestAnimationFrame(animatePreview);
    return () => cancelAnimationFrame(rafId);
  }, [gameState, selectedSong, settings.antiLagMode]);

  const startSong = (songId: SongId = selectedSongId) => {
    soundEngine.playMenuTick(true);
    soundEngine.preloadSongStems(songId).catch(() => {});
    setSelectedSongId(songId);
    setRunKey((prev) => prev + 1);
    setLastRunStats(null);
    setGameState('PLAYING');
  };

  const handleSongComplete = (finalStats: PlayStats) => {
    setLastRunStats(finalStats);
    const totalJudged =
      finalStats.sicks +
      finalStats.goods +
      finalStats.bads +
      finalStats.shits +
      finalStats.misses;
    const acc = totalJudged > 0 ? calculateAccuracy(finalStats) : 100;
    const grade = calculateGrade(acc, finalStats.misses);

    // Do NOT log a record in the menu screen if Botplay, Practice Mode, or Easy Mode was used at all during the song
    const usedAssist =
      Boolean(finalStats.usedBotplay) ||
      Boolean(finalStats.usedPracticeMode) ||
      Boolean(finalStats.usedEasyMode) ||
      settings.botplay ||
      settings.practiceMode ||
      settings.easyMode;

    if (!usedAssist) {
      setHighScores((prev) => {
        const existing = prev[selectedSong.id];
        if (!existing || finalStats.score > existing.score) {
          const updated = {
            ...prev,
            [selectedSong.id]: {
              score: finalStats.score,
              accuracy: Number(acc.toFixed(2)),
              misses: finalStats.misses,
              maxCombo: finalStats.maxCombo,
              grade,
              clearedAt: new Date().toLocaleDateString(),
            },
          };
          try {
            localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(updated));
          } catch {
            // ignore
          }
          return updated;
        }
        return prev;
      });
    }

    setGameState('ROUND_SUMMARY');
  };

  const handleGameOver = (finalStats: PlayStats) => {
    soundEngine.playStaticBurst();
    setLastRunStats(finalStats);
    setGameState('GAME_OVER');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09080D] text-[#F4F4F6]">
      {/* Hidden File Input for Manual Music / Voice .OGG Adder */}
      <input
        ref={oggInputRef}
        type="file"
        accept=".ogg,audio/ogg,audio/*"
        multiple
        className="hidden"
        onChange={handleOggUpload}
      />

      {/* Top Bar Contract: Single-Row, 3 Zones */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0D0B14]">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setGameState('TITLE_MENU');
          }}
          className="text-xl font-extrabold tracking-tight text-white font-display whitespace-nowrap"
        >
          sonicexe
        </a>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              setSongFilter('all');
              setGameState('TITLE_MENU');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              songFilter === 'all' && gameState === 'TITLE_MENU'
                ? 'text-white underline underline-offset-8 decoration-red-500 decoration-2'
                : ''
            }`}
          >
            All Tracks (7)
          </button>
          <button
            onClick={() => {
              setSongFilter('main');
              setSelectedSongId('too-slow');
              setGameState('TITLE_MENU');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              songFilter === 'main' && gameState === 'TITLE_MENU'
                ? 'text-white underline underline-offset-8 decoration-red-500 decoration-2'
                : ''
            }`}
          >
            Main Week
          </button>
          <button
            onClick={() => {
              setSongFilter('encore');
              setSelectedSongId('too-slow-encore');
              setGameState('TITLE_MENU');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              songFilter === 'encore' && gameState === 'TITLE_MENU'
                ? 'text-white underline underline-offset-8 decoration-red-500 decoration-2'
                : ''
            }`}
          >
            Encore Mixes
          </button>
          <button
            onClick={() => {
              setSongFilter('soundtest');
              setSelectedSongId('endless');
              setGameState('TITLE_MENU');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              songFilter === 'soundtest' && gameState === 'TITLE_MENU'
                ? 'text-white underline underline-offset-8 decoration-blue-500 decoration-2'
                : ''
            }`}
          >
            Sound Test
          </button>
          <button
            onClick={() => {
              soundEngine.playMenuTick(true);
              setSettings((s) => ({
                ...s,
                modVersion:
                  s.modVersion === 'v3.0' ? 'v4.00000000' : 'v3.0',
              }));
            }}
            className="hover:text-red-400 transition-colors font-mono text-xs text-slate-400 whitespace-nowrap"
          >
            Build: {settings.modVersion}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {settings.isMobileMode && (
            <button
              onClick={() => setIsMobileCustomizerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg transition-colors whitespace-nowrap"
              title="Customize horizontal placement of notes on screen"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Note Placement ↔
            </button>
          )}
          <button
            onClick={() => setIsKeybindsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors whitespace-nowrap"
          >
            <Keyboard className="w-4 h-4 text-red-500" />
            Keybinds ({formatKeyCode(keybinds.left)}/{formatKeyCode(keybinds.down)}/
            {formatKeyCode(keybinds.up)}/{formatKeyCode(keybinds.right)})
          </button>
          <button
            onClick={() =>
              gameState === 'PLAYING'
                ? setGameState('PAUSED')
                : startSong(selectedSong.id)
            }
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors whitespace-nowrap"
          >
            {gameState === 'PLAYING' ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause Song
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Launch Track
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {gameState === 'TITLE_MENU' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (7 cols): Freeplay & Sound Test Tracklist */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs text-red-400 font-mono tracking-wide">
                    SEGA GENESIS ROM VAULT · {settings.modVersion} EDITION
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                    Select Cartridge Track
                  </h1>
                </div>

                {/* Interactive Filter Tabs & Reset All Data Control */}
                <div className="flex flex-wrap items-center gap-2">
                  {Object.keys(highScores).length > 0 && (
                    <div className="flex items-center gap-1">
                      {confirmResetAll ? (
                        <>
                          <button
                            onClick={handleResetAllRecords}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Confirm Reset All
                          </button>
                          <button
                            onClick={() => setConfirmResetAll(false)}
                            className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium transition-colors whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmResetAll(true)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-xs font-mono text-slate-300 hover:text-red-300 transition-colors whitespace-nowrap"
                          title="Erase all saved song records"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Reset All Data
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 p-1 bg-[#13111C] rounded-lg border border-white/10">
                    {(
                      [
                        { id: 'all', label: 'All (7)' },
                        { id: 'main', label: 'Main Week' },
                        { id: 'encore', label: 'Encore' },
                        { id: 'soundtest', label: 'Endless' },
                      ] as { id: SongFilter; label: string }[]
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          soundEngine.playMenuTick(false);
                          setSongFilter(tab.id);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                          songFilter === tab.id
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Song List Cards */}
              <div className="space-y-3">
                {filteredSongs.map((song, idx) => {
                  const isSelected = song.id === selectedSong.id;
                  const record = highScores[song.id];
                  return (
                    <div
                      key={song.id}
                      onClick={() => {
                        soundEngine.playMenuTick(false);
                        setSelectedSongId(song.id);
                      }}
                      onDoubleClick={() => startSong(song.id)}
                      className={`group cursor-pointer rounded-xl p-4 transition-all border ${
                        isSelected
                          ? 'bg-[#171424] border-red-500/70 shadow-lg'
                          : 'bg-[#110F19] border-white/8 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-slate-500 tabular-nums">
                              0{idx + 1}.
                            </span>
                            <h2 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                              {song.title}
                            </h2>
                          </div>

                          {/* Zero-Pill Unboxed Metadata with typographic separators */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pl-7">
                            <span
                              className="font-semibold"
                              style={{ color: song.accentColor }}
                            >
                              {song.difficultyLabel}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{song.modVersionOrigin}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {song.bpm} BPM
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{song.composer}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-7 sm:pl-0">
                          {record ? (
                            <div className="flex items-center gap-2.5">
                              <div className="text-right font-mono text-xs tabular-nums">
                                <div className="text-emerald-400 font-bold">
                                  {record.accuracy}% ({calculateGrade(record.accuracy)})
                                </div>
                                <div className="text-slate-400">
                                  {record.score.toLocaleString()} pts
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  soundEngine.playMenuTick(false);
                                  setPendingDeleteSongId(song.id);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-slate-400 hover:text-red-300 transition-colors"
                                title={`Erase saved record for ${song.title}`}
                                aria-label={`Erase saved record for ${song.title}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">
                              UNPLAYED
                            </span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startSong(song.id);
                            }}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-transform active:scale-95 whitespace-nowrap"
                            style={{ backgroundColor: song.accentColor }}
                          >
                            Play Track
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column (5 cols): Stage Preview, Animated Sprites & Controls Inspector */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-xl overflow-hidden bg-[#12101B] border border-white/10">
                {/* Stage Artwork Preview with Animated Character Sprites Overlay */}
                <div className="relative h-64 w-full overflow-hidden bg-[#09080D]">
                  <img
                    src={selectedSong.stageImage}
                    alt={selectedSong.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12101B] via-black/30 to-transparent" />

                  {/* Live Animated Opponent vs Boyfriend Sprite Preview */}
                  {(() => {
                    const vq = getVideoQualityResolution(
                      settings.pixelRatioX,
                      settings.pixelRatioY
                    );
                    const previewScale = Math.max(
                      0.25,
                      Math.min(1.25, vq.scale)
                    );
                    const pw = Math.round(520 * previewScale);
                    const ph = Math.round(230 * previewScale);
                    return (
                      <canvas
                        ref={previewCanvasRef}
                        width={pw}
                        height={ph}
                        style={{
                          imageRendering:
                            vq.width < 1280 || settings.antiLagMode
                              ? 'pixelated'
                              : 'auto',
                        }}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />
                    );
                  })()}

                  <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-200">
                    <span>STAGE: {selectedSong.subtitle.toUpperCase()}</span>
                    <span>
                      {Math.floor(selectedSong.durationSec / 60)}:
                      {String(selectedSong.durationSec % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Song Details & Mechanics */}
                <div className="p-6 space-y-5">
                  <div>
                    <div className="text-xs text-slate-400">
                      {selectedSong.subtitle} · {selectedSong.modVersionOrigin}
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mt-0.5">
                      {selectedSong.title}
                    </h2>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {selectedSong.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Stage Mechanics:</span>
                      <span className="font-medium text-right">
                        {selectedSong.mechanicsSummary}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Chart Speed:</span>
                      <span className="font-mono tabular-nums">
                        {(
                          selectedSong.scrollSpeed *
                          settings.scrollSpeedMultiplier
                        ).toFixed(2)}{' '}
                        ({settings.downscroll ? 'Downscroll' : 'Upscroll'})
                      </span>
                    </div>
                  </div>

                  {/* Official V-Slice Credits for Too Slow, Too Slow Encore, You Can't Run & You Can't Run Encore */}
                  {(selectedSong.id === 'too-slow' ||
                    selectedSong.id === 'too-slow-encore' ||
                    selectedSong.id === 'you-cant-run' ||
                    selectedSong.id === 'you-cant-run-encore') && (
                    <div className="p-3 rounded-lg bg-[#09080D] border border-white/10 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                        <span>
                          OFFICIAL CREDITS (
                          {selectedSong.id.includes('encore')
                            ? 'credits-erect.json'
                            : 'credits.json'}
                          )
                        </span>
                        <span>
                          {selectedSong.id === 'too-slow-encore'
                            ? 'sonicexefake → sonic-exe'
                            : selectedSong.id.includes('you-cant-run')
                              ? 'ycr-exe ↔ pixel-exe'
                              : 'sonic-exe'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                        {(selectedSong.id === 'too-slow-encore'
                          ? TOO_SLOW_ENCORE_CREDITS.sections
                          : selectedSong.id === 'too-slow'
                            ? TOO_SLOW_NORMAL_CREDITS.sections
                            : selectedSong.id === 'you-cant-run-encore'
                              ? YCR_ENCORE_CREDITS.sections
                              : YCR_NORMAL_CREDITS.sections
                        ).map((sec) => (
                          <div key={sec.title} className="truncate">
                            <span className="text-red-400 font-bold">
                              {sec.title}:
                            </span>{' '}
                            <span className="text-slate-300">
                              {sec.names.join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Built-In & Custom .OGG Audio Stems Panel */}
                  {(() => {
                    const activeSongStems =
                      soundEngine.getConfiguredStemsForSong(selectedSong.id);
                    const customSongStems = soundEngine.getCustomStemsForSong(
                      selectedSong.id
                    );
                    return (
                      <div className="p-3.5 rounded-lg bg-[#09080D] border border-red-500/30 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Disc className="w-3.5 h-3.5 text-red-400 animate-spin" />
                              <span className="text-xs font-bold text-white">
                                Built-In &amp; Custom .OGG Audio Stems
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              All official <code className="text-slate-200">Inst</code> &amp;{' '}
                              <code className="text-slate-200">Voices</code> .ogg files are
                              automatically added and synced
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {customSongStems.length > 0 && (
                              <button
                                onClick={() =>
                                  handleClearSongOgg(selectedSong.id)
                                }
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-[11px] font-mono text-slate-300 hover:text-red-300 transition-colors whitespace-nowrap"
                                title="Clear custom uploaded .ogg stems for this song"
                              >
                                <Trash2 className="w-3 h-3" />
                                Reset
                              </button>
                            )}
                            <button
                              onClick={() => oggInputRef.current?.click()}
                              disabled={isUploadingOgg}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              {isUploadingOgg
                                ? 'Loading...'
                                : '+ Add .OGG Files'}
                            </button>
                          </div>
                        </div>

                        {activeSongStems.length > 0 ? (
                          <div className="space-y-1 pt-1 border-t border-white/10">
                            {activeSongStems.map((stem) => {
                              const mins = Math.floor(stem.durationSec / 60);
                              const secs = String(
                                Math.floor(stem.durationSec % 60)
                              ).padStart(2, '0');
                              const roleLabel =
                                stem.role === 'inst'
                                  ? 'INST'
                                  : stem.role === 'voices-bf'
                                    ? 'BF VOICE'
                                    : stem.role === 'voices-opp'
                                      ? 'EXE VOICE'
                                      : stem.role === 'voices-combined'
                                        ? 'VOICES'
                                        : 'STEM';
                              return (
                                <div
                                  key={stem.id}
                                  className="flex items-center justify-between text-[11px] font-mono bg-white/5 px-2.5 py-1 rounded border border-white/5"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        stem.role === 'inst'
                                          ? 'bg-amber-500/20 text-amber-300'
                                          : 'bg-cyan-500/20 text-cyan-300'
                                      }`}
                                    >
                                      {roleLabel}
                                    </span>
                                    <span className="text-slate-200 truncate">
                                      {stem.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0 text-slate-400">
                                    <span>
                                      {stem.isBuiltIn ? 'BUILT-IN' : 'CUSTOM'}
                                    </span>
                                    <span>·</span>
                                    <span>
                                      {mins}:{secs}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-white/10">
                            No .ogg stems loaded yet — click &quot;+ Add .OGG
                            Files&quot; to link Inst.ogg &amp; Voices.ogg
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Quick Keybinds & Modifiers Bar */}
                  <div className="p-3.5 rounded-lg bg-[#09080D] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        Active Note Keybinds & Gameplay Settings
                      </span>
                      <button
                        onClick={() => setIsKeybindsOpen(true)}
                        className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                      >
                        Customize Keybinds & Settings →
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                      <div className="py-1.5 rounded bg-white/5 border border-[#C24B99]/50 text-white font-bold">
                        ← {formatKeyCode(keybinds.left)}
                      </div>
                      <div className="py-1.5 rounded bg-white/5 border border-[#00FFFF]/50 text-white font-bold">
                        ↓ {formatKeyCode(keybinds.down)}
                      </div>
                      <div className="py-1.5 rounded bg-white/5 border border-[#12FA05]/50 text-white font-bold">
                        ↑ {formatKeyCode(keybinds.up)}
                      </div>
                      <div className="py-1.5 rounded bg-white/5 border border-[#F9393F]/50 text-white font-bold">
                        → {formatKeyCode(keybinds.right)}
                      </div>
                    </div>

                    {/* Practice Mode Toggle in Gameplay Settings */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div>
                        <div className="text-xs font-bold text-white">
                          Practice Mode
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Removes misses & prevents game overs to learn difficult sections
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            practiceMode: !s.practiceMode,
                          }))
                        }
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors whitespace-nowrap ${
                          settings.practiceMode
                            ? 'bg-cyan-500 text-black border-cyan-400'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                        }`}
                      >
                        {settings.practiceMode ? 'PRACTICE: ON' : 'PRACTICE: OFF'}
                      </button>
                    </div>

                    {/* Anti-Lag Mode Toggle for Lower-End Devices */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div>
                        <div className="text-xs font-bold text-emerald-400">
                          Anti-Lag Mode (Lower-End Devices)
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Skips camera zoom resampling, text outlines & particles for locked 60 FPS
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            antiLagMode: !s.antiLagMode,
                          }))
                        }
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors whitespace-nowrap ${
                          settings.antiLagMode
                            ? 'bg-emerald-500 text-black border-emerald-400'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                        }`}
                      >
                        {settings.antiLagMode ? 'ANTI-LAG: ON' : 'ANTI-LAG: OFF'}
                      </button>
                    </div>

                    {/* Auto-Linked Pixel Ratio / Video Quality Control */}
                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white">
                            Video Quality / Pixel Ratio (Auto-Matching)
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Change either number to auto-match the ratio and adjust video quality
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-cyan-300 whitespace-nowrap">
                          {
                            getVideoQualityResolution(
                              settings.pixelRatioX,
                              settings.pixelRatioY
                            ).label
                          }
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="any"
                            min={0.1}
                            value={settings.pixelRatioX}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!Number.isFinite(val) || val <= 0) return;
                              const lock = settings.pixelRatioLock || 1.5;
                              const nextY = Math.round((val / lock) * 100) / 100;
                              setSettings((s) => ({
                                ...s,
                                pixelRatioX: val,
                                pixelRatioY: nextY,
                              }));
                            }}
                            aria-label="Pixel Ratio First Number"
                            className="w-20 px-2 py-1 rounded bg-white/5 border border-white/15 text-white font-mono text-xs text-center focus:outline-none focus:border-red-500"
                          />
                          <span className="font-mono font-bold text-slate-400">
                            :
                          </span>
                          <input
                            type="number"
                            step="any"
                            min={0.1}
                            value={settings.pixelRatioY}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!Number.isFinite(val) || val <= 0) return;
                              const lock = settings.pixelRatioLock || 1.5;
                              const nextX = Math.round(val * lock * 100) / 100;
                              setSettings((s) => ({
                                ...s,
                                pixelRatioX: nextX,
                                pixelRatioY: val,
                              }));
                            }}
                            aria-label="Pixel Ratio Second Number"
                            className="w-20 px-2 py-1 rounded bg-white/5 border border-white/15 text-white font-mono text-xs text-center focus:outline-none focus:border-red-500"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-1">
                          {[
                            { label: '0.75:0.5 (180p)', x: 0.75, y: 0.5, lock: 1.5 },
                            { label: '1.5:1 (360p)', x: 1.5, y: 1, lock: 1.5 },
                            { label: '2.25:1.5 (540p)', x: 2.25, y: 1.5, lock: 1.5 },
                            { label: '3:2 (720p)', x: 3, y: 2, lock: 1.5 },
                            { label: '4.5:3 (1080p)', x: 4.5, y: 3, lock: 1.5 },
                          ].map((p) => {
                            const active =
                              settings.pixelRatioX === p.x &&
                              settings.pixelRatioY === p.y;
                            return (
                              <button
                                key={p.label}
                                onClick={() =>
                                  setSettings((s) => ({
                                    ...s,
                                    pixelRatioX: p.x,
                                    pixelRatioY: p.y,
                                    pixelRatioLock: p.lock,
                                  }))
                                }
                                className={`px-2 py-1 rounded text-[11px] font-mono font-semibold border transition-colors ${
                                  active
                                    ? 'bg-red-600 text-white border-red-500'
                                    : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                                }`}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Launch CTA + Botplay Showcase Toggle */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => startSong(selectedSong.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-bold text-white shadow-lg transition-transform active:scale-98 whitespace-nowrap"
                      style={{ backgroundColor: selectedSong.accentColor }}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start {selectedSong.title}
                    </button>

                    <button
                      onClick={() =>
                        setSettings((s) => ({ ...s, botplay: !s.botplay }))
                      }
                      className={`px-4 py-3 rounded-lg text-xs font-mono font-bold border transition-colors whitespace-nowrap ${
                        settings.botplay
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                      }`}
                      title="Let CPU auto-hit 100% SICK!! to watch stage transitions"
                    >
                      {settings.botplay ? 'BOTPLAY: ON' : 'BOTPLAY: OFF'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Gameplay / Paused State */}
        {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
          <div className="space-y-4">
            {/* Quick Stage Action Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1440px] mx-auto px-1">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <button
                  onClick={() => setGameState('TITLE_MENU')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-medium transition-colors whitespace-nowrap"
                >
                  ← Back to Freeplay
                </button>
                <button
                  onClick={() => setRunKey((k) => k + 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-medium transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restart ({formatKeyCode(keybinds.reset)})
                </button>
                <button
                  onClick={() => oggInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-200 border border-red-500/40 font-semibold transition-colors whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5 text-red-400" />
                  + Add Music / Voice .OGG ({loadedStems.filter((s) => s.targetSongId === selectedSong.id && !s.isBuiltIn).length || soundEngine.getConfiguredStemsForSong(selectedSong.id).length})
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-xs font-semibold text-red-200 transition-colors whitespace-nowrap"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-red-400" />
                      Exit Fullscreen
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-red-400" />
                      Fullscreen (1920x1080)
                    </>
                  )}
                </button>

                {settings.isMobileMode && (
                  <button
                    onClick={() => setIsMobileCustomizerOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/50 text-xs font-mono font-bold text-cyan-300 transition-colors whitespace-nowrap"
                    title="Change horizontal placement of notes on mobile"
                  >
                    📱 Note Placement ↔
                  </button>
                )}

                <button
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      downscroll: !s.downscroll,
                    }))
                  }
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 transition-colors whitespace-nowrap"
                >
                  {settings.downscroll ? 'Downscroll' : 'Upscroll'}
                </button>

                <button
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      practiceMode: !s.practiceMode,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors whitespace-nowrap ${
                    settings.practiceMode
                      ? 'bg-cyan-500 text-black border-cyan-400'
                      : 'bg-white/5 text-slate-300 border-white/10'
                  }`}
                >
                  {settings.practiceMode ? 'Practice: ON' : 'Practice: OFF'}
                </button>

                <button
                  onClick={() =>
                    setSettings((s) => ({ ...s, botplay: !s.botplay }))
                  }
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors whitespace-nowrap ${
                    settings.botplay
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'bg-white/5 text-slate-300 border-white/10'
                  }`}
                >
                  {settings.botplay ? 'Botplay: ON' : 'Botplay: OFF'}
                </button>

                <button
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      antiLagMode: !s.antiLagMode,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors whitespace-nowrap ${
                    settings.antiLagMode
                      ? 'bg-emerald-500 text-black border-emerald-400'
                      : 'bg-white/5 text-slate-300 border-white/10'
                  }`}
                  title="Anti-Lag Mode for lower-end devices"
                >
                  {settings.antiLagMode ? 'Anti-Lag: ON' : 'Anti-Lag: OFF'}
                </button>

                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-200"
                  title="Auto-linked Video Quality / Pixel Ratio (changing one number updates the other and changes canvas video quality)"
                >
                  <span className="text-[10px] text-cyan-300 font-bold">
                    QUALITY
                  </span>
                  <input
                    type="number"
                    step="any"
                    min={0.1}
                    value={settings.pixelRatioX}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!Number.isFinite(val) || val <= 0) return;
                      const lock = settings.pixelRatioLock || 1.5;
                      const nextY = Math.round((val / lock) * 100) / 100;
                      setSettings((s) => ({
                        ...s,
                        pixelRatioX: val,
                        pixelRatioY: nextY,
                      }));
                    }}
                    className="w-12 bg-black/50 border border-white/15 rounded px-1 py-0.5 text-center text-white text-xs"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    step="any"
                    min={0.1}
                    value={settings.pixelRatioY}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!Number.isFinite(val) || val <= 0) return;
                      const lock = settings.pixelRatioLock || 1.5;
                      const nextX = Math.round(val * lock * 100) / 100;
                      setSettings((s) => ({
                        ...s,
                        pixelRatioX: nextX,
                        pixelRatioY: val,
                      }));
                    }}
                    className="w-12 bg-black/50 border border-white/15 rounded px-1 py-0.5 text-center text-white text-xs"
                  />
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    (
                    {
                      getVideoQualityResolution(
                        settings.pixelRatioX,
                        settings.pixelRatioY
                      ).height
                    }
                    p)
                  </span>
                </div>

                <button
                  onClick={() => {
                    const nextVol = settings.musicVolume > 0 ? 0 : 0.75;
                    soundEngine.setVolume(nextVol);
                    setSettings((s) => ({ ...s, musicVolume: nextVol }));
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
                  aria-label="Toggle Mute"
                >
                  {settings.musicVolume > 0 ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  )}
                </button>

                <button
                  onClick={() => setIsKeybindsOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors whitespace-nowrap"
                >
                  Change Keybinds
                </button>
              </div>
            </div>

            <div className="relative">
              <FnfStageCanvas
                key={`${selectedSong.id}-${runKey}`}
                song={selectedSong}
                keybinds={keybinds}
                settings={settings}
                isPaused={gameState === 'PAUSED' || isKeybindsOpen}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                onPauseToggle={() =>
                  setGameState((st) =>
                    st === 'PAUSED' ? 'PLAYING' : 'PAUSED'
                  )
                }
                onSongComplete={handleSongComplete}
                onGameOver={handleGameOver}
                onRestart={() => {
                  setGameState('PLAYING');
                  setRunKey((k) => k + 1);
                }}
              />

              {/* Pause Overlay Modal */}
              {gameState === 'PAUSED' && !isKeybindsOpen && (
                <div
                  className={
                    isFullscreen
                      ? 'fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
                      : 'absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl p-4'
                  }
                >
                  <div className="w-full max-w-md p-6 rounded-xl bg-[#12101B] border border-white/15 text-center space-y-5 shadow-2xl">
                    <div>
                      <p className="text-xs font-mono text-red-400">
                        PAUSED · {selectedSong.modVersionOrigin}
                      </p>
                      <h2 className="text-2xl font-extrabold text-white mt-1">
                        {selectedSong.title}
                      </h2>
                    </div>

                    <div className="space-y-2.5">
                      <button
                        onClick={() => setGameState('PLAYING')}
                        className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
                      >
                        Resume Song
                      </button>
                      <button
                        onClick={() => {
                          setRunKey((k) => k + 1);
                          setGameState('PLAYING');
                        }}
                        className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
                      >
                        Restart Track
                      </button>
                      <button
                        onClick={() => setIsKeybindsOpen(true)}
                        className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
                      >
                        Change Keybinds & Scroll Settings
                      </button>
                      <button
                        onClick={() => setGameState('TITLE_MENU')}
                        className="w-full py-2.5 px-4 rounded-lg bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                      >
                        Exit to Freeplay Vault
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Round Summary / Victory or Game Over Modal */}
        {(gameState === 'ROUND_SUMMARY' || gameState === 'GAME_OVER') &&
          lastRunStats && (
            <div className="max-w-2xl mx-auto my-8 p-8 rounded-xl bg-[#12101B] border border-white/15 shadow-2xl space-y-6">
              <div className="flex items-start justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-mono text-slate-400">
                    {gameState === 'GAME_OVER'
                      ? selectedSong.id.includes('endless')
                        ? 'FUN IS INFINITE WITH SEGA ENTERPRISES'
                        : 'YOU WERE TOO SLOW · HEALTH DEPLETED'
                      : 'TRACK CLEARED · STAGE COMPLETE'}
                  </p>
                  <h2 className="text-3xl font-extrabold text-white mt-1">
                    {selectedSong.title}
                  </h2>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">ACCURACY</div>
                  <div
                    className={`text-2xl font-extrabold ${
                      gameState === 'GAME_OVER'
                        ? 'text-red-500'
                        : 'text-emerald-400'
                    }`}
                  >
                    {(() => {
                      const totalJudged =
                        lastRunStats.sicks +
                        lastRunStats.goods +
                        lastRunStats.bads +
                        lastRunStats.shits +
                        lastRunStats.misses;
                      const acc =
                        totalJudged > 0 ? calculateAccuracy(lastRunStats) : 0;
                      const grade = calculateGrade(acc, lastRunStats.misses);
                      return totalJudged === 0
                        ? '?'
                        : `${acc.toFixed(2)}% (${grade})`;
                    })()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono tabular-nums">
                <div className="p-4 rounded-lg bg-[#09080D] border border-white/5">
                  <div className="text-xs text-slate-400">FINAL SCORE</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {lastRunStats.score.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#09080D] border border-white/5">
                  <div className="text-xs text-slate-400">MAX COMBO</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">
                    {lastRunStats.maxCombo}x
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 p-4 rounded-lg bg-[#09080D] border border-white/5">
                  <div className="text-xs text-slate-400">OVERALL RATING</div>
                  <div className="text-base font-bold text-amber-300 mt-1.5 truncate">
                    {formatPsychRating(lastRunStats)}
                  </div>
                </div>
              </div>

              {/* Total Judgement Breakdown: Sicks, Goods, Bads, Shits, and Misses */}
              {(() => {
                const totalJudged =
                  lastRunStats.sicks +
                  lastRunStats.goods +
                  lastRunStats.bads +
                  lastRunStats.shits +
                  lastRunStats.misses;
                const breakdownRows = [
                  {
                    label: 'SICKS',
                    sub: '+350 pts · 100%',
                    count: lastRunStats.sicks,
                    textColor: 'text-cyan-400',
                    barColor: 'bg-cyan-400',
                    borderColor: 'border-cyan-500/30',
                  },
                  {
                    label: 'GOODS',
                    sub: '+200 pts · 75%',
                    count: lastRunStats.goods,
                    textColor: 'text-emerald-400',
                    barColor: 'bg-emerald-400',
                    borderColor: 'border-emerald-500/30',
                  },
                  {
                    label: 'BADS',
                    sub: '+50 pts · 50%',
                    count: lastRunStats.bads,
                    textColor: 'text-amber-400',
                    barColor: 'bg-amber-400',
                    borderColor: 'border-amber-500/30',
                  },
                  {
                    label: 'SHITS',
                    sub: '-50 pts · 25%',
                    count: lastRunStats.shits,
                    textColor: 'text-orange-400',
                    barColor: 'bg-orange-400',
                    borderColor: 'border-orange-500/30',
                  },
                  {
                    label: 'MISSES',
                    sub: '-100 pts · 0%',
                    count: lastRunStats.misses,
                    textColor: 'text-red-400',
                    barColor: 'bg-red-500',
                    borderColor: 'border-red-500/30',
                  },
                ];

                return (
                  <div className="p-5 rounded-xl bg-[#09080D] border border-white/10 space-y-4 font-mono tabular-nums">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <span className="text-xs font-bold text-slate-200 tracking-wide">
                        TOTAL JUDGEMENT BREAKDOWN
                      </span>
                      <span className="text-xs text-slate-400">
                        {lastRunStats.totalNotesHit} / {totalJudged} Notes Hit
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {breakdownRows.map((row) => {
                        const pct =
                          totalJudged > 0
                            ? Math.round((row.count / totalJudged) * 100)
                            : 0;
                        return (
                          <div
                            key={row.label}
                            className={`p-3 rounded-lg bg-[#12101B] border ${row.borderColor} flex flex-col justify-between space-y-2`}
                          >
                            <div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className={`font-bold ${row.textColor}`}>
                                  {row.label}
                                </span>
                                <span className="text-slate-500">{pct}%</span>
                              </div>
                              <div className="text-2xl font-extrabold text-white mt-1">
                                {row.count}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {row.sub}
                              </div>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                              <div
                                className={`h-full ${row.barColor}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {(lastRunStats.usedBotplay ||
                lastRunStats.usedPracticeMode ||
                lastRunStats.usedEasyMode ||
                settings.botplay ||
                settings.practiceMode ||
                settings.easyMode) && (
                <div className="px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300">
                  UNRANKED RUN ·{' '}
                  {lastRunStats.usedEasyMode || settings.easyMode
                    ? 'Easy Mode was active. Special note penalties were removed — record not saved to the menu screen.'
                    : lastRunStats.usedBotplay && lastRunStats.usedPracticeMode
                      ? 'Botplay & Practice Mode were used during this song. Record not saved to the menu screen.'
                      : lastRunStats.usedBotplay || settings.botplay
                        ? 'Botplay was used during this song. Record not saved to the menu screen.'
                        : 'Practice Mode was used during this song. Record not saved to the menu screen.'}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setGameState('TITLE_MENU')}
                  className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors whitespace-nowrap"
                >
                  Back to Freeplay Vault
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsKeybindsOpen(true)}
                    className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Adjust Keybinds
                  </button>
                  <button
                    onClick={() => startSong(selectedSong.id)}
                    className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            </div>
          )}
      </main>

      {/* Individual Song Record Deletion "Are you sure?" Confirmation Modal */}
      {pendingDeleteSongId &&
        (() => {
          const targetSong = SONGS.find((s) => s.id === pendingDeleteSongId);
          const targetRecord = highScores[pendingDeleteSongId];
          if (!targetSong || !targetRecord) return null;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setPendingDeleteSongId(null)}
            >
              <div
                className="w-full max-w-md p-6 rounded-xl bg-[#12101B] border border-red-500/40 shadow-2xl space-y-5 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto w-11 h-11 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>

                <div>
                  <p className="text-xs font-mono text-red-400 tracking-wider">
                    ERASE SONG RECORD
                  </p>
                  <h2 className="text-2xl font-extrabold text-white mt-1">
                    Are you sure?
                  </h2>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    This will permanently erase your saved high score and accuracy
                    record for{' '}
                    <span className="font-bold text-white">
                      {targetSong.title}
                    </span>
                    .
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#09080D] border border-white/10 font-mono text-xs flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-slate-400 text-[10px]">TRACK</div>
                    <div className="text-white font-bold mt-0.5">
                      {targetSong.title}
                    </div>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="text-emerald-400 font-bold">
                      {targetRecord.accuracy}% (
                      {calculateGrade(targetRecord.accuracy)})
                    </div>
                    <div className="text-slate-400">
                      {targetRecord.score.toLocaleString()} pts
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => {
                      soundEngine.playMenuTick(false);
                      setPendingDeleteSongId(null);
                    }}
                    className="py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEraseSongRecord(pendingDeleteSongId)}
                    className="py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Yes, Erase Data
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Device Selection Setup Modal */}
      {!settings.deviceChosen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0F0D18] border-2 border-red-600/80 rounded-2xl shadow-[0_0_60px_rgba(220,38,38,0.45)] overflow-hidden text-center p-6 space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-600/40 text-red-400 text-xs font-mono font-extrabold uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5 text-red-400" /> Controls & Layout Setup
              </div>
              <h2 className="text-2xl font-black text-white tracking-wide uppercase font-mono">
                SELECT YOUR DEVICE TYPE
              </h2>
              <p className="text-xs font-mono text-red-400 font-bold bg-red-950/50 p-3 rounded-lg border border-red-900/60 shadow-inner">
                ⚠️ Answer honestly, because it will affect gameplay drastically.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {/* Option 1: Mobile Touch */}
              <button
                onClick={() => {
                  soundEngine.playMenuTick(true);
                  setSettings((prev) => ({
                    ...prev,
                    isMobileMode: true,
                    downscroll: true,
                    deviceChosen: true,
                  }));
                }}
                className="group relative p-4 rounded-xl bg-gradient-to-b from-[#1C1A2E] to-[#121020] border-2 border-slate-700/60 hover:border-red-500 hover:bg-[#25223A] transition-all duration-200 text-left space-y-2 shadow-md hover:shadow-red-900/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📱</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-600/40">
                    TOUCH
                  </span>
                </div>
                <div className="font-bold text-white text-sm group-hover:text-red-400 transition-colors">
                  Mobile / Tablet
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Top health bar, top-left OSD timer & score, and large bottom touch-arrow controls matching mobile layout.
                </p>
              </button>

              {/* Option 2: Desktop / PC */}
              <button
                onClick={() => {
                  soundEngine.playMenuTick(true);
                  setSettings((prev) => ({
                    ...prev,
                    isMobileMode: false,
                    deviceChosen: true,
                  }));
                }}
                className="group relative p-4 rounded-xl bg-gradient-to-b from-[#1C1A2E] to-[#121020] border-2 border-slate-700/60 hover:border-red-500 hover:bg-[#25223A] transition-all duration-200 text-left space-y-2 shadow-md hover:shadow-red-900/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💻</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-600/40">
                    KEYBOARD
                  </span>
                </div>
                <div className="font-bold text-white text-sm group-hover:text-red-400 transition-colors">
                  PC / Laptop
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Standard Friday Night Funkin' strumlines with customizable keybinds (WASD / DFJK / Arrows).
                </p>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-mono">
              You can change this setting anytime from the Settings menu.
            </p>
          </div>
        </div>
      )}

      {/* Keybinds & Psych Engine Settings Modal */}
      <KeybindsModal
        isOpen={isKeybindsOpen}
        onClose={() => setIsKeybindsOpen(false)}
        keybinds={keybinds}
        onChangeKeybinds={setKeybinds}
        settings={settings}
        onChangeSettings={setSettings}
        onOpenMobileCustomizer={() => {
          setIsKeybindsOpen(false);
          setIsMobileCustomizerOpen(true);
        }}
      />

      {/* Mobile Note Horizontal Placement Customizer Modal */}
      <MobileControlsModal
        isOpen={isMobileCustomizerOpen}
        onClose={() => setIsMobileCustomizerOpen(false)}
        settings={settings}
        onChangeSettings={setSettings}
      />
    </div>
  );
}
